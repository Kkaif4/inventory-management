import { redirect } from "next/navigation";

export default function FinancialsPnLPage() {
  // Redirect to the new reports location
  redirect("/dashboard/reports/financial/pnl");
}
