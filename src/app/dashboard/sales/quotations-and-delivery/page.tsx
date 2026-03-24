import { getQuotations } from "@/actions/sales/quotations";
import { getProformaInvoices } from "@/actions/sales/proforma-invoices";
import { getDeliveryChallans } from "@/actions/sales/challans";
import { redirect } from "next/navigation";
import { getCurrentSessionOutlet } from "@/lib/outlet-auth";
import { QuotationsAndDeliveryClient } from "./quotations-and-delivery-client";

export default async function QuotationsAndDeliveryPage() {
  const currentOutletId = await getCurrentSessionOutlet();

  if (!currentOutletId) {
    redirect("/dashboard");
  }

  const [resQuotations, resProforma, resChallans] = await Promise.all([
    getQuotations(currentOutletId),
    getProformaInvoices(currentOutletId),
    getDeliveryChallans(),
  ]);

  if (!resQuotations.success || !resProforma.success || !resChallans.success) {
    throw new Error("Failed to load sales data");
  }

  const quotations = resQuotations.data!;
  const proformaInvoices = resProforma.data!;
  const challans = resChallans.data!;

  return (
    <QuotationsAndDeliveryClient
      quotations={quotations}
      proformaInvoices={proformaInvoices}
      challans={challans}
    />
  );
}
