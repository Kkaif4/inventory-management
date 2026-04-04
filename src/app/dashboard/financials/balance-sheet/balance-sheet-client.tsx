"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useTransition } from "react";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportFilters } from "@/components/reports/report-filters";

export function BalanceSheetClient({
  data,
  outlets,
  currentOutletId,
}: {
  data: {
    assets: { items: any[]; overdrafts?: any[]; total: number };
    liabilities: { items: any[]; bankOverdrafts?: any[]; total: number };
    equity: { items: any[]; total: number };
    income?: { items: any[]; total: number };
    expense?: { items: any[]; total: number };
    netProfit?: number;
    isBalanced: boolean;
    balanceDifference?: number;
    asOnDate: Date;
  };
  outlets: { id: string; name: string }[];
  currentOutletId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Get current date from data
  const currentDate = new Date(data.asOnDate);
  const selectedOutletId = searchParams.get("outletId") || currentOutletId;

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

  // Handle outlet change
  const handleOutletChange = (outletId: string) => {
    updateURL({ outletId });
  };

  // Handle date change (uses endDate as "As On Date")
  const handleDateChange = (startDate: Date, endDate: Date) => {
    updateURL({ asOnDate: endDate.toISOString() });
  };

  // Handle reset
  const handleReset = () => {
    updateURL({ asOnDate: null, outletId: null });
  };

  // Handle apply (no-op since we update URL on field change)
  const handleApply = () => {
    // URL is already updated, no need to do anything
  };

  const totalAssets = data.assets.total;
  const totalLiabilities = data.liabilities.total;
  const totalEquity = data.equity.total;
  const totalLiabilitiesEquity = totalLiabilities + totalEquity;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Balance Sheet"
        subtitle="Snapshot of assets, liabilities, and equity at a specific point in time."
        breadcrumbs={[{ label: "Financials" }, { label: "Balance Sheet" }]}
      />

      {/* Filter Panel - Reusable Component */}
      <ReportFilters
        outlets={outlets}
        selectedOutletId={selectedOutletId}
        onOutletChange={handleOutletChange}
        startDate={currentDate}
        endDate={currentDate}
        onDateChange={handleDateChange}
        onReset={handleReset}
        onApply={handleApply}
        isPending={isPending}
        showDateRange={true}
        showOutlet={true}
        applyButtonLabel="Refresh"
      />

      <div className="grid grid-cols-2 gap-8 items-start">
        <div className="space-y-4 bg-surface-base border border-border-default rounded-lg p-6">
          <h3 className="text-lg font-bold text-brand border-b pb-2">Assets</h3>
          <div className="space-y-2">
            {data.assets.items.map((a: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span>
                  {a.name} <span className="text-xs text-text-secondary">({a.code})</span>
                </span>
                <span className="font-medium font-mono text-xs">
                  ₹{a.balance.toFixed(2)}
                </span>
              </div>
            ))}
            <div className="pt-4 border-t flex justify-between font-bold text-brand">
              <span>Total Assets</span>
              <span>₹{totalAssets.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4 bg-surface-base border border-border-default rounded-lg p-6">
            <h3 className="text-lg font-bold text-red-600 border-b pb-2">
              Liabilities
            </h3>
            <div className="space-y-2">
              {data.liabilities.items.map((a: any, i: number) => (
                <div key={`liability-${i}`} className="flex justify-between text-sm">
                  <span>
                    {a.name} <span className="text-xs text-text-secondary">({a.code})</span>
                  </span>
                  <span className="font-medium font-mono text-xs">
                    ₹{a.balance.toFixed(2)}
                  </span>
                </div>
              ))}
              {data.liabilities.bankOverdrafts && data.liabilities.bankOverdrafts.length > 0 && (
                <>
                  <div className="pt-2 text-xs text-text-secondary font-semibold">Bank Overdrafts</div>
                  {data.liabilities.bankOverdrafts.map((a: any, i: number) => (
                    <div key={`overdraft-${i}`} className="flex justify-between text-sm pl-2 border-l-2 border-amber-200">
                      <span>
                        {a.displayName} <span className="text-xs text-text-secondary">({a.code})</span>
                      </span>
                      <span className="font-medium font-mono text-xs text-amber-600">
                        ₹{a.balance.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </>
              )}
              <div className="pt-4 border-t flex justify-between font-bold">
                <span>Total Liabilities</span>
                <span>₹{totalLiabilities.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-surface-base border border-border-default rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-600 border-b pb-2">
              Equity
            </h3>
            <div className="space-y-2">
              {data.equity.items.map((a: any, i: number) => (
                <div key={`equity-${i}`} className="flex justify-between text-sm">
                  <span>
                    {a.name} <span className="text-xs text-text-secondary">({a.code})</span>
                  </span>
                  <span className="font-medium font-mono text-xs">
                    ₹{a.balance.toFixed(2)}
                  </span>
                </div>
              ))}
              {data.netProfit !== undefined && (
                <div className="pt-2 flex justify-between text-sm font-semibold border-t">
                  <span className={data.netProfit >= 0 ? "text-green-600" : "text-red-600"}>
                    Net Profit
                  </span>
                  <span className={`font-mono text-xs ${data.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ₹{data.netProfit.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="pt-4 border-t flex justify-between font-bold">
                <span>Total Equity</span>
                <span>₹{(totalEquity + (data.netProfit || 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded border flex justify-between font-bold text-lg ${
            data.isBalanced
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}>
            <span>Total Liabilities & Equity</span>
            <span>₹{totalLiabilitiesEquity.toFixed(2)}</span>
          </div>

          {data.isBalanced && (
            <div className="p-4 bg-green-50 border border-green-200 rounded text-green-700 text-sm font-medium">
              ✓ Balance sheet is balanced
            </div>
          )}

          {!data.isBalanced && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm font-medium">
              ⚠️ Balance sheet is not balanced. Difference: ₹{data.balanceDifference?.toFixed(2) || (totalAssets - totalLiabilitiesEquity).toFixed(2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
