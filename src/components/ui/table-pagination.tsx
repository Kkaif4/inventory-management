"use client";

import { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TablePaginationProps<TData> {
  table: Table<TData>;
  /** Total count of items for display purposes */
  totalCount?: number;
}

export function TablePagination<TData>({
  table,
  totalCount,
}: TablePaginationProps<TData>) {
  const { pageSize, pageIndex } = table.getState().pagination;
  const totalPages = table.getPageCount();
  const currentPage = pageIndex + 1;
  const dataCount = totalCount ?? table.getCoreRowModel().rows.length;

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-1">
      {/* Rows-per-page selector */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Rows per page</span>
        <Select
          defaultValue={String(pageSize)}
          value={String(pageSize)}
          onValueChange={(val) => {
            table.setPageSize(Number(val));
          }}
        >
          <SelectTrigger className="h-8 w-16 text-xs bg-white">
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
          Showing {pageIndex * pageSize + 1} to{" "}
          {Math.min((pageIndex + 1) * pageSize, dataCount)} of {dataCount}
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
  );
}
