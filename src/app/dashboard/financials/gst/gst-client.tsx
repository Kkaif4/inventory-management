"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, startOfMonth, endOfMonth } from "date-fns";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportFilters } from "@/components/reports/report-filters";
import { getGSTSummary } from "@/actions/reports/gst";
import { formatCurrency } from "@/lib/utils";

interface GSTReportsClientProps {
  outlets: { id: string; name: string }[];
}

export function GSTReportsClient({ outlets }: GSTReportsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [gstData, setGstData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const now = new Date();
  const defaultStartDate = startOfMonth(now);
  const defaultEndDate = endOfMonth(now);

  const selectedOutletId = searchParams.get("outletId") || outlets[0].id;
  const startDate = searchParams.get("startDate")
    ? new Date(searchParams.get("startDate")!)
    : defaultStartDate;
  const endDate = searchParams.get("endDate")
    ? new Date(searchParams.get("endDate")!)
    : defaultEndDate;

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

  const handleOutletChange = (outletId: string) => {
    updateURL({ outletId });
  };

  const handleDateChange = (start: Date, end: Date) => {
    updateURL({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
  };

  const handleReset = () => {
    updateURL({ startDate: null, endDate: null, outletId: null });
    setGstData(null);
  };

  const handleLoadReport = async () => {
    setIsLoading(true);
    try {
      const result = await getGSTSummary(startDate, endDate, selectedOutletId);
      if (result.success && result.data) {
        setGstData(result.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="GST Compliance Reports"
        subtitle="Outward & Inward supplies summary with tax details."
        breadcrumbs={[{ label: "Financials" }, { label: "GST Reports" }]}
      />

      {/* Filter Panel - Reusable Component */}
      <ReportFilters
        outlets={outlets}
        selectedOutletId={selectedOutletId}
        onOutletChange={handleOutletChange}
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
        onReset={handleReset}
        onApply={handleLoadReport}
        isLoading={isLoading}
        isPending={isPending}
        showDateRange={true}
        showOutlet={true}
        applyButtonLabel="Load Report"
      />

      {/* GST Summary Tables */}
      {gstData ? (
        <div className="space-y-6">
          {/* Outward Supplies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                GSTR-1: Outward Supplies (Sales)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Taxable</TableHead>
                      <TableHead className="text-right">CGST</TableHead>
                      <TableHead className="text-right">SGST</TableHead>
                      <TableHead className="text-right">IGST</TableHead>
                      <TableHead className="text-right">Total Tax</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gstData.outwardSupplies.invoices.map((inv: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {inv.txnNumber}
                        </TableCell>
                        <TableCell>
                          {format(new Date(inv.date), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>{inv.partyName}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(inv.taxableAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(inv.cgst)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(inv.sgst)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(inv.igst)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(inv.totalTax)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-5 gap-4 mt-4 p-4 bg-slate-50 rounded">
                <div>
                  <p className="text-xs text-slate-600">Invoices</p>
                  <p className="text-lg font-bold">
                    {gstData.outwardSupplies.summary.totalInvoices}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Taxable</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(
                      gstData.outwardSupplies.summary.totalTaxableAmount,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">CGST</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(gstData.outwardSupplies.summary.totalCGST)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">SGST</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(gstData.outwardSupplies.summary.totalSGST)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Total Tax</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(gstData.outwardSupplies.summary.totalTax)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inward Supplies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                GSTR-2B: Inward Supplies (Purchases)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead className="text-right">Taxable</TableHead>
                      <TableHead className="text-right">CGST</TableHead>
                      <TableHead className="text-right">SGST</TableHead>
                      <TableHead className="text-right">IGST</TableHead>
                      <TableHead className="text-right">Total Tax</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gstData.inwardSupplies.bills.map((bill: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {bill.txnNumber}
                        </TableCell>
                        <TableCell>
                          {format(new Date(bill.date), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>{bill.partyName}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(bill.taxableAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(bill.cgst)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(bill.sgst)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(bill.igst)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(bill.totalTax)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-5 gap-4 mt-4 p-4 bg-slate-50 rounded">
                <div>
                  <p className="text-xs text-slate-600">Bills</p>
                  <p className="text-lg font-bold">
                    {gstData.inwardSupplies.summary.totalBills}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Taxable</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(
                      gstData.inwardSupplies.summary.totalTaxableAmount,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">CGST</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(gstData.inwardSupplies.summary.totalCGST)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">SGST</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(gstData.inwardSupplies.summary.totalSGST)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Total Tax</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(gstData.inwardSupplies.summary.totalTax)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                GSTR-3B: Tax Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-700">Output Tax</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">CGST</span>
                      <span className="font-medium">
                        {formatCurrency(gstData.taxSummary.totalOutputCGST)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">SGST</span>
                      <span className="font-medium">
                        {formatCurrency(gstData.taxSummary.totalOutputSGST)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">IGST</span>
                      <span className="font-medium">
                        {formatCurrency(gstData.taxSummary.totalOutputIGST)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-700">Input Tax</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">CGST</span>
                      <span className="font-medium">
                        {formatCurrency(gstData.taxSummary.totalInputCGST)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">SGST</span>
                      <span className="font-medium">
                        {formatCurrency(gstData.taxSummary.totalInputSGST)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">IGST</span>
                      <span className="font-medium">
                        {formatCurrency(gstData.taxSummary.totalInputIGST)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-700">Net Payable</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-blue-50 rounded">
                      <span className="text-sm font-medium">CGST</span>
                      <span className="font-bold text-blue-600">
                        {formatCurrency(gstData.taxSummary.netCGSTPayable)}
                      </span>
                    </div>
                    <div className="flex justify-between p-2 bg-blue-50 rounded">
                      <span className="text-sm font-medium">SGST</span>
                      <span className="font-bold text-blue-600">
                        {formatCurrency(gstData.taxSummary.netSGSTPayable)}
                      </span>
                    </div>
                    <div className="flex justify-between p-2 bg-blue-50 rounded">
                      <span className="text-sm font-medium">IGST</span>
                      <span className="font-bold text-blue-600">
                        {formatCurrency(gstData.taxSummary.netIGSTPayable)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-slate-500">
                Select a period and outlet, then click "Load Report" to view GST
                summary.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
