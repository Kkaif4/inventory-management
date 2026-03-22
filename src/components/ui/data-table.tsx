"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  rowClassName?: (row: TData) => string;
  footerRow?: React.ReactNode;
  /** Default number of rows per page. Defaults to 10. */
  pageSize?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  emptyState,
  onRowClick,
  rowClassName,
  footerRow,
  pageSize = 10,
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: { pagination },
  });

  if (loading) {
    return <SkeletonTable rows={5} columns={columns.length} />;
  }

  const totalPages = table.getPageCount();
  const currentPage = pagination.pageIndex + 1;

  return (
    <div className="space-y-3">
      <div className="rounded-md border bg-card text-card-foreground">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup, i) => (
              <TableRow key={i}>
                {headerGroup.headers.map((header, j) => (
                  <TableHead
                    key={j}
                    className="font-bold uppercase tracking-widest text-[11px] text-muted-foreground whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  className={`group ${onRowClick ? "cursor-pointer" : ""} ${
                    rowClassName ? rowClassName(row.original) : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="py-3.5 px-4 text-secondary-foreground"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyState || (
                    <div className="flex flex-col items-center justify-center p-8 space-y-2">
                      <p className="text-secondary-foreground font-bold uppercase tracking-tight">
                        No records found
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Adjust your filters or add a new record.
                      </p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {footerRow && <tfoot>{footerRow}</tfoot>}
        </Table>
      </div>

      {/* Pagination — only rendered when there is more than one page */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          {/* Rows-per-page selector */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page</span>
            <Select
              defaultValue={String(pagination.pageSize)}
              value={String(pagination.pageSize)}
              onValueChange={(val) =>
                setPagination((p) => ({
                  ...p,
                  pageIndex: 0,
                  pageSize: Number(val),
                }))
              }
            >
              <SelectTrigger className="h-8 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground mr-2">
              Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
              {Math.min(
                (pagination.pageIndex + 1) * pagination.pageSize,
                data.length,
              )}{" "}
              of {data.length}
            </span>
            <span className="text-sm text-muted-foreground mr-2 border-l border-border pl-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(totalPages - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonTable({ rows, columns }: { rows: number; columns: number }) {
  return (
    <div className="rounded-md border bg-card">
      <div className="h-10 bg-muted border-b" />
      <div className="p-4 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton
                key={j}
                className="h-6 flex-1"
                style={{ opacity: 1 - j * 0.1 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
