"use client";

import React, { useEffect, useState } from "react";
import { Loader2, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useOutletStore } from "@/store/use-outlet-store";
import { getExpenseDashboardMetrics, getExpenseRegisterReport } from "@/actions/expenses/reports";
import type { ExpenseDashboardMetrics, ExpenseListItem } from "@/types/expense.types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatPercentage(value: number) {
  return (value * 100).toFixed(1) + "%";
}

export default function ExpenseDashboardPage() {
  const outletId = useOutletStore((state) => state.currentOutlet?.id);
  const [metrics, setMetrics] = useState<ExpenseDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const loadMetrics = async () => {
    if (!outletId) return;

    try {
      setLoading(true);
      const res = await getExpenseDashboardMetrics(outletId, {
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      });

      if (!res.success || !res.data) {
        toast.error(res.error?.message || "Failed to load metrics");
        return;
      }

      setMetrics(res.data);
    } catch (error) {
      toast.error("Failed to load metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [outletId]);

  if (!outletId || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">Expense Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Overview of your expense metrics and trends
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="date-from" className="text-xs font-semibold mb-2">
              From Date
            </Label>
            <Input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="date-to" className="text-xs font-semibold mb-2">
              To Date
            </Label>
            <Input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={loadMetrics}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Apply Filters"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                Total Expenses
              </p>
              <p className="text-3xl font-black text-blue-900 mt-2">
                {formatCurrency(metrics.totalExpenses)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-200 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Transaction Count */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                Transactions
              </p>
              <p className="text-3xl font-black text-purple-900 mt-2">
                {metrics.transactionCount}
              </p>
              <p className="text-xs text-purple-600 mt-2">total expenses</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-200 flex items-center justify-center">
              <span className="text-lg font-bold text-purple-600">∑</span>
            </div>
          </div>
        </div>

        {/* Average Expense */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                Average Expense
              </p>
              <p className="text-3xl font-black text-green-900 mt-2">
                {formatCurrency(metrics.averageExpense)}
              </p>
              <p className="text-xs text-green-600 mt-2">per transaction</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-200 flex items-center justify-center">
              <span className="text-lg font-bold text-green-600">~</span>
            </div>
          </div>
        </div>

        {/* GST Recoverable */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                GST Recoverable
              </p>
              <p className="text-3xl font-black text-orange-900 mt-2">
                {formatCurrency(metrics.gstRecoverable)}
              </p>
              <p className="text-xs text-orange-600 mt-2">input tax credit</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-200 flex items-center justify-center">
              <span className="text-lg font-bold text-orange-600">₹</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Mode Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            Payment Mode Breakdown
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Cash</span>
                <span className="text-sm font-bold text-slate-900">
                  {formatCurrency(metrics.cashVsBank.cash)}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${
                      metrics.totalExpenses > 0
                        ? (metrics.cashVsBank.cash / metrics.totalExpenses) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {formatPercentage(
                  metrics.totalExpenses > 0
                    ? metrics.cashVsBank.cash / metrics.totalExpenses
                    : 0
                )}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Bank & Others</span>
                <span className="text-sm font-bold text-slate-900">
                  {formatCurrency(metrics.cashVsBank.bank)}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{
                    width: `${
                      metrics.totalExpenses > 0
                        ? (metrics.cashVsBank.bank / metrics.totalExpenses) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {formatPercentage(
                  metrics.totalExpenses > 0
                    ? metrics.cashVsBank.bank / metrics.totalExpenses
                    : 0
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            Top {Math.min(5, metrics.topCategories.length)} Categories
          </h3>

          <div className="space-y-3">
            {metrics.topCategories.map((cat, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">
                    {cat.name}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(cat.total)}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{
                      width: `${
                        metrics.totalExpenses > 0
                          ? (cat.total / metrics.totalExpenses) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {formatPercentage(
                    metrics.totalExpenses > 0
                      ? cat.total / metrics.totalExpenses
                      : 0
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 rounded-xl p-6 border border-slate-200">
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-1">
            Most Used Category
          </p>
          <p className="text-lg font-bold text-slate-900">
            {metrics.topCategories.length > 0
              ? metrics.topCategories[0]?.name
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-1">
            Preferred Payment Mode
          </p>
          <p className="text-lg font-bold text-slate-900">
            {metrics.cashVsBank.cash > metrics.cashVsBank.bank ? "Cash" : "Bank"}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-1">
            ITC Opportunity
          </p>
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(metrics.gstRecoverable)}
          </p>
        </div>
      </div>
    </div>
  );
}
