import { getWarehouseById } from "@/actions/locations";
import { notFound } from "next/navigation";
import { WarehouseEditClient } from "./edit-client";

export default async function WarehouseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const warehouse = await getWarehouseById(id);

  if (!warehouse) {
    notFound();
  }

  return <WarehouseEditClient warehouse={warehouse} />;
}
