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
      transactionId: string;
      partyId?: string;
      entries: {
        accountId: string;
        debit?: number;
        credit?: number;
        reference?: string;
      }[];
    },
  ) {
    const { transactionId, entries, partyId } = data;

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
};

/**
 * Chart of Accounts (COA) Initializer
 */
export async function initializeCOA(outletId: string) {
  const accounts = [
    // Assets
    { code: "1001", name: "Cash in Hand", group: "ASSET", isSystem: true },
    {
      code: "1002",
      name: "Standard Bank Account",
      group: "ASSET",
      isSystem: true,
    },
    {
      code: "1003",
      name: "Sundry Debtors (Customers)",
      group: "ASSET",
      isSystem: true,
    },
    {
      code: "1004",
      name: "Inventory Asset Account",
      group: "ASSET",
      isSystem: true,
    },
    { code: "1005", name: "Input CGST", group: "ASSET", isSystem: true },
    { code: "1006", name: "Input SGST", group: "ASSET", isSystem: true },
    { code: "1007", name: "Input IGST", group: "ASSET", isSystem: true },

    // Liabilities
    {
      code: "2001",
      name: "Sundry Creditors (Vendors)",
      group: "LIABILITY",
      isSystem: true,
    },
    { code: "2002", name: "Output CGST", group: "LIABILITY", isSystem: true },
    { code: "2003", name: "Output SGST", group: "LIABILITY", isSystem: true },
    { code: "2004", name: "Output IGST", group: "LIABILITY", isSystem: true },

    // Income
    { code: "3001", name: "Sales Account", group: "INCOME", isSystem: true },

    // Expense
    {
      code: "4001",
      name: "Purchase Account",
      group: "EXPENSE",
      isSystem: true,
    },
    {
      code: "4002",
      name: "Freight & Carriage Inward",
      group: "EXPENSE",
      isSystem: true,
    },
    {
      code: "5001",
      name: "Opening Balance Offset",
      group: "EQUITY",
      isSystem: true,
    },
  ];

  for (const acc of accounts) {
    await prisma.account.upsert({
      where: { code_outletId: { code: acc.code, outletId } },
      update: {},
      create: { ...acc, outletId } as any,
    });
  }
}
