import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getInventoryMasterData } from "@/actions/inventory";
import { InventoryClient } from "./inventory-client";

export default async function InventoryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const outletId = (session.user as any).outletId;
  const userId = (session.user as any).id;
  const role = (session.user as any).role || "STAFF";

  if (!outletId || !userId) {
    redirect("/dashboard");
  }

  const masterData = await getInventoryMasterData(outletId);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Current Stock</h2>
      </div>
      <InventoryClient
        outletId={outletId}
        userId={userId}
        role={role}
        warehouses={masterData.warehouses.map((w) => ({
          id: w.id,
          name: w.name,
        }))}
        categories={masterData.categories.map((c) => ({
          id: c.id,
          name: c.name,
        }))}
        brands={masterData.brands}
      />
    </div>
  );
}
