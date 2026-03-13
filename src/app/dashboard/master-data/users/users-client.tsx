"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import { ToggleUserButton } from "./toggle-user-button";

interface User {
  id: string;
  name: string;
  email: string | null;
  role: string;
  isActive: boolean;
  _count: {
    outlets: number;
  };
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium text-slate-900">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-slate-600">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="bg-slate-100 text-slate-800 border-none"
      >
        <ShieldCheck className="w-3 h-3 mr-1" />
        {row.original.role}
      </Badge>
    ),
  },
  {
    id: "outlets",
    header: "Outlets",
    cell: ({ row }) => {
      const count = row.original._count.outlets;
      return count > 0 ? (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-none"
        >
          {count} Assigned
        </Badge>
      ) : (
        <span className="text-slate-400 italic">None</span>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={
          row.original.isActive
            ? "bg-green-100 text-green-800 border-none"
            : "bg-red-100 text-red-800 border-none"
        }
      >
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <ToggleUserButton
          userId={row.original.id}
          isActive={row.original.isActive}
        />
      </div>
    ),
  },
];

export function UsersClient({ users }: { users: User[] }) {
  return <DataTable columns={columns} data={users} />;
}
