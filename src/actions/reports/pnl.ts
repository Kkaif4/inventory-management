"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/error-handler";
import { requireAdminSession, getSessionWithOutlets } from "@/lib/outlet-auth";
import { roundToTwo } from "@/lib/utils";

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
 * Calculate P&L for a single period using actual transaction data
 * No longer dependent on GL accounts — derives from transactions and expenses
 */
async function calculatePnLPeriod(
  startDate: Date,
  endDate: Date,
  outletId?: string,
): Promise<PnLStructure> {
  // ─── SALES REVENUE ───────────────────────────────────────────────────────
  // Sum of all SALES_INVOICE grand totals
  const salesInvoices = await prisma.transaction.groupBy({
    by: ["billType"],
    where: {
      type: "SALES_INVOICE",
      date: { gte: startDate, lte: endDate },
      status: { in: ["POSTED", "PARTIALLY_PAID", "PAID"] },
      ...(outletId && { outletId }),
    },
    _sum: { grandTotal: true },
  });

  const salesNo1Amount = roundToTwo(
    salesInvoices.find((s) => s.billType === "NO1")?._sum.grandTotal ?? 0,
  );
  const salesNo2Amount = roundToTwo(
    salesInvoices.find((s) => s.billType === "NO2")?._sum.grandTotal ?? 0,
  );

  const salesNo1Item: PnLLineItem | null = salesNo1Amount > 0
    ? {
        accountId: "sales-no1-synthetic",
        accountCode: "3001",
        accountName: "Sales (NO1 - GST)",
        amount: salesNo1Amount,
      }
    : null;

  const salesNo2Item: PnLLineItem | null = salesNo2Amount > 0
    ? {
        accountId: "sales-no2-synthetic",
        accountCode: "3002",
        accountName: "Cash Sales (NO2)",
        amount: salesNo2Amount,
      }
    : null;

  const grossRevenue = roundToTwo(salesNo1Amount + salesNo2Amount);

  // ─── COST OF GOODS SOLD ──────────────────────────────────────────────────
  // Purchase Bills: Sum of BILL grand totals
  const purchaseBills = await prisma.transaction.aggregate({
    where: {
      type: "PURCHASE_BILL",
      date: { gte: startDate, lte: endDate },
      status: { in: ["POSTED", "PARTIALLY_PAID", "PAID"] },
      ...(outletId && { outletId }),
    },
    _sum: { grandTotal: true },
  });

  const purchasesAmount = roundToTwo(purchaseBills._sum.grandTotal ?? 0);

  const purchasesItem: PnLLineItem | null = purchasesAmount > 0
    ? {
        accountId: "purchases-synthetic",
        accountCode: "4001",
        accountName: "Purchases",
        amount: purchasesAmount,
      }
    : null;

  // Freight: Sum of freightCost from all invoices/bills
  const freightTotal = await prisma.transaction.aggregate({
    where: {
      type: { in: ["SALES_INVOICE", "PURCHASE_BILL"] },
      date: { gte: startDate, lte: endDate },
      status: { in: ["POSTED", "PARTIALLY_PAID", "PAID"] },
      ...(outletId && { outletId }),
    },
    _sum: { freightCost: true },
  });

  const freightAmount = roundToTwo(freightTotal._sum.freightCost ?? 0);

  const freightInwardItem: PnLLineItem | null = freightAmount > 0
    ? {
        accountId: "freight-synthetic",
        accountCode: "4002",
        accountName: "Freight Inward",
        amount: freightAmount,
      }
    : null;

  const totalCOGS = roundToTwo(purchasesAmount + freightAmount);

  // Gross Profit
  const grossProfit = roundToTwo(grossRevenue - totalCOGS);
  const grossProfitPercent =
    grossRevenue > 0 ? roundToTwo((grossProfit / grossRevenue) * 100) : 0;

  // ─── OPERATING EXPENSES ──────────────────────────────────────────────────
  // Group expenses by category
  const expenses = await prisma.expense.groupBy({
    by: ["categoryId"],
    where: {
      date: { gte: startDate, lte: endDate },
      ...(outletId && { outletId }),
    },
    _sum: { totalAmount: true },
  });

  // Fetch category names for labeling
  const categoryIds = expenses.map((e) => e.categoryId);
  const categories = await prisma.expenseCategory.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });

  const categoryMap = Object.fromEntries(
    categories.map((c) => [c.id, c.name]),
  );

  const operatingExpenseItems: PnLLineItem[] = expenses
    .map((exp) => {
      const amount = roundToTwo(Number(exp._sum.totalAmount ?? 0));
      return {
        accountId: exp.categoryId,
        accountCode: "5xxx",
        accountName: categoryMap[exp.categoryId] || "Unknown Category",
        amount,
      };
    })
    .filter((item) => item.amount > 0);

  const totalOperatingExpenses = roundToTwo(
    operatingExpenseItems.reduce((sum, item) => sum + item.amount, 0),
  );

  // Net Profit
  const netProfit = roundToTwo(grossProfit - totalOperatingExpenses);
  const netProfitPercent =
    grossRevenue > 0 ? roundToTwo((netProfit / grossRevenue) * 100) : 0;

  return {
    salesNo1: salesNo1Item,
    salesNo2: salesNo2Item,
    otherIncome: [], // No other income tracked currently
    grossRevenue,
    purchases: purchasesItem,
    freightInward: freightInwardItem,
    directExpenses: [], // Direct expenses rolled into COGS
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
 * accountId format: "sales-no1-synthetic", "sales-no2-synthetic", "purchases-synthetic", or actual categoryId
 */
export async function getPnLDrillDown(
  accountId: string,
  startDate: Date,
  endDate: Date,
  outletId?: string,
) {
  return withErrorHandler(async () => {
    await requireAdminSession();

    // Synthetic accounts (sales, purchases, freight)
    if (accountId.includes("synthetic")) {
      if (accountId === "sales-no1-synthetic") {
        const invoices = await prisma.transaction.findMany({
          where: {
            type: "SALES_INVOICE",
            billType: "NO1",
            date: { gte: startDate, lte: endDate },
            status: { in: ["POSTED", "PARTIALLY_PAID", "PAID"] },
            ...(outletId && { outletId }),
          },
          select: {
            id: true,
            txnNumber: true,
            date: true,
            grandTotal: true,
            party: { select: { name: true } },
          },
          orderBy: { date: "desc" },
        });
        return invoices.map((inv) => ({
          id: inv.id,
          date: inv.date,
          reference: inv.txnNumber,
          debit: 0,
          credit: inv.grandTotal,
          accountName: "Sales (NO1 - GST)",
          accountCode: "3001",
          transaction: {
            id: inv.id,
            number: inv.txnNumber,
            type: "SALES_INVOICE",
            date: inv.date,
            partyName: inv.party?.name,
          },
        }));
      } else if (accountId === "sales-no2-synthetic") {
        const invoices = await prisma.transaction.findMany({
          where: {
            type: "SALES_INVOICE",
            billType: "NO2",
            date: { gte: startDate, lte: endDate },
            status: { in: ["POSTED", "PARTIALLY_PAID", "PAID"] },
            ...(outletId && { outletId }),
          },
          select: {
            id: true,
            txnNumber: true,
            date: true,
            grandTotal: true,
          },
          orderBy: { date: "desc" },
        });
        return invoices.map((inv) => ({
          id: inv.id,
          date: inv.date,
          reference: inv.txnNumber,
          debit: 0,
          credit: inv.grandTotal,
          accountName: "Cash Sales (NO2)",
          accountCode: "3002",
          transaction: {
            id: inv.id,
            number: inv.txnNumber,
            type: "SALES_INVOICE",
            date: inv.date,
            partyName: null,
          },
        }));
      } else if (accountId === "purchases-synthetic") {
        const bills = await prisma.transaction.findMany({
          where: {
            type: "PURCHASE_BILL",
            date: { gte: startDate, lte: endDate },
            status: { in: ["POSTED", "PARTIALLY_PAID", "PAID"] },
            ...(outletId && { outletId }),
          },
          select: {
            id: true,
            txnNumber: true,
            date: true,
            grandTotal: true,
            party: { select: { name: true } },
          },
          orderBy: { date: "desc" },
        });
        return bills.map((bill) => ({
          id: bill.id,
          date: bill.date,
          reference: bill.txnNumber,
          debit: bill.grandTotal,
          credit: 0,
          accountName: "Purchases",
          accountCode: "4001",
          transaction: {
            id: bill.id,
            number: bill.txnNumber,
            type: "PURCHASE_BILL",
            date: bill.date,
            partyName: bill.party?.name,
          },
        }));
      }
    }

    // Real account IDs: Expense categories
    const expenses = await prisma.expense.findMany({
      where: {
        categoryId: accountId,
        date: { gte: startDate, lte: endDate },
        ...(outletId && { outletId }),
      },
      select: {
        id: true,
        date: true,
        totalAmount: true,
        description: true,
        category: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    });

    return expenses.map((exp) => ({
      id: exp.id,
      date: exp.date,
      reference: exp.description || "Expense",
      debit: Number(exp.totalAmount),
      credit: 0,
      accountName: exp.category.name,
      accountCode: "5xxx",
      transaction: {
        id: exp.id,
        number: exp.id,
        type: "EXPENSE",
        date: exp.date,
        partyName: null,
      },
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
