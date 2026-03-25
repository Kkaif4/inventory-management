"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GSTTypeIndicatorProps {
  outletState?: string;
  placeOfSupply?: string;
  billType: "NO1" | "NO2";
  expandable?: boolean;
  gstRates?: {
    cgstRate?: number;
    sgstRate?: number;
    igstRate?: number;
  };
}

export function GSTTypeIndicator({
  outletState,
  placeOfSupply,
  billType,
  expandable = true,
  gstRates,
}: GSTTypeIndicatorProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Determine GST type
  const isInterState = outletState && placeOfSupply && outletState !== placeOfSupply;
  const isIntraState = outletState && placeOfSupply && outletState === placeOfSupply;
  const isIndeterminate = !outletState || !placeOfSupply;

  // NO.2 bills don't show GST type
  if (billType === "NO2") {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
          No GST (Cash Bill)
        </Badge>
      </div>
    );
  }

  // Indeterminate state
  if (isIndeterminate) {
    return (
      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className="bg-amber-50 text-amber-700 border-amber-200 cursor-not-allowed"
        >
          ⚠ GST Type Cannot Be Determined
        </Badge>
        <p className="text-xs text-amber-700">
          Set Place of Supply to determine GST type
        </p>
      </div>
    );
  }

  // Inter-state (IGST)
  if (isInterState) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => expandable && setIsExpanded(!isExpanded)}
            className={cn(
              "flex items-center gap-2",
              expandable && "cursor-pointer hover:opacity-75"
            )}
          >
            <Badge className="bg-blue-100 text-blue-900 border-blue-200">
              IGST — Inter-state
            </Badge>
            {expandable && (
              <Info className="h-4 w-4 text-blue-600" />
            )}
          </button>
        </div>

        {isExpanded && expandable && (
          <div className="ml-2 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-900">
            <p className="font-medium mb-1">IGST Applicable:</p>
            <p>
              {outletState} (Outlet) → {placeOfSupply} (Place of Supply)
            </p>
            {gstRates?.igstRate && (
              <p className="mt-1 font-mono">
                IGST @ <strong>{gstRates.igstRate}%</strong>
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Intra-state (CGST + SGST)
  if (isIntraState) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => expandable && setIsExpanded(!isExpanded)}
            className={cn(
              "flex items-center gap-2",
              expandable && "cursor-pointer hover:opacity-75"
            )}
          >
            <Badge className="bg-emerald-100 text-emerald-900 border-emerald-200">
              CGST + SGST — Intra-state
            </Badge>
            {expandable && (
              <Info className="h-4 w-4 text-emerald-600" />
            )}
          </button>
        </div>

        {isExpanded && expandable && (
          <div className="ml-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-sm text-emerald-900">
            <p className="font-medium mb-1">CGST + SGST Applicable:</p>
            <p>Within {outletState}</p>
            {gstRates?.cgstRate && gstRates?.sgstRate && (
              <p className="mt-1 font-mono">
                CGST @ <strong>{gstRates.cgstRate}%</strong> + SGST @{" "}
                <strong>{gstRates.sgstRate}%</strong> (Total{" "}
                <strong>{gstRates.cgstRate + gstRates.sgstRate}%</strong>)
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}
