export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { getCurrentSessionOutlet } from '@/lib/outlet-auth';
import { getLowStockAlertReport } from '@/actions/reports/inventory';
import { parsePaginationParams } from '@/lib/pagination';
import { LowStockAlertClient } from './low-stock-alert-client';
import type { InventoryReportParams } from '@/types/reports/inventory';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata() {
  return {
    title: 'Low Stock Alert Report - Inventory Management',
    description: 'Items below minimum stock thresholds',
  };
}

async function LowStockAlertContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const outletId = await getCurrentSessionOutlet();

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

  const result = await getLowStockAlertReport(reportParams);

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Failed to load report');
  }

  return <LowStockAlertClient initialData={result.data.data} outletId={outletId} />;
}

export default function LowStockAlertReportPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LowStockAlertContent searchParams={searchParams} />
    </Suspense>
  );
}
