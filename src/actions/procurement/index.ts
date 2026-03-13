"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { StockService } from "@/domains/inventory/stock-service";
import { AccountingService } from "@/domains/accounting/ledger-service";
import { AuditService } from "@/domains/audit/audit-service";
import { roundToTwo } from "@/lib/utils";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";

import { PurchaseItemPayload } from "./types";
// DO NOT export types from "use server" files.

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
          unit: item.unit,
          conversionRatio: item.conversionRatio || 1,
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

  revalidatePath("/dashboard/purchases");
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
    // 1. Build the item payloads for transaction creation
    const itemsData = data.items.map((item) => {
      const poItem = po.items.find((pi) => pi.variantId === item.variantId);
      return {
        variantId: item.variantId,
        quantity: item.quantityReceived,
        unit: poItem?.unit,
        conversionRatio: poItem?.conversionRatio || 1,
        rate: poItem?.rate || 0,
        taxableValue: roundToTwo((poItem?.rate || 0) * item.quantityReceived),
      };
    });

    // 2. Create GRN Transaction record
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
          create: itemsData,
        },
      },
    });

    // 3. Update physical stock for each item (Convert to Base Unit)
    for (const item of itemsData) {
      const baseQuantity = item.quantity * (item.conversionRatio || 1);
      await StockService.moveStock(tx, {
        variantId: item.variantId,
        warehouseId: po.toLocationId!,
        outletId: po.outletId,
        transactionId: grn.id,
        quantity: baseQuantity,
        type: "PURCHASE",
        userId: data.userId,
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
  sourceId: string;
  billNumber: string;
  billDate: Date;
  freightCost?: number;
  userId: string;
}) {
  const source = await prisma.transaction.findUnique({
    where: { id: data.sourceId },
    include: { items: true, party: true },
  });

  if (!source) throw new Error("Source transaction not found");

  return await prisma.$transaction(async (tx) => {
    const totalTaxable = roundToTwo(
      source.items.reduce((a, b) => a + b.taxableValue, 0),
    );
    const totalCgst = roundToTwo(source.items.reduce((a, b) => a + b.cgst, 0));
    const totalSgst = roundToTwo(source.items.reduce((a, b) => a + b.sgst, 0));
    const totalIgst = roundToTwo(source.items.reduce((a, b) => a + b.igst, 0));
    const grandTotal = roundToTwo(
      totalTaxable +
        totalCgst +
        totalSgst +
        totalIgst +
        (data.freightCost || 0),
    );

    // 1. Build Item Payloads with Freight fractions
    const itemsData = source.items.map((item) => {
      const freightFraction =
        data.freightCost && totalTaxable > 0
          ? item.taxableValue / totalTaxable
          : 0;
      return {
        variantId: item.variantId,
        quantity: item.quantity,
        unit: item.unit,
        conversionRatio: item.conversionRatio || 1,
        rate: item.rate,
        taxableValue: item.taxableValue,
        cgst: item.cgst,
        sgst: item.sgst,
        igst: item.igst,
        freightFraction,
      };
    });

    // 2. Create Purchase Bill Transaction
    const bill = await tx.transaction.create({
      data: {
        type: "PURCHASE_BILL",
        txnNumber: data.billNumber,
        date: data.billDate,
        parentId: data.sourceId,
        partyId: source.partyId,
        outletId: source.outletId,
        toLocationId: source.toLocationId,
        status: "POSTED",
        freightCost: data.freightCost,
        userId: data.userId,
        items: {
          create: itemsData,
        },
      },
    });

    // 3. Automated Accounting Entries
    const purchaseAcc = await tx.account.findUnique({
      where: { code_outletId: { code: "4001", outletId: source.outletId } },
    });
    const inputCgstAcc = await tx.account.findUnique({
      where: { code_outletId: { code: "1005", outletId: source.outletId } },
    });
    const inputSgstAcc = await tx.account.findUnique({
      where: { code_outletId: { code: "1006", outletId: source.outletId } },
    });
    const inputIgstAcc = await tx.account.findUnique({
      where: { code_outletId: { code: "1007", outletId: source.outletId } },
    });
    const creditorAcc = await tx.account.findUnique({
      where: { code_outletId: { code: "2001", outletId: source.outletId } },
    });
    const freightAcc = await tx.account.findUnique({
      where: { code_outletId: { code: "4002", outletId: source.outletId } },
    });

    if (!purchaseAcc || !creditorAcc)
      throw new Error("Mapped system accounts not found. Run COA setup.");

    const entries = [
      { accountId: purchaseAcc.id, debit: totalTaxable },
      { accountId: creditorAcc.id, credit: grandTotal },
    ];

    if (totalCgst > 0 && inputCgstAcc)
      entries.push({ accountId: inputCgstAcc.id, debit: totalCgst });
    if (totalSgst > 0 && inputSgstAcc)
      entries.push({ accountId: inputSgstAcc.id, debit: totalSgst });
    if (totalIgst > 0 && inputIgstAcc)
      entries.push({ accountId: inputIgstAcc.id, debit: totalIgst });
    if (data.freightCost && data.freightCost > 0 && freightAcc) {
      entries.push({ accountId: freightAcc.id, debit: data.freightCost });
    }

    await AccountingService.postJournalEntry(tx, {
      transactionId: bill.id,
      partyId: source.partyId!,
      entries,
    });

    // 4. Update parent transaction status to COMPLETED
    await tx.transaction.update({
      where: { id: data.sourceId },
      data: { status: "COMPLETED" },
    });

    await AuditService.log({
      action: "CREATE",
      entity: "PURCHASE_BILL",
      entityId: bill.id,
      userId: data.userId,
      newValues: { total: grandTotal, freight: data.freightCost },
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
    // 1. Build the item payloads for transaction creation
    const itemsData = data.items.map((item) => {
      const billItem = bill.items.find((bi) => bi.variantId === item.variantId);
      return {
        variantId: item.variantId,
        quantity: item.quantity,
        unit: billItem?.unit,
        conversionRatio: billItem?.conversionRatio || 1,
        rate: billItem?.rate || 0,
        taxableValue: roundToTwo((billItem?.rate || 0) * item.quantity),
      };
    });

    // 2. Create Debit Note Transaction
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
          create: itemsData,
        },
      },
    });

    // 3. Reduce stock for returned items (Convert to Base Unit)
    for (const item of itemsData) {
      const baseQuantity = -item.quantity * (item.conversionRatio || 1);
      await StockService.moveStock(tx, {
        variantId: item.variantId,
        warehouseId: bill.toLocationId!,
        outletId: bill.outletId,
        transactionId: dn.id,
        quantity: baseQuantity,
        type: "ADJUSTMENT_DEC",
        userId: data.userId,
      });
    }

    return dn;
  });

  revalidatePath("/dashboard/inventory/current-stock");
}

