"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  ChevronRight,
  Filter,
  FileDown,
} from "lucide-react";
import { getQuotations } from "@/actions/sales/quotation";

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getQuotations().then((data) => {
      setQuotations(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quotations
          </h2>
          <p className="text-slate-500">
            Manage and track your sales price estimates.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/sales"
            className="text-sm text-slate-600 hover:text-slate-900 font-medium"
          >
            Back to Hub
          </Link>
          <Link
            href="/dashboard/sales/quotations/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center shadow-lg shadow-blue-100 transition-all border border-blue-500/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Quotation
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by number or customer..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-slate-500 hover:bg-white hover:text-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-sm sm:shadow-none">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-500 hover:bg-white hover:text-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-sm sm:shadow-none">
              <FileDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Number</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Total Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-6">
                        <div className="h-4 bg-slate-100 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="h-4 bg-slate-100 rounded w-40"></div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="h-4 bg-slate-100 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="h-4 bg-slate-100 rounded w-20 ml-auto"></div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="h-6 bg-slate-100 rounded-full w-16 mx-auto"></div>
                      </td>
                      <td className="px-6 py-6"></td>
                    </tr>
                  ))
              ) : quotations.length > 0 ? (
                quotations.map((q) => (
                  <tr
                    key={q.id}
                    className="hover:bg-slate-50 group cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-5">
                      <span className="font-bold text-slate-900">
                        {q.txnNumber}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">
                          {q.party?.name || "Cash Customer"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {q.party?.contactInfo}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">
                      {new Date(q.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right font-extrabold text-slate-900">
                      ₹{" "}
                      {q.grandTotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${
                          q.status === "POSTED"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-amber-100 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-end space-x-1">
                        <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 shadow-sm border border-transparent hover:border-slate-100 transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                        <FileText className="w-8 h-8" />
                      </div>
                      <p className="text-slate-500 font-medium">
                        No quotations found.
                      </p>
                      <p className="text-sm text-slate-400 mt-1 mb-6">
                        Bring your estimates here to start selling.
                      </p>
                      <Link
                        href="/dashboard/sales/quotations/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Quotation
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
