"use client";

import Link from "next/link";
import { FileText, Receipt, Plus, ArrowRight, Calculator } from "lucide-react";

const salesModules = [
  {
    title: "Quotations",
    description:
      "Create and manage professional price estimates and proforma invoices for customers.",
    icon: FileText,
    href: "/dashboard/sales/quotations",
    createHref: "/dashboard/sales/quotations/new",
    color: "blue",
  },
  {
    title: "Sales Invoices",
    description:
      "Generate tax-compliant invoices and track account receivables from customers.",
    icon: Receipt,
    href: "/dashboard/sales/invoices",
    createHref: "/dashboard/sales/invoices/new",
    color: "emerald",
  },
];

export default function SalesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Sales Hub
          </h2>
          <p className="text-slate-500 mt-1 text-lg">
            Manage your revenue workflow from lead to payment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {salesModules.map((module) => (
          <div
            key={module.title}
            className="group relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div
              className={`absolute top-0 left-0 w-1 h-full bg-${module.color}-500 group-hover:w-2 transition-all`}
            ></div>
            <div className="p-8">
              <div
                className={`w-14 h-14 rounded-xl bg-${module.color}-50 flex items-center justify-center text-${module.color}-600 mb-6 group-hover:scale-110 transition-transform`}
              >
                <module.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                {module.title}
              </h3>
              <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                {module.description}
              </p>

              <div className="flex space-x-4">
                <Link
                  href={module.href}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-3 px-6 rounded-xl flex items-center justify-center transition-colors"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link
                  href={module.createHref}
                  className={`flex-1 bg-${module.color}-600 hover:bg-${module.color}-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center shadow-lg shadow-${module.color}-200 transition-all`}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4 text-blue-400">
            <Calculator className="w-6 h-6" />
            <span className="font-bold tracking-widest uppercase text-sm">
              Quick Stats
            </span>
          </div>
          <h4 className="text-2xl font-bold mb-6">Sales Overview (MTD)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider">
                Total Sales
              </p>
              <p className="text-3xl font-extrabold">₹ 0.00</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider">
                Open Quotations
              </p>
              <p className="text-3xl font-extrabold">0</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider">
                Unpaid Invoices
              </p>
              <p className="text-3xl font-extrabold">0</p>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 p-8">
          <Link
            href="/dashboard/reports/sales"
            className="text-blue-400 hover:text-blue-300 font-medium text-sm flex items-center group"
          >
            Open detailed reports
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
