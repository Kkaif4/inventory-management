import { getPurchaseRequests } from "@/actions/purchases/requests";
import { PurchaseRequestsClient } from "./requests-client";

export default async function PurchaseRequestsPage() {
  const requests = await getPurchaseRequests();
  return <PurchaseRequestsClient requests={requests} />;
}
