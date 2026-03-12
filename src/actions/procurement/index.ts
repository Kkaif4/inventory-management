"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { StockService } from "@/domains/inventory/stock-service";
import { AccountingService } from "@/domains/accounting/ledger-service";
import { AuditService } from "@/domains/audit/audit-service";
import { roundToTwo } from "@/lib/utils";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";

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
  outletId: string; // Scoping to outlet
  toLocationId: string; // Warehouse where goods will arrive
  items: PurchaseItemPayload[];
  userId: string;
}) {
  // Validate user has access to this outlet
  await validateSessionOutletAccess(data.outletId);

  const { items, userId, ...poData } = data;

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
      outletId: data.outletId, // Scoped
      toLocationId: data.toLocationId,
      totalTaxable,
      totalTax,
      grandTotal,
      status: "POSTED",
      userId: data.userId,
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
    userId: data.userId,
    newValues: poData,
  });

  revalidatePath("/dashboard/purchases/orders");
  return po;
}

export async function createGRN(data: {
  poId: string;
  items: { variantId: string; quantityReceived: number }[];
  userId: string;
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
        outletId: po.outletId, // Inherited from PO
        toLocationId: po.toLocationId,
        status: "POSTED",
        userId: data.userId,
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

export async function getPurchaseOrders(outletId: string) {
  // Validate user has access to this outlet
  await validateSessionOutletAccess(outletId);

  return await prisma.transaction.findMany({
    where: {
      type: "PURCHASE_ORDER",
      outletId: outletId,
    },
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

export async function getPurchaseOrderById(id: string, outletId: string) {
  // Validate user has access to this outlet
  await validateSessionOutletAccess(outletId);

  const po = await prisma.transaction.findUnique({
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

  // Verify PO belongs to requested outlet
  if (po && po.outletId !== outletId) {
    throw new Error("403: Purchase order not found in this outlet");
  }

  return po;
}

export async function createPurchaseBill(data: {
  grnId: string;
  billNumber: string;
  billDate: Date;
  freightCost?: number;
  userId: string;
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
        outletId: grn.outletId, // Inherited from GRN
        toLocationId: grn.toLocationId,
        status: "POSTED",
        freightCost: data.freightCost,
        userId: data.userId,
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
      where: { code_outletId: { code: "4001", outletId: grn.outletId } },
    });
    const inputCgstAcc = await tx.account.findUnique({
      where: { code_outletId: { code: "1005", outletId: grn.outletId } },
    });
    // Wait, let me use the proper compound key throughout
    const inputSgstAcc = await tx.account.findUnique({
      where: { code_outletId: { code: "1006", outletId: grn.outletId } },
    });
    const creditorAcc = await tx.account.findUnique({
      where: { code_outletId: { code: "2001", outletId: grn.outletId } },
    });
    const freightAcc = await tx.account.findUnique({
      where: { code_outletId: { code: "4002", outletId: grn.outletId } },
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
      userId: data.userId,
      newValues: { txnNumber: data.billNumber },
    });

    return bill;
  });

  revalidatePath("/dashboard/purchases/bills");
}

export async function getGRNs(outletId: string) {
  // Validate user has access to this outlet
  await validateSessionOutletAccess(outletId);

  return await prisma.transaction.findMany({
    where: {
      type: "GRN",
      outletId: outletId,
    },
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
  userId: string;
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
        outletId: bill.outletId, // Inherited from Bill
        toLocationId: bill.toLocationId,
        status: "POSTED",
        userId: data.userId,
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

export async function getBills(outletId: string) {
  // Validate user has access to this outlet
  await validateSessionOutletAccess(outletId);

  return await prisma.transaction.findMany({
    where: {
      type: "PURCHASE_BILL",
      outletId: outletId,
    },
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
