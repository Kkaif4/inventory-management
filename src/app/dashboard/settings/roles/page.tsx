"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

interface MatrixRow {
  module: string;
  admin: boolean;
  accountant: boolean;
  sales: boolean;
  inventory: boolean;
}

const matrixColumns: ColumnDef<MatrixRow>[] = [
  {
    accessorKey: "module",
    header: "Module / Access Area",
    cell: ({ row }) => (
      <span className="font-medium text-text-primary">
        {row.original.module}
      </span>
    ),
  },
  {
    accessorKey: "admin",
    header: () => <div className="text-center">Admin</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        {row.original.admin ? (
          <Check className="w-5 h-5 text-green-500" />
        ) : (
          <X className="w-5 h-5 text-red-300" />
        )}
      </div>
    ),
  },
  {
    accessorKey: "accountant",
    header: () => <div className="text-center">Accountant</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        {row.original.accountant ? (
          <Check className="w-5 h-5 text-green-500" />
        ) : (
          <X className="w-5 h-5 text-red-300" />
        )}
      </div>
    ),
  },
  {
    accessorKey: "sales",
    header: () => <div className="text-center">Sales</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        {row.original.sales ? (
          <Check className="w-5 h-5 text-green-500" />
        ) : (
          <X className="w-5 h-5 text-red-300" />
        )}
      </div>
    ),
  },
  {
    accessorKey: "inventory",
    header: () => <div className="text-center">Inventory Manager</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        {row.original.inventory ? (
          <Check className="w-5 h-5 text-green-500" />
        ) : (
          <X className="w-5 h-5 text-red-300" />
        )}
      </div>
    ),
  },
];

const matrix = [
  {
    module: "Master Data (Products, Categories)",
    admin: true,
    accountant: false,
    sales: false,
    inventory: true,
  },
  {
    module: "Parties (Customers, Vendors)",
    admin: true,
    accountant: true,
    sales: true,
    inventory: false,
  },
  {
    module: "Inventory (Stock, Adjustments, Transfers)",
    admin: true,
    accountant: false,
    sales: false,
    inventory: true,
  },
  {
    module: "Procurement (PO, GRN, Purchase Bills)",
    admin: true,
    accountant: true,
    sales: false,
    inventory: true,
  },
  {
    module: "Sales & Billing (Quotes, Invoices)",
    admin: true,
    accountant: true,
    sales: true,
    inventory: false,
  },
  {
    module: "Accounting (Ledgers, P&L, Payments)",
    admin: true,
    accountant: true,
    sales: false,
    inventory: false,
  },
  {
    module: "System Settings",
    admin: true,
    accountant: false,
    sales: false,
    inventory: false,
  },
  {
    module: "Audit Trail",
    admin: true,
    accountant: false,
    sales: false,
    inventory: false,
  },
];

export default function RolesMatrixPage() {
  const breadcrumbs = [
    { label: "Settings" },
    { label: "Roles & Authorization Matrix" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Authorization Matrix"
        subtitle="Overview of system permissions mapped per user role type."
        breadcrumbs={breadcrumbs}
      />

      <DataTable columns={matrixColumns} data={matrix} />

      <div className="flex justify-end pt-4">
        <Link href="/dashboard/master-data/users">
          <Button variant="outline" className="mr-4">
            Manage Users
          </Button>
        </Link>
      </div>
    </div>
  );
}
