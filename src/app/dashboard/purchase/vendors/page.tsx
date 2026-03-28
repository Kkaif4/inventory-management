import { Suspense } from "react";
import { getVendorsPaginated } from "@/actions/purchase/vendors";
import { getCurrentSessionOutlet } from "@/lib/outlet-auth";
import { parsePaginationParams } from "@/lib/pagination";
import { VendorsClient } from "./vendors-client";

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const outletId = await getCurrentSessionOutlet();

  // Parse query params with type safety
  const pagination = parsePaginationParams(searchParams);
  const search =
    typeof searchParams.search === "string" ? searchParams.search : "";
  const status =
    typeof searchParams.status === "string" ? searchParams.status : "ACTIVE";
  const state =
    typeof searchParams.state === "string" ? searchParams.state : null;
  const hasOverdue = searchParams.hasOverdue === "true";

  const res = await getVendorsPaginated(outletId, {
    page: pagination.page,
    limit: pagination.limit,
    search: search || undefined,
    status: (status || "ACTIVE") as "ALL" | "ACTIVE" | "INACTIVE",
    state,
    hasOverdue: hasOverdue || undefined,
  });

  if (!res.success || !res.data) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold">Failed to load vendors</h2>
        <p>{res.error?.message || "Unknown error"}</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<VendorsSkeleton />}>
      <VendorsClient
        initialData={res.data.data}
        initialPagination={res.data.pagination}
        outletId={outletId}
      />
    </Suspense>
  );
}

function VendorsSkeleton() {
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
