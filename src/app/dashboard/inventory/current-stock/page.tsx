import { getCurrentStock } from "@/actions/inventory";
import { CurrentStockClient } from "./current-stock-client";

export default async function CurrentStockPage() {
  const stocks = (await getCurrentStock()) as any[];

  return <CurrentStockClient stocks={stocks} />;
}
