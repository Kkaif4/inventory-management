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

  const [requests, orders, bills, returns] = await Promise.all([
    getPurchaseRequests(currentOutletId),
    getPurchaseOrders(currentOutletId),
    getBills(currentOutletId),
    getPurchaseReturns(currentOutletId),
  ]);

  return (
    <PurchasesClient
      requests={requests}
      orders={orders}
      bills={bills}
      returns={returns}
    />
  );
}
