"use server";

import { prisma } from "@/lib/prisma";
import {
  StockService,
  FIFOAllocationResult,
} from "@/domains/inventory/stock-service";
import { AccountingService } from "@/domains/accounting/ledger-service";
import { roundToTwo } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { withErrorHandler } from "@/lib/error-handler";
import { ValidationError, NotFoundError } from "@/lib/exceptions";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { parsePaginationParams, calculatePagination } from "@/lib/pagination";
import { PaginatedResult, BasePaginationParams } from "@/types/pagination";

export async function createSalesInvoice(data: {
  billType: "NO1" | "NO2";
  txnNumber: string;
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
  headerDiscount?: number;
  freightCost?: number;
  remarks?: string;
  buyerName?: string;
  buyerPhone?: string;
}) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(data.fromOutletId);
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
      accounts = await prisma.gLAccount.findMany({
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

    // Get default warehouse, fallback to first if no default set
    const warehouseId =
      outlet.warehouses.find((w) => w.isDefault)?.id ||
      outlet.warehouses[0]?.id;

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
      // 1. Validate and use provided Transaction Number
      // Check for uniqueness within the outlet
      const existing = await tx.transaction.findFirst({
        where: {
          txnNumber: data.txnNumber,
          outletId: data.fromOutletId,
        },
      });
      if (existing) {
        throw new ValidationError(
          `Invoice number "${data.txnNumber}" already exists for this outlet`,
        );
      }
      const txnNumber = data.txnNumber;

      // 1.5. FIFO Pricing Pre-calculation (if enabled)
      const fifoEnabled =
        outlet.batchTrackingEnabled ||
        outlet.inventoryValuationMethod === "FIFO";
      let fifoBreakdowns: FIFOAllocationResult[] = [];
      if (fifoEnabled && warehouseId) {
        // Pre-calculate FIFO allocation for each item (read-only)
        fifoBreakdowns = await Promise.all(
          data.items.map((item) =>
            StockService.peekFIFOAllocation(tx, {
              variantId: item.variantId,
              warehouseId,
              outletId: data.fromOutletId,
              quantity: item.quantity,
            }),
          ),
        );

        // Validate sufficient stock in batches before committing
        const insufficient = fifoBreakdowns.findIndex((r) => r.shortfall > 0);
        if (insufficient !== -1 && !allowNegative) {
          const item = data.items[insufficient];
          throw new ValidationError(
            `Insufficient batch stock for variant ${item.variantId}. Shortfall: ${fifoBreakdowns[insufficient].shortfall} units`,
          );
        }
      }

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
            create: data.items.map((item, idx) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              rate:
                fifoEnabled && fifoBreakdowns[idx]
                  ? fifoBreakdowns[idx].weightedAvgCost // FIFO-derived rate
                  : item.rate, // fallback to user rate
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
      revalidatePath("/dashboard/sales/transactions");
      revalidatePath("/dashboard/sales");

      // 6. Return invoice with FIFO breakdown if applicable
      return {
        invoice,
        fifoBreakdown: fifoEnabled
          ? fifoBreakdowns.map((r, i) => ({
              variantId: data.items[i].variantId,
              userRate: data.items[i].rate,
              fifoRate: r.weightedAvgCost,
              quantity: r.totalQty,
              batchesUsed: r.batchesUsed,
            }))
          : null,
      };
    });
  });
}

