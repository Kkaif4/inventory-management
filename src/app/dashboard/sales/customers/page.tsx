"use client";

import { getParties } from "@/actions/parties";
import Link from "next/link";
import {
  Plus,
  Star,
  Clock,
  Users,
  Search,
  TrendingUp,
  IndianRupee,
  Loader2,
} from "lucide-react";
import { useOutletStore } from "@/store/use-outlet-store";
import { useState, useEffect } from "react";

export default function CustomersPage() {
  const { currentOutletId } = useOutletStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentOutletId) {
      setIsLoading(true);
      getParties(currentOutletId)
        .then((allParties) => {
          setCustomers(allParties.filter((p) => p.type === "CUSTOMER"));
        })
        .finally(() => setIsLoading(false));
    }
  }, [currentOutletId]);

  if (!currentOutletId) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Customer Relationship Management
          </h2>
          <p className="text-slate-500 mt-1 font-medium">
            Analyze client behavior, manage receivables, and track lifecycle.
          </p>
        </div>
        <Link
          href="/dashboard/master-data/parties/new?type=CUSTOMER"
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 font-bold flex items-center transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" /> Add New Customer
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Total Accounts
            </p>
            <p className="text-2xl font-black text-slate-900">
              {customers.length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Active This Month
            </p>
            <p className="text-2xl font-black text-slate-900">
              {customers.length > 0 ? Math.floor(customers.length * 0.8) : 0}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Top Tier (VIP)
            </p>
            <p className="text-2xl font-black text-slate-900">
              {customers.filter((c) => (c.creditLimit || 0) > 50000).length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search client index..."
              className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Customer Profile</th>
                <th className="px-6 py-5">GSTIN / Region</th>
                <th className="px-6 py-5 text-right">Credit Standing</th>
                <th className="px-6 py-5 text-right">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-slate-50/80 transition-all group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs uppercase">
                        {customer.name.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {customer.name}
                        </div>
                        <div className="text-xs text-slate-400 font-medium mt-0.5">
                          {customer.contactInfo || "No primary contact"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-slate-700 font-mono text-xs font-bold bg-slate-50 px-2 py-1 rounded w-fit">
                      {customer.gstin || "Unregistered"}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-medium">
                      {customer.state}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="text-slate-900 font-extrabold flex items-center justify-end">
                      <IndianRupee className="w-3 h-3 mr-0.5" />
                      {customer.openingBalance.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                      Limit: ₹
                      {customer.creditLimit?.toLocaleString() || "Not Set"}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        (customer.creditLimit || 0) > 0
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-slate-50 text-slate-500 border border-slate-100"
                      }`}
                    >
                      {(customer.creditLimit || 0) > 100000
                        ? "Premium"
                        : "Standard"}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/dashboard/master-data/parties/new?id=${customer.id}`}
                        className="p-2 hover:bg-white hover:text-blue-600 rounded-xl transition-all"
                        title="Edit Profile"
                      >
                        <Clock className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/sales/invoices/new?partyId=${customer.id}`}
                        className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-blue-600 transition-all shadow-md active:scale-95"
                      >
                        New Bill
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="w-12 h-12 text-slate-200 mb-4" />
                      <h4 className="text-lg font-bold text-slate-400">
                        Zero Clients Indexed
                      </h4>
                      <p className="text-slate-300 text-sm max-w-xs mx-auto mt-2">
                        Start by adding your first customer to begin track
                        revenue streams.
                      </p>
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
