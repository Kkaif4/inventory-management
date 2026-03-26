"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type DiscountType = "line" | "header";

interface DiscountInputProps extends Omit<
  React.ComponentProps<"input">,
  "onChange" | "type"
> {
  value: number;
  onChange: (value: number) => void;
  type: DiscountType;
  baseAmount: number; // subtotal or line amount
  costPrice?: number; // for warning when rate falls below cost
  maxDiscount?: number; // max allowed discount % per user role
  isPosted?: boolean;
  compact?: boolean;
}

export function DiscountInput({
  value,
  onChange,
  type,
  baseAmount,
  costPrice,
  maxDiscount,
  isPosted = false,
  compact = false,
  disabled,
  ...props
}: DiscountInputProps) {
  const [error, setError] = React.useState<string>("");
  const [showWarning, setShowWarning] = React.useState(false);

  const discountAmount = (baseAmount * value) / 100 || 0;
  const finalAmount = baseAmount - discountAmount;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;

    if (!inputVal) {
      onChange(0);
      setError("");
      setShowWarning(false);
      return;
    }

    const numVal = parseFloat(inputVal);

    if (isNaN(numVal)) {
      setError("Must be a number");
      return;
    }

    if (numVal < 0 || numVal > 100) {
      setError("Discount must be between 0 and 100");
      return;
    }

    if (maxDiscount && numVal > maxDiscount) {
      setError(`Maximum discount allowed: ${maxDiscount}%`);
      return;
    }

    setError("");

    // Check if this would make final amount below cost price
    if (costPrice && finalAmount < costPrice) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }

    onChange(numVal);
  };

  if (compact) {
    return (
      <Input
        {...props}
        type="number"
        value={value || ""}
        onChange={handleChange}
        disabled={disabled || isPosted}
        placeholder="0"
        min="0"
        max="100"
        step="0.01"
        className={cn(
          "h-7 text-xs font-mono",
          isPosted && "bg-slate-100 cursor-not-allowed",
          error && "border-red-500 focus-visible:ring-red-500/20",
        )}
      />
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          {...props}
          type="number"
          value={value || ""}
          onChange={handleChange}
          disabled={disabled || isPosted}
          placeholder="0"
          min="0"
          max="100"
          step="0.01"
          className={cn(
            "font-mono",
            isPosted && "bg-slate-100 cursor-not-allowed",
            error && "border-red-500 focus-visible:ring-red-500/20",
          )}
        />
        <span className="text-sm font-medium text-slate-600">%</span>
      </div>

      {/* Quick buttons */}
      {!isPosted && (
        <div className="flex items-center gap-1">
          {[5, 10, 15, 20].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => onChange(pct)}
              className={cn(
                "px-2 py-1 text-xs rounded border transition-colors",
                value === pct
                  ? "bg-emerald-100 border-emerald-300 text-emerald-900 font-medium"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700",
              )}
            >
              {pct}%
            </button>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          {error}
        </p>
      )}

      {/* Cost price warning */}
      {showWarning && costPrice && (
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Below cost price</p>
            <p>
              Final amount (₹{finalAmount.toFixed(2)}) is below cost price (₹
              {costPrice.toFixed(2)}). This transaction will have negative
              margin.
            </p>
          </div>
        </div>
      )}

      {/* Read-only state */}
      {isPosted && (
        <p className="text-xs text-slate-500">
          Discount is locked after posting
        </p>
      )}
    </div>
  );
}
