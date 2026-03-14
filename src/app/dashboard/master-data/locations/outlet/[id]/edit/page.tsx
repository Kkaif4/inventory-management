import { getOutletById, getLocations } from "@/actions/locations";
import { notFound } from "next/navigation";
import { OutletEditClient } from "./edit-client";

export default async function OutletEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [outletRes, locationsRes] = await Promise.all([
    getOutletById(id),
    getLocations(),
  ]);

  if (!outletRes.success || !outletRes.data) {
    notFound();
  }

  if (!locationsRes.success) {
    throw new Error(locationsRes.error?.message || "Failed to load locations");
  }

  const outlet = outletRes.data;
  const { warehouses } = locationsRes.data!;

  return <OutletEditClient outlet={outlet} warehouses={warehouses} />;
}
