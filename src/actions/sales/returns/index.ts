"use server";

import { prisma } from "@/lib/prisma";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { StockService } from "@/domains/inventory/stock-service";
import { AccountingService } from "@/domains/accounting/ledger-service";
import { NumberingService } from "@/domains/foundation/numbering-service";
import { roundToTwo } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { withErrorHandler } from "@/lib/error-handler";
import { NotFoundError } from "@/lib/exceptions";
import {
  parsePaginationParams,
  calculatePagination,
} from "@/lib/pagination";
import { PaginatedResult, BasePaginationParams } from "@/types/pagination";

export async function createSalesReturn(data: {
  originalBillId: string;
  items: {
    variantId: string;
    quantity: number; // Positive quantity returned
    rate: number;
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
  }[];
  reason: string;
  date: Date;
  userId: string;
}) {
  return withErrorHandler(async () => {
    const originalBill = await prisma.transaction.findUnique({
      where: { id: data.originalBillId },
      include: { items: true },
    });

    if (!originalBill) throw new NotFoundError("Original bill not found");
    await validateSessionOutletAccess(originalBill.outletId);
    const isInformal = originalBill.isInformal;

    const totalTaxable = roundToTwo(
      data.items.reduce((a, b) => a + b.taxableValue, 0),
    );
    const totalCgst = roundToTwo(data.items.reduce((a, b) => a + b.cgst, 0));
    const totalSgst = roundToTwo(data.items.reduce((a, b) => a + b.sgst, 0));
    const totalIgst = roundToTwo(data.items.reduce((a, b) => a + b.igst, 0));
    const totalTax = roundToTwo(totalCgst + totalSgst + totalIgst);
    const grandTotal = roundToTwo(totalTaxable + totalTax);

    const accountCodes = ["3001", "1003", "2002", "2003", "2004"];
    const [variants, accounts] = await Promise.all([
      prisma.variant.findMany({
        where: { id: { in: data.items.map((i) => i.variantId) } },
        include: { product: true },
      }),
      prisma.account.findMany({
        where: { code: { in: accountCodes } },
      }),
    ]);

    return await prisma.$transaction(async (tx) => {
      // 1. Numbering
      const txnNumber = await NumberingService.getNextNumber(
        tx,
        originalBill.outletId,
        isInformal ? "STOCK_RETURN" : "CREDIT_NOTE",
      );

      // 2. Create Return Transaction
      const returnTx = await tx.transaction.create({
        data: {
          type: isInformal ? "STOCK_RETURN" : "CREDIT_NOTE",
          txnNumber,
          date: data.date,
          partyId: originalBill.partyId,
          outletId: originalBill.outletId,
          parentId: originalBill.id,
          totalTaxable,
          totalTax,
          grandTotal,
          status: "POSTED",
          userId: data.userId,
          remarks: data.reason,
          items: {
            create: data.items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              rate: item.rate,
              taxableValue: item.taxableValue,
              cgst: item.cgst,
              sgst: item.sgst,
              igst: item.igst,
            })),
          },
        },
      });

      // 3. Stock Update (Increase stock)
      await StockService.batchUpdateStock(tx, {
        transactionId: returnTx.id,
        userId: data.userId,
        outletId: originalBill.outletId,
        type: "ADJUSTMENT_INC", // Using adjustment_inc for simplicity or generic "IN"?
        items: data.items.map((item) => {
          const variant = variants.find((v) => v.id === item.variantId)!;
          return {
            variantId: item.variantId,
            locationId: originalBill.fromLocationId, // Returning to same location
            locationType: "WAREHOUSE", // Assuming return to warehouse
            quantityChange:
              item.quantity * (variant.product.conversionRatio || 1),
            allowNegative: true, // Always allow return
          };
        }),
      });

      // 4. Accounting Reversal (Skip for Informal)
      if (!isInformal) {
        const salesAcc = accounts.find((a) => a.code === "3001");
        const debtorAcc = accounts.find((a) => a.code === "1003");
        const outputCgstAcc = accounts.find((a) => a.code === "2002");
        const outputSgstAcc = accounts.find((a) => a.code === "2003");
        const outputIgstAcc = accounts.find((a) => a.code === "2004");

        if (!salesAcc || !debtorAcc)
          throw new NotFoundError("Accounts not found. Run COA setup.");

        const entries = [
          { accountId: salesAcc.id, debit: totalTaxable }, // Reverse Sales (Debit)
          { accountId: debtorAcc.id, credit: grandTotal }, // Reverse Debtor (Credit)
        ];

        if (totalCgst > 0 && outputCgstAcc)
          entries.push({ accountId: outputCgstAcc.id, debit: totalCgst });
        if (totalSgst > 0 && outputSgstAcc)
          entries.push({ accountId: outputSgstAcc.id, debit: totalSgst });
        if (totalIgst > 0 && outputIgstAcc)
          entries.push({ accountId: outputIgstAcc.id, debit: totalIgst });

        await AccountingService.postJournalEntry(tx, {
          transactionId: returnTx.id,
          partyId: originalBill.partyId!,
          entries,
        });
      }

      revalidatePath("/dashboard/sales/transactions");
      return returnTx;
    });
  });
}

export async function getSalesReturns() {
  return withErrorHandler(async () => {
    return await prisma.transaction.findMany({
      where: {
        type: { in: ["CREDIT_NOTE", "STOCK_RETURN"] } as any,
      },
      include: {
        party: true,
        items: {
          include: { variant: { include: { product: true } } },
        },
      },
      orderBy: { date: "desc" },
    });
  });
}

// ─── Get sales returns with server-side pagination ────────────────────────
export async function getSalesReturnsPaginated(
  outletId: string,
  params: BasePaginationParams & {
    search?: string;
    status?: string;
  },
) {
  return withErrorHandler(async (): Promise<PaginatedResult<any>> => {
    await validateSessionOutletAccess(outletId);

    const { page, limit } = parsePaginationParams({
      page: String(params.page),
      limit: String(params.limit),
    });

    const { search, status } = params;

    const andClauses: any[] = [
      { type: { in: ["CREDIT_NOTE", "STOCK_RETURN"] } },
      { outletId },
    ];

    if (search) {
      andClauses.push({
        OR: [
          { txnNumber: { contains: search, mode: "insensitive" } },
          { party: { name: { contains: search, mode: "insensitive" } } },
        ],
      });
    }

    if (status && status !== "ALL") {
      andClauses.push({ status });
    }

    const where = { AND: andClauses };

    const [total, returns] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        select: {
          id: true,
          type: true,
          txnNumber: true,
          date: true,
          grandTotal: true,
          status: true,
          party: {
            select: {
              id: true,
              name: true,
              gstin: true,
            },
          },
          _count: { select: { items: true } },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const pagination = calculatePagination(total, page, limit);

    return {
      data: returns,
      pagination,
    } as any;
  });
}
