export const dynamic = "force-dynamic";
import { getProfitAndLoss } from "@/actions/reports";

import PNLClient from "./pnlClient";

export default async function PnLPage() {
  const res = await getProfitAndLoss();
  if (!res.success) {
    throw new Error(res.error?.message || "Failed to load P&L");
  }
  const data = res.data!;

  return <PNLClient data={data} />;
}
