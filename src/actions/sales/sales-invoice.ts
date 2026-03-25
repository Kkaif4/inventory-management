"use server";

import { prisma } from "@/lib/prisma";
import { StockService } from "@/domains/inventory/stock-service";
import { AccountingService } from "@/domains/accounting/ledger-service";
import { roundToTwo } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { NumberingService } from "@/domains/foundation/numbering-service";
import { withErrorHandler } from "@/lib/error-handler";
import { ValidationError, NotFoundError } from "@/lib/exceptions";

export async function createSalesInvoice(data: {
  billType: "NO1" | "NO2";
  partyId?: string;
  fromOutletId: string;
  items: {
    variantId: string;
    quantity: number;
    rate: number;
    discountPercent?: number;
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    hsnCode?: string;
    gstRate?: number;
  }[];
  date: Date;
  userId: string;
  freightCost?: number;
  remarks?: string;
  buyerName?: string;
  buyerPhone?: string;
}) {
  return withErrorHandler(async () => {
    const isNo2 = data.billType === "NO2";

    // 1. Fetch metadata & check permissions
    const [outlet, variants] = await Promise.all([
      prisma.outlet.findUnique({
        where: { id: data.fromOutletId },
        include: { warehouses: true },
      }),
      prisma.variant.findMany({
        where: { id: { in: data.items.map((i) => i.variantId) } },
        include: { product: true },
      }),
    ]);

    if (!outlet) throw new NotFoundError("Outlet not found");
    if (isNo2 && !outlet.allowRawCashBills) {
      throw new ValidationError(
        "Raw Cash Bills are not enabled for this outlet.",
      );
    }

    // 2. Prep Accounting Accounts (Only for NO1)
    let accounts: any[] = [];
    if (!isNo2) {
      const accountCodes = ["3001", "1003", "2002", "2003", "2004"];
      accounts = await prisma.account.findMany({
        where: { code: { in: accountCodes }, outletId: data.fromOutletId },
      });
      if (
        !accounts.find((a) => a.code === "3001") ||
        !accounts.find((a) => a.code === "1003")
      ) {
        throw new Error(
          "Core accounting labels (Sales/Debtors) missing for this outlet.",
        );
      }
    }

    const allowNegative =
      outlet.negativeStockPolicy === "WARN" ||
      outlet.negativeStockPolicy === "ALLOW";

    const totalTaxable = roundToTwo(
      data.items.reduce((a, b) => a + b.taxableValue, 0),
    );
    const totalCgst = roundToTwo(
      data.items.reduce((a, b) => a + (b.cgst || 0), 0),
    );
    const totalSgst = roundToTwo(
      data.items.reduce((a, b) => a + (b.sgst || 0), 0),
    );
    const totalIgst = roundToTwo(
      data.items.reduce((a, b) => a + (b.igst || 0), 0),
    );
    const totalTax = roundToTwo(totalCgst + totalSgst + totalIgst);
    const freightCost = data.freightCost || 0;
    const grandTotal = roundToTwo(totalTaxable + totalTax + freightCost);

    const warehouseId = outlet.warehouses[0]?.id;

    // 3. Credit Limit Check (Strictly NO1)
    if (!isNo2 && data.partyId) {
      const party = await prisma.party.findUnique({
        where: { id: data.partyId },
      });
      if (party?.creditLimit && party.creditLimit > 0) {
        const currentBalance = await AccountingService.getPartyBalance(
          data.partyId,
        );
        if (currentBalance + grandTotal > party.creditLimit) {
          throw new ValidationError(
            `Credit limit exceeded. Limit: ₹${party.creditLimit}, New Balance: ₹${currentBalance + grandTotal}`,
          );
        }
      }
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Generate Transaction Number (CM vs INV)
      const txnNumber = await NumberingService.getNextNumber(
        tx,
        data.fromOutletId,
        isNo2 ? "CASH_MEMO" : "SALES_INVOICE",
      );

      // 2. Create Header & Items
      const invoice = await tx.transaction.create({
        data: {
          type: "SALES_INVOICE",
          billType: data.billType,
          txnNumber,
          date: data.date,
          partyId: isNo2 ? null : data.partyId,
          isInformal: isNo2,
          buyerName: data.buyerName,
          buyerPhone: data.buyerPhone,
          outletId: data.fromOutletId,
          fromLocationId: warehouseId || data.fromOutletId,
          totalTaxable,
          totalTax,
          freightCost,
          grandTotal,
          status: "POSTED",
          userId: data.userId,
          remarks: data.remarks,
          items: {
            create: data.items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              rate: item.rate,
              conversionRatio:
                variants.find((v) => v.id === item.variantId)?.product
                  .conversionRatio || 1,
              taxableValue: item.taxableValue,
              cgst: item.cgst || 0,
              sgst: item.sgst || 0,
              igst: item.igst || 0,
            })),
          },
        },
      });

      // 3. Stock Update (Constant for both)
      await StockService.batchUpdateStock(tx, {
        transactionId: invoice.id,
        userId: data.userId,
        outletId: data.fromOutletId,
        type: "SALE",
        items: data.items.map((item) => {
          return {
            variantId: item.variantId,
            locationId: warehouseId || data.fromOutletId,
            locationType: warehouseId ? "WAREHOUSE" : "OUTLET",
            quantityChange: -item.quantity,
            allowNegative,
          };
        }),
      });

      // 4. Accounting Entries (Conditional Block - NO1 ONLY)
      if (!isNo2) {
        const salesAcc = accounts.find((a) => a.code === "3001")!;
        const debtorAcc = accounts.find((a) => a.code === "1003")!;
        const outputCgstAcc = accounts.find((a) => a.code === "2002");
        const outputSgstAcc = accounts.find((a) => a.code === "2003");
        const outputIgstAcc = accounts.find((a) => a.code === "2004");

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
          if (salesEntry)
            salesEntry.credit = roundToTwo(
              (salesEntry.credit || 0) + freightCost,
            );
        }

        await AccountingService.postJournalEntry(tx, {
          transactionId: invoice.id,
          partyId: data.partyId!,
          entries,
        });

        // 5. Update Customer Outstanding Balance (increment denormalized cache)
        // Outstanding represents unpaid amount from sales invoices
        await tx.party.update({
          where: { id: data.partyId },
          data: {
            outstandingBalance: {
              increment: grandTotal,
            },
          },
        });
      }

      revalidatePath("/dashboard/sales/invoices");
      return invoice;
    });
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
    select: {
      id: true,
      txnNumber: true,
      date: true,
      grandTotal: true,
      status: true,
      isInformal: true,
      billType: true,
      buyerName: true,
      buyerPhone: true,
      party: {
        select: {
          id: true,
          name: true,
          gstin: true,
        },
      },
      _count: { select: { items: true } },
      payments: { select: { amount: true } },
    },
    orderBy: { date: "desc" },
  });
}

