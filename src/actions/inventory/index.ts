"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { StockService, LocationType } from "@/domains/inventory/stock-service";
import { AuditService } from "@/domains/audit/audit-service";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";

export async function getCurrentStock(outletId: string) {
  // Validate user has access to this outlet
  await validateSessionOutletAccess(outletId);

  // Fetch warehouses for this outlet
  const outlet = await prisma.outlet.findUnique({
    where: { id: outletId },
    include: { warehouses: true },
  });

  const warehouseIds = outlet?.warehouses.map((w) => w.id) || [];

  return await prisma.stock.findMany({
    where: {
      OR: [{ outletId: outletId }, { warehouseId: { in: warehouseIds } }],
    },
    include: {
      variant: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
      warehouse: true,
      outlet: true,
    },
    orderBy: {
      variant: {
        product: {
          name: "asc",
        },
      },
    },
  });
}

// Action to fetch locations (Warehouses and Outlets) for transfer/adjustment dropdowns
export async function getInventoryLocations(outletId: string) {
  // Validate user has access to this outlet
  await validateSessionOutletAccess(outletId);

  const warehouses = await prisma.warehouse.findMany({
    where: { outlets: { some: { id: outletId } } }, // Filter by outlet relation
    orderBy: { name: "asc" },
  });
  const outlets = await prisma.outlet.findMany({
    where: { id: outletId }, // Filter for current outlet only
    include: { warehouses: true },
    orderBy: { name: "asc" },
  });

  return { warehouses, outlets };
}

export async function getVariantsForSelection(outletId: string) {
  // Validate user has access to this outlet
  await validateSessionOutletAccess(outletId);

  return await prisma.variant.findMany({
    where: { product: { outletId } }, // Filter by outlet
    include: {
      product: true,
    },
    orderBy: {
      product: {
        name: "asc",
      },
    },
  });
}

export async function createStockAdjustment(data: {
  outletId: string; // Scoping
  userId: string;
  locationId: string;
  locationType: LocationType;
  reason: string;
  items: {
    variantId: string;
    quantity: number;
    type: "ADDITION" | "DEDUCTION";
  }[];
}) {
  // Validate user has access to this outlet
  await validateSessionOutletAccess(data.outletId);
  return await prisma.$transaction(async (tx) => {
    // 1. Create a transaction record for audit/history
    const txn = await tx.transaction.create({
      data: {
        type: "STOCK_ADJUSTMENT",
        txnNumber: `ADJ-${Date.now()}`,
        date: new Date(),
        status: "POSTED",
        outletId: data.outletId,
        userId: data.userId,
        toLocationId:
          data.locationType === "WAREHOUSE" ? data.locationId : undefined,
      },
    });

    // 2. Process each item
    for (const item of data.items) {
      const quantityChange =
        item.type === "ADDITION" ? item.quantity : -item.quantity;

      // Update the stock record
      await StockService.updateStock(tx, {
        variantId: item.variantId,
        locationId: data.locationId,
        locationType: data.locationType,
        quantityChange,
      });

      // Log audit for each item
      await AuditService.log({
        action: "POST",
        entity: "STOCK_ADJUSTMENT",
        entityId: txn.id,
        userId: data.userId,
        newValues: {
          variantId: item.variantId,
          change: quantityChange,
          type: item.type,
          reason: data.reason,
        },
      });
    }

    revalidatePath("/dashboard/inventory/current-stock");
    return txn;
  });
}

export async function createStockTransfer(data: {
  outletId: string; // Scoping
  userId: string;
  variantId: string;
  fromLocationId: string;
  fromLocationType: LocationType;
  toLocationId: string;
  toLocationType: LocationType;
  quantity: number;
}) {
  // Validate user has access to this outlet
  await validateSessionOutletAccess(data.outletId);
  return await prisma.$transaction(async (tx) => {
    // 1. Deduct from source
    await StockService.updateStock(tx, {
      variantId: data.variantId,
      locationId: data.fromLocationId,
      locationType: data.fromLocationType,
      quantityChange: -data.quantity,
    });

    // 2. Add to destination
    await StockService.updateStock(tx, {
      variantId: data.variantId,
      locationId: data.toLocationId,
      locationType: data.toLocationType,
      quantityChange: data.quantity,
    });

    // 3. Create transfer record
    const txn = await tx.transaction.create({
      data: {
        type: "STOCK_TRANSFER",
        txnNumber: `TRF-${Date.now()}`,
        date: new Date(),
        status: "POSTED",
        outletId: data.outletId,
        userId: data.userId,
        fromLocationId: data.fromLocationId,
        toLocationId: data.toLocationId,
      },
    });

    await AuditService.log({
      action: "POST",
      entity: "STOCK_TRANSFER",
      entityId: txn.id,
      userId: data.userId,
      newValues: {
        variantId: data.variantId,
        qty: data.quantity,
        from: data.fromLocationId,
        to: data.toLocationId,
      },
    });

    revalidatePath("/dashboard/inventory/current-stock");
    return txn;
  });
}
