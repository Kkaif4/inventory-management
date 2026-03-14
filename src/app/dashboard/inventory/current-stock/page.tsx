"use client";

import { useEffect, useState } from "react";
import { getCurrentStock } from "@/actions/inventory";
import { CurrentStockClient } from "./current-stock-client";
import { useOutletStore } from "@/store/use-outlet-store";
import { toast } from "sonner";

export default function CurrentStockPage() {
  const [stocks, setStocks] = useState<any[]>([]);
  const { currentOutletId } = useOutletStore();

  useEffect(() => {
    if (currentOutletId) {
      getCurrentStock(currentOutletId).then((res) => {
        if (res.success) setStocks(res.data!);
        else toast.error("Failed to load current stock");
      });
    }
  }, [currentOutletId]);

  return <CurrentStockClient stocks={stocks} />;
}
