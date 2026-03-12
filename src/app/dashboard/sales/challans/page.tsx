export const dynamic = "force-dynamic";
import { getDeliveryChallans } from "@/actions/sales/challans";

import { DeliveryChallansClient } from "./challans-client";

export default async function DeliveryChallansPage() {
  const data = await getDeliveryChallans();
  return <DeliveryChallansClient challans={data} />;
}
