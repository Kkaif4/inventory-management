import { Prisma } from "../../../prisma/generated";

export type LocationType = "WAREHOUSE" | "OUTLET";

export type StockUpdateInput = {
  variantId: string;
  locationId: string;
  locationType: LocationType;
  quantityChange: number;
  allowNegative?: boolean;
};

export const StockService = {
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

  async getAvailableStockAtOutlet(
    tx: Prisma.TransactionClient,
    variantId: string,
    outletId: string,
  ) {
    const outlet = await tx.outlet.findUnique({
      where: { id: outletId },
      include: { warehouses: true },
    });

    if (!outlet) throw new Error("Outlet not found");

    const warehouseId = outlet.warehouses[0]?.id;

    if (!warehouseId) {
      const stock = await tx.stock.findFirst({
        where: {
          variantId,
          warehouseId: null,
          outletId,
        },
      });
      return stock?.quantity || 0;
    }

    const stock = await tx.stock.findFirst({
      where: {
        variantId,
        warehouseId,
        outletId: null,
      },
    });

    return stock?.quantity || 0;
  },

  async batchUpdateStock(
    tx: Prisma.TransactionClient,
    inputs: StockUpdateInput[],
  ) {
    // 1. Group inputs by location/variant to identify existing records in bulk
    const queries = inputs.map((input) => ({
      variantId: input.variantId,
      warehouseId: input.locationType === "WAREHOUSE" ? input.locationId : null,
      outletId: input.locationType === "OUTLET" ? input.locationId : null,
    }));

    const existingStocks = await tx.stock.findMany({
      where: {
        OR: queries,
      },
    });

    for (const input of inputs) {
      const {
        variantId,
        locationId,
        locationType,
        quantityChange,
        allowNegative,
      } = input;
      const warehouseId = locationType === "WAREHOUSE" ? locationId : null;
      const outletId = locationType === "OUTLET" ? locationId : null;

      const existingRecord = existingStocks.find(
        (s) =>
          s.variantId === variantId &&
          s.warehouseId === warehouseId &&
          s.outletId === outletId,
      );

      if (existingRecord) {
        if (
          !allowNegative &&
          quantityChange < 0 &&
          existingRecord.quantity + quantityChange < 0
        ) {
          throw new Error(
            `Insufficient stock for variant ${variantId}. Available: ${existingRecord.quantity}, Requested: ${Math.abs(quantityChange)}`,
          );
        }

        await tx.stock.update({
          where: { id: existingRecord.id },
          data: {
            quantity: { increment: quantityChange },
          },
        });
      } else {
        if (!allowNegative && quantityChange < 0) {
          throw new Error(
            `Insufficient stock for variant ${variantId}. No stock record exists.`,
          );
        }

        await tx.stock.create({
          data: {
            variantId,
            warehouseId,
            outletId,
            quantity: quantityChange,
          },
        });
      }
    }
  },
};
