"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Eye, Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { Input } from "@/components/ui/input";
import { DeleteWarehouseButton } from "./delete-warehouse-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

interface Warehouse {
  id: string;
  name: string;
  address?: string | null;
  state?: string | null;
  isDefault?: boolean;
  outlet?: {
    id: string;
    name: string;
  };
  _count?: {
    stocks: number;
  };
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface WarehousesClientProps {
  warehouses: Warehouse[];
  pagination: PaginationMeta;
  search: string;
}

export function WarehousesClient({
  warehouses,
  pagination,
  search: initialSearch,
}: WarehousesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(initialSearch);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search handler
  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      setIsSearching(true);

      const timeout = setTimeout(() => {
        const params = new URLSearchParams(searchParams);
        if (value) {
          params.set("search", value);
          params.set("page", "1");
        } else {
          params.delete("search");
          params.delete("page");
        }
        router.push(`?${params.toString()}`);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timeout);
    },
    [router, searchParams],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(newPage));
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleLimitChange = useCallback(
    (newLimit: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("limit", String(newLimit));
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  // Column definitions
  const columns: ColumnDef<Warehouse>[] = [
    {
      accessorKey: "name",
      header: "Warehouse Name",
      cell: ({ row }) => {
        const warehouse = row.original;
        return (
          <div>
            <p className="font-bold text-slate-900">{warehouse.name}</p>
            {warehouse.address && (
              <p className="text-xs text-slate-500 mt-1">{warehouse.address}</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "outlet",
      header: "Outlet",
      cell: ({ row }) => {
        const outlet = row.original.outlet;
        return outlet ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
            {outlet.name}
          </span>
        ) : (
          <span className="text-slate-400 text-xs">Unassigned</span>
        );
      },
    },
    {
      accessorKey: "stocks",
      header: "SKU Points",
      cell: ({ row }) => {
        const count = row.original._count?.stocks || 0;
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
            {count} SKUs
          </span>
        );
      },
    },
    {
      accessorKey: "isDefault",
      header: "Default",
      cell: ({ row }) => {
        if (row.original.isDefault) {
          return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
              Yes
            </span>
          );
        }
        return null;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const warehouse = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/dashboard/master-data/warehouses/warehouse/${warehouse.id}`)}
              className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl h-8 w-8"
              title="View warehouse"
            >
              <Eye className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/dashboard/master-data/warehouses/warehouse/${warehouse.id}/edit`)}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl h-8 w-8"
              title="Edit warehouse"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <DeleteWarehouseButton id={warehouse.id} name={warehouse.name} />
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: warehouses,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <TableToolbar
        onSearchChange={handleSearch}
        searchValue={searchValue}
        searchPlaceholder="Search warehouses by name or address..."
      />

      {warehouses.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-12 text-center">
          <p className="text-slate-500 font-bold">
            {initialSearch
              ? "No warehouses found matching your search"
              : "No warehouses yet. Create one to get started."}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border bg-card text-card-foreground overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
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
                      className="group hover:bg-slate-50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
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
                      No warehouses found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-2">
            <div className="text-sm text-slate-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} warehouses
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Rows per page:</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="border border-slate-200 rounded px-2 py-1 text-xs bg-white"
                >
                  {[10, 25, 50, 100].map((limit) => (
                    <option key={limit} value={limit}>
                      {limit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page === 1}
                  className="h-8"
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="h-8"
                >
                  Previous
                </Button>
                <span className="px-2 text-sm text-slate-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="h-8"
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.page === pagination.totalPages}
                  className="h-8"
                >
                  Last
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
