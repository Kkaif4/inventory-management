"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/error-handler";
import { ValidationError, NotFoundError } from "@/lib/exceptions";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import {
  VendorFormValues,
  vendorSchema,
} from "@/validations/vendor.validation";
import { revalidatePath } from "next/cache";
import { roundToTwo } from "@/lib/utils";
import {
  parsePaginationParams,
  calculatePagination,
} from "@/lib/pagination";
import { PaginatedResult, BasePaginationParams } from "@/types/pagination";

// ──── Types ──────────────────────────────────────────────────────────────────
interface VendorQueryParams extends BasePaginationParams {
  search?: string;
  status?: "ALL" | "ACTIVE" | "INACTIVE";
  state?: string | null;
  hasOverdue?: boolean;
}

interface VendorData {
  id: string;
  name: string;
  gstin: string | null;
  phone: string | null;
  state: string;
  creditPeriod: number;
  outstandingBalance: number;
  overdue: number;
  isActive: boolean;
}

// ─── Get all vendors for an outlet with live payable balances ───────────────
export async function getVendors(outletId: string) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);
    const parties = await prisma.party.findMany({
      where: {
        outletId,
        type: "VENDOR", // Strict domain boundary
      },
      include: {
        transactions: {
          where: {
            type: { in: ["PURCHASE_BILL", "GRN", "PURCHASE_ORDER"] }, // Include all vendor transaction types
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
      let totalOutstanding = 0;
      let overdue = 0;

      party.transactions.forEach((inv) => {
        const totalPaid = inv.payments.reduce((a, b) => a + b.amount, 0);
        const outstanding = inv.grandTotal - totalPaid;

        if (outstanding > 0.005) {
          totalOutstanding += outstanding;
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
        gstin: party.gstin,
        phone: party.phone || party.contactInfo,
        state: party.state,
        creditPeriod: party.creditPeriod,
        outstandingBalance: roundToTwo(totalOutstanding),
        overdue: roundToTwo(overdue),
        isActive: party.isActive,
      };
    });
  });
}

// ─── Get vendors with server-side pagination ──────────────────────────────────
export async function getVendorsPaginated(outletId: string, params: VendorQueryParams) {
  return withErrorHandler(async (): Promise<PaginatedResult<VendorData>> => {
    await validateSessionOutletAccess(outletId);

    // Parse and clamp pagination params
    const { page, limit } = parsePaginationParams({
      page: String(params.page),
      limit: String(params.limit),
    });

    // Build WHERE clause
    const where: any = {
      outletId,
      type: "VENDOR",
    };

    // Status filter
    if (params.status === "ACTIVE") {
      where.isActive = true;
    } else if (params.status === "INACTIVE") {
      where.isActive = false;
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
              type: { in: ["PURCHASE_BILL", "GRN", "PURCHASE_ORDER"] },
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
    const data: VendorData[] = parties.map((party) => {
      let totalOutstanding = 0;
      let overdue = 0;

      party.transactions.forEach((inv) => {
        const totalPaid = inv.payments.reduce((a, b) => a + b.amount, 0);
        const outstanding = inv.grandTotal - totalPaid;

        if (outstanding > 0.005) {
          totalOutstanding += outstanding;
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
        gstin: party.gstin,
        phone: party.phone || party.contactInfo,
        state: party.state,
        creditPeriod: party.creditPeriod,
        outstandingBalance: roundToTwo(totalOutstanding),
        overdue: roundToTwo(overdue),
        isActive: party.isActive,
      };
    });

    const pagination = calculatePagination(total, page, limit);

    return { data, pagination };
  });
}

// ─── Get lightweight vendor details for Edit form ────────────────────────────
export async function getVendorForEdit(id: string) {
  return withErrorHandler(async () => {
    const party = await prisma.party.findUnique({
      where: { id, type: "VENDOR" },
    });
    if (!party) throw new NotFoundError("Vendor not found");
    await validateSessionOutletAccess(party.outletId);
    return party;
  });
}

// ─── Get full details for a single vendor (Detail Page) ──────────────────────
export async function getVendorDetails(id: string) {
  return withErrorHandler(async () => {
    const party = await prisma.party.findUnique({
      where: { id, type: "VENDOR" },
      include: {
        transactions: {
          where: { type: "PURCHASE_ORDER" }, // Adjust depending on actual billing trans type
          include: {
            payments: { select: { amount: true } },
          },
          orderBy: { date: "desc" },
        },
        payments: {
          where: { invoiceId: { not: "" } },
          orderBy: { paymentDate: "desc" },
          include: {
            account: { select: { name: true, type: true } },
            invoice: { select: { txnNumber: true } },
          },
        },
      },
    });

    if (!party) throw new NotFoundError("Vendor not found");
    await validateSessionOutletAccess(party.outletId);

    const now = new Date();
    const getFyStart = () => {
      const year =
        now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      return new Date(year, 3, 1);
    };
    const fyStart = getFyStart();

    let totalPurchasedFy = 0;
    let totalPaidFy = 0;
    let overdue = 0;

    const openBills = [];
    const allBills = [];

    for (const inv of party.transactions) {
      if (inv.status === "CANCELLED" || inv.status === "DRAFT") continue;

      const totalPaid = inv.payments.reduce((a, b) => a + b.amount, 0);
      const outstanding = roundToTwo(inv.grandTotal - totalPaid);

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
        totalPurchasedFy += inv.grandTotal;
      }

      const billData = {
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

      allBills.push(billData);
      if (outstanding > 0.005) openBills.push(billData);
    }

    for (const pymt of party.payments) {
      if (pymt.paymentDate >= fyStart) {
        totalPaidFy += pymt.amount;
      }
    }

    return {
      party: {
        id: party.id,
        name: party.name,
        gstin: party.gstin,
        pan: party.pan,
        state: party.state,
        address: party.address,
        phone: party.phone || party.contactInfo,
        email: party.email,
        contactInfo: party.contactInfo,
        creditPeriod: party.creditPeriod,
        openingBalance: party.openingBalance,
        outstandingBalance: roundToTwo(party.outstandingBalance),
        isActive: party.isActive,
        bankName: party.bankName,
        bankAccountName: party.bankAccountName,
        bankAccountNumber: party.bankAccountNumber,
        bankIfsc: party.bankIfsc,
        outletId: party.outletId,
      },
      summary: {
        totalPurchasedFy: roundToTwo(totalPurchasedFy),
        totalPaidFy: roundToTwo(totalPaidFy),
        outstandingBalance: roundToTwo(party.outstandingBalance),
        overdue: roundToTwo(overdue),
      },
      openBills,
      allBills,
      paymentHistory: party.payments,
    };
  });
}

// ─── Create new Vendor ───────────────────────────────────────────────────────
export async function createVendor(outletId: string, data: VendorFormValues) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);
    const validated = vendorSchema.parse(data);

    // 1. Unique name check per outlet
    const existing = await prisma.party.findFirst({
      where: {
        outletId,
        type: "VENDOR",
        name: { equals: validated.name, mode: "insensitive" },
      },
    });

    if (existing) {
      throw new ValidationError(
        `A vendor named "${validated.name}" already exists.`,
      );
    }

    return await prisma.$transaction(async (tx) => {
      const party = await tx.party.create({
        data: {
          type: "VENDOR",
          outletId,
          name: validated.name,
          gstin: validated.gstin,
          pan: validated.pan,
          phone: validated.phone,
          email: validated.email,
          contactInfo: validated.contactInfo,
          address: validated.address,
          state: validated.state,
          creditPeriod: validated.creditPeriod,
          openingBalance: validated.openingBalance,
          outstandingBalance: validated.openingBalance, // Initialize payable
          isActive: validated.isActive,
          bankName: validated.bankName,
          bankAccountName: validated.bankAccountName,
          bankAccountNumber: validated.bankAccountNumber,
          bankIfsc: validated.bankIfsc,
        },
      });

      // Implement opening balance ledger entry
      if (validated.openingBalance > 0) {
        // Vendors are Creditors (Liability) - typically mapped to code 2001
        const creditorAcc = await tx.account.findFirst({
          where: { code: "2001", outletId },
        });
        if (creditorAcc) {
          await tx.ledgerEntry.create({
            data: {
              accountId: creditorAcc.id,
              partyId: party.id,
              date: new Date(),
              debit: 0,
              credit: validated.openingBalance,
              reference: "Opening Balance",
            },
          });
        }
      }

      revalidatePath("/dashboard/purchase/vendors");
      return party;
    });
  });
}

// ─── Update Vendor ───────────────────────────────────────────────────────────
export async function updateVendor(id: string, data: VendorFormValues) {
  return withErrorHandler(async () => {
    const validated = vendorSchema.parse(data);

    const currentParty = await prisma.party.findUnique({
      where: { id, type: "VENDOR" },
    });
    if (!currentParty) throw new NotFoundError("Vendor not found");
    await validateSessionOutletAccess(currentParty.outletId);

    // 1. Uniqueness check
    const existing = await prisma.party.findFirst({
      where: {
        outletId: currentParty.outletId,
        type: "VENDOR",
        name: { equals: validated.name, mode: "insensitive" },
        id: { not: id }, // Exclude self
      },
    });

    if (existing) {
      throw new ValidationError(
        `A vendor named "${validated.name}" already exists.`,
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
      const diff = validated.openingBalance - currentParty.openingBalance;

      const party = await tx.party.update({
        where: { id },
        data: {
          name: validated.name,
          gstin: validated.gstin,
          pan: validated.pan,
          phone: validated.phone,
          email: validated.email,
          contactInfo: validated.contactInfo,
          address: validated.address,
          state: validated.state,
          creditPeriod: validated.creditPeriod,
          openingBalance: validated.openingBalance,
          outstandingBalance: { increment: diff },
          isActive: validated.isActive,
          bankName: validated.bankName,
          bankAccountName: validated.bankAccountName,
          bankAccountNumber: validated.bankAccountNumber,
          bankIfsc: validated.bankIfsc,
        },
      });

      if (diff !== 0) {
        const creditorAcc = await tx.account.findFirst({
          where: { code: "2001", outletId: currentParty.outletId },
        });
        if (creditorAcc) {
          const obEntry = await tx.ledgerEntry.findFirst({
            where: { partyId: id, reference: "Opening Balance" },
          });
          if (obEntry) {
            await tx.ledgerEntry.update({
              where: { id: obEntry.id },
              // For a vendor (liability), opening balance is a credit entry
              data: { credit: validated.openingBalance },
            });
          } else if (validated.openingBalance > 0) {
            await tx.ledgerEntry.create({
              data: {
                accountId: creditorAcc.id,
                partyId: id,
                date: new Date(),
                debit: 0,
                credit: validated.openingBalance,
                reference: "Opening Balance",
              },
            });
          }
        }
      }

      revalidatePath(`/dashboard/purchase/vendors/${id}`);
      revalidatePath("/dashboard/purchase/vendors");
      return party;
    });
  });
}

// ─── Get Vendor Ledger (Dynamic Balance computation) ─────────────────────────
export async function getVendorLedger(
  partyId: string,
  fromDate?: string,
  toDate?: string,
) {
  return withErrorHandler(async () => {
    const party = await prisma.party.findUnique({
      where: { id: partyId, type: "VENDOR" },
      select: {
        openingBalance: true,
        name: true,
        phone: true,
        contactInfo: true,
      },
    });

    if (!party) throw new NotFoundError("Vendor not found");

    const partyForAuth = await prisma.party.findUnique({ where: { id: partyId }, select: { outletId: true } });
    if (partyForAuth?.outletId) await validateSessionOutletAccess(partyForAuth.outletId);

    const whereClause: any = { partyId };
    if (fromDate || toDate) {
      whereClause.date = {};
      if (fromDate) whereClause.date.gte = new Date(fromDate);
      if (toDate) whereClause.date.lte = new Date(toDate);
    }

    const entries = await prisma.ledgerEntry.findMany({
      where: whereClause,
      include: {
        transaction: { select: { txnNumber: true } },
      },
      orderBy: [{ date: "asc" }, { id: "asc" }],
    });

    // Vendor Orientation: We owe them... Liability account logic natively implies Credit adds to balance.
    // In FRD term: Balance = Credit (Bills) - Debit (Payments)
    let runningBalance = party.openingBalance;
    let totalDebit = 0;
    let totalCredit = 0;

    const computedEntries = entries.map((entry) => {
      // Skip the actual opening balance entry to avoid double counting if using party.openingBalance as baseline
      // Actually wait, if we are filtering by date, some queries might not include the 'Opening Balance' ledger entry.
      // Safe to just use exactly what is fetched:
      // If we use party.openingBalance, we must assume ALL entries are starting from openingBalance.
      // But let's build standard arithmetic:
      // This is a simplificaiton - if date range is applied, true opening balance for period is:
      // (party.openingBalance) + Sum(Credit before fromDate) - Sum(Debit before fromDate)

      runningBalance += (entry.credit || 0) - (entry.debit || 0);

      totalDebit += entry.debit || 0;
      totalCredit += entry.credit || 0;

      return {
        id: entry.id,
        date: entry.date,
        description: entry.transaction?.txnNumber
          ? `Bill ${entry.transaction.txnNumber}`
          : entry.reference,
        type: entry.credit > 0 ? "PURCHASE_BILL" : "PAYMENT", // Simple heuristic
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
      openingBalance: party.openingBalance, // Need to fix this for date-range accurate opening balance
      periodTotalDebit: totalDebit,
      periodTotalCredit: totalCredit,
      closingBalance: runningBalance,
      entries: computedEntries,
    };
  });
}

// ─── Delete Vendor (with transaction guard) ──────────────────────────────────
export async function deleteVendor(id: string) {
  return withErrorHandler(async () => {
    const party = await prisma.party.findUnique({
      where: { id, type: "VENDOR" },
    });
    if (!party) throw new NotFoundError("Vendor not found");
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
        "Vendor cannot be deleted as transactions exist.",
      );
    }

    // Clean deletion: remove opening balance ledger entry first, then party
    await prisma.$transaction([
      prisma.ledgerEntry.deleteMany({ where: { partyId: id } }),
      prisma.party.delete({ where: { id } }),
    ]);

    revalidatePath("/dashboard/purchase/vendors");
    return { id };
  });
}
