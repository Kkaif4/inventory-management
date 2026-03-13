"use client";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { TableToolbar } from "@/components/ui/table-toolbar";

export function PurchaseBillsClient({
  bills,
  hideHeader = false,
}: {
  bills: any[];
  hideHeader?: boolean;
}) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "txnNumber",
      header: "Bill #",
      cell: ({ getValue }) => (
        <span className="font-bold text-brand">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ getValue }) => (
        <span>{format(new Date(getValue() as string), "dd MMM yyyy")}</span>
      ),
    },
    {
      accessorKey: "party.name",
      header: "Vendor",
      cell: ({ row }) => <span>{row.original.party?.name || "N/A"}</span>,
    },
    {
      accessorKey: "grandTotal",
      header: "Amount (₹)",
      cell: ({ getValue }) => (
        <span className="font-bold">₹{Number(getValue()).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        let style = "bg-green-100 text-green-700";
        if (status === "DRAFT") style = "bg-yellow-100 text-yellow-700";
        if (status === "CANCELLED") style = "bg-red-100 text-red-700";
        return (
          <span className={`px-2 py-1 rounded text-xs font-bold ${style}`}>
            {status}
          </span>
        );
      },
    },
  ];

  return (
    <>
      {!hideHeader && (
        <PageHeader
          title="Purchase Bills"
          subtitle="Manage vendor invoices and procurement billing."
          breadcrumbs={[{ label: "Purchases" }, { label: "Bills" }]}
        />
      )}
      <TableToolbar searchPlaceholder="Search bill number..." />
      <DataTable columns={columns} data={bills} />
    </>
  );
}
