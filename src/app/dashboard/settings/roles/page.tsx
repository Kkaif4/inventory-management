"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

      <div className="bg-surface-base border border-border-default rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-muted text-xs uppercase font-bold text-text-secondary border-b border-border-default">
            <tr>
              <th className="px-6 py-4">Module / Access Area</th>
              <th className="px-6 py-4 text-center">Admin</th>
              <th className="px-6 py-4 text-center">Accountant</th>
              <th className="px-6 py-4 text-center">Sales</th>
              <th className="px-6 py-4 text-center">Inventory Manager</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {matrix.map((row, i) => (
              <tr
                key={i}
                className="hover:bg-surface-elevated transition-colors"
              >
                <td className="px-6 py-4 font-medium text-text-primary">
                  {row.module}
                </td>
                <td className="px-6 py-4 text-center">
                  {row.admin ? (
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="w-5 h-5 text-red-300 mx-auto" />
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {row.accountant ? (
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="w-5 h-5 text-red-300 mx-auto" />
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {row.sales ? (
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="w-5 h-5 text-red-300 mx-auto" />
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {row.inventory ? (
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="w-5 h-5 text-red-300 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