export async function getSalesInvoices(outletId: string, limit = 50) {
  await validateSessionOutletAccess(outletId);
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

// ─── Get sales invoices with server-side pagination ───────────────────────
export async function getSalesInvoicesPaginated(
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

    const andClauses: any[] = [{ type: "SALES_INVOICE" }, { outletId }];

    if (search) {
      andClauses.push({
        OR: [
          { txnNumber: { contains: search, mode: "insensitive" } },
          { party: { name: { contains: search, mode: "insensitive" } } },
          { buyerName: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (status && status !== "ALL") {
      andClauses.push({ status });
    }

    const where = { AND: andClauses };

    const [total, invoices] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
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
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const pagination = calculatePagination(total, page, limit);

    return {
      data: invoices,
      pagination,
    } as any;
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
          glAccount: { select: { name: true } },
          operationalAccount: { select: { name: true, type: true } },
          creator: { select: { name: true } },
        },
        orderBy: { paymentDate: "asc" },
      },
      user: { select: { id: true, name: true } },
    },
  });
}

export async function updateSalesInvoiceFreightAndRemarks(
  invoiceId: string,
  data: {
    freightCost?: number;
    remarks?: string;
  },
) {
  return withErrorHandler(async () => {
    const invoice = await prisma.transaction.findUnique({
      where: { id: invoiceId },
      select: { outletId: true, status: true },
    });

    if (!invoice) throw new NotFoundError("Invoice not found");
    await validateSessionOutletAccess(invoice.outletId);

    // Only allow updates for DRAFT or POSTED invoices
    if (!["DRAFT", "POSTED"].includes(invoice.status)) {
      throw new ValidationError(
        "Cannot update invoice that is not in DRAFT or POSTED status",
      );
    }

    const updated = await prisma.transaction.update({
      where: { id: invoiceId },
      data: {
        freightCost: data.freightCost ?? undefined,
        remarks: data.remarks ?? undefined,
      },
    });

    revalidatePath("/dashboard/sales/invoices");
    revalidatePath(`/dashboard/sales/invoices/${invoiceId}`);
    revalidatePath("/dashboard/sales/transactions");

    return updated;
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
  headerDiscount?: number;
  freightCost?: number;
  remarks?: string;
  buyerName?: string;
  buyerPhone?: string;
}) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(data.fromOutletId);
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

    // Get default warehouse, fallback to first if no default set
    const warehouseId =
      outlet.warehouses.find((w) => w.isDefault)?.id ||
      outlet.warehouses[0]?.id;
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
      revalidatePath("/dashboard/sales/transactions");
      revalidatePath("/dashboard/sales");
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
    headerDiscount?: number;
    freightCost?: number;
    remarks?: string;
    buyerName?: string;
    buyerPhone?: string;
  },
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(data.fromOutletId);
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
      revalidatePath("/dashboard/sales/transactions");
      revalidatePath("/dashboard/sales");
      return updated;
    });
  });
}

