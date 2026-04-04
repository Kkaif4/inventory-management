import { Suspense } from "react";
import { getOutletAccounts } from "@/actions/accounts";
import { getCurrentSessionOutlet } from "@/lib/outlet-auth";
import { redirect } from "next/navigation";
import { AccountListView } from "@/components/accounts/account-list-view";

async function AccountsContent() {
  const selectedOutlet = await getCurrentSessionOutlet();
  if (!selectedOutlet) {
    redirect("/dashboard");
  }

  const result = await getOutletAccounts(selectedOutlet);

  if (!result.success) {
    throw new Error(result.error?.message || "Failed to load accounts");
  }

  // Filter to only operational accounts (CASH/BANK), exclude GL-only accounts
  const operationalAccounts = (result.data || []).filter(
    (acc) => acc.type === "CASH" || acc.type === "BANK"
  ) as any;

  return <AccountListView accounts={operationalAccounts} />;
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-muted-foreground">Loading accounts...</p>
    </div>
  );
}

export default function AccountsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AccountsContent />
    </Suspense>
  );
}
