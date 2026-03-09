"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Receipt,
  Plus,
  ArrowRight,
  ChevronRight,
  Download,
} from "lucide-react";
import { getSalesInvoices } from "@/actions/sales/sales-invoice";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSalesInvoices().then((data) => {
      setInvoices(data);
      setIsLoading(false);
    });
  }, []);

  const columns: ColumnDef<any>[] = [
    {
      key: "txnNumber",
      label: "Invoice #",
      sticky: "left",
      render: (value) => (
        <span className="font-bold text-text-primary tabular-nums tracking-tighter">
          {value}
        </span>
      ),
    },
    {
      key: "party",
      label: "Customer / Entity",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-text-primary uppercase tracking-tight">
            {value?.name}
          </span>
          <span className="text-xs font-mono text-text-muted mt-0.5">
            {value?.gstin || "Cash Customer"}
          </span>
        </div>
      ),
    },
    {
      key: "date",
      label: "Date",
      width: 140,
      render: (value) => (
        <span className="text-xs font-medium text-text-secondary">
          {new Date(value).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "grandTotal",
      label: "Grand Total",
      width: 160,
      align: "right",
      render: (value) => <CurrencyDisplay amount={value} size="md" />,
    },
    {
      key: "status",
      label: "Status",
      width: 120,
      align: "right",
      render: (value) => <StatusBadge status={value.toLowerCase()} />,
    },
    {
      key: "actions",
      label: "",
      width: 40,
      align: "right",
      render: () => (
        <ChevronRight className="w-4 h-4 text-text-disabled group-hover:text-brand transition-colors" />
      ),
    },
  ];

  const breadcrumbs = [
    { label: "Sales" },
    { label: "Invoices", href: "/dashboard/sales/invoices" },
  ];

  return (
    <div className="space-y-4 translate-y-[-8px]">
      <PageHeader
        title="Sales Invoices"
        subtitle="Track tax invoices, payment status, and customer fulfillment."
        breadcrumbs={breadcrumbs}
      />

      <TableToolbar
        searchPlaceholder="Invoice #, customer name or phone..."
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/sales/invoices/new">
              <Button variant="primary" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                <span>New Invoice</span>
              </Button>
            </Link>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={invoices}
        loading={isLoading}
        onRowClick={(row) => {
          // Add navigation logic if needed
        }}
        emptyState={
          <div className="flex flex-col items-center py-20">
            <div className="w-16 h-16 bg-surface-muted rounded-2xl flex items-center justify-center text-text-disabled mb-4 border border-border-default">
              <Receipt className="w-8 h-8" />
            </div>
            <p className="text-text-primary font-bold uppercase tracking-tight">
              No sales invoices found
            </p>
            <p className="text-text-muted text-sm mt-1">
              Generate your first tax invoice to see it here.
            </p>
            <Link href="/dashboard/sales/invoices/new" className="mt-6">
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                <span>Create First Invoice</span>
              </Button>
            </Link>
          </div>
        }
      />
    </div>
  );
}
