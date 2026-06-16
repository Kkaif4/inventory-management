"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Wallet } from "lucide-react";
import {
  recordPaymentSchema,
  ACCOUNT_TYPE_FOR_MODE,
  type RecordPaymentFormValues,
  type PaymentMode,
  PAYMENT_MODES,
} from "@/validations/payment.validation";
import { recordVendorBillPayment, recordVendorBillMultiplePayments } from "@/actions/purchase/payment";
import { getOutletAccounts } from "@/actions/sales/payment";
import { PaymentModeSelector } from "@/components/payments/payment-mode-selector";
import { AccountSelector } from "@/components/payments/account-selector";
import { ModeSpecificFields } from "@/components/payments/mode-specific-fields";
import { cn } from "@/lib/utils";

interface VendorPaymentDrawerProps {
  open: boolean;
  onClose: () => void;
  bill: {
    id: string;
    txnNumber: string;
    grandTotal: number;
    totalPaid: number; // sum of existing payments
    partyId: string;
    partyName: string;
    outletId: string;
    date: string;
  };
  userId: string;
  onSuccess?: () => void;
}

export function VendorPaymentDrawer({
  open,
  onClose,
  bill,
  userId,
  onSuccess,
}: VendorPaymentDrawerProps) {
  const outstanding = Math.max(0, bill.grandTotal - bill.totalPaid);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSplit, setIsSplit] = useState(false);
  const [splitPayments, setSplitPayments] = useState<any[]>([
    { paymentMode: "CASH", bankAccountId: "", amount: outstanding, referenceNo: "", notes: "" }
  ]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RecordPaymentFormValues>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      invoiceId: bill.id,
      outletId: bill.outletId,
      partyId: bill.partyId,
      paymentDate: new Date().toISOString().split("T")[0],
      amount: outstanding,
      paymentMode: "CASH",
      bankAccountId: undefined,
      operationalAccountId: undefined,
      referenceNo: "",
      notes: "",
      chequeNumber: undefined,
      chequeDate: undefined,
      utrReferenceId: undefined,
      transactionId: undefined,
      cardReference: undefined,
    } as any,
  });

  // Reset when bill changes
  useEffect(() => {
    reset({
      invoiceId: bill.id,
      outletId: bill.outletId,
      partyId: bill.partyId,
      paymentDate: new Date().toISOString().split("T")[0],
      amount: outstanding,
      paymentMode: "CASH",
      bankAccountId: undefined,
      operationalAccountId: undefined,
      referenceNo: "",
      notes: "",
      chequeNumber: undefined,
      chequeDate: undefined,
      utrReferenceId: undefined,
      transactionId: undefined,
      cardReference: undefined,
    } as any);
    setIsSplit(false);
    setSplitPayments([
      { paymentMode: "CASH", bankAccountId: "", amount: outstanding, referenceNo: "", notes: "" }
    ]);
  }, [bill.id, outstanding, reset]);


  const paymentMode = watch("paymentMode") as any;
  const amountInput = watch("amount") ?? 0;
  const remainingAfter = Math.max(0, outstanding - (amountInput || 0));
  const requiresBank =
    paymentMode &&
    ACCOUNT_TYPE_FOR_MODE[paymentMode as keyof typeof ACCOUNT_TYPE_FOR_MODE] === "BANK";

  // Clear mode-specific fields when payment mode changes
  useEffect(() => {
    if (paymentMode !== "CHEQUE") {
      setValue("chequeNumber", undefined);
      setValue("chequeDate", undefined);
    }
    if (paymentMode !== "UPI") {
      setValue("utrReferenceId", undefined);
    }
    if (paymentMode !== "ONLINE_TRANSFER") {
      setValue("transactionId", undefined);
    }
    if (paymentMode !== "CARD") {
      setValue("cardReference", undefined);
    }
    // Clear bank account when switching from bank mode to CASH
    if (!requiresBank && paymentMode === "CASH") {
      setValue("bankAccountId", undefined);
    }
  }, [paymentMode, requiresBank, setValue]);

  const onSubmit = async (data: RecordPaymentFormValues) => {
    if (isSplit) {
      const totalEntered = splitPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      if (totalEntered <= 0) {
        toast.error("Total payment amount must be greater than ₹0");
        return;
      }
      if (totalEntered > outstanding + 0.005) {
        toast.error(`Total amount cannot exceed outstanding balance of ₹${outstanding.toFixed(2)}`);
        return;
      }

      // Check required fields
      for (let i = 0; i < splitPayments.length; i++) {
        const p = splitPayments[i];
        if (!p.amount || p.amount <= 0) {
          toast.error(`Row ${i + 1}: Amount must be greater than ₹0`);
          return;
        }
        if (!p.bankAccountId) {
          toast.error(`Row ${i + 1}: Account selection is required`);
          return;
        }
      }

      try {
        setIsSubmitting(true);
        const res = await recordVendorBillMultiplePayments({
          invoiceId: bill.id,
          outletId: bill.outletId,
          partyId: bill.partyId,
          paymentDate: data.paymentDate,
          payments: splitPayments.map(p => ({
            paymentMode: p.paymentMode,
            bankAccountId: p.bankAccountId,
            amount: p.amount,
            referenceNo: p.referenceNo || null,
            notes: p.notes || null,
            chequeNumber: p.chequeNumber || null,
            chequeDate: p.chequeDate || null,
          })),
          userId,
        });

        if (res.success && res.data) {
          const { billStatus, remaining } = res.data;
          toast.success(
            billStatus === "PAID"
              ? `Payments totalling ₹${totalEntered.toFixed(2)} recorded. Bill ${bill.txnNumber} is now Paid.`
              : `Payments totalling ₹${totalEntered.toFixed(2)} recorded. ₹${remaining.toFixed(2)} still outstanding.`
          );
          onClose();
          onSuccess?.();
        } else {
          toast.error(res.error?.message ?? "Failed to record payments.");
        }
      } catch (e: any) {
        toast.error(e.message ?? "Unexpected error.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (data.amount > outstanding + 0.005) {
      toast.error(
        `Amount cannot exceed outstanding balance of ₹${outstanding.toFixed(2)}`,
      );
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await recordVendorBillPayment({ ...data, userId });
      if (res.success && res.data) {
        const { billStatus, remaining, txnNumber } = res.data;
        const statusLabel =
          billStatus === "PAID" ? "Paid" : "Partially Paid";
        toast.success(
          billStatus === "PAID"
            ? `Payment of ₹${data.amount.toFixed(2)} recorded. Bill ${bill.txnNumber} is now Paid.`
            : `Partial payment of ₹${data.amount.toFixed(2)} recorded. ₹${remaining.toFixed(2)} still outstanding.`,
        );
        onClose();
        onSuccess?.();
      } else {
        toast.error(res.error?.message ?? "Failed to record payment.");
      }
    } catch (e: any) {
      toast.error(e.message ?? "Unexpected error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(n);

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} direction="right">
      <DrawerContent className="!w-[480px] !max-w-full h-full flex flex-col overflow-y-auto">
        <DrawerHeader className="border-b border-slate-100 pb-4 px-6 pt-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <DrawerTitle className="text-base font-bold text-slate-900">
                  Make Payment
                </DrawerTitle>
                <p className="text-xs text-slate-500">
                  Bill: {bill.txnNumber} &nbsp;|&nbsp; {bill.partyName}
                </p>
              </div>
            </div>
            <DrawerClose asChild>
              <button className="text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </DrawerClose>
          </div>

          {/* Summary block */}
          <div className="mt-4 bg-slate-50 rounded-xl p-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Bill Total</span>
              <span className="font-bold text-slate-900">
                {fmt(bill.grandTotal)}
              </span>
            </div>
            {bill.totalPaid > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Already Paid</span>
                <span className="font-medium text-slate-700">
                  −{fmt(bill.totalPaid)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1">
              <span className="font-semibold text-slate-700">Outstanding</span>
              <span className="font-bold text-amber-600">{fmt(outstanding)}</span>
            </div>
          </div>
        </DrawerHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {/* Payment Date */}
          <div>
            <Label className="text-xs font-semibold text-slate-700 mb-1">
              Payment Date *
            </Label>
            <Input
              type="date"
              {...register("paymentDate")}
              min={bill.date}
              className="h-10"
            />
            {errors.paymentDate && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.paymentDate.message}
              </p>
            )}
          </div>

          {/* Split Payment Toggle */}
          <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-800">Split / Multi-Payment</span>
              <span className="text-[10px] text-slate-500">Pay using multiple modes (Cash, UPI, etc.)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSplit(!isSplit);
                setSplitPayments([
                  { paymentMode: "CASH", bankAccountId: "", amount: outstanding, referenceNo: "", notes: "" }
                ]);
              }}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                isSplit ? "bg-amber-600" : "bg-slate-200"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  isSplit ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {isSplit ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Split Payment Details</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px] font-bold border-slate-200 text-slate-700 bg-white hover:bg-slate-55 rounded-lg shadow-sm"
                  onClick={() =>
                    setSplitPayments([
                      ...splitPayments,
                      { paymentMode: "CASH", bankAccountId: "", amount: 0, referenceNo: "", notes: "" }
                    ])
                  }
                >
                  + Add Mode
                </Button>
              </div>

              <div className="space-y-3.5">
                {splitPayments.map((field: any, index: number) => {
                  const rowMode = field.paymentMode;

                  return (
                    <div key={index} className="p-3 border border-slate-200 rounded-xl bg-white space-y-2.5 shadow-sm transition-all hover:shadow-md animate-in fade-in slide-in-from-left-1">
                      <div className="flex items-center gap-2">
                        {/* Payment Mode Selector */}
                        <div className="w-[110px] shrink-0">
                          <select
                            value={rowMode}
                            onChange={(e) => {
                              const updated = [...splitPayments];
                              updated[index].paymentMode = e.target.value;
                              updated[index].bankAccountId = ""; // reset account
                              setSplitPayments(updated);
                            }}
                            className="w-full h-9 text-xs border border-slate-200 rounded-lg px-2 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none bg-slate-50 font-medium transition-all"
                          >
                            <option value="CASH">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="CARD">Card</option>
                            <option value="CHEQUE">Cheque</option>
                            <option value="ONLINE_TRANSFER">Bank</option>
                          </select>
                        </div>

                        {/* Bank Account Selector */}
                        <div className="flex-1 min-w-[120px]">
                          <CompactAccountSelector
                            paymentMode={rowMode}
                            outletId={bill.outletId}
                            value={field.bankAccountId}
                            onChange={(accountId) => {
                              const updated = [...splitPayments];
                              updated[index].bankAccountId = accountId;
                              setSplitPayments(updated);
                            }}
                            className="h-9 text-xs rounded-lg bg-slate-50"
                          />
                        </div>

                        {/* Amount */}
                        <div className="w-[90px] shrink-0">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Amount"
                            value={field.amount || ""}
                            onChange={(e) => {
                              const updated = [...splitPayments];
                              updated[index].amount = parseFloat(e.target.value) || 0;
                              setSplitPayments(updated);
                            }}
                            className="h-9 text-xs font-mono border-slate-200 rounded-lg"
                          />
                        </div>

                        {/* Remove Row Button */}
                        {splitPayments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = splitPayments.filter((_, i) => i !== index);
                              setSplitPayments(updated);
                            }}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1 shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Reference No */}
                      <div>
                        <Input
                          placeholder="Reference / UTR / Cheque No."
                          value={field.referenceNo || ""}
                          onChange={(e) => {
                            const updated = [...splitPayments];
                            updated[index].referenceNo = e.target.value;
                            setSplitPayments(updated);
                          }}
                          className="h-9 text-xs border-slate-200 rounded-lg"
                        />
                      </div>

                      {/* Mode Specific Additional Fields */}
                      {rowMode === "CHEQUE" && (
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <Input
                              placeholder="Cheque Number"
                              value={field.chequeNumber || ""}
                              onChange={(e) => {
                                const updated = [...splitPayments];
                                updated[index].chequeNumber = e.target.value;
                                setSplitPayments(updated);
                              }}
                              className="h-9 text-xs border-slate-200 rounded-lg"
                            />
                          </div>
                          <div>
                            <Input
                              type="date"
                              placeholder="Cheque Date"
                              value={field.chequeDate || ""}
                              onChange={(e) => {
                                const updated = [...splitPayments];
                                updated[index].chequeDate = e.target.value;
                                setSplitPayments(updated);
                              }}
                              className="h-9 text-xs border-slate-200 rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Summary match check */}
              {(() => {
                const totalEntered = splitPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                const isMatch = Math.abs(totalEntered - outstanding) < 0.01;
                return (
                  <div className="flex justify-between items-center text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500">Total Entered:</span>
                    <span className={cn(isMatch ? "text-emerald-600 font-bold" : "text-amber-600 font-bold")}>
                      ₹{totalEntered.toFixed(2)} / ₹{outstanding.toFixed(2)}
                      {!isMatch && ` (Remaining: ₹${(outstanding - totalEntered).toFixed(2)})`}
                    </span>
                  </div>
                );
              })()}
            </div>
          ) : (
            <>
              {/* Amount */}
              <div>
                <Label className="text-xs font-semibold text-slate-700 mb-1">
                  Amount to Pay (₹) *
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={outstanding}
                  className={`h-10 font-bold ${
                    amountInput > outstanding + 0.005
                      ? "border-red-400 focus-visible:ring-red-300"
                      : ""
                  }`}
                  {...register("amount", { valueAsNumber: true })}
                />
                {amountInput > outstanding + 0.005 && (
                  <p className="text-red-500 text-[10px] mt-1">
                    Amount cannot exceed the outstanding balance of{" "}
                    {fmt(outstanding)}.
                  </p>
                )}
                {errors.amount && (
                  <p className="text-red-500 text-[10px] mt-1">
                    {errors.amount.message}
                  </p>
                )}

                {/* Live preview */}
                <div className="mt-3 border border-slate-100 rounded-xl p-3 space-y-1 text-xs bg-slate-50">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Paying Now</span>
                    <span className="font-bold text-slate-900">
                      {fmt(amountInput || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Remaining After</span>
                    <span
                      className={`font-bold ${remainingAfter > 0 ? "text-amber-600" : "text-emerald-600"}`}
                    >
                      {fmt(remainingAfter)}
                    </span>
                  </div>
                </div>
                {remainingAfter > 0 && amountInput > 0 && (
                  <p className="text-amber-600 text-[10px] mt-1.5">
                    {fmt(remainingAfter)} will remain outstanding on this bill.
                  </p>
                )}
              </div>

              {/* Payment Mode Selector */}
              <PaymentModeSelector
                value={paymentMode}
                onChange={(mode) => setValue("paymentMode", mode)}
                disabled={false}
                required={true}
              />

              {/* Account Selection — required for all payment modes */}
              {paymentMode && (
                <AccountSelector
                  paymentMode={paymentMode}
                  value={watch("bankAccountId") || null}
                  onChange={(accountId) => setValue("bankAccountId", accountId)}
                  outletId={bill.outletId}
                  disabled={false}
                  required={true}
                  label="Account"
                />
              )}

              {/* Mode-Specific Fields */}
              <ModeSpecificFields
                paymentMode={paymentMode}
                form={{ register }}
                errors={errors}
              />

              {/* Reference No */}
              <div>
                <Label className="text-xs font-semibold text-slate-700 mb-1">
                  Reference No.{" "}
                  <span className="text-slate-400 font-normal">
                    (UTR / Cheque / UPI ID)
                  </span>
                </Label>
                <Input
                  {...register("referenceNo")}
                  maxLength={60}
                  placeholder="Optional — max 60 chars"
                  className="h-10"
                />
              </div>

              {/* Notes */}
              <div>
                <Label className="text-xs font-semibold text-slate-700 mb-1">
                  Internal Notes{" "}
                  <span className="text-slate-400 font-normal">(not printed)</span>
                </Label>
                <textarea
                  {...register("notes")}
                  maxLength={200}
                  rows={2}
                  placeholder="Internal note — max 200 chars"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </>
          )}

          <DrawerFooter className="px-0 pb-0">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                (!isSplit && (amountInput > outstanding + 0.005 || !amountInput)) ||
                (isSplit && (splitPayments.reduce((s, p) => s + (p.amount || 0), 0) > outstanding + 0.005 || splitPayments.reduce((s, p) => s + (p.amount || 0), 0) <= 0))
              }
              className="w-full h-12 bg-amber-600 hover:bg-amber-700 font-bold text-sm shadow-lg shadow-amber-100"
            >
              {isSubmitting
                ? "Recording..."
                : isSplit
                  ? `Confirm Payment of ${fmt(splitPayments.reduce((s, p) => s + (p.amount || 0), 0))}`
                  : `Confirm Payment of ${fmt(amountInput || 0)}`}
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" className="w-full" type="button">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}

function CompactAccountSelector({
  paymentMode,
  outletId,
  value,
  onChange,
  className,
}: {
  paymentMode: string;
  outletId: string;
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!outletId) return;
    const load = async () => {
      setLoading(true);
      const reqType = ACCOUNT_TYPE_FOR_MODE[paymentMode as PaymentMode];
      if (!reqType) {
        setAccounts([]);
        setLoading(false);
        return;
      }
      const res = await getOutletAccounts(outletId, reqType as any);
      if (res.success && res.data) {
        setAccounts(res.data);
      } else {
        setAccounts([]);
      }
      setLoading(false);
    };
    load();
  }, [paymentMode, outletId]);

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
      className={cn(
        "w-full h-10 border border-slate-300 rounded-md px-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white",
        className
      )}
    >
      <option value="">Select Account</option>
      {accounts.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name}
        </option>
      ))}
    </select>
  );
}
