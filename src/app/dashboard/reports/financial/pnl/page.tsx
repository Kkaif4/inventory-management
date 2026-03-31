export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getPnL } from "@/actions/reports/pnl";
import { getSessionWithOutlets } from "@/lib/outlet-auth";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import PnLClient from "./pnl-client";

interface PnLPageProps {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    outletId?: string;
    preset?: string;
  }>;
}

export default async function PnLPage({ searchParams }: PnLPageProps) {
  const sessionData = await getSessionWithOutlets();

  if (!sessionData?.session?.user?.id) {
    redirect("/login");
  }

  // Get user's outlets
  const outlets = sessionData.outlets;

  if (outlets.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900">
            No Outlets Available
          </h1>
          <p className="text-slate-500 mt-2">
            You need access to at least one outlet to view the P&L report.
          </p>
        </div>
      </div>
    );
  }

  // Parse search params
  const params = await searchParams;

  // Default to current month if no dates provided
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  if (params.startDate) {
    startDate = new Date(params.startDate);
  } else {
    startDate = startOfMonth(now);
  }

  if (params.endDate) {
    endDate = new Date(params.endDate);
  } else {
    endDate = endOfMonth(now);
  }

  // Determine outlet - use from URL or default to first available
  const currentOutletId = params.outletId || outlets[0].id;

  // Validate outlet access
  const hasAccess = outlets.some((o) => o.id === currentOutletId);
  if (!hasAccess && params.outletId !== "all") {
    // Redirect to valid outlet
    redirect(`/dashboard/reports/financial/pnl?outletId=${outlets[0].id}`);
  }

  // Fetch P&L data
  const outletIdForQuery =
    currentOutletId === "all" ? undefined : currentOutletId;
  const pnlResult = await getPnL(startDate, endDate, outletIdForQuery);

  if (!pnlResult.success || !pnlResult.data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900">
            Failed to Load P&L
          </h1>
          <p className="text-slate-500 mt-2">
            {pnlResult.error?.message ||
              "An error occurred while loading the P&L data."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <PnLClient
      data={pnlResult.data}
      outlets={outlets}
      currentOutletId={currentOutletId}
    />
  );
}
