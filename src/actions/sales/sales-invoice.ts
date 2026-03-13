"use server";

import { prisma } from "@/lib/prisma";
import { StockService } from "@/domains/inventory/stock-service";
import { AccountingService } from "@/domains/accounting/ledger-service";
import { roundToTwo } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function createSalesInvoice(data: {
  partyId: string;
  fromOutletId: string;
  items: {
    variantId: string;
    quantity: number;
    rate: number;
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
  }[];
  date: Date;
  userId: string; // Mandatory for auditing
  freightCost?: number;
}) {
  // 1. Batch Metadata Lookups (Variants & Required Accounts)
  const variantIds = data.items.map((i) => i.variantId);
  const accountCodes = ["3001", "1003", "2002", "2003", "2004"];

  const [outlet, variants, accounts] = await Promise.all([
    prisma.outlet.findUnique({
      where: { id: data.fromOutletId },
      include: { warehouses: true },
    }),
    prisma.variant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    }),
    prisma.account.findMany({
      where: { code: { in: accountCodes } },
    }),
  ]);

  if (!outlet) throw new Error("Outlet not found");
  if (variants.length !== new Set(variantIds).size)
    throw new Error("Some variants not found");

  const salesAcc = accounts.find((a) => a.code === "3001");
  const debtorAcc = accounts.find((a) => a.code === "1003");
  const outputCgstAcc = accounts.find((a) => a.code === "2002");
  const outputSgstAcc = accounts.find((a) => a.code === "2003");
  const outputIgstAcc = accounts.find((a) => a.code === "2004");

  if (!salesAcc || !debtorAcc)
    throw new Error("Required accounts not found. Run COA setup.");

  const allowNegative =
    outlet.negativeStockPolicy === "WARN" ||
    outlet.negativeStockPolicy === "ALLOW";

  const totalTaxable = roundToTwo(
    data.items.reduce((a, b) => a + b.taxableValue, 0),
  );
  const totalCgst = roundToTwo(data.items.reduce((a, b) => a + b.cgst, 0));
  const totalSgst = roundToTwo(data.items.reduce((a, b) => a + b.sgst, 0));
  const totalIgst = roundToTwo(data.items.reduce((a, b) => a + b.igst, 0));
  const totalTax = roundToTwo(totalCgst + totalSgst + totalIgst);
  const freightCost = data.freightCost || 0;
  const grandTotal = roundToTwo(totalTaxable + totalTax + freightCost);

  const warehouseId = outlet.warehouses[0]?.id;

  return await prisma.$transaction(async (tx) => {
    // 1. Transaction Header
    const invoice = await tx.transaction.create({
      data: {
        type: "SALES_INVOICE",
        txnNumber: `INV-${Date.now()}`,
        date: data.date,
        partyId: data.partyId,
        outletId: data.fromOutletId, // Scoped to outlet
        fromLocationId: data.fromOutletId,
        totalTaxable,
        totalTax,
        freightCost,
        grandTotal,
        status: "POSTED",
        userId: data.userId, // Storing creator info
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

    // 2. Batch Stock Updates
    await StockService.batchUpdateStock(tx, {
      transactionId: invoice.id,
      userId: data.userId,
      outletId: data.fromOutletId,
      type: "SALE",
      items: data.items.map((item) => {
        const variant = variants.find((v) => v.id === item.variantId)!;
        return {
          variantId: item.variantId,
          locationId: warehouseId || data.fromOutletId,
          locationType: warehouseId ? "WAREHOUSE" : "OUTLET",
          quantityChange: -(
            item.quantity * (variant.product.conversionRatio || 1)
          ),
          allowNegative,
        };
      }),
    });

    // 3. Accounting Entries
    const entries = [
      { accountId: salesAcc.id, credit: totalTaxable },
      { accountId: debtorAcc.id, debit: grandTotal },
    ];

    if (totalCgst > 0 && outputCgstAcc)
      entries.push({ accountId: outputCgstAcc.id, credit: totalCgst });
    if (totalSgst > 0 && outputSgstAcc)
      entries.push({ accountId: outputSgstAcc.id, credit: totalSgst });
    if (totalIgst > 0 && outputIgstAcc)
      entries.push({ accountId: outputIgstAcc.id, credit: totalIgst });

    if (freightCost > 0) {
      const salesEntry = entries.find((e) => e.accountId === salesAcc.id);
      if (salesEntry) {
        salesEntry.credit = roundToTwo((salesEntry.credit || 0) + freightCost);
      }
    }

    await AccountingService.postJournalEntry(tx, {
      transactionId: invoice.id,
      partyId: data.partyId,
      entries,
    });

    revalidatePath("/dashboard/sales/invoices");
    return invoice;
  });
}

export async function getSalesInvoices(outletId: string, limit = 50) {
  // Optimization: Limit to recent invoices and select only required fields
  return await prisma.transaction.findMany({
    where: {
      type: "SALES_INVOICE",
      outletId: outletId,
    },
    take: limit,
    include: {
      party: {
        select: {
          id: true,
          name: true,
          gstin: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });
}
