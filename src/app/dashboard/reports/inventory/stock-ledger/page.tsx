export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getCurrentSessionOutlet } from "@/lib/outlet-auth";
import { getStockLedgerReport } from "@/actions/reports/inventory";
import { parsePaginationParams } from "@/lib/pagination";
import { StockLedgerClient } from "./stock-ledger-client";
import type { InventoryReportParams } from "@/types/reports/inventory";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata() {
  return {
    title: "Stock Ledger Report - Inventory Management",
    description: "Complete transaction history with running balance",
  };
}

async function StockLedgerContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const outletId = await getCurrentSessionOutlet();

  const { page, limit } = parsePaginationParams(params);
  let dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - 30);
  dateFrom.setHours(0, 0, 0, 0);

  let dateTo = new Date();
  dateTo.setHours(23, 59, 59, 999);

  if (params.dateFrom) {
    const df = Array.isArray(params.dateFrom)
      ? params.dateFrom[0]
      : params.dateFrom;
    dateFrom = new Date(df);
  }

  if (params.dateTo) {
    const dt = Array.isArray(params.dateTo) ? params.dateTo[0] : params.dateTo;
    dateTo = new Date(dt);
  }

  const reportParams: InventoryReportParams = {
    page,
    limit,
    dateFrom,
    dateTo,
    outletId,
    warehouseId:
      typeof params.warehouseId === "string" ? params.warehouseId : undefined,
    productId:
      typeof params.productId === "string" ? params.productId : undefined,
    categoryId:
      typeof params.categoryId === "string" ? params.categoryId : undefined,
    search: typeof params.search === "string" ? params.search : undefined,
    status: typeof params.type === "string" ? params.type : undefined,
  };

  const result = await getStockLedgerReport(reportParams);

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || "Failed to load report");
  }

  return (
    <StockLedgerClient
      initialData={result.data.data}
      pagination={result.data.pagination}
      outletId={outletId}
    />
  );
}

export default function StockLedgerReportPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StockLedgerContent searchParams={searchParams} />
    </Suspense>
  );
}
