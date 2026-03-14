"use client";

import { getCustomers } from "@/actions/sales/quotations";
import { getAllVariants } from "@/actions/products";
import { ProformaInvoiceForm } from "./proforma-form";
import { useOutletStore } from "@/store/use-outlet-store";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function NewProformaPage() {
  const { currentOutletId } = useOutletStore();
  const [data, setData] = useState<{
    customers: any[];
    variants: any[];
  } | null>(null);

  useEffect(() => {
    if (currentOutletId) {
      Promise.all([getCustomers(currentOutletId), getAllVariants()]).then(
        ([resCustomers, resVariants]) => {
          if (resCustomers.success && resVariants.success) {
            setData({
              customers: resCustomers.data!,
              variants: resVariants.data!,
            });
          } else {
            console.error("Failed to load proforma data:", {
              customers: resCustomers.error?.message,
              variants: resVariants.error?.message,
            });
          }
        },
      );
    }
  }, [currentOutletId]);

  if (!currentOutletId) return null;
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <ProformaInvoiceForm customers={data.customers} variants={data.variants} />
  );
}
