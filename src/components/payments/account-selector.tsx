"use client";

import { useEffect, useState } from "react";
import {
  ACCOUNT_TYPE_FOR_MODE,
  type PaymentMode,
} from "@/validations/payment.validation";
import { getOutletAccounts } from "@/actions/sales/payment";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Account {
  id: string;
  name: string;
  type?: string | null;
  currentBalance?: number;
  code?: string;
}

interface AccountSelectorProps {
  paymentMode: PaymentMode;
  value: string | null;
  onChange: (accountId: string | null, account?: Account) => void;
  outletId: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
}

export function AccountSelector({
  paymentMode,
  value,
  onChange,
  outletId,
  disabled = false,
  required = true,
  label = "Select Account",
}: AccountSelectorProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAccounts = async () => {
      setLoading(true);
      setError(null);

      try {
        const requiredType = ACCOUNT_TYPE_FOR_MODE[paymentMode];
        const res = await getOutletAccounts(outletId, requiredType as any);

        if (res.success && res.data) {
          setAccounts(res.data);
          if (res.data.length === 0) {
            setError(`No ${requiredType} accounts available`);
          }
        } else {
          setError(res.error?.message ?? "Failed to load accounts");
          setAccounts([]);
        }
      } catch (err: any) {
        setError(err.message ?? "Failed to load accounts");
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, [paymentMode, outletId]);

  const handleSelectAccount = (account: Account) => {
    onChange(account.id, account);
  };

  const selectedAccount = accounts.find((a) => a.id === value);

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-700">
        {label} {required && "*"}
      </label>

      {loading ? (
        <div className="flex items-center justify-center h-10 border border-slate-200 rounded-md bg-slate-50">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="border border-amber-200 rounded-lg bg-amber-50 p-3">
          <p className="text-xs text-amber-600">{error}</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="border border-slate-200 rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">No accounts available</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y">
          {accounts.map((account) => (
            <button
              key={account.id}
              type="button"
              onClick={() => handleSelectAccount(account)}
              disabled={disabled}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors",
                "hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500",
                value === account.id && "bg-blue-50 border-l-2 border-l-blue-500",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {account.name}
                </p>
                {account.currentBalance !== undefined && (
                  <p className="text-xs text-slate-500">
                    Balance: ₹{account.currentBalance.toFixed(2)}
                  </p>
                )}
                {account.code && (
                  <p className="text-xs text-slate-400">{account.code}</p>
                )}
              </div>
              {value === account.id && (
                <div className="ml-2 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

      {selectedAccount && !loading && !error && (
        <div className="text-xs text-slate-500">
          Selected: <span className="font-medium text-slate-700">{selectedAccount.name}</span>
        </div>
      )}
    </div>
  );
}
