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
import {
  parsePaginationParams,
  calculatePagination,
} from "@/lib/pagination";
import { BasePaginationParams } from "@/types/pagination";

import { ProductFilter, VariantPayload } from "./types";

export async function getProducts(
  outletId: string,
  filters: ProductFilter = {},
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);
    const { search, categoryId, brand, limit, partyId } = filters;

    const andClauses: any[] = [{ outletId }, { isArchived: false }];

    if (search) {
      andClauses.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { brand: { contains: search, mode: "insensitive" } },
          { hsnCode: { contains: search, mode: "insensitive" } },
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

    const products = await prisma.product.findMany({
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

    if (!partyId) return products;

    // Enrich variants with customer-specific price from their price list
    const customer = await prisma.party.findUnique({
      where: { id: partyId },
      select: { priceListId: true },
    });

    if (!customer?.priceListId) return products;

    const entries = await prisma.priceListEntry.findMany({
      where: { priceListId: customer.priceListId },
      select: { variantId: true, price: true },
    });

    const priceMap = new Map(entries.map((e) => [e.variantId, e.price]));

    return products.map((product) => ({
      ...product,
      variants: product.variants.map((v) => {
        const customerPrice = priceMap.get(v.id);
        return customerPrice !== undefined ? { ...v, customerPrice } : v;
      }),
    }));
  });
}

// ─── Get products with server-side pagination ─────────────────────────────────
export async function getProductsPaginated(
  outletId: string,
  params: BasePaginationParams & {
    search?: string;
    categoryId?: string;
    brand?: string;
  },
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    const { page, limit } = parsePaginationParams({
      page: String(params.page),
      limit: String(params.limit),
    });

    const { search, categoryId, brand } = params;

    const andClauses: any[] = [{ outletId }, { isArchived: false }];

    if (search) {
      andClauses.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { brand: { contains: search, mode: "insensitive" } },
          { hsnCode: { contains: search, mode: "insensitive" } },
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

    if (categoryId && categoryId !== "ALL") {
      andClauses.push({ categoryId });
    }

    if (brand) {
      andClauses.push({ brand: { contains: brand, mode: "insensitive" } });
    }

    const where = { AND: andClauses };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: true,
          _count: {
            select: { variants: true },
          },
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const pagination = calculatePagination(total, page, limit);

    return {
      data: products,
      pagination,
    } as any;
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
  hasSerialNumbers?: boolean;
  warrantyMonths?: number;
}) {
  return withErrorHandler(async () => {
    const { variants, userId, outletId, ...productData } = data;
    await validateSessionOutletAccess(outletId);

    // Pre-validate SKU uniqueness - only check non-empty SKUs
    const nonEmptySkus = variants
      .map((v) => v.sku)
      .filter((sku) => sku && sku.trim());

    if (nonEmptySkus.length > 0) {
      const existingVariants = await prisma.variant.findMany({
        where: { sku: { in: nonEmptySkus }, outletId },
        select: { sku: true },
      });

      if (existingVariants.length > 0) {
        const duplicateSkus = existingVariants.map((v) => v.sku).join(", ");
        throw new ValidationError(
          `The following SKUs already exist in this outlet: ${duplicateSkus}`,
        );
      }
    }

    const product = await prisma.product.create({
      data: {
        ...productData,
        hasSerialNumbers: data.hasSerialNumbers ?? false,
        warrantyMonths: data.warrantyMonths ?? 0,
        outletId,
        variants: {
          create: variants.map((v) => ({
            sku:
              v.sku ||
              `AUTO-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            outletId,
            purchasePrice: v.purchasePrice || 0,
            sellingPrice:
              v.pricingMethod === "MARKUP" && v.markupPercent
                ? Math.round(
                    (v.purchasePrice || 0) * (1 + v.markupPercent / 100) * 100,
                  ) / 100
                : v.sellingPrice || 0,
            pricingMethod: v.pricingMethod || "MANUAL",
            markupPercent: v.markupPercent,
            minStockLevel: v.minStockLevel || 0,
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
    hasSerialNumbers?: boolean;
    warrantyMonths?: number;
    variants?: {
      id: string;
      sku: string;
      minStockLevel: number;
      purchasePrice: number;
      sellingPrice: number;
      pricingMethod: "MANUAL" | "MARKUP";
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
      await prisma.$transaction(async (tx) => {
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
        await tx.product.update({
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

export async function getVariantBySerialNumber(outletId: string, serialNumber: string) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);
    const sn = await prisma.serialNumber.findFirst({
      where: {
        serialNumber: { equals: serialNumber.trim(), mode: "insensitive" },
        outletId,
        status: "AVAILABLE",
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!sn) return null;
    return {
      serialNumber: sn.serialNumber,
      variant: sn.variant,
      product: sn.variant.product,
    };
  });
}

export async function getAvailableSerialNumbers(outletId: string, variantId: string) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);
    const sns = await prisma.serialNumber.findMany({
      where: {
        outletId,
        variantId,
        status: "AVAILABLE",
      },
      select: {
        serialNumber: true,
      },
      orderBy: {
        serialNumber: "asc",
      },
    });
    return sns.map((s) => s.serialNumber);
  });
}
