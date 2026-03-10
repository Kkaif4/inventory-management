"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { useRouter } from "next/navigation";

export function ProductsClient({ products }: { products: any[] }) {
  const router = useRouter();
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ getValue, row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-text-primary uppercase tracking-tight">
            {getValue() as string}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-2xs font-medium text-text-muted bg-surface-elevated px-1.5 py-0.5 rounded uppercase">
              HSN: {row.original.hsnCode}
            </span>
            <span className="text-2xs font-medium text-text-muted">
              Unit: {row.original.baseUnit}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "brand",
      header: "Brand",
      size: 140,
      cell: ({ getValue }) =>
        (getValue() as string) || (
          <span className="text-text-disabled">No Brand</span>
        ),
    },
    {
      accessorKey: "category",
      header: "Category",
      size: 180,
      cell: ({ getValue }) => (
        <span className="text-xs font-medium text-text-secondary">
          {(getValue() as any)?.name}
        </span>
      ),
    },
    {
      accessorKey: "gstRate",
      header: () => <div className="text-center">GST %</div>,
      size: 80,
      cell: ({ getValue }) => (
        <div className="flex justify-center">
          <span className="bg-brand/5 text-brand px-2 py-0.5 rounded font-bold text-xs ring-1 ring-brand/10">
            {getValue() as number}%
          </span>
        </div>
      ),
    },
    {
      accessorKey: "_count",
      header: () => <div className="text-center">Variants</div>,
      size: 100,
      cell: ({ getValue, row }) => (
        <div className="flex justify-center">
          <Link
            href={`/dashboard/master-data/products/${row.original.id}/variants`}
            className="text-brand font-bold hover:underline decoration-brand/30 underline-offset-4"
          >
            {(getValue() as any).variants}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: "isArchived",
      header: () => <div className="text-right">Status</div>,
      size: 100,
      cell: ({ getValue }) => {
        const isArchived = getValue() as boolean;
        return (
          <div className="flex justify-end">
            <StatusBadge
              status={isArchived ? "cancelled" : "completed"}
              label={isArchived ? "Archived" : "Active"}
            />
          </div>
        );
      },
    },
  ];

  const breadcrumbs = [
    { label: "Master Data" },
    { label: "Products", href: "/dashboard/master-data/products" },
  ];

  const actions = [
    {
      label: "Add Product",
      icon: Plus,
      onClick: () => router.push("/dashboard/master-data/products/new"),
    },
  ];

  return (
    <div className="space-y-2 translate-y-[-8px]">
      <PageHeader
        title="Product Master"
        subtitle="Manage industrial items, brands, and variants across outlets."
        breadcrumbs={breadcrumbs}
      />

      <TableToolbar
        searchPlaceholder="Filter by name, brand or SKU..."
        actions={actions}
      />

      <DataTable columns={columns} data={products} />

      <Pagination
        currentPage={1}
        totalPages={1}
        pageSize={10}
        totalResults={products.length}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
      />
    </div>
  );
}
