"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { StockService } from "@/domains/inventory/stock-service";
import { AccountingService } from "@/domains/accounting/ledger-service";
import { AuditService } from "@/domains/audit/audit-service";
import { roundToTwo } from "@/lib/utils";

export type PurchaseItemPayload = {
  variantId: string;
  quantity: number;
  rate: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
};

export async function createPurchaseOrder(data: {
  partyId: string;
  toLocationId: string; // Warehouse where goods will arrive
  items: PurchaseItemPayload[];
}) {
  const { items, ...poData } = data;

  // Calculate totals
  const totalTaxable = roundToTwo(
    items.reduce((sum, item) => sum + item.taxableValue, 0),
  );
  const totalTax = roundToTwo(
    items.reduce((sum, item) => sum + item.cgst + item.sgst + item.igst, 0),
  );
  const grandTotal = roundToTwo(totalTaxable + totalTax);

  const po = await prisma.transaction.create({
    data: {
      type: "PURCHASE_ORDER",
      txnNumber: `PO-${Date.now()}`,
      partyId: data.partyId,
      toLocationId: data.toLocationId,
      totalTaxable,
      totalTax,
      grandTotal,
      status: "POSTED",
      items: {
        create: items.map((item) => ({
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

  await AuditService.log({
    action: "CREATE",
    entity: "PURCHASE_ORDER",
    entityId: po.id,
    newValues: poData,
  });

  revalidatePath("/dashboard/purchases/orders");
  return po;
}

export async function createGRN(data: {
  poId: string;
  items: { variantId: string; quantityReceived: number }[];
}) {
  const po = await prisma.transaction.findUnique({
    where: { id: data.poId },
    include: { items: true },
  });

  if (!po) throw new Error("Purchase Order not found");

  return await prisma.$transaction(async (tx) => {
    // 1. Create GRN Transaction record
    const grn = await tx.transaction.create({
      data: {
        type: "GRN",
        txnNumber: `GRN-${Date.now()}`,
        parentId: data.poId,
        partyId: po.partyId,
        toLocationId: po.toLocationId,
        status: "POSTED",
        items: {
          create: data.items.map((item) => {
            const poItem = po.items.find(
              (pi) => pi.variantId === item.variantId,
            );
            return {
              variantId: item.variantId,
              quantity: item.quantityReceived,
              rate: poItem?.rate || 0,
              taxableValue: roundToTwo(
                (poItem?.rate || 0) * item.quantityReceived,
              ),
            };
          }),
        },
      },
    });

    // 2. Update physical stock for each item
    for (const item of data.items) {
      await StockService.updateStock(tx, {
        variantId: item.variantId,
        locationId: po.toLocationId!,
        locationType: "WAREHOUSE",
        quantityChange: item.quantityReceived,
      });
    }

    return grn;
  });

  revalidatePath("/dashboard/inventory/current-stock");
  revalidatePath("/dashboard/purchases/grn");
}

export async function getPurchaseOrders() {
  return await prisma.transaction.findMany({
    where: { type: "PURCHASE_ORDER" },
    include: {
      party: true,
      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
    },
    orderBy: { date: "desc" },
  });
}

export async function getPurchaseOrderById(id: string) {
  return await prisma.transaction.findUnique({
    where: { id },
    include: {
      party: true,
      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });
}

export async function createPurchaseBill(data: {
  grnId: string;
  billNumber: string;
  billDate: Date;
  freightCost?: number;
}) {
  const grn = await prisma.transaction.findUnique({
    where: { id: data.grnId },
    include: { items: true, party: true },
  });

  if (!grn) throw new Error("GRN not found");

  return await prisma.$transaction(async (tx) => {
    const bill = await tx.transaction.create({
      data: {
        type: "PURCHASE_BILL",
        txnNumber: data.billNumber,
        date: data.billDate,
        parentId: data.grnId,
        partyId: grn.partyId,
        toLocationId: grn.toLocationId,
        status: "POSTED",
        freightCost: data.freightCost,
        items: {
          create: grn.items.map((item) => ({
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

    // 2. Automated Accounting Entries
    const purchaseAcc = await tx.account.findUnique({
      where: { code: "4001" },
    });
    const inputCgstAcc = await tx.account.findUnique({
      where: { code: "1005" },
    });
    const inputSgstAcc = await tx.account.findUnique({
      where: { code: "1006" },
    });
    const creditorAcc = await tx.account.findUnique({
      where: { code: "2001" },
    });
    const freightAcc = await tx.account.findUnique({
      where: { code: "4002" },
    });

    if (!purchaseAcc || !creditorAcc)
      throw new Error("Mapped system accounts not found. Run COA setup.");

    const totalTaxable = roundToTwo(
      grn.items.reduce((a, b) => a + b.taxableValue, 0),
    );
    const totalCgst = roundToTwo(grn.items.reduce((a, b) => a + b.cgst, 0));
    const totalSgst = roundToTwo(grn.items.reduce((a, b) => a + b.sgst, 0));
    const grandTotal = roundToTwo(
      totalTaxable + totalCgst + totalSgst + (data.freightCost || 0),
    );

    const entries = [
      { accountId: purchaseAcc.id, debit: totalTaxable },
      { accountId: creditorAcc.id, credit: grandTotal },
    ];

    if (totalCgst > 0 && inputCgstAcc)
      entries.push({ accountId: inputCgstAcc.id, debit: totalCgst });
    if (totalSgst > 0 && inputSgstAcc)
      entries.push({ accountId: inputSgstAcc.id, debit: totalSgst });
    if (data.freightCost && data.freightCost > 0 && freightAcc) {
      entries.push({ accountId: freightAcc.id, debit: data.freightCost });
    }

    await AccountingService.postJournalEntry(tx, {
      transactionId: bill.id,
      partyId: grn.partyId!,
      entries,
    });

    await AuditService.log({
      action: "CREATE",
      entity: "PURCHASE_BILL",
      entityId: bill.id,
      newValues: { txnNumber: data.billNumber },
    });

    return bill;
  });

  revalidatePath("/dashboard/purchases/bills");
}

export async function getGRNs() {
  return await prisma.transaction.findMany({
    where: { type: "GRN" },
    include: {
      party: true,
      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
    },
    orderBy: { date: "desc" },
  });
}

export async function createDebitNote(data: {
  billId: string;
  items: { variantId: string; quantity: number }[];
  reason: string;
}) {
  const bill = await prisma.transaction.findUnique({
    where: { id: data.billId },
    include: { items: true, party: true },
  });

  if (!bill) throw new Error("Bill not found");

  return await prisma.$transaction(async (tx) => {
    // 1. Create Debit Note Transaction
    const dn = await tx.transaction.create({
      data: {
        type: "DEBIT_NOTE",
        txnNumber: `DN-${Date.now()}`,
        parentId: data.billId,
        partyId: bill.partyId,
        toLocationId: bill.toLocationId,
        status: "POSTED",
        items: {
          create: data.items.map((item) => {
            const billItem = bill.items.find(
              (bi) => bi.variantId === item.variantId,
            );
            return {
              variantId: item.variantId,
              quantity: item.quantity,
              rate: billItem?.rate || 0,
              taxableValue: roundToTwo((billItem?.rate || 0) * item.quantity),
            };
          }),
        },
      },
    });

    // 2. Reduce stock for returned items
    for (const item of data.items) {
      await StockService.updateStock(tx, {
        variantId: item.variantId,
        locationId: bill.toLocationId!,
        locationType: "WAREHOUSE",
        quantityChange: -item.quantity,
      });
    }

    return dn;
  });

  revalidatePath("/dashboard/inventory/current-stock");
}

export async function getBills() {
  return await prisma.transaction.findMany({
    where: { type: "PURCHASE_BILL" },
    include: {
      party: true,
      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
    },
    orderBy: { date: "desc" },
  });
}
