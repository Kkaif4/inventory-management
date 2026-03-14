export const dynamic = "force-dynamic";
import { getLedgerEntries } from "@/actions/financials/reports";

import { LedgerClient } from "./ledger-client";

export default async function LedgerPage() {
  const res = await getLedgerEntries();
  if (!res.success || !res.data) {
    return <div>Failed to load ledger: {res.error?.message}</div>;
  }
  return <LedgerClient entries={res.data} />;
}
