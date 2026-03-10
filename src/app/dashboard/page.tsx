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

  const stats = await getDashboardStats();

  return <DashboardClient stats={stats} userName={session.user?.name || ""} />;
}
