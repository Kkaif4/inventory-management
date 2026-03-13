export const dynamic = "force-dynamic";

import { getProductWithVariants } from "@/actions/products";
import { ProductEditClient } from "./edit-client";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductWithVariants(id);

  if (!product) {
    notFound();
  }

  const sanitizedProduct = {
    ...product,
    conversionRatio: product.conversionRatio ?? 1,
    brand: product.brand ?? null,
    purchaseUnit: product.purchaseUnit ?? null,
    variants: product.variants.map((v) => ({
      ...v,
      markupPercent: v.markupPercent ?? null,
    })),
  };

  return <ProductEditClient product={sanitizedProduct as any} />;
}
