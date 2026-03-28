"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/error-handler";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { parsePaginationParams, calculatePagination } from "@/lib/pagination";
import { PaginatedResult } from "@/types/pagination";
import type {
  SalesRegisterItem,
  SalesReportParams,
} from "@/types/reports/sales";

export async function getSalesRegisterReport(params: SalesReportParams) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(params.outletId);

    const { page, limit } = parsePaginationParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
    });

    // Build where clause for transactions
    const where: any = {
      outletId: params.outletId,
      type: "SALES_INVOICE",
      date: {
        gte: params.dateFrom,
        lte: params.dateTo,
      },
      ...(params.paymentStatus && { status: params.paymentStatus }),
      ...(params.search && {
        OR: [
          { txnNumber: { contains: params.search, mode: "insensitive" } },
          { party: { name: { contains: params.search, mode: "insensitive" } } },
          {
            party: { phone: { contains: params.search, mode: "insensitive" } },
          },
        ],
      }),
    };

    // Fetch data and count in parallel
    const [total, invoices] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        select: {
          id: true,
          txnNumber: true,
          date: true,
          party: {
            select: {
              name: true,
              phone: true,
            },
          },
          billType: true,
          totalTaxable: true,
          totalTax: true,
          grandTotal: true,
          status: true,
          items: {
            select: {
              cgst: true,
              sgst: true,
              igst: true,
            },
          },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const data: SalesRegisterItem[] = invoices.map((inv) => {
      const cgst = inv.items.reduce((sum, item) => sum + item.cgst, 0);
      const sgst = inv.items.reduce((sum, item) => sum + item.sgst, 0);
      const igst = inv.items.reduce((sum, item) => sum + item.igst, 0);
      return {
        id: inv.id,
        invoiceNumber: inv.txnNumber || "",
        date: inv.date,
        customerName: inv.party?.name || "Unknown",
        customerPhone: inv.party?.phone,
        invoiceType: inv.billType === "NO2" ? "UNTAXED" : "TAXED",
        taxableValue: inv.totalTaxable || 0,
        cgst,
        sgst,
        igst,
        totalTax: cgst + sgst + igst,
        totalAmount: inv.grandTotal || 0,
        paymentStatus:
          inv.status === "PAID"
            ? "PAID"
            : inv.status === "PARTIALLY_PAID"
              ? "PARTIALLY_PAID"
              : "UNPAID",
      };
    });

    const pagination = calculatePagination(total, page, limit);

    return {
      data,
      pagination,
      total,
      page,
      limit,
    };
  });
}
