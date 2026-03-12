import { getAllVariants } from "@/actions/products";
export const dynamic = "force-dynamic";
import { POSClient } from "./pos-client";

export default async function POSPage() {
  const variants = await getAllVariants();
  return <POSClient variants={variants} />;
}
