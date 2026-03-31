import { getCurrentSessionOutlet } from "@/lib/outlet-auth";
import { redirect } from "next/navigation";
import { AccountCreateView } from "@/components/accounts/account-create-view";

export default async function CreateAccountPage() {
  const selectedOutlet = await getCurrentSessionOutlet();
  if (!selectedOutlet) {
    redirect("/dashboard");
  }

  return <AccountCreateView outletId={selectedOutlet} />;
}
