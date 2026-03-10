import { getCustomers } from "@/actions/sales/quotations";
import { getAllVariants } from "@/actions/products";
import { ProformaInvoiceForm } from "./proforma-form";

export default async function NewProformaPage() {
  const [customers, variants] = await Promise.all([
    getCustomers(),
    getAllVariants(),
  ]);

  return <ProformaInvoiceForm customers={customers} variants={variants} />;
}
