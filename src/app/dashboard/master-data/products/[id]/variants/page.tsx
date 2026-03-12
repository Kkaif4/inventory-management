export const dynamic = "force-dynamic";
import { getProductWithVariants } from "@/actions/products";

import { VariantsClient } from "./variants-client";
import { notFound } from "next/navigation";

export default async function VariantsPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductWithVariants(params.id);

  if (!product) {
    notFound();
  }

  return <VariantsClient product={product} />;
}
