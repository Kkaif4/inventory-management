"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/error-handler";
import { requireAdminSession } from "@/lib/outlet-auth";
import { roundToTwo } from "@/lib/utils";


/**
 * Get General Ledger entries from LedgerEntry model
 * Shows all debit/credit entries grouped by account
 */
export async function getLedgerEntries(
  accountId?: string,
  startDate?: Date,
  endDate?: Date,
  outletId?: string,
) {
  return withErrorHandler(async () => {
    await requireAdminSession();

    // Build outlet filter - ledger entries can be filtered via account, party, or transaction
    const outletFilter = outletId
      ? {
          OR: [
            { account: { outletId } },
            { party: { outletId } },
            { transaction: { outletId } },
          ],
        }
      : {};

    const entries = await prisma.ledgerEntry.findMany({
      where: {
        ...(accountId && { accountId }),
        ...(startDate &&
          endDate && {
            date: { gte: startDate, lte: endDate },
          }),
        ...outletFilter,
      },
      select: {
        id: true,
        date: true,
        debit: true,
        credit: true,
        reference: true,
        account: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        party: {
          select: {
            id: true,
            name: true,
          },
        },
        transaction: {
          select: {
            id: true,
            txnNumber: true,
            type: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return entries.map((entry) => ({
      id: entry.id,
      date: entry.date,
      account: entry.account,
      description:
        entry.reference ||
        entry.party?.name ||
        entry.transaction?.txnNumber ||
        "-",
      debit: roundToTwo(entry.debit),
      credit: roundToTwo(entry.credit),
      transaction: entry.transaction,
    }));
  });
}

/**
 * Get Balance Sheet using GL accounts grouped by account group
 * Calculates balances from LedgerEntry (debit - credit for each account)
 * Assets = Liabilities + Equity + Net Income
 */
export async function getBalanceSheet(
  asOnDate?: Date,
  outletId?: string,
) {
  return withErrorHandler(async () => {
    await requireAdminSession();

    const dateFilter = asOnDate ? { lte: asOnDate } : {};

    // ─── Get all accounts and calculate balances from LedgerEntry ────────────
    const allAccounts = await prisma.account.findMany({
      where: {
        ...(outletId && { outletId }),
      },
      select: {
        id: true,
        code: true,
        name: true,
        group: true,
        type: true,
        openingBalance: true,
        entries: {
          where: {
            date: dateFilter,
          },
          select: {
            debit: true,
            credit: true,
          },
        },
      },
      orderBy: [{ group: "asc" }, { code: "asc" }],
    });

    // Calculate balance for each account (debit - credit)
    const accountsWithBalance = allAccounts.map((acc) => {
      const totalDebit = roundToTwo(
        acc.entries.reduce((sum, e) => sum + e.debit, 0),
      );
      const totalCredit = roundToTwo(
        acc.entries.reduce((sum, e) => sum + e.credit, 0),
      );
      const balance = roundToTwo(totalDebit - totalCredit);

      return {
        id: acc.id,
        code: acc.code,
        name: acc.name,
        group: acc.group,
        type: acc.type,
        openingBalance: acc.openingBalance,
        totalDebit,
        totalCredit,
        balance,
      };
    });

    // ─── Separate accounts by group ─────────────────────────────────────────
    const assetAccounts = accountsWithBalance.filter((a) => a.group === "ASSET");
    const liabilityAccounts = accountsWithBalance.filter(
      (a) => a.group === "LIABILITY",
    );
    const equityAccounts = accountsWithBalance.filter(
      (a) => a.group === "EQUITY",
    );
    const incomeAccounts = accountsWithBalance.filter(
      (a) => a.group === "INCOME",
    );
    const expenseAccounts = accountsWithBalance.filter(
      (a) => a.group === "EXPENSE",
    );

    // ─── Handle bank overdrafts: reclassify negative BANK to Liabilities ────
    const normalAssets = assetAccounts.filter(
      (a) => !(a.type === "BANK" && a.balance < 0),
    );
    const bankOverdrafts = assetAccounts.filter(
      (a) => a.type === "BANK" && a.balance < 0,
    );

    // ─── Calculate totals ───────────────────────────────────────────────────
    const totalAssets = roundToTwo(
      normalAssets.reduce((sum, a) => sum + a.balance, 0),
    );

    const totalLiabilities = roundToTwo(
      liabilityAccounts.reduce((sum, l) => sum + l.balance, 0) +
        bankOverdrafts.reduce((sum, a) => sum + Math.abs(a.balance), 0),
    );

    const totalEquity = roundToTwo(
      equityAccounts.reduce((sum, e) => sum + e.balance, 0),
    );

    // ─── Calculate Net Profit (Income - Expense) ────────────────────────────
    const totalIncome = roundToTwo(
      incomeAccounts.reduce((sum, i) => sum + i.balance, 0),
    );
    const totalExpense = roundToTwo(
      expenseAccounts.reduce((sum, e) => sum + e.balance, 0),
    );
    const netProfit = roundToTwo(totalIncome - totalExpense);

    // ─── Validate Balance Sheet Equation: Assets = Liabilities + Equity + Net Income
    const balanceSheetTotal = roundToTwo(totalLiabilities + totalEquity);
    const difference = roundToTwo(totalAssets - balanceSheetTotal);
    const isBalanced = Math.abs(difference) < 0.01;

    return {
      assets: {
        items: normalAssets,
        overdrafts: bankOverdrafts.map((a) => ({
          ...a,
          balance: Math.abs(a.balance),
          displayName: `${a.name} (Overdraft)`,
        })),
        total: totalAssets,
      },
      liabilities: {
        items: liabilityAccounts,
        bankOverdrafts: bankOverdrafts.map((a) => ({
          ...a,
          balance: Math.abs(a.balance),
          displayName: `${a.name} (Overdraft)`,
        })),
        total: totalLiabilities,
      },
      equity: {
        items: equityAccounts,
        total: totalEquity,
      },
      income: {
        items: incomeAccounts,
        total: totalIncome,
      },
      expense: {
        items: expenseAccounts,
        total: totalExpense,
      },
      netProfit,
      isBalanced,
      balanceDifference: difference,
      asOnDate: asOnDate || new Date(),
    };
  });
}
