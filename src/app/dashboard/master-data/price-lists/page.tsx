export const dynamic = "force-dynamic";
import { getPriceLists } from "@/actions/price-lists";

import { PriceListsClient } from "./price-lists-client";

export default async function PriceListsPage() {
  const res = await getPriceLists();
  if (!res.success) {
    throw new Error(res.error?.message || "Failed to load price lists");
  }
  const priceLists = res.data!;
  return <PriceListsClient priceLists={priceLists} />;
}
