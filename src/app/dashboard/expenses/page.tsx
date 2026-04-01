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
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Await searchParams since it's a Promise in Next.js 15+
  const params = await searchParams;

  const outletId = await getCurrentSessionOutlet();

  // Parse query params
  const pagination = parsePaginationParams(params);
  const categoryId =
    typeof params.categoryId === "string" ? params.categoryId : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const dateFrom =
    typeof params.dateFrom === "string" ? new Date(params.dateFrom) : undefined;
  const dateTo =
    typeof params.dateTo === "string" ? new Date(params.dateTo) : undefined;

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