export async function appendItemsToInvoice(
  invoiceId: string,
  data: {
    items: {
      variantId: string;
      quantity: number;
      rate: number;
      taxableValue: number;
      cgst: number;
      sgst: number;
      igst: number;
      hsnCode?: string;
      gstRate?: number;
    }[];
    userId: string;
  },
) {
  return withErrorHandler(async () => {
    // 1. Fetch invoice
    const invoice = await prisma.transaction.findUnique({
      where: { id: invoiceId },
      include: { party: true },
    });

    if (!invoice) throw new NotFoundError("Invoice not found");
    if (!["POSTED", "PARTIALLY_PAID"].includes(invoice.status)) {
      throw new ValidationError(
        `Cannot append items to ${invoice.status} invoice`,
      );
    }

    await validateSessionOutletAccess(invoice.outletId);

    // 2. Fetch outlet & variants
    const [outlet, variants] = await Promise.all([
      prisma.outlet.findUnique({
        where: { id: invoice.outletId },
        include: { warehouses: true },
      }),
      prisma.variant.findMany({
        where: { id: { in: data.items.map((i) => i.variantId) } },
        include: { product: true },
      }),
    ]);

    if (!outlet) throw new NotFoundError("Outlet not found");

    // 3. Compute delta totals
    const deltaTaxable = roundToTwo(
      data.items.reduce((a, b) => a + b.taxableValue, 0),
    );
    const deltaCgst = roundToTwo(
      data.items.reduce((a, b) => a + (b.cgst || 0), 0),
    );
    const deltaSgst = roundToTwo(
      data.items.reduce((a, b) => a + (b.sgst || 0), 0),
    );
    const deltaIgst = roundToTwo(
      data.items.reduce((a, b) => a + (b.igst || 0), 0),
    );
    const deltaTax = roundToTwo(deltaCgst + deltaSgst + deltaIgst);
    const deltaGrandTotal = roundToTwo(deltaTaxable + deltaTax);

    // 4. For NO1: Credit limit check on delta
    if (invoice.billType === "NO1" && invoice.partyId) {
      const party = await prisma.party.findUnique({
        where: { id: invoice.partyId },
      });
      if (party?.creditLimit && party.creditLimit > 0) {
        const currentBalance = await AccountingService.getPartyBalance(
          invoice.partyId,
        );
        const totalOutstanding = currentBalance + deltaGrandTotal;
        if (totalOutstanding > party.creditLimit) {
          throw new ValidationError(
            `Credit limit exceeded. Limit: ₹${party.creditLimit}, New Balance: ₹${totalOutstanding}`,
          );
        }
      }
    }

    const allowNegative =
      outlet.negativeStockPolicy === "WARN" ||
      outlet.negativeStockPolicy === "ALLOW";

    const warehouseId =
      outlet.warehouses.find((w) => w.isDefault)?.id ||
      outlet.warehouses[0]?.id;

    // 5. In transaction
    return await prisma.$transaction(async (tx) => {
      // FIFO pre-calculation if enabled
      const fifoEnabled =
        outlet.batchTrackingEnabled ||
        outlet.inventoryValuationMethod === "FIFO";
      let fifoBreakdowns: FIFOAllocationResult[] = [];
      if (fifoEnabled && warehouseId) {
        fifoBreakdowns = await Promise.all(
          data.items.map((item) =>
            StockService.peekFIFOAllocation(tx, {
              variantId: item.variantId,
              warehouseId,
              outletId: invoice.outletId,
              quantity: item.quantity,
            }),
          ),
        );

        const insufficient = fifoBreakdowns.findIndex((r) => r.shortfall > 0);
        if (insufficient !== -1 && !allowNegative) {
          const item = data.items[insufficient];
          throw new ValidationError(
            `Insufficient batch stock for variant ${item.variantId}. Shortfall: ${fifoBreakdowns[insufficient].shortfall} units`,
          );
        }
      }

      // Create new items
      await tx.transactionItem.createMany({
        data: data.items.map((item, idx) => ({
          transactionId: invoiceId,
          variantId: item.variantId,
          quantity: item.quantity,
          rate:
            fifoEnabled && fifoBreakdowns[idx]
              ? fifoBreakdowns[idx].weightedAvgCost
              : item.rate,
          conversionRatio:
            variants.find((v) => v.id === item.variantId)?.product
              .conversionRatio || 1,
          taxableValue: item.taxableValue,
          cgst: item.cgst || 0,
          sgst: item.sgst || 0,
          igst: item.igst || 0,
        })),
      });

      // Update invoice totals
      const updated = await tx.transaction.update({
        where: { id: invoiceId },
        data: {
          totalTaxable: { increment: deltaTaxable },
          totalTax: { increment: deltaTax },
          grandTotal: { increment: deltaGrandTotal },
        },
      });

      // Stock movement for new items
      await StockService.batchUpdateStock(tx, {
        transactionId: invoiceId,
        userId: data.userId,
        outletId: invoice.outletId,
        type: "SALE",
        items: data.items.map((item) => ({
          variantId: item.variantId,
          locationId: warehouseId || invoice.outletId,
          locationType: warehouseId ? "WAREHOUSE" : "OUTLET",
          quantityChange: -item.quantity,
          allowNegative,
        })),
      });

      // Accounting entries for NO1 only
      if (invoice.billType === "NO1" && invoice.partyId) {
        const accountCodes = ["3001", "1003", "2002", "2003", "2004"];
        const accounts = await tx.gLAccount.findMany({
          where: { code: { in: accountCodes }, outletId: invoice.outletId },
        });

        if (
          !accounts.find((a) => a.code === "3001") ||
          !accounts.find((a) => a.code === "1003")
        ) {
          throw new Error(
            "Core accounting labels (Sales/Debtors) missing for this outlet.",
          );
        }

        const salesAcc = accounts.find((a) => a.code === "3001")!;
        const debtorAcc = accounts.find((a) => a.code === "1003")!;
        const outputCgstAcc = accounts.find((a) => a.code === "2002");
        const outputSgstAcc = accounts.find((a) => a.code === "2003");
        const outputIgstAcc = accounts.find((a) => a.code === "2004");

        const entries = [
          { accountId: salesAcc.id, credit: deltaTaxable },
          { accountId: debtorAcc.id, debit: deltaGrandTotal },
        ];

        if (deltaCgst > 0 && outputCgstAcc)
          entries.push({ accountId: outputCgstAcc.id, credit: deltaCgst });
        if (deltaSgst > 0 && outputSgstAcc)
          entries.push({ accountId: outputSgstAcc.id, credit: deltaSgst });
        if (deltaIgst > 0 && outputIgstAcc)
          entries.push({ accountId: outputIgstAcc.id, credit: deltaIgst });

        await AccountingService.postJournalEntry(tx, {
          transactionId: invoiceId,
          partyId: invoice.partyId,
          entries,
        });

        // Increment party outstanding balance
        await tx.party.update({
          where: { id: invoice.partyId },
          data: {
            outstandingBalance: { increment: deltaGrandTotal },
          },
        });
      }

      revalidatePath("/dashboard/sales/invoices");
      revalidatePath("/dashboard/sales/transactions");
      revalidatePath("/dashboard/sales");

      return updated;
    });
  });
}

export async function getSalesReturns(outletId: string, limit = 50) {
  await validateSessionOutletAccess(outletId);
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
