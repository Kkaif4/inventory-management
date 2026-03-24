"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProformaInvoicesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new unified quotations and delivery page
    router.replace("/dashboard/sales/quotations-and-delivery");
  }, [router]);

  return null;
}
