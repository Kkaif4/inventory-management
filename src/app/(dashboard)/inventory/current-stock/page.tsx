import { getCurrentStock } from "@/actions/inventory";
import Link from "next/link";
import { PackageSearch, Plus, ArrowRightLeft, Settings2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { QuantityDisplay } from "@/components/ui/quantity-display";
import { Button } from "@/components/ui/button";

export default async function CurrentStockPage() {
  const stocks = (await getCurrentStock()) as any[];

  const columns: ColumnDef<any>[] = [
    {
      key: "product",
      label: "Product / SKU",
      sticky: "left",
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-text-primary uppercase tracking-tight">
            {row.variant.product.name}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-2xs font-medium text-text-muted bg-surface-elevated px-1.5 py-0.5 rounded uppercase">
              {row.variant.sku}
            </span>
            <span className="text-2xs font-medium text-text-muted">
              Unit: {row.variant.product.baseUnit}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      width: 160,
      render: (_, row) => (
        <span className="text-xs font-medium text-text-secondary">
          {row.variant.product.category.name}
        </span>
      ),
    },
    {
      key: "location",
      label: "Location",
      width: 200,
      render: (_, row) => {
        const name = row.warehouse ? row.warehouse.name : row.outlet?.name;
        const type = row.warehouse ? "Warehouse" : "Outlet";
        return (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border",
                row.warehouse
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
      key: "quantity",
      label: "Physical Qty",
      width: 120,
      align: "right",
      render: (value, row) => (
        <QuantityDisplay
          qty={value}
          unit={row.variant.product.baseUnit}
          minStock={row.variant.minStockLevel}
        />
      ),
    },
    {
      key: "inTransitQty",
      label: "In-Transit",
      width: 100,
      align: "right",
      render: (value, row) =>
        value > 0 ? (
          <span className="text-xs font-mono font-bold text-brand anim-pulse">
            {value}
          </span>
        ) : (
          <span className="text-text-disabled">—</span>
        ),
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
              <Button variant="primary" size="sm" className="gap-2">
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

// Helper for cn in server component if not imported
import { cn } from "@/lib/utils";
