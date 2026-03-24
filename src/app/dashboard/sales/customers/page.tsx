"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getCustomers } from "@/actions/sales/customers";
import { useOutletStore } from "@/store/use-outlet-store";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
import { useRouter } from "next/navigation";
import { CustomerEditDrawer } from "@/components/sales/customer-edit-drawer";
import { deleteCustomer } from "@/actions/sales/customers";
import { ReusableConfirmDialog } from "@/components/ui/reusable-confirm-dialog";

type Customer = NonNullable<
  Awaited<ReturnType<typeof getCustomers>>["data"]
>[number];

export default function CustomersPage() {
  const { currentOutletId } = useOutletStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Filters state
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "B2B" | "B2C">("ALL");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ACTIVE");
  const [hasOverdue, setHasOverdue] = useState(false);
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [editCustomerId, setEditCustomerId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (currentOutletId) {
      loadCustomers(currentOutletId);
    }
  }, [currentOutletId]);

  const loadCustomers = async (outletId: string) => {
    setIsLoading(true);
    const res = await getCustomers(outletId);
    if (res.success) {
      setCustomers(res.data || []);
    } else {
      toast.error(res.error?.message || "Failed to load customers");
    }
    setIsLoading(false);
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // 1. Search
      if (search) {
        const query = search.toLowerCase();
        const matchName = c.name.toLowerCase().includes(query);
        const matchPhone = c.phone?.toLowerCase().includes(query) || false;
        const matchGstin = c.gstin?.toLowerCase().includes(query) || false;
        if (!matchName && !matchPhone && !matchGstin) return false;
      }

      // 2. Type
      if (typeFilter === "B2B" && !c.isB2B) return false;
      if (typeFilter === "B2C" && c.isB2B) return false;

      // 3. Status
      if (statusFilter === "ACTIVE" && !c.isActive) return false;
      if (statusFilter === "INACTIVE" && c.isActive) return false;

      // 4. Overdue
      if (hasOverdue && c.overdue <= 0) return false;

      // 5. State
      if (stateFilter !== "ALL" && c.state !== stateFilter) return false;

      return true;
    });
  }, [customers, search, typeFilter, statusFilter, hasOverdue, stateFilter]);

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-semibold text-slate-900">
          <Link
            href={`/dashboard/sales/customers/${row.original.id}`}
            className="hover:text-blue-600 hover:underline"
          >
            {row.original.name}
          </Link>
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
      accessorKey: "gstin",
      header: "GSTIN",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-slate-600">
          {row.original.isB2B ? row.original.gstin : "—"}
        </span>
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
        return (
          <div
            className={`text-right font-semibold ${val > 0 ? (hasOverdue ? "text-red-600" : "text-slate-900") : "text-emerald-600"}`}
          >
            ₹{val.toLocaleString()}
          </div>
        );
      },
    },
    {
      id: "overdue",
      header: () => <div className="text-right">Overdue</div>,
      cell: ({ row }) => {
        const val = row.original.overdue;
        return (
          <div className="text-right font-medium text-red-600">
            {val > 0 ? `₹${val.toLocaleString()}` : "—"}
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.isActive ? "default" : "secondary"}
          className={
            row.original.isActive ? "bg-emerald-500 hover:bg-emerald-600" : ""
          }
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
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
                  onClick={() =>
                    router.push(`/dashboard/sales/customers/${id}`)
                  }
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4 text-slate-500" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setEditCustomerId(id)}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4 text-slate-500" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/dashboard/sales/invoices/new?partyId=${id}`)
                  }
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4 text-slate-500" /> New
                  Invoice
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `/dashboard/accounts/payments/receipts/new?partyId=${id}&source=customer&sourceId=${id}&sourceName=${encodeURIComponent(row.original.name)}`,
                    )
                  }
                  className="cursor-pointer"
                >
                  <CreditCard className="mr-2 h-4 w-4 text-slate-500" /> Record
                  Payment
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/dashboard/sales/customers/${id}/ledger`)
                  }
                  className="cursor-pointer"
                >
                  <BookOpen className="mr-2 h-4 w-4 text-slate-500" /> Statement
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    setDeleteTarget({ id, name: row.original.name })
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
  ];

  if (!currentOutletId) {
    return (
      <div className="p-8 text-center text-slate-500">
        Please select an outlet.
      </div>
    );
  }

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-[140px]">
            <Select
              value={typeFilter}
              onValueChange={(val: any) => setTypeFilter(val)}
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
              value={statusFilter}
              onValueChange={(val: any) => setStatusFilter(val)}
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

          <div className="w-[180px]">
            <Select
              value={stateFilter}
              onValueChange={(val) => setStateFilter(val as string)}
            >
              <SelectTrigger>
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All States</SelectItem>
                {/* Dynamically gather states from INDIAN_STATES if passed, or from data */}
                {Array.from(
                  new Set(customers.map((c) => c.state).filter(Boolean)),
                )
                  .sort()
                  .map((st) => (
                    <SelectItem key={st} value={st}>
                      {st}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 border rounded-md px-3 py-2">
            <Switch
              id="overdue-only"
              checked={hasOverdue}
              onCheckedChange={setHasOverdue}
            />
            <Label
              htmlFor="overdue-only"
              className="text-sm font-medium text-slate-700"
            >
              Has Overdue
            </Label>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredCustomers}
          loading={isLoading}
        />
      </div>

      <CustomerEditDrawer
        customerId={editCustomerId}
        isOpen={!!editCustomerId}
        onClose={() => setEditCustomerId(null)}
        onSuccess={() => {
          if (currentOutletId) loadCustomers(currentOutletId);
        }}
      />

      <ReusableConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setIsDeleting(true);
          const res = await deleteCustomer(deleteTarget.id);
          setIsDeleting(false);
          if (res.success) {
            toast.success("Customer deleted");
            setDeleteTarget(null);
            if (currentOutletId) loadCustomers(currentOutletId);
          } else {
            toast.error(res.error?.message || "Failed to delete");
            setDeleteTarget(null);
          }
        }}
        title="Delete Customer"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        isLoading={isDeleting}
      />
    </div>
  );
}
