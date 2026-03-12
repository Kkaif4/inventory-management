export const dynamic = "force-dynamic";
import { getTrialBalance } from "@/actions/reports";

import TrialBalanceClient from "./trial-balance-client";

export default async function TrialBalancePage() {
  const data = await getTrialBalance();

  return <TrialBalanceClient data={data} />;
}
