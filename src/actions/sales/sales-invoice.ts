"use server";

import { prisma } from "@/lib/prisma";
import {
  StockService,
  FIFOAllocationResult,
} from "@/domains/inventory/stock-service";
import { roundToTwo } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { withErrorHandler } from "@/lib/error-handler";
import { ValidationError, NotFoundError } from "@/lib/exceptions";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { parsePaginationParams, calculatePagination } from "@/lib/pagination";
import { PaginatedResult, BasePaginationParams } from "@/types/pagination";
import { NumberingService } from "@/domains/foundation/numbering-service";

export async function createSalesInvoice(data: {
  billType: "NO1" | "NO2";
  txnNumber?: string;
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
    serialNumbers?: string[];
    batchNumber?: string | null;
  }[];
  date: Date;
  userId: string;
  headerDiscount?: number;
  freightCost?: number;
  remarks?: string;
  buyerName?: string;
  buyerPhone?: string;
  payments?: {
    paymentMode: any;
    bankAccountId?: string | null;
    amount: number;
    referenceNo?: string | null;
    notes?: string | null;
    chequeNumber?: string | null;
    chequeDate?: string | null;
  }[];
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

    const result = await prisma
      .$transaction(async (tx) => {
        // 0.5 Validate Serial Numbers before anything else
        for (const item of data.items) {
          const variant = variants.find((v) => v.id === item.variantId);
          if (variant?.product.hasSerialNumbers) {
            const sns = item.serialNumbers || [];
            if (sns.length !== item.quantity) {
              throw new ValidationError(
                `Product "${variant.product.name}" requires exactly ${item.quantity} serial number(s). Provided: ${sns.length}.`
              );
            }

            for (const sn of sns) {
              const dbSn = await tx.serialNumber.findFirst({
                where: {
                  serialNumber: { equals: sn.trim(), mode: "insensitive" },
                  variantId: item.variantId,
                  outletId: data.fromOutletId,
                  status: "AVAILABLE",
                },
              });
              if (!dbSn) {
                throw new ValidationError(
                  `Serial number "${sn}" is not available for product "${variant.product.name}" in this outlet.`
                );
              }
            }
          }
        }

        // 1. Resolve Transaction Number (auto-generate if not provided)
        let txnNumber: string;
        if (data.txnNumber) {
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
          txnNumber = data.txnNumber;
        } else {
          const docType = isNo2 ? "CASH_MEMO" : "SALES_INVOICE";

          txnNumber = await NumberingService.getNextNumber(
            prisma, // ← USE GLOBAL PRISMA, NOT TRANSACTION CLIENT
            data.fromOutletId,
            docType,
          );
        }

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

        // 1.8 Calculate payments status
        const totalPaidAmount = data.payments
          ? roundToTwo(data.payments.reduce((sum, p) => sum + (p.amount || 0), 0))
          : 0;
        const initialStatus = totalPaidAmount >= grandTotal - 0.005
          ? "PAID"
          : totalPaidAmount > 0
            ? "PARTIALLY_PAID"
            : "POSTED";
        const paidAt = totalPaidAmount >= grandTotal - 0.005 ? data.date : null;

        // 2. Create Header & Items
        const invoice = await tx.transaction.create({
          data: {
            type: "SALES_INVOICE",
            billType: data.billType,
            txnNumber,
            date: data.date,
            partyId: data.partyId || null,
            isInformal: isNo2,
            buyerName: data.buyerName,
            buyerPhone: data.buyerPhone,
            outletId: data.fromOutletId,
            fromLocationId: warehouseId || data.fromOutletId,
            totalTaxable,
            totalTax,
            freightCost,
            grandTotal,
            status: initialStatus,
            paidAt,
            userId: data.userId,
            remarks: data.remarks,
            items: {
              create: data.items.map((item, idx) => ({
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

        // 2.5 Link Sold Serial Numbers to Transaction Items
        const createdItems = await tx.transactionItem.findMany({
          where: { transactionId: invoice.id },
        });

        for (const item of data.items) {
          const variant = variants.find((v) => v.id === item.variantId);
          if (variant?.product.hasSerialNumbers && item.serialNumbers && item.serialNumbers.length > 0) {
            const grnItem = createdItems.find((ci) => ci.variantId === item.variantId);
            if (grnItem) {
              const months = variant.product.warrantyMonths || 0;
              let expiry = null;
              if (months > 0) {
                expiry = new Date(data.date);
                expiry.setMonth(expiry.getMonth() + months);
              }

              for (const sn of item.serialNumbers) {
                const dbSn = await tx.serialNumber.findFirst({
                  where: {
                    serialNumber: { equals: sn.trim(), mode: "insensitive" },
                    variantId: item.variantId,
                    outletId: data.fromOutletId,
                    status: "AVAILABLE",
                  },
                });
                if (dbSn) {
                  await tx.serialNumber.update({
                    where: { id: dbSn.id },
                    data: {
                      status: "SOLD",
                      saleItemId: grnItem.id,
                      warrantyExpiry: expiry,
                    },
                  });
                }
              }
            }
          }
        }

        try {
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
                batchNumber: item.batchNumber,
              };
            }),
          });
        } catch (stockError) {
          throw stockError;
        }

        // 3b. Create Ledger Entries for Sales Invoice
        // Get standard GL accounts for this outlet
        const debtorAcc = await tx.account.findUnique({
          where: {
            code_outletId: { code: "1003", outletId: data.fromOutletId },
          },
        });
        const salesAcc = await tx.account.findUnique({
          where: {
            code_outletId: { code: "3001", outletId: data.fromOutletId },
          },
        });
        const cgstAcc = await tx.account.findUnique({
          where: {
            code_outletId: { code: "2002", outletId: data.fromOutletId },
          },
        });
        const sgstAcc = await tx.account.findUnique({
          where: {
            code_outletId: { code: "2003", outletId: data.fromOutletId },
          },
        });
        const igstAcc = await tx.account.findUnique({
          where: {
            code_outletId: { code: "2004", outletId: data.fromOutletId },
          },
        });

        const ledgerEntries: {
          accountId: string;
          partyId: string | null;
          transactionId: string;
          date: Date;
          debit: number;
          credit: number;
          reference: string;
        }[] = [];

        // Dr. Sundry Debtors (Customer) - total amount payable by customer
        if (debtorAcc) {
          ledgerEntries.push({
            accountId: debtorAcc.id,
            partyId: data.partyId || null,
            transactionId: invoice.id,
            date: data.date,
            debit: grandTotal,
            credit: 0,
            reference: `Invoice ${txnNumber}`,
          });
        }

        // Cr. Sales Account - taxable amount + freight (balances the Debtors debit)
        if (salesAcc) {
          ledgerEntries.push({
            accountId: salesAcc.id,
            partyId: null,
            transactionId: invoice.id,
            date: data.date,
            debit: 0,
            credit: roundToTwo(totalTaxable + freightCost),
            reference: `Invoice ${txnNumber}`,
          });
        }

        // Cr. Output CGST
        if (cgstAcc && totalCgst > 0) {
          ledgerEntries.push({
            accountId: cgstAcc.id,
            partyId: null,
            transactionId: invoice.id,
            date: data.date,
            debit: 0,
            credit: totalCgst,
            reference: `CGST on Invoice ${txnNumber}`,
          });
        }

        // Cr. Output SGST
        if (sgstAcc && totalSgst > 0) {
          ledgerEntries.push({
            accountId: sgstAcc.id,
            partyId: null,
            transactionId: invoice.id,
            date: data.date,
            debit: 0,
            credit: totalSgst,
            reference: `SGST on Invoice ${txnNumber}`,
          });
        }

        // Cr. Output IGST
        if (igstAcc && totalIgst > 0) {
          ledgerEntries.push({
            accountId: igstAcc.id,
            partyId: null,
            transactionId: invoice.id,
            date: data.date,
            debit: 0,
            credit: totalIgst,
            reference: `IGST on Invoice ${txnNumber}`,
          });
        }

        if (ledgerEntries.length > 0) {
          try {
            await tx.ledgerEntry.createMany({ data: ledgerEntries });
          } catch (ledgerError) {
            throw ledgerError;
          }
        }

        // 4. Update party outstanding balance (for any bill type with a party)
        if (data.partyId) {
          try {
            await tx.party.update({
              where: { id: data.partyId },
              data: { outstandingBalance: { increment: grandTotal } },
            });

            if (totalPaidAmount > 0) {
              const amountAppliedToOutstanding = Math.min(totalPaidAmount, grandTotal);
              const overpayment = roundToTwo(totalPaidAmount - amountAppliedToOutstanding);

              if (overpayment > 0.005) {
                await tx.party.update({
                  where: { id: data.partyId },
                  data: { creditBalance: { increment: overpayment } },
                });
              }

              await tx.party.update({
                where: { id: data.partyId },
                data: { outstandingBalance: { decrement: amountAppliedToOutstanding } },
              });

              // Guard: Ensure outstanding never goes negative
              const updatedParty = await tx.party.findUnique({
                where: { id: data.partyId },
                select: { outstandingBalance: true },
              });
              if (updatedParty && updatedParty.outstandingBalance < -0.005) {
                await tx.party.update({
                  where: { id: data.partyId },
                  data: { outstandingBalance: 0 },
                });
              }
            }
          } catch (partyError) {
            throw partyError;
          }
        }

        // 4.5 Record any payments, ledger entries, and update account balances
        if (data.payments && data.payments.length > 0 && data.partyId) {
          for (const p of data.payments) {
            if (p.amount <= 0) continue;

            const payTxnNumber = await NumberingService.getNextNumber(
              tx,
              data.fromOutletId,
              "RECEIPT",
            );

            // Create Payment Record
            await tx.payment.create({
              data: {
                txnNumber: payTxnNumber,
                invoiceId: invoice.id,
                outletId: data.fromOutletId,
                partyId: data.partyId,
                amount: p.amount,
                paymentDate: data.date,
                paymentMode: p.paymentMode,
                accountId: p.bankAccountId || null,
                referenceNo: p.referenceNo || null,
                notes: p.notes || null,
                createdBy: data.userId,
              },
            });

            // Ledger Entries: Dr. Cash/Bank, Cr. Sundry Debtors
            const debtorGL = await tx.account.findUnique({
              where: { code_outletId: { code: "1003", outletId: data.fromOutletId } },
            });

            let cashBankGL = await tx.account.findUnique({
              where: { code_outletId: { code: "1001", outletId: data.fromOutletId } }, // Cash default
            });

            if (p.bankAccountId) {
              const account = await tx.account.findUnique({
                where: { id: p.bankAccountId },
              });
              if (account) {
                cashBankGL = await tx.account.findUnique({
                  where: { code_outletId: { code: "1002", outletId: data.fromOutletId } }, // Bank default
                });
              }
            }

            if (debtorGL && cashBankGL) {
              await tx.ledgerEntry.createMany({
                data: [
                  {
                    transactionId: invoice.id,
                    accountId: cashBankGL.id,
                    partyId: data.partyId,
                    date: data.date,
                    debit: p.amount,
                    credit: 0,
                    reference: `Receipt ${payTxnNumber} for Invoice ${txnNumber}`,
                  },
                  {
                    transactionId: invoice.id,
                    accountId: debtorGL.id,
                    partyId: data.partyId,
                    date: data.date,
                    debit: 0,
                    credit: p.amount,
                    reference: `Receipt ${payTxnNumber} for Invoice ${txnNumber}`,
                  },
                ],
              });
            }

            // Update Account balance if bankAccountId is provided
            if (p.bankAccountId) {
              const account = await tx.account.findUnique({
                where: { id: p.bankAccountId },
                select: { currentBalance: true },
              });

              if (account) {
                const newBalance = roundToTwo(account.currentBalance + p.amount);

                await tx.accountTransaction.create({
                  data: {
                    accountId: p.bankAccountId,
                    type: "IN",
                    amount: p.amount,
                    paymentMode: p.paymentMode as any,
                    chequeNumber: p.chequeNumber || null,
                    chequeDate: p.chequeDate ? new Date(p.chequeDate) : null,
                    upiReferenceId: p.referenceNo || null,
                    balanceAfter: newBalance,
                    linkedTxnId: invoice.id,
                    linkedTxnType: "INVOICE_PAYMENT",
                    remarks: `Payment for invoice ${txnNumber}`,
                    userId: data.userId,
                  },
                });

                await tx.account.update({
                  where: { id: p.bankAccountId },
                  data: { currentBalance: newBalance },
                });
              }
            }
          }
        }

        revalidatePath("/dashboard/sales/invoices");
        revalidatePath("/dashboard/sales/transactions");
        revalidatePath("/dashboard/sales");
        revalidatePath("/dashboard/financials/ledger");

        // 5. Return invoice with FIFO breakdown if applicable

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
      })
      .catch((txError) => {
        throw txError;
      });

    const docType = data.billType === "NO2" ? "CASH_MEMO" : "SALES_INVOICE";
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const financialYear =
      month >= 3
        ? `${year}-${(year + 1).toString().slice(-2)}`
        : `${year - 1}-${year.toString().slice(-2)}`;

    const docSeries = await prisma.documentSeries.findUnique({
      where: {
        type_financialYear_outletId: {
          type: docType,
          financialYear,
          outletId: data.fromOutletId,
        },
      },
    });

    if (!docSeries) {
      console.error(
        `❌ [CREATE-SALES-INVOICE] CRITICAL: DocumentSeries NOT FOUND in DB after invoice creation!`,
        {
          type: docType,
          financialYear,
          outletId: data.fromOutletId,
        },
      );
    } else {
      const parts = result.invoice.txnNumber.split("/");
      const invoiceNumberUsed = parseInt(parts[2], 10);
      const currentDbNumber = docSeries.nextNumber;
      const expectedNextNumber = invoiceNumberUsed + 1;
    }

    return result;
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
          account: { select: { name: true, type: true } },
          creator: { select: { name: true } },
        },
        orderBy: { paymentDate: "asc" },
      },
      oldBillPayments: {
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
      select: {
        outletId: true,
        status: true,
        partyId: true,
        grandTotal: true,
        totalTaxable: true,
        totalTax: true,
        freightCost: true,
        txnNumber: true,
      },
    });

    if (!invoice) throw new NotFoundError("Invoice not found");
    await validateSessionOutletAccess(invoice.outletId);

    // Only allow updates for DRAFT or POSTED invoices
    if (!["DRAFT", "POSTED"].includes(invoice.status)) {
      throw new ValidationError(
        "Cannot update invoice that is not in DRAFT or POSTED status",
      );
    }

    const newFreightCost = roundToTwo(data.freightCost ?? invoice.freightCost ?? 0);
    const newGrandTotal = roundToTwo(
      (invoice.totalTaxable ?? 0) + (invoice.totalTax ?? 0) + newFreightCost,
    );
    const delta = roundToTwo(newGrandTotal - invoice.grandTotal);
    const isPosted = invoice.status === "POSTED";

    return await prisma.$transaction(async (tx) => {
      // 1. Update the transaction record with new freight and recalculated grandTotal
      const updated = await tx.transaction.update({
        where: { id: invoiceId },
        data: {
          freightCost: newFreightCost,
          grandTotal: newGrandTotal,
          remarks: data.remarks ?? undefined,
        },
      });

      // 2. Update party outstanding only for POSTED invoices with a linked party
      if (isPosted && invoice.partyId && Math.abs(delta) > 0.005) {
        await tx.party.update({
          where: { id: invoice.partyId },
          data: { outstandingBalance: { increment: delta } },
        });

        // Guard: ensure outstanding never goes negative
        const updatedParty = await tx.party.findUnique({
          where: { id: invoice.partyId },
          select: { outstandingBalance: true },
        });
        if (updatedParty && updatedParty.outstandingBalance < -0.005) {
          await tx.party.update({
            where: { id: invoice.partyId },
            data: { outstandingBalance: 0 },
          });
        }
      }

      // 3. Create adjustment ledger entries for POSTED invoices with a meaningful delta
      if (isPosted && Math.abs(delta) > 0.005) {
        const [debtorAcc, salesAcc] = await Promise.all([
          tx.account.findUnique({
            where: { code_outletId: { code: "1003", outletId: invoice.outletId } },
          }),
          tx.account.findUnique({
            where: { code_outletId: { code: "3001", outletId: invoice.outletId } },
          }),
        ]);

        if (debtorAcc && salesAcc) {
          const ref = `Freight adjustment on Invoice ${invoice.txnNumber}`;
          await tx.ledgerEntry.createMany({
            data: [
              // Dr. Debtors if freight increased, Cr. Debtors if freight decreased
              {
                transactionId: invoiceId,
                accountId: debtorAcc.id,
                partyId: invoice.partyId,
                date: new Date(),
                debit: delta > 0 ? delta : 0,
                credit: delta < 0 ? Math.abs(delta) : 0,
                reference: ref,
              },
              // Cr. Sales if freight increased, Dr. Sales if freight decreased
              {
                transactionId: invoiceId,
                accountId: salesAcc.id,
                partyId: null,
                date: new Date(),
                debit: delta < 0 ? Math.abs(delta) : 0,
                credit: delta > 0 ? delta : 0,
                reference: ref,
              },
            ],
          });
        }
      }

      revalidatePath("/dashboard/sales/invoices");
      revalidatePath(`/dashboard/sales/invoices/${invoiceId}`);
      revalidatePath("/dashboard/sales/transactions");
      revalidatePath("/dashboard/financials/ledger");

      return updated;
    });
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
          partyId: data.partyId || null,
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
          partyId: data.partyId || null,
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
