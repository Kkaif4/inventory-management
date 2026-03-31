export const dynamic = "force-dynamic";
import { getWarehouseById } from "@/actions/warehouses";
import { notFound } from "next/navigation";
import { WarehouseDetailClient } from "./detail-client";

export default async function WarehouseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getWarehouseById(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return <WarehouseDetailClient warehouse={res.data} />;
}
