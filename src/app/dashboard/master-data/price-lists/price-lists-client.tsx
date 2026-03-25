"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function PriceListsClient({ priceLists }: { priceLists: any[] }) {
  const t = useTranslations("priceLists");
  const tc = useTranslations("common");

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: t("table.name"),
      cell: ({ getValue }) => (
        <span className="font-semibold text-text-primary">
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: tc("fields.description"),
      cell: ({ getValue }) => (
        <span className="text-text-secondary">
          {(getValue() as string) || "-"}
        </span>
      ),
    },
    {
      id: "entriesCount",
      header: t("table.entriesCount"),
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original._count.entries}
        </span>
      ),
    },
    {
      id: "partiesCount",
      header: t("table.partiesCount"),
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original._count.parties}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: tc("fields.status"),
      cell: ({ getValue }) => {
        const isActive = getValue() as boolean;
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-bold ${
              isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isActive ? tc("status.active") : tc("status.inactive")}
          </span>
        );
      },
    },
  ];

  const breadcrumbs = [
    { label: tc("breadcrumbs.masterData") },
    { label: t("title") },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        breadcrumbs={breadcrumbs}
      />

      <TableToolbar
        searchPlaceholder={t("searchPlaceholder")}
        actions={
          <Link href="/dashboard/master-data/price-lists/new">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span>{t("addPriceList")}</span>
            </Button>
          </Link>
        }
      />

      <DataTable columns={columns} data={priceLists} />
    </div>
  );
}
