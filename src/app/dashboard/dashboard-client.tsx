"use client";

import { PageHeader } from "@/components/ui/page-header";
import { KPICard } from "@/components/dashboard/kpi-card";
import {
  Clock,
  Wallet,
  ArrowRight,
  AlertCircle,
  ArrowUpRight,
  ShoppingCart,
  ReceiptIndianRupee,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export function DashboardClient({
  stats,
  userName,
}: {
  stats: any;
  userName: string;
}) {
  const t = useTranslations("dashboard");

  const invoiceColumns: ColumnDef<any>[] = [
    {
      accessorKey: "txnNumber",
      header: t("table.invoiceNumber"),
      cell: ({ getValue }) => (
        <span className="font-bold text-text-primary">
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "party",
      header: t("table.customer"),
      cell: ({ getValue }) => (getValue() as any)?.name,
    },
    {
      accessorKey: "grandTotal",
      header: () => <div className="text-right">{t("table.amount")}</div>,
      cell: ({ getValue }) => (
        <div className="text-right font-mono">
          {formatCurrency(getValue() as number)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div className="text-right">{t("table.status")}</div>,
      cell: ({ getValue }) => (
        <div className="flex justify-end">
          <StatusBadge status={(getValue() as string).toLowerCase()} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 translate-y-[-8px]">
      <PageHeader
        title={t("welcome", { name: userName })}
        subtitle={t("subtitle")}
        breadcrumbs={[]}
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={t("kpi.todaySales")}
          value={formatCurrency(stats.kpis.todaySales.value)}
          subtitle={t("kpi.invoicesGenerated")}
          icon={ReceiptIndianRupee}
          variant="success"
        />
        <KPICard
          label={t("openPurchaseOrders")}
          value={stats.kpis.openPOs.count}
          subtitle={t("valuedAt", {
            value: formatCurrency(stats.kpis.openPOs.value),
          })}
          icon={ShoppingCart}
          variant="default"
        />
        <KPICard
          label={t("lowStockItems")}
          value={stats.kpis.lowStock.count}
          subtitle={t("requiresAttention")}
          icon={AlertCircle}
          variant={stats.kpis.lowStock.count > 0 ? "error" : "success"}
        />
        <KPICard
          label={t("kpi.outstanding")}
          value={formatCurrency(stats.kpis.receivables.value)}
          subtitle={t("kpi.outstandingSubtitle")}
          icon={Wallet}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-sm">
                {t("recentSalesInvoices")}
              </CardTitle>
              <Link
                href="/dashboard/sales/invoices"
                className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
              >
                {t("viewAll")} <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable columns={invoiceColumns} data={stats.recentInvoices} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm">{t("pendingActions")}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border-default/50">
                <div className="p-4 flex items-start gap-3 hover:bg-surface-muted transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">
                      {t("verifyGrns", { count: 3 })}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {t("awaitingBillEntry")}
                    </p>
                  </div>
                </div>
                <div className="p-4 flex items-start gap-3 hover:bg-surface-muted transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">
                      {t("stockAlert")}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {t("itemsBelowMinimum", {
                        count: stats.kpis.lowStock.count,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
