import { redirect } from "next/navigation";

export default function LowStockPage() {
  redirect("/dashboard/reports/inventory/low-stock-alert");
}
