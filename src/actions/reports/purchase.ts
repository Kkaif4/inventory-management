"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/error-handler";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { parsePaginationParams, calculatePagination } from "@/lib/pagination";
import type {
  PurchaseRegisterItem,
  PurchaseReportParams,
} from "@/types/reports/purchase";

export async function getPurchaseRegisterReport(params: PurchaseReportParams) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(params.outletId);

    const { page, limit } = parsePaginationParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
    });

    const where: any = {
      outletId: params.outletId,
      type: "PURCHASE_ORDER",
      date: {
        gte: params.dateFrom,
        lte: params.dateTo,
      },
      ...(params.status && { status: params.status }),
      ...(params.search && {
        OR: [
          { txnNumber: { contains: params.search, mode: "insensitive" } },
          { party: { name: { contains: params.search, mode: "insensitive" } } },
        ],
      }),
    };

    const [total, orders] = await Promise.all([
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
          totalTaxable: true,
          totalTax: true,
          grandTotal: true,
          status: true,
          billType: true,
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

    const data: PurchaseRegisterItem[] = orders.map((po) => {
      const cgst = po.items.reduce((sum, item) => sum + item.cgst, 0);
      const sgst = po.items.reduce((sum, item) => sum + item.sgst, 0);
      const igst = po.items.reduce((sum, item) => sum + item.igst, 0);
      return {
        id: po.id,
        poNumber: po.txnNumber || "",
        date: po.date,
        vendorName: po.party?.name || "Unknown",
        vendorPhone: po.party?.phone ?? undefined,
        invoiceNumber: undefined,
        invoiceDate: undefined,
        taxableValue: po.totalTaxable || 0,
        cgst,
        sgst,
        igst,
        totalTax: cgst + sgst + igst,
        totalAmount: po.grandTotal || 0,
        paymentStatus:
          po.status === "PAID"
            ? "PAID"
            : po.status === "PARTIALLY_PAID"
              ? "PARTIALLY_PAID"
              : "UNPAID",
        grnStatus: "PENDING",
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