export async function getSalesInvoice(invoiceId: string) {
  return await prisma.transaction.findUnique({
    where: { id: invoiceId },
    include: {
      party: { select: { id: true, name: true, gstin: true, state: true } },
      outlet: {
        select: {
          id: true,
          name: true,
          state: true,
          address: true,
          gstin: true,
          bankDetails: true,
        },
      },
      items: {
        include: {
          variant: {
            include: {
              product: { select: { name: true, hsnCode: true, gstRate: true } },
            },
          },
        },
      },
      payments: {
        select: {
          id: true,
          txnNumber: true,
          paymentDate: true,
          amount: true,
          paymentMode: true,
          referenceNo: true,
          notes: true,
          bankAccount: { select: { name: true } },
          creator: { select: { name: true } },
        },
        orderBy: { paymentDate: "asc" },
      },
      user: { select: { id: true, name: true } },
    },
  });
}

export async function saveSalesInvoiceDraft(data: {
  billType: "NO1" | "NO2";
  partyId?: string;
  fromOutletId: string;
  items: {
    variantId: string;
    quantity: number;
    rate: number;
    discountPercent?: number;
    taxableValue: number;
    cgst?: number;
    sgst?: number;
    igst?: number;
    hsnCode?: string;
    gstRate?: number;
  }[];
  date: Date;
  userId: string;
  freightCost?: number;
  remarks?: string;
  buyerName?: string;
  buyerPhone?: string;
}) {
  return withErrorHandler(async () => {
    const isNo2 = data.billType === "NO2";

    const outlet = await prisma.outlet.findUnique({
      where: { id: data.fromOutletId },
      include: { warehouses: true },
    });

    if (!outlet) throw new NotFoundError("Outlet not found");

    const totalTaxable = roundToTwo(
      data.items.reduce((a, b) => a + b.taxableValue, 0),
    );
    const totalCgst = roundToTwo(
      data.items.reduce((a, b) => a + (b.cgst || 0), 0),
    );
    const totalSgst = roundToTwo(
      data.items.reduce((a, b) => a + (b.sgst || 0), 0),
    );
    const totalIgst = roundToTwo(
      data.items.reduce((a, b) => a + (b.igst || 0), 0),
    );
    const totalTax = roundToTwo(totalCgst + totalSgst + totalIgst);
    const freightCost = data.freightCost || 0;
    const grandTotal = roundToTwo(totalTaxable + totalTax + freightCost);

    const warehouseId = outlet.warehouses[0]?.id;
    const variants = await prisma.variant.findMany({
      where: { id: { in: data.items.map((i) => i.variantId) } },
      include: { product: true },
    });

    return await prisma.$transaction(async (tx) => {
      const draft = await tx.transaction.create({
        data: {
          type: "SALES_INVOICE",
          billType: data.billType,
          txnNumber: `DRAFT-${Date.now()}`, // Temporary draft number
          date: data.date,
          partyId: isNo2 ? null : data.partyId,
          isInformal: isNo2,
          buyerName: data.buyerName,
          buyerPhone: data.buyerPhone,
          outletId: data.fromOutletId,
          fromLocationId: warehouseId || data.fromOutletId,
          totalTaxable,
          totalTax,
          freightCost,
          grandTotal,
          status: "DRAFT",
          userId: data.userId,
          remarks: data.remarks,
          items: {
            create: data.items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              rate: item.rate,
              conversionRatio:
                variants.find((v) => v.id === item.variantId)?.product
                  .conversionRatio || 1,
              taxableValue: item.taxableValue,
              cgst: item.cgst || 0,
              sgst: item.sgst || 0,
              igst: item.igst || 0,
            })),
          },
        },
      });

      revalidatePath("/dashboard/sales/invoices");
      return draft;
    });
  });
}

