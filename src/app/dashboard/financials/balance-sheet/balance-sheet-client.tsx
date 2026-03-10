"use client";

import { PageHeader } from "@/components/ui/page-header";

export function BalanceSheetClient({
  data,
}: {
  data: { assets: any[]; liabilities: any[]; equity: any[] };
}) {
  const totalAssets = data.assets.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = data.liabilities.reduce(
    (sum, a) => sum + a.balance,
    0,
  );
  const totalEquity = data.equity.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilitiesEquity = totalLiabilities + totalEquity;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Balance Sheet"
        subtitle="Snapshot of assets, liabilities, and equity at a specific point in time."
        breadcrumbs={[{ label: "Financials" }, { label: "Balance Sheet" }]}
      />

      <div className="grid grid-cols-2 gap-8 items-start">
        <div className="space-y-4 bg-surface-base border border-border-default rounded-lg p-6">
          <h3 className="text-lg font-bold text-brand border-b pb-2">Assets</h3>
          <div className="space-y-2">
            {data.assets.map((a, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{a.name}</span>
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
              {data.liabilities.map((a, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{a.name}</span>
                  <span className="font-medium font-mono text-xs">
                    ₹{a.balance.toFixed(2)}
                  </span>
                </div>
              ))}
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
              {data.equity.map((a, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{a.name}</span>
                  <span className="font-medium font-mono text-xs">
                    ₹{a.balance.toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="pt-4 border-t flex justify-between font-bold">
                <span>Total Equity</span>
                <span>₹{totalEquity.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-surface-muted rounded border flex justify-between font-bold text-lg">
            <span>Total Liabilities & Equity</span>
            <span
              className={
                Math.abs(totalAssets - totalLiabilitiesEquity) < 0.01
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              ₹{totalLiabilitiesEquity.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
