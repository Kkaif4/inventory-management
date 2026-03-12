export const dynamic = "force-dynamic";
import { getAllVariants } from "@/actions/products";

import { PriceListForm } from "./price-list-form";

export default async function NewPriceListPage() {
  const variants = await getAllVariants();
  return <PriceListForm variants={variants} />;
}
