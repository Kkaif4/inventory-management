import { Prisma } from "@/generated/prisma";
import { AppError } from "@/lib/exceptions";

export type BatchAllocationInput = {
  variantId: string;
  warehouseId: string;
  outletId: string;
  requiredQty: number;
  mode: "STRICT" | "LATEST_BATCH";
};

export type BatchConsumed = {
  batchId: string;
  batchNumber: string;
  quantity: number;
  costPerBaseUnit: number;
};

export type BatchAllocationResult = {
  costPerUnit: number; // For COGS (cost of the last batch used, or the single batch in STRICT)
  batchesConsumed: BatchConsumed[];
};

type BatchWithAvailable = {
  id: string;
  batchNumber: string;
  available: number;
  costPerBaseUnit: number;
};

/**
 * Allocate batches for a sale transaction based on outlet's pricing mode.
 * Fetches batches in FIFO order (oldest first by receivedDate).
 *
 * @param tx Prisma transaction client
 * @param input Allocation parameters
 * @returns Allocation result with cost and batches to consume
 * @throws AppError if insufficient stock or invalid input
 */
export async function allocateBatches(
  tx: Prisma.TransactionClient,
  input: BatchAllocationInput
): Promise<BatchAllocationResult> {
  const { variantId, warehouseId, outletId, requiredQty, mode } = input;

  // Validate input
  if (requiredQty <= 0) {
    throw new AppError(
      "Required quantity must be greater than 0",
      "VALIDATION_ERROR"
    );
  }

  // Fetch batches in FIFO order (oldest receivedDate first)
  const batches = await tx.customBatch.findMany({
    where: {
      variantId,
      warehouseId,
      outletId,
      status: "ACTIVE", // Only consider active batches
    },
    orderBy: {
      receivedDate: "asc", // FIFO: oldest first
    },
  });

  if (batches.length === 0) {
    throw new AppError(
      `No active batches found for variant ${variantId} in warehouse ${warehouseId}`,
      "BAD_REQUEST"
    );
  }

  // Calculate available quantity in each batch
  const batchesWithAvailable = batches.map((batch) => ({
    id: batch.id,
    batchNumber: batch.batchNumber,
    available: batch.quantityReceived - batch.quantityConsumed,
    costPerBaseUnit: batch.costPerBaseUnit,
  }));

  // Filter out exhausted batches
  const activeBatches = batchesWithAvailable.filter((b) => b.available > 0);

  if (activeBatches.length === 0) {
    throw new AppError(
      `All batches exhausted for variant ${variantId}`,
      "BAD_REQUEST"
    );
  }

  if (mode === "STRICT") {
    return allocateStrict(activeBatches, requiredQty);
  } else if (mode === "LATEST_BATCH") {
    return allocateLatestBatch(activeBatches, requiredQty);
  } else {
    throw new AppError(
      `Unknown allocation mode: ${mode}`,
      "VALIDATION_ERROR"
    );
  }
}

/**
 * STRICT mode allocation:
 * Find a single batch with sufficient quantity, fail if none exists.
 * Returns the cost of that single batch for the entire transaction.
 */
function allocateStrict(
  activeBatches: BatchWithAvailable[],
  requiredQty: number
): BatchAllocationResult {
  // Find the first batch with sufficient available quantity
  const selectedBatch = activeBatches.find(
    (batch) => batch.available >= requiredQty
  );

  if (!selectedBatch) {
    throw new AppError(
      `Insufficient stock: required ${requiredQty} units, but no single batch has enough available. Available batches: ${activeBatches
        .map((b) => `${b.batchNumber}(${b.available})`)
        .join(", ")}`,
      "BAD_REQUEST"
    );
  }

  return {
    costPerUnit: selectedBatch.costPerBaseUnit,
    batchesConsumed: [
      {
        batchId: selectedBatch.id,
        batchNumber: selectedBatch.batchNumber,
        quantity: requiredQty,
        costPerBaseUnit: selectedBatch.costPerBaseUnit,
      },
    ],
  };
}

/**
 * LATEST_BATCH mode allocation:
 * Consume FIFO across multiple batches if needed.
 * Cost is from the last batch consumed (which is the oldest batch used).
 */
function allocateLatestBatch(
  activeBatches: BatchWithAvailable[],
  requiredQty: number
): BatchAllocationResult {
  let remaining = requiredQty;
  const batchesConsumed: BatchConsumed[] = [];
  let lastBatchCost = 0;

  for (const batch of activeBatches) {
    if (remaining <= 0) break;

    const consumed = Math.min(batch.available, remaining);
    batchesConsumed.push({
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      quantity: consumed,
      costPerBaseUnit: batch.costPerBaseUnit,
    });

    lastBatchCost = batch.costPerBaseUnit; // Keep updating to track the "last" batch
    remaining -= consumed;
  }

  if (remaining > 0) {
    throw new AppError(
      `Insufficient total stock: required ${requiredQty} units, available ${requiredQty - remaining} units across all batches`,
      "BAD_REQUEST"
    );
  }

  return {
    costPerUnit: lastBatchCost, // Use cost from last (oldest) batch consumed
    batchesConsumed,
  };
}

/**
 * Validate batch availability without consuming.
 * Used for pre-checks before creating transactions.
 */
export async function validateBatchAvailability(
  tx: Prisma.TransactionClient,
  variantId: string,
  warehouseId: string,
  outletId: string,
  requiredQty: number
): Promise<{ available: number; sufficient: boolean }> {
  const batches = await tx.customBatch.findMany({
    where: {
      variantId,
      warehouseId,
      outletId,
      status: "ACTIVE",
    },
  });

  const totalAvailable = batches.reduce(
    (sum, batch) => sum + (batch.quantityReceived - batch.quantityConsumed),
    0
  );

  return {
    available: totalAvailable,
    sufficient: totalAvailable >= requiredQty,
  };
}

/**
 * Get batch allocation summary for reporting/debugging.
 */
export async function getBatchAllocationSummary(
  tx: Prisma.TransactionClient,
  variantId: string,
  warehouseId: string,
  outletId: string
): Promise<
  Array<{
    batchNumber: string;
    quantityReceived: number;
    quantityConsumed: number;
    available: number;
    costPerBaseUnit: number;
    status: string;
  }>
> {
  const batches = await tx.customBatch.findMany({
    where: {
      variantId,
      warehouseId,
      outletId,
    },
    orderBy: {
      receivedDate: "asc",
    },
  });

  return batches.map((batch) => ({
    batchNumber: batch.batchNumber,
    quantityReceived: batch.quantityReceived,
    quantityConsumed: batch.quantityConsumed,
    available: batch.quantityReceived - batch.quantityConsumed,
    costPerBaseUnit: batch.costPerBaseUnit,
    status: batch.status,
  }));
}
