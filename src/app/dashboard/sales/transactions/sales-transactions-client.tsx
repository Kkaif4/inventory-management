"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, RotateCcw, Plus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { MoreHorizontal, Eye, FileText, CreditCard } from "lucide-react";
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
import { Button, buttonVariants } from "@/components/ui/button";

interface SalesTransactionsClientProps {
  invoices: any[];
  returns: any[];
}

export function SalesTransactionsClient({
  invoices,
  returns,
}: SalesTransactionsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("invoices");

  const invoiceColumns: ColumnDef<any>[] = [
    {
      accessorKey: "txnNumber",
      header: "Invoice #",
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
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      id: "party",
      header: "Customer",
      cell: ({ row }) => {
        const partyName =
          row.original.party?.name || row.original.buyerName || "Cash Customer";
        return (
          <div>
            <div className="font-medium text-slate-900">{partyName}</div>
            {row.original.isInformal && (
              <Badge
                variant="outline"
                className="text-[10px] bg-amber-50 text-amber-700 border-amber-200"
              >
                Informal
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "grandTotal",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => (
        <div className="text-right font-semibold">
          {formatCurrency(row.original.grandTotal)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
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
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push(`/dashboard/sales/invoices/${id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/dashboard/sales/invoices/${id}/print`)
                  }
                >
                  <FileText className="mr-2 h-4 w-4" /> Print Invoice
                </DropdownMenuItem>
                {!row.original.isInformal && (
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(
                        `/dashboard/accounts/payments/receipts/new?partyId=${row.original.partyId}&invoiceId=${id}`,
                      )
                    }
                  >
                    <CreditCard className="mr-2 h-4 w-4" /> Record Payment
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const returnColumns: ColumnDef<any>[] = [
    {
      accessorKey: "txnNumber",
      header: "Return #",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.txnNumber}</span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      id: "party",
      header: "Customer",
      cell: ({ row }) => row.original.party?.name || "Unknown",
    },
    {
      accessorKey: "grandTotal",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => (
        <div className="text-right font-semibold text-red-600">
          {formatCurrency(row.original.grandTotal)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
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
    switch (activeTab) {
      case "invoices":
        return {
          title: "Sales Invoices",
          subtitle:
            "Generate tax-compliant invoices and track account receivables.",
          actions: [
            {
              label: "New Invoice",
              icon: Plus,
              onClick: () => router.push("/dashboard/sales/invoices/new"),
            },
          ],
        };
      case "returns":
        return {
          title: "Sales Returns",
          subtitle: "Track goods returned by customers (Credit Notes).",
          actions: [
            {
              label: "New Return",
              icon: Plus,
              onClick: () => router.push("/dashboard/sales/returns/new"),
            },
          ],
        };
      default:
        return {
          title: "Sales Transactions",
          subtitle: "Manage invoices and returns",
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
          { label: "Sales", href: "/dashboard/sales/transactions" },
          { label: "Transactions" },
        ]}
        actions={header.actions}
      />

      <Tabs
        defaultValue="invoices"
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-surface-elevated p-1 rounded-xl border border-border-default h-11">
            <TabsTrigger
              value="invoices"
              className="rounded-lg px-4 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Receipt className="w-4 h-4 text-blue-500" />
              Invoices
            </TabsTrigger>
            <TabsTrigger
              value="returns"
              className="rounded-lg px-4 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <RotateCcw className="w-4 h-4 text-red-500" />
              Returns
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden p-6 min-h-[500px]">
          <TabsContent value="invoices" className="mt-0">
            <DataTable columns={invoiceColumns} data={invoices} />
          </TabsContent>
          <TabsContent value="returns" className="mt-0">
            <DataTable columns={returnColumns} data={returns} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
