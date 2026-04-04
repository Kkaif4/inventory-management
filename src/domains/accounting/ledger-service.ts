import { prisma } from "@/lib/prisma";
import { roundToTwo } from "@/lib/utils";

/**
 * Standard Double-Entry Ledger Service
 */
export const AccountingService = {
  /**
   * Post a multi-line Journal Entry
   */
  async postJournalEntry(
    tx: any,
    data: {
      transactionId?: string;
      partyId?: string;
      date?: Date; // Optional — pass historical date for OLD bills; omit for current date
      entries: {
        accountId: string;
        debit?: number;
        credit?: number;
        reference?: string;
      }[];
    },
  ) {
    const { transactionId, entries, partyId, date } = data;

    // Validate entry balance
    const totalDebit = roundToTwo(
      entries.reduce((sum, e) => sum + (e.debit || 0), 0),
    );
    const totalCredit = roundToTwo(
      entries.reduce((sum, e) => sum + (e.credit || 0), 0),
    );

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error("Journal entry is not balanced");
    }

    await tx.ledgerEntry.createMany({
      data: entries.map((entry) => ({
        transactionId,
        accountId: entry.accountId,
        partyId: partyId,
        debit: roundToTwo(entry.debit || 0),
        credit: roundToTwo(entry.credit || 0),
        reference: entry.reference,
        ...(date ? { date } : {}), // Use historical date if provided, else Prisma default(now())
      })),
    });
  },

  /**
   * Helper to find standard accounts by name/code
   */
  async findAccountByCode(code: string, outletId: string) {
    return await prisma.account.findUnique({
      where: { code_outletId: { code, outletId } },
    });
  },
  /**
   * Validate Ledger Integrity
   * Checks if total debits == total credits across the entire system
   */
  async validateLedgerIntegrity() {
    const totals = await prisma.ledgerEntry.aggregate({
      _sum: {
        debit: true,
        credit: true,
      },
    });

    const debit = totals._sum.debit || 0;
    const credit = totals._sum.credit || 0;
    const difference = Math.abs(debit - credit);

    return {
      totalDebit: debit,
      totalCredit: credit,
      isBalanced: difference < 0.01, // Float precision tolerance
      difference,
    };
  },

  async getPartyBalance(partyId: string) {
    const totals = await prisma.ledgerEntry.aggregate({
      where: { partyId },
      _sum: {
        debit: true,
        credit: true,
      },
    });

    const debit = totals._sum.debit || 0;
    const credit = totals._sum.credit || 0;
    return roundToTwo(debit - credit);
  },
};

/**
 * Initialize minimum GL accounts required for double-entry bookkeeping (old bills, etc)
 * Only creates 3 essential accounts - no predefined chart of accounts
 * All other accounts are user-generated
 */
export async function initializeCOA(outletId: string) {
  const essentialAccounts = [
    { code: "1001", name: "Cash in Hand", group: "ASSET", isSystem: true },
    { code: "1003", name: "Sundry Debtors", group: "ASSET", isSystem: true },
    { code: "3001", name: "Sales Account", group: "INCOME", isSystem: true },
  ];

  for (const acc of essentialAccounts) {
    await prisma.account.upsert({
      where: { code_outletId: { code: acc.code, outletId } },
      update: {},
      create: { ...acc, outletId, openingBalance: 0, currentBalance: 0, type: null } as any,
    });
  }
}
