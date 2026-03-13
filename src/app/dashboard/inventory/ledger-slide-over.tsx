"use client";

import { useState, useEffect, useTransition } from "react";
import { getVariantLedger } from "@/actions/inventory/ledger";
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerContent,
  DrawerDescription,
} from "@/components/ui/drawer";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { RefreshCcw, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LedgerSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  variantId: string | null;
  productName: string | null;
  sku: string | null;
  warehouseId: string | null;
  outletId: string;
}

export function LedgerSlideOver({
  isOpen,
  onClose,
  variantId,
  productName,
  sku,
  warehouseId,
  outletId,
}: LedgerSlideOverProps) {
  const [data, setData] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <div className="text-xs">
          <div className="text-slate-500">
            {format(new Date(row.original.date), "dd MMM yy")}
          </div>
          <div className="text-[10px] text-slate-400">
            {format(new Date(row.original.date), "HH:mm")}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type/Ref",
      cell: ({ row }) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-700">
            {row.original.type}
          </div>
          <div className="text-slate-400 font-mono text-[10px]">
            {row.original.reference}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-right">Change</div>,
      cell: ({ row }) => {
        const qty = row.original.quantity;
        return (
          <div
            className={cn(
              "flex items-center justify-end gap-1 font-bold text-xs",
              qty > 0 ? "text-emerald-600" : "text-red-600",
            )}
          >
            {qty > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {qty > 0 ? `+${qty}` : qty}
          </div>
        );
      },
    },
    {
      accessorKey: "balance",
      header: () => <div className="text-right">Balance</div>,
      cell: ({ row }) => (
        <div className="text-right font-bold text-slate-900 border-l border-slate-50 bg-slate-50/20 px-2 py-1 rounded">
          {row.original.balance}
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (isOpen && variantId && warehouseId) {
      startTransition(async () => {
        try {
          const ledger = await getVariantLedger(
            outletId,
            variantId,
            warehouseId,
          );
          setData(ledger);
        } catch (error) {
          console.error("Failed to fetch ledger:", error);
        }
      });
    }
  }, [isOpen, variantId, warehouseId, outletId]);

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      direction="right"
    >
      <DrawerContent className="h-full w-full sm:max-w-xl rounded-l-xl flex flex-col">
        <DrawerHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl font-bold">
                {productName || "Stock Ledger"}
              </DrawerTitle>
              <DrawerDescription className="text-slate-500 font-mono text-xs mt-1">
                SKU: {sku} | WH ID: {warehouseId?.slice(-6)}
              </DrawerDescription>
            </div>
            {isPending && (
              <RefreshCcw className="h-4 w-4 animate-spin text-slate-400" />
            )}
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-hidden">
          <DataTable
            columns={columns}
            data={data}
            loading={isPending}
            emptyState={
              <div className="h-32 flex items-center justify-center text-slate-400 italic text-sm">
                No history found for this item.
              </div>
            }
          />
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Enterprise Ledger System</span>
            <span className="font-mono">Ver: 1.0.3</span>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
