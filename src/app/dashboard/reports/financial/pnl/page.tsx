export const dynamic = "force-dynamic";
import { getProfitAndLoss } from "@/actions/reports";

import PNLClient from "./pnlClient";

export default async function PnLPage() {
  const data = await getProfitAndLoss();

  return <PNLClient data={data} />;
}
