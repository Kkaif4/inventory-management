"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Loader2, ToggleLeft, ToggleRight, X, Banknote, Smartphone, CreditCard, Landmark, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export type No2PaymentMode = "CASH" | "UPI" | "CARD" | "CHEQUE" | "ONLINE_TRANSFER" | "CREDIT";

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
  no2PaymentMode?: No2PaymentMode;
  onNo2PaymentModeChange?: (mode: No2PaymentMode) => void;
}

const NO2_MODES: { mode: No2PaymentMode; label: string; icon: React.ReactNode }[] = [
  { mode: "CASH", label: "Cash", icon: <Banknote className="w-3.5 h-3.5" /> },
  { mode: "UPI", label: "UPI", icon: <Smartphone className="w-3.5 h-3.5" /> },
  { mode: "CARD", label: "Card", icon: <CreditCard className="w-3.5 h-3.5" /> },
  { mode: "CHEQUE", label: "Cheque", icon: <CreditCard className="w-3.5 h-3.5" /> },
  { mode: "ONLINE_TRANSFER", label: "Bank", icon: <Landmark className="w-3.5 h-3.5" /> },
  { mode: "CREDIT", label: "Credit", icon: <Clock className="w-3.5 h-3.5" /> },
];

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
  no2PaymentMode = "CASH",
  onNo2PaymentModeChange,
}: POSInvoiceFooterProps) {
  const t = useTranslations("billing");
  const isNO1 = billType === "NO1";

  // For OLD bills, recalculate all totals from form state to ensure instant updates when items change
  let displaySubtotal = subtotal;
  let displayTotalDiscount = totalDiscount;
  let displayFreight = freightCost;
  let displayGrandTotal = grandTotal;

  if (billType === "OLD") {
    const items = form.watch("items") || [];
    const headerDiscount = form.watch("headerDiscount") || 0;
    const freight = form.watch("freightCost") || 0;
    const formGrandTotal = form.watch("grandTotal");

    const itemsTotal = items.reduce(
      (sum: number, item: any) =>
        sum + (item?.quantity || 0) * (item?.rate || 0),
      0,
    );
    const discountAmount = (itemsTotal * headerDiscount) / 100;
    displaySubtotal = itemsTotal - discountAmount;
    displayTotalDiscount = discountAmount;
    displayFreight = freight;
    displayGrandTotal = displaySubtotal + displayFreight;
  }

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
                  value={form.watch("headerDiscount") ?? ""}
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
                value={form.watch("freightCost") ?? ""}
                onChange={(e) =>
                  form.setValue("freightCost", parseFloat(e.target.value) || 0)
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

        {/* Payment mode row for NO1 (Invoice) and NO2 (Cash Memo) bills */}
        {(billType === "NO1" || billType === "NO2") && !isPosted && (
          <div className="px-4 py-2.5 border-b border-slate-100 bg-amber-50/30 flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-amber-900 shrink-0">Payment Mode</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {NO2_MODES.map(({ mode, label, icon }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onNo2PaymentModeChange?.(mode)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                    no2PaymentMode === mode
                      ? mode === "CREDIT"
                        ? "bg-slate-700 text-white border-slate-700"
                        : "bg-amber-500 text-white border-amber-500"
                      : "bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:bg-amber-50",
                  )}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
            {no2PaymentMode === "CREDIT" && (
              <span className="text-xs text-slate-500 italic">
                Payment will be recorded later from the invoice detail page.
              </span>
            )}
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
                onClick={() =>
                  paymentFieldArray?.append({
                    amount: "",
                    paymentDate: new Date().toISOString().split("T")[0],
                    note: "",
                  })
                }
              >
                + Add Payment Row
              </Button>
            </div>

            <div className="space-y-2">
              {paymentFieldArray?.fields.map((field: any, index: number) => {
                const paymentsErrors = form.formState.errors.payments as any;
                const amountError = paymentsErrors?.[index]?.amount?.message;
                const dateError = paymentsErrors?.[index]?.paymentDate?.message;

                return (
                  <div key={field.id} className="space-y-1">
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-1">
                      <div className="flex-1 max-w-[150px]">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Amount"
                          value={form.watch(`payments.${index}.amount`) || ""}
                          onChange={(e) =>
                            form.setValue(
                              `payments.${index}.amount`,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className={cn(
                            "h-8 text-xs font-mono bg-white border-indigo-100",
                            amountError && "border-red-300 bg-red-50",
                          )}
                        />
                      </div>
                      <div className="flex-1 max-w-[150px]">
                        <Input
                          type="date"
                          value={
                            form.watch(
                              `payments.${index}.paymentDate`,
                            ) instanceof Date
                              ? form
                                  .watch(`payments.${index}.paymentDate`)
                                  .toISOString()
                                  .split("T")[0]
                              : form.watch(`payments.${index}.paymentDate`) ||
                                ""
                          }
                          onChange={(e) =>
                            form.setValue(
                              `payments.${index}.paymentDate`,
                              e.target.value,
                            )
                          }
                          className={cn(
                            "h-8 text-xs bg-white border-indigo-100",
                            dateError && "border-red-300 bg-red-50",
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="Note (e.g. Cash, Check #...)"
                          value={form.watch(`payments.${index}.note`) || ""}
                          onChange={(e) =>
                            form.setValue(
                              `payments.${index}.note`,
                              e.target.value,
                            )
                          }
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
                    {/* Error messages */}
                    {(amountError || dateError) && (
                      <div className="text-xs text-red-600 ml-1 space-y-0.5">
                        {amountError && <p>{amountError}</p>}
                        {dateError && <p>{dateError}</p>}
                      </div>
                    )}
                  </div>
                );
              })}

              {paymentFieldArray?.fields.length === 0 && (
                <p className="text-xs text-slate-500 italic py-2">
                  No payments recorded. Bill will be marked as UNPAID.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Main footer row */}
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Left controls */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              {t("footer.cancel")}
            </Button>

            {/* Discount mode badge */}
            <span
              className={cn(
                "text-xs px-2 py-1 rounded font-medium",
                isGlobalDiscount
                  ? "bg-blue-50 text-blue-600"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              {isGlobalDiscount ? t("footer.globalDisc") : t("footer.rowDisc")}
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Summary values */}
          <div className="flex items-center gap-4 shrink-0">
            <SummaryItem label={t("footer.subtotal")} value={displaySubtotal} />
            {displayTotalDiscount > 0 && (
              <SummaryItem
                label={t("footer.discount")}
                value={-displayTotalDiscount}
                negative
              />
            )}
            {isNO1 && totalTax > 0 && (
              <SummaryItem label={t("footer.tax")} value={totalTax} />
            )}
            {displayFreight > 0 && (
              <SummaryItem label={t("footer.freight")} value={displayFreight} />
            )}
          </div>

          {/* Grand Total */}
          <div className="w-px h-10 bg-slate-200 shrink-0 mx-3" />
          <div className="shrink-0 mr-4">
            <span className="text-xs text-slate-400 mr-1.5 uppercase tracking-wider font-medium">
              {t("footer.total")}
            </span>
            {billType === "OLD" ? (
              <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded px-2 py-1">
                <span className="text-xl font-black font-mono text-indigo-700">
                  ₹
                </span>
                <span className="w-28 text-xl font-black font-mono text-indigo-900 text-right">
                  {displayGrandTotal.toFixed(2)}
                </span>
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
