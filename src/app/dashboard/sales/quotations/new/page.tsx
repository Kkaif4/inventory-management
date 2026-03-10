import { getCustomers } from "@/actions/sales/quotations";
import { getAllVariants } from "@/actions/products";
import { QuotationForm } from "./quotation-form";

export default async function NewQuotationPage() {
  const [customers, variants] = await Promise.all([
    getCustomers(),
    getAllVariants(),
  ]);

  return <QuotationForm customers={customers} variants={variants} />;
}
