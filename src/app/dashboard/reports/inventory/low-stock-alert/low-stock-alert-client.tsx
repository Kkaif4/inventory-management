"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, PackageSearch } from "lucide-react";
import Link from "next/link";
import {
  ReportsLayout,
  FilterPanel,
  DataTableEditorial,
  SummaryCards,
  type Column,
} from "@/components/reports";
import type { LowStockItem } from "@/types/reports/inventory";

interface LowStockAlertClientProps {
  initialData: LowStockItem[];
  outletId: string;
}

export function LowStockAlertClient({
  initialData,
  outletId,
}: LowStockAlertClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("reports");
  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
  });

  // Filtered data
  const filteredData = useMemo(() => {
    let data = initialData;

    if (filters.search) {
      const term = filters.search.toLowerCase();
      data = data.filter(
        (item) =>
          item.productName?.toLowerCase().includes(term) ||
          item.sku?.toLowerCase().includes(term),
      );
    }

    if (filters.status) {
      data = data.filter((item) => item.status === filters.status);
    }

    return data;
  }, [initialData, filters]);

  // Summary metrics
  const metrics = useMemo(() => {
    const totalShortage = filteredData.reduce(
      (sum, item) => sum + item.shortage,
      0,
    );
    const critical = filteredData.filter(
      (item) => item.status === "critical",
    ).length;

    return {
      alertCount: filteredData.length,
      critical,
      totalShortage: totalShortage.toFixed(0),
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

  const columns: Column<LowStockItem>[] = [
    {
      key: "sku",
      header: t("columns.sku"),
      sortable: true,
    },
    {
      key: "productName",
      header: t("columns.product"),
      sortable: true,
    },
    {
      key: "minLevel",
      header: t("columns.minLevel"),
      align: "right",
      sortable: true,
    },
    {
      key: "currentStock",
      header: t("inventory.lowStock.columns.currentStock"),
      align: "right",
      sortable: true,
    },
    {
      key: "shortage",
      header: t("inventory.lowStock.columns.shortage"),
      align: "right",
      sortable: true,
      format: (val) => <span className="text-red-600 font-bold">-{val}</span>,
    },
    {
      key: "status",
      header: t("columns.status"),
      format: (val) => {
        const isCritical = val === "critical";
        const bgClass = isCritical ? "bg-red-100" : "bg-yellow-100";
        const textClass = isCritical ? "text-red-800" : "text-yellow-800";
        const label = isCritical
          ? t("statuses.critical")
          : t("statuses.warning");
        return (
          <span
            className={`px-3 py-1 rounded text-xs font-semibold ${bgClass} ${textClass}`}
          >
            {label}
          </span>
        );
      },
    },
  ];

  const summaryCards = [
    {
      label: t("inventory.lowStock.metrics.totalAlerts"),
      value: metrics.alertCount,
      variant: "warning" as const,
    },
    {
      label: t("inventory.lowStock.metrics.criticalItems"),
      value: metrics.critical,
      variant: "danger" as const,
    },
    {
      label: t("inventory.lowStock.metrics.totalShortage"),
      value: metrics.totalShortage,
      variant: "danger" as const,
    },
  ];

  return (
    <ReportsLayout
      title={t("inventory.lowStock.title")}
      description={t("inventory.lowStock.subtitle")}
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
            label: t("inventory.lowStock.filters.alertLevel"),
            type: "select",
            options: [
              { value: "critical", label: t("statuses.critical") },
              { value: "warning", label: t("statuses.warning") },
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
          <PackageSearch className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">{t("inventory.lowStock.empty.title")}</p>
          <p className="text-sm mt-2">
            {t("inventory.lowStock.empty.description")}
          </p>
        </div>
      )}

      {filteredData.length > 0 && (
        <div className="mt-8 text-center">
          <Link href="/dashboard/purchases/orders/new">
            <button className="px-6 py-3 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition-colors">
              {t("inventory.lowStock.actions.createPO")}
            </button>
          </Link>
        </div>
      )}
    </ReportsLayout>
  );
}
