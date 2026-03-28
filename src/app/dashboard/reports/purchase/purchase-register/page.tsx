export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getCurrentSessionOutlet } from "@/lib/outlet-auth";
import { getPurchaseRegisterReport } from "@/actions/reports/purchase";
import { parsePaginationParams } from "@/lib/pagination";
import { PurchaseRegisterClient } from "./purchase-register-client";
import type { PurchaseReportParams } from "@/types/reports/purchase";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata() {
  return {
    title: "Purchase Register Report - Inventory Management",
    description: "Complete purchase order history with tax details",
  };
}

async function PurchaseRegisterContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const outletId = await getCurrentSessionOutlet();

  const { page, limit } = parsePaginationParams(params);
  let dateFrom = new Date();
  dateFrom.setMonth(dateFrom.getMonth() - 1);
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

  const reportParams: PurchaseReportParams = {
    page,
    limit,
    dateFrom,
    dateTo,
    outletId,
    vendorId: Array.isArray(params.vendorId)
      ? params.vendorId[0]
      : params.vendorId,
    search: Array.isArray(params.search) ? params.search[0] : params.search,
    status: Array.isArray(params.status) ? params.status[0] : params.status,
  };

  const result = await getPurchaseRegisterReport(reportParams);

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || "Failed to load report");
  }

  return (
    <PurchaseRegisterClient
      initialData={result.data.data}
      pagination={
        result.data.pagination || {
          page: reportParams.page,
          limit: reportParams.limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
          skip: 0,
        }
      }
      outletId={outletId}
    />
  );
}

export default function PurchaseRegisterReportPage({
  searchParams,
}: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PurchaseRegisterContent searchParams={searchParams} />
    </Suspense>
  );
}
