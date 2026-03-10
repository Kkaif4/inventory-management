"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { Button } from "@/components/ui/button";

export function PriceListsClient({ priceLists }: { priceLists: any[] }) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Price List Name",
      cell: ({ getValue }) => (
        <span className="font-semibold text-text-primary">
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ getValue }) => (
        <span className="text-text-secondary">
          {(getValue() as string) || "-"}
        </span>
      ),
    },
    {
      id: "entriesCount",
      header: "Products Covered",
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original._count.entries}
        </span>
      ),
    },
    {
      id: "partiesCount",
      header: "Assigned Customers",
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original._count.parties}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ getValue }) => {
        const isActive = getValue() as boolean;
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-bold ${
              isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        );
      },
    },
  ];

  const breadcrumbs = [{ label: "Master Data" }, { label: "Price Lists" }];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Price Lists"
        subtitle="Manage custom pricing tiers for customers"
        breadcrumbs={breadcrumbs}
      />

      <TableToolbar
        searchPlaceholder="Filter price lists..."
        actions={
          <Link href="/dashboard/master-data/price-lists/new">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Create Price List</span>
            </Button>
          </Link>
        }
      />

      <DataTable columns={columns} data={priceLists} />
    </div>
  );
}
