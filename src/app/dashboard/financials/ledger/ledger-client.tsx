"use client";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { TableToolbar } from "@/components/ui/table-toolbar";

export function LedgerClient({ entries }: { entries: any[] }) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ getValue }) => (
        <span>{format(new Date(getValue() as string), "dd MMM yyyy")}</span>
      ),
    },
    {
      accessorKey: "account.name",
      header: "Account",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-xs text-text-secondary italic">
          {row.original.description ||
            row.original.transaction?.txnNumber ||
            "-"}
        </span>
      ),
    },
    {
      accessorKey: "debit",
      header: "Debit (₹)",
      cell: ({ getValue }) => {
        const val = Number(getValue());
        return (
          <span
            className={
              val > 0 ? "font-bold text-red-600" : "text-text-disabled"
            }
          >
            ₹{val.toFixed(2)}
          </span>
        );
      },
    },
    {
      accessorKey: "credit",
      header: "Credit (₹)",
      cell: ({ getValue }) => {
        const val = Number(getValue());
        return (
          <span
            className={
              val > 0 ? "font-bold text-green-600" : "text-text-disabled"
            }
          >
            ₹{val.toFixed(2)}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="General Ledger"
        subtitle="Detailed record of all financial transactions."
        breadcrumbs={[{ label: "Financials" }, { label: "Ledger" }]}
      />
      <TableToolbar searchPlaceholder="Search entries..." />
      <DataTable columns={columns} data={entries} />
    </div>
  );
}
