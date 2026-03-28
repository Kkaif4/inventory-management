import { getProductsPaginated } from "@/actions/products";
import { getCurrentSessionOutlet } from "@/lib/outlet-auth";
import { ProductsClient } from "./products-client";
import { parsePaginationParams } from "@/lib/pagination";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const outletId = await getCurrentSessionOutlet();
  const params = await searchParams;

  // Parse query params
  const pagination = parsePaginationParams(params);
  const search = typeof params.search === "string" ? params.search : "";
  const categoryId =
    typeof params.categoryId === "string" ? params.categoryId : "";
  const brand = typeof params.brand === "string" ? params.brand : "";

  const res = await getProductsPaginated(outletId, {
    page: pagination.page,
    limit: pagination.limit,
    search: search || undefined,
    categoryId: categoryId || undefined,
    brand: brand || undefined,
  });

  const result = res as any;

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold">Failed to load products</h2>
        <p>{result.error?.message || "Unknown error"}</p>
      </div>
    );
  }

  return (
    <ProductsClient
      products={result.data.data}
      pagination={result.data.pagination}
      outletId={outletId}
    />
  );
}
