import { getPurchaseBills } from "@/actions/purchases/bills";
import { PurchaseBillsClient } from "./bills-client";

export default async function PurchaseBillsPage() {
  const bills = await getPurchaseBills();
  return <PurchaseBillsClient bills={bills} />;
}
