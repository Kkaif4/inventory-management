import { getCurrentSessionOutlet } from "@/lib/outlet-auth";
import { redirect } from "next/navigation";
import { WarrantyClient } from "./warranty-client";

export const dynamic = "force-dynamic";

export default async function WarrantyLookupPage() {
  const currentOutletId = await getCurrentSessionOutlet();

  if (!currentOutletId) {
    redirect("/dashboard");
  }

  return <WarrantyClient outletId={currentOutletId} />;
}
