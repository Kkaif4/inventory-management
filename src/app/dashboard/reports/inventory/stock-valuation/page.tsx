export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getCurrentSessionOutlet } from "@/lib/outlet-auth";
import { getStockValuationReport } from "@/actions/reports/inventory";
import { parsePaginationParams } from "@/lib/pagination";
import { StockValuationClient } from "./stock-valuation-client";
import type { InventoryReportParams } from "@/types/reports/inventory";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata() {
  return {
    title: "Stock Valuation Report",
  };
}

async function StockValuationContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const outletId = await getCurrentSessionOutlet();

  // Parse pagination and filter params
  const { page, limit } = parsePaginationParams(params);
  const dateFrom = new Date();
  dateFrom.setHours(0, 0, 0, 0);
  const dateTo = new Date();
  dateTo.setHours(23, 59, 59, 999);

  const reportParams: InventoryReportParams = {
    page,
    limit,
    dateFrom: new Date(), // Boilerplate
    dateTo: new Date(),
    outletId,
    warehouseId:
      typeof params.warehouseId === "string" ? params.warehouseId : undefined,
    productId:
      typeof params.productId === "string" ? params.productId : undefined,
    categoryId:
      typeof params.categoryId === "string" ? params.categoryId : undefined,
    search: typeof params.search === "string" ? params.search : undefined,
  };

  const result = await getStockValuationReport(reportParams);

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || "Failed to load report");
  }

  return (
    <StockValuationClient
      initialData={result.data.data}
      pagination={result.data.pagination}
      outletId={outletId}
    />
  );
}

export default function StockValuationReportPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StockValuationContent searchParams={searchParams} />
    </Suspense>
  );
}
