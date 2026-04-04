"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { getCustomerDetails } from "@/actions/sales/customers";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CustomerActions } from "@/components/sales/customer-actions";
import { DataTable } from "@/components/ui/data-table";
import { PaymentDrawer } from "@/components/sales/payment-drawer";
import { ColumnDef } from "@tanstack/react-table";

type Invoice = {
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
  account?: { name: string; type: string | null } | null;
  invoice: { txnNumber: string } | null;
  invoiceId: string;
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();

  const [customerData, setCustomerData] = useState<{
    party: any;
    summary: any;
    openInvoices: Invoice[];
    allInvoices: Invoice[];
    paymentHistory: PaymentRecord[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [payDrawerOpen, setPayDrawerOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const loadCustomer = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    const result = await getCustomerDetails(id);
    if (result.success && result.data) {
      setCustomerData(result.data);
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4 animate-pulse pb-20">
        <div className="h-10 bg-slate-100 rounded-xl w-48" />
        <div className="h-40 bg-slate-100 rounded-xl" />
        <div className="h-64 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="max-w-6xl mx-auto text-center py-20">
        <p className="text-slate-500">Customer not found.</p>
      </div>
    );
  }

  const { party, summary, openInvoices, allInvoices, paymentHistory } = customerData;

  const openPaymentDrawer = (invoice?: Invoice) => {
    setSelectedInvoice(invoice || openInvoices[0] || null);
    setPayDrawerOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Customer Details"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Customers", href: "/dashboard/sales/customers" },
            { label: party.name },
          ]}
        />
        <div className="flex space-x-2">
          <CustomerActions
            customerId={party.id}
            name={party.name}
            onRecordPayment={openInvoices.length > 0 ? () => openPaymentDrawer() : undefined}
          />
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
              <Badge variant={party.isB2B ? "default" : "secondary"}>
                {party.isB2B ? "B2B" : "B2C"}
              </Badge>
              {party.gstin && (
                <Badge variant="outline" className="font-mono">
                  {party.gstin}
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
      </div>

      {/* 4x Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Billed (FY)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalBilledFy)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Received (FY)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalReceivedFy)}
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
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${summary.outstandingBalance > 0 ? "text-amber-700" : "text-slate-900"}`}
            >
              {formatCurrency(summary.outstandingBalance)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Credit: {party.creditPeriod} days
            </div>
          </CardContent>
        </Card>
        <Card
          className={summary.overdue > 0 ? "border-red-200 bg-red-50/50" : ""}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${summary.overdue > 0 ? "text-red-600" : "text-slate-900"}`}
            >
              {formatCurrency(summary.overdue)}
            </div>
            {summary.overdue > 0 && (
              <div className="text-xs font-medium text-red-500 mt-1">
                Past due date
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Open Invoices */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-900">
            Open Invoices
          </h3>
          <p className="text-sm text-slate-500">
            Invoices with pending balances.
          </p>
        </div>
        <div className="p-6">
          <DataTable<Invoice, unknown>
            columns={[
              {
                accessorKey: "txnNumber",
                header: "Invoice No.",
                cell: ({ row }) => (
                  <Link
                    href={`/dashboard/sales/invoices/${row.original.id}`}
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
                  <div className="text-right font-bold">
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
                    <Link href={`/dashboard/sales/invoices/${row.original.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                      >
                        View
                      </Button>
                    </Link>
                  </div>
                ),
              },
            ]}
            data={openInvoices}
            emptyState={<p className="text-slate-500">No open invoices found.</p>}
            rowClassName={(row) => (row.isOverdue ? "bg-red-50/30" : "")}
          />
        </div>
      </div>

      {/* History Tabs */}
      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="invoices">Invoice History</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices" className="mt-4">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden p-6">
            <DataTable<Invoice, unknown>
              columns={[
                {
                  accessorKey: "txnNumber",
                  header: "Invoice No.",
                  cell: ({ row }) => (
                    <Link
                      href={`/dashboard/sales/invoices/${row.original.id}`}
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
              data={allInvoices}
              emptyState={
                <p className="text-slate-500">No invoices found for this customer.</p>
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
                  accessorKey: "account",
                  header: "Account",
                  cell: ({ row }) => row.original.account?.name || "—",
                },
                {
                  accessorKey: "invoice",
                  header: "Linked Invoice",
                  cell: ({ row }) =>
                    row.original.invoice?.txnNumber ? (
                      <Link
                        href={`/dashboard/sales/invoices/${row.original.invoiceId}`}
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
                <p className="text-slate-500">No payments found for this customer.</p>
              }
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Drawer */}
      {selectedInvoice && session?.user?.id && (
        <PaymentDrawer
          open={payDrawerOpen}
          onClose={() => {
            setPayDrawerOpen(false);
            setSelectedInvoice(null);
          }}
          invoice={{
            id: selectedInvoice.id,
            txnNumber: selectedInvoice.txnNumber,
            grandTotal: selectedInvoice.grandTotal,
            totalPaid: selectedInvoice.totalPaid,
            partyId: party.id,
            partyName: party.name,
            outletId: party.outletId,
            date: new Date(selectedInvoice.date).toISOString().split("T")[0],
          }}
          userId={session.user.id}
          onSuccess={loadCustomer}
        />
      )}
    </div>
  );
}
