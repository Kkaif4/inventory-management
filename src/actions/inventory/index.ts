"use server";

import { prisma } from "@/lib/prisma";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { withErrorHandler } from "@/lib/error-handler";

import { InventoryFilter, StockStatus } from "./types";
// DO NOT export types from "use server" files.
// Clients should import types from ./types directly.

export async function getInventoryData(
  outletId: string,
  filters: InventoryFilter,
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    const { warehouseId, status, search, categoryId, brand } = filters;

    // 1. Build where clause
    const andClauses: any[] = [
      { outletId },
      { product: { isArchived: false } },
    ];

    if (search) {
      andClauses.push({
        OR: [
          { sku: { contains: search, mode: "insensitive" } },
          { product: { name: { contains: search, mode: "insensitive" } } },
        ],
      });
    }

    if (categoryId) {
      andClauses.push({ categoryId });
    }

    if (brand && brand.length > 0) {
      andClauses.push({
        product: {
          brand: { in: brand },
        },
      });
    }

    const where = { AND: andClauses };

    // 2. Fetch variants with stock and product info
    const variants = await prisma.variant.findMany({
      where,
      include: {
        product: true,
        category: {
          select: {
            name: true,
          },
        },
        stocks: {
          where: warehouseId ? { warehouseId } : {},
        },
      },
      orderBy: {
        product: {
          name: "asc",
        },
      },
    });

    // 3. Process and filter by status
    const inventory = variants.map((v: any) => {
      // Total qty at the specific warehouse or across all warehouses if no warehouse specified
      const qtyOnHand = v.stocks.reduce(
        (acc: number, s: any) => acc + (s.quantity || 0),
        0,
      );
      const inTransit = v.stocks.reduce(
        (acc: number, s: any) => acc + (s.inTransitQty || 0),
        0,
      );

      let currentStatus: StockStatus = "IN_STOCK";
      if (qtyOnHand <= 0) currentStatus = "OUT_OF_STOCK";
      else if (qtyOnHand <= v.minStockLevel) currentStatus = "LOW_STOCK";

      return {
        id: v.id,
        sku: v.sku,
        productName: v.product.name,
        brand: v.product.brand,
        categoryName: v.category?.name || "N/A",
        specifications:
          typeof v.specifications === "string"
            ? v.specifications
            : v.specifications
              ? JSON.stringify(v.specifications)
              : "",
        unit: v.product.baseUnit,
        qtyOnHand,
        inTransit,
        minStockLevel: v.minStockLevel,
        status: currentStatus,
        // Placeholder for batch info if needed later
        batchCount: 0,
      };
    });

    // Apply status filter in code since status is derived
    if (status && status !== "ALL") {
      return inventory.filter((item: any) => item.status === status);
    }

    return inventory;
  });
}

export async function getInventoryMasterData(outletId: string) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    const warehouses = await prisma.warehouse.findMany({
      where: {
        outlets: {
          some: { id: outletId },
        },
      },
    });

    const categories = await prisma.category.findMany({
      where: { outletId },
    });

    const brands = await prisma.product.findMany({
      where: { outletId },
      select: { brand: true },
      distinct: ["brand"],
    });

    return {
      warehouses,
      categories,
      brands: brands.map((b: any) => b.brand).filter(Boolean) as string[],
    };
  });
}

export async function getInventoryLocations(outletId: string) {
  return withErrorHandler(async () => {
    const masterResponse = await getInventoryMasterData(outletId);
    if (!masterResponse.success) {
      throw new Error(
        masterResponse.error?.message || "Failed to load master data",
      );
    }
    const masterData = masterResponse.data!;

    const outlets = await prisma.outlet.findMany({
      where: {
        id: { not: outletId },
      },
      select: {
        id: true,
        name: true,
        negativeStockPolicy: true,
        warehouses: {
          select: { id: true },
        },
      },
    });

    return {
      ...masterData,
      outlets,
    };
  });
}

export async function getCurrentStock(outletId: string) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    return await prisma.stock.findMany({
      where: { outletId },
      include: {
        variant: {
          select: {
            id: true,
            sku: true,
            product: {
              select: {
                name: true,
                brand: true,
                baseUnit: true,
                purchaseUnit: true,
                conversionRatio: true,
              },
            },
          },
        },
      },
    });
  });
}

export async function getVariantsForSelection(outletId: string) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    return await prisma.variant.findMany({
      where: {
        outletId,
        product: {
          isArchived: false,
        },
      },
      include: {
        product: {
          select: {
            name: true,
            brand: true,
            baseUnit: true,
            purchaseUnit: true,
            conversionRatio: true,
          },
        },
      },
      orderBy: {
        product: {
          name: "asc",
        },
      },
    });
  });
}

import * as adjustment from "./adjustment";
import * as transfer from "./transfer";

export async function createStockAdjustment(
  outletId: string,
  userId: string,
  data: any,
) {
  return adjustment.createStockAdjustment(outletId, userId, data);
}

export async function createAdjustment(
  outletId: string,
  userId: string,
  data: any,
) {
  return adjustment.createAdjustment(outletId, userId, data);
}

export async function approveAdjustment(
  outletId: string,
  adminId: string,
  transactionId: string,
) {
  return adjustment.approveAdjustment(outletId, adminId, transactionId);
}

export async function createStockTransfer(
  outletId: string,
  userId: string,
  data: any,
) {
  return transfer.createStockTransfer(outletId, userId, data);
}

export async function createTransfer(
  outletId: string,
  userId: string,
  data: any,
) {
  return transfer.createTransfer(outletId, userId, data);
}

export async function receiveTransfer(
  outletId: string,
  userId: string,
  transactionId: string,
) {
  return transfer.receiveTransfer(outletId, userId, transactionId);
}

export async function getPendingTransfers(outletId: string) {
  return transfer.getPendingTransfers(outletId);
}
