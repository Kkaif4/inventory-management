"use client";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { TableToolbar } from "@/components/ui/table-toolbar";

export function PurchaseReturnsClient({ returns }: { returns: any[] }) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "txnNumber",
      header: "Debit Note #",
      cell: ({ getValue }) => (
        <span className="font-bold text-red-600">{getValue() as string}</span>
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
      header: "Ref. Amount (₹)",
      cell: ({ getValue }) => (
        <span className="font-bold">₹{Number(getValue()).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        const style = "bg-red-100 text-red-700";
        return (
          <span className={`px-2 py-1 rounded text-xs font-bold ${style}`}>
            {status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Purchase Returns (Debit Notes)"
        subtitle="Track goods returned back to vendors."
        breadcrumbs={[{ label: "Purchases" }, { label: "Returns" }]}
      />
      <TableToolbar searchPlaceholder="Search debit note #..." />
      <DataTable columns={columns} data={returns} />
    </div>
  );
}