export async function acceptPurchaseOrder(
  poId: string,
  outletId: string,
  userId: string,
) {
  // Validate outlet access
  await validateSessionOutletAccess(outletId);

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch PO and items
    const po = await tx.transaction.findUnique({
      where: { id: poId },
      include: { items: true },
    });

    if (!po) throw new Error("Purchase Order not found");
    if (po.outletId !== outletId)
      throw new Error("Unauthorized: PO does not belong to this outlet");
    if (po.status === "ACCEPTED" || po.status === "COMPLETED") {
      throw new Error("Order has already been processed");
    }

    // 2. Update Stock for each item (Convert to Base Unit)
    for (const item of po.items) {
      const baseQuantity = item.quantity * (item.conversionRatio || 1);
      await StockService.moveStock(tx, {
        variantId: item.variantId,
        warehouseId: po.toLocationId!, // POs have a destination warehouse
        outletId,
        transactionId: po.id,
        quantity: baseQuantity,
        type: "PURCHASE",
        userId,
        costPerUnit: item.rate, // Used for batch logic if enabled
      });
    }

    // 3. Update PO status
    const updatedPo = await tx.transaction.update({
      where: { id: poId },
      data: { status: "ACCEPTED" },
    });

    // 4. Log in Audit Trail
    await AuditService.log({
      action: "UPDATE",
      entity: "PURCHASE_ORDER",
      entityId: poId,
      userId,
      newValues: { status: "ACCEPTED", stockUpdated: true },
    });

    return updatedPo;
  });

  revalidatePath("/dashboard/purchases");
  revalidatePath("/dashboard/inventory");
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
