import { getProducts } from "@/actions/products";
import Link from "next/link";
import { Plus, Package, Download } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { Pagination } from "@/components/ui/pagination";

export default async function ProductsPage() {
  const products = await getProducts();

  const columns: ColumnDef<any>[] = [
    {
      key: "name",
      label: "Product Name",
      sticky: "left",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-text-primary uppercase tracking-tight">
            {value}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-2xs font-medium text-text-muted bg-surface-elevated px-1.5 py-0.5 rounded uppercase">
              HSN: {row.hsnCode}
            </span>
            <span className="text-2xs font-medium text-text-muted">
              Unit: {row.baseUnit}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "brand",
      label: "Brand",
      width: 140,
      render: (value) =>
        value || <span className="text-text-disabled">No Brand</span>,
    },
    {
      key: "category",
      label: "Category",
      width: 180,
      render: (value) => (
        <span className="text-xs font-medium text-text-secondary">
          {value.name}
        </span>
      ),
    },
    {
      key: "gstRate",
      label: "GST %",
      width: 80,
      align: "center",
      render: (value) => (
        <span className="bg-brand/5 text-brand px-2 py-0.5 rounded font-bold text-xs ring-1 ring-brand/10">
          {value}%
        </span>
      ),
    },
    {
      key: "_count",
      label: "Variants",
      width: 100,
      align: "center",
      render: (value, row) => (
        <Link
          href={`/dashboard/master-data/products/${row.id}/variants`}
          className="text-brand font-bold hover:underline decoration-brand/30 underline-offset-4"
        >
          {value.variants}
        </Link>
      ),
    },
    {
      key: "isArchived",
      label: "Status",
      width: 100,
      align: "right",
      render: (value) => (
        <StatusBadge
          status={value ? "cancelled" : "completed"}
          label={value ? "Archived" : "Active"}
        />
      ),
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
      onClick: () => {}, // Handled by server component Link or client side?
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
        actions={
          <Link href="/dashboard/master-data/products/new">
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-default text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-brand text-text-inverse hover:bg-brand-hover shadow-sm gap-2">
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </Link>
        }
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
