import { getPriceLists } from "@/actions/price-lists";
import { PriceListsClient } from "./price-lists-client";

export default async function PriceListsPage() {
  const priceLists = await getPriceLists();
  return <PriceListsClient priceLists={priceLists} />;
}
