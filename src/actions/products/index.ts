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
};

export async function createProduct(data: {
  name: string;
  brand?: string;
  hsnCode: string;
  gstRate: number;
  baseUnit: string;
  categoryId: string;
  variants: VariantPayload[];
}) {
  const { variants, ...productData } = data;

  const product = await prisma.product.create({
    data: {
      ...productData,
      variants: {
        create: variants.map((v) => ({
          sku: v.sku,
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
    entityId: product.id,
    newValues: productData,
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
