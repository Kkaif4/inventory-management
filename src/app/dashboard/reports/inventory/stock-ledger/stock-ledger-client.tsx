"use client";

import React, { useMemo, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  History,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Equal,
} from "lucide-react";

import { ReportsLayout, SummaryCard, FilterPanel } from "@/components/reports";
import { DataTable } from "@/components/ui/data-table";
import { formatDate } from "@/lib/utils";
import { StockLedgerItem } from "@/types/reports/inventory";
import { PaginationMeta } from "@/types/pagination";
import { ColumnDef } from "@tanstack/react-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { LIMIT_OPTIONS } from "@/constants/pagination";

interface StockLedgerClientProps {
  initialData: StockLedgerItem[];
  pagination: PaginationMeta;
  outletId: string;
}

export function StockLedgerClient({
  initialData,
  pagination,
}: StockLedgerClientProps) {
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
    const totalIn = initialData
      .filter((item) => item.quantity > 0)
      .reduce((sum, item) => sum + item.quantity, 0);
    const totalOut = initialData
      .filter((item) => item.quantity < 0)
      .reduce((sum, item) => sum + Math.abs(item.quantity), 0);

    return {
      totalIn: totalIn.toFixed(2),
      totalOut: totalOut.toFixed(2),
      netMovement: (totalIn - totalOut).toFixed(2),
      count: pagination.total,
    };
  }, [initialData, pagination.total]);

  const columns: ColumnDef<StockLedgerItem>[] = [
    {
      id: "date",
      header: "Date & Time",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">
            {formatDate(row.original.date)}
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
            {format(new Date(row.original.date), "hh:mm a")}
          </span>
        </div>
      ),
    },
    {
      id: "product",
      header: "Product / SKU",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">
            {row.original.productName}
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
      accessorKey: "transactionType",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.transactionType;
        const typeConfigs: Record<string, { color: string; label: string }> = {
          PURCHASE: { color: "bg-blue-100 text-blue-700", label: "Purchase" },
          SALE: { color: "bg-emerald-100 text-emerald-700", label: "Sale" },
          TRANSFER: {
            color: "bg-violet-100 text-violet-700",
            label: "Transfer",
          },
          ADJUSTMENT: { color: "bg-amber-100 text-amber-700", label: "Adjust" },
        };
        const config = typeConfigs[type] || typeConfigs.ADJUSTMENT;
        return (
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${config.color}`}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-right">Quantity</div>,
      cell: ({ row }) => {
        const val = row.original.quantity;
        return (
          <div className="flex items-center justify-end space-x-1.5">
            <span
              className={`font-black ${val > 0 ? "text-emerald-600" : "text-rose-600"}`}
            >
              {val > 0 ? "+" : ""}
              {val.toFixed(2)}
            </span>
            {val > 0 ? (
              <ArrowUpRight size={14} className="text-emerald-500" />
            ) : (
              <ArrowDownRight size={14} className="text-rose-500" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "balance",
      header: () => <div className="text-right">Balance</div>,
      cell: ({ row }) => (
        <div className="text-right font-bold text-slate-900 underline decoration-blue-500/30 decoration-2 underline-offset-4">
          {row.original.balance.toFixed(2)}
        </div>
      ),
    },
  ];

  return (
    <ReportsLayout
      title={t("inventory.ledger.title")}
      description={t("inventory.ledger.subtitle")}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          label="Inward Qty"
          value={metrics.totalIn}
          icon={<ArrowUpRight size={24} />}
          color="blue"
          description="Total additions"
        />
        <SummaryCard
          label="Outward Qty"
          value={metrics.totalOut}
          icon={<ArrowDownRight size={24} />}
          color="rose"
          description="Total deductions"
        />
        <SummaryCard
          label="Net Movement"
          value={metrics.netMovement}
          icon={<TrendingUp size={24} />}
          color="emerald"
          description="Flow for period"
        />
        <SummaryCard
          label="Total Entries"
          value={metrics.count}
          icon={<History size={24} />}
          color="indigo"
          description="Transactions found"
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
              id: "dateRange",
              label: "Date Period",
              type: "date-range",
              value: {
                from: searchParams.get("dateFrom")
                  ? new Date(searchParams.get("dateFrom")!)
                  : undefined,
                to: searchParams.get("dateTo")
                  ? new Date(searchParams.get("dateTo")!)
                  : undefined,
              },
              onChange: (val) =>
                updateURL({
                  dateFrom: val.from ? format(val.from, "yyyy-MM-dd") : null,
                  dateTo: val.to ? format(val.to, "yyyy-MM-dd") : null,
                }),
            },
            {
              id: "type",
              label: "Transaction Type",
              type: "select",
              options: [
                { value: "PURCHASE", label: "Purchase" },
                { value: "SALE", label: "Sale" },
                { value: "TRANSFER", label: "Transfer" },
                { value: "ADJUSTMENT", label: "Adjustment" },
              ],
              value: searchParams.get("type") || "",
              onChange: (val) => updateURL({ type: val }),
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
