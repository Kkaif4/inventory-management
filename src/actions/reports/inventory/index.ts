"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/error-handler";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { calculatePagination } from "@/lib/pagination";
import type {
  CurrentStockItem,
  LowStockItem,
  StockLedgerItem,
  StockValuationItem,
  SlowMovingStockItem,
  InventoryReportParams,
} from "@/types/reports/inventory";

/**
 * Current Stock Report
 * Shows inventory balance by product variant and warehouse
 */
export async function getCurrentStockReport(params: InventoryReportParams) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(params.outletId);

    const where: any = {
      outletId: params.outletId,
    };

    if (params.warehouseId) {
      where.warehouseId = params.warehouseId;
    }

    if (params.productId) {
      where.variant = {
        productId: params.productId,
      };
    }

    if (params.categoryId) {
      where.variant = {
        ...where.variant,
        product: {
          categoryId: params.categoryId,
        },
      };
    }

    if (params.search) {
      const searchTerm = params.search;
      where.OR = [
        { variant: { sku: { contains: searchTerm, mode: "insensitive" } } },
        {
          variant: {
            product: { name: { contains: searchTerm, mode: "insensitive" } },
          },
        },
      ];
    }

    // Get total count
    const total = await prisma.stock.count({ where });
    const pagination = calculatePagination(total, params.page, params.limit);

    // Get paginated data
    const stocks = await prisma.stock.findMany({
      where,
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
      },
      orderBy: [
        { variant: { product: { name: "asc" } } },
        { warehouse: { name: "asc" } },
      ],
      skip: pagination.skip,
      take: pagination.limit,
    });

    const items: CurrentStockItem[] = stocks.map((stock) => {
      const variant = stock.variant as any;
      const quantity = stock.quantity;
      const minLevel = variant.minStockLevel ?? 0;
      const maxLevel = variant.maxStockLevel ?? 0;
      const reorderPoint = variant.reorderPoint ?? minLevel;

      let status: "critical" | "warning" | "normal" | "overstock" = "normal";
      if (quantity <= minLevel) {
        status = "critical";
      } else if (quantity <= reorderPoint) {
        status = "warning";
      } else if (maxLevel > 0 && quantity > maxLevel) {
        status = "overstock";
      }

      return {
        id: stock.id,
        sku: variant.sku,
        productName: (variant.product as any).name,
        variantName: variant.sku,
        unitOfMeasure: variant.unit || "units",
        warehouseName: stock.warehouse?.name || "Default",
        quantity,
        inTransitQty: stock.inTransitQty,
        minStockLevel: minLevel,
        maxStockLevel: maxLevel,
        reorderPoint,
        status,
      };
    });

    return {
      data: items,
      pagination,
    };
  });
}

/**
 * Low Stock Alert Report
 * Shows items below minimum threshold
 */
export async function getLowStockAlertReport(params: InventoryReportParams) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(params.outletId);

    const where: any = {
      outletId: params.outletId,
      variant: {
        minStockLevel: { gt: 0 },
      },
    };

    if (params.warehouseId) {
      where.warehouseId = params.warehouseId;
    }

    if (params.productId) {
      where.variant.productId = params.productId;
    }

    if (params.categoryId) {
      where.variant = {
        ...where.variant,
        product: {
          categoryId: params.categoryId,
        },
      };
    }

    const stocks = await prisma.stock.findMany({
      where,
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
      orderBy: [{ variant: { product: { name: "asc" } } }],
    });

    const items: LowStockItem[] = stocks
      .map((stock) => {
        const variant = stock.variant as any;
        const quantity = stock.quantity;
        const minLevel = variant.minStockLevel ?? 0;
        const shortage = minLevel - quantity;

        return {
          id: stock.id,
          sku: variant.sku,
          productName: (variant.product as any).name,
          variantName: variant.sku,
          unitOfMeasure: variant.unit || "units",
          minLevel,
          currentStock: quantity,
          shortage: Math.max(0, shortage),
          status: (quantity <= 0 ? "critical" : "warning") as
            | "critical"
            | "warning",
        };
      })
      .filter((item) => item.currentStock < item.minLevel)
      .sort((a, b) => b.shortage - a.shortage);

    // Apply pagination
    const total = items.length;
    const paginatedItems = items.slice(
      (params.page - 1) * params.limit,
      params.page * params.limit,
    );

    return {
      data: paginatedItems,
      total,
      page: params.page,
      limit: params.limit,
      totals: {
        totalShortage: items.reduce((sum, item) => sum + item.shortage, 0),
      },
    };
  });
}

