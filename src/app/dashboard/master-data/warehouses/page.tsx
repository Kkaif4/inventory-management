export const dynamic = "force-dynamic";
import { getWarehousesPaginated } from "@/actions/warehouses";

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { WarehousesClient } from "./_components/warehouses-client";
import { getTranslations } from "next-intl/server";

export default async function WarehousesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const t = await getTranslations("warehouses");
  const tc = await getTranslations("common");

  const page = Math.max(
    1,
    typeof params.page === "string" ? parseInt(params.page, 10) : 1,
  );
  const limit = Math.max(
    10,
    typeof params.limit === "string" ? parseInt(params.limit, 10) : 10,
  );
  const search = typeof params.search === "string" ? params.search : "";

  const res = await getWarehousesPaginated({
    page,
    limit,
    search,
  });

  if (!res.success) {
    throw new Error(res.error?.message || "Failed to load warehouses");
  }

  const { warehouses, pagination } = res.data!;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("header.title")}
        subtitle={t("subtitle")}
        breadcrumbs={[
          { label: tc("breadcrumbs.masterData") },
          { label: t("title") },
        ]}
      />

      <div className="flex items-center justify-between">
        <div />
        <Link
          href="/dashboard/master-data/warehouses/warehouse/new"
          className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
        >
          <Plus className="w-4 h-4 mr-2" /> {t("add")}
        </Link>
      </div>

      <WarehousesClient
        warehouses={warehouses}
        pagination={pagination}
        search={search}
      />
    </div>
  );
}
