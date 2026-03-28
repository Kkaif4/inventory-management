"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, Users } from "lucide-react";
import {
  ReportsLayout,
  FilterPanel,
  DataTableEditorial,
  SummaryCards,
  type Column,
} from "@/components/reports";
import type { CustomerOutstandingItem } from "@/types/reports/outstanding";
import type { PaginationMeta } from "@/types/pagination";

interface CustomerOutstandingClientProps {
  initialData: CustomerOutstandingItem[];
  pagination: PaginationMeta;
  outletId: string;
}

export function CustomerOutstandingClient({
  initialData,
}: CustomerOutstandingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("reports");
  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
  });

  const filteredData = useMemo(() => {
    let data = initialData;

    if (filters.search) {
      const term = filters.search.toLowerCase();
      data = data.filter((item) =>
        item.customerName?.toLowerCase().includes(term),
      );
    }

    if (filters.status) {
      data = data.filter((item) => item.status === filters.status);
    }

    return data;
  }, [initialData, filters]);

  const metrics = useMemo(() => {
    const totalOutstanding = filteredData.reduce(
      (sum, item) => sum + item.outstandingAmount,
      0,
    );
    const overdueCount = filteredData.filter(
      (item) => item.status !== "CURRENT",
    ).length;
    const criticalCount = filteredData.filter(
      (item) => item.utilizationPercent > 80,
    ).length;

    return {
      totalOutstanding: totalOutstanding.toFixed(2),
      overdueCount,
      criticalCount,
      customersWithOutstanding: filteredData.length,
    };
  }, [filteredData]);

  const handleFilterChange = useCallback(
    (filterKey: string, value: string | string[]) => {
      setFilters((prev) => ({ ...prev, [filterKey]: value }));
    },
    [],
  );

  const handleApplyFilters = useCallback(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
    setTimeout(() => setIsLoading(false), 300);
  }, [filters, router]);

  const handleResetFilters = useCallback(() => {
    setFilters({ search: "", status: "" });
    router.push("?page=1");
  }, [router]);

  const columns: Column<CustomerOutstandingItem>[] = [
    {
      key: "customerName",
      header: t("columns.customer"),
      sortable: true,
    },
    {
      key: "outstandingAmount",
      header: t("columns.outstanding"),
      align: "right",
      sortable: true,
      format: (val: number) => (
        <span className="text-red-600 font-bold">₹{val.toFixed(2)}</span>
      ),
    },
    {
      key: "creditLimit",
      header: t("sales.outstanding.columns.creditLimit"),
      align: "right",
      sortable: true,
      format: (val: number) => `₹${val.toFixed(2)}`,
    },
    {
      key: "utilizationPercent",
      header: t("sales.outstanding.columns.utilization"),
      align: "right",
      sortable: true,
      format: (val: number) => {
        const colorClass =
          val > 80
            ? "text-red-600"
            : val > 50
              ? "text-amber-600"
              : "text-green-600";
        return <span className={`${colorClass} font-bold`}>{val}%</span>;
      },
    },
    {
      key: "daysSinceLastTransaction",
      header: t("sales.outstanding.columns.daysSinceActivity"),
      align: "right",
      sortable: true,
      format: (val: number) =>
        val === 999 ? t("common.never") : `${val} ${t("common.days")}`,
    },
    {
      key: "status",
      header: t("columns.status"),
      format: (val: string) => {
        const config: Record<
          string,
          { bgClass: string; textClass: string; label: string }
        > = {
          CURRENT: {
            bgClass: "bg-green-100",
            textClass: "text-green-800",
            label: t("statuses.current"),
          },
          OVERDUE_30: {
            bgClass: "bg-yellow-100",
            textClass: "text-yellow-800",
            label: t("sales.outstanding.statuses.overdue30"),
          },
          OVERDUE_60: {
            bgClass: "bg-orange-100",
            textClass: "text-orange-800",
            label: t("sales.outstanding.statuses.overdue60"),
          },
          OVERDUE_90: {
            bgClass: "bg-red-100",
            textClass: "text-red-800",
            label: t("sales.outstanding.statuses.overdue90"),
          },
        };
        const style = config[val] || config.CURRENT;
        return (
          <span
            className={`px-3 py-1 rounded text-xs font-semibold ${style.bgClass} ${style.textClass}`}
          >
            {style.label}
          </span>
        );
      },
    },
  ];

  const summaryCards = [
    {
      label: t("sales.outstanding.metrics.totalOutstanding"),
      value: `₹${metrics.totalOutstanding}`,
      variant: "danger" as const,
    },
    {
      label: t("sales.outstanding.metrics.overdueCustomers"),
      value: metrics.overdueCount,
      variant: "warning" as const,
    },
    {
      label: t("sales.outstanding.metrics.criticalCredit"),
      value: metrics.criticalCount,
      variant: "danger" as const,
    },
    {
      label: t("sales.outstanding.metrics.customersOutstanding"),
      value: metrics.customersWithOutstanding,
      variant: "default" as const,
    },
  ];

  return (
    <ReportsLayout
      title={t("sales.outstanding.title")}
      description={t("sales.outstanding.subtitle")}
    >
      {/* Summary Cards */}
      <SummaryCards cards={summaryCards} />

      {/* Filters */}
      <FilterPanel
        filters={[
          {
            id: "search",
            label: t("common.search"),
            type: "search",
            placeholder: t("filters.search"),
            value: filters.search,
            onChange: (value: any) =>
              handleFilterChange("search", value as string),
          },
          {
            id: "status",
            label: t("common.paymentStatus"),
            type: "select",
            options: [
              { value: "CURRENT", label: t("statuses.current") },
              {
                value: "OVERDUE_30",
                label: t("sales.outstanding.statuses.overdue30"),
              },
              {
                value: "OVERDUE_60",
                label: t("sales.outstanding.statuses.overdue60"),
              },
              {
                value: "OVERDUE_90",
                label: t("sales.outstanding.statuses.overdue90"),
              },
            ],
            value: filters.status,
            onChange: (value: any) =>
              handleFilterChange("status", value as string),
          },
        ]}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        isLoading={isLoading}
      />

      {/* Data Table */}
      <DataTableEditorial
        columns={columns}
        data={filteredData}
        rowKey="id"
        striped={true}
        hoverable={true}
      />

      {filteredData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">{t("sales.outstanding.empty.title")}</p>
          <p className="text-sm mt-2">
            {t("sales.outstanding.empty.description")}
          </p>
        </div>
      )}
    </ReportsLayout>
  );
}
