"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreditLimitDisplayProps {
  currentBalance: number;
  creditLimit?: number;
  projectedAmount?: number;
  className?: string;
}

export function CreditLimitDisplay({
  currentBalance,
  creditLimit,
  projectedAmount = 0,
  className,
}: CreditLimitDisplayProps) {
  if (!creditLimit || creditLimit === 0) {
    return (
      <div className={cn("px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-600", className)}>
        ℹ No credit limit set
      </div>
    );
  }

  const totalBalance = currentBalance + projectedAmount;
  const isExceeded = totalBalance > creditLimit;
  const percentage = Math.min(100, (totalBalance / creditLimit) * 100);

  return (
    <div className={cn("space-y-3 p-4 rounded-lg bg-slate-50 border", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-600 uppercase">
          Credit Limit
        </span>
        <span
          className={cn(
            "text-sm font-bold",
            isExceeded ? "text-red-600" : "text-emerald-600",
          )}
        >
          ₹{totalBalance.toLocaleString()} / ₹{creditLimit.toLocaleString()}
        </span>
      </div>

      <Progress
        value={percentage}
        className={cn(
          "h-2",
          isExceeded ? "bg-red-100 [&>div]:bg-red-500" : "bg-emerald-100 [&>div]:bg-emerald-500",
        )}
      />

      {currentBalance > 0 && (
        <p className="text-xs text-slate-600">
          Current balance: ₹{currentBalance.toLocaleString()}
        </p>
      )}

      {isExceeded ? (
        <div className="flex items-start gap-2 p-2 bg-red-50 rounded border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 font-medium">
            Limit exceeded by ₹{(totalBalance - creditLimit).toLocaleString()}
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-2 p-2 bg-emerald-50 rounded border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-700 font-medium">
            Available: ₹{(creditLimit - totalBalance).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
