import { PRForm } from "./pr-form";
import { getAllVariants } from "@/actions/products";

export default async function NewPurchaseRequestPage() {
  const variants = await getAllVariants();
  return <PRForm variants={variants} />;
}
