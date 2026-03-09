"use server";

import { getProfitAndLoss } from "@/actions/reports";
import {
  TrendingUp,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default async function PnLPage() {
  const data = await getProfitAndLoss();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Profit & Loss</h2>
            <p className="text-sm text-slate-500">
              Income vs Expenditure Statement.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Income Side */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center">
              <ArrowUpRight className="w-4 h-4 mr-2 text-emerald-500" />
              Incomes
            </h3>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {data.incomes.map((item) => (
              <div
                key={item.name}
                className="px-6 py-4 flex justify-between items-center hover:bg-slate-50"
              >
                <span className="text-sm font-medium text-slate-700">
                  {item.name}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  ₹{item.amount.toLocaleString()}
                </span>
              </div>
            ))}
            <div className="px-6 py-5 bg-emerald-50/50 flex justify-between items-center border-t border-emerald-100">
              <span className="text-sm font-black text-emerald-800">
                Total Income
              </span>
              <span className="text-lg font-black text-emerald-700 font-mono">
                ₹
                {data.incomes
                  .reduce((s, i) => s + i.amount, 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Expense Side */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center">
              <ArrowDownRight className="w-4 h-4 mr-2 text-red-500" />
              Expenses
            </h3>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {data.expenses.map((item) => (
              <div
                key={item.name}
                className="px-6 py-4 flex justify-between items-center hover:bg-slate-50"
              >
                <span className="text-sm font-medium text-slate-700">
                  {item.name}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  ₹{item.amount.toLocaleString()}
                </span>
              </div>
            ))}
            <div className="px-6 py-5 bg-red-50/50 flex justify-between items-center border-t border-red-100">
              <span className="text-sm font-black text-red-800">
                Total Expense
              </span>
              <span className="text-lg font-black text-red-700 font-mono">
                ₹
                {data.expenses
                  .reduce((s, i) => s + i.amount, 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`rounded-2xl p-8 border-2 flex flex-col items-center justify-center space-y-2 shadow-lg transition-all
        ${
          data.netProfit >= 0
            ? "bg-emerald-600 border-emerald-500 text-white shadow-emerald-200/50"
            : "bg-red-600 border-red-500 text-white shadow-red-200/50"
        }
      `}
      >
        <div className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">
          Net {data.netProfit >= 0 ? "Profit" : "Loss"}
        </div>
        <div className="text-5xl font-black font-mono">
          ₹{Math.abs(data.netProfit).toLocaleString()}
        </div>
        <div className="flex items-center text-xs font-medium space-x-2 pt-2">
          <TrendingUp
            className={`w-4 h-4 ${data.netProfit < 0 ? "rotate-180" : ""}`}
          />
          <span>
            Operational efficiency is{" "}
            {data.netProfit > 100000 ? "excellent" : "normal"}.
          </span>
        </div>
      </div>
    </div>
  );
}
