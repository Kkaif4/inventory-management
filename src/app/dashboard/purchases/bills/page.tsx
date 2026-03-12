"use client";

import { useEffect, useState } from "react";
import { getBills } from "@/actions/procurement";
import { PurchaseBillsClient } from "./bills-client";
import { useOutletStore } from "@/store/use-outlet-store";

export default function BillsPage() {
  const [bills, setBills] = useState<any[]>([]);
  const { currentOutletId } = useOutletStore();

  useEffect(() => {
    if (currentOutletId) {
      getBills(currentOutletId).then(setBills);
    }
  }, [currentOutletId]);

  return <PurchaseBillsClient bills={bills} />;
}
