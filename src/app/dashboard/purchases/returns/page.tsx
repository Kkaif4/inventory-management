export const dynamic = "force-dynamic";
import { getPurchaseReturns } from "@/actions/purchases/returns";

import { PurchaseReturnsClient } from "./returns-client";

export default async function PurchaseReturnsPage() {
  const returns = await getPurchaseReturns();
  return <PurchaseReturnsClient returns={returns} />;
}
