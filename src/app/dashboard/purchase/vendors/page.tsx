"use client";

import { useEffect, useState } from "react";
import { useOutletStore } from "@/store/use-outlet-store";
import { useRouter } from "next/navigation";
import { getVendors } from "@/actions/purchase/vendors";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Loader2,
  FileText,
  CreditCard,
  Edit,
  Eye,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { VendorEditDrawer } from "@/components/purchase/vendor-edit-drawer";
import { deleteVendor } from "@/actions/purchase/vendors";
import { ReusableConfirmDialog } from "@/components/ui/reusable-confirm-dialog";

export default function VendorsPage() {
  const router = useRouter();
  const { currentOutletId } = useOutletStore();
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE"); // ALL, ACTIVE, INACTIVE
  const [hasOverdueFilter, setHasOverdueFilter] = useState(false);
  const [stateFilter, setStateFilter] = useState<string | null>(null);

  // Edit Drawer State
  const [editVendorId, setEditVendorId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadVendors = async (outletId: string) => {
    setIsLoading(true);
    const res = await getVendors(outletId);
    if (res.success) {
      setVendors(res.data || []);
    } else {
      toast.error(res.error?.message || "Failed to load vendors");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (currentOutletId) {
      loadVendors(currentOutletId);
    }
  }, [currentOutletId]);

  const filteredVendors = vendors.filter((v) => {
    // 1. Search
    const q = search.toLowerCase();
    if (
      q &&
      !v.name.toLowerCase().includes(q) &&
      !v.phone?.toLowerCase().includes(q) &&
      !v.gstin?.toLowerCase().includes(q)
    ) {
      return false;
    }

    // 2. Status Filters
    if (statusFilter === "ACTIVE" && !v.isActive) return false;
    if (statusFilter === "INACTIVE" && v.isActive) return false;

    // 3. Overdue Filter
    if (hasOverdueFilter && v.overdue <= 0) return false;

    // 4. State Filter
    if (stateFilter && stateFilter !== "ALL" && v.state !== stateFilter)
      return false;

    return true;
  });

  if (!currentOutletId) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-slate-500">
        Please select an outlet.
      </div>
    );
  }

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-start lg:justify-end">
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as string)}
          >
            <SelectTrigger className="w-[120px] bg-slate-50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={stateFilter || "ALL"}
            onValueChange={(val) => setStateFilter(val === "ALL" ? null : val)}
          >
            <SelectTrigger className="w-[160px] bg-slate-50">
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
              checked={hasOverdueFilter}
              onCheckedChange={setHasOverdueFilter}
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
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 text-slate-500">
            <p>No vendors found matching your filters.</p>
            {(search || hasOverdueFilter || stateFilter) && (
              <Button
                variant="link"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ACTIVE");
                  setHasOverdueFilter(false);
                  setStateFilter(null);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead>Vendor Info</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Credit Period</TableHead>
                  <TableHead className="text-right">Balance Payable</TableHead>
                  <TableHead className="text-right">Overdue</TableHead>
                  <TableHead className="w-[60px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((v) => (
                  <TableRow
                    key={v.id}
                    className={!v.isActive ? "opacity-60 bg-slate-50/50" : ""}
                  >
                    <TableCell>
                      <div className="font-semibold text-slate-900">
                        {v.name}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center space-x-2 mt-1">
                        {v.gstin ? (
                          <Badge variant="outline" className="text-[10px]">
                            {v.gstin}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            Unregistered
                          </Badge>
                        )}
                        {!v.isActive && (
                          <Badge variant="destructive" className="text-[10px]">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{v.phone || "—"}</div>
                      <div className="text-xs text-slate-500">
                        {v.state || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {v.creditPeriod > 0
                        ? `${v.creditPeriod} days`
                        : "Immediate"}
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Negative opening balances represent payables normally,
                          but our getVendors action normalizes this so positive = payable */}
                      <span className="font-bold text-slate-900">
                        {formatCurrency(v.outstandingBalance)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {v.overdue > 0 ? (
                        <Badge
                          variant="destructive"
                          className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 shadow-none font-semibold"
                        >
                          {formatCurrency(v.overdue)}
                        </Badge>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </TableCell>
                    <TableCell>
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
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/dashboard/purchase/vendors/${v.id}`)
                            }
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setEditVendorId(v.id)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/dashboard/purchases/bills/new?vendor=${v.id}`,
                              )
                            }
                            className="cursor-pointer"
                          >
                            <FileText className="mr-2 h-4 w-4" /> New Bill
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/dashboard/accounts/payments/made/new?partyId=${v.id}&source=vendor&sourceId=${v.id}&sourceName=${encodeURIComponent(v.name)}`,
                              )
                            }
                            className="cursor-pointer"
                          >
                            <CreditCard className="mr-2 h-4 w-4" /> Record
                            Payment
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/dashboard/purchase/vendors/${v.id}/ledger`,
                              )
                            }
                            className="cursor-pointer"
                          >
                            <FileText className="mr-2 h-4 w-4" /> View Ledger
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              setDeleteTarget({ id: v.id, name: v.name })
                            }
                            className="cursor-pointer text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <VendorEditDrawer
        vendorId={editVendorId}
        isOpen={!!editVendorId}
        onClose={() => setEditVendorId(null)}
        onSuccess={() => {
          if (currentOutletId) loadVendors(currentOutletId);
        }}
      />

      <ReusableConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setIsDeleting(true);
          const res = await deleteVendor(deleteTarget.id);
          setIsDeleting(false);
          if (res.success) {
            toast.success("Vendor deleted");
            setDeleteTarget(null);
            if (currentOutletId) loadVendors(currentOutletId);
          } else {
            toast.error(res.error?.message || "Failed to delete");
            setDeleteTarget(null);
          }
        }}
        title="Delete Vendor"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        isLoading={isDeleting}
      />
    </div>
  );
}
