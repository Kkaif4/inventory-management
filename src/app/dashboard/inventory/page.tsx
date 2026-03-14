"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { getInventoryMasterData } from "@/actions/inventory";
import { InventoryClient } from "./inventory-client";
import { useOutletStore } from "@/store/use-outlet-store";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const { currentOutletId } = useOutletStore();
  const [masterData, setMasterData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentOutletId) {
      setIsLoading(true);
      getInventoryMasterData(currentOutletId)
        .then((res) => {
          if (res.success) {
            setMasterData(res.data);
          } else {
            toast.error(res.error?.message || "Failed to load master data");
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [currentOutletId]);

  if (status === "loading" || (currentOutletId && isLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  if (!currentOutletId) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-medium">
        No outlet selected. Please select one from the switcher above.
      </div>
    );
  }

  if (!masterData) return null;

  const userId = (session.user as any).id;
  const role = (session.user as any).role || "STAFF";

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Current Stock</h2>
      </div>
      <InventoryClient
        outletId={currentOutletId}
        userId={userId}
        role={role}
        warehouses={masterData.warehouses.map((w: any) => ({
          id: w.id,
          name: w.name,
        }))}
        categories={masterData.categories.map((c: any) => ({
          id: c.id,
          name: c.name,
        }))}
        brands={masterData.brands}
      />
    </div>
  );
}
