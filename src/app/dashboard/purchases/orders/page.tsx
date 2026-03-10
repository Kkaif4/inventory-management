import { getPurchaseOrders } from "@/actions/procurement";
import { PurchaseOrdersClient } from "./orders-client";

export default async function PurchaseOrdersPage() {
  const orders = await getPurchaseOrders();
  return <PurchaseOrdersClient orders={orders} />;
}
