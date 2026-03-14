export const dynamic = "force-dynamic";
import { PRForm } from "./pr-form";

import { getAllVariants } from "@/actions/products";

export default async function NewPurchaseRequestPage() {
  const res = await getAllVariants();
  if (!res.success) {
    throw new Error(res.error?.message || "Failed to load variants");
  }
  const variants = res.data!;
  return <PRForm variants={variants} />;
}
