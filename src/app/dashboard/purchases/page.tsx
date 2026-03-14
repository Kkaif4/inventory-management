import { getPurchaseRequests } from "@/actions/purchases/requests";
import { getPurchaseOrders, getBills } from "@/actions/procurement";
import { getPurchaseReturns } from "@/actions/purchases/returns";
import { PurchasesClient } from "./purchases-client";
import { redirect } from "next/navigation";
import { getCurrentSessionOutlet } from "@/lib/outlet-auth";

export default async function PurchasesPage() {
  const currentOutletId = await getCurrentSessionOutlet();

  if (!currentOutletId) {
    redirect("/dashboard");
  }

  const [resRequests, resOrders, resBills, resReturns] = await Promise.all([
    getPurchaseRequests(currentOutletId),
    getPurchaseOrders(currentOutletId),
    getBills(currentOutletId),
    getPurchaseReturns(currentOutletId),
  ]);

  if (
    !resRequests.success ||
    !resOrders.success ||
    !resBills.success ||
    !resReturns.success
  ) {
    throw new Error("Failed to load purchase data");
  }

  const requests = resRequests.data!;
  const orders = resOrders.data!;
  const bills = resBills.data!;
  const returns = resReturns.data!;

  return (
    <PurchasesClient
      requests={requests}
      orders={orders}
      bills={bills}
      returns={returns}
    />
  );
}
