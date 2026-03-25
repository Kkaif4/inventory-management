"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface RoundOffInputProps
  extends Omit<React.ComponentProps<"input">, "onChange" | "type"> {
  value: number;
  onChange: (value: number) => void;
  maxAmount?: number;
  minAmount?: number;
  isPosted?: boolean;
  grandTotal?: number;
}

export function RoundOffInput({
  value,
  onChange,
  maxAmount = 1,
  minAmount = -1,
  isPosted = false,
  grandTotal,
  disabled,
  ...props
}: RoundOffInputProps) {
  const [error, setError] = React.useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;

    if (!inputVal) {
      onChange(0);
      setError("");
      return;
    }

    const numVal = parseFloat(inputVal);

    if (isNaN(numVal)) {
      setError("Must be a number");
      return;
    }

    if (numVal < minAmount || numVal > maxAmount) {
      setError(`Must be between ${minAmount} and ${maxAmount}`);
      return;
    }

    setError("");
    onChange(numVal);
  };

  const adjustByAmount = (amount: number) => {
    const newValue = value + amount;
    if (newValue >= minAmount && newValue <= maxAmount) {
      onChange(newValue);
      setError("");
    }
  };

  const finalTotal = grandTotal ? grandTotal + value : null;

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
          step="0.01"
          min={minAmount}
          max={maxAmount}
          className={cn(
            "font-mono",
            isPosted && "bg-slate-100 cursor-not-allowed",
            error && "border-red-500 focus-visible:ring-red-500/20"
          )}
        />
        <span className="text-sm font-medium text-slate-600">₹</span>
      </div>

      {!isPosted && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => adjustByAmount(-0.5)}
            className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 text-slate-700 transition-colors"
            disabled={value <= minAmount}
          >
            −50p
          </button>
          <button
            type="button"
            onClick={() => adjustByAmount(-0.1)}
            className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 text-slate-700 transition-colors"
            disabled={value <= minAmount}
          >
            −10p
          </button>
          <button
            type="button"
            onClick={() => adjustByAmount(0.1)}
            className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 text-slate-700 transition-colors"
            disabled={value >= maxAmount}
          >
            +10p
          </button>
          <button
            type="button"
            onClick={() => adjustByAmount(0.5)}
            className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 text-slate-700 transition-colors"
            disabled={value >= maxAmount}
          >
            +50p
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          {error}
        </p>
      )}

      {finalTotal !== null && !isPosted && (
        <p className="text-xs text-slate-600">
          Grand Total with round-off: <span className="font-mono font-bold">₹{finalTotal.toFixed(2)}</span>
        </p>
      )}

      {isPosted && (
        <p className="text-xs text-slate-500">Round-off is locked after posting</p>
      )}
    </div>
  );
}
