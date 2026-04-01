"use client";

import React from "react";
import Link from "next/link";
import { BarChart3, PieChart, FileText, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const reports = [
  {
    title: "Expense Register",
    description: "Complete record of all expenses with detailed breakdown",
    href: "/dashboard/expenses/reports/register",
    icon: FileText,
    color: "blue",
  },
  {
    title: "By Category",
    description: "Expenses grouped by category with percentages",
    href: "/dashboard/expenses/reports/by-category",
    icon: PieChart,
    color: "purple",
  },
  {
    title: "GST Summary",
    description: "Input GST breakdown by rate with recoverable amount",
    href: "/dashboard/expenses/reports/gst-summary",
    icon: BarChart3,
    color: "green",
  },
  {
    title: "Dashboard",
    description: "Key metrics, trends, and expense analytics",
    href: "/dashboard/expenses/dashboard",
    icon: TrendingDown,
    color: "orange",
  },
];

const colorClasses = {
  blue: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  purple: "bg-purple-50 border-purple-200 hover:bg-purple-100",
  green: "bg-green-50 border-green-200 hover:bg-green-100",
  orange: "bg-orange-50 border-orange-200 hover:bg-orange-100",
};

const iconColorClasses = {
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-purple-100 text-purple-600",
  green: "bg-green-100 text-green-600",
  orange: "bg-orange-100 text-orange-600",
};

export default function ExpenseReportsPage() {
  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">Expense Reports</h1>
        <p className="text-sm text-slate-500 mt-1">
          Access detailed expense analysis and reporting tools
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const bgClass =
            colorClasses[report.color as keyof typeof colorClasses];
          const iconClass =
            iconColorClasses[report.color as keyof typeof iconColorClasses];
          const Icon = report.icon;

          return (
            <Link key={report.href} href={report.href}>
              <div
                className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${bgClass}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${iconClass}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {report.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {report.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm">
                    View Report →
                  </Button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-base font-semibold text-blue-900 mb-3">
          📊 Report Tips
        </h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Use the Expense Register to see all transactions with full details</li>
          <li>• Check the By Category report to identify spending patterns</li>
          <li>• Monitor GST Summary for input tax credit opportunities</li>
          <li>• View the Dashboard for quick insights and key metrics</li>
          <li>• All reports support date range filtering and Excel export</li>
        </ul>
      </div>
    </div>
  );
}
