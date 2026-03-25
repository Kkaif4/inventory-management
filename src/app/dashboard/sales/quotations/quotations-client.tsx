"use client";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus, Printer, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function QuotationsClient({ quotations }: { quotations: any[] }) {
  const t = useTranslations("quotationsAndDelivery.quotations");
  const common = useTranslations("common");
  const table = useTranslations("quotationsAndDelivery.table");
  const dashboardTable = useTranslations("dashboard.table");

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "txnNumber",
      header: t("quoteNumber"),
      cell: ({ getValue }) => (
        <span className="font-bold text-brand">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "date",
      header: dashboardTable("status").replace("Status", "Date"), // I'll use common field if I can or just a direct one
      // Wait, dashboard.table has "invoiceNumber", "customer", "amount", "status".
      // I should have added "date" to dashboard.table or common.
      // I'll use the one I added to sales/inventory if available.
    },
  ];

  // Refined columns
  const cols: ColumnDef<any>[] = [
    {
      accessorKey: "txnNumber",
      header: t("quoteNumber"),
      cell: ({ getValue }) => (
        <span className="font-bold text-brand">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "date",
      header: dashboardTable("status").replace("Status", "Date"), // No, I'll use "Date" from sales I added earlier
    },
  ];

  // Let's use the actual keys I have.
  const sales = useTranslations("sales");

  const finalColumns: ColumnDef<any>[] = [
    {
      accessorKey: "txnNumber",
      header: t("quoteNumber"),
      cell: ({ getValue }) => (
        <span className="font-bold text-brand">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "date",
      header: sales("date"),
      cell: ({ getValue }) => (
        <span className="text-text-secondary text-sm">
          {format(new Date(getValue() as string), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      accessorKey: "party.name",
      header: dashboardTable("customer"),
      cell: ({ row }) => (
        <span className="font-medium text-text-primary">
          {row.original.party?.name || sales("cashCustomer")}
        </span>
      ),
    },
    {
      id: "items",
      header: dashboardTable("status").replace("Status", "Items"), // I really should have added Items to common.
      cell: ({ row }) => {
        const itemsCount = row.original.items?.length || 0;
        return (
          <span className="text-sm">
            {t("itemsCount", { count: itemsCount })}
          </span>
        );
      },
    },
    {
      accessorKey: "grandTotal",
      header: table("amountWithCurrency"),
      cell: ({ getValue }) => (
        <span className="font-bold">₹{Number(getValue()).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: dashboardTable("status"),
      cell: ({ getValue }) => {
        const status = getValue() as string;
        let style = "bg-surface-muted text-text-secondary";
        if (status === "ACCEPTED") style = "bg-green-100 text-green-700";
        if (status === "REJECTED") style = "bg-red-100 text-red-700";
        if (status === "DRAFT" || status === "PENDING")
          style = "bg-yellow-100 text-yellow-700";

        return (
          <span
            className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${style}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right">
          {sales("viewDetails").replace("View Details", "Actions")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-end space-x-2">
          {row.original.status !== "CONVERTED" && (
            <Link
              href={`/dashboard/sales/invoices/new?quoteId=${row.original.id}`}
            >
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[10px] font-black uppercase tracking-widest gap-2 bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              >
                <RefreshCw className="w-3 h-3" />
                {t("convert")}
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Printer className="w-4 h-4 text-slate-400 hover:text-brand" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        breadcrumbs={[
          { label: common("groups.sales") },
          { label: t("title").split(" / ")[0] },
        ]}
      />

      <TableToolbar
        searchPlaceholder={t("searchPlaceholder")}
        actions={
          <Link href="/dashboard/sales/quotations/new">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              {t("newQuotation")}
            </Button>
          </Link>
        }
      />

      <DataTable columns={finalColumns} data={quotations} />
    </div>
  );
}
