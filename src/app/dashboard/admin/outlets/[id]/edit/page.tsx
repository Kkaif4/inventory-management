import { getOutletById } from "@/actions/locations";
import { notFound } from "next/navigation";
import { OutletEditClient } from "./edit-client";

export default async function OutletEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const outletRes = await getOutletById(id);

  if (!outletRes.success || !outletRes.data) {
    notFound();
  }

  const outlet = outletRes.data;

  if (!outlet) {
    notFound();
  }

  return <OutletEditClient outlet={outlet} />;
}
