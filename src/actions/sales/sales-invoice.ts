"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { StockService } from "@/domains/inventory/stock-service";
import { AccountingService } from "@/domains/accounting/ledger-service";

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
}) {
  const outlet = await prisma.outlet.findUnique({
    where: { id: data.fromOutletId },
  });

  if (!outlet) throw new Error("Outlet not found");

  const allowNegative =
    outlet.negativeStockPolicy === "WARN" ||
    outlet.negativeStockPolicy === "ALLOW";

  return await prisma.$transaction(async (tx) => {
    // 1. Create Sales Invoice Transaction
    const invoice = await tx.transaction.create({
      data: {
        type: "SALES_INVOICE",
        txnNumber: `INV-${Date.now()}`, // Realistically should use outlet prefix
        date: data.date,
        partyId: data.partyId,
        fromLocationId: data.fromOutletId,
        status: "POSTED",
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

    // 2. Update Stock (Respecting Policy)
    for (const item of data.items) {
      await StockService.updateStock(tx, {
        variantId: item.variantId,
        locationId: data.fromOutletId,
        locationType: "OUTLET",
        quantityChange: -item.quantity,
        allowNegative,
      });
    }

    // 3. Accounting Entries
    const salesAcc = await tx.account.findUnique({ where: { code: "3001" } });
    const debtorAcc = await tx.account.findUnique({ where: { code: "1003" } });
    const outputCgstAcc = await tx.account.findUnique({
      where: { code: "2002" },
    });
    const outputSgstAcc = await tx.account.findUnique({
      where: { code: "2003" },
    });

    if (!salesAcc || !debtorAcc)
      throw new Error("Required accounts not found. Run COA setup.");

    const totalTaxable = data.items.reduce((a, b) => a + b.taxableValue, 0);
    const totalCgst = data.items.reduce((a, b) => a + b.cgst, 0);
    const totalSgst = data.items.reduce((a, b) => a + b.sgst, 0);
    const grandTotal = totalTaxable + totalCgst + totalSgst;

    const entries = [
      { accountId: salesAcc.id, credit: totalTaxable },
      { accountId: debtorAcc.id, debit: grandTotal },
    ];

    if (totalCgst > 0 && outputCgstAcc)
      entries.push({ accountId: outputCgstAcc.id, credit: totalCgst });
    if (totalSgst > 0 && outputSgstAcc)
      entries.push({ accountId: outputSgstAcc.id, credit: totalSgst });

    await AccountingService.postJournalEntry(tx, {
      transactionId: invoice.id,
      partyId: data.partyId,
      entries,
    });

    return invoice;
  });

  revalidatePath("/dashboard/sales/invoices");
  revalidatePath("/dashboard/inventory/current-stock");
}

export async function getSalesInvoices() {
  return await prisma.transaction.findMany({
    where: { type: "SALES_INVOICE" },
    include: {
      party: true,
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
    },
    orderBy: { date: "desc" },
  });
}
