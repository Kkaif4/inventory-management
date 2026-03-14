export const dynamic = "force-dynamic";
import { getBalanceSheet } from "@/actions/financials/reports";

import { BalanceSheetClient } from "./balance-sheet-client";

export default async function BalanceSheetPage() {
  const res = await getBalanceSheet();
  if (!res.success || !res.data) {
    return <div>Failed to load balance sheet: {res.error?.message}</div>;
  }
  return <BalanceSheetClient data={res.data} />;
}
