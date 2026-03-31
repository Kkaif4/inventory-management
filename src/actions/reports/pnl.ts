"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/error-handler";
import { requireAdminSession, getSessionWithOutlets } from "@/lib/outlet-auth";

export interface PnLLineItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: number;
}

export interface PnLStructure {
  // Revenue Section
  salesNo1: PnLLineItem | null; // Account 3001
  salesNo2: PnLLineItem | null; // Account 3002
  otherIncome: PnLLineItem[]; // Other 3xxx accounts
  grossRevenue: number;

  // COGS Section
  purchases: PnLLineItem | null; // Account 4001
  freightInward: PnLLineItem | null; // Account 4002
  directExpenses: PnLLineItem[]; // Other 4xxx accounts
  totalCOGS: number;

  // Gross Profit
  grossProfit: number;
  grossProfitPercent: number;

  // Operating Expenses Section
  operatingExpenses: PnLLineItem[]; // All 5xxx accounts
  totalOperatingExpenses: number;

  // Net Profit
  netProfit: number;
  netProfitPercent: number;
}

export interface PnLResponse {
  currentPeriod: PnLStructure;
  comparisonPeriod?: PnLStructure;
  periodInfo: {
    startDate: Date;
    endDate: Date;
    comparisonStartDate?: Date;
    comparisonEndDate?: Date;
  };
  outletInfo?: {
    id: string;
    name: string;
  } | null;
}

/**
 * Get Profit & Loss Statement with proper period filtering and account grouping
 *
 * Account Structure:
 * - 3001: Sales (NO1 - GST Sales)
 * - 3002: Cash Sales Informal (NO2)
 * - 3xxx: Other Income accounts
 * - 4001: Purchases
 * - 4002: Freight Inward
 * - 4xxx: Other direct expenses (COGS)
 * - 5xxx: Operating Expenses
 */
export async function getPnL(
  startDate: Date,
  endDate: Date,
  outletId?: string,
  comparisonStartDate?: Date,
  comparisonEndDate?: Date,
) {
  return withErrorHandler(async () => {
    const session = await requireAdminSession();

    // Get outlet info if specific outlet requested
    let outletInfo = null;
    if (outletId) {
      const outlet = await prisma.outlet.findUnique({
        where: { id: outletId },
        select: { id: true, name: true },
      });
      outletInfo = outlet;
    }

    // Get current period data
    const currentPeriod = await calculatePnLPeriod(
      startDate,
      endDate,
      outletId,
    );

    // Get comparison period data if requested
    let comparisonPeriod: PnLStructure | undefined;
    if (comparisonStartDate && comparisonEndDate) {
      comparisonPeriod = await calculatePnLPeriod(
        comparisonStartDate,
        comparisonEndDate,
        outletId,
      );
    }

    return {
      currentPeriod,
      comparisonPeriod,
      periodInfo: {
        startDate,
        endDate,
        comparisonStartDate,
        comparisonEndDate,
      },
      outletInfo,
    };
  });
}

/**
 * Calculate P&L for a single period
 */
