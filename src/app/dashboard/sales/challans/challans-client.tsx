"use client";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { TableToolbar } from "@/components/ui/table-toolbar";

export function DeliveryChallansClient({ challans }: { challans: any[] }) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "txnNumber",
      header: "Challan #",
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
      header: "Customer",
      cell: ({ row }) => (
        <span>{row.original.party?.name || "Cash Customer"}</span>
      ),
    },
    {
      accessorKey: "grandTotal",
      header: "Value (₹)",
      cell: ({ getValue }) => (
        <span className="font-bold">₹{Number(getValue()).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        let style = "bg-primary-100 text-primary-700";
        if (status === "DELIVERED") style = "bg-green-100 text-green-700";
        if (status === "SHIPPED") style = "bg-blue-100 text-blue-700";
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
        title="Delivery Challans"
        subtitle="Manage dispatch documents and material movements."
        breadcrumbs={[{ label: "Sales" }, { label: "Challans" }]}
      />
      <TableToolbar searchPlaceholder="Search challan #..." />
      <DataTable columns={columns} data={challans} />
    </div>
  );
}
