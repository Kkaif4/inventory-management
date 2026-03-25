"use client";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { useTranslations } from "next-intl";

export function DeliveryChallansClient({ challans }: { challans: any[] }) {
  const t = useTranslations("quotationsAndDelivery.challans");
  const common = useTranslations("common");
  const sales = useTranslations("sales");
  const dashboardTable = useTranslations("dashboard.table");
  const table = useTranslations("quotationsAndDelivery.table");

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "txnNumber",
      header: t("challanNumber"),
      cell: ({ getValue }) => (
        <span className="font-bold text-brand">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "date",
      header: sales("date"),
      cell: ({ getValue }) => (
        <span>{format(new Date(getValue() as string), "dd MMM yyyy")}</span>
      ),
    },
    {
      accessorKey: "party.name",
      header: dashboardTable("customer"),
      cell: ({ row }) => (
        <span>{row.original.party?.name || sales("cashCustomer")}</span>
      ),
    },
    {
      accessorKey: "grandTotal",
      header: table("valueWithCurrency"),
      cell: ({ getValue }) => (
        <span className="font-bold">₹{Number(getValue()).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: dashboardTable("status"),
      cell: ({ getValue }) => {
        const status = getValue() as string;
        let style = "bg-primary-100 text-primary-700";
        if (status === "DELIVERED") style = "bg-green-100 text-green-700";
        if (status === "SHIPPED") style = "bg-blue-100 text-blue-700";
        return (
          <span className={`px-2 py-1 rounded text-xs font-bold ${style}`}>
            {status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        breadcrumbs={[
          { label: common("groups.sales") },
          { label: t("title").replace("Delivery ", "") },
        ]}
      />
      <TableToolbar searchPlaceholder={t("searchPlaceholder")} />
      <DataTable columns={columns} data={challans} />
    </div>
  );
}
