import { getProducts } from "@/actions/products";
import { ProductFilter } from "@/actions/products/types";
import { ProductsClient } from "./products-client";
import { getCurrentSessionOutlet } from "@/lib/outlet-auth";

export default async function ProductsPage() {
  const outletId = await getCurrentSessionOutlet();
  const products = await getProducts(outletId);

  return <ProductsClient products={products} outletId={outletId} />;
}
