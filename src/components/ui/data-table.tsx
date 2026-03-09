"use client";

import * as React from "react";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  key: string;
  label: string;
  width?: number | string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (value: any, row: T) => React.ReactNode;
  sticky?: "left" | "right";
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  selectable?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  emptyState,
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  if (loading) {
    return <SkeletonTable rows={5} columns={columns.length} />;
  }

  if (data.length === 0) {
    return (
      <div className="border border-border-default rounded-default bg-surface-base p-12 text-center">
        {emptyState || (
          <div className="space-y-2">
            <p className="text-text-primary font-bold uppercase tracking-tight">
              No records found
            </p>
            <p className="text-text-muted text-sm">
              Adjust your filters or add a new record.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative border border-border-default rounded-default bg-surface-base shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-surface-muted/80 text-text-muted border-b border-border-default sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 font-bold uppercase text-[11px] tracking-widest whitespace-nowrap",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.sticky === "left" &&
                      "sticky left-0 bg-surface-muted/95 z-20",
                    col.sticky === "right" &&
                      "sticky right-0 bg-surface-muted/95 z-20 shadow-[-4px_0_4px_rgba(0,0,0,0.02)]",
                  )}
                  style={{ width: col.width }}
                >
                  <div
                    className={cn(
                      "flex items-center gap-1",
                      col.align === "right" && "justify-end",
                    )}
                  >
                    {col.label}
                    {col.sortable && (
                      <ArrowUpDown className="w-3 h-3 text-text-disabled" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/50">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "group hover:bg-slate-50/50 transition-colors",
                  onRowClick && "cursor-pointer",
                  rowClassName?.(row),
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3.5 text-text-secondary whitespace-nowrap",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.sticky === "left" &&
                        "sticky left-0 bg-surface-base group-hover:bg-slate-50/50 z-10",
                      col.sticky === "right" &&
                        "sticky right-0 bg-surface-base group-hover:bg-slate-50/50 z-10 shadow-[-4px_0_4px_rgba(0,0,0,0.02)]",
                    )}
                  >
                    {col.render
                      ? col.render((row as any)[col.key], row)
                      : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SkeletonTable({ rows, columns }: { rows: number; columns: number }) {
  return (
    <div className="border border-border-default rounded-default bg-surface-base overflow-hidden">
      <div className="h-10 bg-surface-muted border-b border-border-default" />
      <div className="p-4 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: columns }).map((_, j) => (
              <div
                key={j}
                className="h-6 bg-surface-elevated animate-pulse rounded flex-1"
                style={{ opacity: 1 - j * 0.1 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
