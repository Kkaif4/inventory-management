"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
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
import { DataTable } from "@/components/ui/data-table";
import { useOutletStore } from "@/store/use-outlet-store";
import { getExpenseRegisterReport } from "@/actions/expenses/reports";
import { getExpenseCategories } from "@/actions/expenses/categories";
import type {
  ExpenseRegisterRow,
  ExpenseCategoryDetail,
} from "@/types/expense.types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function ExpenseRegisterReportPage() {
  const outletId = useOutletStore((state) => state.currentOutlet?.id);
  const [rows, setRows] = useState<ExpenseRegisterRow[]>([]);
  const [categories, setCategories] = useState<ExpenseCategoryDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filter state
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");

  const [totals, setTotals] = useState({
    totalTaxable: 0,
    totalGst: 0,
    totalAmount: 0,
    count: 0,
  });

  // Load categories
  useEffect(() => {
    if (!outletId) return;

    const loadCategories = async () => {
      const res = await getExpenseCategories(outletId);
      if (res.success && res.data) {
        setCategories(res.data);
      }
    };

    loadCategories();
  }, [outletId]);

  // Load report
  const loadReport = async () => {
    if (!outletId) return;

    try {
      setLoading(true);
      const res = await getExpenseRegisterReport(outletId, {
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        categoryId: categoryId || undefined,
        status: status || undefined,
      });

      if (!res.success || !res.data) {
        toast.error(res.error?.message || "Failed to load report");
        return;
      }

      setRows(res.data.rows);
      setTotals(res.data.totals);
    } catch (error) {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
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

      // Prepare data
      const exportData = [
        {
          "Txn Number": "",
          Date: "",
          Category: "",
          Vendor: "",
          Description: "",
          "Taxable Amount": "",
          GST: "",
          "Total Amount": "",
          Account: "",
          Status: "",
        },
        ...rows.map((row) => ({
          "Txn Number": row.txnNumber,
          Date: row.date,
          Category: row.category,
          Vendor: row.vendor || "",
          Description: row.description,
          "Taxable Amount": row.taxable,
          GST: row.gst,
          "Total Amount": row.total,
          Account: row.account,
          Status: row.status,
        })),
        {
          "Txn Number": "",
          Date: "",
          Category: "TOTAL",
          Vendor: "",
          Description: "",
          "Taxable Amount": totals.totalTaxable,
          GST: totals.totalGst,
          "Total Amount": totals.totalAmount,
          Account: "",
          Status: `${totals.count} transactions`,
        },
      ];

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Expense Register");

      XLSX.writeFile(
        wb,
        `Expense_Register_${format(new Date(), "yyyy-MM-dd")}.xlsx`
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">Expense Register</h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete record of all expenses
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
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
            <Label htmlFor="category" className="text-xs font-semibold mb-2">
              Category
            </Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v || "")}>
              <SelectTrigger id="category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              Total GST
            </p>
            <p className="text-xl font-bold text-slate-900">
              {formatCurrency(totals.totalGst)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 mb-1">
              Total Amount
            </p>
            <p className="text-xl font-bold text-blue-600">
              {formatCurrency(totals.totalAmount)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 mb-1">
              Transaction Count
            </p>
            <p className="text-xl font-bold text-slate-900">
              {totals.count}
            </p>
          </div>
        </div>
      )}

      {/* Export Button */}
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
                    Txn #
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Description
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
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {row.txnNumber}
                    </td>
                    <td className="px-6 py-3 text-slate-600">{row.date}</td>
                    <td className="px-6 py-3 text-slate-600">
                      {row.category}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {row.vendor || "—"}
                    </td>
                    <td className="px-6 py-3 text-slate-600 max-w-xs truncate">
                      {row.description}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-900">
                      {formatCurrency(row.taxable)}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-900">
                      {formatCurrency(row.gst)}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(row.total)}
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