/**
 * Stock Ledger Report
 * Shows transaction history with running balance
 */
export async function getStockLedgerReport(params: InventoryReportParams) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(params.outletId);

    const where: any = {
      outletId: params.outletId,
      date: {
        gte: params.dateFrom,
        lte: params.dateTo,
      },
    };

    if (params.warehouseId) {
      where.warehouseId = params.warehouseId;
    }

    if (params.productId) {
      where.variant = {
        productId: params.productId,
      };
    }

    if (params.categoryId) {
      where.variant = {
        product: {
          categoryId: params.categoryId,
        },
      };
    }

    if (params.search) {
      const searchTerm = params.search;
      where.OR = [
        { variant: { sku: { contains: searchTerm, mode: "insensitive" } } },
        {
          variant: {
            product: { name: { contains: searchTerm, mode: "insensitive" } },
          },
        },
      ];
    }

    if (params.status) {
      where.type = params.status;
    }

    const total = await prisma.stockLedger.count({ where });
    const pagination = calculatePagination(total, params.page, params.limit);

    const ledgers = await prisma.stockLedger.findMany({
      where,
      include: {
        variant: {
          include: {
            product: true,
          },
        },
        warehouse: true,
        transaction: true,
      },
      orderBy: [{ date: "desc" }],
      skip: pagination.skip,
      take: pagination.limit,
    });

    const items: StockLedgerItem[] = ledgers.map((ledger) => {
      const variant = ledger.variant as any;
      const transactionType = ledger.type as
        | "PURCHASE"
        | "SALE"
        | "TRANSFER"
        | "ADJUSTMENT";
      return {
        id: ledger.id,
        date: ledger.date,
        sku: variant.sku,
        productName: (variant.product as any).name,
        variantName: variant.sku,
        warehouseName: ledger.warehouse.name,
        transactionType,
        referenceNumber: (ledger.transaction as any)?.number || "N/A",
        quantity: ledger.quantity,
        balance: ledger.balance,
        costPerUnit: ledger.costPerUnit,
        userId: ledger.userId,
      };
    });

    return {
      data: items,
      pagination,
      totals: {
        totalIn: items
          .filter((item) => item.quantity > 0)
          .reduce((sum, item) => sum + item.quantity, 0),
        totalOut: items
          .filter((item) => item.quantity < 0)
          .reduce((sum, item) => sum + Math.abs(item.quantity), 0),
      },
    };
  });
}

/**
 * Stock Valuation Report
 * Shows stock value using FIFO/weighted average cost
 */
export async function getStockValuationReport(params: InventoryReportParams) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(params.outletId);

    const where: any = {
      outletId: params.outletId,
      quantity: { gt: 0 },
    };

    if (params.warehouseId) {
      where.warehouseId = params.warehouseId;
    }

    if (params.productId) {
      where.variant = {
        productId: params.productId,
      };
    }

    if (params.categoryId) {
      where.variant = {
        product: {
          categoryId: params.categoryId,
        },
      };
    }

    if (params.search) {
      const searchTerm = params.search;
      where.OR = [
        { variant: { sku: { contains: searchTerm, mode: "insensitive" } } },
        {
          variant: {
            product: { name: { contains: searchTerm, mode: "insensitive" } },
          },
        },
      ];
    }

    const total = await prisma.stock.count({ where });
    const pagination = calculatePagination(total, params.page, params.limit);

    const stocks = await prisma.stock.findMany({
      where,
      include: {
        variant: {
          include: {
            product: true,
          },
        },
        warehouse: true,
      },
      orderBy: [{ variant: { product: { name: "asc" } } }],
      skip: pagination.skip,
      take: pagination.limit,
    });

    // Get the latest cost per unit from stock ledger
    const items: StockValuationItem[] = await Promise.all(
      stocks.map(async (stock) => {
        const latestLedger = await prisma.stockLedger.findFirst({
          where: {
            variantId: stock.variantId,
            warehouseId: stock.warehouseId || undefined,
            quantity: { gt: 0 },
          },
          orderBy: { date: "desc" },
        });

        const costPerUnit = latestLedger?.costPerUnit || 0;
        const totalValue = stock.quantity * costPerUnit;
        const variant = stock.variant as any;

        return {
          id: stock.id,
          sku: variant.sku,
          productName: (variant.product as any).name,
          variantName: variant.sku,
          unitOfMeasure: variant.unit || "units",
          warehouseName: stock.warehouse?.name || "Default",
          quantity: stock.quantity,
          costPerUnit,
          totalValue,
          valuationMethod: "FIFO" as const,
        };
      }),
    );

    return {
      data: items,
      pagination,
      totals: {
        totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
        totalValue: items.reduce((sum, item) => sum + item.totalValue, 0),
      },
    };
  });
}

