"use client";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { TableToolbar } from "@/components/ui/table-toolbar";

export function SalesReturnsClient({ returns }: { returns: any[] }) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "txnNumber",
      header: "Credit Note #",
      cell: ({ getValue }) => (
        <span className="font-bold text-orange-600">
          {getValue() as string}
        </span>
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
      header: "Customer",
      cell: ({ row }) => (
        <span>{row.original.party?.name || "Cash Customer"}</span>
      ),
    },
    {
      accessorKey: "grandTotal",
      header: "Credit Amount (₹)",
      cell: ({ getValue }) => (
        <span className="font-bold">₹{Number(getValue()).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        const style = "bg-orange-100 text-orange-700";
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
        title="Sales Returns (Credit Notes)"
        subtitle="Manage and track returned goods from customers."
        breadcrumbs={[{ label: "Sales" }, { label: "Returns" }]}
      />
      <TableToolbar searchPlaceholder="Search credit note #..." />
      <DataTable columns={columns} data={returns} />
    </div>
  );
}
