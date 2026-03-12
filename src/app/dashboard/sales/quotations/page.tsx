"use client";

import { useEffect, useState } from "react";
import { getQuotations } from "@/actions/sales/quotations";
import { QuotationsClient } from "./quotations-client";
import { useOutletStore } from "@/store/use-outlet-store";

export default function QuotationsPage() {
  const [data, setData] = useState<any[]>([]);
  const { currentOutletId } = useOutletStore();

  useEffect(() => {
    if (currentOutletId) {
      getQuotations(currentOutletId).then(setData);
    }
  }, [currentOutletId]);

  return <QuotationsClient quotations={data} />;
}
