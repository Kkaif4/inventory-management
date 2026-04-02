"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Loader2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface POSInvoiceFooterProps {
  form: UseFormReturn<any>;
  billType: string;
  isPosted: boolean;
  isSubmitting: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  onSaveDraft?: () => void;
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  freightCost: number;
  grandTotal: number;
  submitButtonText: string;
  creditLimitExceeded?: boolean;
  isGlobalDiscount: boolean;
  onToggleDiscountMode: () => void;
  notesRef?: React.RefObject<HTMLInputElement | null>;
  paymentFieldArray?: any; // UseFieldArrayReturn
}

export function POSInvoiceFooter({
  form,
  billType,
  isPosted,
  isSubmitting,
  canSubmit,
  onSubmit,
  onCancel,
  onSaveDraft,
  subtotal,
  totalTax,
  totalDiscount,
  freightCost,
  grandTotal,
  submitButtonText,
  creditLimitExceeded = false,
  isGlobalDiscount,
  onToggleDiscountMode,
  notesRef,
  paymentFieldArray,
}: POSInvoiceFooterProps) {
  const t = useTranslations("billing");
  const isNO1 = billType === "NO1";

  return (
    <TooltipProvider>
      <div className="shrink-0 border-t border-slate-200 bg-white">
        {/* Extras row — always visible */}
        {!isPosted && (
          <div className="flex items-center gap-5 px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 flex-wrap">
            {/* Discount mode toggle */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={onToggleDiscountMode}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors shrink-0"
                  />
                }
              >
                {isGlobalDiscount ? (
                  <ToggleRight className="h-5 w-5 text-blue-500" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-slate-400" />
                )}
                <span className="font-medium">
                  {isGlobalDiscount
                    ? t("footer.globalDiscount")
                    : t("footer.rowDiscount")}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {t("tooltips.toggleDiscountMode")}
              </TooltipContent>
            </Tooltip>

            {/* Global discount input (only when global mode) */}
            {isGlobalDiscount && (
              <label
                className="flex items-center gap-2 text-sm text-slate-600"
                title={t("tooltips.globalDiscountInput")}
              >
                {t("footer.billDisc")}
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={form.watch("headerDiscount") || ""}
                  onChange={(e) =>
                    form.setValue(
                      "headerDiscount",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className="h-9 w-24 text-sm font-mono focus:ring-2 focus:ring-blue-500"
                />
              </label>
            )}

            <div className="w-px h-6 bg-slate-200 shrink-0" />

            {/* Freight */}
            <label
              className="flex items-center gap-2 text-sm text-slate-600"
              title={t("tooltips.freightInput")}
            >
              {t("footer.freight")}
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.watch("freightCost") || ""}
                onChange={(e) =>
                  form.setValue(
                    "freightCost",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className="h-9 w-28 text-sm font-mono focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <div className="w-px h-6 bg-slate-200 shrink-0" />

            {/* Notes */}
            <label
              className="flex items-center gap-2 text-sm text-slate-600 flex-1 min-w-[200px]"
              title={t("tooltips.notesInput")}
            >
              {t("footer.notes")}
              <Input
                ref={notesRef}
                type="text"
                value={form.watch("remarks") || ""}
                onChange={(e) => form.setValue("remarks", e.target.value)}
                placeholder={t("footer.remarksPlaceholder")}
                className="h-9 text-sm flex-1 focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        )}

        {/* Payments row for OLD bills */}
        {billType === "OLD" && !isPosted && (
          <div className="px-4 py-3 border-b border-slate-100 bg-indigo-50/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                Historical Payments
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-[10px] font-bold uppercase border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50"
                onClick={() => paymentFieldArray?.append({ amount: 0, paymentDate: new Date().toISOString().split("T")[0], note: "" })}
              >
                + Add Payment Row
              </Button>
            </div>
            
            <div className="space-y-2">
              {paymentFieldArray?.fields.map((field: any, index: number) => (
                <div key={field.id} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-1">
                  <div className="flex-1 max-w-[150px]">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={form.watch(`payments.${index}.amount`) || ""}
                      onChange={(e) => form.setValue(`payments.${index}.amount`, parseFloat(e.target.value) || 0)}
                      className="h-8 text-xs font-mono bg-white border-indigo-100"
                    />
                  </div>
                  <div className="flex-1 max-w-[150px]">
                    <Input
                      type="date"
                      value={form.watch(`payments.${index}.paymentDate`) instanceof Date 
                                ? form.watch(`payments.${index}.paymentDate`).toISOString().split("T")[0]
                                : form.watch(`payments.${index}.paymentDate`) || ""}
                      onChange={(e) => form.setValue(`payments.${index}.paymentDate`, e.target.value)}
                      className="h-8 text-xs bg-white border-indigo-100"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Note (e.g. Cash, Check #...)"
                      value={form.watch(`payments.${index}.note`) || ""}
                      onChange={(e) => form.setValue(`payments.${index}.note`, e.target.value)}
                      className="h-8 text-xs bg-white border-indigo-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => paymentFieldArray?.remove(index)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              {paymentFieldArray?.fields.length === 0 && (
                <p className="text-xs text-slate-500 italic py-2">No payments recorded. Bill will be marked as UNPAID.</p>
              )}
            </div>
          </div>
        )}

        {/* Main footer row */}
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Left controls */}
          <div className="flex items-center gap-3 shrink-0">
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors rounded hover:bg-slate-100"
                  />
                }
              >
                {t("footer.cancel")}
              </TooltipTrigger>
              <TooltipContent>{t("tooltips.cancelInvoice")}</TooltipContent>
            </Tooltip>

            {/* Discount mode badge */}
            <span
              className={cn(
                "text-xs px-2 py-1 rounded font-medium",
                isGlobalDiscount
                  ? "bg-blue-50 text-blue-600"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              {isGlobalDiscount
                ? t("footer.globalDisc")
                : t("footer.rowDisc")}
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Summary values */}
          <div className="flex items-center gap-4 shrink-0">
            <SummaryItem label={t("footer.subtotal")} value={subtotal} />
            {totalDiscount > 0 && (
              <SummaryItem
                label={t("footer.discount")}
                value={-totalDiscount}
                negative
              />
            )}
            {isNO1 && totalTax > 0 && (
              <SummaryItem label={t("footer.tax")} value={totalTax} />
            )}
            {freightCost > 0 && (
              <SummaryItem label={t("footer.freight")} value={freightCost} />
            )}
          </div>

          {/* Grand Total */}
          <div className="w-px h-10 bg-slate-200 shrink-0 mx-3" />
          <div className="shrink-0 mr-4">
            <span className="text-xs text-slate-400 mr-1.5 uppercase tracking-wider font-medium">
              {t("footer.total")}
            </span>
            {billType === "OLD" ? (
              <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2 py-1 focus-within:ring-2 focus-within:ring-indigo-500">
                <span className="text-xl font-black font-mono text-indigo-700">₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.watch("grandTotal") ?? grandTotal.toFixed(2)}
                  onChange={(e) => form.setValue("grandTotal", parseFloat(e.target.value) || 0)}
                  disabled={isPosted}
                  className="w-28 text-xl font-black font-mono bg-transparent outline-none text-indigo-900 border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            ) : (
              <span className="text-2xl font-black font-mono text-slate-900">
                ₹{grandTotal.toFixed(2)}
              </span>
            )}
          </div>

          {/* Credit warning */}
          {creditLimitExceeded && (
            <span className="text-sm text-red-600 font-semibold shrink-0 mr-3">
              {t("footer.creditLimitExceeded")}
            </span>
          )}

          {/* Actions */}
          {!isPosted && (
            <div className="flex items-center gap-2 shrink-0">
              {isNO1 && onSaveDraft && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSaveDraft}
                  disabled={isSubmitting}
                  className="h-10 text-sm font-semibold px-5"
                  title={t("tooltips.saveDraft")}
                >
                  {t("footer.saveDraft")}
                </Button>
              )}
              <Button
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit || isSubmitting || creditLimitExceeded}
                className={cn(
                  "h-10 text-sm font-bold px-6",
                  isNO1
                    ? "bg-slate-900 hover:bg-slate-800"
                    : "bg-amber-600 hover:bg-amber-700",
                )}
                title={t("tooltips.postInvoice")}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {submitButtonText}
              </Button>
            </div>
          )}

          {isPosted && (
            <span className="text-sm text-slate-400 italic">
              {t("footer.invoicePosted")}
            </span>
          )}
        </div>

        {/* Keyboard shortcuts bar */}
        {!isPosted && (
          <div className="px-4 pb-2 flex gap-5 border-t border-slate-100 pt-1.5">
            <Shortcut keys="Ctrl+Enter" action={t("shortcuts.post")} />
            <Shortcut keys="F2" action={t("shortcuts.customer")} />
            <Shortcut keys="F4" action={t("shortcuts.products")} />
            <Shortcut keys="Alt+D" action={t("shortcuts.discMode")} />
            <Shortcut keys="Alt+N" action={t("shortcuts.notesShortcut")} />
            <Shortcut keys="Esc" action={t("shortcuts.clear")} />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

function SummaryItem({
  label,
  value,
  negative,
}: {
  label: string;
  value: number;
  negative?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-1.5 shrink-0">
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      <span
        className={cn(
          "text-sm font-mono font-bold",
          negative ? "text-red-600" : "text-slate-800",
        )}
      >
        {negative ? "−" : ""}₹{Math.abs(value).toFixed(2)}
      </span>
    </div>
  );
}

function Shortcut({ keys, action }: { keys: string; action: string }) {
  return (
    <span className="text-[10px] text-slate-400">
      <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono text-slate-500 mr-0.5">
        {keys}
      </kbd>
      {action}
    </span>
  );
}
