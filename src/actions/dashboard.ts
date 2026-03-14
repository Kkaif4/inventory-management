"use server";

import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";
import { roundToTwo } from "@/lib/utils";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { withErrorHandler } from "@/lib/error-handler";

export async function getDashboardStats(outletId: string) {
  return withErrorHandler(async () => {
    // Validate user has access to this outlet
    await validateSessionOutletAccess(outletId);

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // 1. Today's Sales
    const todaySales = await prisma.transaction.aggregate({
      where: {
        outletId, // Add outlet filter
        type: "SALES_INVOICE",
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      _sum: {
        grandTotal: true,
      },
      _count: {
        id: true,
      },
    });

    // 2. Open Purchase Orders
    const openPOs = await prisma.transaction.count({
      where: {
        outletId, // Add outlet filter
        type: "PURCHASE_ORDER",
        status: {
          in: ["DRAFT", "PENDING", "APPROVED", "PARTIAL"],
        },
      },
    });

    const openPOValue = await prisma.transaction.aggregate({
      where: {
        outletId, // Add outlet filter
        type: "PURCHASE_ORDER",
        status: {
          in: ["DRAFT", "PENDING", "APPROVED", "PARTIAL"],
        },
      },
      _sum: {
        grandTotal: true,
      },
    });

    // 3. Low Stock Items
    // Compare stock quantity with variant's minStockLevel manually since Prisma doesn't support relation field comparison yet
    const allStock = await prisma.stock.findMany({
      where: { outletId }, // Add outlet filter
      include: { variant: true },
    });
    const lowStockCount = allStock.filter(
      (s) => s.quantity <= s.variant.minStockLevel,
    ).length;

    // 4. Outstanding Receivables (Customers who owe us)
    const outstandingReceivables = await prisma.party.aggregate({
      where: {
        outletId, // Add outlet filter
        type: "CUSTOMER",
        openingBalance: {
          gt: 0,
        },
      },
      _sum: {
        openingBalance: true,
      },
    });

    // 5. Recent Invoices
    const recentInvoices = await prisma.transaction.findMany({
      where: {
        outletId, // Add outlet filter
        type: "SALES_INVOICE",
      },
      take: 8,
      orderBy: {
        date: "desc",
      },
      include: {
        party: true,
      },
    });

    return {
      kpis: {
        todaySales: {
          value: roundToTwo(todaySales._sum.grandTotal || 0),
          count: todaySales._count.id,
        },
        openPOs: {
          count: openPOs,
          value: roundToTwo(openPOValue._sum.grandTotal || 0),
        },
        lowStock: {
          count: lowStockCount,
        },
        receivables: {
          value: roundToTwo(outstandingReceivables._sum.openingBalance || 0),
        },
      },
      recentInvoices,
    };
  });
}
