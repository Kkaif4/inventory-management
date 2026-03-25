"use client";

import { createOutlet, getLocations } from "@/actions/locations";
import { Store } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { OutletForm } from "@/components/outlets/outlet-form";
import { toast } from "sonner";

export default function NewOutletPage() {
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>(
    []
  );

  useEffect(() => {
    getLocations().then((res) => {
      if (res.success) {
        setWarehouses(res.data!.warehouses);
      } else {
        toast.error("Failed to load warehouses: " + res.error?.message);
      }
    });
  }, []);

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
            Add Sales Outlet
          </h2>
          <p className="text-slate-500">Retail & B2B point of distribution.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
        <OutletForm
          warehouses={warehouses}
          onSubmit={createOutlet}
          redirectUrl="/dashboard/master-data/locations"
        />
      </div>
    </div>
  );
}
