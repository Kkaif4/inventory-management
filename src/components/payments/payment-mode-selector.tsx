"use client";

import { PAYMENT_MODES, type PaymentMode } from "@/validations/payment.validation";
import { CreditCard, Banknote, Landmark, Smartphone, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentModeSelectorProps {
  value: PaymentMode;
  onChange: (mode: PaymentMode) => void;
  disabled?: boolean;
  required?: boolean;
}

const MODE_ICONS: Record<PaymentMode, React.ReactNode> = {
  CASH: <Banknote className="w-5 h-5" />,
  UPI: <Smartphone className="w-5 h-5" />,
  CHEQUE: <CreditCard className="w-5 h-5" />,
  ONLINE_TRANSFER: <Landmark className="w-5 h-5" />,
  CARD: <CreditCard className="w-5 h-5" />,
};

const MODE_LABELS: Record<PaymentMode, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CHEQUE: "Cheque",
  ONLINE_TRANSFER: "Bank Transfer",
  CARD: "Card",
};

const MODE_DESCRIPTIONS: Record<PaymentMode, string> = {
  CASH: "Immediate cash payment",
  UPI: "UPI/Mobile payment",
  CHEQUE: "Cheque payment",
  ONLINE_TRANSFER: "Bank transfer (NEFT/RTGS)",
  CARD: "Credit/Debit card payment",
};

export function PaymentModeSelector({
  value,
  onChange,
  disabled = false,
  required = true,
}: PaymentModeSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700">
          Payment Mode {required && "*"}
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {PAYMENT_MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            disabled={disabled}
            className={cn(
              "relative flex items-start gap-3 p-3 rounded-lg border transition-all",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              value === mode
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  value === mode
                    ? "border-blue-500 bg-blue-500"
                    : "border-slate-300"
                )}
              >
                {value === mode && (
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                )}
              </div>
            </div>

            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "text-slate-600",
                  value === mode && "text-blue-600"
                )}>
                  {MODE_ICONS[mode]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {MODE_LABELS[mode]}
                  </p>
                  <p className="text-xs text-slate-500">
                    {MODE_DESCRIPTIONS[mode]}
                  </p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
