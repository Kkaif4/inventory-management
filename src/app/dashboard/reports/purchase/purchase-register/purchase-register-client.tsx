"use client";

import React, { useMemo, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  FileText,
  TrendingDown,
  Clock,
  AlertCircle,
  ArrowRight,
  ShoppingCart,
} from "lucide-react";

import { ReportsLayout, SummaryCard, FilterPanel } from "@/components/reports";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { PurchaseRegisterItem } from "@/types/reports/purchase";
import { PaginationMeta } from "@/types/pagination";
import { ColumnDef } from "@tanstack/react-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { LIMIT_OPTIONS } from "@/constants/pagination";

interface PurchaseRegisterClientProps {
  initialData: PurchaseRegisterItem[];
  pagination: PaginationMeta;
  outletId: string;
}

export function PurchaseRegisterClient({
  initialData,
  pagination,
}: PurchaseRegisterClientProps) {
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
    const totalAmount = initialData.reduce(
      (sum, item) => sum + item.totalAmount,
      0,
    );
    const totalTax = initialData.reduce((sum, item) => sum + item.totalTax, 0);
    const paidCount = initialData.filter(
      (i) => i.paymentStatus === "PAID",
    ).length;

    return {
      totalAmount,
      totalTax,
      paidCount,
      count: pagination.total,
    };
  }, [initialData, pagination.total]);

  const columns: ColumnDef<PurchaseRegisterItem>[] = [
    {
      id: "po",
      header: "PO Detail",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 flex items-center group">
            {row.original.poNumber}
            <ArrowRight
              size={12}
              className="ml-1 opacity-0 group-hover:opacity-100 transition-all text-blue-500"
            />
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {formatDate(row.original.date)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "vendorName",
      header: "Vendor",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-700">
            {row.original.vendorName}
          </span>
          {row.original.vendorPhone && (
            <span className="text-xs text-slate-400">
              {row.original.vendorPhone}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "taxableValue",
      header: () => <div className="text-right">Taxable</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium text-slate-600">
          {formatCurrency(row.original.taxableValue)}
        </div>
      ),
    },
    {
      accessorKey: "totalTax",
      header: () => <div className="text-right">Tax</div>,
      cell: ({ row }) => (
        <div className="text-right text-slate-500 text-xs">
          {formatCurrency(row.original.totalTax)}
        </div>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: () => <div className="text-right">Total</div>,
      cell: ({ row }) => (
        <div className="text-right font-black text-slate-900">
          {formatCurrency(row.original.totalAmount)}
        </div>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.paymentStatus}
          className="rounded-lg font-bold uppercase tracking-wider text-[10px]"
        />
      ),
    },
  ];

  return (
    <ReportsLayout
      title={t("purchase.register.title")}
      description={t("purchase.register.subtitle")}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          label="Total Purchase"
          value={formatCurrency(metrics.totalAmount)}
          icon={<ShoppingCart size={24} />}
          color="blue"
          description="Total PO value"
        />
        <SummaryCard
          label="Total Orders"
          value={metrics.count}
          icon={<FileText size={24} />}
          color="indigo"
          description="Purchase orders count"
        />
        <SummaryCard
          label="Input Tax"
          value={formatCurrency(metrics.totalTax)}
          icon={<TrendingDown size={24} />}
          color="emerald"
          description="Tax available for ITC"
        />
        <SummaryCard
          label="Paid Orders"
          value={metrics.paidCount}
          icon={<AlertCircle size={24} />}
          color="rose"
          description="Orders fully settled"
        />
      </div>

      <div className="space-y-6">
        <FilterPanel
          isLoading={isPending}
          filters={[
            {
              id: "search",
              label: "Search PO or Vendor",
              type: "search",
              placeholder: "Search Number, Name, Phone...",
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
              id: "paymentStatus",
              label: "Payment Status",
              type: "select",
              options: [
                { value: "PAID", label: "Paid" },
                { value: "PARTIALLY_PAID", label: "Partial" },
                { value: "UNPAID", label: "Unpaid" },
              ],
              value: searchParams.get("paymentStatus") || "",
              onChange: (val) => updateURL({ paymentStatus: val }),
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
