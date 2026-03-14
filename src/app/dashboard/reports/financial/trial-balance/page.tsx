export const dynamic = "force-dynamic";
import { getTrialBalance } from "@/actions/reports";

import TrialBalanceClient from "./trial-balance-client";

export default async function TrialBalancePage() {
  const res = await getTrialBalance();
  if (!res.success) {
    throw new Error(res.error?.message || "Failed to load Trial Balance");
  }
  const data = res.data!;

  return <TrialBalanceClient data={data} />;
}
