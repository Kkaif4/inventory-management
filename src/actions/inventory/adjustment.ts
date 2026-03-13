"use server";

import { prisma } from "@/lib/prisma";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { StockService } from "@/domains/inventory/stock-service";
import { NumberingService } from "@/domains/foundation/numbering-service";
import { revalidatePath } from "next/cache";

const APPROVAL_THRESHOLD = 50;

export async function createStockAdjustment(
  outletId: string,
  userId: string,
  data: {
    locationId: string;
    reason: string;
    items: {
      variantId: string;
      quantity: number;
      type: "ADDITION" | "DEDUCTION";
    }[];
  },
) {
  await validateSessionOutletAccess(outletId);

  // Check user role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  // If any item exceeds threshold, the whole txn needs approval
  const needsApproval =
    data.items.some((item) => Math.abs(item.quantity) > APPROVAL_THRESHOLD) &&
    user?.role !== "ADMIN";

  return await prisma.$transaction(async (tx) => {
    const txnNumber = await NumberingService.getNextNumber(
      tx,
      outletId,
      "STOCK_ADJUSTMENT",
    );

    const transaction = await tx.transaction.create({
      data: {
        type: "STOCK_ADJUSTMENT",
        txnNumber,
        outletId,
        fromLocationId: data.locationId,
        userId,
        status: needsApproval ? "PENDING_APPROVAL" : "COMPLETED",
        grandTotal: 0,
        remarks: data.reason,
      },
    });

    for (const item of data.items) {
      const adjQty =
        item.type === "DEDUCTION"
          ? -Math.abs(item.quantity)
          : Math.abs(item.quantity);

      await tx.transactionItem.create({
        data: {
          transactionId: transaction.id,
          variantId: item.variantId,
          quantity: adjQty,
          rate: 0,
          taxableValue: 0,
        },
      });

      if (!needsApproval) {
        await StockService.moveStock(tx, {
          outletId,
          warehouseId: data.locationId,
          variantId: item.variantId,
          quantity: adjQty,
          type: adjQty > 0 ? "ADJUSTMENT_INC" : "ADJUSTMENT_DEC",
          transactionId: transaction.id,
          userId,
        });
      }
    }

    revalidatePath("/dashboard/inventory");
    return transaction;
  });
}

export async function createAdjustment(
  outletId: string,
  userId: string,
  data: {
    warehouseId: string;
    variantId: string;
    quantity: number;
    reason: string;
  },
) {
  return createStockAdjustment(outletId, userId, {
    locationId: data.warehouseId,
    reason: data.reason,
    items: [
      {
        variantId: data.variantId,
        quantity: Math.abs(data.quantity),
        type: data.quantity >= 0 ? "ADDITION" : "DEDUCTION",
      },
    ],
  });
}

export async function approveAdjustment(
  outletId: string,
  adminId: string,
  transactionId: string,
) {
  await validateSessionOutletAccess(outletId);

  return await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({
      where: { id: transactionId, outletId },
      include: { items: true },
    });

    if (!transaction || transaction.status !== "PENDING_APPROVAL") {
      throw new Error("Invalid adjustment for approval.");
    }

    // Apply the adjustment
    for (const item of transaction.items) {
      await StockService.moveStock(tx, {
        outletId,
        warehouseId: transaction.fromLocationId!,
        variantId: item.variantId,
        quantity: item.quantity,
        type: item.quantity > 0 ? "ADJUSTMENT_INC" : "ADJUSTMENT_DEC",
        transactionId: transaction.id,
        userId: adminId,
      });
    }

    const updatedTx = await tx.transaction.update({
      where: { id: transactionId },
      data: { status: "COMPLETED" },
      select: { id: true },
    });

    revalidatePath("/dashboard/inventory");
    return updatedTx;
  });
}

