import * as React from "react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
}

export function CurrencyDisplay({
  amount,
  size = "md",
  className,
}: CurrencyDisplayProps) {
  const isNegative = amount < 0;

  return (
    <span
      className={cn(
        "font-mono font-medium tabular-nums",
        isNegative ? "text-red-600" : "text-text-primary",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        size === "lg" && "text-lg font-bold",
        className,
      )}
    >
      {formatCurrency(amount)}
    </span>
  );
}
