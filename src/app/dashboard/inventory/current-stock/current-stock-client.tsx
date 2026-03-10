"use client";

import Link from "next/link";
import { PackageSearch, Plus, ArrowRightLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { QuantityDisplay } from "@/components/ui/quantity-display";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CurrentStockClient({ stocks }: { stocks: any[] }) {
  const columns: ColumnDef<any>[] = [
    {
      id: "product",
      accessorKey: "variant.product.name",
      header: "Product / SKU",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-text-primary uppercase tracking-tight">
            {row.original.variant.product.name}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-2xs font-medium text-text-muted bg-surface-elevated px-1.5 py-0.5 rounded uppercase">
              {row.original.variant.sku}
            </span>
            <span className="text-2xs font-medium text-text-muted">
              Unit: {row.original.variant.product.baseUnit}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      size: 160,
      cell: ({ row }) => (
        <span className="text-xs font-medium text-text-secondary">
          {row.original.variant.product.category.name}
        </span>
      ),
    },
    {
      id: "location",
      header: "Location",
      size: 200,
      cell: ({ row }) => {
        const name = row.original.warehouse
          ? row.original.warehouse.name
          : row.original.outlet?.name;
        const type = row.original.warehouse ? "Warehouse" : "Outlet";
        return (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border",
                row.original.warehouse
                  ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                  : "bg-teal-50 text-teal-700 border-teal-100",
              )}
            >
              {type}
            </span>
            <span className="text-xs font-medium text-text-secondary truncate max-w-[120px]">
              {name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-right">Physical Qty</div>,
      size: 120,
      cell: ({ getValue, row }) => (
        <div className="flex justify-end">
          <QuantityDisplay
            qty={getValue() as number}
            unit={row.original.variant.product.baseUnit}
            minStock={row.original.variant.minStockLevel}
          />
        </div>
      ),
    },
    {
      accessorKey: "inTransitQty",
      header: () => <div className="text-right">In-Transit</div>,
      size: 100,
      cell: ({ getValue }) => {
        const val = getValue() as number;
        return (
          <div className="flex justify-end">
            {val > 0 ? (
              <span className="text-xs font-mono font-bold text-brand anim-pulse">
                {val}
              </span>
            ) : (
              <span className="text-text-disabled">—</span>
            )}
          </div>
        );
      },
    },
  ];

  const breadcrumbs = [
    { label: "Inventory" },
    { label: "Current Stock", href: "/dashboard/inventory/current-stock" },
  ];

  return (
    <div className="space-y-2 translate-y-[-8px]">
      <PageHeader
        title="Current Stock"
        subtitle="Real-time multi-location inventory levels and valuation."
        breadcrumbs={breadcrumbs}
      />

      <TableToolbar
        searchPlaceholder="Filter items, SKU or locations..."
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/inventory/transfers/new">
              <Button variant="secondary" size="sm" className="gap-2">
                <ArrowRightLeft className="w-4 h-4" />
                <span>Transfer</span>
              </Button>
            </Link>
            <Link href="/dashboard/inventory/adjustments/new">
              <Button variant="default" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                <span>Adjustment</span>
              </Button>
            </Link>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={stocks}
        emptyState={
          <div className="flex flex-col items-center py-12">
            <PackageSearch className="w-12 h-12 text-text-disabled mb-4 stroke-[1.5]" />
            <p className="text-text-primary font-bold uppercase tracking-tight">
              No stock records found
            </p>
            <p className="text-text-muted text-sm mt-1">
              Initial stock can be added via Adjustments or GRNs.
            </p>
          </div>
        }
      />
    </div>
  );
}
