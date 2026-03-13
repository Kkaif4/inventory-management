"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/domains/audit/audit-service";

import { ProductFilter, VariantPayload } from "./types";
// DO NOT export types from "use server" files.

export async function getProducts(
  outletId: string,
  filters: ProductFilter = {},
) {
  const { search, categoryId, brand } = filters;

  const andClauses: any[] = [{ outletId }, { isArchived: false }];

  if (search) {
    andClauses.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        {
          variants: {
            some: {
              sku: { contains: search, mode: "insensitive" },
            },
          },
        },
      ],
    });
  }

  if (categoryId) {
    // Check if it's the product's primary category or its variants' category
    andClauses.push({
      OR: [{ categoryId }, { variants: { some: { categoryId } } }],
    });
  }

  if (brand) {
    andClauses.push({ brand: { contains: brand, mode: "insensitive" } });
  }

  return await prisma.product.findMany({
    where: { AND: andClauses },
    include: {
      category: true,
      variants: true,
      _count: {
        select: { variants: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function createProduct(data: {
  name: string;
  brand?: string;
  hsnCode: string;
  gstRate: number;
  baseUnit: string;
  categoryId: string; // Primary category
  parentCategoryId: string; // Mandatory per FRD
  outletId: string; // New field for outlet-scoped uniqueness
  variants: VariantPayload[];
  userId: string; // For audit logging
}) {
  const { variants, userId, outletId, ...productData } = data;

  const variantCategoryIds = Array.from(
    new Set(variants.map((v) => v.categoryId)),
  );
  const allCategoriesToVerify = Array.from(
    new Set([data.categoryId, ...variantCategoryIds]),
  );

  const categories = await prisma.category.findMany({
    where: { id: { in: allCategoriesToVerify } },
    select: { id: true, parentId: true },
  });

  for (const catId of allCategoriesToVerify) {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) throw new Error(`Category ${catId} not found`);

    const isSame = cat.id === data.parentCategoryId;
    const isChild = cat.parentId === data.parentCategoryId;

    if (!isSame && !isChild) {
      throw new Error(
        `Category ${catId} does not belong to the tree of ${data.parentCategoryId}`,
      );
    }
  }

  // Check for existing product name in this outlet (including archived)
  const existingProduct = await prisma.product.findUnique({
    where: {
      name_outletId: {
        name: data.name,
        outletId,
      },
    },
    select: { id: true, isArchived: true },
  });

  if (existingProduct) {
    if (existingProduct.isArchived) {
      throw new Error(
        `A product with name "${data.name}" already exists but is currently archived. Please restore it from settings or use a different name.`,
      );
    }
    throw new Error(
      `A product with name "${data.name}" already exists in this outlet.`,
    );
  }

  // Pre-validate SKU uniqueness within the outlet
  const skus = variants.map((v) => v.sku);
  const existingVariants = await prisma.variant.findMany({
    where: {
      outletId,
      sku: { in: skus },
    },
    select: { sku: true },
  });

  if (existingVariants.length > 0) {
    const duplicateSkus = existingVariants.map((v) => v.sku).join(", ");
    throw new Error(
      `The following SKUs already exist in this outlet: ${duplicateSkus}`,
    );
  }

  const product = await prisma.product.create({
    data: {
      ...productData,
      outletId,
      variants: {
        create: variants.map((v) => ({
          sku: v.sku,
          categoryId: v.categoryId,
          outletId, // Important: variants are now scoped to outlets
          purchasePrice: v.purchasePrice,
          sellingPrice:
            v.pricingMethod === "MARKUP" && v.markupPercent
              ? Math.round(
                  v.purchasePrice * (1 + v.markupPercent / 100) * 100,
                ) / 100
              : v.sellingPrice,
          pricingMethod: v.pricingMethod,
          markupPercent: v.markupPercent,
          minStockLevel: v.minStockLevel,
          specifications: v.specifications || {},
        })),
      },
    },
  });

  await AuditService.log({
    action: "CREATE",
    entity: "PRODUCT",
    userId: userId,
    entityId: product.id,
    newValues: { ...productData, outletId },
  });

  revalidatePath("/dashboard/master-data/products");
  return product;
}

export async function getProductWithVariants(productId: string) {
  return await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      variants: {
        orderBy: { sku: "asc" },
      },
    },
  });
}

export async function getAllVariants() {
  return await prisma.variant.findMany({
    include: {
      product: {
        select: { name: true, baseUnit: true },
      },
    },
    orderBy: [{ product: { name: "asc" } }, { sku: "asc" }],
  });
}

export async function updateProduct(
  id: string,
  data: {
    name: string;
    brand?: string | null;
    hsnCode: string;
    gstRate: number;
    baseUnit: string;
    purchaseUnit?: string | null;
    categoryId: string;
    userId: string;
    variants?: {
      id: string;
      sku: string;
      minStockLevel: number;
      purchasePrice: number;
      sellingPrice: number;
      pricingMethod: string;
      markupPercent?: number | null;
    }[];
  },
) {
  const { userId, variants, ...productData } = data;

  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.product.update({
      where: { id },
      data: { ...productData },
    });

    if (variants) {
      for (const v of variants) {
        await tx.variant.update({
          where: { id: v.id },
          data: {
            sku: v.sku,
            minStockLevel: v.minStockLevel,
            purchasePrice: v.purchasePrice,
            sellingPrice: v.sellingPrice,
            pricingMethod: v.pricingMethod,
            markupPercent: v.markupPercent,
          },
        });
      }
    }

    await AuditService.log({
      action: "UPDATE",
      entity: "PRODUCT",
      userId: userId,
      entityId: id,
      newValues: data,
    });

    return product;
  });

  revalidatePath("/dashboard/master-data/products");
  return result;
}

