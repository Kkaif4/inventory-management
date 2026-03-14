"use client";

import { getCustomers } from "@/actions/sales/quotations";
import { getAllVariants } from "@/actions/products";
import { QuotationForm } from "./quotation-form";
import { useOutletStore } from "@/store/use-outlet-store";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NewQuotationPage() {
  const { currentOutletId } = useOutletStore();
  const [data, setData] = useState<{
    customers: any[];
    variants: any[];
  } | null>(null);

  useEffect(() => {
    if (currentOutletId) {
      Promise.all([getCustomers(currentOutletId), getAllVariants()])
        .then(([customerRes, variantRes]) => {
          if (!customerRes.success) throw new Error(customerRes.error?.message);
          if (!variantRes.success) throw new Error(variantRes.error?.message);

          setData({
            customers: customerRes.data!,
            variants: variantRes.data!,
          });
        })
        .catch((err) => {
          toast.error("Failed to initialize quotation: " + err.message);
        });
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

  return <QuotationForm customers={data.customers} variants={data.variants} />;
}
