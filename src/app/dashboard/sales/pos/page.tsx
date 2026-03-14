import { getAllVariants } from "@/actions/products";
export const dynamic = "force-dynamic";
import { POSClient } from "./pos-client";

export default async function POSPage() {
  const res = await getAllVariants();
  if (!res.success) {
    throw new Error(res.error?.message || "Failed to load variants");
  }
  const variants = res.data!;
  return <POSClient variants={variants} />;
}
