"use client";

import React, { useState, useTransition, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subYears,
} from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Calendar,
  Eye,
  Loader2,
  X,
} from "lucide-react";

import { ReportsLayout } from "@/components/reports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportFilters } from "@/components/reports/report-filters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { PnLResponse, PnLLineItem } from "@/actions/reports/pnl";
import { getPnLDrillDown, exportPnLToExcel } from "@/actions/reports/pnl";

// Period preset types
type PeriodPreset =
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "last_quarter"
  | "this_fy"
  | "last_fy"
  | "custom";

interface PnLClientProps {
  data: PnLResponse;
  outlets: { id: string; name: string }[];
  currentOutletId: string;
}

interface DrillDownData {
  accountName: string;
  entries: Awaited<ReturnType<typeof getPnLDrillDown>>["data"];
}

// Period preset configurations
const PERIOD_PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "last_quarter", label: "Last Quarter" },
  { value: "this_fy", label: "This FY" },
  { value: "last_fy", label: "Last FY" },
  { value: "custom", label: "Custom" },
];

export default function PnLClient({
  data,
  outlets,
  currentOutletId,
}: PnLClientProps) {
  const t = useTranslations("reports");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);

  // Drill-down state
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(
    null,
  );
  const [isLoadingDrillDown, setIsLoadingDrillDown] = useState(false);

  // Comparison period state
  const [showComparison, setShowComparison] = useState(false);

  // Get current URL params or defaults
  const currentPeriodStart = useMemo(() => {
    const param = searchParams.get("startDate");
    return param ? new Date(param) : data.periodInfo.startDate;
  }, [searchParams, data.periodInfo.startDate]);

  const currentPeriodEnd = useMemo(() => {
    const param = searchParams.get("endDate");
    return param ? new Date(param) : data.periodInfo.endDate;
  }, [searchParams, data.periodInfo.endDate]);

  const selectedOutletId = searchParams.get("outletId") || currentOutletId;

  // Calculate current preset based on dates
  const currentPreset: PeriodPreset = useMemo(() => {
    const preset = searchParams.get("preset") as PeriodPreset;
    return preset || "this_month";
  }, [searchParams]);

  // Update URL with new params
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

      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  // Handle period preset change
  const handlePresetChange = (preset: PeriodPreset | null) => {
    if (!preset) return;
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (preset) {
      case "this_month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "last_month":
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case "this_quarter":
        startDate = startOfQuarter(now);
        endDate = endOfQuarter(now);
        break;
      case "last_quarter":
        const lastQuarterMonth = subMonths(now, 3);
        startDate = startOfQuarter(lastQuarterMonth);
        endDate = endOfQuarter(lastQuarterMonth);
        break;
      case "this_fy":
        // Financial year in India: April 1 - March 31
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        if (currentMonth >= 3) {
          // April onwards - current FY started this year
          startDate = new Date(currentYear, 3, 1);
          endDate = new Date(currentYear + 1, 2, 31);
        } else {
          // Jan-March - current FY started last year
          startDate = new Date(currentYear - 1, 3, 1);
          endDate = new Date(currentYear, 2, 31);
        }
        break;
      case "last_fy":
        const lastFyYear = now.getFullYear();
        const lastFyMonth = now.getMonth();
        if (lastFyMonth >= 3) {
          startDate = new Date(lastFyYear - 1, 3, 1);
          endDate = new Date(lastFyYear, 2, 31);
        } else {
          startDate = new Date(lastFyYear - 2, 3, 1);
          endDate = new Date(lastFyYear - 1, 2, 31);
        }
        break;
      default:
        return; // Custom - don't auto-set dates
    }

    updateURL({
      preset,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  };

  // Handle custom date range change
  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    updateURL({
      preset: "custom",
      startDate: range.from.toISOString(),
      endDate: range.to.toISOString(),
    });
  };

  // Handle outlet change
  const handleOutletChange = (outletId: string) => {
    updateURL({ outletId });
  };

  // Handle date range change from ReportFilters
  const handleFilterDateChange = (startDate: Date, endDate: Date) => {
    updateURL({
      preset: "custom",
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  };

  // Handle reset
  const handleReset = () => {
    updateURL({
      preset: null,
      startDate: null,
      endDate: null,
      outletId: null,
    });
    setShowComparison(false);
  };

  // Handle apply (no-op since filters update URL on change)
  const handleApply = () => {
    // Filters are updated live via URL params
  };

  // Handle drill-down click
  const handleDrillDown = async (accountId: string, accountName: string) => {
    setIsLoadingDrillDown(true);
    setDrillDownOpen(true);

    try {
      const result = await getPnLDrillDown(
        accountId,
        currentPeriodStart,
        currentPeriodEnd,
        selectedOutletId === "all" ? undefined : selectedOutletId,
      );

      if (result.success && result.data) {
        setDrillDownData({
          accountName,
          entries: result.data,
        });
      }
    } finally {
      setIsLoadingDrillDown(false);
    }
  };

  // Handle Excel export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportPnLToExcel(
        currentPeriodStart,
        currentPeriodEnd,
        selectedOutletId === "all" ? undefined : selectedOutletId,
      );

      if (result.success && result.data) {
        // Create and download CSV
        const { rows } = result.data;
        const headers = [
          "Category",
          "Account",
          "Current Period",
          "Comparison Period",
          "Variance",
        ].filter((_, i) => i < 3 || showComparison);

        const csvContent = [
          headers.join(","),
          ...rows.map((row: any) =>
            [
              row.category || "",
              row.account || "",
              row.currentPeriod || "",
              showComparison ? row.comparisonPeriod || "" : "",
              showComparison ? row.variance || "" : "",
            ]
              .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
              .join(","),
          ),
        ].join("\n");

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `PNL_${format(currentPeriodStart, "yyyy-MM-dd")}_${format(currentPeriodEnd, "yyyy-MM-dd")}.csv`;
        link.click();
      }
    } finally {
      setIsExporting(false);
    }
  };

  const { currentPeriod } = data;
  const comparisonPeriod = data.comparisonPeriod;

  // Helper to calculate variance
  const getVariance = (current: number, comparison: number | undefined) => {
    if (comparison === undefined) return null;
    const variance = current - comparison;
    const percentChange =
      comparison !== 0 ? (variance / Math.abs(comparison)) * 100 : 0;
    return {
      amount: variance,
      percent: percentChange,
      isPositive: variance >= 0,
    };
  };

  return (
    <ReportsLayout
      title="Profit & Loss Statement"
      description="Income vs Expenditure Statement with period comparison"
    >
      {/* Period Preset - Separate from ReportFilters */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Period Preset */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Period Preset
              </label>
              <select
                value={currentPreset}
                onChange={(e) => handlePresetChange(e.target.value as PeriodPreset)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                {PERIOD_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Period Info Display */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 opacity-0">
                &nbsp;
              </label>
              <div className="flex items-center gap-4 text-sm text-slate-600 pt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDate(currentPeriodStart)} - {formatDate(currentPeriodEnd)}
                  </span>
                </div>
              </div>
            </div>

            {/* Outlet Display */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 opacity-0">
                &nbsp;
              </label>
              {data.outletInfo && (
                <div className="flex items-center gap-2 text-sm text-slate-600 pt-2">
                  <Building2 className="w-4 h-4" />
                  <span>{data.outletInfo.name}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Filter Panel - Using ReportFilters Component */}
      <ReportFilters
        outlets={outlets}
        selectedOutletId={selectedOutletId}
        onOutletChange={handleOutletChange}
        startDate={currentPeriodStart}
        endDate={currentPeriodEnd}
        onDateChange={handleFilterDateChange}
        onReset={handleReset}
        onApply={handleApply}
        isPending={isPending}
        showDateRange={true}
        showOutlet={true}
        allowMultipleOutlets={true}
        applyButtonLabel="Apply Filters"
      >
        {/* Comparison Toggle */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Comparison
          </label>
          <Button
            variant={showComparison ? "default" : "outline"}
            className="w-full"
            onClick={() => setShowComparison(!showComparison)}
          >
            {showComparison ? "Hide Comparison" : "Show Comparison"}
          </Button>
        </div>
      </ReportFilters>

      {/* Loading State */}
      {isPending && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">Loading P&L data...</span>
        </div>
      )}

      {/* Export Button */}
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={isExporting}
          className="gap-2"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-4 h-4" />
          )}
          Export Excel
        </Button>
      </div>

      {/* P&L Statement */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 w-[40%]">
                    Account
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">
                    Current Period
                  </th>
                  {showComparison && comparisonPeriod && (
                    <>
                      <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">
                        Comparison
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">
                        Variance
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Revenue Section */}
                <tr className="bg-blue-50/50">
                  <td
                    colSpan={showComparison && comparisonPeriod ? 4 : 2}
                    className="px-6 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                      <span className="font-bold text-slate-900">REVENUE</span>
                    </div>
                  </td>
                </tr>

                {/* Sales NO1 */}
                {currentPeriod.salesNo1 &&
                  currentPeriod.salesNo1.amount !== 0 && (
                    <PnLRow
                      label={currentPeriod.salesNo1.accountName}
                      accountId={currentPeriod.salesNo1.accountId}
                      current={currentPeriod.salesNo1.amount}
                      comparison={comparisonPeriod?.salesNo1?.amount}
                      showComparison={showComparison}
                      onDrillDown={handleDrillDown}
                      indent
                    />
                  )}

                {/* Sales NO2 */}
                {currentPeriod.salesNo2 &&
                  currentPeriod.salesNo2.amount !== 0 && (
                    <PnLRow
                      label={currentPeriod.salesNo2.accountName}
                      accountId={currentPeriod.salesNo2.accountId}
                      current={currentPeriod.salesNo2.amount}
                      comparison={comparisonPeriod?.salesNo2?.amount}
                      showComparison={showComparison}
                      onDrillDown={handleDrillDown}
                      indent
                    />
                  )}

                {/* Other Income */}
                {currentPeriod.otherIncome.map((item) => (
                  <PnLRow
                    key={item.accountCode}
                    label={item.accountName}
                    accountId={item.accountId}
                    current={item.amount}
                    comparison={
                      comparisonPeriod?.otherIncome.find(
                        (i) => i.accountCode === item.accountCode,
                      )?.amount
                    }
                    showComparison={showComparison}
                    onDrillDown={handleDrillDown}
                    indent
                  />
                ))}

                {/* Gross Revenue Total */}
                <tr className="bg-emerald-50/50 font-bold border-t-2 border-emerald-100">
                  <td className="px-6 py-3 pl-10 text-slate-900">
                    Gross Revenue
                  </td>
                  <td className="px-6 py-3 text-right text-emerald-700">
                    {formatCurrency(currentPeriod.grossRevenue)}
                  </td>
                  {showComparison && comparisonPeriod && (
                    <>
                      <td className="px-6 py-3 text-right text-slate-600">
                        {formatCurrency(comparisonPeriod.grossRevenue)}
                      </td>
                      <VarianceCell
                        current={currentPeriod.grossRevenue}
                        comparison={comparisonPeriod.grossRevenue}
                      />
                    </>
                  )}
                </tr>

                {/* COGS Section */}
                <tr className="bg-blue-50/50">
                  <td
                    colSpan={showComparison && comparisonPeriod ? 4 : 2}
                    className="px-6 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowDownRight className="w-5 h-5 text-red-600" />
                      <span className="font-bold text-slate-900">
                        COST OF GOODS SOLD
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Purchases */}
                {currentPeriod.purchases &&
                  currentPeriod.purchases.amount !== 0 && (
                    <PnLRow
                      label={currentPeriod.purchases.accountName}
                      accountId={currentPeriod.purchases.accountId}
                      current={currentPeriod.purchases.amount}
                      comparison={comparisonPeriod?.purchases?.amount}
                      showComparison={showComparison}
                      onDrillDown={handleDrillDown}
                      indent
                    />
                  )}

                {/* Freight Inward */}
                {currentPeriod.freightInward &&
                  currentPeriod.freightInward.amount !== 0 && (
                    <PnLRow
                      label={currentPeriod.freightInward.accountName}
                      accountId={currentPeriod.freightInward.accountId}
                      current={currentPeriod.freightInward.amount}
                      comparison={comparisonPeriod?.freightInward?.amount}
                      showComparison={showComparison}
                      onDrillDown={handleDrillDown}
                      indent
                    />
                  )}

                {/* Direct Expenses */}
                {currentPeriod.directExpenses.map((item) => (
                  <PnLRow
                    key={item.accountCode}
                    label={item.accountName}
                    accountId={item.accountId}
                    current={item.amount}
                    comparison={
                      comparisonPeriod?.directExpenses.find(
                        (i) => i.accountCode === item.accountCode,
                      )?.amount
                    }
                    showComparison={showComparison}
                    onDrillDown={handleDrillDown}
                    indent
                  />
                ))}

                {/* Total COGS */}
                <tr className="bg-red-50/50 font-bold border-t-2 border-red-100">
                  <td className="px-6 py-3 pl-10 text-slate-900">Total COGS</td>
                  <td className="px-6 py-3 text-right text-red-700">
                    {formatCurrency(currentPeriod.totalCOGS)}
                  </td>
                  {showComparison && comparisonPeriod && (
                    <>
                      <td className="px-6 py-3 text-right text-slate-600">
                        {formatCurrency(comparisonPeriod.totalCOGS)}
                      </td>
                      <VarianceCell
                        current={currentPeriod.totalCOGS}
                        comparison={comparisonPeriod.totalCOGS}
                        inverse // Lower COGS is better
                      />
                    </>
                  )}
                </tr>

                {/* Gross Profit */}
                <tr className="bg-slate-100 font-bold text-lg">
                  <td className="px-6 py-4 text-slate-900">Gross Profit</td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={cn(
                        currentPeriod.grossProfit >= 0
                          ? "text-emerald-700"
                          : "text-red-700",
                      )}
                    >
                      {formatCurrency(currentPeriod.grossProfit)}
                    </span>
                  </td>
                  {showComparison && comparisonPeriod && (
                    <>
                      <td className="px-6 py-4 text-right text-slate-600">
                        {formatCurrency(comparisonPeriod.grossProfit)}
                      </td>
                      <VarianceCell
                        current={currentPeriod.grossProfit}
                        comparison={comparisonPeriod.grossProfit}
                      />
                    </>
                  )}
                </tr>

                {/* Gross Profit % */}
                <tr className="bg-slate-50 text-sm">
                  <td className="px-6 py-2 pl-10 text-slate-600">
                    Gross Profit %
                  </td>
                  <td className="px-6 py-2 text-right text-slate-700">
                    {currentPeriod.grossProfitPercent.toFixed(2)}%
                  </td>
                  {showComparison && comparisonPeriod && (
                    <>
                      <td className="px-6 py-2 text-right text-slate-600">
                        {comparisonPeriod.grossProfitPercent.toFixed(2)}%
                      </td>
                      <VarianceCell
                        current={currentPeriod.grossProfitPercent}
                        comparison={comparisonPeriod.grossProfitPercent}
                        isPercent
                      />
                    </>
                  )}
                </tr>

                {/* Operating Expenses Section */}
                <tr className="bg-blue-50/50">
                  <td
                    colSpan={showComparison && comparisonPeriod ? 4 : 2}
                    className="px-6 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowDownRight className="w-5 h-5 text-red-600" />
                      <span className="font-bold text-slate-900">
                        OPERATING EXPENSES
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Operating Expense Items */}
                {currentPeriod.operatingExpenses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={showComparison && comparisonPeriod ? 4 : 2}
                      className="px-6 py-4 text-center text-slate-400 italic"
                    >
                      No operating expenses for this period
                    </td>
                  </tr>
                ) : (
                  currentPeriod.operatingExpenses.map((item) => (
                    <PnLRow
                      key={item.accountCode}
                      label={item.accountName}
                      accountId={item.accountId}
                      current={item.amount}
                      comparison={
                        comparisonPeriod?.operatingExpenses.find(
                          (i) => i.accountCode === item.accountCode,
                        )?.amount
                      }
                      showComparison={showComparison}
                      onDrillDown={handleDrillDown}
                      indent
                    />
                  ))
                )}

                {/* Total Operating Expenses */}
                <tr className="bg-red-50/50 font-bold border-t-2 border-red-100">
                  <td className="px-6 py-3 pl-10 text-slate-900">
                    Total Operating Expenses
                  </td>
                  <td className="px-6 py-3 text-right text-red-700">
                    {formatCurrency(currentPeriod.totalOperatingExpenses)}
                  </td>
                  {showComparison && comparisonPeriod && (
                    <>
                      <td className="px-6 py-3 text-right text-slate-600">
                        {formatCurrency(
                          comparisonPeriod.totalOperatingExpenses,
                        )}
                      </td>
                      <VarianceCell
                        current={currentPeriod.totalOperatingExpenses}
                        comparison={comparisonPeriod.totalOperatingExpenses}
                        inverse // Lower expenses is better
                      />
                    </>
                  )}
                </tr>

                {/* Net Profit */}
                <tr
                  className={cn(
                    "font-black text-xl border-t-4",
                    currentPeriod.netProfit >= 0
                      ? "bg-emerald-100 border-emerald-300"
                      : "bg-red-100 border-red-300",
                  )}
                >
                  <td className="px-6 py-5 text-slate-900">
                    Net {currentPeriod.netProfit >= 0 ? "Profit" : "Loss"}
                  </td>
                  <td
                    className={cn(
                      "px-6 py-5 text-right",
                      currentPeriod.netProfit >= 0
                        ? "text-emerald-800"
                        : "text-red-800",
                    )}
                  >
                    {formatCurrency(Math.abs(currentPeriod.netProfit))}
                  </td>
                  {showComparison && comparisonPeriod && (
                    <>
                      <td className="px-6 py-5 text-right text-slate-700">
                        {formatCurrency(Math.abs(comparisonPeriod.netProfit))}
                      </td>
                      <VarianceCell
                        current={currentPeriod.netProfit}
                        comparison={comparisonPeriod.netProfit}
                      />
                    </>
                  )}
                </tr>

                {/* Net Profit % */}
                <tr className="bg-slate-50 text-sm">
                  <td className="px-6 py-2 pl-10 text-slate-600">
                    Net Profit %
                  </td>
                  <td className="px-6 py-2 text-right font-bold text-slate-700">
                    {currentPeriod.netProfitPercent.toFixed(2)}%
                  </td>
                  {showComparison && comparisonPeriod && (
                    <>
                      <td className="px-6 py-2 text-right text-slate-600">
                        {comparisonPeriod.netProfitPercent.toFixed(2)}%
                      </td>
                      <VarianceCell
                        current={currentPeriod.netProfitPercent}
                        comparison={comparisonPeriod.netProfitPercent}
                        isPercent
                      />
                    </>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <SummaryCard
          title="Gross Revenue"
          value={currentPeriod.grossRevenue}
          icon={TrendingUp}
          color="blue"
        />
        <SummaryCard
          title="Gross Profit"
          value={currentPeriod.grossProfit}
          icon={currentPeriod.grossProfit >= 0 ? TrendingUp : TrendingDown}
          color={currentPeriod.grossProfit >= 0 ? "emerald" : "red"}
        />
        <SummaryCard
          title="Operating Expenses"
          value={currentPeriod.totalOperatingExpenses}
          icon={ArrowDownRight}
          color="orange"
        />
        <SummaryCard
          title={`Net ${currentPeriod.netProfit >= 0 ? "Profit" : "Loss"}`}
          value={Math.abs(currentPeriod.netProfit)}
          icon={currentPeriod.netProfit >= 0 ? TrendingUp : TrendingDown}
          color={currentPeriod.netProfit >= 0 ? "emerald" : "red"}
        />
      </div>

      {/* Drill-down Dialog */}
      <Dialog open={drillDownOpen} onOpenChange={setDrillDownOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {drillDownData?.accountName || "Account Details"}
            </DialogTitle>
          </DialogHeader>

          {isLoadingDrillDown ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : drillDownData?.entries && drillDownData.entries.length > 0 ? (
            <div className="overflow-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drillDownData.entries.map((entry: any) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {entry.reference || "-"}
                      </TableCell>
                      <TableCell>
                        {entry.transaction ? (
                          <div>
                            <div className="font-medium">
                              {entry.transaction.number}
                            </div>
                            <div className="text-xs text-slate-500">
                              {entry.transaction.type}
                            </div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.transaction?.partyName || "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              No transactions found for this account in the selected period.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ReportsLayout>
  );
}

// P&L Row Component
interface PnLRowProps {
  label: string;
  accountId: string;
  current: number;
  comparison?: number;
  showComparison: boolean;
  onDrillDown: (accountId: string, accountName: string) => void;
  indent?: boolean;
}

function PnLRow({
  label,
  accountId,
  current,
  comparison,
  showComparison,
  onDrillDown,
  indent = false,
}: PnLRowProps) {
  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className={cn("px-6 py-2", indent && "pl-10")}>
        <button
          onClick={() => onDrillDown(accountId, label)}
          className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors"
        >
          <span>{label}</span>
          <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </td>
      <td className="px-6 py-2 text-right font-mono text-sm text-slate-900">
        {formatCurrency(current)}
      </td>
      {showComparison && (
        <>
          <td className="px-6 py-2 text-right font-mono text-sm text-slate-600">
            {comparison !== undefined ? formatCurrency(comparison) : "-"}
          </td>
          <VarianceCell current={current} comparison={comparison} />
        </>
      )}
    </tr>
  );
}

// Variance Cell Component
interface VarianceCellProps {
  current: number;
  comparison?: number;
  isPercent?: boolean;
  inverse?: boolean; // When lower is better (like expenses)
}

function VarianceCell({
  current,
  comparison,
  isPercent = false,
  inverse = false,
}: VarianceCellProps) {
  if (comparison === undefined) {
    return <td className="px-6 py-2 text-right text-slate-400">-</td>;
  }

  const variance = current - comparison;
  const percentChange =
    comparison !== 0 ? (variance / Math.abs(comparison)) * 100 : 0;

  // For inverse metrics (expenses), negative variance is good
  const isPositive = inverse ? variance < 0 : variance >= 0;

  return (
    <td className="px-6 py-2 text-right">
      <div className="flex items-center justify-end gap-1">
        {isPositive ? (
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5 text-red-600" />
        )}
        <span
          className={cn(
            "font-mono text-sm",
            isPositive ? "text-emerald-600" : "text-red-600",
          )}
        >
          {isPercent
            ? `${Math.abs(variance).toFixed(2)}%`
            : formatCurrency(Math.abs(variance))}
        </span>
      </div>
      <div className="text-xs text-slate-400">
        {percentChange >= 0 ? "+" : ""}
        {percentChange.toFixed(1)}%
      </div>
    </td>
  );
}

// Summary Card Component
interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: "blue" | "emerald" | "red" | "orange";
}

function SummaryCard({ title, value, icon: Icon, color }: SummaryCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    red: "bg-red-50 border-red-200 text-red-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
  };

  return (
    <Card className={cn("border", colorClasses[color])}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(value)}</p>
          </div>
          <div className="p-3 bg-white/50 rounded-lg">
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
