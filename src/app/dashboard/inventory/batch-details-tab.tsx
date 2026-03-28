"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getBatchInventory } from "@/actions/inventory";
import { InventoryFilter } from "@/actions/inventory/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Box,
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  History,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import { TablePagination } from "@/components/ui/table-pagination";

interface BatchDetailsTabProps {
  outletId: string;
  filters: InventoryFilter;
}

export function BatchDetailsTab({ outletId, filters }: BatchDetailsTabProps) {
  const [isPending, startTransition] = useTransition();
  const [batches, setBatches] = useState<any[]>([]);
  const t = useTranslations("inventory");

  const fetchBatches = () => {
    startTransition(async () => {
      const res = await getBatchInventory(outletId, filters);
      if (res.success) {
        setBatches(res.data!);
      }
    });
  };

  useEffect(() => {
    fetchBatches();
  }, [filters, outletId]);

  // Group batches by Product/Variant
  const groupedProducts = React.useMemo(() => {
    const grouped = batches.reduce((acc: any, batch: any) => {
      const key = batch.variantId;
      if (!acc[key]) {
        acc[key] = {
          variantId: batch.variantId,
          productName: batch.productName,
          sku: batch.sku,
          unit: batch.unit,
          minStockLevel: batch.minStockLevel,
          totalQty: 0,
          batches: [],
        };
      }
      acc[key].batches.push(batch);
      acc[key].totalQty += batch.availableQuantity;
      return acc;
    }, {});
    return Object.values(grouped);
  }, [batches]);

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "productName",
        header: "Product",
      },
      {
        accessorKey: "sku",
        header: "SKU",
      },
    ],
    [],
  );

  const table = useReactTable({
    data: groupedProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 9,
      },
    },
  });

  if (isPending && batches.length === 0) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card
            key={i}
            className="animate-pulse bg-slate-50 border-slate-200 h-64"
          />
        ))}
      </div>
    );
  }

  if (groupedProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Box className="w-16 h-16 mb-4 opacity-10" />
        <p className="text-lg font-medium">{t("empty.inventory")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {table.getRowModel().rows.map((row) => (
          <ProductBatchCard key={row.id} product={row.original} />
        ))}
      </div>

      <TablePagination table={table} />
    </div>
  );
}

function ProductBatchCard({ product }: { product: any }) {
  const isOutOfStock = product.totalQty <= 0;
  const isLowStock =
    product.totalQty > 0 && product.totalQty <= product.minStockLevel;

  // Calculate percentage for progress bar (cap at 100)
  // If minStock is 0, we use a default "healthy" ratio if totalQty > 0
  const stockRatio =
    product.minStockLevel > 0
      ? (product.totalQty / (product.minStockLevel * 2)) * 100
      : product.totalQty > 0
        ? 100
        : 0;

  const progressValue = Math.min(stockRatio, 100);

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader
        className={cn(
          "pb-3 border-b",
          isOutOfStock
            ? "bg-red-50/50"
            : isLowStock
              ? "bg-amber-50/50"
              : "bg-emerald-50/50",
        )}
      >
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-slate-900 leading-tight uppercase tracking-tight">
              {product.productName}
            </CardTitle>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">
                {product.sku}
              </span>
            </div>
          </div>
          <StockStatusIcon
            isOutOfStock={isOutOfStock}
            isLowStock={isLowStock}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Visual Stock Level */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Stock Level
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  "text-2xl font-black",
                  isOutOfStock
                    ? "text-red-600"
                    : isLowStock
                      ? "text-amber-600"
                      : "text-emerald-600",
                )}
              >
                {product.totalQty}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {product.unit}
              </span>
            </div>
          </div>
          <Progress
            value={progressValue}
            className="h-3"
            indicatorClassName={cn(
              isOutOfStock
                ? "bg-red-500"
                : isLowStock
                  ? "bg-amber-500"
                  : "bg-emerald-500",
            )}
          />
        </div>

        {/* Batch Breakdown */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <History className="w-3 h-3" /> Individual Batches
          </span>
          <div className="grid gap-2">
            {product.batches.map((batch: any) => (
              <div
                key={batch.id}
                className="group flex flex-col p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-brand/30 hover:shadow-sm transition-all cursor-default"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-100 group-hover:border-brand/20">
                    #{batch.batchNumber}
                  </span>
                  <div className="flex items-baseline gap-0.5 font-bold text-slate-900">
                    <span className="text-sm">{batch.availableQuantity}</span>
                    <span className="text-[9px] text-slate-400 uppercase">
                      {product.unit}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {format(new Date(batch.receivedDate), "dd MMM yy")}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[80px]">
                      {batch.warehouseName}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StockStatusIcon({
  isOutOfStock,
  isLowStock,
}: {
  isOutOfStock: boolean;
  isLowStock: boolean;
}) {
  if (isOutOfStock) {
    return (
      <div className="p-2 rounded-full bg-red-100 text-red-600 shadow-inner">
        <AlertTriangle className="w-5 h-5" />
      </div>
    );
  }
  if (isLowStock) {
    return (
      <div className="p-2 rounded-full bg-amber-100 text-amber-600 shadow-inner">
        <AlertTriangle className="w-5 h-5" />
      </div>
    );
  }
  return (
    <div className="p-2 rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
      <CheckCircle2 className="w-5 h-5" />
    </div>
  );
}