export async function editSalesInvoice(
  invoiceId: string,
  data: {
    billType: "NO1" | "NO2";
    partyId?: string;
    fromOutletId: string;
    items: {
      variantId: string;
      quantity: number;
      rate: number;
      discountPercent?: number;
      taxableValue: number;
      cgst?: number;
      sgst?: number;
      igst?: number;
      hsnCode?: string;
      gstRate?: number;
    }[];
    date: Date;
    userId: string;
    freightCost?: number;
    remarks?: string;
    buyerName?: string;
    buyerPhone?: string;
  },
) {
  return withErrorHandler(async () => {
    const invoice = await prisma.transaction.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) throw new NotFoundError("Invoice not found");
    if (invoice.status === "POSTED") {
      throw new ValidationError("Cannot edit posted invoices");
    }

    const isNo2 = data.billType === "NO2";
    const outlet = await prisma.outlet.findUnique({
      where: { id: data.fromOutletId },
      include: { warehouses: true },
    });

    if (!outlet) throw new NotFoundError("Outlet not found");

    const totalTaxable = roundToTwo(
      data.items.reduce((a, b) => a + b.taxableValue, 0),
    );
    const totalCgst = roundToTwo(
      data.items.reduce((a, b) => a + (b.cgst || 0), 0),
    );
    const totalSgst = roundToTwo(
      data.items.reduce((a, b) => a + (b.sgst || 0), 0),
    );
    const totalIgst = roundToTwo(
      data.items.reduce((a, b) => a + (b.igst || 0), 0),
    );
    const totalTax = roundToTwo(totalCgst + totalSgst + totalIgst);
    const freightCost = data.freightCost || 0;
    const grandTotal = roundToTwo(totalTaxable + totalTax + freightCost);

    const warehouseId = outlet.warehouses[0]?.id;
    const variants = await prisma.variant.findMany({
      where: { id: { in: data.items.map((i) => i.variantId) } },
      include: { product: true },
    });

    return await prisma.$transaction(async (tx) => {
      // Delete old items
      await tx.transactionItem.deleteMany({
        where: { transactionId: invoiceId },
      });

      // Update invoice
      const updated = await tx.transaction.update({
        where: { id: invoiceId },
        data: {
          billType: data.billType,
          date: data.date,
          partyId: isNo2 ? null : data.partyId,
          isInformal: isNo2,
          buyerName: data.buyerName,
          buyerPhone: data.buyerPhone,
          totalTaxable,
          totalTax,
          freightCost,
          grandTotal,
          remarks: data.remarks,
          items: {
            create: data.items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              rate: item.rate,
              conversionRatio:
                variants.find((v) => v.id === item.variantId)?.product
                  .conversionRatio || 1,
              taxableValue: item.taxableValue,
              cgst: item.cgst || 0,
              sgst: item.sgst || 0,
              igst: item.igst || 0,
            })),
          },
        },
      });

      revalidatePath("/dashboard/sales/invoices");
      return updated;
    });
  });
}

export async function getSalesReturns(outletId: string, limit = 50) {
  return await prisma.transaction.findMany({
    where: {
      type: { in: ["CREDIT_NOTE", "STOCK_RETURN"] } as any,
      outletId,
    },
    take: limit,
    include: {
      party: true,
      items: {
        include: { variant: { include: { product: true } } },
      },
    },
    orderBy: { date: "desc" },
  });
}
