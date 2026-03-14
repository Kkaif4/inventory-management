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
      getGRNs(currentOutletId).then((res) => {
        if (res.success) {
          setGrns(res.data!);
        } else {
          console.error("Failed to load GRNs:", res.error?.message);
        }
      });
    }
  }, [currentOutletId]);

  return <GRNClient grns={grns} />;
}
