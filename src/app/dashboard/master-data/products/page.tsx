import { getProducts } from "@/actions/products";
import { ProductsClient } from "./products-client";
import { getCurrentSessionOutlet } from "@/lib/outlet-auth";

export default async function ProductsPage() {
  const outletId = await getCurrentSessionOutlet();
  const res = await getProducts(outletId);

  if (!res.success) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold">Failed to load products</h2>
        <p>{res.error?.message}</p>
      </div>
    );
  }

  return <ProductsClient products={res.data!} outletId={outletId} />;
}
