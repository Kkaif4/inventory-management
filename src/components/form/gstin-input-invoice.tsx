"use client";

/**
 * Invoice-specific GSTIN Input component
 *
 * Similar to the outlet form GSTINInput, but compares GSTIN state
 * against "Place of Supply" instead of a separate state field.
 *
 * Reuses the base GSTINInput logic from @/components/form/gstin-input.tsx
 * For use in invoice forms where GSTIN must match place of supply.
 */

import * as React from "react";
import { GSTINInput } from "@/components/form/gstin-input";

interface GSTINInputInvoiceProps
  extends Omit<React.ComponentProps<typeof GSTINInput>, "selectedState"> {
  placeOfSupply?: string;
}

export function GSTINInputInvoice({
  placeOfSupply,
  ...props
}: GSTINInputInvoiceProps) {
  return <GSTINInput {...props} selectedState={placeOfSupply} />;
}

/**
 * Usage:
 * <GSTINInputInvoice
 *   value={gstin}
 *   onChange={setGstin}
 *   placeOfSupply={placeOfSupply}
 * />
 *
 * Shows 3-state validation:
 * - Green: ✓ Valid GSTIN
 * - Red: ✗ Invalid format
 * - Amber: ⚠ GSTIN state suggests X but Place of Supply is Y
 */
