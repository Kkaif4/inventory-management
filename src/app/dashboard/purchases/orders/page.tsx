"use client";

import { useEffect, useState } from "react";
import { getPurchaseOrders } from "@/actions/procurement";
import { PurchaseOrdersClient } from "./orders-client";
import { useOutletStore } from "@/store/use-outlet-store";

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const { currentOutletId } = useOutletStore();

  useEffect(() => {
    if (currentOutletId) {
      getPurchaseOrders(currentOutletId).then(setOrders);
    }
  }, [currentOutletId]);

  return <PurchaseOrdersClient orders={orders} />;
}
