"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Warehouse, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getInventoryLocations } from "@/actions/inventory";
import { handleCreateSalesInvoice } from "@/actions/sales/invoice-form-handler";
import { useOutletStore } from "@/store/use-outlet-store";
import { Button } from "@/components/ui/button";
import { InvoiceForm } from "@/components/sales/invoice-form";

function InvoicePageContent() {
  const router = useRouter();
  const { currentOutletId } = useOutletStore();
  const [outlets, setOutlets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentOutletId) {
      setIsLoading(false);
      return;
    }

    const loadOutlets = async () => {
      try {
        const res = await getInventoryLocations(currentOutletId);
        if (!res.success) {
          throw new Error(res.error?.message || "Failed to load outlets");
        }

        const allOutlets = [
          res.data?.currentOutlet,
          ...(res.data?.outlets || []),
        ].filter(Boolean);

        setOutlets(allOutlets);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load outlets";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadOutlets();
  }, [currentOutletId]);

  if (!currentOutletId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md">
          <Warehouse className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Assign Outlet</h2>
          <p className="text-slate-500 text-sm">
            Please select an active outlet from the navigation bar.
          </p>
          <Button
            onClick={() => router.push("/dashboard/sales")}
            variant="outline"
            className="w-full"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-brand animate-spin" />
          <p className="text-slate-600">Loading invoicing system...</p>
        </div>
      </div>
    );
  }

  if (error || outlets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 bg-white p-8 rounded-3xl border border-red-200 shadow-sm max-w-md">
          <Warehouse className="w-12 h-12 text-red-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Failed to Load</h2>
          <p className="text-slate-500 text-sm">
            {error || "No outlets available. Please contact support."}
          </p>
          <Button
            onClick={() => router.push("/dashboard/sales")}
            variant="outline"
            className="w-full"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (formData: any) => {
    const selectedOutlet = outlets.find((o) => o.id === formData.fromOutletId);
    return await handleCreateSalesInvoice(
      formData,
      selectedOutlet?.state,
      selectedOutlet?.state,
    );
  };

  return (
    <InvoiceForm
      mode="create"
      outlets={outlets}
      onSubmit={handleSubmit}
    />
  );
}

export default function NewSalesInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-10 h-10 text-brand animate-spin" />
        </div>
      }
    >
      <InvoicePageContent />
    </Suspense>
  );
}
