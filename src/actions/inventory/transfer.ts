"use server";

import { prisma } from "@/lib/prisma";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { withErrorHandler } from "@/lib/error-handler";
import { StockService } from "@/domains/inventory/stock-service";
import { NumberingService } from "@/domains/foundation/numbering-service";
import { revalidatePath } from "next/cache";

export async function createStockTransfer(
  outletId: string,
  userId: string,
  data: {
    fromLocationId: string;
    fromLocationType: "WAREHOUSE" | "OUTLET";
    toLocationId: string;
    toLocationType: "WAREHOUSE" | "OUTLET";
    variantId: string;
    quantity: number;
  },
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    return await prisma.$transaction(async (tx) => {
      const txnNumber = await NumberingService.getNextNumber(
        tx,
        outletId,
        "STOCK_TRANSFER",
      );

      const transaction = await tx.transaction.create({
        data: {
          type: "STOCK_TRANSFER",
          txnNumber,
          outletId,
          fromLocationId: data.fromLocationId,
          toLocationId: data.toLocationId,
          userId,
          status: "SHIPPED",
          grandTotal: 0,
        },
      });

      // Determine actual warehouse IDs for stock movement
      let fromWarehouseId = data.fromLocationId;
      if (data.fromLocationType === "OUTLET") {
        const sourceOutlet = await tx.outlet.findUnique({
          where: { id: data.fromLocationId },
          select: { defaultWarehouseId: true },
        });
        if (!sourceOutlet?.defaultWarehouseId) {
          throw new Error("Source outlet has no default warehouse configured.");
        }
        fromWarehouseId = sourceOutlet.defaultWarehouseId;
      }

      let toWarehouseId = data.toLocationId;
      if (data.toLocationType === "OUTLET") {
        const targetOutlet = await tx.outlet.findUnique({
          where: { id: data.toLocationId },
          select: { defaultWarehouseId: true },
        });
        if (!targetOutlet?.defaultWarehouseId) {
          throw new Error(
            "Destination outlet has no default warehouse configured.",
          );
        }
        toWarehouseId = targetOutlet.defaultWarehouseId;
      }

      await tx.transactionItem.create({
        data: {
          transactionId: transaction.id,
          variantId: data.variantId,
          quantity: data.quantity,
          rate: 0,
          taxableValue: 0,
        },
      });

      // Move stock OUT of source
      await StockService.moveStock(tx, {
        outletId:
          data.fromLocationType === "OUTLET" ? data.fromLocationId : outletId,
        warehouseId: fromWarehouseId,
        variantId: data.variantId,
        quantity: -data.quantity,
        type: "TRANSFER_OUT",
        transactionId: transaction.id,
        userId,
      });

      revalidatePath("/dashboard/inventory");
      return transaction;
    });
  });
}

export async function createTransfer(
  outletId: string,
  userId: string,
  data: {
    fromWarehouseId: string;
    toWarehouseId: string;
    items: { variantId: string; quantity: number }[];
  },
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    return await prisma.$transaction(async (tx) => {
      const txnNumber = await NumberingService.getNextNumber(
        tx,
        outletId,
        "STOCK_TRANSFER",
      );

      const transaction = await tx.transaction.create({
        data: {
          type: "STOCK_TRANSFER",
          txnNumber,
          outletId,
          fromLocationId: data.fromWarehouseId,
          toLocationId: data.toWarehouseId,
          userId,
          status: "SHIPPED",
          grandTotal: 0,
        },
      });

      for (const item of data.items) {
        await tx.transactionItem.create({
          data: {
            transactionId: transaction.id,
            variantId: item.variantId,
            quantity: item.quantity,
            rate: 0,
            taxableValue: 0,
          },
        });

        // Move stock OUT of source
        await StockService.moveStock(tx, {
          outletId,
          warehouseId: data.fromWarehouseId,
          variantId: item.variantId,
          quantity: -item.quantity,
          type: "TRANSFER_OUT",
          transactionId: transaction.id,
          userId,
        });
      }

      revalidatePath("/dashboard/inventory");
      return transaction;
    });
  });
}

export async function receiveTransfer(
  outletId: string,
  userId: string,
  transactionId: string,
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    return await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId, outletId },
        include: { items: true },
      });

      if (!transaction || transaction.status !== "SHIPPED") {
        throw new Error("Invalid or already received transfer.");
      }

      for (const item of transaction.items) {
        // Move stock INTO target warehouse
        await StockService.moveStock(tx, {
          outletId,
          warehouseId: transaction.toLocationId!,
          variantId: item.variantId,
          quantity: item.quantity,
          type: "TRANSFER_IN",
          transactionId: transaction.id,
          userId,
        });
      }

      const updatedTx = await tx.transaction.update({
        where: { id: transactionId },
        data: { status: "RECEIVED" },
      });

      revalidatePath("/dashboard/inventory");
      return updatedTx;
    });
  });
}

export async function getPendingTransfers(outletId: string) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    const transfers = await prisma.transaction.findMany({
      where: {
        outletId,
        type: "STOCK_TRANSFER",
        status: "SHIPPED",
      },
      include: {
        fromWarehouse: { select: { name: true } },
        toWarehouse: { select: { name: true } },
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    name: true,
                    baseUnit: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return transfers;
  });
}
