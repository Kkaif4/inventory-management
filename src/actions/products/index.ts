"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/domains/audit/audit-service";

export async function getProducts() {
  return await prisma.product.findMany({
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

export type VariantPayload = {
  sku: string;
  purchasePrice: number;
  sellingPrice: number;
  pricingMethod: "MANUAL" | "MARKUP";
  markupPercent?: number;
  minStockLevel: number;
  specifications: any;
  categoryId: string; // New field for variant classification
};

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

  const product = await prisma.product.create({
    data: {
      ...productData,
      outletId,
      variants: {
        create: variants.map((v) => ({
          sku: v.sku,
          categoryId: v.categoryId, // Storing variant-specific category
          purchasePrice: v.purchasePrice,
          sellingPrice:
            v.pricingMethod === "MARKUP" && v.markupPercent
              ? v.purchasePrice * (1 + v.markupPercent / 100)
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
