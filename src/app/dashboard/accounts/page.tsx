import { getAccounts, setupCOA } from "@/actions/accounting";
import {
  LayoutGrid,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Settings,
} from "lucide-react";
import Link from "next/link";

export default async function AccountsPage() {
  const accounts = await getAccounts();

  const groups = {
    ASSET: accounts.filter((a) => a.group === "ASSET"),
    LIABILITY: accounts.filter((a) => a.group === "LIABILITY"),
    EQUITY: accounts.filter((a) => a.group === "EQUITY"),
    INCOME: accounts.filter((a) => a.group === "INCOME"),
    EXPENSE: accounts.filter((a) => a.group === "EXPENSE"),
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Chart of Accounts
            </h2>
            <p className="text-sm text-slate-500">
              Manage your financial structure and ledgers.
            </p>
          </div>
        </div>

        {accounts.length === 0 && (
          <form action={setupCOA}>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center text-sm font-medium shadow-sm">
              <Settings className="w-4 h-4 mr-2" />
              Initialize Standard Accounts
            </button>
          </form>
        )}
      </div>

      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">
            No accounts configured
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            You need to initialize the standard chart of accounts before
            recording any financial transactions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          {Object.entries(groups).map(
            ([group, list]) =>
              list.length > 0 && (
                <div
                  key={group}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {group}S
                    </h3>
                    <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full">
                      {list.length}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {list.map((acc) => (
                      <div
                        key={acc.id}
                        className="px-5 py-4 flex items-center justify-between group hover:bg-slate-50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                            {acc.code}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800">
                              {acc.name}
                            </div>
                            {acc.isSystem && (
                              <div className="text-[10px] text-indigo-500 font-medium flex items-center">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> System
                                Account
                              </div>
                            )}
                          </div>
                        </div>
                        <Link
                          href={`/dashboard/accounts/${acc.id}`}
                          className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ),
          )}
        </div>
      )}
    </div>
  );
}
