"use client";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function GRNClient({ grns }: { grns: any[] }) {
  const router = useRouter();
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "txnNumber",
      header: "GRN #",
      cell: ({ getValue }) => (
        <span className="font-bold text-emerald-600">
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
      accessorKey: "parent.txnNumber",
      header: "Ref PO #",
      cell: ({ row }) => (
        <span className="text-blue-600 font-medium">
          {row.original.parent?.txnNumber || "Direct"}
        </span>
      ),
    },
    {
      accessorKey: "party.name",
      header: "Vendor",
      cell: ({ row }) => <span>{row.original.party?.name || "N/A"}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        const style = "bg-emerald-100 text-emerald-700";
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
      label: "New GRN",
      icon: Plus,
      onClick: () => router.push("/dashboard/purchases/grn/new"),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goods Receipt Notes (GRN)"
        subtitle="Manage and track incoming materials from vendors."
        breadcrumbs={[{ label: "Purchases" }, { label: "GRN" }]}
        actions={actions}
      />
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden p-2">
        <TableToolbar searchPlaceholder="Search GRN #..." />
        <DataTable columns={columns} data={grns} />
      </div>
    </div>
  );
}
