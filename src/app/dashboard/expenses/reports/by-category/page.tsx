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
import { getExpensesByCategoryReport } from "@/actions/expenses/reports";
import type { ExpenseByCategoryRow } from "@/types/expense.types";
import { format } from "date-fns";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function ExpensesByCategoryReportPage() {
  const outletId = useOutletStore((state) => state.currentOutlet?.id);
  const [rows, setRows] = useState<ExpenseByCategoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("");

  const [grandTotal, setGrandTotal] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const loadReport = async () => {
    if (!outletId) return;

    try {
      setLoading(true);
      const res = await getExpensesByCategoryReport(outletId, {
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        status: status || undefined,
      });

      if (!res.success || !res.data) {
        toast.error(res.error?.message || "Failed to load report");
        return;
      }

      setRows(res.data.rows);
      setGrandTotal(res.data.grandTotal);
      setTotalCount(res.data.totalCount);
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
          Category: "",
          Count: "",
          "Taxable Amount": "",
          GST: "",
          "Total Amount": "",
          "% of Total": "",
        },
        ...rows.map((row) => ({
          Category: row.category,
          Count: row.count,
          "Taxable Amount": row.totalTaxable,
          GST: row.totalGst,
          "Total Amount": row.total,
          "% of Total": row.percentOfTotal.toFixed(2) + "%",
        })),
        {
          Category: "TOTAL",
          Count: totalCount,
          "Taxable Amount": rows.reduce((sum, r) => sum + r.totalTaxable, 0),
          GST: rows.reduce((sum, r) => sum + r.totalGst, 0),
          "Total Amount": grandTotal,
          "% of Total": "100%",
        },
      ];

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Expenses by Category");

      XLSX.writeFile(
        wb,
        `Expenses_by_Category_${format(new Date(), "yyyy-MM-dd")}.xlsx`
      );

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
        <h1 className="text-3xl font-black text-slate-900">Expenses by Category</h1>
        <p className="text-sm text-slate-500 mt-1">
          Summary grouped by expense category
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

      {/* Summary */}
      {rows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 mb-1">
              Total Categories
            </p>
            <p className="text-xl font-bold text-slate-900">{rows.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 mb-1">
              Transaction Count
            </p>
            <p className="text-xl font-bold text-slate-900">{totalCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 mb-1">
              Total Amount
            </p>
            <p className="text-xl font-bold text-blue-600">
              {formatCurrency(grandTotal)}
            </p>
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
            <p className="text-slate-500">No expenses found for the selected filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900">
                    Count
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900">
                    Taxable
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900">
                    GST
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.category}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {row.category}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-600">
                      {row.count}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-600">
                      {formatCurrency(row.totalTaxable)}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-600">
                      {formatCurrency(row.totalGst)}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(row.total)}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-900">
                      <div className="flex items-center justify-end gap-2">
                        <div
                          className="h-2 bg-blue-200 rounded-full"
                          style={{
                            width: `${Math.max(row.percentOfTotal * 2, 10)}px`,
                          }}
                        />
                        <span className="text-xs font-semibold w-12 text-right">
                          {row.percentOfTotal.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
