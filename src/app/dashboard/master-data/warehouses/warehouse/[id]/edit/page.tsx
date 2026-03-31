export const dynamic = "force-dynamic";
import { getWarehouseById, getOutlets } from "@/actions/warehouses";

import { notFound } from "next/navigation";
import { WarehouseEditClient } from "./edit-client";

export default async function WarehouseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [warehouseRes, outletsRes] = await Promise.all([
    getWarehouseById(id),
    getOutlets(),
  ]);

  if (!warehouseRes.success || !warehouseRes.data) {
    notFound();
  }

  const outlets = outletsRes.data || [];

  return <WarehouseEditClient warehouse={warehouseRes.data} outlets={outlets} />;
}
