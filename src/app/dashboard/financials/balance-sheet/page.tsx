import { getBalanceSheet } from "@/actions/financials/reports";
import { BalanceSheetClient } from "./balance-sheet-client";

export default async function BalanceSheetPage() {
  const data = await getBalanceSheet();
  return <BalanceSheetClient data={data} />;
}
