"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/error-handler";
import { ValidationError, NotFoundError } from "@/lib/exceptions";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import {
  CustomerFormValues,
  customerSchema,
} from "@/validations/customer.validation";
import { revalidatePath } from "next/cache";
import { roundToTwo } from "@/lib/utils";
import { parsePaginationParams, calculatePagination } from "@/lib/pagination";
import { PaginatedResult, BasePaginationParams } from "@/types/pagination";

// ──── Types ──────────────────────────────────────────────────────────────────
interface CustomerQueryParams extends BasePaginationParams {
  search?: string;
  status?: "ALL" | "ACTIVE" | "INACTIVE";
  typeFilter?: "ALL" | "B2B" | "B2C";
  state?: string | null;
  hasOverdue?: boolean;
}

interface CustomerData {
  id: string;
  name: string;
  isB2B: boolean;
  phone: string | null;
  gstin: string | null;
  state: string;
  creditLimit: number | null;
  outstandingBalance: number;
  overdue: number;
  isActive: boolean;
}

// ─── Get all customers for an outlet with live balances ─────────────────────
export async function getCustomers(outletId: string) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);
    const parties = await prisma.party.findMany({
      where: {
        outletId,
        type: "CUSTOMER", // Strict domain boundary
      },
      include: {
        transactions: {
          where: {
            type: "SALES_INVOICE",
            status: { in: ["POSTED", "PARTIALLY_PAID"] },
          },
          select: {
            id: true,
            grandTotal: true,
            date: true,
            payments: { select: { amount: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const now = new Date();

    return parties.map((party) => {
      let overdue = 0;
      let calculatedOutstanding = 0;

      // Calculate overdue and outstanding from unpaid invoices
      party.transactions.forEach((inv) => {
        const totalPaid = inv.payments.reduce((a, b) => a + b.amount, 0);
        const outstanding = inv.grandTotal - totalPaid;

        if (outstanding > 0.005) {
          calculatedOutstanding += outstanding;
          const dueDate = new Date(inv.date);
          dueDate.setDate(dueDate.getDate() + party.creditPeriod);
          if (now > dueDate) {
            overdue += outstanding;
          }
        }
      });

      return {
        id: party.id,
        name: party.name,
        isB2B: !!party.gstin,
        phone: party.phone || party.contactInfo,
        gstin: party.gstin,
        state: party.state,
        creditLimit: party.creditLimit,
        outstandingBalance: roundToTwo(calculatedOutstanding), // Recalculated from invoices
        overdue: roundToTwo(overdue),
        isActive: party.isActive,
      };
    });
  });
}

// ─── Get customers with server-side pagination ────────────────────────────────
export async function getCustomersPaginated(
  outletId: string,
  params: CustomerQueryParams,
) {
  return withErrorHandler(async (): Promise<PaginatedResult<CustomerData>> => {
    await validateSessionOutletAccess(outletId);

    // Parse and clamp pagination params
    const { page, limit } = parsePaginationParams({
      page: String(params.page),
      limit: String(params.limit),
    });

    // Build WHERE clause
    const where: any = {
      outletId,
      type: "CUSTOMER",
    };

    // Status filter
    if (params.status === "ACTIVE") {
      where.isActive = true;
    } else if (params.status === "INACTIVE") {
      where.isActive = false;
    }

    // Type filter (B2B/B2C)
    if (params.typeFilter === "B2B") {
      where.gstin = { not: null };
    } else if (params.typeFilter === "B2C") {
      where.gstin = null;
    }

    // State filter
    if (params.state && params.state !== "ALL") {
      where.state = params.state;
    }

    // Search filter (name, phone, gstin)
    if (params.search && params.search.trim()) {
      const search = params.search.trim().toLowerCase();
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { gstin: { contains: search, mode: "insensitive" } },
      ];
    }

    // hasOverdue filter - use stored outstandingBalance as proxy
    if (params.hasOverdue) {
      where.outstandingBalance = { gt: 0 };
    }

    // Run count and findMany in parallel
    const [total, parties] = await Promise.all([
      prisma.party.count({ where }),
      prisma.party.findMany({
        where,
        include: {
          transactions: {
            where: {
              type: "SALES_INVOICE",
              status: { in: ["POSTED", "PARTIALLY_PAID"] },
            },
            select: {
              id: true,
              grandTotal: true,
              date: true,
              payments: { select: { amount: true } },
            },
          },
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const now = new Date();

    // Transform data with overdue computation
    const data: CustomerData[] = parties.map((party) => {
      let overdue = 0;
      let calculatedOutstanding = 0;

      // Calculate overdue and outstanding from unpaid invoices
      party.transactions.forEach((inv) => {
        const totalPaid = inv.payments.reduce((a, b) => a + b.amount, 0);
        const outstanding = inv.grandTotal - totalPaid;

        if (outstanding > 0.005) {
          calculatedOutstanding += outstanding;
          const dueDate = new Date(inv.date);
          dueDate.setDate(dueDate.getDate() + party.creditPeriod);
          if (now > dueDate) {
            overdue += outstanding;
          }
        }
      });

      return {
        id: party.id,
        name: party.name,
        isB2B: !!party.gstin,
        phone: party.phone || party.contactInfo,
        gstin: party.gstin,
        state: party.state,
        creditLimit: party.creditLimit,
        outstandingBalance: roundToTwo(calculatedOutstanding),
        overdue: roundToTwo(overdue),
        isActive: party.isActive,
      };
    });

    const pagination = calculatePagination(total, page, limit);

    return { data, pagination };
  });
}

// ─── Get lightweight customer details for Edit form ──────────────────────────
export async function getCustomerForEdit(id: string) {
  return withErrorHandler(async () => {
    const party = await prisma.party.findUnique({
      where: { id, type: "CUSTOMER" },
    });
    if (!party) throw new NotFoundError("Customer not found");
    await validateSessionOutletAccess(party.outletId);
    return party;
  });
}

// ─── Get full details for a single customer (Detail Page) ────────────────────
export async function getCustomerDetails(id: string) {
  return withErrorHandler(async () => {
    const party = await prisma.party.findUnique({
      where: { id, type: "CUSTOMER" },
      include: {
        transactions: {
          where: { type: "SALES_INVOICE" },
          include: {
            payments: { select: { amount: true } },
          },
          orderBy: { date: "desc" },
        },
        payments: {
          where: { invoiceId: { not: "" } }, // Valid invoice payments
          orderBy: { paymentDate: "desc" },
          include: {
            glAccount: { select: { name: true } },
            invoice: { select: { txnNumber: true } },
          },
        },
      },
    });

    if (!party) throw new NotFoundError("Customer not found");

    const now = new Date();
    // Use April 1st of current financial year as start
    const getFyStart = () => {
      const year =
        now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      return new Date(year, 3, 1);
    };
    const fyStart = getFyStart();

    let totalBilledFy = 0;
    let totalReceivedFy = 0;
    let overdue = 0;
    let calculatedOutstanding = 0; // Calculate from actual invoices

    const openInvoices = [];
    const allInvoices = [];

    for (const inv of party.transactions) {
      if (inv.status === "CANCELLED" || inv.status === "DRAFT") continue;

      const totalPaid = inv.payments.reduce((a, b) => a + b.amount, 0);
      const outstanding = roundToTwo(inv.grandTotal - totalPaid);

      // Accumulate calculated outstanding (sum of all unpaid invoices)
      if (outstanding > 0.005) {
        calculatedOutstanding = roundToTwo(calculatedOutstanding + outstanding);
      }

      let daysOverdue = 0;
      let isOverdue = false;

      const dueDate = new Date(inv.date);
      dueDate.setDate(dueDate.getDate() + party.creditPeriod);

      if (outstanding > 0.005 && now > dueDate) {
        const diffTime = Math.abs(now.getTime() - dueDate.getTime());
        daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        isOverdue = true;
        overdue += outstanding;
      }

      if (inv.date >= fyStart) {
        totalBilledFy += inv.grandTotal;
      }

      const invoiceData = {
        id: inv.id,
        txnNumber: inv.txnNumber,
        date: inv.date,
        dueDate,
        grandTotal: inv.grandTotal,
        totalPaid,
        outstanding,
        daysOverdue,
        isOverdue,
        status: inv.status,
      };

      allInvoices.push(invoiceData);
      if (outstanding > 0.005) openInvoices.push(invoiceData);
    }

    for (const pymt of party.payments) {
      if (pymt.paymentDate >= fyStart) {
        totalReceivedFy += pymt.amount;
      }
    }

    return {
      party: {
        id: party.id,
        name: party.name,
        isB2B: !!party.gstin,
        gstin: party.gstin,
        pan: party.pan,
        state: party.state,
        address: party.address,
        phone: party.phone || party.contactInfo,
        email: party.email,
        contactInfo: party.contactInfo,
        creditPeriod: party.creditPeriod,
        creditLimit: party.creditLimit,
        outstandingBalance: roundToTwo(party.outstandingBalance),
        isActive: party.isActive,
        outletId: party.outletId,
      },
      summary: {
        totalBilledFy: roundToTwo(totalBilledFy),
        totalReceivedFy: roundToTwo(totalReceivedFy),
        outstandingBalance: calculatedOutstanding, // Recalculated from actual invoices
        overdue: roundToTwo(overdue),
      },
      openInvoices,
      allInvoices,
      paymentHistory: party.payments,
    };
  });
}

// ─── Create new Customer ─────────────────────────────────────────────────────
export async function createCustomer(
  outletId: string,
  data: CustomerFormValues,
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);
    const validated = customerSchema.parse(data);

    // 1. Unique name check
    const existing = await prisma.party.findFirst({
      where: {
        outletId,
        type: "CUSTOMER",
        name: { equals: validated.name, mode: "insensitive" },
      },
    });

    if (existing) {
      throw new ValidationError(
        `A customer named "${validated.name}" already exists.`,
      );
    }

    return await prisma.$transaction(async (tx) => {
      const party = await tx.party.create({
        data: {
          type: "CUSTOMER",
          outletId,
          name: validated.name,
          gstin: validated.b2b ? validated.gstin : null,
          pan: validated.pan,
          phone: validated.phone,
          email: validated.email,
          contactInfo: validated.contactInfo,
          address: validated.address,
          state: validated.state,
          creditPeriod: validated.creditPeriod,
          creditLimit: validated.creditLimit,
          openingBalance: validated.openingBalance,
          outstandingBalance: validated.openingBalance,
          isActive: validated.isActive,
        },
      });

      // Implement opening balance ledger entry
      if (validated.openingBalance > 0) {
        const debtorAcc = await tx.gLAccount.findFirst({
          where: { code: "1003", outletId },
        });
        if (debtorAcc) {
          await tx.ledgerEntry.create({
            data: {
              accountId: debtorAcc.id,
              partyId: party.id,
              date: new Date(),
              debit: validated.openingBalance,
              credit: 0,
              reference: "Opening Balance",
            },
          });
        }
      }

      revalidatePath("/dashboard/sales/customers");
      return party;
    });
  });
}

// ─── Update Customer ─────────────────────────────────────────────────────────
export async function updateCustomer(id: string, data: CustomerFormValues) {
  return withErrorHandler(async () => {
    const validated = customerSchema.parse(data);

    const currentParty = await prisma.party.findUnique({ where: { id } });
    if (!currentParty) throw new NotFoundError("Customer not found");
    await validateSessionOutletAccess(currentParty.outletId);

    // 1. Uniqueness check
    const existing = await prisma.party.findFirst({
      where: {
        outletId: currentParty.outletId,
        type: "CUSTOMER",
        name: { equals: validated.name, mode: "insensitive" },
        id: { not: id }, // Exclude self
      },
    });

    if (existing) {
      throw new ValidationError(
        `A customer named "${validated.name}" already exists.`,
      );
    }

    // 2. Opening Balance lock enforcement
    if (validated.openingBalance !== currentParty.openingBalance) {
      if (currentParty.openingBalanceLocked) {
        throw new ValidationError(
          "Opening balance cannot be changed after transactions have been posted.",
        );
      }
    }

    return await prisma.$transaction(async (tx) => {
      // If opening balance changed and not locked, we must adjust outstanding and ledger
      const diff = validated.openingBalance - currentParty.openingBalance;

      const party = await tx.party.update({
        where: { id },
        data: {
          name: validated.name,
          gstin: validated.b2b ? validated.gstin : null,
          pan: validated.pan,
          phone: validated.phone,
          email: validated.email,
          contactInfo: validated.contactInfo,
          address: validated.address,
          state: validated.state,
          creditPeriod: validated.creditPeriod,
          creditLimit: validated.creditLimit,
          openingBalance: validated.openingBalance,
          outstandingBalance: { increment: diff },
          isActive: validated.isActive,
        },
      });

      if (diff !== 0) {
        // Adjust opening balance ledger entry
        const debtorAcc = await tx.gLAccount.findFirst({
          where: { code: "1003", outletId: currentParty.outletId },
        });
        if (debtorAcc) {
          const obEntry = await tx.ledgerEntry.findFirst({
            where: { partyId: id, reference: "Opening Balance" },
          });
          if (obEntry) {
            await tx.ledgerEntry.update({
              where: { id: obEntry.id },
              data: { debit: validated.openingBalance },
            });
          } else if (validated.openingBalance > 0) {
            await tx.ledgerEntry.create({
              data: {
                accountId: debtorAcc.id,
                partyId: id,
                date: new Date(), // Technically should date back to go-live, but now() is fine
                debit: validated.openingBalance,
                credit: 0,
                reference: "Opening Balance",
              },
            });
          }
        }
      }

      revalidatePath(`/dashboard/sales/customers/${id}`);
      revalidatePath("/dashboard/sales/customers");
      return party;
    });
  });
}

// ─── Get Customer Ledger (Dynamic Balance computation) ───────────────────────
export async function getCustomerLedger(
  partyId: string,
  fromDate?: string,
  toDate?: string,
) {
  return withErrorHandler(async () => {
    const party = await prisma.party.findUnique({
      where: { id: partyId, type: "CUSTOMER" },
      select: {
        openingBalance: true,
        name: true,
        phone: true,
        contactInfo: true,
      },
    });

    if (!party) throw new NotFoundError("Customer not found");

    const partyForAuth = await prisma.party.findUnique({
      where: { id: partyId },
      select: { outletId: true },
    });
    if (partyForAuth?.outletId)
      await validateSessionOutletAccess(partyForAuth.outletId);

    const whereClause: any = { partyId };
    if (fromDate || toDate) {
      whereClause.date = {};
      if (fromDate) whereClause.date.gte = new Date(fromDate);
      if (toDate) whereClause.date.lte = new Date(toDate);
    }

    // Only fetch ledger entries explicitly tied to this party
    const entries = await prisma.ledgerEntry.findMany({
      where: whereClause,
      include: {
        transaction: { select: { txnNumber: true } },
      },
      orderBy: [{ date: "asc" }, { id: "asc" }],
    });

    let runningBalance = party.openingBalance;
    let totalDebit = 0;
    let totalCredit = 0;

    const computedEntries = entries.map((entry) => {
      runningBalance += (entry.debit || 0) - (entry.credit || 0);

      // We still track total movements for the period
      totalDebit += entry.debit || 0;
      totalCredit += entry.credit || 0;

      return {
        id: entry.id,
        date: entry.date,
        description: entry.transaction?.txnNumber
          ? `Invoice ${entry.transaction.txnNumber}`
          : entry.reference,
        type: entry.debit > 0 ? "INVOICE" : "PAYMENT", // Simple heuristic (can be improved)
        debit: entry.debit || 0,
        credit: entry.credit || 0,
        balance: runningBalance,
      };
    });

    return {
      party: {
        name: party.name,
        phone: party.phone || party.contactInfo,
      },
      openingBalance: party.openingBalance,
      periodTotalDebit: totalDebit,
      periodTotalCredit: totalCredit,
      closingBalance: runningBalance,
      entries: computedEntries,
    };
  });
}

// ─── Delete Customer (with transaction guard) ─────────────────────────────────
export async function deleteCustomer(id: string) {
  return withErrorHandler(async () => {
    const party = await prisma.party.findUnique({
      where: { id, type: "CUSTOMER" },
    });
    if (!party) throw new NotFoundError("Customer not found");
    await validateSessionOutletAccess(party.outletId);

    // Check for existing transactions that would prevent deletion
    const [txnCount, paymentCount, nonObLedgerCount] = await Promise.all([
      prisma.transaction.count({ where: { partyId: id } }),
      prisma.payment.count({ where: { partyId: id } }),
      prisma.ledgerEntry.count({
        where: { partyId: id, reference: { not: "Opening Balance" } },
      }),
    ]);

    if (txnCount > 0 || paymentCount > 0 || nonObLedgerCount > 0) {
      throw new ValidationError(
        "Customer cannot be deleted as transactions exist.",
      );
    }

    // Clean deletion: remove opening balance ledger entry first, then party
    await prisma.$transaction([
      prisma.ledgerEntry.deleteMany({ where: { partyId: id } }),
      prisma.party.delete({ where: { id } }),
    ]);

    revalidatePath("/dashboard/sales/customers");
    return { id };
  });
}