export async function deleteProduct(productId: string, userId: string) {
  // 1. Get all variants for this product
  const variants = await prisma.variant.findMany({
    where: { productId },
    select: { id: true, sku: true },
  });

  const variantIds = variants.map((v) => v.id);

  // 2. Check total stock across all outlets and warehouses
  const totalStock = await prisma.stock.aggregate({
    where: { variantId: { in: variantIds } },
    _sum: { quantity: true },
  });

  const stockCount = totalStock._sum.quantity || 0;

  if (stockCount > 0) {
    throw new Error(
      `Cannot delete product. Total stock remaining: ${stockCount}. Please clear inventory first.`,
    );
  }

  // 3. Check for transaction history
  const hasHistory = await prisma.transactionItem.findFirst({
    where: { variantId: { in: variantIds } },
  });

  const hasLedger = await prisma.stockLedger.findFirst({
    where: { variantId: { in: variantIds } },
  });

  // 4. Perform hybrid deletion
  if (hasHistory || hasLedger) {
    const timestamp = Date.now();
    const result = await prisma.$transaction(async (tx) => {
      // Get current data for renaming
      const current = await tx.product.findUnique({
        where: { id: productId },
        select: { name: true },
      });

      // 1. Rename Variants to free up SKUs
      for (const v of variants) {
        await tx.variant.update({
          where: { id: v.id },
          data: {
            sku: `${v.sku}__${timestamp}`,
          },
        });
      }

      // 2. Rename Product and Archive
      const archivedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          isArchived: true,
          name: `${current?.name}__${timestamp}`,
        },
      });

      await AuditService.log({
        action: "UPDATE",
        entity: "PRODUCT",
        userId,
        entityId: productId,
        newValues: {
          isArchived: true,
          name: `${current?.name}__${timestamp}`,
          sku_freed: true,
        },
      });

      return archivedProduct;
    });

    revalidatePath("/dashboard/master-data/products");
    return { success: true, archived: true };
  }

  // 5. Hard Deletion (No history)
  await prisma.$transaction(async (tx) => {
    // Delete supplier mappings
    await tx.vendorProduct.deleteMany({
      where: { variantId: { in: variantIds } },
    });

    // Delete stock records (even if quantity is 0)
    await tx.stock.deleteMany({
      where: { variantId: { in: variantIds } },
    });

    // Delete variants
    await tx.variant.deleteMany({
      where: { productId },
    });

    // Finally delete product
    await tx.product.delete({
      where: { id: productId },
    });

    await AuditService.log({
      action: "DELETE",
      entity: "PRODUCT",
      userId,
      entityId: productId,
    });
  });

  revalidatePath("/dashboard/master-data/products");
  return { success: true };
}
