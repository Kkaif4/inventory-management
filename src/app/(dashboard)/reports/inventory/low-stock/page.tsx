"use server";

import { getLowStockReport } from "@/actions/reports";
import {
  AlertTriangle,
  PackageSearch,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default async function LowStockReportPage() {
  const data = await getLowStockReport();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Low Stock Alerts
            </h2>
            <p className="text-sm text-slate-500">
              Items nearing or below minimum threshold levels.
            </p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg text-amber-700 text-xs font-bold uppercase tracking-wider">
          {data.length} Alerts Found
        </div>
      </div>

      {data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
          <PackageSearch className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">
            All stock levels healthy
          </h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-1">
            No items are currently below their minimum stock levels.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Product Variant</th>
                <th className="px-6 py-4 text-center">Min Level</th>
                <th className="px-6 py-4 text-center">Current Physical</th>
                <th className="px-6 py-4 text-center text-red-600">Shortage</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item) => (
                <tr
                  key={item.sku}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">
                      {item.productName}
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      {item.sku}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-slate-600 font-medium">
                    {item.minLevel}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                      {item.currentStock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-black text-red-600">
                    -{item.shortage}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href="/dashboard/purchases/orders/new"
                      className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                      Restock
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-slate-100/50 p-4 rounded-lg flex items-start space-x-3">
        <div className="mt-0.5 w-4 h-4 rounded-full bg-slate-300 flex items-center justify-center text-[10px] text-white font-bold">
          i
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Stock levels are calculated based on the <b>Physical Quantity</b>{" "}
          across all warehouses. Min levels are configured in the Product
          Variant master.
        </p>
      </div>
    </div>
  );
}
