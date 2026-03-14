"use client";

import { getVendorMetrics } from "@/actions/parties";
import { PageHeader } from "@/components/ui/page-header";
import {
  TrendingUp,
  Truck,
  PackageCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useOutletStore } from "@/store/use-outlet-store";

export default function VendorMetricsPage() {
  const [vendorData, setVendorData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentOutletId } = useOutletStore();

  if (!currentOutletId) return;
  useEffect(() => {
    getVendorMetrics(currentOutletId).then((res) => {
      if (res.success) {
        setVendorData(res.data!);
      } else {
        console.error("Failed to load vendor metrics:", res.error?.message);
      }
      setIsLoading(false);
    });
  }, [currentOutletId]);

  // Aggregate metrics
  const totalVendors = vendorData.length;
  const avgOnTime =
    vendorData.reduce((acc, v) => acc + parseFloat(v.onTime), 0) /
      totalVendors || 0;
  const avgReturns =
    vendorData.reduce((acc, v) => acc + parseFloat(v.returns), 0) /
      totalVendors || 0;

  const metrics = [
    {
      title: "Active Vendors",
      value: totalVendors.toString(),
      icon: Truck,
      description: "Total onboarded suppliers",
    },
    {
      title: "Avg On-Time Rate",
      value: `${avgOnTime.toFixed(1)}%`,
      icon: PackageCheck,
      description: "GRN matching PO dates",
    },
    {
      title: "System Defect Rate",
      value: `${avgReturns.toFixed(1)}%`,
      icon: AlertTriangle,
      description: "Returns over total order volume",
      color: "text-red-500",
    },
    {
      title: "Lead Time Baseline",
      value: "4.2 Days",
      icon: TrendingUp,
      description: "Average fulfillment window",
    },
  ];

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Vendor Name",
      cell: ({ getValue }) => (
        <span className="font-black text-slate-900">
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "rating",
      header: "Performance Rating",
      cell: ({ getValue }) => {
        const val = getValue() as string;
        const color = val.includes("A")
          ? "text-emerald-600 bg-emerald-50 border-emerald-100"
          : val.includes("B")
            ? "text-amber-600 bg-amber-50 border-amber-100"
            : "text-rose-600 bg-rose-50 border-rose-100";
        return (
          <span
            className={`px-3 py-1 rounded-full font-black text-[10px] uppercase border ${color}`}
          >
            {val}
          </span>
        );
      },
    },
    {
      accessorKey: "onTime",
      header: "On-Time %",
      cell: ({ getValue }) => (
        <span className="font-bold text-slate-700">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "leadTime",
      header: "Avg Lead Time",
      cell: ({ getValue }) => (
        <span className="font-bold text-slate-500">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "returns",
      header: "Return Rate",
      cell: ({ getValue }) => {
        const val = getValue() as string;
        const isHigh = parseFloat(val) > 2;
        return (
          <span
            className={`font-black ${isHigh ? "text-rose-600" : "text-slate-500"}`}
          >
            {val}
          </span>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
          Calculating Performance...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title="Vendor Performance Analytics"
        subtitle="Industrial reliability tracking, defect rates, and lead time baselines."
        breadcrumbs={[
          { label: "Purchases", href: "/dashboard/purchases" },
          { label: "Performance Analytics" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div
              key={i}
              className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <Icon
                    className={`w-5 h-5 ${metric.color || "text-slate-900"}`}
                  />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  Baseline
                </span>
              </div>
              <div className="mt-8">
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {metric.value}
                </p>
                <div className="flex items-center mt-1">
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    {metric.title}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
            Supplier Reliability Index
          </h3>
          <div className="flex space-x-2">
            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-black uppercase">
              Tier A: 90%+
            </span>
            <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-black uppercase">
              Tier B: 70-89%
            </span>
          </div>
        </div>
        <div className="p-4">
          <DataTable columns={columns} data={vendorData} />
        </div>
      </div>
    </div>
  );
}
