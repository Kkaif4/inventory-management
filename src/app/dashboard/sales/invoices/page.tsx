"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Receipt, ChevronRight } from "lucide-react";
import { getSalesInvoices } from "@/actions/sales/sales-invoice";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { Button } from "@/components/ui/button";
import { useOutletStore } from "@/store/use-outlet-store";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { currentOutletId } = useOutletStore();

  useEffect(() => {
    if (currentOutletId) {
      setIsLoading(true);
      getSalesInvoices(currentOutletId).then((data) => {
        setInvoices(data);
        setIsLoading(false);
      });
    }
  }, [currentOutletId]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "txnNumber",
      header: "Invoice #",
      cell: ({ getValue }) => (
        <span className="font-bold text-text-primary tabular-nums tracking-tighter">
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "party",
      header: "Customer / Entity",
      cell: ({ getValue }) => {
        const party = getValue() as any;
        return (
          <div className="flex flex-col">
            <span className="font-bold text-text-primary uppercase tracking-tight">
              {party?.name}
            </span>
            <span className="text-xs font-mono text-text-muted mt-0.5">
              {party?.gstin || "Cash Customer"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      size: 140,
      cell: ({ getValue }) => (
        <span className="text-xs font-medium text-text-secondary">
          {new Date(getValue() as string).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      accessorKey: "grandTotal",
      header: () => <div className="text-right">Grand Total</div>,
      size: 160,
      cell: ({ getValue }) => (
        <div className="text-right">
          <CurrencyDisplay amount={getValue() as number} size="md" />
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div className="text-right">Status</div>,
      size: 120,
      cell: ({ getValue }) => (
        <div className="flex justify-end">
          <StatusBadge status={(getValue() as string).toLowerCase()} />
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      size: 40,
      cell: () => (
        <div className="flex justify-end">
          <ChevronRight className="w-4 h-4 text-text-disabled group-hover:text-brand transition-colors" />
        </div>
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
              <Button variant="default" size="sm" className="gap-2">
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
