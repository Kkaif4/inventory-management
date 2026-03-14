"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Receipt,
  ChevronRight,
  Filter,
  ArrowLeftRight,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  getSalesInvoices,
  getSalesReturns,
} from "@/actions/sales/sales-invoice";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { Button } from "@/components/ui/button";
import { useOutletStore } from "@/store/use-outlet-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function SalesUnifiedClient() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<
    "ALL" | "INVOICE" | "INFORMAL" | "RETURN"
  >("ALL");

  const { currentOutletId } = useOutletStore();

  useEffect(() => {
    if (currentOutletId) {
      loadData();
    }
  }, [currentOutletId]);

  const loadData = async () => {
    if (!currentOutletId) return;
    setIsLoading(true);
    try {
      const [invoices, returns] = await Promise.all([
        getSalesInvoices(currentOutletId),
        getSalesReturns(currentOutletId),
      ]);

      const safeInvoices = Array.isArray(invoices) ? invoices : [];
      const safeReturns = Array.isArray(returns) ? returns : [];

      // Combine and sort by date desc
      const combined = [
        ...safeInvoices.map((i) => ({
          ...i,
          category: i.isInformal ? "INFORMAL" : "INVOICE",
        })),
        ...safeReturns.map((r: any) => ({ ...r, category: "RETURN" })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setData(combined);
    } catch (error) {
      console.error("Failed to load sales data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = data.filter((item) => {
    if (filterType === "ALL") return true;
    return item.category === filterType;
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "txnNumber",
      header: "Bill / Return #",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col gap-1">
            <span className="font-bold text-text-primary tabular-nums tracking-tighter">
              {item.txnNumber}
            </span>
            <div className="flex gap-1">
              {item.isInformal ? (
                <Badge
                  variant="outline"
                  className="text-[10px] py-0 h-4 bg-amber-50 text-amber-700 border-amber-200"
                >
                  No. 2 / Raw
                </Badge>
              ) : item.category === "RETURN" ? (
                <Badge
                  variant="outline"
                  className="text-[10px] py-0 h-4 bg-rose-50 text-rose-700 border-rose-200"
                >
                  Return
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] py-0 h-4 bg-blue-50 text-blue-700 border-blue-200"
                >
                  No. 1 / Legal
                </Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "party",
      header: "Customer / Buyer",
      cell: ({ row }) => {
        const item = row.original;
        const partyName =
          item.party?.name || item.buyerName || "Walk-in Customer";
        const partyDetail = item.party?.gstin || item.buyerPhone || "—";

        return (
          <div className="flex flex-col">
            <span className="font-bold text-text-primary uppercase tracking-tight truncate max-w-[200px]">
              {partyName}
            </span>
            <span className="text-xs font-mono text-text-muted mt-0.5">
              {partyDetail}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      size: 120,
      cell: ({ getValue }) => (
        <span className="text-xs font-medium text-text-secondary">
          {new Date(getValue() as string).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      accessorKey: "grandTotal",
      header: () => <div className="text-right">Grand Total</div>,
      size: 140,
      cell: ({ row }) => {
        const item = row.original;
        const isReturn = item.category === "RETURN";
        return (
          <div className="text-right">
            <CurrencyDisplay
              amount={item.grandTotal}
              size="md"
              className={cn(isReturn && "text-rose-600 font-bold")}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="text-right">Status</div>,
      size: 120,
      cell: ({ getValue }) => (
        <div className="flex justify-end">
          <StatusBadge status={(getValue() as string).toLowerCase()} />
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      size: 40,
      cell: () => (
        <div className="flex justify-end">
          <ChevronRight className="w-4 h-4 text-text-disabled group-hover:text-brand transition-colors" />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
        <Button
          variant={filterType === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("ALL")}
          className="rounded-full px-4"
        >
          All
        </Button>
        <Button
          variant={filterType === "INVOICE" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("INVOICE")}
          className="rounded-full px-4 gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          Legal Invoices
        </Button>
        <Button
          variant={filterType === "INFORMAL" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("INFORMAL")}
          className="rounded-full px-4 gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          Cash Memos (No. 2)
        </Button>
        <Button
          variant={filterType === "RETURN" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("RETURN")}
          className="rounded-full px-4 gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          Returns
        </Button>
      </div>

      <TableToolbar
        searchPlaceholder="Number, customer or buyer details..."
        actions={
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2 shadow-lg shadow-brand/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <Link href="/dashboard/sales/invoices/new">
                  <DropdownMenuItem className="gap-2 cursor-pointer">
                    <Receipt className="w-4 h-4" />
                    <div className="flex flex-col">
                      <span className="font-bold">Sales Invoice</span>
                      <span className="text-[10px] text-muted-foreground">
                        Legal or Raw/Cash Bill
                      </span>
                    </div>
                  </DropdownMenuItem>
                </Link>
                <Link href="/dashboard/sales/quotations/new">
                  <DropdownMenuItem className="gap-2 cursor-pointer">
                    <FileText className="w-4 h-4" />
                    <span>Price Quotation</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer opacity-50"
                  disabled
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Sales Return</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={filteredData}
        loading={isLoading}
        onRowClick={(row) => {
          // Navigation logic based on category
        }}
        emptyState={
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 bg-surface-muted rounded-3xl flex items-center justify-center text-text-disabled mb-4 border border-border-default shadow-inner">
              <Receipt className="w-8 h-8" />
            </div>
            <p className="text-text-primary font-bold uppercase tracking-tight text-lg">
              No sales transactions found
            </p>
            <p className="text-text-muted text-sm mt-1 max-w-sm">
              Records of your sales invoices, cash memos and returns will appear
              here.
            </p>
            <Link href="/dashboard/sales/invoices/new" className="mt-8">
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                <span>Create First Bill</span>
              </Button>
            </Link>
          </div>
        }
      />
    </div>
  );
}
