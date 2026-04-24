/**
 * Batch pricing utilities for FIFO inventory valuation.
 * Handles cost-per-base-unit calculation and selling price derivation.
 */

import { roundToTwo } from "@/lib/utils";

export type BatchPricingResult = {
  costPerBaseUnit: number;
  sellingPricePerBaseUnit: number;
};

/**
 * Calculate cost per base unit and selling price per base unit for a batch.
 * Called at GRN/Purchase time.
 *
 * @param purchaseUnitRate - Original bill rate per purchase unit (e.g., ₹100/Box)
 * @param conversionRatio - Units per base unit (e.g., 10 Pieces per Box)
 * @param pricingMethod - "MARKUP" or "MANUAL"
 * @param markupPercent - Markup % when pricingMethod = "MARKUP"
 * @param variantSellingPrice - Variant's current selling price when pricingMethod = "MANUAL"
 * @returns { costPerBaseUnit, sellingPricePerBaseUnit }
 */
export function calculateBatchPricing(
  purchaseUnitRate: number,
  conversionRatio: number | null | undefined,
  pricingMethod: "MARKUP" | "MANUAL",
  markupPercent: number | null | undefined,
  variantSellingPrice: number | null | undefined,
): BatchPricingResult {
  const ratio = conversionRatio ?? 1;
  if (ratio <= 0) {
    throw new Error(`Invalid conversionRatio: ${ratio}. Must be > 0.`);
  }

  // Step 1: Calculate cost per base unit
  const costPerBaseUnit = roundToTwo(purchaseUnitRate / ratio);

  // Step 2: Calculate selling price per base unit
  let sellingPricePerBaseUnit: number;

  if (
    pricingMethod === "MARKUP" &&
    markupPercent !== null &&
    markupPercent !== undefined
  ) {
    sellingPricePerBaseUnit = roundToTwo(
      costPerBaseUnit * (1 + markupPercent / 100),
    );
  } else {
    // MANUAL: use variant's current selling price, fallback to cost
    sellingPricePerBaseUnit = variantSellingPrice ?? costPerBaseUnit;
  }

  return { costPerBaseUnit, sellingPricePerBaseUnit };
}

/**
 * Generate a deterministic batch number using DocumentSeries for sequencing.
 * Format: {SKU}-{YYYYMMDD}-{sequence padded to 3}
 *
 * @param sku - Variant SKU
 * @param receivedDate - Date batch was received
 * @param sequence - Sequence number (for multiple batches of same SKU on same day)
 * @returns Batch number string
 */
export function formatBatchNumber(
  sku: string,
  receivedDate: Date,
  sequence: number,
): string {
  const datePart = [
    receivedDate.getFullYear(),
    String(receivedDate.getMonth() + 1).padStart(2, "0"),
    String(receivedDate.getDate()).padStart(2, "0"),
  ].join("");

  return `${sku}-${datePart}-${String(sequence).padStart(3, "0")}`;
}
