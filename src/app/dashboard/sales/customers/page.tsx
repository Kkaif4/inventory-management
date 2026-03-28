import { Suspense } from "react";
import { getCustomersPaginated } from "@/actions/sales/customers";
import { getCurrentSessionOutlet } from "@/lib/outlet-auth";
import { parsePaginationParams } from "@/lib/pagination";
import { CustomersClient } from "./customers-client";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const outletId = await getCurrentSessionOutlet();

  // Parse query params with type safety
  const pagination = parsePaginationParams(searchParams);
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const status = typeof searchParams.status === "string" ? searchParams.status : "ACTIVE";
  const typeFilter = typeof searchParams.typeFilter === "string" ? searchParams.typeFilter : "ALL";
  const state = typeof searchParams.state === "string" ? searchParams.state : null;
  const hasOverdue = searchParams.hasOverdue === "true";

  const res = await getCustomersPaginated(outletId, {
    page: pagination.page,
    limit: pagination.limit,
    search: search || undefined,
    status: (status || "ACTIVE") as "ALL" | "ACTIVE" | "INACTIVE",
    typeFilter: (typeFilter || "ALL") as "ALL" | "B2B" | "B2C",
    state,
    hasOverdue: hasOverdue || undefined,
  });

  const result = res as any;
  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold">Failed to load customers</h2>
        <p>{result.error?.message || "Unknown error"}</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<CustomersSkeleton />}>
      <CustomersClient
        initialData={result.data.data}
        initialPagination={result.data.pagination}
        outletId={outletId}
      />
    </Suspense>
  );
}

function CustomersSkeleton() {
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
