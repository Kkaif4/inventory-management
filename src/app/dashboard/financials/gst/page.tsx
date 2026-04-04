export const dynamic = "force-dynamic";

import { getSessionWithOutlets } from "@/lib/outlet-auth";
import { redirect } from "next/navigation";
import { GSTReportsClient } from "./gst-client";

interface GSTPageProps {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    outletId?: string;
  }>;
}

export default async function GSTPage({
  searchParams,
}: GSTPageProps) {
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
            You need access to at least one outlet to view GST reports.
          </p>
        </div>
      </div>
    );
  }

  return <GSTReportsClient outlets={outlets} />;
}
