"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, RotateCcw, Plus } from "lucide-react";
import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { MoreHorizontal, Eye, FileText } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { PaginationMeta } from "@/types/pagination";

interface SalesTransactionsClientProps {
  initialData: any[];
  initialPagination: PaginationMeta;
  tab: string;
}

export function SalesTransactionsClient({
  initialData,
  initialPagination,
  tab: initialTab,
}: SalesTransactionsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);
  const t = useTranslations("sales");
  const common = useTranslations("common");

  const currentTab = initialTab || "invoices";
  const currentLimit = parseInt(searchParams.get("limit") || "10", 10);

  // Sync data when pagination changes
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleTabChange = useCallback(
    (newTab: string) => {
      const params = new URLSearchParams();
      params.set("tab", newTab);
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      params.set("tab", currentTab);
      params.set("page", String(page));
      if (currentLimit !== 10) params.set("limit", String(currentLimit));
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, currentTab, currentLimit],
  );

  const handleLimitChange = useCallback(
    (limit: number) => {
      const params = new URLSearchParams();
      params.set("tab", currentTab);
      params.set("page", "1");
      if (limit !== 10) params.set("limit", String(limit));
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, currentTab],
  );

  // Use dashboard.table keys for consistency
  const d = useTranslations("dashboard.table");

  const finalInvoiceColumns: ColumnDef<any>[] = [
    {
      accessorKey: "txnNumber",
      header: d("invoiceNumber"),
      cell: ({ row }) => (
        <Link
          href={`/dashboard/sales/invoices/${row.original.id}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {row.original.txnNumber}
        </Link>
      ),
    },
    {
      accessorKey: "date",
      header: t("date"),
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      id: "party",
      header: d("customer"),
      cell: ({ row }) => {
        const partyName =
          row.original.party?.name ||
          row.original.buyerName ||
          t("cashCustomer");
        return (
          <div>
            <div className="font-medium text-slate-900">{partyName}</div>
            {row.original.isInformal && (
              <Badge
                variant="outline"
                className="text-[10px] bg-amber-50 text-amber-700 border-amber-200"
              >
                {t("informal")}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "grandTotal",
      header: () => <div className="text-right">{d("amount")}</div>,
      cell: ({ row }) => (
        <div className="text-right font-semibold">
          {formatCurrency(row.original.grandTotal)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: d("status"),
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "POSTED" ? "default" : "secondary"}
          className={
            row.original.status === "POSTED"
              ? "bg-emerald-500 hover:bg-emerald-600"
              : ""
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
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
              <span className="sr-only">
                {common("actions.filter").replace("Filter", "Open menu")}
              </span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  {t("viewDetails").replace("View Details", "Actions")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push(`/dashboard/sales/invoices/${id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" /> {t("viewDetails")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/dashboard/sales/invoices/${id}/print`)
                  }
                >
                  <FileText className="mr-2 h-4 w-4" /> {t("printInvoice")}
                </DropdownMenuItem>{" "}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const finalReturnColumns: ColumnDef<any>[] = [
    {
      accessorKey: "txnNumber",
      header: t("returnNumber"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.txnNumber}</span>
      ),
    },
    {
      accessorKey: "date",
      header: t("date"),
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      id: "party",
      header: d("customer"),
      cell: ({ row }) => row.original.party?.name || t("unknown"),
    },
    {
      accessorKey: "grandTotal",
      header: () => <div className="text-right">{d("amount")}</div>,
      cell: ({ row }) => (
        <div className="text-right font-semibold text-red-600">
          {formatCurrency(row.original.grandTotal)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: d("status"),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          {row.original.status}
        </Badge>
      ),
    },
  ];

  // Dynamic header based on tab
  const getHeaderInfo = () => {
    switch (currentTab) {
      case "invoices":
        return {
          title: t("invoices"),
          subtitle: t("invoicesSubtitle"),
          actions: [
            {
              label: t("newInvoice"),
              icon: Plus,
              onClick: () => router.push("/dashboard/sales/invoices/new"),
            },
          ],
        };
      case "returns":
        return {
          title: t("returns"),
          subtitle: t("returnsSubtitle"),
          actions: [
            {
              label: t("newReturn"),
              icon: Plus,
              onClick: () => router.push("/dashboard/sales/returns/new"),
            },
          ],
        };
      default:
        return {
          title: t("title"),
          subtitle: t("manageTransactions"),
          actions: [],
        };
    }
  };

  const header = getHeaderInfo();

  return (
    <div className="space-y-6">
      <PageHeader
        title={header.title}
        subtitle={header.subtitle}
        breadcrumbs={[
          {
            label: common("groups.sales"),
            href: "/dashboard/sales/transactions",
          },
          { label: t("title").replace("Sales Transactions", "Transactions") },
        ]}
        actions={header.actions}
      />

      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-surface-elevated p-1 rounded-xl border border-border-default h-11">
            <TabsTrigger
              value="invoices"
              className="rounded-lg px-4 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Receipt className="w-4 h-4 text-blue-500" />
              {t("invoices")}
            </TabsTrigger>
            <TabsTrigger
              value="returns"
              className="rounded-lg px-4 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <RotateCcw className="w-4 h-4 text-red-500" />
              {t("returns")}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden p-6 space-y-4">
          <TabsContent value="invoices" className="mt-0">
            <DataTable
              columns={finalInvoiceColumns}
              data={data}
              loading={isPending}
              manualPagination
            />
          </TabsContent>
          <TabsContent value="returns" className="mt-0">
            <DataTable
              columns={finalReturnColumns}
              data={data}
              loading={isPending}
              manualPagination
            />
          </TabsContent>

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
        </div>
      </Tabs>
    </div>
  );
}
