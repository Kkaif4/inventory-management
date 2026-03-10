import { getGRNs } from "@/actions/procurement";
import { GRNClient } from "./grn-client";

export default async function GRNPage() {
  const grns = await getGRNs();
  return <GRNClient grns={grns} />;
}
