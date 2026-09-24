import { notFound, redirect } from "next/navigation";
import { getSalesInvoice } from "@/actions/sales/sales-invoice";
import { getCurrentSessionOutlet } from "@/lib/outlet-auth";
import { BillPrintView } from "@/components/sales/bill-print-view";

export default async function PrintInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ auto?: string }>;
}) {
  const currentOutletId = await getCurrentSessionOutlet();
  if (!currentOutletId) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const { auto } = await searchParams;

  const invoice = await getSalesInvoice(id);

  if (!invoice) {
    notFound();
  }

  return (
    <BillPrintView
      invoice={invoice}
      autoPrint={auto === "true" || auto === "1"}
    />
  );
}
