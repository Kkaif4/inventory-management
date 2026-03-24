"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InvoicesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new unified sales transactions page
    router.replace("/dashboard/sales/transactions");
  }, [router]);

  return null;
}
