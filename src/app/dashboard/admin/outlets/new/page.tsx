"use client";

import { createOutlet } from "@/actions/locations";
import { Store } from "lucide-react";
import Link from "next/link";
import { OutletForm } from "@/components/outlets/outlet-form";

export default function NewOutletPage() {
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
            Create Sales Outlet
          </h2>
          <p className="text-slate-500">Add a new point of sale.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <OutletForm
          onSubmit={createOutlet}
          redirectUrl="/dashboard/admin/outlets"
        />
      </div>
    </div>
  );
}
