import * as React from "react";
import { cn } from "@/lib/utils";

interface QuantityDisplayProps {
  qty: number;
  unit: string;
  minStock?: number;
  className?: string;
}

export function QuantityDisplay({
  qty,
  unit,
  minStock = 0,
  className,
}: QuantityDisplayProps) {
  // Logic:
  // Above min: Green
  // Near min (within 20%): Orange
  // Zero or below: Red

  const isLow = qty > 0 && qty <= minStock * 1.2;
  const isOutOfStock = qty <= 0;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "font-bold tabular-nums",
          isOutOfStock
            ? "text-red-600"
            : isLow
              ? "text-amber-600"
              : "text-green-600",
        )}
      >
        {qty.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
      </span>
      <span className="text-[11px] font-bold text-text-disabled uppercase tracking-tighter self-end mb-0.5">
        {unit}
      </span>
    </div>
  );
}
