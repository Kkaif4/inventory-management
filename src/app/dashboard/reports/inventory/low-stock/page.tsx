export const dynamic = "force-dynamic";
import { getLowStockReport } from "@/actions/reports";

import { AlertTriangle, PackageSearch, PlusCircle } from "lucide-react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

interface LowStockItem {
  sku: string;
  productName: string;
  minLevel: number;
  currentStock: number;
  shortage: number;
}

const columns: ColumnDef<LowStockItem>[] = [
  {
    accessorKey: "productName",
    header: "Product Variant",
    cell: ({ row }) => (
      <div>
        <div className="text-sm font-bold text-slate-900">
          {row.original.productName}
        </div>
        <div className="text-xs font-mono text-slate-400">
          {row.original.sku}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "minLevel",
    header: () => <div className="text-center">Min Level</div>,
    cell: ({ row }) => (
      <div className="text-center text-sm text-slate-600 font-medium">
        {row.original.minLevel}
      </div>
    ),
  },
  {
    accessorKey: "currentStock",
    header: () => <div className="text-center">Current Physical</div>,
    cell: ({ row }) => (
      <div className="text-center">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
          {row.original.currentStock}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "shortage",
    header: () => <div className="text-center">Shortage</div>,
    cell: ({ row }) => (
      <div className="text-center text-sm font-black text-red-600">
        -{row.original.shortage}
      </div>
    ),
  },
  {
    id: "action",
    header: () => <div className="text-right">Action</div>,
    cell: () => (
      <div className="text-right">
        <Link
          href="/dashboard/purchases/orders/new"
          className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
          Restock
        </Link>
      </div>
    ),
  },
];

export default async function LowStockReportPage() {
  const data = await getLowStockReport();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Low Stock Alerts
            </h2>
            <p className="text-sm text-slate-500">
              Items nearing or below minimum threshold levels.
            </p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg text-amber-700 text-xs font-bold uppercase tracking-wider">
          {data.length} Alerts Found
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        emptyState={
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <PackageSearch className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">
              All stock levels healthy
            </h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-1">
              No items are currently below their minimum stock levels.
            </p>
          </div>
        }
      />

      <div className="bg-slate-100/50 p-4 rounded-lg flex items-start space-x-3">
        <div className="mt-0.5 w-4 h-4 rounded-full bg-slate-300 flex items-center justify-center text-[10px] text-white font-bold">
          i
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Stock levels are calculated based on the <b>Physical Quantity</b>{" "}
          across all warehouses. Min levels are configured in the Product
          Variant master.
        </p>
      </div>
    </div>
  );
}