/**
 * Slow-Moving Stock Report
 * Shows items with low movement frequency
 */
export async function getSlowMovingStockReport(params: InventoryReportParams) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(params.outletId);

    const where: any = {
      outletId: params.outletId,
      quantity: { gt: 0 },
    };

    if (params.search) {
      const searchTerm = params.search;
      where.OR = [
        { variant: { sku: { contains: searchTerm, mode: "insensitive" } } },
        {
          variant: {
            product: { name: { contains: searchTerm, mode: "insensitive" } },
          },
        },
      ];
    }

    // Get all stocks with outlet filter
    const stocks = await prisma.stock.findMany({
      where,
      include: {
        variant: {
          include: {
            product: true,
          },
        },
        warehouse: true,
      },
    });

    // Enrich with movement data
    const items: SlowMovingStockItem[] = await Promise.all(
      stocks.map(async (stock) => {
        // Get last movement
        const lastMovement = await prisma.stockLedger.findFirst({
          where: {
            variantId: stock.variantId,
            outletId: params.outletId,
          },
          orderBy: { date: "desc" },
        });

        const lastMovementDate = lastMovement?.date || null;
        const daysSinceLastMovement = lastMovementDate
          ? Math.floor(
              (new Date().getTime() - lastMovementDate.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 999;

        // Get movement frequency (count of movements in last 90 days)
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const movementCount = await prisma.stockLedger.count({
          where: {
            variantId: stock.variantId,
            outletId: params.outletId,
            date: { gte: ninetyDaysAgo },
          },
        });

        let movementFrequency: "high" | "medium" | "low" | "dormant" =
          "dormant";
        if (movementCount > 20) movementFrequency = "high";
        else if (movementCount > 10) movementFrequency = "medium";
        else if (movementCount > 0) movementFrequency = "low";

        // Estimate months of stock based on movement
        const avgMonthlyMovement = movementCount / 3;
        const estimatedMonthsOfStock =
          avgMonthlyMovement > 0 ? stock.quantity / avgMonthlyMovement : 999;

        const variant = stock.variant as any;
        return {
          id: stock.id,
          sku: variant.sku,
          productName: (variant.product as any).name,
          variantName: variant.sku,
          unitOfMeasure: variant.unit || "units",
          currentStock: stock.quantity,
          minStockLevel: variant.minStockLevel ?? 0,
          lastMovementDate,
          daysSinceLastMovement,
          movementFrequency,
          estimatedMonthsOfStock:
            Math.round(estimatedMonthsOfStock * 100) / 100,
        };
      }),
    );

    // Filter and sort by slow-moving criteria
    const slowMoving = items
      .filter(
        (item) =>
          item.daysSinceLastMovement > 30 || item.estimatedMonthsOfStock > 6,
      )
      .sort((a, b) => b.estimatedMonthsOfStock - a.estimatedMonthsOfStock);

    const total = slowMoving.length;
    const pagination = calculatePagination(total, params.page, params.limit);
    const paginatedItems = slowMoving.slice(
      pagination.skip,
      pagination.skip + pagination.limit,
    );

    return {
      data: paginatedItems,
      pagination,
      totals: {
        dormantItems: slowMoving.filter(
          (item) => item.movementFrequency === "dormant",
        ).length,
        totalBlockedValue: paginatedItems.reduce(
          (sum, item) => sum + item.currentStock,
          0,
        ),
      },
    };
  });
}
