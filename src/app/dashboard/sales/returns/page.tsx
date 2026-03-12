export const dynamic = "force-dynamic";
import { getSalesReturns } from "@/actions/sales/returns";

import { SalesReturnsClient } from "./returns-client";

export default async function SalesReturnsPage() {
  const returns = await getSalesReturns();
  return <SalesReturnsClient returns={returns} />;
}
