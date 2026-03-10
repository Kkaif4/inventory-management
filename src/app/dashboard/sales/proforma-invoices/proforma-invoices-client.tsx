"use client";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus, Receipt } from "lucide-react";
import Link from "next/link";

export function ProformaInvoicesClient({ invoices }: { invoices: any[] }) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "txnNumber",
      header: "Invoice #",
      cell: ({ getValue }) => (
        <span className="font-bold text-brand">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ getValue }) => (
        <span className="text-text-secondary text-sm">
          {format(new Date(getValue() as string), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      accessorKey: "party.name",
      header: "Customer",
      cell: ({ row }) => (
        <span className="font-medium text-text-primary">
          {row.original.party?.name || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "grandTotal",
      header: "Total Amount (₹)",
      cell: ({ getValue }) => (
        <span className="font-bold">₹{Number(getValue()).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        let style = "bg-surface-muted text-text-secondary";
        if (status === "CONVERTED") style = "bg-green-100 text-green-700";
        if (status === "DRAFT") style = "bg-yellow-100 text-yellow-700";

        return (
          <span
            className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${style}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: () => (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Receipt className="w-4 h-4 text-text-secondary hover:text-brand" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Proforma Invoices"
        subtitle="Temporary invoices before final billing."
        breadcrumbs={[{ label: "Sales" }, { label: "Proforma Invoices" }]}
      />

      <TableToolbar
        searchPlaceholder="Search invoice number..."
        actions={
          <Link href="/dashboard/sales/proforma-invoices/new">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Proforma
            </Button>
          </Link>
        }
      />

      <DataTable columns={columns} data={invoices} />
    </div>
  );
}
