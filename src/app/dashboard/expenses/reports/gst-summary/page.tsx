"use client";

import React, { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOutletStore } from "@/store/use-outlet-store";
import { getGstSummaryReport } from "@/actions/expenses/reports";
import type { ExpenseGSTRow } from "@/types/expense.types";
import { format } from "date-fns";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function GstSummaryReportPage() {
  const outletId = useOutletStore((state) => state.currentOutlet?.id);
  const [rows, setRows] = useState<ExpenseGSTRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("");

  const [totals, setTotals] = useState({
    totalTaxable: 0,
    totalGst: 0,
    totalAmount: 0,
    count: 0,
  });

  const [gstRecoverable, setGstRecoverable] = useState(0);

  const loadReport = async () => {
    if (!outletId) return;

    try {
      setLoading(true);
      const res = await getGstSummaryReport(outletId, {
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        status: status || undefined,
      });

      if (!res.success || !res.data) {
        toast.error(res.error?.message || "Failed to load report");
        return;
      }

      setRows(res.data.rows);
      setTotals(res.data.totals);
      setGstRecoverable(res.data.gstRecoverable);
    } catch (error) {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [outletId]);

  const handleExport = async () => {
    if (rows.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      setExporting(true);
      const { default: XLSX } = await import("xlsx");

      const exportData = [
        {
          "GST Rate": "",
          Count: "",
          "Taxable Amount": "",
          "GST Amount": "",
          "Total Amount": "",
        },
        ...rows.map((row) => ({
          "GST Rate": row.gstRate + "%",
          Count: row.count,
          "Taxable Amount": row.taxableAmount,
          "GST Amount": row.gstAmount,
          "Total Amount": row.totalAmount,
        })),
        {
          "GST Rate": "TOTAL",
          Count: totals.count,
          "Taxable Amount": totals.totalTaxable,
          "GST Amount": totals.totalGst,
          "Total Amount": totals.totalAmount,
        },
      ];

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "GST Summary");

      XLSX.writeFile(wb, `GST_Summary_${format(new Date(), "yyyy-MM-dd")}.xlsx`);

      toast.success("Report exported successfully");
    } catch (error) {
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">GST Summary</h1>
        <p className="text-sm text-slate-500 mt-1">
          Input GST breakdown by rate with recoverable amount
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <Label htmlFor="date-from" className="text-xs font-semibold mb-2">
              From Date
            </Label>
            <Input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="date-to" className="text-xs font-semibold mb-2">
              To Date
            </Label>
            <Input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="status" className="text-xs font-semibold mb-2">
              Status
            </Label>
            <Select value={status} onValueChange={(v) => setStatus(v || "")}>
              <SelectTrigger id="status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="POSTED">Posted</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={loadReport}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Apply Filters"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {totals.count > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 mb-1">
              Total Taxable
            </p>
            <p className="text-xl font-bold text-slate-900">
              {formatCurrency(totals.totalTaxable)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 mb-1">
              Total GST Amount
            </p>
            <p className="text-xl font-bold text-slate-900">
              {formatCurrency(totals.totalGst)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 mb-1">
              GST Recoverable
            </p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(gstRecoverable)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 mb-1">
              Transactions
            </p>
            <p className="text-xl font-bold text-slate-900">{totals.count}</p>
          </div>
        </div>
      )}

      {/* Export */}
      {rows.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleExport}
            disabled={exporting}
            variant="outline"
            className="gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export to Excel
              </>
            )}
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500">No GST transactions found for the selected filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    GST Rate
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900">
                    Count
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900">
                    Taxable Amount
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900">
                    GST Amount
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900">
                    Total Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.gstRate}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {row.gstRate}%
                    </td>
                    <td className="px-6 py-3 text-right text-slate-600">
                      {row.count}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-600">
                      {formatCurrency(row.taxableAmount)}
                    </td>
                    <td className="px-6 py-3 text-right text-green-600 font-medium">
                      {formatCurrency(row.gstAmount)}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(row.totalAmount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-semibold border-t-2 border-slate-300">
                  <td className="px-6 py-3 text-slate-900">TOTAL</td>
                  <td className="px-6 py-3 text-right text-slate-900">
                    {totals.count}
                  </td>
                  <td className="px-6 py-3 text-right text-slate-900">
                    {formatCurrency(totals.totalTaxable)}
                  </td>
                  <td className="px-6 py-3 text-right text-green-600">
                    {formatCurrency(totals.totalGst)}
                  </td>
                  <td className="px-6 py-3 text-right text-slate-900">
                    {formatCurrency(totals.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
