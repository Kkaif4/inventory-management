"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { StockService, LocationType } from "@/domains/inventory/stock-service";
import { AuditService } from "@/domains/audit/audit-service";

export async function getCurrentStock() {
  return await prisma.stock.findMany({
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
export async function getInventoryLocations() {
  const warehouses = await prisma.warehouse.findMany({
    orderBy: { name: "asc" },
  });
  const outlets = await prisma.outlet.findMany({ orderBy: { name: "asc" } });

  return { warehouses, outlets };
}

export async function getVariantsForSelection() {
  return await prisma.variant.findMany({
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
  variantId: string;
  locationId: string;
  locationType: LocationType;
  quantity: number;
  type: "ADDITION" | "DEDUCTION";
  reason: string;
}) {
  const quantityChange =
    data.type === "ADDITION" ? data.quantity : -data.quantity;

  return await prisma.$transaction(async (tx) => {
    // 1. Update the stock record
    await StockService.updateStock(tx, {
      variantId: data.variantId,
      locationId: data.locationId,
      locationType: data.locationType,
      quantityChange,
    });

    // 2. Create a transaction record for audit/history
    const txn = await tx.transaction.create({
      data: {
        type: "STOCK_ADJUSTMENT",
        txnNumber: `ADJ-${Date.now()}`, // Temporary naming strategy
        date: new Date(),
        status: "POSTED",
        toLocationId:
          data.locationType === "WAREHOUSE" ? data.locationId : undefined,
        // We can store the reason in a notes field if we add one, or using JSON.
        // For now, let's just complete the stock update.
      },
    });

    await AuditService.log({
      action: "POST",
      entity: "STOCK_ADJUSTMENT",
      entityId: txn.id,
      newValues: {
        variantId: data.variantId,
        change: quantityChange,
        type: data.type,
      },
    });

    revalidatePath("/dashboard/inventory/current-stock");
    return txn;
  });
}

export async function createStockTransfer(data: {
  variantId: string;
  fromLocationId: string;
  fromLocationType: LocationType;
  toLocationId: string;
  toLocationType: LocationType;
  quantity: number;
}) {
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
        fromLocationId: data.fromLocationId,
        toLocationId: data.toLocationId,
      },
    });

    await AuditService.log({
      action: "POST",
      entity: "STOCK_TRANSFER",
      entityId: txn.id,
      newValues: {
        variantId: data.variantId,
        qty: data.quantity,
        from: data.fromLocationId,
        to: data.toLocationId,
      },
    });

    return txn;
  });

  revalidatePath("/dashboard/inventory/current-stock");
}
