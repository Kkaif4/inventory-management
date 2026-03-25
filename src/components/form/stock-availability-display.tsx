"use client";

import * as React from "react";
import { AlertCircle, TrendingDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockDetail {
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  lastReceived?: string;
}

interface StockAvailabilityDisplayProps {
  availableQty: number;
  requestedQty: number;
  minThreshold?: number;
  policy: "BLOCK" | "WARN" | "ALLOW";
  details?: StockDetail[];
  isLoading?: boolean;
  variant?: "inline" | "card";
}

export function StockAvailabilityDisplay({
  availableQty,
  requestedQty,
  minThreshold = 10,
  policy,
  details = [],
  isLoading = false,
  variant = "inline",
}: StockAvailabilityDisplayProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  // Determine status
  const isOutOfStock = availableQty === 0;
  const isLowStock = availableQty > 0 && availableQty < minThreshold;
  const isExceeded = requestedQty > availableQty;

  // Get status color and icon
  let statusColor: string;
  let statusIcon: React.ReactNode;
  let statusText: string;

  if (isOutOfStock) {
    statusColor = "text-red-700 bg-red-50 border-red-200";
    statusIcon = <AlertCircle className="h-4 w-4" />;
    statusText = "Out of stock";
  } else if (isLowStock) {
    statusColor = "text-amber-700 bg-amber-50 border-amber-200";
    statusIcon = <TrendingDown className="h-4 w-4" />;
    statusText = "Low stock";
  } else {
    statusColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
    statusIcon = <Check className="h-4 w-4" />;
    statusText = "In stock";
  }

  // Determine if there's a conflict
  const hasConflict = isExceeded && policy !== "ALLOW";

  if (isLoading) {
    return (
      <div className="text-sm text-slate-500">
        Loading stock...
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "p-3 rounded-lg border",
          hasConflict
            ? "bg-red-50 border-red-200"
            : statusColor.split(" ").slice(1).join(" ")
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          {hasConflict ? (
            <AlertCircle className="h-4 w-4 text-red-700" />
          ) : (
            statusIcon
          )}
          <span className={cn("text-sm font-medium", hasConflict ? "text-red-700" : statusColor.split(" ")[0])}>
            {hasConflict
              ? `Requested ${requestedQty} but only ${availableQty} available`
              : `${availableQty} ${availableQty === 1 ? "unit" : "units"} available`}
          </span>
        </div>

        {hasConflict && (
          <div className="text-sm text-red-700 mb-2">
            {policy === "BLOCK"
              ? "⛔ Cannot post invoice (insufficient stock)"
              : "⚠ Warning: Insufficient stock"}
          </div>
        )}

        {details && details.length > 0 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-slate-600 hover:text-slate-900 underline"
          >
            {showDetails ? "Hide warehouse details" : "View warehouse details"}
          </button>
        )}

        {showDetails && details.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
            {details.map((detail) => (
              <div key={detail.warehouseId} className="text-xs flex justify-between">
                <span className="font-medium text-slate-900">{detail.warehouseName}</span>
                <span className="text-slate-600">{detail.quantity} units</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Inline variant (default)
  return (
    <div className="flex items-center gap-2 text-xs">
      {hasConflict ? (
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="h-3 w-3" />
          <span className="font-medium">
            {policy === "BLOCK" ? "BLOCKED" : "Low stock"}: {availableQty}/{requestedQty}
          </span>
        </div>
      ) : (
        <div className={cn("flex items-center gap-1 px-2 py-1 rounded-md border", statusColor)}>
          {statusIcon}
          <span className="font-medium">
            {availableQty} {availableQty === 1 ? "unit" : "units"} available
          </span>
        </div>
      )}

      {details && details.length > 0 && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-slate-500 hover:text-slate-700"
          title="Show warehouse breakdown"
        >
          ⓘ
        </button>
      )}

      {showDetails && details.length > 0 && (
        <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-lg p-2 shadow-lg z-10 text-xs whitespace-nowrap">
          {details.map((detail) => (
            <div key={detail.warehouseId} className="text-slate-700 flex gap-2">
              <span className="font-medium">{detail.warehouseName}:</span>
              <span>{detail.quantity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
