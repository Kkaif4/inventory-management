"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/error-handler";

/**
 * 1. Inventory Reports
 */
export async function getLowStockReport() {
  return withErrorHandler(async () => {
    // Find variants where total physical stock across all locations < minStockLevel
    const variants = await prisma.variant.findMany({
      include: {
        product: true,
        stocks: true,
      },
      where: {
        minStockLevel: { gt: 0 },
      },
    });

    return variants
      .map((v) => {
        const totalQty = v.stocks.reduce((sum, s) => sum + s.quantity, 0);
        return {
          sku: v.sku,
          productName: v.product.name,
          currentStock: totalQty,
          minLevel: v.minStockLevel,
          shortage: v.minStockLevel - totalQty,
        };
      })
      .filter((v) => v.currentStock < v.minLevel);
  });
}

/**
 * 2. Financial Reports
 */
export async function getTrialBalance() {
  return withErrorHandler(async () => {
    const accounts = await prisma.account.findMany({
      include: {
        entries: true,
      },
    });

    return accounts.map((acc) => {
      const totalDebit = acc.entries.reduce((sum, e) => sum + e.debit, 0);
      const totalCredit = acc.entries.reduce((sum, e) => sum + e.credit, 0);
      const balance = totalDebit - totalCredit;

      return {
        code: acc.code,
        name: acc.name,
        group: acc.group,
        debit: balance > 0 ? balance : 0,
        credit: balance < 0 ? Math.abs(balance) : 0,
      };
    });
  });
}

export async function getProfitAndLoss() {
  return withErrorHandler(async () => {
    const accounts = await prisma.account.findMany({
      include: { entries: true },
      where: {
        group: { in: ["INCOME", "EXPENSE"] },
      },
    });

    const incomeAccounts = accounts.filter((a) => a.group === "INCOME");
    const expenseAccounts = accounts.filter((a) => a.group === "EXPENSE");

    const incomeTotal = incomeAccounts.reduce(
      (sum, acc) =>
        sum + acc.entries.reduce((s, e) => s + (e.credit - e.debit), 0),
      0,
    );

    const expenseTotal = expenseAccounts.reduce(
      (sum, acc) =>
        sum + acc.entries.reduce((s, e) => s + (e.debit - e.credit), 0),
      0,
    );

    return {
      incomes: incomeAccounts.map((a) => ({
        name: a.name,
        amount: a.entries.reduce((s, e) => s + (e.credit - e.debit), 0),
      })),
      expenses: expenseAccounts.map((a) => ({
        name: a.name,
        amount: a.entries.reduce((s, e) => s + (e.debit - e.credit), 0),
      })),
      netProfit: incomeTotal - expenseTotal,
    };
  });
}

/**
 * 3. GST Reports
 */
export async function getGSTSummary(startDate: Date, endDate: Date) {
  return withErrorHandler(async () => {
    const inputTaxCodes = ["1005", "1006", "1007"]; // Input CGST/SGST/IGST
    const outputTaxCodes = ["2002", "2003", "2004"]; // Output CGST/SGST/IGST

    const inputEntries = await prisma.ledgerEntry.findMany({
      where: {
        account: { code: { in: inputTaxCodes } },
        date: { gte: startDate, lte: endDate },
      },
    });

    const outputEntries = await prisma.ledgerEntry.findMany({
      where: {
        account: { code: { in: outputTaxCodes } },
        date: { gte: startDate, lte: endDate },
      },
    });

    return {
      inputGST: inputEntries.reduce((sum, e) => sum + (e.debit - e.credit), 0),
      outputGST: outputEntries.reduce(
        (sum, e) => sum + (e.credit - e.debit),
        0,
      ),
      netPayable: 0, // Logic to subtract input from output
    };
  });
}
