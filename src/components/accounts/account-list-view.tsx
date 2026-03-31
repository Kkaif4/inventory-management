"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Account = {
  id: string;
  name: string;
  type: "CASH" | "BANK";
  openingBalance: number;
  currentBalance: number;
  createdAt: Date | string;
  [key: string]: any;
};

interface AccountListViewProps {
  accounts: Account[];
}

export function AccountListView({ accounts }: AccountListViewProps) {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const cashAccounts = accounts.filter((a) => a.type === "CASH");
  const bankAccounts = accounts.filter((a) => a.type === "BANK");
  const cashBalance = cashAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const bankBalance = bankAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

  const getBalanceColor = (balance: number) => {
    if (balance < 0) return "text-red-600";
    if (balance === 0) return "text-slate-500";
    return "text-emerald-600";
  };

  const getAccountIcon = (type: string) => {
    if (type === "CASH") return "💵";
    return "🏦";
  };

  if (accounts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Accounts
              </h1>
              <p className="text-slate-600 mt-1">Manage cash and bank accounts</p>
            </div>
            <Link href="/dashboard/financials/accounts/new">
              <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                <Plus className="w-4 h-4" />
                New Account
              </Button>
            </Link>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Accounts Yet</h2>
            <p className="text-slate-600 mb-6">
              Create your first account to start tracking cash and bank transactions
            </p>
            <Link href="/dashboard/financials/accounts/new">
              <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                <Plus className="w-4 h-4" />
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Accounts
            </h1>
            <p className="text-slate-600 mt-1">Manage cash and bank accounts</p>
          </div>
          <Link href="/dashboard/financials/accounts/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              <Plus className="w-4 h-4" />
              New Account
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Balance Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-slate-600 text-sm font-medium mb-2">Total Balance</div>
            <div
              className={`text-3xl font-bold mb-2 ${getBalanceColor(totalBalance)}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              ₹{totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500">{accounts.length} accounts</div>
          </div>

          {/* Cash Balance Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-slate-600 text-sm font-medium mb-2">Cash on Hand</div>
            <div
              className={`text-3xl font-bold mb-2 ${getBalanceColor(cashBalance)}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              ₹{cashBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500">{cashAccounts.length} cash accounts</div>
          </div>

          {/* Bank Balance Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-slate-600 text-sm font-medium mb-2">Bank Accounts</div>
            <div
              className={`text-3xl font-bold mb-2 ${getBalanceColor(bankBalance)}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              ₹{bankBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500">{bankAccounts.length} bank accounts</div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700">Account Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700">Type</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700">Opening Balance</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700">Current Balance</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700">Created</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr
                  key={account.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{getAccountIcon(account.type)}</span>
                      {account.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={account.type === "CASH" ? "default" : "secondary"}
                      className={`${
                        account.type === "CASH"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {account.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-700 font-mono text-sm">
                    ₹{account.openingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td
                    className={`px-6 py-4 text-right font-mono font-bold text-sm ${getBalanceColor(
                      account.currentBalance
                    )}`}
                  >
                    ₹{account.currentBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600 text-sm">
                    {typeof account.createdAt === "string"
                      ? new Date(account.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })
                      : (account.createdAt as Date).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/dashboard/financials/accounts/${account.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
