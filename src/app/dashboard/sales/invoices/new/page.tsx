"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Warehouse, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getInventoryLocations } from "@/actions/inventory";
import { handleCreateSalesInvoice, getOutletFIFOSettings } from "@/actions/sales/invoice-form-handler";
import { useOutletStore } from "@/store/use-outlet-store";
import { Button } from "@/components/ui/button";
import { POSInvoiceForm } from "@/components/sales/pos-invoice-form";

function InvoicePageContent() {
  const router = useRouter();
  const { currentOutletId } = useOutletStore();
  const [outlets, setOutlets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fifoEnabled, setFifoEnabled] = useState(false);

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

        // Check if current outlet has FIFO enabled
        const fifoRes = await getOutletFIFOSettings(currentOutletId);
        if (fifoRes.success && fifoRes.data?.fifoEnabled) {
          setFifoEnabled(true);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load outlets";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadOutlets();
  }, [currentOutletId]);

  if (!currentOutletId || currentOutletId === "ALL") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md">
          <Warehouse className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Select a Specific Outlet</h2>
          <p className="text-slate-500 text-sm">
            Please select a specific outlet from the navigation bar to create an invoice.
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
    const result = await handleCreateSalesInvoice(
      formData,
      selectedOutlet?.state,
      selectedOutlet?.state,
    );

    // Show FIFO pricing information if available
    if (result.success && (result.data as any)?.fifoBreakdown) {
      const breakdown = (result.data as any).fifoBreakdown;
      const hasRateChanges = breakdown.some(
        (item: any) => Math.abs(item.userRate - item.fifoRate) > 0.01
      );

      if (hasRateChanges) {
        const message = breakdown
          .map(
            (item: any) =>
              `${item.quantity} units @ ₹${item.fifoRate}/unit (batch FIFO rate)`
          )
          .join(", ");
        toast.info(`Invoice created with FIFO rates: ${message}`, {
          duration: 5000,
        });
      }
    }

    return result;
  };

  return (
    <div className="space-y-4">
      {fifoEnabled && (
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">FIFO batch tracking is enabled</p>
            <p className="text-xs mt-1">
              Item rates will be calculated from your batch costs, not the entered rates.
            </p>
          </div>
        </div>
      )}
      <POSInvoiceForm mode="create" outlets={outlets} onSubmit={handleSubmit} />
    </div>
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
