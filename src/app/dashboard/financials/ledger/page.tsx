export const dynamic = "force-dynamic";
import { getLedgerEntries } from "@/actions/financials/reports";
import { getSessionWithOutlets } from "@/lib/outlet-auth";
import { redirect } from "next/navigation";

import { LedgerClient } from "./ledger-client";

interface LedgerPageProps {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    accountId?: string;
    outletId?: string;
  }>;
}

export default async function LedgerPage({
  searchParams,
}: LedgerPageProps) {
  const sessionData = await getSessionWithOutlets();

  if (!sessionData?.session?.user?.id) {
    redirect("/login");
  }

  const outlets = sessionData.outlets;

  if (outlets.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900">
            No Outlets Available
          </h1>
          <p className="text-slate-500 mt-2">
            You need access to at least one outlet to view the ledger.
          </p>
        </div>
      </div>
    );
  }

  // Parse search params
  const params = await searchParams;
  const accountId = params.accountId;
  // Use selected outlet or default to first outlet
  const outletId = params.outletId || outlets[0]?.id;

  const res = await getLedgerEntries(accountId, undefined, undefined, outletId);
  if (!res.success || !res.data) {
    return <div>Failed to load ledger: {res.error?.message}</div>;
  }
  return <LedgerClient entries={res.data} outlets={outlets} />;
}
