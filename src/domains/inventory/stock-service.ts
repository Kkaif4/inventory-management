import { Prisma } from "@/generated/prisma";
import { roundToTwo } from "@/lib/utils";
import { calculateBatchPricing, formatBatchNumber } from "./batch-pricing";
import { allocateBatches, BatchAllocationResult } from "./batch-allocation";

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
  costPerUnit?: number; // Deprecated: use purchaseUnitRate + conversionRatio instead
  batchNumber?: string;
  batchDate?: Date;
  // New batch pricing fields (for PURCHASE/INCOMING movements)
  purchaseUnitRate?: number; // Original bill rate per purchase unit
  conversionRatio?: number; // Base units per purchase unit
  pricingMethod?: "MARKUP" | "MANUAL"; // From variant
  markupPercent?: number; // From variant, if pricingMethod = MARKUP
  variantSellingPrice?: number; // Current selling price from variant
  grnId?: string; // FK to GRN transaction
  purchaseOrderId?: string; // FK to Purchase order transaction
  purchaseBillId?: string; // FK to Purchase bill transaction
};

export type FIFOAllocationResult = {
  weightedAvgCost: number; // Weighted average cost per unit (for COGS)
  totalCost: number; // Total FIFO cost for all units
  totalQty: number; // Total quantity allocated
  shortfall: number; // 0 if fully fulfilled; >0 means insufficient stock
  oldestBatchSellingPrice: number | null; // Selling price from oldest batch (for invoice auto-fill)
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
      select: {
        batchTrackingEnabled: true,
        negativeStockPolicy: true,
        inventoryValuationMethod: true,
        batchPricingMode: true,
      },
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
        // INCOMING: Create new batch with pricing
        let costPerBaseUnit = costPerUnit || 0;
        let purchaseUnitRate = costPerUnit || 0;
        let sellingPricePerBaseUnit = costPerUnit || 0;

        // If pricing fields are provided, calculate batch pricing
        if (input.purchaseUnitRate !== undefined) {
          const { costPerBaseUnit: calcCost, sellingPricePerBaseUnit: calcPrice } =
            calculateBatchPricing(
              input.purchaseUnitRate,
              input.conversionRatio ?? 1,
              input.pricingMethod ?? "MANUAL",
              input.markupPercent ?? null,
              input.variantSellingPrice ?? null,
            );
          costPerBaseUnit = calcCost;
          purchaseUnitRate = input.purchaseUnitRate;
          sellingPricePerBaseUnit = calcPrice;
        }

        // Generate batch number using DocumentSeries for sequencing
        let batchNumber = input.batchNumber;
        if (!batchNumber) {
          // Get or create DocumentSeries for batch numbering
          const series = await tx.documentSeries.upsert({
            where: {
              type_financialYear_outletId: {
                type: "BATCH",
                financialYear: new Date().getFullYear().toString(),
                outletId,
              },
            },
            update: {
              nextNumber: { increment: 1 },
            },
            create: {
              type: "BATCH",
              prefix: "BATCH",
              nextNumber: 2,
              financialYear: new Date().getFullYear().toString(),
              outletId,
            },
          });

          const sku = variantId.slice(-8);
          const sequence = series.nextNumber - 1;
          batchNumber = formatBatchNumber(sku, input.batchDate || new Date(), sequence);
        }

        await tx.customBatch.create({
          data: {
            batchNumber,
            variantId,
            warehouseId: warehouseId as string,
            outletId,
            grnId: input.grnId,
            purchaseOrderId: input.purchaseOrderId,
            purchaseBillId: input.purchaseBillId,
            receivedDate: input.batchDate || new Date(),
            quantityReceived: quantity,
            quantityConsumed: 0,
            purchaseUnitRate,
            costPerBaseUnit,
            status: "ACTIVE",
          },
        });
      } else if (quantity < 0) {
        // OUTGOING: Consume batches using allocation service
        const requiredQty = Math.abs(quantity);
        const batchPricingMode = outlet.batchPricingMode || "STRICT";

        try {
          // Call batch allocation service with outlet's pricing mode
          const allocation: BatchAllocationResult = await allocateBatches(tx, {
            variantId,
            warehouseId: warehouseId as string,
            outletId,
            requiredQty,
            mode: batchPricingMode,
          });

          // Update batches and create BatchMovement records
          for (const batch of allocation.batchesConsumed) {
            await tx.customBatch.update({
              where: { id: batch.batchId },
              data: {
                quantityConsumed: { increment: batch.quantity },
              },
            });

            await tx.batchMovement.create({
              data: {
                batchId: batch.batchId,
                transactionId,
                quantity: -batch.quantity,
              },
            });
          }

          // Update ledger entry with allocated cost
          await tx.stockLedger.update({
            where: { id: ledgerEntry.id },
            data: { costPerUnit: allocation.costPerUnit },
          });
        } catch (error) {
          // Batch allocation failed (insufficient stock, etc.)
          if (error instanceof Error && error.message.includes("Insufficient")) {
            if (!effectiveAllowNegative) {
              throw error;
            }
            // If negative stock is allowed, continue without batch allocation
            // (this shouldn't happen in normal operation but covers edge cases)
          } else {
            throw error;
          }
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
   * Pre-calculate batch allocation for a sale (read-only, no DB writes).
   * Uses outlet's batchPricingMode to determine allocation strategy.
   * Returns the batch breakdown and cost per unit for COGS.
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
    // Get outlet's batch pricing mode
    const outlet = await tx.outlet.findUnique({
      where: { id: input.outletId },
      select: { batchPricingMode: true },
    });

    const batchPricingMode = outlet?.batchPricingMode || "STRICT";

    try {
      // Use batch allocation service for allocation logic
      const allocation = await allocateBatches(tx, {
        variantId: input.variantId,
        warehouseId: input.warehouseId as string,
        outletId: input.outletId,
        requiredQty: input.quantity,
        mode: batchPricingMode,
      });

      // Calculate total cost from batches consumed
      const totalCost = allocation.batchesConsumed.reduce(
        (sum, batch) => sum + batch.quantity * batch.costPerBaseUnit,
        0,
      );

      return {
        weightedAvgCost: roundToTwo(allocation.costPerUnit),
        totalCost: roundToTwo(totalCost),
        totalQty: input.quantity,
        shortfall: 0, // Allocation succeeded
        oldestBatchSellingPrice: null, // No longer tracked on batches
        batchesUsed: allocation.batchesConsumed.map((batch) => ({
          batchId: batch.batchId,
          batchNumber: batch.batchNumber,
          quantity: batch.quantity,
          costPerUnit: batch.costPerBaseUnit,
        })),
      };
    } catch (error) {
      // Allocation failed (insufficient stock, etc.)
      if (error instanceof Error && error.message.includes("Insufficient")) {
        // Return result with shortfall for caller to handle
        return {
          weightedAvgCost: 0,
          totalCost: 0,
          totalQty: 0,
          shortfall: input.quantity,
          oldestBatchSellingPrice: null,
          batchesUsed: [],
        };
      }
      throw error;
    }
  },
};