async function calculatePnLPeriod(
  startDate: Date,
  endDate: Date,
  outletId?: string,
): Promise<PnLStructure> {
  // Build where clause for ledger entries
  const entriesWhere: any = {
    date: {
      gte: startDate,
      lte: endDate,
    },
  };

  // If outletId is provided, filter by outlet through transaction
  // Note: Ledger entries don't have outletId directly, so we need to join via transaction
  // or filter accounts by outletId
  const accountWhere: any = {};
  if (outletId) {
    accountWhere.outletId = outletId;
  }

  // Fetch all relevant accounts with their entries for the period
  const accounts = await prisma.account.findMany({
    where: {
      ...accountWhere,
      group: { in: ["INCOME", "EXPENSE"] },
    },
    include: {
      entries: {
        where: entriesWhere,
        select: {
          debit: true,
          credit: true,
        },
      },
    },
  });

  // Categorize accounts by code ranges
  const salesNo1 = accounts.find((a) => a.code === "3001");
  const salesNo2 = accounts.find((a) => a.code === "3002");

  const purchases = accounts.find((a) => a.code === "4001");
  const freightInward = accounts.find((a) => a.code === "4002");

  // Calculate amounts for each account
  const calculateBalance = (account: (typeof accounts)[0], group: string) => {
    const totalDebit = account.entries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = account.entries.reduce((sum, e) => sum + e.credit, 0);

    if (group === "INCOME") {
      return totalCredit - totalDebit; // Income = Credit - Debit
    } else {
      return totalDebit - totalCredit; // Expense = Debit - Credit
    }
  };

  // Build line items
  const salesNo1Item: PnLLineItem | null = salesNo1
    ? {
        accountId: salesNo1.id,
        accountCode: salesNo1.code,
        accountName: salesNo1.name,
        amount: calculateBalance(salesNo1, "INCOME"),
      }
    : null;

  const salesNo2Item: PnLLineItem | null = salesNo2
    ? {
        accountId: salesNo2.id,
        accountCode: salesNo2.code,
        accountName: salesNo2.name,
        amount: calculateBalance(salesNo2, "INCOME"),
      }
    : null;

  // Other income accounts (3xxx except 3001, 3002)
  const otherIncomeItems: PnLLineItem[] = accounts
    .filter(
      (a) =>
        a.group === "INCOME" &&
        a.code.startsWith("3") &&
        a.code !== "3001" &&
        a.code !== "3002",
    )
    .map((a) => ({
      accountId: a.id,
      accountCode: a.code,
      accountName: a.name,
      amount: calculateBalance(a, "INCOME"),
    }))
    .filter((item) => item.amount !== 0); // Filter zero balances

  // Calculate Gross Revenue
  const grossRevenue =
    (salesNo1Item?.amount || 0) +
    (salesNo2Item?.amount || 0) +
    otherIncomeItems.reduce((sum, item) => sum + item.amount, 0);

  // COGS Section
  const purchasesItem: PnLLineItem | null = purchases
    ? {
        accountId: purchases.id,
        accountCode: purchases.code,
        accountName: purchases.name,
        amount: calculateBalance(purchases, "EXPENSE"),
      }
    : null;

  const freightInwardItem: PnLLineItem | null = freightInward
    ? {
        accountId: freightInward.id,
        accountCode: freightInward.code,
        accountName: freightInward.name,
        amount: calculateBalance(freightInward, "EXPENSE"),
      }
    : null;

  // Other direct expenses (4xxx except 4001, 4002)
  const directExpenseItems: PnLLineItem[] = accounts
    .filter(
      (a) =>
        a.group === "EXPENSE" &&
        a.code.startsWith("4") &&
        a.code !== "4001" &&
        a.code !== "4002",
    )
    .map((a) => ({
      accountId: a.id,
      accountCode: a.code,
      accountName: a.name,
      amount: calculateBalance(a, "EXPENSE"),
    }))
    .filter((item) => item.amount !== 0);

  // Calculate Total COGS
  const totalCOGS =
    (purchasesItem?.amount || 0) +
    (freightInwardItem?.amount || 0) +
    directExpenseItems.reduce((sum, item) => sum + item.amount, 0);

  // Gross Profit
  const grossProfit = grossRevenue - totalCOGS;
  const grossProfitPercent =
    grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;

  // Operating Expenses (5xxx)
  const operatingExpenseItems: PnLLineItem[] = accounts
    .filter((a) => a.group === "EXPENSE" && a.code.startsWith("5"))
    .map((a) => ({
      accountId: a.id,
      accountCode: a.code,
      accountName: a.name,
      amount: calculateBalance(a, "EXPENSE"),
    }))
    .filter((item) => item.amount !== 0);

  const totalOperatingExpenses = operatingExpenseItems.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  // Net Profit
  const netProfit = grossProfit - totalOperatingExpenses;
  const netProfitPercent =
    grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  return {
    salesNo1: salesNo1Item,
    salesNo2: salesNo2Item,
    otherIncome: otherIncomeItems,
    grossRevenue,
    purchases: purchasesItem,
    freightInward: freightInwardItem,
    directExpenses: directExpenseItems,
    totalCOGS,
    grossProfit,
    grossProfitPercent,
    operatingExpenses: operatingExpenseItems,
    totalOperatingExpenses,
    netProfit,
    netProfitPercent,
  };
}

/**
 * Get drill-down details for a specific P&L line item
 */
