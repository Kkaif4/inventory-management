"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { TrendingDown } from "lucide-react";
import {
  ReportsLayout,
  FilterPanel,
  DataTableEditorial,
  SummaryCards,
  type Column,
} from "@/components/reports";
import type { SlowMovingStockItem } from "@/types/reports/inventory";

interface SlowMovingStockClientProps {
  initialData: SlowMovingStockItem[];
  outletId: string;
}

export function SlowMovingStockClient({
  initialData,
  outletId,
}: SlowMovingStockClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("reports");
  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    frequency: searchParams.get("frequency") || "",
  });

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

    if (filters.frequency) {
      data = data.filter(
        (item) => item.movementFrequency === filters.frequency,
      );
    }

    return data;
  }, [initialData, filters]);

  const metrics = useMemo(() => {
    const dormantItems = filteredData.filter(
      (item) => item.movementFrequency === "dormant",
    ).length;
    const actionRequired = dormantItems;
    const criticalItems = filteredData.filter(
      (item) => item.daysSinceLastMovement > 180,
    ).length;

    return {
      slowMovingCount: filteredData.length,
      dormantItems,
      actionRequired,
      criticalItems,
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
    if (filters.frequency) params.set("frequency", filters.frequency);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
    setTimeout(() => setIsLoading(false), 300);
  }, [filters, router]);

  const handleResetFilters = useCallback(() => {
    setFilters({ search: "", frequency: "" });
    router.push("?page=1");
  }, [router]);

  const columns: Column<SlowMovingStockItem>[] = [
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
      key: "currentStock",
      header: t("inventory.slowMoving.columns.currentStock"),
      align: "right",
      sortable: true,
      format: (val: number) => val.toFixed(2),
    },
    {
      key: "daysSinceLastMovement",
      header: t("inventory.slowMoving.columns.daysSinceMovement"),
      align: "right",
      sortable: true,
      format: (val: number) => {
        const isCritical = val > 180;
        const colorClass = isCritical
          ? "text-red-600"
          : val > 90
            ? "text-amber-600"
            : "text-green-700";
        const fontClass = isCritical ? "font-bold" : "";
        return (
          <span className={`${colorClass} ${fontClass}`}>
            {val === 999 ? t("common.never") : `${val} ${t("common.days")}`}
          </span>
        );
      },
    },
    {
      key: "movementFrequency",
      header: t("inventory.slowMoving.columns.frequency"),
      sortable: true,
      format: (val: string) => {
        const config: Record<
          string,
          { bgClass: string; textClass: string; label: string }
        > = {
          high: {
            bgClass: "bg-green-100",
            textClass: "text-green-800",
            label: t("inventory.slowMoving.statuses.high"),
          },
          medium: {
            bgClass: "bg-blue-100",
            textClass: "text-blue-800",
            label: t("inventory.slowMoving.statuses.medium"),
          },
          low: {
            bgClass: "bg-yellow-100",
            textClass: "text-yellow-800",
            label: t("inventory.slowMoving.statuses.low"),
          },
          dormant: {
            bgClass: "bg-red-100",
            textClass: "text-red-800",
            label: t("inventory.slowMoving.statuses.dormant"),
          },
        };
        const style = config[val] || config.high;
        return (
          <span
            className={`px-3 py-1 rounded text-xs font-semibold ${style.bgClass} ${style.textClass}`}
          >
            {style.label}
          </span>
        );
      },
    },
    {
      key: "estimatedMonthsOfStock",
      header: t("inventory.slowMoving.columns.monthsOfStock"),
      align: "right",
      sortable: true,
      format: (val: number) => {
        const isCritical = val > 12;
        return (
          <span
            className={`${isCritical ? "text-red-600 font-bold" : "text-green-700"}`}
          >
            {val > 999 ? "∞" : val.toFixed(1)}
          </span>
        );
      },
    },
  ];

  const summaryCards = [
    {
      label: t("inventory.slowMoving.metrics.slowMovingItems"),
      value: metrics.slowMovingCount,
      variant: "warning" as const,
    },
    {
      label: t("inventory.slowMoving.metrics.dormantItems"),
      value: metrics.dormantItems,
      variant: "danger" as const,
    },
    {
      label: t("inventory.slowMoving.metrics.criticalStock"),
      value: metrics.criticalItems,
      variant: "danger" as const,
    },
    {
      label: t("inventory.slowMoving.metrics.actionRequired"),
      value: metrics.actionRequired,
      variant: "danger" as const,
    },
  ];

  return (
    <ReportsLayout
      title={t("inventory.slowMoving.title")}
      description={t("inventory.slowMoving.subtitle")}
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
            id: "frequency",
            label: t("inventory.slowMoving.filters.movementFrequency"),
            type: "select",
            options: [
              { value: "high", label: t("inventory.slowMoving.statuses.high") },
              {
                value: "medium",
                label: t("inventory.slowMoving.statuses.medium"),
              },
              { value: "low", label: t("inventory.slowMoving.statuses.low") },
              {
                value: "dormant",
                label: t("inventory.slowMoving.statuses.dormant"),
              },
            ],
            value: filters.frequency,
            onChange: (value: any) =>
              handleFilterChange("frequency", value as string),
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
          <TrendingDown className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">{t("inventory.slowMoving.empty.title")}</p>
          <p className="text-sm mt-2">
            {t("inventory.slowMoving.empty.description")}
          </p>
        </div>
      )}
    </ReportsLayout>
  );
}
