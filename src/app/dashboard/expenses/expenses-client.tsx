"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, MoreHorizontal, Eye, XCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { StatusBadge } from "@/components/ui/status-badge";
import { getExpenseCategories } from "@/actions/expenses/categories";
import { cancelExpense, deleteExpense, postExpense } from "@/actions/expenses";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  ExpenseListItem,
  ExpenseCategoryDetail,
} from "@/types/expense.types";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ExpensesClientProps {
  initialData: ExpenseListItem[];
  initialPagination: PaginationMeta;
  outletId: string;
}

function formatCurrency(value: number | string) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(num);
}

export function ExpensesClient({
  initialData,
  initialPagination,
  outletId,
}: ExpensesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<ExpenseCategoryDetail[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [selectedExpense, setSelectedExpense] =
    useState<ExpenseListItem | null>(null);
  const [actionType, setActionType] = useState<
    "post" | "cancel" | "delete" | null
  >(null);

  // Load categories on mount
  useEffect(() => {
    getExpenseCategories(outletId).then((res) => {
      if (res.success && res.data) {
        setCategories(res.data);
      }
    });
  }, [outletId]);

  const handleAction = async () => {
    if (!selectedExpense) return;

    try {
      setIsPending(true);
      let result;

      if (actionType === "post") {
        result = await postExpense(selectedExpense.id, outletId);
      } else if (actionType === "cancel") {
        result = await cancelExpense(selectedExpense.id, outletId);
      } else {
        result = await deleteExpense(selectedExpense.id, outletId);
      }

      if (!result.success) {
        toast.error(result.error?.message ?? "Action failed");
        return;
      }

      toast.success(
        actionType === "post"
          ? "Expense posted successfully"
          : actionType === "cancel"
            ? "Expense cancelled successfully"
            : "Expense deleted successfully",
      );

      setSelectedExpense(null);
      setActionType(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setIsPending(false);
    }
  };

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const columns: ColumnDef<ExpenseListItem>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => format(new Date(row.getValue("date")), "dd MMM yyyy"),
    },
    {
      accessorKey: "txnNumber",
      header: "Expense #",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue("txnNumber")}</span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original.category;
        return category?.name || "—";
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const desc = row.getValue("description") as string;
        return desc.length > 40 ? desc.substring(0, 40) + "..." : desc;
      },
    },
    {
      accessorKey: "vendor",
      header: "Vendor",
      cell: ({ row }) => {
        const vendor = row.original.vendor;
        return vendor?.name || "—";
      },
    },
    {
      accessorKey: "taxableAmount",
      header: "Taxable",
      cell: ({ row }) => (
        <div className="text-right">
          {formatCurrency(row.getValue("taxableAmount"))}
        </div>
      ),
    },
    {
      accessorKey: "inputGst",
      header: "GST",
      cell: ({ row }) => {
        const gst = row.original.inputGst as number;
        return (
          <div className="text-right">
            {gst > 0 ? formatCurrency(gst) : "—"}
          </div>
        );
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => (
        <div className="text-right font-bold">
          {formatCurrency(row.getValue("totalAmount"))}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          status={(row.getValue("status") as string).toLowerCase()}
        />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const expense = row.original;
        const canPost = expense.status === "DRAFT";
        const canCancel =
          expense.status === "POSTED" || expense.status === "DRAFT";
        const canDelete = expense.status === "CANCELLED";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/expenses/${expense.id}`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </DropdownMenuItem>

              {canPost && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedExpense(expense);
                      setActionType("post");
                    }}
                    className="text-green-600"
                  >
                    Post
                  </DropdownMenuItem>
                </>
              )}

              {canCancel && !canPost && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedExpense(expense);
                      setActionType("cancel");
                    }}
                    className="text-amber-600"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel
                  </DropdownMenuItem>
                </>
              )}

              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedExpense(expense);
                      setActionType("delete");
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-black text-slate-900">Expenses</h1>
        <Link href="/dashboard/expenses/new">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            New Expense
          </Button>
        </Link>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-2">
              From Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              value={
                searchParams.get("dateFrom")
                  ? new Date(searchParams.get("dateFrom")!)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={(e) =>
                updateFilters(
                  "dateFrom",
                  e.target.value ? new Date(e.target.value).toISOString() : "",
                )
              }
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-2">
              To Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              value={
                searchParams.get("dateTo")
                  ? new Date(searchParams.get("dateTo")!)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={(e) =>
                updateFilters(
                  "dateTo",
                  e.target.value ? new Date(e.target.value).toISOString() : "",
                )
              }
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-2">
              Category
            </label>
            <Select
              value={searchParams.get("categoryId") || ""}
              onValueChange={(value) =>
                updateFilters("categoryId", value || null)
              }
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Categories">
                  {searchParams.get("categoryId") && categories.length > 0
                    ? categories.find(
                        (c) => c.id === searchParams.get("categoryId"),
                      )?.name
                    : "All Categories"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-2">
              Status
            </label>
            <Select
              value={searchParams.get("status") || ""}
              onValueChange={(value) => updateFilters("status", value || null)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Statuses">
                  {searchParams.get("status") === "DRAFT"
                    ? "Draft"
                    : searchParams.get("status") === "POSTED"
                      ? "Posted"
                      : searchParams.get("status") === "CANCELLED"
                        ? "Cancelled"
                        : "All Statuses"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="POSTED">Posted</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={initialData}
          onRowClick={(row: any) =>
            router.push(`/dashboard/expenses/${row.original.id}`)
          }
          emptyState={
            <div className="py-12 text-center">
              <p className="text-slate-500">
                {initialData.length === 0 ? "No expenses found" : "No data"}
              </p>
              {initialData.length === 0 && (
                <Link href="/dashboard/expenses/new">
                  <Button variant="outline" className="mt-4">
                    Create your first expense
                  </Button>
                </Link>
              )}
            </div>
          }
        />
      </div>

      {/* Pagination */}
      <PaginationControls
        page={initialPagination.page}
        totalPages={initialPagination.totalPages}
        limit={initialPagination.limit}
        total={initialPagination.total}
        onPageChange={(page) => {
          const params = new URLSearchParams(searchParams);
          params.set("page", page.toString());
          router.push(`?${params.toString()}`);
        }}
        onLimitChange={(limit) => {
          const params = new URLSearchParams(searchParams);
          params.set("limit", limit.toString());
          params.set("page", "1");
          router.push(`?${params.toString()}`);
        }}
        isPending={isPending}
      />

      {/* Action Dialog */}
      <Dialog
        open={!!selectedExpense}
        onOpenChange={(open) => !open && setSelectedExpense(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "post"
                ? "Post Expense?"
                : actionType === "cancel"
                  ? "Cancel Expense?"
                  : "Delete Expense?"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "post"
                ? "This will post the expense and deduct the amount from the account balance."
                : actionType === "cancel"
                  ? "This action cannot be undone. The expense status will change to Cancelled."
                  : "This action cannot be undone. The expense will be permanently deleted."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedExpense(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={isPending}
              className={
                actionType === "post"
                  ? "bg-green-600 hover:bg-green-700"
                  : actionType === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-amber-600 hover:bg-amber-700"
              }
            >
              {isPending ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
