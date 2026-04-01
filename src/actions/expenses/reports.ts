"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/error-handler";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import type {
  ExpenseRegisterRow,
  ExpenseByCategoryRow,
  ExpenseGSTRow,
  ExpenseDashboardMetrics,
} from "@/types/expense.types";

/**
 * Get expense register report
 * List all expenses with amounts and details
 */
export async function getExpenseRegisterReport(
  outletId: string,
  filters?: {
    dateFrom?: Date;
    dateTo?: Date;
    categoryId?: string;
    status?: string;
  }
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    // Build where clause
    const where: any = { outletId };

    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.date.lte = filters.dateTo;
      }
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    // Get expenses
    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
        vendor: true,
        account: true,
      },
      orderBy: [{ date: "desc" }, { txnNumber: "desc" }],
    });

    // Format as register rows
    const rows: ExpenseRegisterRow[] = expenses.map((exp) => ({
      id: exp.id,
      txnNumber: exp.txnNumber,
      date: exp.date.toISOString().split("T")[0],
      category: exp.category.name,
      vendor: exp.vendor?.name,
      description: exp.description,
      taxable: Number(exp.taxableAmount),
      gst: Number(exp.inputGst),
      total: Number(exp.totalAmount),
      account: exp.account.name,
      status: exp.status,
    }));

    // Calculate totals
    const totals = {
      totalTaxable: Number(
        expenses.reduce((sum, e) => sum + Number(e.taxableAmount), 0)
      ),
      totalGst: Number(expenses.reduce((sum, e) => sum + Number(e.inputGst), 0)),
      totalAmount: Number(expenses.reduce((sum, e) => sum + Number(e.totalAmount), 0)),
      count: expenses.length,
    };

    return {
      rows,
      totals,
    };
  });
}

/**
 * Get expenses grouped by category
 * Summary with count and totals per category
 */
export async function getExpensesByCategoryReport(
  outletId: string,
  filters?: {
    dateFrom?: Date;
    dateTo?: Date;
    status?: string;
  }
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    // Build where clause
    const where: any = { outletId };

    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.date.lte = filters.dateTo;
      }
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    // Get all expenses with category
    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { date: "desc" },
    });

    // Group by category
    const grouped = new Map<
      string,
      {
        category: string;
        count: number;
        totalTaxable: number;
        totalGst: number;
        total: number;
      }
    >();

    for (const exp of expenses) {
      const key = exp.category.id;
      const existing = grouped.get(key) || {
        category: exp.category.name,
        count: 0,
        totalTaxable: 0,
        totalGst: 0,
        total: 0,
      };

      existing.count++;
      existing.totalTaxable = existing.totalTaxable + Number(exp.taxableAmount);
      existing.totalGst = existing.totalGst + Number(exp.inputGst);
      existing.total = existing.total + Number(exp.totalAmount);

      grouped.set(key, existing);
    }

    // Calculate grand totals
    const data = Array.from(grouped.values());
    const grandTotal = data.reduce((sum, cat) => sum + cat.total, 0);

    // Convert to rows with percentage
    const rows: ExpenseByCategoryRow[] = data.map((cat) => ({
      category: cat.category,
      count: cat.count,
      totalTaxable: cat.totalTaxable,
      totalGst: cat.totalGst,
      total: cat.total,
      percentOfTotal: grandTotal > 0 ? (cat.total / grandTotal) * 100 : 0,
    }));

    // Sort by total descending
    rows.sort((a, b) => b.total - a.total);

    return {
      rows,
      grandTotal,
      totalCount: expenses.length,
    };
  });
}

/**
 * Get GST summary report
 * Breakdown of Input GST by rate
 */
export async function getGstSummaryReport(
  outletId: string,
  filters?: {
    dateFrom?: Date;
    dateTo?: Date;
    status?: string;
  }
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    // Build where clause
    const where: any = {
      outletId,
      gstRate: { not: null },
    };

    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.date.lte = filters.dateTo;
      }
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    // Get expenses with GST
    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
    });

    // Group by GST rate
    const grouped = new Map<
      number,
      {
        gstRate: number;
        count: number;
        taxableAmount: number;
        gstAmount: number;
        totalAmount: number;
      }
    >();

    for (const exp of expenses) {
      const rate = exp.gstRate || 0;
      const existing = grouped.get(rate) || {
        gstRate: rate,
        count: 0,
        taxableAmount: 0,
        gstAmount: 0,
        totalAmount: 0,
      };

      existing.count++;
      existing.taxableAmount = existing.taxableAmount + Number(exp.taxableAmount);
      existing.gstAmount = existing.gstAmount + Number(exp.inputGst);
      existing.totalAmount = existing.totalAmount + Number(exp.totalAmount);

      grouped.set(rate, existing);
    }

    // Convert to rows
    const rows: ExpenseGSTRow[] = Array.from(grouped.values()).map((row) => ({
      gstRate: row.gstRate,
      count: row.count,
      taxableAmount: row.taxableAmount,
      gstAmount: row.gstAmount,
      totalAmount: row.totalAmount,
    }));

    // Sort by GST rate
    rows.sort((a, b) => a.gstRate - b.gstRate);

    // Calculate totals
    const totals = {
      totalTaxable: rows.reduce((sum, r) => sum + r.taxableAmount, 0),
      totalGst: rows.reduce((sum, r) => sum + r.gstAmount, 0),
      totalAmount: rows.reduce((sum, r) => sum + r.totalAmount, 0),
      count: rows.reduce((sum, r) => sum + r.count, 0),
    };

    return {
      rows,
      totals,
      gstRecoverable: totals.totalGst,
    };
  });
}

/**
 * Get dashboard metrics
 * KPIs and summary data
 */
export async function getExpenseDashboardMetrics(
  outletId: string,
  filters?: {
    dateFrom?: Date;
    dateTo?: Date;
  }
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    // Build where clause
    const where: any = {
      outletId,
      status: "POSTED",
    };

    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.date.lte = filters.dateTo;
      }
    }

    // Get all expenses
    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
      },
    });

    // Calculate metrics
    const totalExpenses = Number(
      expenses.reduce((sum, e) => sum + Number(e.totalAmount), 0)
    );
    const transactionCount = expenses.length;
    const averageExpense =
      transactionCount > 0 ? totalExpenses / transactionCount : 0;

    // Top categories
    const categoryMap = new Map<
      string,
      { name: string; total: number }
    >();
    for (const exp of expenses) {
      const existing = categoryMap.get(exp.category.id) || {
        name: exp.category.name,
        total: 0,
      };
      existing.total = existing.total + Number(exp.totalAmount);
      categoryMap.set(exp.category.id, existing);
    }

    const topCategories = Array.from(categoryMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Cash vs Bank
    let cashTotal = 0;
    let bankTotal = 0;
    for (const exp of expenses) {
      const amount = Number(exp.totalAmount);
      if (exp.paymentMode === "CASH") {
        cashTotal += amount;
      } else {
        bankTotal += amount;
      }
    }

    // GST recoverable
    const gstRecoverable = Number(
      expenses.reduce((sum, e) => sum + Number(e.inputGst), 0)
    );

    return {
      totalExpenses,
      transactionCount,
      averageExpense,
      topCategories,
      cashVsBank: {
        cash: cashTotal,
        bank: bankTotal,
      },
      gstRecoverable,
    } as ExpenseDashboardMetrics;
  });
}
