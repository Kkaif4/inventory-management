import { Prisma } from "@/generated/prisma";
import { roundToTwo } from "@/lib/utils";

export type StockMovementType =
  | "PURCHASE"
  | "SALE"
  | "TRANSFER_OUT"
  | "TRANSFER_IN"
  | "ADJUSTMENT_INC"
  | "ADJUSTMENT_DEC";

export type StockMoveInput = {
  variantId: string;
  warehouseId: string | null;
  outletId: string;
  transactionId: string;
  quantity: number; // Positive for increase, Negative for decrease
  type: StockMovementType;
  userId: string;
  allowNegative?: boolean;
  costPerUnit?: number; // Optional, used for Purchases to create batches
  batchNumber?: string;
  batchDate?: Date;
};

export type FIFOAllocationResult = {
  weightedAvgCost: number; // Weighted average cost per unit
  totalCost: number; // Total FIFO cost for all units
  totalQty: number; // Total quantity allocated
  shortfall: number; // 0 if fully fulfilled; >0 means insufficient stock
  batchesUsed: Array<{
    batchId: string;
    batchNumber: string;
    quantity: number; // Units consumed from this batch
    costPerUnit: number;
  }>;
};

export const StockService = {
  /**
   * Central atomic function to move stock.
   * Handles Stock balance, StockLedger, and FIFO Batches.
   */
  async moveStock(tx: Prisma.TransactionClient, input: StockMoveInput) {
    const {
      variantId,
      warehouseId,
      outletId,
      transactionId,
      quantity,
      type,
      userId,
      allowNegative,
      costPerUnit,
    } = input;

    // 1. Get outlet settings for batch tracking and policies
    const outlet = await tx.outlet.findUnique({
      where: { id: outletId },
      select: { batchTrackingEnabled: true, negativeStockPolicy: true, inventoryValuationMethod: true },
    });

    if (!outlet) throw new Error("Outlet not found");

    // 2. Update/Create Stock record
    const stock = await tx.stock.upsert({
      where: {
        variantId_warehouseId_outletId: {
          variantId,
          warehouseId: warehouseId as any,
          outletId: outletId as any,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        variantId,
        warehouseId,
        outletId,
        quantity,
      },
    });

    // Validation for negative stock
    const effectiveAllowNegative =
      allowNegative || outlet.negativeStockPolicy === "ALLOW";
    if (!effectiveAllowNegative && stock.quantity < 0) {
      throw new Error(
        `Insufficient stock for variant ${variantId} at warehouse ${warehouseId}. Resulting balance: ${stock.quantity}.`,
      );
    }

    // 3. Create StockLedger entry (Source of Truth)
    const ledgerEntry = await tx.stockLedger.create({
      data: {
        variantId,
        warehouseId: warehouseId as string,
        outletId,
        transactionId,
        quantity,
        balance: stock.quantity,
        type,
        userId,
      },
    });

    // 4. FIFO Batch Logic
    const fifoEnabled = outlet.inventoryValuationMethod === "FIFO" || outlet.batchTrackingEnabled;
    if (fifoEnabled) {
      if (quantity > 0) {
        // INCOMING: Create new batch
        await tx.customBatch.create({
          data: {
            batchNumber:
              input.batchNumber || `B-${Date.now()}-${variantId.slice(-4)}`,
            variantId,
            warehouseId: warehouseId as string,
            outletId,
            receivedDate: input.batchDate || new Date(),
            quantityReceived: quantity,
            costPerUnit: costPerUnit || 0,
          },
        });
      } else if (quantity < 0) {
        // OUTGOING: Consume batches using FIFO
        let toConsume = Math.abs(quantity);
        const breakdown: Array<{ batchId: string; quantity: number; costPerUnit: number; totalCost: number }> = [];

        // Find active batches using DB-level filter (quantityConsumed < quantityReceived)
        // Ordered FIFO: oldest received date first, then creation order as tiebreaker
        const activeBatches = await tx.$queryRaw<
          Array<{
            id: string;
            batchNumber: string;
            quantityReceived: number;
            quantityConsumed: number;
            costPerUnit: number;
          }>
        >`
          SELECT id, "batchNumber", "quantityReceived", "quantityConsumed", "costPerUnit"
          FROM "CustomBatch"
          WHERE "variantId" = ${variantId}
            AND "warehouseId" = ${warehouseId as string}
            AND "outletId" = ${outletId}
            AND "quantityConsumed" < "quantityReceived"
          ORDER BY "receivedDate" ASC, "createdAt" ASC
        `;

        for (const batch of activeBatches) {
          const remainingInBatch =
            batch.quantityReceived - batch.quantityConsumed;
          const consumeFromThis = Math.min(toConsume, remainingInBatch);

          if (consumeFromThis > 0) {
            await tx.customBatch.update({
              where: { id: batch.id },
              data: {
                quantityConsumed: { increment: consumeFromThis },
              },
            });

            await tx.batchMovement.create({
              data: {
                batchId: batch.id,
                transactionId,
                quantity: -consumeFromThis,
              },
            });

            const totalCost = consumeFromThis * batch.costPerUnit;
            breakdown.push({
              batchId: batch.id,
              quantity: consumeFromThis,
              costPerUnit: batch.costPerUnit,
              totalCost,
            });

            toConsume -= consumeFromThis;
          }

          if (toConsume <= 0) break;
        }

        if (toConsume > 0 && !effectiveAllowNegative) {
          throw new Error(
            `Insufficient batch stock for FIFO consumption. Missing: ${toConsume}`,
          );
        }

        // Update ledger entry with weighted average cost for FIFO consumption
        if (breakdown.length > 0) {
          const totalCost = breakdown.reduce((sum, b) => sum + b.totalCost, 0);
          const weightedCostPerUnit = totalCost / Math.abs(quantity);
          await tx.stockLedger.update({
            where: { id: ledgerEntry.id },
            data: { costPerUnit: weightedCostPerUnit },
          });
        }
      }
    }

    return stock;
  },

  /**
   * Helper for stock transfers (Dispatch)
   */
  async dispatchTransfer(
    tx: Prisma.TransactionClient,
    input: Omit<StockMoveInput, "type">,
  ) {
    return this.moveStock(tx, { ...input, type: "TRANSFER_OUT" });
  },

  /**
   * Helper for stock transfers (Receive)
   */
  async receiveTransfer(
    tx: Prisma.TransactionClient,
    input: Omit<StockMoveInput, "type">,
  ) {
    return this.moveStock(tx, { ...input, type: "TRANSFER_IN" });
  },

  /**
   * Batch update stock for multiple variants
   */
  async batchUpdateStock(
    tx: Prisma.TransactionClient,
    input: {
      transactionId: string;
      userId: string;
      outletId: string;
      type: StockMovementType;
      items: {
        variantId: string;
        locationId: string | null;
        locationType: "WAREHOUSE" | "OUTLET";
        quantityChange: number;
        allowNegative?: boolean;
        costPerUnit?: number;
      }[];
    },
  ) {
    for (const item of input.items) {
      await this.moveStock(tx, {
        variantId: item.variantId,
        warehouseId: item.locationType === "WAREHOUSE" ? item.locationId : null,
        outletId: input.outletId,
        transactionId: input.transactionId,
        quantity: item.quantityChange,
        type: input.type,
        userId: input.userId,
        allowNegative: item.allowNegative,
        costPerUnit: item.costPerUnit,
      });
    }
  },

  /**
   * Pre-calculate FIFO batch allocation for a sale (read-only, no DB writes).
   * Returns the batch breakdown and weighted average cost.
   */
  async peekFIFOAllocation(
    tx: Prisma.TransactionClient,
    input: {
      variantId: string;
      warehouseId: string | null;
      outletId: string;
      quantity: number; // base units, positive
    },
  ): Promise<FIFOAllocationResult> {
    const activeBatches = await tx.$queryRaw<
      Array<{
        id: string;
        batchNumber: string;
        quantityReceived: number;
        quantityConsumed: number;
        costPerUnit: number;
      }>
    >`
      SELECT id, "batchNumber", "quantityReceived", "quantityConsumed", "costPerUnit"
      FROM "CustomBatch"
      WHERE "variantId" = ${input.variantId}
        AND "warehouseId" = ${input.warehouseId as string}
        AND "outletId" = ${input.outletId}
        AND "quantityConsumed" < "quantityReceived"
      ORDER BY "receivedDate" ASC, "createdAt" ASC
    `;

    let remaining = input.quantity;
    let totalCost = 0;
    const batchesUsed: FIFOAllocationResult["batchesUsed"] = [];

    for (const batch of activeBatches) {
      if (remaining <= 0) break;
      const available = batch.quantityReceived - batch.quantityConsumed;
      const consume = Math.min(remaining, available);
      batchesUsed.push({
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        quantity: consume,
        costPerUnit: batch.costPerUnit,
      });
      totalCost += consume * batch.costPerUnit;
      remaining -= consume;
    }

    const fulfilled = input.quantity - remaining;
    const weightedAvgCost = fulfilled > 0 ? totalCost / fulfilled : 0;

    return {
      weightedAvgCost: roundToTwo(weightedAvgCost),
      totalCost: roundToTwo(totalCost),
      totalQty: fulfilled,
      shortfall: roundToTwo(remaining),
      batchesUsed,
    };
  },
};
