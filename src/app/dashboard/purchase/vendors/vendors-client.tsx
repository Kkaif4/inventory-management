"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { INDIAN_STATES } from "@/lib/constants";
import {
  MoreHorizontal,
  Search,
  Plus,
  FileText,
  Edit,
  Eye,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { VendorEditDrawer } from "@/components/purchase/vendor-edit-drawer";
import { deleteVendor } from "@/actions/purchase/vendors";
import { ReusableConfirmDialog } from "@/components/ui/reusable-confirm-dialog";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { PaginationMeta } from "@/types/pagination";

interface Vendor {
  id: string;
  name: string;
  gstin: string | null;
  phone: string | null;
  state: string;
  creditPeriod: number;
  outstandingBalance: number;
  overdue: number;
  isActive: boolean;
}

interface VendorsClientProps {
  initialData: Vendor[];
  initialPagination?: PaginationMeta;
  outletId: string;
}

export function VendorsClient({
  initialData,
  initialPagination,
}: VendorsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local filter state (before debounce)
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );

  // Debounced search for URL updates
  const debouncedSearch = useDebouncedValue(searchTerm, 500);

  // Non-reactive ref to searchParams — avoids making it a dependency of the search effect
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  // Edit Drawer State
  const [editVendorId, setEditVendorId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Current pagination state from URL
  // Current pagination state from URL
  const currentLimit = parseInt(searchParams.get("limit") || "10", 10);
  const currentStatus = (searchParams.get("status") || "ACTIVE") as
    | "ALL"
    | "ACTIVE"
    | "INACTIVE";
  const currentState = searchParams.get("state") || null;
  const currentHasOverdue = searchParams.get("hasOverdue") === "true";

  // Update URL with new filter values, reset to page 1
  const updateFilters = useCallback(
    (
      updates: Partial<{
        search?: string;
        status?: "ALL" | "ACTIVE" | "INACTIVE";
        state?: string | null;
        hasOverdue?: boolean;
        limit?: number;
      }>,
    ) => {
      const params = new URLSearchParams();

      // Always reset to page 1 when filters change
      params.set("page", "1");

      // Set limit
      const newLimit = updates.limit ?? currentLimit;
      if (newLimit !== 10) params.set("limit", String(newLimit));

      // Set search
      const newSearch = updates.search ?? searchTerm;
      if (newSearch) params.set("search", newSearch);

      // Set status
      const newStatus = updates.status ?? currentStatus;
      if (newStatus && newStatus !== "ACTIVE") params.set("status", newStatus);

      // Set state
      const newState = updates.state ?? currentState;
      if (newState && newState !== "ALL") params.set("state", newState);

      // Set hasOverdue
      const newHasOverdue = updates.hasOverdue ?? currentHasOverdue;
      if (newHasOverdue) params.set("hasOverdue", "true");

      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [
      router,
      startTransition,
      currentLimit,
      searchTerm,
      currentStatus,
      currentState,
      currentHasOverdue,
    ],
  );

  // Update search term and trigger URL update when debounced value changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Trigger URL update when debounced search changes
  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (currentStatus && currentStatus !== "ACTIVE")
        params.set("status", currentStatus);
      if (currentState && currentState !== "ALL")
        params.set("state", currentState);
      if (currentHasOverdue) params.set("hasOverdue", "true");
      if (currentLimit !== 10) params.set("limit", String(currentLimit));

      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [
      router,
      startTransition,
      debouncedSearch,
      currentStatus,
      currentState,
      currentHasOverdue,
      currentLimit,
    ],
  );

  const handleLimitChange = useCallback(
    (limit: number) => {
      updateFilters({ limit });
    },
    [updateFilters],
  );

  // Update URL when debounced search changes.
  // Reads searchParams via ref (non-reactive) and pushes directly to avoid
  // recreating updateFilters or listing searchParams as a dep (both cause loops).
  useEffect(() => {
    const currentSearch = searchParamsRef.current.get("search") || "";
    if (debouncedSearch === currentSearch) return;

    const params = new URLSearchParams(searchParamsRef.current.toString());
    params.set("page", "1");
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }, [debouncedSearch, router, startTransition]);

  // Navigation handlers
  const handleViewDetails = useCallback(
    (vendorId: string) => {
      if (!vendorId) {
        toast.error("Invalid vendor ID");
        return;
      }
      router.push(`/dashboard/purchase/vendors/${vendorId}`);
    },
    [router],
  );

  const handleViewLedger = useCallback(
    (vendorId: string) => {
      if (!vendorId) {
        toast.error("Invalid vendor ID");
        return;
      }
      router.push(`/dashboard/purchase/vendors/${vendorId}/ledger`);
    },
    [router],
  );

  const handleEdit = useCallback((vendorId: string) => {
    setEditVendorId(vendorId);
  }, []);

  const handleDelete = useCallback((id: string, name: string) => {
    setDeleteTarget({ id, name });
  }, []);

  const columns: ColumnDef<Vendor>[] = useMemo(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Vendor Info",
        cell: ({ row }) => {
          const vendor = row.original;
          if (!vendor.id) return <div>{vendor.name}</div>;
          return (
            <div>
              <Button
                variant="ghost"
                className="p-0 h-auto font-semibold hover:text-blue-700 hover:bg-transparent hover:underline justify-start"
                onClick={() => {
                  if (vendor.id) {
                    handleViewDetails(vendor.id);
                  }
                }}
              >
                {vendor.name}
              </Button>
              <div className="text-xs text-slate-500 flex items-center space-x-2 mt-1">
                {vendor.gstin ? (
                  <Badge variant="outline" className="text-[10px]">
                    {vendor.gstin}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px]">
                    Unregistered
                  </Badge>
                )}
                {!vendor.isActive && (
                  <Badge variant="destructive" className="text-[10px]">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: "contact",
        header: "Contact",
        cell: ({ row }) => {
          const vendor = row.original;
          return (
            <div>
              <div className="text-sm">{vendor.phone || "—"}</div>
              <div className="text-xs text-slate-500">
                {vendor.state || "—"}
              </div>
            </div>
          );
        },
      },
      {
        id: "creditPeriod",
        header: "Credit Period",
        cell: ({ row }) => {
          const vendor = row.original;
          return (
            <span className="text-slate-600 text-sm">
              {vendor.creditPeriod > 0
                ? `${vendor.creditPeriod} days`
                : "Immediate"}
            </span>
          );
        },
      },
      {
        id: "outstandingBalance",
        header: () => <div className="text-right">Balance Payable</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <span className="font-bold text-slate-900">
              {formatCurrency(row.original.outstandingBalance)}
            </span>
          </div>
        ),
      },
      {
        id: "overdue",
        header: () => <div className="text-right">Overdue</div>,
        cell: ({ row }) => {
          const vendor = row.original;
          return (
            <div className="text-right">
              {vendor.overdue > 0 ? (
                <Badge
                  variant="destructive"
                  className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 shadow-none font-semibold"
                >
                  {formatCurrency(vendor.overdue)}
                </Badge>
              ) : (
                <span className="text-slate-300">—</span>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="w-15">Actions</div>,
        cell: ({ row }) => {
          const vendor = row.original;
          if (!vendor.id) return null;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    if (vendor.id) handleViewDetails(vendor.id);
                  }}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    if (vendor.id) handleEdit(vendor.id);
                  }}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    if (vendor.id) handleViewLedger(vendor.id);
                  }}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" /> View Ledger
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    if (vendor.id) handleDelete(vendor.id, vendor.name);
                  }}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleViewDetails, handleEdit, handleViewLedger, handleDelete],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteVendor(deleteTarget.id);
      if (res.success) {
        toast.success("Vendor deleted");
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast.error(res.error?.message || "Failed to delete");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete vendor");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, router]);

  const handleClearFilters = useCallback(() => {
    startTransition(() => {
      router.push("?page=1");
    });
  }, [router, startTransition]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendors</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage suppliers, payables, and purchase relationships.
          </p>
        </div>
        <Link href="/dashboard/purchase/vendors/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </Button>
        </Link>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full lg:w-auto relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search vendor name, phone, or GSTIN..."
            className="pl-9 w-full lg:max-w-md bg-slate-50"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-start lg:justify-end">
          <Select
            value={currentStatus || "ACTIVE"}
            onValueChange={(val) =>
              updateFilters({ status: val as "ALL" | "ACTIVE" | "INACTIVE" })
            }
            disabled={isPending}
          >
            <SelectTrigger className="w-30 bg-slate-50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={currentState ? String(currentState) : "ALL"}
            onValueChange={(val) =>
              updateFilters({ state: val === "ALL" ? null : val })
            }
            disabled={isPending}
          >
            <SelectTrigger className="w-40 bg-slate-50">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All States</SelectItem>
              {INDIAN_STATES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2 border pl-3 pr-4 py-2 rounded-md bg-slate-50">
            <Switch
              id="overdue-mode"
              checked={currentHasOverdue}
              onCheckedChange={(checked) =>
                updateFilters({ hasOverdue: checked })
              }
              disabled={isPending}
            />
            <Label
              htmlFor="overdue-mode"
              className="text-sm cursor-pointer font-medium"
            >
              Overdue Only
            </Label>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <DataTable
          columns={columns}
          data={initialData}
          manualPagination
          rowClassName={(row) =>
            !row.isActive ? "opacity-60 bg-slate-50/50" : ""
          }
          emptyState={
            <div className="flex flex-col justify-center items-center h-40 text-slate-500">
              <p>No vendors found matching your filters.</p>
              {(searchTerm || currentHasOverdue || currentState) && (
                <Button variant="link" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          }
        />
      </div>

      {/* PAGINATION */}
      {initialPagination && (
        <PaginationControls
          page={initialPagination.page}
          totalPages={initialPagination.totalPages}
          limit={initialPagination.limit}
          total={initialPagination.total}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          isPending={isPending}
        />
      )}

      <VendorEditDrawer
        vendorId={editVendorId}
        isOpen={!!editVendorId}
        onClose={() => setEditVendorId(null)}
        onSuccess={() => {
          router.refresh();
        }}
      />

      <ReusableConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Vendor"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        isLoading={isDeleting}
      />
    </div>
  );
}
