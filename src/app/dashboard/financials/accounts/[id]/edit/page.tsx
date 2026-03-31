import { getAccountDetail } from "@/actions/accounts";
import { getCurrentSessionOutlet } from "@/lib/outlet-auth";
import { redirect } from "next/navigation";
import { AccountUpdateView } from "@/components/accounts/account-update-view";

interface EditAccountPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function EditAccountPage({
  params,
}: EditAccountPageProps) {
  // Handle both Promise and direct params (Next.js version compatibility)
  const resolvedParams = params instanceof Promise ? await params : params;
  const accountId = resolvedParams?.id;

  if (!accountId) {
    redirect("/dashboard/financials/accounts");
  }

  const selectedOutlet = await getCurrentSessionOutlet();
  if (!selectedOutlet) {
    redirect("/dashboard");
  }

  const result = await getAccountDetail(accountId, selectedOutlet);

  if (!result.success || !result.data) {
    redirect("/dashboard/financials/accounts");
  }

  const account = result.data;

  return (
    <AccountUpdateView
      accountId={account.id}
      outletId={selectedOutlet}
      accountName={account.name}
      accountType={account.type as "CASH" | "BANK"}
    />
  );
}