export async function getPnLDrillDown(
  accountId: string,
  startDate: Date,
  endDate: Date,
  outletId?: string,
) {
  return withErrorHandler(async () => {
    await requireAdminSession();

    const entriesWhere: any = {
      accountId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    const entries = await prisma.ledgerEntry.findMany({
      where: entriesWhere,
      include: {
        transaction: {
          select: {
            id: true,
            txnNumber: true,
            type: true,
            date: true,
            party: {
              select: {
                name: true,
              },
            },
          },
        },
        account: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return entries.map((entry) => ({
      id: entry.id,
      date: entry.date,
      reference: entry.reference,
      debit: entry.debit,
      credit: entry.credit,
      accountName: entry.account.name,
      accountCode: entry.account.code,
      transaction: entry.transaction
        ? {
            id: entry.transaction.id,
            number: entry.transaction.txnNumber,
            type: entry.transaction.type,
            date: entry.transaction.date,
            partyName: entry.transaction.party?.name,
          }
        : null,
    }));
  });
}

/**
 * Export P&L to Excel format data
 */
export async function exportPnLToExcel(
  startDate: Date,
  endDate: Date,
  outletId?: string,
  comparisonStartDate?: Date,
  comparisonEndDate?: Date,
) {
  return withErrorHandler(async () => {
    const pnlData = await getPnL(
      startDate,
      endDate,
      outletId,
      comparisonStartDate,
      comparisonEndDate,
    );

    if (!pnlData.success || !pnlData.data) {
      throw new Error("Failed to generate P&L data");
    }

    const { currentPeriod, comparisonPeriod, periodInfo, outletInfo } =
      pnlData.data;
    const hasComparison = !!comparisonPeriod;

    // Build Excel rows
    const rows: any[] = [];

    // Header
    rows.push({
      category: "Profit & Loss Statement",
      account: "",
      currentPeriod: "",
      comparisonPeriod: "",
      variance: "",
    });

    rows.push({
      category: `Period: ${periodInfo.startDate.toLocaleDateString()} - ${periodInfo.endDate.toLocaleDateString()}`,
      account: "",
      currentPeriod: "",
      comparisonPeriod: hasComparison
        ? `${periodInfo.comparisonStartDate?.toLocaleDateString()} - ${periodInfo.comparisonEndDate?.toLocaleDateString()}`
        : "",
      variance: "",
    });

    if (outletInfo) {
      rows.push({
        category: `Outlet: ${outletInfo.name}`,
        account: "",
        currentPeriod: "",
        comparisonPeriod: "",
        variance: "",
      });
    }

    rows.push({
      category: "",
      account: "",
      currentPeriod: "",
      comparisonPeriod: "",
      variance: "",
    });

    // Revenue Section
    rows.push({
      category: "REVENUE",
      account: "",
      currentPeriod: "",
      comparisonPeriod: hasComparison ? "" : undefined,
      variance: hasComparison ? "" : undefined,
    });

    if (currentPeriod.salesNo1) {
      rows.push({
        category: "",
        account: currentPeriod.salesNo1.accountName,
        currentPeriod: currentPeriod.salesNo1.amount,
        comparisonPeriod: hasComparison
          ? comparisonPeriod?.salesNo1?.amount || 0
          : undefined,
        variance: hasComparison
          ? (comparisonPeriod?.salesNo1?.amount || 0) -
            currentPeriod.salesNo1.amount
          : undefined,
      });
    }

    if (currentPeriod.salesNo2) {
      rows.push({
        category: "",
        account: currentPeriod.salesNo2.accountName,
        currentPeriod: currentPeriod.salesNo2.amount,
        comparisonPeriod: hasComparison
          ? comparisonPeriod?.salesNo2?.amount || 0
          : undefined,
        variance: hasComparison
          ? (comparisonPeriod?.salesNo2?.amount || 0) -
            currentPeriod.salesNo2.amount
          : undefined,
      });
    }

    currentPeriod.otherIncome.forEach((item) => {
      const compItem = hasComparison
        ? comparisonPeriod?.otherIncome.find(
            (i) => i.accountCode === item.accountCode,
          )
        : null;
      rows.push({
        category: "",
        account: item.accountName,
        currentPeriod: item.amount,
        comparisonPeriod: hasComparison ? compItem?.amount || 0 : undefined,
        variance: hasComparison
          ? (compItem?.amount || 0) - item.amount
          : undefined,
      });
    });

    rows.push({
      category: "",
      account: "Gross Revenue",
      currentPeriod: currentPeriod.grossRevenue,
      comparisonPeriod: hasComparison
        ? comparisonPeriod?.grossRevenue
        : undefined,
      variance: hasComparison
        ? (comparisonPeriod?.grossRevenue || 0) - currentPeriod.grossRevenue
        : undefined,
      isBold: true,
    });

    rows.push({
      category: "",
      account: "",
      currentPeriod: "",
      comparisonPeriod: "",
      variance: "",
    });

    // COGS Section
    rows.push({
      category: "COST OF GOODS SOLD",
      account: "",
      currentPeriod: "",
      comparisonPeriod: hasComparison ? "" : undefined,
      variance: hasComparison ? "" : undefined,
    });

    if (currentPeriod.purchases) {
      rows.push({
        category: "",
        account: currentPeriod.purchases.accountName,
        currentPeriod: currentPeriod.purchases.amount,
        comparisonPeriod: hasComparison
          ? comparisonPeriod?.purchases?.amount || 0
          : undefined,
        variance: hasComparison
          ? (comparisonPeriod?.purchases?.amount || 0) -
            currentPeriod.purchases.amount
          : undefined,
      });
    }

    if (currentPeriod.freightInward) {
      rows.push({
        category: "",
        account: currentPeriod.freightInward.accountName,
        currentPeriod: currentPeriod.freightInward.amount,
        comparisonPeriod: hasComparison
          ? comparisonPeriod?.freightInward?.amount || 0
          : undefined,
        variance: hasComparison
          ? (comparisonPeriod?.freightInward?.amount || 0) -
            currentPeriod.freightInward.amount
          : undefined,
      });
    }

    currentPeriod.directExpenses.forEach((item) => {
      const compItem = hasComparison
        ? comparisonPeriod?.directExpenses.find(
            (i) => i.accountCode === item.accountCode,
          )
        : null;
      rows.push({
        category: "",
        account: item.accountName,
        currentPeriod: item.amount,
        comparisonPeriod: hasComparison ? compItem?.amount || 0 : undefined,
        variance: hasComparison
          ? (compItem?.amount || 0) - item.amount
          : undefined,
      });
    });

    rows.push({
      category: "",
      account: "Total COGS",
      currentPeriod: currentPeriod.totalCOGS,
      comparisonPeriod: hasComparison ? comparisonPeriod?.totalCOGS : undefined,
      variance: hasComparison
        ? (comparisonPeriod?.totalCOGS || 0) - currentPeriod.totalCOGS
        : undefined,
      isBold: true,
    });

    rows.push({
      category: "",
      account: "",
      currentPeriod: "",
      comparisonPeriod: "",
      variance: "",
    });

    // Gross Profit
    rows.push({
      category: "",
      account: "Gross Profit",
      currentPeriod: currentPeriod.grossProfit,
      comparisonPeriod: hasComparison
        ? comparisonPeriod?.grossProfit
        : undefined,
      variance: hasComparison
        ? (comparisonPeriod?.grossProfit || 0) - currentPeriod.grossProfit
        : undefined,
      isBold: true,
    });

    rows.push({
      category: "",
      account: "Gross Profit %",
      currentPeriod: `${currentPeriod.grossProfitPercent.toFixed(2)}%`,
      comparisonPeriod: hasComparison
        ? `${comparisonPeriod?.grossProfitPercent.toFixed(2)}%`
        : undefined,
      variance: hasComparison
        ? `${((comparisonPeriod?.grossProfitPercent || 0) - currentPeriod.grossProfitPercent).toFixed(2)}%`
        : undefined,
    });

    rows.push({
      category: "",
      account: "",
      currentPeriod: "",
      comparisonPeriod: "",
      variance: "",
    });

    // Operating Expenses
    rows.push({
      category: "OPERATING EXPENSES",
      account: "",
      currentPeriod: "",
      comparisonPeriod: hasComparison ? "" : undefined,
      variance: hasComparison ? "" : undefined,
    });

    currentPeriod.operatingExpenses.forEach((item) => {
      const compItem = hasComparison
        ? comparisonPeriod?.operatingExpenses.find(
            (i) => i.accountCode === item.accountCode,
          )
        : null;
      rows.push({
        category: "",
        account: item.accountName,
        currentPeriod: item.amount,
        comparisonPeriod: hasComparison ? compItem?.amount || 0 : undefined,
        variance: hasComparison
          ? (compItem?.amount || 0) - item.amount
          : undefined,
      });
    });

    rows.push({
      category: "",
      account: "Total Operating Expenses",
      currentPeriod: currentPeriod.totalOperatingExpenses,
      comparisonPeriod: hasComparison
        ? comparisonPeriod?.totalOperatingExpenses
        : undefined,
      variance: hasComparison
        ? (comparisonPeriod?.totalOperatingExpenses || 0) -
          currentPeriod.totalOperatingExpenses
        : undefined,
      isBold: true,
    });

    rows.push({
      category: "",
      account: "",
      currentPeriod: "",
      comparisonPeriod: "",
      variance: "",
    });

    // Net Profit
    rows.push({
      category: "",
      account: "Net Profit / (Loss)",
      currentPeriod: currentPeriod.netProfit,
      comparisonPeriod: hasComparison ? comparisonPeriod?.netProfit : undefined,
      variance: hasComparison
        ? (comparisonPeriod?.netProfit || 0) - currentPeriod.netProfit
        : undefined,
      isBold: true,
      isHighlight: true,
    });

    rows.push({
      category: "",
      account: "Net Profit %",
      currentPeriod: `${currentPeriod.netProfitPercent.toFixed(2)}%`,
      comparisonPeriod: hasComparison
        ? `${comparisonPeriod?.netProfitPercent.toFixed(2)}%`
        : undefined,
      variance: hasComparison
        ? `${((comparisonPeriod?.netProfitPercent || 0) - currentPeriod.netProfitPercent).toFixed(2)}%`
        : undefined,
    });

    return { rows, hasComparison, periodInfo, outletInfo };
  });
}
