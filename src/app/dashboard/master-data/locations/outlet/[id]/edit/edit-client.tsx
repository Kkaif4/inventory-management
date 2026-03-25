"use client";

import { updateOutlet } from "@/actions/locations";
import { Store } from "lucide-react";
import Link from "next/link";
import { OutletForm } from "@/components/outlets/outlet-form";

export function OutletEditClient({
  outlet,
  warehouses,
}: {
  outlet: any;
  warehouses: { id: string; name: string }[];
}) {
  const handleSubmit = async (data: any) => {
    return await updateOutlet(outlet.id, data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/master-data/locations"
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
        <OutletForm
          outlet={outlet}
          warehouses={warehouses}
          onSubmit={handleSubmit}
          redirectUrl="/dashboard/master-data/locations"
        />
      </div>
    </div>
  );
}
