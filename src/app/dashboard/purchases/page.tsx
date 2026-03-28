import { Suspense } from "react";
import { getPurchaseRequestsPaginated } from "@/actions/purchases/requests";
import {
  getPurchaseOrdersPaginated,
  getBillsPaginated,
} from "@/actions/procurement";
import { getPurchaseReturnsPaginated } from "@/actions/purchases/returns";
import { PurchasesClient } from "./purchases-client";
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

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const currentOutletId = await getCurrentSessionOutlet();

  if (!currentOutletId) {
    redirect("/dashboard");
  }

  // Parse pagination and filter params
  const pagination = parsePaginationParams(searchParams);
  const tab = typeof searchParams.tab === "string" ? searchParams.tab : "orders";
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const status = typeof searchParams.status === "string" ? searchParams.status : "ALL";

  // Fetch only the active tab's data
  let tabData: { data: any[]; pagination: PaginationMeta };

  if (tab === "requests") {
    const res = await getPurchaseRequestsPaginated(currentOutletId, {
      page: pagination.page,
      limit: pagination.limit,
      search: search || undefined,
      status: status || "ALL",
    });
    tabData = res.success && res.data ? res.data : { data: [], pagination: defaultPagination };
  } else if (tab === "orders") {
    const res = await getPurchaseOrdersPaginated(currentOutletId, {
      page: pagination.page,
      limit: pagination.limit,
      search: search || undefined,
      status: status || "ALL",
    });
    tabData = res.success && res.data ? res.data : { data: [], pagination: defaultPagination };
  } else if (tab === "bills") {
    const res = await getBillsPaginated(currentOutletId, {
      page: pagination.page,
      limit: pagination.limit,
      search: search || undefined,
      status: status || "ALL",
    });
    tabData = res.success && res.data ? res.data : { data: [], pagination: defaultPagination };
  } else if (tab === "returns") {
    const res = await getPurchaseReturnsPaginated(currentOutletId, {
      page: pagination.page,
      limit: pagination.limit,
      search: search || undefined,
      status: status || "ALL",
    });
    tabData = res.success && res.data ? res.data : { data: [], pagination: defaultPagination };
  } else {
    tabData = { data: [], pagination: defaultPagination };
  }

  return (
    <Suspense fallback={<PurchasesSkeleton />}>
      <PurchasesClient
        initialData={tabData.data || []}
        initialPagination={tabData.pagination}
        tab={tab}
      />
    </Suspense>
  );
}

function PurchasesSkeleton() {
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