export const dynamic = "force-dynamic";
import { getSalesReturns } from "@/actions/sales/returns";

import { SalesReturnsClient } from "./returns-client";

export default async function SalesReturnsPage() {
  const res = await getSalesReturns();
  if (!res.success) {
    throw new Error(res.error?.message || "Failed to load sales returns");
  }
  const returns = res.data!;
  return <SalesReturnsClient returns={returns} />;
}
