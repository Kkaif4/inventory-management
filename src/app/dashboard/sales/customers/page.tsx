"use client";

import { getPartiesWithBalances } from "@/actions/parties";
import Link from "next/link";
import {
  Plus,
  Star,
  Users,
  Search,
  Loader2,
  TrendingUp,
  IndianRupee,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { useOutletStore } from "@/store/use-outlet-store";
import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Customer {
  id: string;
  name: string;
  type: "CUSTOMER";
  contactInfo: string | null;
  gstin: string | null;
  state: string;
  creditLimit: number | null;
  currentBalance: number;
}

const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Customer Profile",
    cell: ({ row }) => (
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs uppercase shadow-sm border border-blue-100">
          {row.original.name.substring(0, 2)}
        </div>
        <div>
          <div className="font-bold text-slate-900 leading-tight">
            {row.original.name}
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">
            {row.original.contactInfo || "No ID contact"}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "gstin",
    header: "Region & Tax",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="text-slate-500 text-xs font-bold">
          {row.original.state}
        </div>
        <div className="text-[10px] font-mono text-slate-400">
          {row.original.gstin || "Unregistered"}
        </div>
      </div>
    ),
  },
  {
    id: "balance",
    header: () => <div className="text-right">Outstanding</div>,
    cell: ({ row }) => {
      const balance = row.original.currentBalance;
      const limit = row.original.creditLimit || 0;
      const utilization = limit > 0 ? (balance / limit) * 100 : 0;
      const isCritical = limit > 0 && balance >= limit;

      return (
        <div className="text-right space-y-2">
          <div
            className={`font-black text-lg ${balance > 0 ? "text-red-600" : "text-emerald-600"}`}
          >
            ₹ {balance.toLocaleString()}
          </div>
          {limit > 0 && (
            <div className="space-y-1">
              <div className="flex justify-end items-center gap-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Limit: ₹{limit.toLocaleString()}
                </span>
                {isCritical && <AlertCircle className="w-3 h-3 text-red-500" />}
              </div>
              <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden ml-auto">
                <div
                  className={`h-full transition-all duration-500 ${isCritical ? "bg-red-500" : utilization > 80 ? "bg-amber-500" : "bg-blue-500"}`}
                  style={{ width: `${Math.min(utilization, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Quick Actions</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end space-x-2">
        <Link
          href={`/dashboard/sales/invoices/new?partyId=${row.original.id}`}
          className="bg-brand text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-brand/20 active:scale-95"
        >
          Bill Now
        </Link>
        <Link
          href={`/dashboard/master-data/parties/new?id=${row.original.id}`}
          className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-100 rounded-xl transition-all"
        >
          Manage
        </Link>
      </div>
    ),
  },
];

export default function CustomersPage() {
  const { currentOutletId } = useOutletStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentOutletId) {
      loadCustomers(currentOutletId);
    }
  }, [currentOutletId]);

  const loadCustomers = async (outletId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getPartiesWithBalances(outletId, "CUSTOMER");
      if (res.success) {
        setCustomers((res.data as any) || []);
      } else {
        setError(res.error?.message || "Failed to load customers");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentOutletId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 bg-white p-8 rounded-3xl border border-slate-200">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">
            No Outlet Selected
          </h2>
          <p className="text-slate-500 text-sm">
            Please select an outlet from the top bar to view customers.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 bg-red-50 p-8 rounded-3xl border border-red-200 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-red-800">Connection Error</h2>
          <p className="text-red-700 text-sm">{error}</p>
          <Button
            onClick={() => loadCustomers(currentOutletId)}
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-100"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const totalReceivables = customers.reduce(
    (sum, c) => sum + (c.currentBalance > 0 ? c.currentBalance : 0),
    0,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 mt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Client Portfolio
          </h2>
          <p className="text-slate-500 mt-2 font-medium max-w-lg">
            Monitor accounts receivable, credit exposure, and customer financial
            health across your retail network.
          </p>
        </div>
        <Link
          href="/dashboard/master-data/parties/new?type=CUSTOMER"
          className="bg-brand text-white px-8 py-4 rounded-[2rem] hover:bg-slate-900 font-black uppercase tracking-widest text-xs flex items-center transition-all shadow-2xl shadow-brand/40 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-3" /> New Relationship
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-emerald-400" />
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-none">
              Receivables
            </Badge>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Total Outstanding
          </p>
          <p className="text-4xl font-black text-white tracking-tighter">
            ₹ {totalReceivables.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <Badge variant="outline">Verified</Badge>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Total Accounts
          </p>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">
            {customers.length}
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm border-l-[6px] border-l-amber-500">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <Star className="w-6 h-6" />
            </div>
            <Badge className="bg-amber-500 text-white border-none">
              High Risk
            </Badge>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Limit Threshold Exceeded
          </p>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">
            {
              customers.filter(
                (c) => c.creditLimit && c.currentBalance >= c.creditLimit,
              ).length
            }
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden px-4">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
            <input
              type="text"
              placeholder="Search by name, GSTIN, or city..."
              className="w-full bg-slate-50 border-none rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-brand/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
              <TrendingUp className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
        <DataTable columns={columns} data={customers} />
      </div>
    </div>
  );
}
