export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardStats } from "@/actions/dashboard";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardRoot() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Get outlet from session or redirect
  const outletId = (session.user as any).availableOutlets?.[0]?.id;

  if (!outletId) {
    redirect("/no-outlet");
  }

  const response = await getDashboardStats(outletId);

  if (!response.success) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-red-600">
        <h2 className="text-xl font-bold">Failed to load dashboard</h2>
        <p className="text-sm mt-2">{response.error?.message}</p>
      </div>
    );
  }

  return (
    <DashboardClient
      stats={response.data!}
      userName={session.user?.name || ""}
    />
  );
}
