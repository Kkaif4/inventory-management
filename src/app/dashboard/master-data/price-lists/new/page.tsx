export const dynamic = "force-dynamic";
import { getAllVariants } from "@/actions/products";

import { PriceListForm } from "./price-list-form";

export default async function NewPriceListPage() {
  const res = await getAllVariants();
  if (!res.success) {
    throw new Error(res.error?.message || "Failed to load variants");
  }
  const variants = res.data!;
  return <PriceListForm variants={variants} />;
}
