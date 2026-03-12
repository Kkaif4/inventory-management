"use client";

import { useEffect, useState } from "react";
import { getPurchaseRequests } from "@/actions/purchases/requests";
import { PurchaseRequestsClient } from "./requests-client";
import { useOutletStore } from "@/store/use-outlet-store";

export default function PurchaseRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const { currentOutletId } = useOutletStore();

  useEffect(() => {
    if (currentOutletId) {
      getPurchaseRequests(currentOutletId).then(setRequests);
    }
  }, [currentOutletId]);

  return <PurchaseRequestsClient requests={requests} />;
}
