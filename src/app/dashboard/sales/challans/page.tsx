export const dynamic = "force-dynamic";
import { getDeliveryChallans } from "@/actions/sales/challans";

import { DeliveryChallansClient } from "./challans-client";

export default async function DeliveryChallansPage() {
  const res = await getDeliveryChallans();
  if (!res.success) {
    throw new Error(res.error?.message || "Failed to load challans");
  }
  const data = res.data!;
  return <DeliveryChallansClient challans={data} />;
}
