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

  const accounts = result.data || [];

  return <AccountListView accounts={accounts} />;
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
