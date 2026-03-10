import { getQuotations } from "@/actions/sales/quotations";
import { QuotationsClient } from "./quotations-client";

export default async function QuotationsPage() {
  const data = await getQuotations();
  return <QuotationsClient quotations={data} />;
}
