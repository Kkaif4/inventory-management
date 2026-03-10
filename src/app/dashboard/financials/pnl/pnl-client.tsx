"use client";

import { PageHeader } from "@/components/ui/page-header";

export function PNLClient({
  data,
}: {
  data: { income: any[]; expense: any[] };
}) {
  const totalIncome = data.income.reduce((sum, a) => sum + a.balance, 0);
  const totalExpense = data.expense.reduce((sum, a) => sum + a.balance, 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profit & Loss Statement"
        subtitle="Summary of revenue, costs, and expenses."
        breadcrumbs={[{ label: "Financials" }, { label: "P&L" }]}
      />

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4 bg-surface-base border border-border-default rounded-lg p-6">
          <h3 className="text-lg font-bold text-green-600 border-b pb-2">
            Revenue / Income
          </h3>
          <div className="space-y-2">
            {data.income.map((a, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{a.name}</span>
                <span className="font-medium font-mono text-xs">
                  ₹{a.balance.toFixed(2)}
                </span>
              </div>
            ))}
            <div className="pt-4 border-t flex justify-between font-bold">
              <span>Total Income</span>
              <span>₹{totalIncome.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-surface-base border border-border-default rounded-lg p-6">
          <h3 className="text-lg font-bold text-red-600 border-b pb-2">
            Expenses
          </h3>
          <div className="space-y-2">
            {data.expense.map((a, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{a.name}</span>
                <span className="font-medium font-mono text-xs">
                  ₹{a.balance.toFixed(2)}
                </span>
              </div>
            ))}
            <div className="pt-4 border-t flex justify-between font-bold">
              <span>Total Expense</span>
              <span>₹{totalExpense.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`p-6 rounded-lg border-2 flex justify-between items-center ${netProfit >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
      >
        <div>
          <h4 className="text-sm font-medium uppercase tracking-wider text-text-secondary">
            Net Profit / Loss
          </h4>
          <p className="text-3xl font-black">₹{netProfit.toFixed(2)}</p>
        </div>
        <div
          className={`text-sm font-bold px-3 py-1 rounded-full ${netProfit >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {netProfit >= 0 ? "PROFITABLE" : "LOSS INCURRED"}
        </div>
      </div>
    </div>
  );
}
