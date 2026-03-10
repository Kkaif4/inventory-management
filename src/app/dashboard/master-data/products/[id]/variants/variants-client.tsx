"use client";

import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { Button } from "@/components/ui/button";

export function VariantsClient({ product }: { product: any }) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs font-bold text-text-primary px-2 py-1 bg-surface-elevated rounded border border-border-default">
          {getValue() as string}
        </span>
      ),
    },
    {
      id: "specifications",
      header: "Specifications",
      cell: ({ row }) => {
        const specs = row.original.specifications || {};
        const keys = Object.keys(specs);
        if (keys.length === 0)
          return <span className="text-text-disabled text-xs">No specs</span>;

        return (
          <div className="flex flex-wrap gap-1">
            {keys.map((key) => (
              <span
                key={key}
                className="text-[10px] uppercase font-bold text-text-secondary bg-surface-base border border-border-default px-1.5 py-0.5 rounded"
              >
                <span className="text-text-muted">{key}:</span> {specs[key]}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "purchasePrice",
      header: () => <div className="text-right">Purchase Price</div>,
      cell: ({ getValue }) => (
        <div className="text-right text-sm font-medium text-text-secondary">
          ₹{(getValue() as number).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "sellingPrice",
      header: () => <div className="text-right">Selling Price</div>,
      cell: ({ getValue }) => (
        <div className="text-right font-bold text-brand">
          ₹{(getValue() as number).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "minStockLevel",
      header: () => <div className="text-right">Min Stock Level</div>,
      cell: ({ getValue }) => (
        <div className="text-right text-xs font-medium text-text-muted">
          {getValue() as number}
        </div>
      ),
    },
  ];

  const breadcrumbs = [
    { label: "Master Data" },
    { label: "Products", href: "/dashboard/master-data/products" },
    { label: product.name },
    { label: "Variants" },
  ];

  return (
    <div className="space-y-2 translate-y-[-8px]">
      <PageHeader
        title={`${product.name} - Variants`}
        subtitle="Manage distinct SKUs, sizes, and pricing for this product."
        breadcrumbs={breadcrumbs}
      />

      <TableToolbar
        searchPlaceholder="Filter variants by SKU..."
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/master-data/products">
              <Button variant="secondary" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Products</span>
              </Button>
            </Link>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Add Variant</span>
            </Button>
          </div>
        }
      />

      <DataTable columns={columns} data={product.variants || []} />
    </div>
  );
}
