"use client";

import { updateWarehouse } from "@/actions/warehouses";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { WarehouseForm } from "@/components/warehouses/warehouse-form";
import { toast } from "sonner";

export function WarehouseEditClient({
  warehouse,
  outlets,
}: {
  warehouse: any;
  outlets: Array<{ id: string; name: string }>;
}) {
  const handleSubmit = async (data: any) => {
    const res = await updateWarehouse(warehouse.id, data);
    if (res.success) {
      toast.success("Warehouse updated successfully");
    } else {
      toast.error("Failed: " + res.error?.message);
    }
    return res;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/master-data/warehouses"
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <Building2 className="w-6 h-6 text-slate-400" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Edit Warehouse
          </h2>
          <p className="text-slate-500">Node: {warehouse.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
        <WarehouseForm
          warehouse={warehouse}
          outlets={outlets}
          onSubmit={handleSubmit}
          redirectUrl="/dashboard/master-data/warehouses"
        />
      </div>
    </div>
  );
}
