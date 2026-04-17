import { Suspense } from "react";
import { getSalesInvoicesPaginated } from "@/actions/sales/sales-invoice";
import { getSalesReturnsPaginated } from "@/actions/sales/returns";
import { SalesTransactionsClient } from "./sales-transactions-client";
import { redirect } from "next/navigation";
import { getCurrentSessionOutlet } from "@/lib/outlet-auth";
import { parsePaginationParams } from "@/lib/pagination";
import type { PaginationMeta } from "@/types/pagination";

const defaultPagination: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
  skip: 0,
};

export default async function SalesTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentOutletId = await getCurrentSessionOutlet();
  // Await searchParams since it's a Promise in Next.js 15+
  const params = await searchParams;

  if (!currentOutletId) {
    redirect("/dashboard");
  }

  // Parse pagination and filter params
  const pagination = parsePaginationParams(params);
  const tab = typeof params.tab === "string" ? params.tab : "invoices";
  const search = typeof params.search === "string" ? params.search : "";
  const status = typeof params.status === "string" ? params.status : "ALL";

  // Fetch only the active tab's data
  let tabData: { data: any[]; pagination: PaginationMeta };

  if (tab === "invoices") {
    const res = await getSalesInvoicesPaginated(currentOutletId, {
      page: pagination.page,
      limit: pagination.limit,
      search: search || undefined,
      status: status || "ALL",
    });

    if (res.success && res.data) {
      tabData = res.data;
    } else {
      console.error("Failed to fetch invoices:", res.error);
      tabData = { data: [], pagination: defaultPagination };
    }
  } else if (tab === "returns") {
    const res = await getSalesReturnsPaginated(currentOutletId, {
      page: pagination.page,
      limit: pagination.limit,
      search: search || undefined,
      status: status || "ALL",
    });

    if (res.success && res.data) {
      tabData = res.data;
    } else {
      console.error("Failed to fetch returns:", res.error);
      tabData = { data: [], pagination: defaultPagination };
    }
  } else {
    tabData = { data: [], pagination: defaultPagination };
  }

  return (
    <Suspense fallback={<SalesTransactionsSkeleton />}>
      <SalesTransactionsClient
        initialData={tabData.data}
        initialPagination={tabData.pagination}
        tab={tab}
      />
    </Suspense>
  );
}

function SalesTransactionsSkeleton() {
  return (
    <div className="space-y-6 pb-20">
      <div className="h-10 bg-slate-200 rounded w-48 animate-pulse" />
      <div className="h-12 bg-slate-200 rounded animate-pulse" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
