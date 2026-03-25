"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GSTBreakup {
  rate: number; // 0, 5, 12, 18, 28
  taxable: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
}

interface InvoiceSummaryPanelProps {
  billType: "NO1" | "NO2";
  itemsTotal: number;
  lineDiscount: number; // sum of all line-level discounts
  headerDiscount: number; // header-level discount amount
  subtotal: number; // items total - discounts
  gstBreakup: GSTBreakup[]; // NO.1 only
  totalTax: number;
  freightCost: number;
  roundOff: number;
  grandTotal: number;
  isDraft?: boolean;
  isPosted?: boolean;
  isCredit?: boolean;
  canSubmit: boolean;
  isSubmitting?: boolean;
  onSubmit: () => void;
  onSaveDraft?: () => void;
  creditLimitExceeded?: boolean;
  submitButtonText?: string;
}

export function InvoiceSummaryPanel({
  billType,
  itemsTotal,
  lineDiscount,
  headerDiscount,
  subtotal,
  gstBreakup,
  totalTax,
  freightCost,
  roundOff,
  grandTotal,
  isDraft = false,
  isPosted = false,
  isCredit = true,
  canSubmit,
  isSubmitting = false,
  onSubmit,
  onSaveDraft,
  creditLimitExceeded = false,
  submitButtonText = billType === "NO1" ? "Post Invoice" : "Post Cash Bill",
}: InvoiceSummaryPanelProps) {
  const borderColor =
    billType === "NO1" ? "border-slate-900" : "border-amber-500";
  const buttonColor =
    billType === "NO1"
      ? "bg-slate-900 hover:bg-slate-800"
      : "bg-amber-600 hover:bg-amber-700";

  return (
    <div
      className={cn(
        "sticky top-8 rounded-lg border-t-4 bg-white border border-slate-200 shadow-lg overflow-hidden",
        billType === "NO1" ? "border-t-slate-900" : "border-t-amber-500",
      )}
    >
      {/* Header */}
      <div className="bg-linear-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
          {billType === "NO1" ? "Invoice Summary" : "Cash Bill Summary"}
        </h3>
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        {/* Items Total */}
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Items Total</span>
          <span className="font-mono font-bold text-slate-900">
            ₹{itemsTotal.toFixed(2)}
          </span>
        </div>

        {/* Line Discounts */}
        {lineDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Line Discounts</span>
            <span className="font-mono text-red-700">
              −₹{lineDiscount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Header Discount */}
        {headerDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Header Discount</span>
            <span className="font-mono text-red-700">
              −₹{headerDiscount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Subtotal */}
        {(lineDiscount > 0 || headerDiscount > 0) && (
          <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-mono font-medium text-slate-900">
              ₹{subtotal.toFixed(2)}
            </span>
          </div>
        )}

        {/* GST Breakup (NO.1 only) */}
        {billType === "NO1" && gstBreakup && gstBreakup.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              GST Breakup
            </p>
            {gstBreakup.map((breakup) => (
              <div key={`gst-${breakup.rate}`} className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">GST @ {breakup.rate}%</span>
                  <span className="font-mono text-slate-900">
                    Taxable: ₹{breakup.taxable.toFixed(2)}
                  </span>
                </div>
                {breakup.igst !== undefined ? (
                  <div className="ml-2 flex justify-between text-slate-600">
                    <span>IGST @ {breakup.rate}%</span>
                    <span className="font-mono">
                      ₹{breakup.igst.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <div className="ml-2 space-y-1">
                    {breakup.cgst !== undefined && (
                      <div className="flex justify-between text-slate-600">
                        <span>CGST @ {breakup.rate / 2}%</span>
                        <span className="font-mono">
                          ₹{breakup.cgst.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {breakup.sgst !== undefined && (
                      <div className="flex justify-between text-slate-600">
                        <span>SGST @ {breakup.rate / 2}%</span>
                        <span className="font-mono">
                          ₹{breakup.sgst.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Total Tax */}
        {billType === "NO1" && (
          <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
            <span className="text-slate-600 font-medium">Total Tax</span>
            <span className="font-mono font-bold text-blue-700">
              ₹{totalTax.toFixed(2)}
            </span>
          </div>
        )}

        {/* Freight */}
        {freightCost > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Freight Cost</span>
            <span className="font-mono text-slate-900">
              ₹{freightCost.toFixed(2)}
            </span>
          </div>
        )}

        {/* Round Off */}
        {roundOff !== 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Round Off</span>
            <span
              className={cn(
                "font-mono",
                roundOff > 0 ? "text-emerald-700" : "text-red-700",
              )}
            >
              {roundOff > 0 ? "+" : ""}₹{roundOff.toFixed(2)}
            </span>
          </div>
        )}

        {/* Grand Total */}
        <div className="flex justify-between text-lg pt-4 border-t-2 border-slate-200">
          <span className="font-black uppercase tracking-widest text-slate-900">
            Grand Total
          </span>
          <span className="font-mono font-black text-slate-900">
            ₹{grandTotal.toFixed(2)}
          </span>
        </div>

        {/* Credit Status */}
        {billType === "NO1" && !isCredit && (
          <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 font-medium">
            ✓ Cash Sale (No credit)
          </div>
        )}

        {/* Credit Limit Warning */}
        {creditLimitExceeded && (
          <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 font-medium">
            ⚠ Credit limit would be exceeded
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-2 pt-4">
          <Button
            onClick={onSubmit}
            disabled={!canSubmit || isSubmitting || creditLimitExceeded}
            className={cn("w-full h-12 font-bold", buttonColor)}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitButtonText}
          </Button>

          {!isPosted && billType === "NO1" && onSaveDraft && (
            <Button
              type="button"
              onClick={onSaveDraft}
              disabled={isSubmitting}
              variant="outline"
              className="w-full h-12 font-semibold"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save as Draft
            </Button>
          )}
        </div>

        {/* Helper text */}
        {!canSubmit && (
          <p className="text-xs text-slate-600 text-center pt-2">
            Add items to submit
          </p>
        )}
      </div>
    </div>
  );
}
