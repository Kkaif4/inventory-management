"use client";

import { useEffect, useState } from "react";
import { getCurrentStock } from "@/actions/inventory";
import { CurrentStockClient } from "./current-stock-client";
import { useOutletStore } from "@/store/use-outlet-store";

export default function CurrentStockPage() {
  const [stocks, setStocks] = useState<any[]>([]);
  const { currentOutletId } = useOutletStore();

  useEffect(() => {
    if (currentOutletId) {
      getCurrentStock(currentOutletId).then(setStocks);
    }
  }, [currentOutletId]);

  return <CurrentStockClient stocks={stocks} />;
}
