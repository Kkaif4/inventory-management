"use client";

import { useEffect, useState } from "react";
import { getProformaInvoices } from "@/actions/sales/proforma-invoices";
import { useOutletStore } from "@/store/use-outlet-store";
import { ProformaInvoicesClient } from "./proforma-invoices-client";

export default function ProformaInvoicesPage() {
  const [data, setData] = useState<any[]>([]);
  const { currentOutletId } = useOutletStore();

  useEffect(() => {
    if (currentOutletId) {
      getProformaInvoices(currentOutletId).then(setData);
    }
  }, [currentOutletId]);

  return <ProformaInvoicesClient invoices={data} />;
}
