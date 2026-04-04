export const dynamic = "force-dynamic";
import { getBalanceSheet } from "@/actions/financials/reports";
import { getSessionWithOutlets } from "@/lib/outlet-auth";
import { redirect } from "next/navigation";

import { BalanceSheetClient } from "./balance-sheet-client";

interface BalanceSheetPageProps {
  searchParams: Promise<{
    asOnDate?: string;
    outletId?: string;
  }>;
}

export default async function BalanceSheetPage({
  searchParams,
}: BalanceSheetPageProps) {
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
            You need access to at least one outlet to view the balance sheet.
          </p>
        </div>
      </div>
    );
  }

  // Parse search params
  const params = await searchParams;
  const asOnDate = params.asOnDate ? new Date(params.asOnDate) : new Date();
  const outletId = params.outletId || outlets[0].id;

  // Validate outlet access
  const hasAccess = outlets.some((o) => o.id === outletId);
  if (!hasAccess) {
    redirect(`/dashboard/financials/balance-sheet?outletId=${outlets[0].id}`);
  }

  const res = await getBalanceSheet(asOnDate, outletId);
  if (!res.success || !res.data) {
    return <div>Failed to load balance sheet: {res.error?.message}</div>;
  }
  return <BalanceSheetClient data={res.data} outlets={outlets} currentOutletId={outletId} />;
}
