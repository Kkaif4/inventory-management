"use client";

import { getParties } from "@/actions/parties";
import Link from "next/link";
import { Plus, IndianRupee, Loader2 } from "lucide-react";
import { useOutletStore } from "@/store/use-outlet-store";
import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

interface Party {
  id: string;
  name: string;
  type: "CUSTOMER" | "VENDOR";
  contactInfo: string | null;
  gstin: string | null;
  state: string;
  creditPeriod: number;
  creditLimit: number | null;
  openingBalance: number;
}

const columns: ColumnDef<Party>[] = [
  {
    accessorKey: "name",
    header: "Entity Name",
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-slate-900">{row.original.name}</div>
        <div className="text-xs text-slate-500 mt-0.5">
          {row.original.contactInfo || "No contact info"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          row.original.type === "CUSTOMER"
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
            : "bg-purple-50 text-purple-700 border border-purple-100"
        }`}
      >
        {row.original.type}
      </span>
    ),
  },
  {
    accessorKey: "gstin",
    header: "GSTIN / Region",
    cell: ({ row }) => (
      <div>
        <div className="text-slate-700 font-mono text-xs">
          {row.original.gstin || "Unregistered"}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">
          {row.original.state}
        </div>
      </div>
    ),
  },
  {
    id: "credit",
    header: () => <div className="text-right">Credit Details</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <div className="text-slate-700">{row.original.creditPeriod} Days</div>
        {row.original.creditLimit ? (
          <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-end">
            Limit: <IndianRupee className="w-3 h-3 mx-0.5" />
            {row.original.creditLimit.toLocaleString()}
          </div>
        ) : (
          <div className="text-xs text-slate-400 mt-0.5">No Limit Setup</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "openingBalance",
    header: () => <div className="text-right">Opening Bal.</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium text-slate-900 flex items-center justify-end">
        <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-slate-500" />
        {row.original.openingBalance.toLocaleString()}
        <span className="text-xs text-slate-400 ml-1 font-normal">
          {row.original.openingBalance > 0
            ? row.original.type === "CUSTOMER"
              ? "Dr."
              : "Cr."
            : ""}
        </span>
      </div>
    ),
  },
];

export default function PartiesPage() {
  const { currentOutletId } = useOutletStore();
  const [parties, setParties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentOutletId) {
      setIsLoading(true);
      getParties(currentOutletId)
        .then(setParties)
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Party Directory</h2>
          <p className="text-slate-500 mt-1">
            Manage Customers and Vendors (Creditors & Debtors).
          </p>
        </div>
        <Link
          href="/dashboard/master-data/parties/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Party
        </Link>
      </div>

      <DataTable columns={columns} data={parties} />
    </div>
  );
}
