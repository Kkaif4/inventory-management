export const dynamic = "force-dynamic";
import { getPNL } from "@/actions/financials/reports";

import { PNLClient } from "./pnl-client";

export default async function PNLPage() {
  const data = await getPNL();
  return <PNLClient data={data} />;
}
