import { getCustomerLedger } from "@/actions/sales/customers";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PageProps {
  params: { id: string };
  searchParams: { from?: string; to?: string };
}

export default async function CustomerLedgerPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { from, to } = await searchParams;
  const result = await getCustomerLedger(id, from as string, to as string);

  if (!result.success || !result.data) {
    notFound();
  }

  const {
    party,
    entries,
    openingBalance,
    periodTotalDebit,
    periodTotalCredit,
    closingBalance,
  } = result.data;

  // We enforce proper DR / CR rules locally to keep it readable
  // Positive balance -> DEBIT (Customer owes us)
  // Negative balance -> CREDIT (We owe customer)

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <PageHeader
        title="Customer Ledger"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Customers", href: "/dashboard/sales/customers" },
          {
            label: party.name,
            href: `/dashboard/sales/customers/${id}`,
          },
          { label: "Ledger" },
        ]}
      />

      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{party.name}</h2>
            <p className="text-slate-500 text-sm mt-1">Account Statement</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Closing Balance</div>
            <div
              className={`text-2xl font-bold ${closingBalance > 0 ? "text-amber-700" : closingBalance < 0 ? "text-emerald-600" : "text-slate-900"}`}
            >
              {formatCurrency(Math.abs(closingBalance))}{" "}
              {closingBalance > 0 ? "Dr" : closingBalance < 0 ? "Cr" : ""}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right text-amber-700">
                  Debit (₹)
                </TableHead>
                <TableHead className="text-right text-emerald-700">
                  Credit (₹)
                </TableHead>
                <TableHead className="text-right font-bold">
                  Balance (₹)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-slate-50/50">
                <TableCell
                  colSpan={3}
                  className="font-semibold px-4 text-slate-500"
                >
                  Opening Balance
                </TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right font-bold w-[140px]">
                  {formatCurrency(Math.abs(openingBalance))}{" "}
                  {openingBalance > 0 ? "Dr" : openingBalance < 0 ? "Cr" : ""}
                </TableCell>
              </TableRow>

              {entries.map((entry: any) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(entry.date)}
                  </TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {entry.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-amber-700">
                    {entry.debit > 0 ? formatCurrency(entry.debit) : ""}
                  </TableCell>
                  <TableCell className="text-right text-emerald-700">
                    {entry.credit > 0 ? formatCurrency(entry.credit) : ""}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(Math.abs(entry.balance))}{" "}
                    {entry.balance > 0 ? "Dr" : entry.balance < 0 ? "Cr" : ""}
                  </TableCell>
                </TableRow>
              ))}

              <TableRow className="bg-slate-50 border-t-2 border-slate-200">
                <TableCell colSpan={3} className="font-bold px-4 text-right">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold text-amber-700">
                  {formatCurrency(periodTotalDebit)}
                </TableCell>
                <TableCell className="text-right font-bold text-emerald-700">
                  {formatCurrency(periodTotalCredit)}
                </TableCell>
                <TableCell className="text-right font-bold text-slate-900">
                  {formatCurrency(Math.abs(closingBalance))}{" "}
                  {closingBalance > 0 ? "Dr" : closingBalance < 0 ? "Cr" : ""}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
