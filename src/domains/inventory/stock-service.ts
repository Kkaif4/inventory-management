import { Prisma } from "../../../prisma/generated";

export type LocationType = "WAREHOUSE" | "OUTLET";

export type StockUpdateInput = {
  variantId: string;
  locationId: string;
  locationType: LocationType;
  quantityChange: number; // Positive for addition, negative for deduction
  allowNegative?: boolean; // New flag to bypass stock check
};

export const StockService = {
  /**
   * Safely updates stock for a given variant at a specific location.
   * Uses Prisma's atomic increment/decrement to prevent race conditions.
   * If stock row doesn't exist, it creates it.
   */
  async updateStock(tx: Prisma.TransactionClient, input: StockUpdateInput) {
    const {
      variantId,
      locationId,
      locationType,
      quantityChange,
      allowNegative,
    } = input;

    const warehouseId = locationType === "WAREHOUSE" ? locationId : null;
    const outletId = locationType === "OUTLET" ? locationId : null;

    // Check if the stock record exists
    const existingStock = await tx.stock.findFirst({
      where: {
        variantId,
        warehouseId,
        outletId,
      },
    });

    if (existingStock) {
      if (
        !allowNegative &&
        quantityChange < 0 &&
        existingStock.quantity + quantityChange < 0
      ) {
        throw new Error(
          `Insufficient stock for variant ${variantId} at location ${locationId}. Current: ${existingStock.quantity}, Requested: ${Math.abs(quantityChange)}`,
        );
      }

      return await tx.stock.update({
        where: { id: existingStock.id },
        data: {
          quantity: {
            increment: quantityChange,
          },
        },
      });
    } else {
      if (!allowNegative && quantityChange < 0) {
        throw new Error(
          `Insufficient stock for variant ${variantId} at location ${locationId}. Stock record does not exist.`,
        );
      }

      return await tx.stock.create({
        data: {
          variantId,
          warehouseId,
          outletId,
          quantity: quantityChange,
        },
      });
    }
  },

  /**
   * Updates in-transit stock (useful for warehouse to outlet transfers)
   */
  async updateInTransitStock(
    tx: Prisma.TransactionClient,
    input: StockUpdateInput,
  ) {
    const { variantId, locationId, locationType, quantityChange } = input;

    const warehouseId = locationType === "WAREHOUSE" ? locationId : null;
    const outletId = locationType === "OUTLET" ? locationId : null;

    const existingStock = await tx.stock.findFirst({
      where: {
        variantId,
        warehouseId,
        outletId,
      },
    });

    if (existingStock) {
      if (
        quantityChange < 0 &&
        existingStock.inTransitQty + quantityChange < 0
      ) {
        throw new Error(
          `Insufficient in-transit stock for variant ${variantId}.`,
        );
      }

      return await tx.stock.update({
        where: { id: existingStock.id },
        data: {
          inTransitQty: {
            increment: quantityChange,
          },
        },
      });
    } else {
      if (quantityChange < 0) {
        throw new Error(
          `Insufficient in-transit stock for variant ${variantId}.`,
        );
      }

      return await tx.stock.create({
        data: {
          variantId,
          warehouseId,
          outletId,
          inTransitQty: quantityChange,
        },
      });
    }
  },
};
