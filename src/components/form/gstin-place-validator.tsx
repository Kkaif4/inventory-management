"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GSTINPlaceValidatorProps {
  gstin?: string;
  placeOfSupply?: string;
  className?: string;
}

/**
 * Extract state code from GSTIN (first 2 digits)
 * @param gstin - The GSTIN number
 * @returns State code (first 2 digits) or null
 */
function extractStateFromGSTIN(gstin: string): string | null {
  if (!gstin || gstin.length < 2) return null;
  return gstin.substring(0, 2);
}

/**
 * Map place of supply codes to state codes
 */
const placeOfSupplyMap: Record<string, string> = {
  AP: "28", // Andhra Pradesh
  AR: "12", // Arunachal Pradesh
  AS: "18", // Assam
  BR: "10", // Bihar
  CT: "22", // Chhattisgarh
  GA: "30", // Goa
  GJ: "24", // Gujarat
  HR: "06", // Haryana
  HP: "02", // Himachal Pradesh
  JK: "01", // Jammu & Kashmir
  JH: "20", // Jharkhand
  KA: "29", // Karnataka
  KL: "32", // Kerala
  MP: "23", // Madhya Pradesh
  MH: "27", // Maharashtra
  MN: "14", // Manipur
  ML: "17", // Meghalaya
  MZ: "15", // Mizoram
  NL: "13", // Nagaland
  OR: "21", // Odisha
  PB: "03", // Punjab
  RJ: "08", // Rajasthan
  SK: "11", // Sikkim
  TN: "33", // Tamil Nadu
  TR: "16", // Tripura
  UP: "09", // Uttar Pradesh
  UK: "05", // Uttarakhand
  WB: "19", // West Bengal
};

export function GSTINPlaceValidator({
  gstin,
  placeOfSupply,
  className,
}: GSTINPlaceValidatorProps) {
  if (!gstin || !placeOfSupply) {
    return null;
  }

  const gstinState = extractStateFromGSTIN(gstin);
  const expectedStateCode = placeOfSupplyMap[placeOfSupply];

  if (!gstinState || !expectedStateCode) {
    return null;
  }

  const isValid = gstinState === expectedStateCode;

  return (
    <div
      className={cn(
        "flex items-start gap-2 p-3 rounded-lg border",
        isValid
          ? "bg-emerald-50 border-emerald-200"
          : "bg-amber-50 border-amber-200",
        className,
      )}
    >
      {isValid ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
      )}
      <div className="text-xs">
        {isValid ? (
          <p className="text-emerald-700 font-medium">
            ✓ GSTIN state matches place of supply
          </p>
        ) : (
          <div className="space-y-1">
            <p className="text-amber-700 font-medium">
              ⚠ GSTIN state mismatch
            </p>
            <p className="text-amber-600">
              GSTIN indicates {placeOfSupply} but state code is {gstinState}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
