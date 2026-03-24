import { getSalesInvoices } from "@/actions/sales/sales-invoice";
import { getSalesReturns } from "@/actions/sales/returns";
import { SalesTransactionsClient } from "./sales-transactions-client";
import { redirect } from "next/navigation";
import { getCurrentSessionOutlet } from "@/lib/outlet-auth";

export default async function SalesTransactionsPage() {
  const currentOutletId = await getCurrentSessionOutlet();

  if (!currentOutletId) {
    redirect("/dashboard");
  }

  const [invoices, returns] = await Promise.all([
    getSalesInvoices(currentOutletId),
    getSalesReturns(),
  ]);

  return (
    <SalesTransactionsClient
      invoices={invoices || []}
      returns={returns.data || []}
    />
  );
}
