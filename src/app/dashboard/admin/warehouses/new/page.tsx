"use client";

import { createWarehouse, getLocations } from "@/actions/locations";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { WarehouseForm } from "@/components/warehouses/warehouse-form";
import { toast } from "sonner";

export default function NewWarehousePage() {
  const [outlets, setOutlets] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getLocations().then((res) => {
      if (res.success) {
        setOutlets(res.data?.outlets || []);
      } else {
        toast.error("Failed to load outlets");
      }
      setIsLoading(false);
    });
  }, []);

  const handleSubmit = async (data: any) => {
    const res = await createWarehouse(data);
    if (res.success) {
      toast.success("Warehouse established successfully");
    } else {
      toast.error("Failed: " + res.error?.message);
    }
    return res;
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
        <div className="h-12 bg-slate-200 rounded w-48"></div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 h-96"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/admin/warehouses"
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <Building2 className="w-6 h-6 text-slate-400" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Create Warehouse
          </h2>
          <p className="text-slate-500">Add a new storage location.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <WarehouseForm
          outlets={outlets}
          onSubmit={handleSubmit}
          redirectUrl="/dashboard/admin/warehouses"
        />
      </div>
    </div>
  );
}
