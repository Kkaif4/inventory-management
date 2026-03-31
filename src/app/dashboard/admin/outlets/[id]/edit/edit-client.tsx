"use client";

import { updateOutlet } from "@/actions/locations";
import { Store } from "lucide-react";
import Link from "next/link";
import { OutletForm } from "@/components/outlets/outlet-form";

export function OutletEditClient({
  outlet,
}: {
  outlet: {
    id: string;
    name: string;
    address?: string | null;
    state?: string | null;
    invoicePrefix: string;
    invoiceStartingNumber: number;
    gstin?: string | null;
    negativeStockPolicy: string;
    batchTrackingEnabled: boolean;
    inventoryValuationMethod: string;
    allowRawCashBills?: boolean;
    bankDetails?: string | null;
  };
}) {
  const handleSubmit = async (data: any) => {
    return await updateOutlet(outlet.id, data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/admin/outlets"
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <Store className="w-6 h-6 text-slate-400" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Edit Sales Outlet
          </h2>
          <p className="text-slate-500">Node: {outlet.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <OutletForm
          outlet={outlet}
          onSubmit={handleSubmit}
          redirectUrl="/dashboard/admin/outlets"
        />
      </div>
    </div>
  );
}
