import { Prisma } from "@/generated/prisma";

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
      select: { batchTrackingEnabled: true, negativeStockPolicy: true },
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
    await tx.stockLedger.create({
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
    if (outlet.batchTrackingEnabled) {
      if (quantity > 0) {
        // INCOMING: Create new batch
        await tx.customBatch.create({
          data: {
            batchNumber: `B-${Date.now()}-${variantId.slice(-4)}`,
            variantId,
            warehouseId: warehouseId as string,
            outletId,
            quantityReceived: quantity,
            costPerUnit: costPerUnit || 0,
          },
        });
      } else if (quantity < 0) {
        // OUTGOING: Consume batches using FIFO
        let toConsume = Math.abs(quantity);

        // Find active batches (Received Date ASC)
        const batches = await tx.customBatch.findMany({
          where: {
            variantId,
            warehouseId: warehouseId as string,
            outletId,
          },
          orderBy: { receivedDate: "asc" },
        });

        // Manual filter for remaining qty since we can't do column comparison easily in standard findMany where
        const activeBatches = batches.filter(
          (b) => b.quantityConsumed < b.quantityReceived,
        );

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

            toConsume -= consumeFromThis;
          }

          if (toConsume <= 0) break;
        }

        if (toConsume > 0 && !effectiveAllowNegative) {
          throw new Error(
            `Insufficient batch stock for FIFO consumption. Missing: ${toConsume}`,
          );
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
};
