"use client";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export function PurchaseOrdersClient({ orders }: { orders: any[] }) {
  const router = useRouter();
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "txnNumber",
      header: "PO #",
      cell: ({ getValue }) => (
        <span className="font-bold text-blue-600">{getValue() as string}</span>
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
        const style = "bg-blue-100 text-blue-700";
        return (
          <span
            className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${style}`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  const actions = [
    {
      label: "New Purchase Order",
      icon: Plus,
      onClick: () => router.push("/dashboard/purchases/orders/new"),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        subtitle="Manage procurement requests sent to vendors."
        breadcrumbs={[{ label: "Purchases" }, { label: "Orders" }]}
        actions={actions}
      />
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden p-2">
        <TableToolbar searchPlaceholder="Search PO #..." />
        <DataTable columns={columns} data={orders} />
      </div>
    </div>
  );
}
