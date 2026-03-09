import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardStats } from "@/actions/dashboard";
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
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function DashboardRoot() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const stats = await getDashboardStats();

  const invoiceColumns: ColumnDef<any>[] = [
    {
      key: "txnNumber",
      label: "Invoice #",
      render: (val) => (
        <span className="font-bold text-text-primary">{val}</span>
      ),
    },
    {
      key: "party",
      label: "Customer",
      render: (val) => val.name,
    },
    {
      key: "grandTotal",
      label: "Amount",
      align: "right",
      render: (val) => <span className="font-mono">{formatCurrency(val)}</span>,
    },
    {
      key: "status",
      label: "Status",
      align: "right",
      render: (val) => <StatusBadge status={val.toLowerCase()} />,
    },
  ];

  return (
    <div className="space-y-6 translate-y-[-8px]">
      <PageHeader
        title={`Welcome, ${session.user.name}`}
        subtitle="Here is what's happening in your business today."
        breadcrumbs={[]}
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Today's Sales"
          value={formatCurrency(stats.kpis.todaySales.value)}
          subtitle={`${stats.kpis.todaySales.count} Invoices generated`}
          icon={ReceiptIndianRupee}
          variant="success"
        />
        <KPICard
          label="Open Purchase Orders"
          value={stats.kpis.openPOs.count}
          subtitle={`Valued at ${formatCurrency(stats.kpis.openPOs.value)}`}
          icon={ShoppingCart}
          variant="default"
        />
        <KPICard
          label="Low Stock Items"
          value={stats.kpis.lowStock.count}
          subtitle="Requires attention"
          icon={AlertCircle}
          variant={stats.kpis.lowStock.count > 0 ? "error" : "success"}
        />
        <KPICard
          label="Outstanding Receivables"
          value={formatCurrency(stats.kpis.receivables.value)}
          subtitle="Pending from customers"
          icon={Wallet}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-sm">Recent Sales Invoices</CardTitle>
              <Link
                href="/dashboard/sales/invoices"
                className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
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
              <CardTitle className="text-sm">Pending Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border-default/50">
                <div className="p-4 flex items-start gap-3 hover:bg-surface-muted transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">
                      Verify 3 GRNs
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Awaiting purchase bill entry
                    </p>
                  </div>
                </div>
                <div className="p-4 flex items-start gap-3 hover:bg-surface-muted transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">
                      Stock Alert
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {stats.kpis.lowStock.count} items below minimum level
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
