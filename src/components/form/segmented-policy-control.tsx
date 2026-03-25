"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type NegativeStockPolicy = "BLOCK" | "WARN" | "ALLOW";

interface SegmentedPolicyControlProps {
  value: NegativeStockPolicy;
  onChange: (value: NegativeStockPolicy) => void;
  disabled?: boolean;
}

const POLICY_OPTIONS: Array<{
  value: NegativeStockPolicy;
  label: string;
  description: string;
}> = [
  {
    value: "BLOCK",
    label: "Block",
    description: "Prevents going below zero",
  },
  {
    value: "WARN",
    label: "Warn (default)",
    description: "Shows warning, user can confirm",
  },
  {
    value: "ALLOW",
    label: "Allow",
    description: "No check, stock can go negative",
  },
];

export function SegmentedPolicyControl({
  value,
  onChange,
  disabled,
}: SegmentedPolicyControlProps) {
  return (
    <div className="space-y-4">
      <div className="inline-flex gap-1 rounded-lg border border-slate-200 p-1 bg-slate-50">
        {POLICY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => !disabled && onChange(opt.value)}
            disabled={disabled}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              value === opt.value
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-slate-600">
        Controls what happens when a sale or transfer reduces stock below zero
        at this outlet's warehouse.
      </p>
    </div>
  );
}
