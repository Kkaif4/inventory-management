export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Settings as SettingsIcon,
  Building2,
  ShieldCheck,
  Gauge,
  Save,
} from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="p-12 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-inner">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          Access Restricted
        </h2>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">
          Global system configurations are only accessible by users with the{" "}
          <b>ADMIN</b> role.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24 px-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-200">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            System Settings
          </h2>
          <p className="text-slate-500 font-medium tracking-wide text-sm opacity-80">
            Enterprise resource configuration and company identity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Company Profile Section */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-indigo-500" />
              <h3 className="font-black text-slate-800 uppercase tracking-tighter text-sm">
                Company Identity
              </h3>
            </div>
          </div>
          <div className="p-8">
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    Legal Entity Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-900"
                    placeholder="e.g. Acme Industrial"
                    defaultValue="Acme Industrial Hardware"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    GST Registration (GSTIN)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all font-mono font-bold text-slate-900"
                    placeholder="27ABCDE1234F1Z5"
                    defaultValue="27ABCDE1234F1Z5"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    Registered Global Address
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-900"
                    placeholder="123 Industrial Estate..."
                    defaultValue="123 Industrial Estate, Sector 5, Maharashtra"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-slate-100">
                <button
                  type="button"
                  className="bg-slate-900 text-white px-8 py-3 rounded-2xl hover:bg-indigo-600 transition-all font-bold text-sm flex items-center shadow-lg shadow-slate-200"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Apply Changes
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* System Defaults */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gauge className="w-5 h-5 text-indigo-500" />
              <h3 className="font-black text-slate-800 uppercase tracking-tighter text-sm">
                Engine Defaults
              </h3>
            </div>
          </div>
          <div className="p-8">
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-6 border-b border-slate-50">
                <div>
                  <h4 className="font-bold text-slate-900">
                    Financial Reporting Cycle
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Standardizes tax periods and annual closures
                  </p>
                </div>
                <select className="px-6 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 outline-none cursor-pointer">
                  <option>01 April (FY)</option>
                  <option>01 January (CY)</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="max-w-md">
                  <h4 className="font-bold text-slate-900">
                    Landed Cost Automation
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                    When enabled, freight and secondary costs are automatically
                    amortized across line items using the Moving Average Price
                    (MAP) model.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                </label>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
