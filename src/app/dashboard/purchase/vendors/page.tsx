import { Suspense } from "react";
import { getVendorsPaginated } from "@/actions/purchase/vendors";
import { getCurrentSessionOutlet } from "@/lib/outlet-auth";
import { parsePaginationParams } from "@/lib/pagination";
import { VendorsClient } from "./vendors-client";

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Await searchParams since it's a Promise in Next.js 15+
  const params = await searchParams;

  const outletId = await getCurrentSessionOutlet();

  // Parse query params with type safety
  const pagination = parsePaginationParams(params);
  const search = typeof params.search === "string" ? params.search : "";
  const status = typeof params.status === "string" ? params.status : "ACTIVE";
  const state = typeof params.state === "string" ? params.state : null;
  const hasOverdue = params.hasOverdue === "true";

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
