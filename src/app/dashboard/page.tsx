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

  const stats = await getDashboardStats(outletId);

  return <DashboardClient stats={stats} userName={session.user?.name || ""} />;
}
