export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getCurrentSessionOutlet } from "@/lib/outlet-auth";
import { getCustomerOutstandingReport } from "@/actions/reports/outstanding";
import { parsePaginationParams } from "@/lib/pagination";
import { CustomerOutstandingClient } from "./customer-outstanding-client";
import type { OutstandingReportParams } from "@/types/reports/outstanding";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata() {
  return {
    title: "Customer Outstanding Report - Inventory Management",
    description: "Track customer outstanding balances and credit utilization",
  };
}

async function CustomerOutstandingContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const outletId = await getCurrentSessionOutlet();

  const { page, limit } = parsePaginationParams(params);

  const reportParams: OutstandingReportParams = {
    page,
    limit,
    outletId,
    search: Array.isArray(params.search) ? params.search[0] : params.search,
    status: Array.isArray(params.status) ? params.status[0] : params.status,
  };

  const result = await getCustomerOutstandingReport(reportParams);

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || "Failed to load report");
  }

  return (
    <CustomerOutstandingClient
      initialData={result.data.data}
      pagination={result.data.pagination}
      outletId={outletId}
    />
  );
}

export default function CustomerOutstandingReportPage({
  searchParams,
}: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomerOutstandingContent searchParams={searchParams} />
    </Suspense>
  );
}