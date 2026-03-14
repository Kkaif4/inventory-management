"use client";

import { useState, useEffect, useTransition } from "react";
import { getInventoryData } from "@/actions/inventory";
import { InventoryFilter, StockStatus } from "@/actions/inventory/types";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Truck,
  Search,
  History,
  XCircle,
  RefreshCcw,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LedgerSlideOver } from "./ledger-slide-over";
import { TransferDialog } from "./transfer-dialog";
import { AdjustmentDialog } from "./adjustment-dialog";
import {
  getPendingTransfers,
  receiveTransfer,
} from "@/actions/inventory/transfer";
import { toast } from "sonner";
import { format } from "date-fns";

interface InventoryClientProps {
  outletId: string;
  userId: string;
  role: string;
  warehouses: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  brands: string[];
}

export function InventoryClient({
  outletId,
  userId,
  role,
  warehouses,
  categories,
  brands,
}: InventoryClientProps) {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("inventory");
  const [filters, setFilters] = useState<InventoryFilter>({
    status: "ALL",
    warehouseId: undefined,
    search: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // SlideOver & Dialog States
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    productName: string;
    sku: string;
  } | null>(null);

  const [pendingTransfers, setPendingTransfers] = useState<any[]>([]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-slate-500">
          {row.original.sku}
        </span>
      ),
    },
    {
      accessorKey: "productName",
      header: "Product / Spec",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-slate-900 group-hover:text-brand transition-colors">
            {row.original.productName}
          </div>
          <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
            {typeof row.original.specifications === "string"
              ? row.original.specifications
              : row.original.specifications
                ? JSON.stringify(row.original.specifications)
                : ""}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "brand",
      header: "Brand",
      cell: ({ row }) => (
        <span className="text-slate-600 text-sm">{row.original.brand}</span>
      ),
    },
    {
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className="bg-slate-100 text-slate-600 border-none font-normal"
        >
          {row.original.categoryName}
        </Badge>
      ),
    },
    {
      accessorKey: "qtyOnHand",
      header: () => <div className="text-right">Qty On Hand</div>,
      cell: ({ row }) => (
        <div className="text-right font-bold text-slate-900">
          {row.original.qtyOnHand}{" "}
          <span className="text-[10px] font-normal text-slate-400 uppercase">
            {row.original.unit}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "inTransit",
      header: () => <div className="text-right">In Transit</div>,
      cell: ({ row }) => (
        <div className="text-right text-slate-400 italic text-sm">
          {Number(row.original.inTransit) > 0
            ? `+${row.original.inTransit}`
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <StatusBadge status={row.original.status} />
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-brand"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItem({
                id: row.original.id,
                productName: row.original.productName,
                sku: row.original.sku,
              });
              setIsLedgerOpen(true);
            }}
          >
            <History className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const transferColumns: ColumnDef<any>[] = [
    {
      accessorKey: "txnNumber",
      header: "Txn Number",
      cell: ({ row }) => (
        <span className="font-bold text-brand">{row.original.txnNumber}</span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">
          {format(new Date(row.original.date), "dd MMM, HH:mm")}
        </span>
      ),
    },
    {
      id: "route",
      header: "Route",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700">
            {row.original.fromWarehouse.name}
          </span>
          <ArrowRight className="h-3 w-3 text-slate-400" />
          <span className="font-medium text-brand">
            {row.original.toWarehouse.name}
          </span>
        </div>
      ),
    },
    {
      id: "items",
      header: () => <div className="text-right">Items</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {row.original.items.length} items
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: () => (
        <div className="flex justify-center">
          <Badge className="bg-blue-50 text-blue-700 border-blue-100 flex items-center gap-1 w-fit mx-auto px-2 py-0.5 rounded-full">
            <Truck className="h-3 w-3" /> In Transit
          </Badge>
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            size="sm"
            onClick={() => handleReceive(row.original.id)}
            disabled={isPending}
            className="bg-brand hover:bg-brand/90 font-bold"
          >
            Confirm Receipt
          </Button>
        </div>
      ),
    },
  ];

  const fetchInventory = () => {
    startTransition(async () => {
      try {
        const res = await getInventoryData(outletId, filters);
        if (res.success) setData(res.data!);
        else toast.error("Failed to fetch inventory");
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
      }
    });
  };

  const fetchTransfers = () => {
    startTransition(async () => {
      try {
        const res = await getPendingTransfers(outletId);
        if (res.success) setPendingTransfers(res.data!);
        else toast.error("Failed to fetch transfers");
      } catch (error) {
        console.error("Failed to fetch transfers:", error);
      }
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchTerm }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (activeTab === "inventory") fetchInventory();
    else if (activeTab === "transfers") fetchTransfers();
  }, [filters, outletId, activeTab]);

  const handleReceive = (txId: string) => {
    startTransition(async () => {
      try {
        const res = await receiveTransfer(outletId, userId, txId);
        if (res.success) {
          toast.success("Stock received successfully!");
          fetchTransfers();
        } else {
          toast.error("Failed to receive stock: " + res.error?.message);
        }
      } catch (error: any) {
        toast.error("Failed to receive stock");
      }
    });
  };

  const stats = {
    total: data.length,
    low: data.filter((i) => i.status === "LOW_STOCK").length,
    out: data.filter((i) => i.status === "OUT_OF_STOCK").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Items
            </CardTitle>
            <div className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {stats.total}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50/30 border-amber-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">
              Low Stock
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{stats.low}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50/30 border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              Out of Stock
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats.out}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Container */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <TabsList className="bg-slate-100/50">
            <TabsTrigger
              value="inventory"
              className="data-[state=active]:bg-white px-6"
            >
              Stock Inventory
            </TabsTrigger>
            <TabsTrigger
              value="transfers"
              className="data-[state=active]:bg-white px-6 flex items-center gap-2"
            >
              Stock Movement
              {pendingTransfers.length > 0 && (
                <Badge
                  variant="destructive"
                  className="h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center text-[10px]"
                >
                  {pendingTransfers.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-2 border-slate-200"
              onClick={() => setIsTransferOpen(true)}
            >
              <ArrowRightLeft className="h-4 w-4" />
              Stock Transfer
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-brand hover:bg-brand/90 transition-all shadow-sm font-bold"
              onClick={() => setIsAdjustmentOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Adjustment
            </Button>
          </div>
        </div>

        <TabsContent value="inventory" className="space-y-6 mt-0">
          {/* Filters */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search SKU or Product name..."
                    className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-brand"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Select
                    value={filters.warehouseId || "all"}
                    onValueChange={(val) =>
                      setFilters((f) => {
                        const next = { ...f };
                        if (val === "all" || !val) {
                          delete next.warehouseId;
                        } else {
                          next.warehouseId = val;
                        }
                        return next;
                      })
                    }
                  >
                    <SelectTrigger className="w-full md:w-[200px] bg-slate-50/50 border-slate-200">
                      <SelectValue placeholder="All Warehouses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Warehouses</SelectItem>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.categoryId || "all"}
                    onValueChange={(val) =>
                      setFilters((f) => {
                        const next = { ...f };
                        if (val === "all" || !val) {
                          delete next.categoryId;
                        } else {
                          next.categoryId = val;
                        }
                        return next;
                      })
                    }
                  >
                    <SelectTrigger className="w-full md:w-[180px] bg-slate-50/50 border-slate-200">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={fetchInventory}
                    disabled={isPending}
                    className="border-slate-200"
                  >
                    <RefreshCcw
                      className={cn("h-4 w-4", isPending && "animate-spin")}
                    />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <Tabs
                  value={filters.status}
                  onValueChange={(val) =>
                    setFilters((f) => ({ ...f, status: val as StockStatus }))
                  }
                >
                  <TabsList className="bg-slate-100/50 p-1">
                    <TabsTrigger
                      value="ALL"
                      className="px-4 py-1.5 data-[state=active]:bg-white"
                    >
                      All Items
                    </TabsTrigger>
                    <TabsTrigger
                      value="IN_STOCK"
                      className="px-4 py-1.5 data-[state=active]:bg-white"
                    >
                      In Stock
                    </TabsTrigger>
                    <TabsTrigger
                      value="LOW_STOCK"
                      className="px-4 py-1.5 text-amber-600 data-[state=active]:bg-white"
                    >
                      Low Stock
                    </TabsTrigger>
                    <TabsTrigger
                      value="OUT_OF_STOCK"
                      className="px-4 py-1.5 text-red-600 data-[state=active]:bg-white"
                    >
                      Out of Stock
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          <DataTable
            columns={columns}
            data={data}
            loading={isPending}
            onRowClick={(item) => {
              setSelectedItem({
                id: item.id,
                productName: item.productName,
                sku: item.sku,
              });
              setIsLedgerOpen(true);
            }}
            emptyState={
              <div className="h-32 flex items-center justify-center text-slate-400">
                No inventory data found.
              </div>
            }
          />
        </TabsContent>

        <TabsContent value="transfers" className="mt-0">
          <DataTable
            columns={transferColumns}
            data={pendingTransfers}
            loading={isPending}
            emptyState={
              <div className="h-32 flex items-center justify-center text-slate-400">
                No pending stock movements.
              </div>
            }
          />
        </TabsContent>
      </Tabs>

      <LedgerSlideOver
        isOpen={isLedgerOpen}
        onClose={() => setIsLedgerOpen(false)}
        variantId={selectedItem?.id || null}
        productName={selectedItem?.productName || null}
        sku={selectedItem?.sku || null}
        warehouseId={filters.warehouseId || null}
        outletId={outletId}
      />

      <TransferDialog
        isOpen={isTransferOpen}
        onClose={() => {
          setIsTransferOpen(false);
          fetchTransfers();
        }}
        outletId={outletId}
        userId={userId}
        warehouses={warehouses}
      />
      <AdjustmentDialog
        isOpen={isAdjustmentOpen}
        onClose={() => setIsAdjustmentOpen(false)}
        outletId={outletId}
        userId={userId}
        warehouses={warehouses}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: StockStatus }) {
  switch (status) {
    case "IN_STOCK":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-100 gap-1 font-medium px-2 py-0.5 rounded-full"
        >
          <CheckCircle2 className="h-3 w-3" /> In Stock
        </Badge>
      );
    case "LOW_STOCK":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-100 gap-1 font-medium px-2 py-0.5 rounded-full"
        >
          <AlertTriangle className="h-3 w-3" /> Low Stock
        </Badge>
      );
    case "OUT_OF_STOCK":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-100 gap-1 font-medium px-2 py-0.5 rounded-full"
        >
          <XCircle className="h-3 w-3" /> Out of Stock
        </Badge>
      );
    default:
      return null;
  }
}
