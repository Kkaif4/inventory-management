import { getProformaInvoices } from "@/actions/sales/proforma-invoices";
import { ProformaInvoicesClient } from "./proforma-invoices-client";

export default async function ProformaInvoicesPage() {
  const data = await getProformaInvoices();
  return <ProformaInvoicesClient invoices={data} />;
}
