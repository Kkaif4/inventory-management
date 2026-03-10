"use client";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { format } from "date-fns";

export function AuditLogsClient({ logs }: { logs: any[] }) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: ({ getValue }) => (
        <span className="text-sm font-medium text-text-secondary whitespace-nowrap">
          {format(new Date(getValue() as string), "PP pp")}
        </span>
      ),
    },
    {
      accessorKey: "user.name",
      header: "User",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-text-primary text-sm whitespace-nowrap">
            {row.original.user?.name || "System"}
          </span>
          <span className="text-xs text-text-muted">
            {row.original.user?.email || "N/A"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ getValue }) => {
        const action = getValue() as string;
        let colorObj = "bg-surface-muted text-text-secondary";
        if (action === "CREATE") colorObj = "bg-green-100 text-green-700";
        if (action === "UPDATE") colorObj = "bg-blue-100 text-blue-700";
        if (action === "DELETE") colorObj = "bg-red-100 text-red-700";

        return (
          <span
            className={`px-2 py-1 rounded text-[10px] font-bold ${colorObj}`}
          >
            {action}
          </span>
        );
      },
    },
    {
      id: "entityDetails",
      header: "Entity",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-surface-elevated border border-border-default px-1.5 py-0.5 rounded">
            {row.original.entity}
          </span>
          <span
            className="text-xs text-text-secondary font-mono truncate max-w-[120px]"
            title={row.original.entityId}
          >
            {row.original.entityId}
          </span>
        </div>
      ),
    },
    {
      id: "changes",
      header: "Changes payload",
      cell: ({ row }) => {
        const oldV = row.original.oldValues;
        const newV = row.original.newValues;

        if (!oldV && !newV) {
          return <span className="text-text-disabled text-xs">-</span>;
        }

        return (
          <div className="flex items-center">
            <span className="text-[10px] bg-brand-light text-brand px-2 py-1 rounded font-mono truncate max-w-[200px]">
              {JSON.stringify(newV || oldV)}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Audit Trail Logs"
        subtitle="System-wide history of all creations, updates, and deletions."
        breadcrumbs={[{ label: "Settings" }, { label: "Audit Logs" }]}
      />

      <TableToolbar searchPlaceholder="Filter by entity type or user..." />

      <DataTable columns={columns} data={logs} />
    </div>
  );
}
