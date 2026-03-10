import { getOutletById, getLocations } from "@/actions/locations";
import { notFound } from "next/navigation";
import { OutletEditClient } from "./edit-client";

export default async function OutletEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [outlet, { warehouses }] = await Promise.all([
    getOutletById(id),
    getLocations(),
  ]);

  if (!outlet) {
    notFound();
  }

  return <OutletEditClient outlet={outlet} warehouses={warehouses} />;
}
