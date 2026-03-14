export const dynamic = "force-dynamic";
import { getWarehouseById } from "@/actions/locations";

import { notFound } from "next/navigation";
import { WarehouseEditClient } from "./edit-client";

export default async function WarehouseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getWarehouseById(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const warehouse = res.data;

  if (!warehouse) {
    notFound();
  }

  return <WarehouseEditClient warehouse={warehouse} />;
}
