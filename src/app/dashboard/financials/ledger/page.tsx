import { getLedgerEntries } from "@/actions/financials/reports";
import { LedgerClient } from "./ledger-client";

export default async function LedgerPage() {
  const entries = await getLedgerEntries();
  return <LedgerClient entries={entries} />;
}
