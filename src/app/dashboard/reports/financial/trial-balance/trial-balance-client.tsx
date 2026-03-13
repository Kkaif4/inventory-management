"use client";

import { Scale, Download } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

export default function TrialBalanceClient({ data }: { data: any }) {
  const totalDebit = data.reduce((sum: number, row: any) => sum + row.debit, 0);
  const totalCredit = data.reduce(
    (sum: number, row: any) => sum + row.credit,
    0,
  );

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Account Name",
      cell: ({ row }) => (
        <div className="text-sm font-medium text-slate-900">
          <span className="text-slate-400 font-mono mr-2">
            {row.original.code}
          </span>
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "group",
      header: "Group",
      cell: ({ row }) => (
        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
          {row.original.group}
        </span>
      ),
    },
    {
      accessorKey: "debit",
      header: () => <div className="text-right">Debit (₹)</div>,
      cell: ({ row }) => (
        <div className="text-right text-sm font-semibold text-indigo-600">
          {row.original.debit > 0 ? row.original.debit.toLocaleString() : "-"}
        </div>
      ),
    },
    {
      accessorKey: "credit",
      header: () => <div className="text-right">Credit (₹)</div>,
      cell: ({ row }) => (
        <div className="text-right text-sm font-semibold text-emerald-600">
          {row.original.credit > 0 ? row.original.credit.toLocaleString() : "-"}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Trial Balance</h2>
            <p className="text-sm text-slate-500">
              Summary of all ledger balances.
            </p>
          </div>
        </div>
        <button className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        footerRow={
          <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-900">
            <td className="px-6 py-5" colSpan={2}>
              Grand Total
            </td>
            <td className="px-6 py-5 text-right text-lg underline decoration-double">
              ₹{totalDebit.toLocaleString()}
            </td>
            <td className="px-6 py-5 text-right text-lg underline decoration-double">
              ₹{totalCredit.toLocaleString()}
            </td>
          </tr>
        }
      />

      {Math.abs(totalDebit - totalCredit) > 1 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          Warning: Trial balance is not matching. Please check for manual
          journal entries or orphaned ledger records.
        </div>
      )}
    </div>
  );
}

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
