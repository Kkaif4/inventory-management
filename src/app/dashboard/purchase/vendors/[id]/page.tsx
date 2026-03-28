"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { getVendorDetails } from "@/actions/purchase/vendors";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VendorActions } from "@/components/purchase/vendor-actions";
import { DataTable } from "@/components/ui/data-table";
import { VendorPaymentDrawer } from "@/components/purchase/vendor-payment-drawer";
import { ColumnDef } from "@tanstack/react-table";

type Bill = {
  id: string;
  txnNumber: string;
  date: Date;
  dueDate: Date;
  grandTotal: number;
  totalPaid: number;
  outstanding: number;
  daysOverdue: number;
  isOverdue: boolean;
  status: string;
};

type PaymentRecord = {
  id: string;
  paymentDate: Date;
  amount: number;
  referenceNo: string | null;
  bankAccount: { name: string } | null;
  invoice: { txnNumber: string } | null;
  invoiceId: string;
};

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();

  const [vendorData, setVendorData] = useState<{
    party: any;
    summary: any;
    openBills: Bill[];
    allBills: Bill[];
    paymentHistory: PaymentRecord[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [payDrawerOpen, setPayDrawerOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const loadVendor = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    const result = await getVendorDetails(id);
    if (result.success && result.data) {
      setVendorData(result.data);
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadVendor();
  }, [loadVendor]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4 animate-pulse pb-20">
        <div className="h-10 bg-slate-100 rounded-xl w-48" />
        <div className="h-40 bg-slate-100 rounded-xl" />
        <div className="h-64 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div className="max-w-6xl mx-auto text-center py-20">
        <p className="text-slate-500">Vendor not found.</p>
      </div>
    );
  }

  const { party, summary, openBills, allBills, paymentHistory } = vendorData;

  const openPaymentDrawer = (bill?: Bill) => {
    setSelectedBill(bill || openBills[0] || null);
    setPayDrawerOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Vendor Details"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Vendors", href: "/dashboard/purchase/vendors" },
            { label: party.name },
          ]}
        />
        <div className="flex space-x-2">
          <VendorActions vendorId={party.id} />
        </div>
      </div>

      {/* Header Block */}
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <div className="flex justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{party.name}</h2>
            <div className="text-sm text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-2">
              {party.phone && <span>📞 {party.phone}</span>}
              {party.email && <span>✉️ {party.email}</span>}
              {party.address && <span>📍 {party.address}</span>}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="flex space-x-2">
              {party.gstin && (
                <Badge variant="outline" className="font-mono">
                  GST: {party.gstin}
                </Badge>
              )}
              {party.state && (
                <Badge variant="outline" className="bg-slate-50">
                  {party.state}
                </Badge>
              )}
              <Badge
                variant={party.isActive ? "default" : "destructive"}
                className={
                  party.isActive
                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200"
                    : ""
                }
              >
                {party.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Bank details strip */}
        {(party.bankName || party.bankAccountNumber) && (
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center text-slate-800 font-medium w-full mb-1">
              <CreditCard className="w-4 h-4 mr-2 text-slate-500" />
              Bank Account Details
            </div>
            {party.bankName && (
              <div>
                <span className="text-slate-400 text-xs block">Bank Name</span>
                {party.bankName}
              </div>
            )}
            {party.bankAccountName && (
              <div>
                <span className="text-slate-400 text-xs block">
                  Account Holder
                </span>
                {party.bankAccountName}
              </div>
            )}
            {party.bankAccountNumber && (
              <div>
                <span className="text-slate-400 text-xs block">
                  Account No.
                </span>
                <span className="font-mono">{party.bankAccountNumber}</span>
              </div>
            )}
            {party.bankIfsc && (
              <div>
                <span className="text-slate-400 text-xs block">IFSC</span>
                <span className="font-mono">{party.bankIfsc}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4x Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Payment Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {party.creditPeriod ? `${party.creditPeriod} days` : "Immediate"}
            </div>
            <div className="text-xs text-slate-500 mt-1">Credit period</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Purchased (FY)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalPurchasedFy)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Paid (FY)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              {formatCurrency(summary.totalPaidFy)}
            </div>
          </CardContent>
        </Card>
        <Card
          className={
            summary.outstandingBalance > 0
              ? "border-amber-200 bg-amber-50/50"
              : ""
          }
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Outstanding (We Owe)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${summary.outstandingBalance > 0 ? "text-amber-700" : "text-slate-900"}`}
            >
              {formatCurrency(summary.outstandingBalance)}
            </div>
            {summary.overdue > 0 && (
              <div className="text-xs font-semibold text-red-600 mt-1">
                {formatCurrency(summary.overdue)} Overdue
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Open Bills */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Open Purchase Bills
            </h3>
            <p className="text-sm text-slate-500">Bills pending payment.</p>
          </div>
        </div>
        <div className="p-6">
          <DataTable<Bill, unknown>
            columns={[
              {
                accessorKey: "txnNumber",
                header: "Bill No.",
                cell: ({ row }) => (
                  <Link
                    href={`/dashboard/purchase/bills/${row.original.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {row.original.txnNumber}
                  </Link>
                ),
              },
              {
                accessorKey: "date",
                header: "Date",
                cell: ({ row }) => formatDate(row.original.date),
              },
              {
                accessorKey: "dueDate",
                header: "Due Date",
                cell: ({ row }) => formatDate(row.original.dueDate),
              },
              {
                accessorKey: "grandTotal",
                header: "Total (₹)",
                cell: ({ row }) => (
                  <div className="text-right">
                    {formatCurrency(row.original.grandTotal)}
                  </div>
                ),
              },
              {
                accessorKey: "totalPaid",
                header: "Paid (₹)",
                cell: ({ row }) => (
                  <div className="text-right text-emerald-600">
                    {formatCurrency(row.original.totalPaid)}
                  </div>
                ),
              },
              {
                accessorKey: "outstanding",
                header: "Outstanding (₹)",
                cell: ({ row }) => (
                  <div className="text-right font-bold text-amber-700">
                    {formatCurrency(row.original.outstanding)}
                  </div>
                ),
              },
              {
                accessorKey: "daysOverdue",
                header: "Days Overdue",
                cell: ({ row }) => (
                  <div className="text-right">
                    {row.original.isOverdue ? (
                      <span className="font-semibold text-red-600">
                        {row.original.daysOverdue}d
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </div>
                ),
              },
              {
                id: "actions",
                header: "",
                cell: ({ row }) => (
                  <div className="flex items-center gap-1 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => openPaymentDrawer(row.original)}
                    >
                      Pay
                    </Button>
                    <Link href={`/dashboard/purchase/bills/${row.original.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        View
                      </Button>
                    </Link>
                  </div>
                ),
              },
            ]}
            data={openBills}
            emptyState={
              <p className="text-slate-500">No open bills found. All clear!</p>
            }
            rowClassName={(row) => (row.isOverdue ? "bg-red-50/30" : "")}
          />
        </div>
      </div>

      {/* History Tabs */}
      <Tabs defaultValue="bills" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="bills">Purchase History</TabsTrigger>
          <TabsTrigger value="payments">Outbound Payments</TabsTrigger>
        </TabsList>
        <TabsContent value="bills" className="mt-4">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden p-6">
            <DataTable<Bill, unknown>
              columns={[
                {
                  accessorKey: "txnNumber",
                  header: "Bill No.",
                  cell: ({ row }) => (
                    <Link
                      href={`/dashboard/purchase/bills/${row.original.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {row.original.txnNumber}
                    </Link>
                  ),
                },
                {
                  accessorKey: "date",
                  header: "Date",
                  cell: ({ row }) => formatDate(row.original.date),
                },
                {
                  accessorKey: "status",
                  header: "Status",
                  cell: ({ row }) => (
                    <Badge variant="outline">{row.original.status}</Badge>
                  ),
                },
                {
                  accessorKey: "grandTotal",
                  header: "Total (₹)",
                  cell: ({ row }) => (
                    <div className="text-right">
                      {formatCurrency(row.original.grandTotal)}
                    </div>
                  ),
                },
                {
                  accessorKey: "totalPaid",
                  header: "Paid (₹)",
                  cell: ({ row }) => (
                    <div className="text-right text-emerald-600">
                      {formatCurrency(row.original.totalPaid)}
                    </div>
                  ),
                },
                {
                  accessorKey: "outstanding",
                  header: "Outstanding (₹)",
                  cell: ({ row }) => (
                    <div className="text-right">
                      {formatCurrency(row.original.outstanding)}
                    </div>
                  ),
                },
              ]}
              data={allBills}
              emptyState={
                <p className="text-slate-500">
                  No purchase history found for this vendor.
                </p>
              }
            />
          </div>
        </TabsContent>
        <TabsContent value="payments" className="mt-4">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden p-6">
            <DataTable<PaymentRecord, unknown>
              columns={[
                {
                  accessorKey: "paymentDate",
                  header: "Date",
                  cell: ({ row }) => formatDate(row.original.paymentDate),
                },
                {
                  accessorKey: "amount",
                  header: "Amount (₹)",
                  cell: ({ row }) => (
                    <div className="font-medium text-emerald-600">
                      {formatCurrency(row.original.amount)}
                    </div>
                  ),
                },
                {
                  accessorKey: "referenceNo",
                  header: "Reference",
                  cell: ({ row }) => row.original.referenceNo || "—",
                },
                {
                  accessorKey: "bankAccount",
                  header: "Paid From",
                  cell: ({ row }) => row.original.bankAccount?.name || "—",
                },
                {
                  accessorKey: "invoice",
                  header: "Against Bill",
                  cell: ({ row }) =>
                    row.original.invoice?.txnNumber ? (
                      <Link
                        href={`/dashboard/purchase/bills/${row.original.invoiceId}`}
                        className="text-blue-600 hover:underline"
                      >
                        {row.original.invoice.txnNumber}
                      </Link>
                    ) : (
                      "—"
                    ),
                },
              ]}
              data={paymentHistory}
              emptyState={
                <p className="text-slate-500">
                  No outbound payments found for this vendor.
                </p>
              }
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Drawer */}
      {selectedBill && session?.user?.id && (
        <VendorPaymentDrawer
          open={payDrawerOpen}
          onClose={() => {
            setPayDrawerOpen(false);
            setSelectedBill(null);
          }}
          bill={{
            id: selectedBill.id,
            txnNumber: selectedBill.txnNumber,
            grandTotal: selectedBill.grandTotal,
            totalPaid: selectedBill.totalPaid,
            partyId: party.id,
            partyName: party.name,
            outletId: party.outletId,
            date: new Date(selectedBill.date).toISOString().split("T")[0],
          }}
          userId={session.user.id}
          onSuccess={loadVendor}
        />
      )}
    </div>
  );
}
