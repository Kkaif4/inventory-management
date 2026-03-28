export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { getCurrentSessionOutlet } from '@/lib/outlet-auth';
import { getSlowMovingStockReport } from '@/actions/reports/inventory';
import { parsePaginationParams } from '@/lib/pagination';
import { SlowMovingStockClient } from './slow-moving-stock-client';
import type { InventoryReportParams } from '@/types/reports/inventory';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata() {
  return {
    title: 'Slow-Moving Stock Report',
  };
}

async function SlowMovingStockContent({ searchParams }: PageProps) {
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
    dateFrom,
    dateTo,
    outletId,
    warehouseId: Array.isArray(params.warehouseId)
      ? params.warehouseId[0]
      : params.warehouseId,
    productId: Array.isArray(params.productId) ? params.productId[0] : params.productId,
    categoryId: Array.isArray(params.categoryId) ? params.categoryId[0] : params.categoryId,
  };

  const result = await getSlowMovingStockReport(reportParams);

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Failed to load report');
  }

  return <SlowMovingStockClient initialData={result.data.data} outletId={outletId} />;
}

export default function SlowMovingStockReportPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SlowMovingStockContent searchParams={searchParams} />
    </Suspense>
  );
}
