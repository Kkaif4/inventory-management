export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getCurrentSessionOutlet } from "@/lib/outlet-auth";
import { getCurrentStockReport } from "@/actions/reports/inventory";
import { parsePaginationParams } from "@/lib/pagination";
import { CurrentStockClient } from "./current-stock-client";
import type { InventoryReportParams } from "@/types/reports/inventory";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata() {
  return {
    title: "Current Stock Report - Inventory Management",
    description: "Real-time inventory balance across all warehouses",
  };
}

async function CurrentStockContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const outletId = await getCurrentSessionOutlet();

  // Parse pagination and filter params
  const { page, limit } = parsePaginationParams(params);

  const reportParams: InventoryReportParams = {
    page,
    limit,
    dateFrom: new Date(), // Boilerplate for type, not used in stock report currently
    dateTo: new Date(),
    outletId,
    warehouseId:
      typeof params.warehouseId === "string" ? params.warehouseId : undefined,
    productId:
      typeof params.productId === "string" ? params.productId : undefined,
    categoryId:
      typeof params.categoryId === "string" ? params.categoryId : undefined,
    search: typeof params.search === "string" ? params.search : undefined,
    status: typeof params.status === "string" ? params.status : undefined,
  };

  const result = await getCurrentStockReport(reportParams);

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || "Failed to load report");
  }

  return (
    <CurrentStockClient
      initialData={result.data.data}
      pagination={result.data.pagination}
      outletId={outletId}
    />
  );
}

export default function CurrentStockReportPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CurrentStockContent searchParams={searchParams} />
    </Suspense>
  );
}
