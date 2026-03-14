export const dynamic = "force-dynamic";
import { getPNL } from "@/actions/financials/reports";

import { PNLClient } from "./pnl-client";

export default async function PNLPage() {
  const res = await getPNL();
  if (!res.success || !res.data) {
    return (
      <div>Failed to load Profit & Loss statement: {res.error?.message}</div>
    );
  }
  return <PNLClient data={res.data} />;
}
