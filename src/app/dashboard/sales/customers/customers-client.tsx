"use client";

import { useCallback, useMemo, useRef, useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  CreditCard,
  BookOpen,
  Pencil,
  Eye,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { CustomerEditDrawer } from "@/components/sales/customer-edit-drawer";
import { deleteCustomer } from "@/actions/sales/customers";
import { ReusableConfirmDialog } from "@/components/ui/reusable-confirm-dialog";
import { PaginationMeta } from "@/types/pagination";
import { getWhatsAppReminderUrl, WhatsAppIcon } from "@/lib/whatsapp";
import { useOutlet } from "@/hooks/use-outlet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Customer {
  id: string;
  name: string;
  isB2B: boolean;
  phone: string | null;
  gstin: string | null;
  state: string;
  creditLimit: number | null;
  outstandingBalance: number;
  overdue: number;
  isActive: boolean;
}

interface CustomersClientProps {
  initialData: Customer[];
  initialPagination?: PaginationMeta;
  outletId: string;
}

export function CustomersClient({
  initialData,
  initialPagination,
  outletId,
}: CustomersClientProps) {
  const router = useRouter();
  const { currentOutlet } = useOutlet();
  const outletName = currentOutlet?.name || undefined;
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local filter state
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebouncedValue(searchTerm, 500);

  // Non-reactive ref to searchParams — avoids making it a dependency of the search effect
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  // Edit/Delete state
  const [editCustomerId, setEditCustomerId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Current filters from URL
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentLimit = parseInt(searchParams.get("limit") || "10", 10);
  const currentStatus = (searchParams.get("status") || "ACTIVE") as
    | "ALL"
    | "ACTIVE"
    | "INACTIVE";
  const currentTypeFilter = (searchParams.get("typeFilter") || "ALL") as
    | "ALL"
    | "B2B"
    | "B2C";
  const currentState = searchParams.get("state") || null;
  const currentHasOverdue = searchParams.get("hasOverdue") === "true";

  const updateFilters = useCallback(
    (updates: Partial<{
      search?: string;
      status?: "ALL" | "ACTIVE" | "INACTIVE";
      typeFilter?: "ALL" | "B2B" | "B2C";
      state?: string | null;
      hasOverdue?: boolean;
      limit?: number;
    }>) => {
      const params = new URLSearchParams();
      params.set("page", "1");

      const newLimit = updates.limit ?? currentLimit;
      if (newLimit !== 10) params.set("limit", String(newLimit));

      const newSearch = updates.search ?? searchTerm;
      if (newSearch) params.set("search", newSearch);

      const newStatus = updates.status ?? currentStatus;
      if (newStatus && newStatus !== "ACTIVE") params.set("status", newStatus);

      const newTypeFilter = updates.typeFilter ?? currentTypeFilter;
      if (newTypeFilter && newTypeFilter !== "ALL")
        params.set("typeFilter", newTypeFilter);

      const newState = updates.state ?? currentState;
      if (newState && newState !== "ALL") params.set("state", newState);

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
      currentTypeFilter,
      currentState,
      currentHasOverdue,
    ],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (currentStatus && currentStatus !== "ACTIVE")
        params.set("status", currentStatus);
      if (currentTypeFilter && currentTypeFilter !== "ALL")
        params.set("typeFilter", currentTypeFilter);
      if (currentState) params.set("state", currentState);
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
      currentTypeFilter,
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
  // listing updateFilters as a dep (it changes on every filter interaction → loop).
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

  const handleViewDetails = useCallback(
    (customerId: string) => {
      router.push(`/dashboard/sales/customers/${customerId}`);
    },
    [router],
  );

  const handleEdit = useCallback((customerId: string) => {
    setEditCustomerId(customerId);
  }, []);

  const handleDelete = useCallback((id: string, name: string) => {
    setDeleteTarget({ id, name });
  }, []);

  const columns: ColumnDef<Customer>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-semibold text-slate-900">
            <Button
              variant="ghost"
              className="p-0 h-auto hover:text-blue-600 hover:underline justify-start"
              onClick={() => handleViewDetails(row.original.id)}
            >
              {row.original.name}
            </Button>
          </div>
        ),
      },
      {
        id: "type",
        header: "Type",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={
              row.original.isB2B
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }
          >
            {row.original.isB2B ? "B2B" : "B2C"}
          </Badge>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <span className="text-slate-600">{row.original.phone || "—"}</span>
        ),
      },
      {
        accessorKey: "state",
        header: "State",
        cell: ({ row }) => (
          <span className="text-slate-600">{row.original.state}</span>
        ),
      },
      {
        id: "creditLimit",
        header: () => <div className="text-right">Credit Limit</div>,
        cell: ({ row }) => (
          <div className="text-right text-slate-600">
            {row.original.creditLimit && row.original.creditLimit > 0
              ? `₹${row.original.creditLimit.toLocaleString()}`
              : "No Limit"}
          </div>
        ),
      },
      {
        id: "outstanding",
        header: () => <div className="text-right">Outstanding</div>,
        cell: ({ row }) => {
          const val = row.original.outstandingBalance;
          const hasOverdue = row.original.overdue > 0;
          const phone = row.original.phone;
          return (
            <div className="flex items-center justify-end gap-2">
              <span
                className={`font-semibold ${
                  val > 0 ? (hasOverdue ? "text-red-600" : "text-slate-900") : "text-emerald-600"
                }`}
              >
                ₹{val.toLocaleString()}
              </span>
              {val > 0 && phone && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <a
                          href={getWhatsAppReminderUrl(phone, row.original.name, val, outletName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all active:scale-90"
                        >
                          <WhatsAppIcon className="w-4 h-4" />
                        </a>
                      }
                    />
                    <TooltipContent>
                      <p>Send WhatsApp reminder</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const id = row.original.id;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "h-8 w-8 p-0",
                )}
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleViewDetails(id)}
                    className="cursor-pointer"
                  >
                    <Eye className="mr-2 h-4 w-4 text-slate-500" /> View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleEdit(id)}
                    className="cursor-pointer"
                  >
                    <Pencil className="mr-2 h-4 w-4 text-slate-500" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/dashboard/sales/customers/${id}/ledger`)
                    }
                    className="cursor-pointer"
                  >
                    <BookOpen className="mr-2 h-4 w-4 text-slate-500" /> Statement
                  </DropdownMenuItem>
                  {row.original.phone && row.original.outstandingBalance > 0 && (
                    <DropdownMenuItem
                      onClick={() =>
                        window.open(
                          getWhatsAppReminderUrl(
                            row.original.phone!,
                            row.original.name,
                            row.original.outstandingBalance,
                            outletName
                          ),
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                      className="cursor-pointer flex items-center text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                    >
                      <WhatsAppIcon className="mr-2 h-4 w-4" /> Send Reminder
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      handleDelete(id, row.original.name)
                    }
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleViewDetails, handleEdit, router, handleDelete],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteCustomer(deleteTarget.id);
      if (res.success) {
        toast.success("Customer deleted");
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast.error(res.error?.message || "Failed to delete");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete customer");
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
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Customers
          </h2>
          <p className="text-sm text-slate-500">
            Manage your client registry, view balances, and track receivables.
          </p>
        </div>
        <Link href="/dashboard/sales/customers/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Customer
          </Button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search name, phone, GSTIN..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="w-[140px]">
            <Select
              value={currentTypeFilter}
              onValueChange={(val) =>
                updateFilters({ typeFilter: val as "ALL" | "B2B" | "B2C" })
              }
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Customer Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="B2B">B2B (Business)</SelectItem>
                <SelectItem value="B2C">B2C (Individual)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[140px]">
            <Select
              value={currentStatus || "ACTIVE"}
              onValueChange={(val) =>
                updateFilters({ status: val as "ALL" | "ACTIVE" | "INACTIVE" })
              }
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 border rounded-md px-3 py-2">
            <Switch
              id="overdue-only"
              checked={currentHasOverdue}
              onCheckedChange={(checked) =>
                updateFilters({ hasOverdue: checked })
              }
              disabled={isPending}
            />
            <Label
              htmlFor="overdue-only"
              className="text-sm font-medium text-slate-700"
            >
              Has Overdue
            </Label>
          </div>
        </div>

        <DataTable columns={columns} data={initialData} manualPagination />
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

      <CustomerEditDrawer
        customerId={editCustomerId}
        isOpen={!!editCustomerId}
        onClose={() => setEditCustomerId(null)}
        onSuccess={() => {
          router.refresh();
        }}
      />

      <ReusableConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        isLoading={isDeleting}
      />
    </div>
  );
}
