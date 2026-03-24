export const dynamic = "force-dynamic";
import { getProductWithVariants } from "@/actions/products";

import { VariantsClient } from "./variants-client";
import { notFound } from "next/navigation";

export default async function ProductVariantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductWithVariants(id);

  if (!product) {
    notFound();
  }

  return <VariantsClient product={product} />;
}
