import { Suspense } from "react";
import { getExpenses } from "@/actions/expenses";
import { getCurrentSessionOutlet } from "@/lib/outlet-auth";
import { parsePaginationParams } from "@/lib/pagination";
import { ExpensesClient } from "./expenses-client";

function ExpensesSkeleton() {
  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      <div className="h-8 bg-slate-200 rounded-lg w-1/4 animate-pulse" />
      <div className="space-y-3">
        <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
        <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const outletId = await getCurrentSessionOutlet();

  // Parse query params
  const pagination = parsePaginationParams(searchParams);
  const categoryId =
    typeof searchParams.categoryId === "string"
      ? searchParams.categoryId
      : undefined;
  const status =
    typeof searchParams.status === "string" ? searchParams.status : undefined;
  const dateFrom =
    typeof searchParams.dateFrom === "string"
      ? new Date(searchParams.dateFrom)
      : undefined;
  const dateTo =
    typeof searchParams.dateTo === "string"
      ? new Date(searchParams.dateTo)
      : undefined;

  const res = await getExpenses(
    outletId,
    {
      categoryId,
      status,
      dateFrom,
      dateTo,
    },
    {
      page: pagination.page,
      limit: pagination.limit,
    },
  );

  if (!res.success || !res.data) {
    return (
      <div className="p-8 text-center text-red-500 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold">Failed to load expenses</h2>
        <p>{res.error?.message || "Unknown error"}</p>
      </div>
    );
  }

  // Convert Decimal fields to numbers for Client Component
  const serializedItems = res.data.items.map((item: any) => ({
    ...item,
    taxableAmount: Number(item.taxableAmount),
    gstRate: Number(item.gstRate),
    inputGst: Number(item.inputGst),
    totalAmount: Number(item.totalAmount),
  }));

  return (
    <Suspense fallback={<ExpensesSkeleton />}>
      <ExpensesClient
        initialData={serializedItems}
        initialPagination={{
          page: res.data.page,
          limit: res.data.limit,
          total: res.data.total,
          totalPages: res.data.totalPages,
        }}
        outletId={outletId}
      />
    </Suspense>
  );
}
