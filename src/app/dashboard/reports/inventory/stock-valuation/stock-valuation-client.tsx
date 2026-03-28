"use client";

import React, { useMemo, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  DollarSign,
  Warehouse,
  PackageSearch,
  ArrowUpRight,
  ArrowRight,
  TrendingUp,
  Boxes,
} from "lucide-react";

import { ReportsLayout, SummaryCard, FilterPanel } from "@/components/reports";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/utils";
import { StockValuationItem } from "@/types/reports/inventory";
import { PaginationMeta } from "@/types/pagination";
import { ColumnDef } from "@tanstack/react-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { LIMIT_OPTIONS } from "@/constants/pagination";

interface StockValuationClientProps {
  initialData: StockValuationItem[];
  pagination: PaginationMeta;
  outletId: string;
}

export function StockValuationClient({
  initialData,
  pagination,
}: StockValuationClientProps) {
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
    const totalValue = initialData.reduce(
      (sum, item) => sum + item.totalValue,
      0,
    );
    const totalQty = initialData.reduce((sum, item) => sum + item.quantity, 0);
    const avgValue = totalQty > 0 ? totalValue / totalQty : 0;

    return {
      totalValue: formatCurrency(totalValue),
      totalQty: totalQty.toFixed(2),
      avgValue: formatCurrency(avgValue),
      itemCount: pagination.total,
    };
  }, [initialData, pagination.total]);

  const columns: ColumnDef<StockValuationItem>[] = [
    {
      id: "product",
      header: "Product / SKU",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 group flex items-center">
            {row.original.productName}
            <ArrowRight
              size={12}
              className="ml-1 opacity-0 group-hover:opacity-100 transition-all text-blue-500"
            />
          </span>
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
            <span>{row.original.sku}</span>
            {row.original.variantName && (
              <>
                <span className="text-slate-300">•</span>
                <span>{row.original.variantName}</span>
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
        <div className="flex items-center space-x-2 text-slate-600 font-medium">
          <Warehouse size={14} className="text-slate-400" />
          <span>{row.original.warehouseName}</span>
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-right">Quantity</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <span className="font-bold text-slate-700">
            {row.original.quantity.toFixed(2)}
          </span>
          <span className="ml-1 text-[10px] text-slate-400 font-bold uppercase">
            {row.original.unitOfMeasure}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "costPerUnit",
      header: () => <div className="text-right">Avg Cost</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium text-slate-500">
          {formatCurrency(row.original.costPerUnit)}
        </div>
      ),
    },
    {
      accessorKey: "totalValue",
      header: () => <div className="text-right">Total Value</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
            {formatCurrency(row.original.totalValue)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "valuationMethod",
      header: "Method",
      cell: ({ row }) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter bg-blue-100 text-blue-700 border border-blue-200">
          {row.original.valuationMethod}
        </span>
      ),
    },
  ];

  return (
    <ReportsLayout
      title={t("inventory.valuation.title")}
      description={t("inventory.valuation.subtitle")}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          label="Inventory Value"
          value={metrics.totalValue}
          icon={<DollarSign size={24} />}
          color="emerald"
          description="Total asset value"
        />
        <SummaryCard
          label="Total Units"
          value={metrics.totalQty}
          icon={<Boxes size={24} />}
          color="blue"
          description="Consolidated quantity"
        />
        <SummaryCard
          label="Avg Unit Cost"
          value={metrics.avgValue}
          icon={<TrendingUp size={24} />}
          color="indigo"
          description="Weighted average"
        />
        <SummaryCard
          label="SKU Count"
          value={metrics.itemCount}
          icon={<PackageSearch size={24} />}
          color="violet"
          description="Unique items"
        />
      </div>

      <div className="space-y-6">
        <FilterPanel
          isLoading={isPending}
          filters={[
            {
              id: "search",
              label: "Search item",
              type: "search",
              placeholder: "Search SKU or Name...",
              value: searchParams.get("search") || "",
              onChange: (val) => updateURL({ search: val }),
            },
            {
              id: "warehouse",
              label: "Warehouse",
              type: "select",
              options: [
                { value: "Main Warehouse", label: "Main Warehouse" },
                { value: "Branch Warehouse", label: "Branch Warehouse" },
              ],
              value: searchParams.get("warehouse") || "",
              onChange: (val) => updateURL({ warehouse: val }),
            },
          ]}
        />

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
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
