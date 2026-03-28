export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { getCurrentSessionOutlet } from '@/lib/outlet-auth';
import { getSalesRegisterReport } from '@/actions/reports/sales';
import { parsePaginationParams } from '@/lib/pagination';
import { SalesRegisterClient } from './sales-register-client';
import type { SalesReportParams } from '@/types/reports/sales';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata() {
  return {
    title: 'Sales Register Report - Inventory Management',
    description: 'Complete sales transaction history with tax details',
  };
}

async function SalesRegisterContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const outletId = await getCurrentSessionOutlet();

  const { page, limit } = parsePaginationParams(params);
  let dateFrom = new Date();
  dateFrom.setMonth(dateFrom.getMonth() - 1);
  dateFrom.setHours(0, 0, 0, 0);

  let dateTo = new Date();
  dateTo.setHours(23, 59, 59, 999);

  if (params.dateFrom) {
    const df = Array.isArray(params.dateFrom) ? params.dateFrom[0] : params.dateFrom;
    dateFrom = new Date(df);
  }

  if (params.dateTo) {
    const dt = Array.isArray(params.dateTo) ? params.dateTo[0] : params.dateTo;
    dateTo = new Date(dt);
  }

  const reportParams: SalesReportParams = {
    page,
    limit,
    dateFrom,
    dateTo,
    outletId,
    customerId: Array.isArray(params.customerId) ? params.customerId[0] : params.customerId,
    search: Array.isArray(params.search) ? params.search[0] : params.search,
    paymentStatus: Array.isArray(params.paymentStatus) ? params.paymentStatus[0] : params.paymentStatus,
  };

  const result = await getSalesRegisterReport(reportParams);

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Failed to load report');
  }

  return (
    <SalesRegisterClient
      initialData={result.data.data}
      pagination={result.data.pagination || { page: reportParams.page, limit: reportParams.limit, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false, skip: 0 }}
      outletId={outletId}
    />
  );
}

export default function SalesRegisterReportPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SalesRegisterContent searchParams={searchParams} />
    </Suspense>
  );
}
