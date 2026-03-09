"use server";

import { getPartyLedger } from "@/actions/accounting";
import { getParties } from "@/actions/parties";
import {
  BookOpen,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface PartyLedgerPageProps {
  params: { id: string };
}

export default async function PartyLedgerPage({
  params,
}: PartyLedgerPageProps) {
  const parties = await getParties();
  const partyId = (await params).id;
  const party = parties.find((p) => p.id === partyId);

  if (!party) return <div>Party not found</div>;

  const entries = await getPartyLedger(partyId);

  // Calculate Running Balance
  let runningBalance = party.openingBalance || 0;
  const entriesWithBalance = [...entries]
    .reverse()
    .map((entry) => {
      // Standard Accounting: Dr increases balance if ASSET/EXPENSE, Cr increases if LIABILITY/INCOME/EQUITY
      // For Party Ledger (assuming Debtor or Creditor), we treat it from our perspective.
      // If Customer: Dr (Invoice) increases balance (they owe us more), Cr (Payment) decreases it.
      // If Vendor: Cr (Bill) increases balance (we owe them more), Dr (Payment) decreases it.

      // Simplification for ERP viewing:
      // Positive balance = they owe us (Receivable)
      // Negative balance = we owe them (Payable)
      if (party.type === "CUSTOMER") {
        runningBalance += entry.debit - entry.credit;
      } else {
        // Vendor: Credit (Bill) increases our liability.
        // We'll show this such that Credit increases the "Payable" amount.
        runningBalance += entry.credit - entry.debit;
      }
      return { ...entry, runningBalance };
    })
    .reverse();

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/master-data/parties"
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {party.name}'s Ledger
            </h2>
            <p className="text-sm text-slate-500">
              Statement of accounts for {party.type.toLowerCase()}.
            </p>
          </div>
        </div>

        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center space-x-6">
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Opening
            </div>
            <div className="text-sm font-semibold text-slate-700">
              ₹{party.openingBalance.toLocaleString()}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-100"></div>
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Current {party.type === "VENDOR" ? "Payable" : "Receivable"}
            </div>
            <div
              className={`text-lg font-bold ${runningBalance > 0 ? "text-indigo-600" : "text-slate-900"}`}
            >
              ₹{runningBalance.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Reference / Transaction</th>
              <th className="px-4 py-4 text-right">Debit (Dr.)</th>
              <th className="px-4 py-4 text-right">Credit (Cr.)</th>
              <th className="px-6 py-4 text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Opening Balance Row */}
            <tr className="bg-slate-50/50 italic text-slate-500 text-sm">
              <td className="px-6 py-3" colSpan={2}>
                Opening Balance
              </td>
              <td className="px-4 py-3 text-right"></td>
              <td className="px-4 py-3 text-right"></td>
              <td className="px-6 py-3 text-right font-medium">
                ₹{party.openingBalance.toLocaleString()}
              </td>
            </tr>

            {entriesWithBalance.map((entry) => (
              <tr
                key={entry.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900">
                    {entry.transaction?.txnNumber || "Manual Entry"}
                  </div>
                  <div className="text-xs text-slate-500">
                    {entry.reference || entry.account.name}
                  </div>
                </td>
                <td className="px-4 py-4 text-right text-sm font-medium text-indigo-600">
                  {entry.debit > 0 ? `₹${entry.debit.toLocaleString()}` : "-"}
                </td>
                <td className="px-4 py-4 text-right text-sm font-medium text-emerald-600">
                  {entry.credit > 0 ? `₹${entry.credit.toLocaleString()}` : "-"}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                  ₹{entry.runningBalance.toLocaleString()}
                </td>
              </tr>
            ))}

            {entries.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-slate-400 text-sm italic"
                >
                  No transactions found for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
