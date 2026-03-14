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
  const res = await getProductWithVariants(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const product = res.data;

  const sanitizedProduct = {
    ...product,
    conversionRatio: (product as any).conversionRatio ?? 1,
    brand: (product as any).brand ?? null,
    purchaseUnit: (product as any).purchaseUnit ?? null,
    variants: product.variants.map((v: any) => ({
      ...v,
      markupPercent: v.markupPercent ?? null,
    })),
  };

  return <ProductEditClient product={sanitizedProduct as any} />;
}
