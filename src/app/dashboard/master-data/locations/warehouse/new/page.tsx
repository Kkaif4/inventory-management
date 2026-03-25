"use client";

import { createWarehouse } from "@/actions/locations";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { WarehouseForm } from "@/components/warehouses/warehouse-form";
import { toast } from "sonner";

export default function NewWarehousePage() {
  const handleSubmit = async (data: any) => {
    const res = await createWarehouse(data);
    if (res.success) {
      toast.success("Warehouse established successfully");
    } else {
      toast.error("Failed: " + res.error?.message);
    }
    return res;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/master-data/locations"
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <Building2 className="w-6 h-6 text-slate-400" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Add Warehouse
          </h2>
          <p className="text-slate-500">Physical inventory storage node.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
        <WarehouseForm
          onSubmit={handleSubmit}
          redirectUrl="/dashboard/master-data/locations"
        />
      </div>
    </div>
  );
}
