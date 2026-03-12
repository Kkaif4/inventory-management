"use client";

import { useEffect, useState } from "react";
import { getGRNs } from "@/actions/procurement";
import { GRNClient } from "./grn-client";
import { useOutletStore } from "@/store/use-outlet-store";

export default function GRNPage() {
  const [grns, setGrns] = useState<any[]>([]);
  const { currentOutletId } = useOutletStore();

  useEffect(() => {
    if (currentOutletId) {
      getGRNs(currentOutletId).then(setGrns);
    }
  }, [currentOutletId]);

  return <GRNClient grns={grns} />;
}
