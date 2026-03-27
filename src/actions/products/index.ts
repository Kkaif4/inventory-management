"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/domains/audit/audit-service";
import { withErrorHandler } from "@/lib/error-handler";
import { ValidationError, NotFoundError } from "@/lib/exceptions";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/exceptions";

import { ProductFilter, VariantPayload } from "./types";

export async function getProducts(
  outletId: string,
  filters: ProductFilter = {},
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);
    const { search, categoryId, brand, limit } = filters;

    const andClauses: any[] = [{ outletId }, { isArchived: false }];

    if (search) {
      andClauses.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { brand: { contains: search, mode: "insensitive" } },
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
      andClauses.push({ categoryId });
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
      ...(limit ? { take: limit } : {}),
    });
  });
}

export async function createProduct(data: {
  name: string;
  brand?: string | null;
  hsnCode?: string | null;
  gstRate: number;
  baseUnit: string;
  purchaseUnit?: string | null;
  conversionRatio?: number;
  categoryId: string;
  outletId: string;
  variants: VariantPayload[];
  userId: string;
}) {
  return withErrorHandler(async () => {
    const { variants, userId, outletId, ...productData } = data;
    await validateSessionOutletAccess(outletId);

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
        throw new ValidationError(
          `A product with name "${data.name}" already exists but is currently archived. Please restore it from settings or use a different name.`,
        );
      }
      throw new ValidationError(
        `A product with name "${data.name}" already exists in this outlet.`,
      );
    }

    // Pre-validate SKU uniqueness
    const skus = variants.map((v) => v.sku);
    const existingVariants = await prisma.variant.findMany({
      where: { sku: { in: skus } },
      select: { sku: true },
    });

    if (existingVariants.length > 0) {
      const duplicateSkus = existingVariants.map((v) => v.sku).join(", ");
      throw new ValidationError(
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
  });
}

export async function getProductWithVariants(productId: string) {
  return withErrorHandler(async () => {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        variants: {
          orderBy: { sku: "asc" },
        },
      },
    });
    if (!product) throw new NotFoundError("Product not found");
    return product;
  });
}

export async function getAllVariants() {
  return withErrorHandler(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new UnauthorizedError();

    return await prisma.variant.findMany({
      include: {
        product: {
          select: { name: true, baseUnit: true },
        },
      },
      orderBy: [{ product: { name: "asc" } }, { sku: "asc" }],
    });
  });
}

export async function updateProduct(
  id: string,
  data: {
    name: string;
    brand?: string | null;
    hsnCode?: string | null;
    gstRate: number;
    baseUnit: string;
    purchaseUnit?: string | null;
    conversionRatio?: number;
    categoryId: string;
    userId: string;
    isArchived?: boolean;
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
  return withErrorHandler(async () => {
    const { userId, variants, ...productData } = data;
    const existing = await prisma.product.findUnique({ where: { id }, select: { outletId: true } });
    if (existing?.outletId) await validateSessionOutletAccess(existing.outletId);

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
  });
}

export async function deleteProduct(productId: string, userId: string) {
  return withErrorHandler(async () => {
    const productForAuth = await prisma.product.findUnique({ where: { id: productId }, select: { outletId: true } });
    if (productForAuth?.outletId) await validateSessionOutletAccess(productForAuth.outletId);

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
      throw new ValidationError(
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
      return { archived: true, id: productId };
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
    return { deleted: true, id: productId };
  });
}

export async function getNextSkuNumber(prefix: string, outletId: string) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);
    const existing = await prisma.variant.findMany({
      where: {
        sku: { startsWith: prefix + "-" },
        product: { outletId },
      },
      select: { sku: true },
    });
    if (existing.length === 0) return "001";
    const nums = existing.map((v) => {
      const parts = v.sku.split("-");
      return parseInt(parts[parts.length - 1]) || 0;
    });
    return String(Math.max(...nums) + 1).padStart(3, "0");
  });
}
