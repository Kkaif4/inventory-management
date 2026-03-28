"use client";

import React, { useMemo, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  Package,
  AlertTriangle,
  Zap,
  ArrowRight,
  ClipboardList,
} from "lucide-react";

import { ReportsLayout, SummaryCard, FilterPanel } from "@/components/reports";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { CurrentStockItem } from "@/types/reports/inventory";
import { PaginationMeta } from "@/types/pagination";
import { ColumnDef } from "@tanstack/react-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { LIMIT_OPTIONS } from "@/constants/pagination";

interface CurrentStockClientProps {
  initialData: CurrentStockItem[];
  pagination: PaginationMeta;
  outletId: string;
}

export function CurrentStockClient({
  initialData,
  pagination,
}: CurrentStockClientProps) {
  const t = useTranslations("reports");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateURL = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      if (!updates.page) params.set("page", "1");

      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  const metrics = useMemo(() => {
    const total = initialData.reduce((sum, item) => sum + item.quantity, 0);
    const inTransit = initialData.reduce(
      (sum, item) => sum + item.inTransitQty,
      0,
    );
    const critical = initialData.filter((i) => i.status === "critical").length;

    return {
      total: total.toFixed(2),
      inTransit: inTransit.toFixed(2),
      critical,
      itemCount: pagination.total,
    };
  }, [initialData, pagination.total]);

  const columns: ColumnDef<CurrentStockItem>[] = [
    {
      id: "product",
      header: "Product / SKU",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 flex items-center group">
            {row.original.productName}
            <ArrowRight
              size={12}
              className="ml-1 opacity-0 group-hover:opacity-100 transition-all text-blue-500"
            />
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">
              {row.original.sku}
            </span>
            {row.original.variantName && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-400">
                  {row.original.variantName}
                </span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "warehouseName",
      header: "Warehouse",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="font-medium text-slate-600">
            {row.original.warehouseName}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-right">On Hand</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <span className="font-black text-slate-900">
            {row.original.quantity.toFixed(2)}
          </span>
          <span className="ml-1 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
            {row.original.unitOfMeasure}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "inTransitQty",
      header: () => <div className="text-right">In Transit</div>,
      cell: ({ row }) => (
        <div className="text-right text-slate-500 font-medium">
          {row.original.inTransitQty > 0 ? (
            <span className="text-amber-600">
              +{row.original.inTransitQty.toFixed(2)}
            </span>
          ) : (
            <span className="text-slate-300">-</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <StatusBadge
            status={row.original.status.toUpperCase()}
            className="rounded-lg font-bold uppercase tracking-wider text-[10px]"
          />
        </div>
      ),
    },
  ];

  return (
    <ReportsLayout
      title={t("inventory.currentStock.title")}
      description={t("inventory.currentStock.subtitle")}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          label="Total Stock"
          value={metrics.total}
          icon={<Package size={24} />}
          color="emerald"
          description="Total units on hand"
        />
        <SummaryCard
          label="In Transit"
          value={metrics.inTransit}
          icon={<Zap size={24} />}
          color="amber"
          description="Pending deliveries"
        />
        <SummaryCard
          label="Critical Items"
          value={metrics.critical}
          icon={<AlertTriangle size={24} />}
          color="rose"
          description="Below min stock level"
        />
        <SummaryCard
          label="Total SKUs"
          value={metrics.itemCount}
          icon={<ClipboardList size={24} />}
          color="indigo"
          description="Unique items tracked"
        />
      </div>

      <div className="space-y-6">
        <FilterPanel
          isLoading={isPending}
          filters={[
            {
              id: "search",
              label: "Search product",
              type: "search",
              placeholder: "Search Number, Name, Phone...",
              value: searchParams.get("search") || "",
              onChange: (val) => updateURL({ search: val }),
            },
            {
              id: "status",
              label: "Stock Status",
              type: "select",
              options: [
                { value: "critical", label: "Critical" },
                { value: "warning", label: "Warning" },
                { value: "normal", label: "Normal" },
                { value: "overstock", label: "Overstock" },
              ],
              value: searchParams.get("status") || "",
              onChange: (val) => updateURL({ status: val }),
            },
          ]}
        />

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative glass-card rounded-2xl border border-white/20 overflow-hidden shadow-xl">
            <DataTable
              columns={columns}
              data={initialData}
              loading={isPending}
              manualPagination={true}
            />
            <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
              <PaginationControls
                page={pagination.page}
                totalPages={pagination.totalPages}
                limit={pagination.limit}
                total={pagination.total}
                isPending={isPending}
                onPageChange={(page) => updateURL({ page: String(page) })}
                onLimitChange={(limit) =>
                  updateURL({ limit: String(limit), page: "1" })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </ReportsLayout>
  );
}
