import { getCategoriesPaginated } from "@/actions/categories";
import { getCurrentSessionOutlet } from "@/lib/outlet-auth";
import { CategoriesClient } from "./categories-client";
import { parsePaginationParams } from "@/lib/pagination";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CategoriesPage({ searchParams }: PageProps) {
  const outletId = await getCurrentSessionOutlet();
  const params = await searchParams;

  // Parse query params
  const pagination = parsePaginationParams(params);
  const search = typeof params.search === "string" ? params.search : "";

  const res = await getCategoriesPaginated(outletId, {
    page: pagination.page,
    limit: pagination.limit,
    search: search || undefined,
  });

  const result = res as any;

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold">Failed to load categories</h2>
        <p>{result.error?.message || "Unknown error"}</p>
      </div>
    );
  }

  return (
    <CategoriesClient
      categories={result.data.data}
      pagination={result.data.pagination}
      outletId={outletId}
    />
  );
}
