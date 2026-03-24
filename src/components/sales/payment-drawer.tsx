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
  PAYMENT_MODES,
  PAYMENT_MODES_REQUIRING_BANK,
  type RecordPaymentFormValues,
} from "@/validations/payment.validation";
import {
  recordInvoicePayment,
  getOutletBankAccounts,
} from "@/actions/sales/payment";

interface PaymentDrawerProps {
  open: boolean;
  onClose: () => void;
  invoice: {
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

export function PaymentDrawer({
  open,
  onClose,
  invoice,
  userId,
  onSuccess,
}: PaymentDrawerProps) {
  const outstanding = Math.max(0, invoice.grandTotal - invoice.totalPaid);
  const [bankAccounts, setBankAccounts] = useState<
    { id: string; name: string; code: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      invoiceId: invoice.id,
      outletId: invoice.outletId,
      partyId: invoice.partyId,
      paymentDate: new Date().toISOString().split("T")[0],
      amount: outstanding,
      paymentMode: "Cash",
      bankAccountId: undefined,
      referenceNo: "",
      notes: "",
    },
  });

  // Reset when invoice changes
  useEffect(() => {
    reset({
      invoiceId: invoice.id,
      outletId: invoice.outletId,
      partyId: invoice.partyId,
      paymentDate: new Date().toISOString().split("T")[0],
      amount: outstanding,
      paymentMode: "Cash",
      bankAccountId: undefined,
      referenceNo: "",
      notes: "",
    });
  }, [invoice.id, outstanding, reset]);

  // Load bank accounts
  useEffect(() => {
    getOutletBankAccounts(invoice.outletId).then((res) => {
      if (res.success && res.data) setBankAccounts(res.data);
    });
  }, [invoice.outletId]);

  const paymentMode = watch("paymentMode");
  const amountInput = watch("amount") ?? 0;
  const remainingAfter = Math.max(0, outstanding - (amountInput || 0));
  const requiresBank = (
    PAYMENT_MODES_REQUIRING_BANK as readonly string[]
  ).includes(paymentMode);

  const onSubmit = async (data: RecordPaymentFormValues) => {
    if (data.amount > outstanding + 0.005) {
      toast.error(
        `Amount cannot exceed outstanding balance of ₹${outstanding.toFixed(2)}`,
      );
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await recordInvoicePayment({ ...data, userId });
      if (res.success && res.data) {
        const { invoiceStatus, remaining, txnNumber } = res.data;
        const statusLabel =
          invoiceStatus === "PAID" ? "Paid" : "Partially Paid";
        toast.success(
          invoiceStatus === "PAID"
            ? `Payment of ₹${data.amount.toFixed(2)} recorded. Invoice ${invoice.txnNumber} is now Paid.`
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
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <DrawerTitle className="text-base font-bold text-slate-900">
                  Record Payment
                </DrawerTitle>
                <p className="text-xs text-slate-500">
                  Invoice: {invoice.txnNumber} &nbsp;|&nbsp; {invoice.partyName}
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
              <span className="text-slate-500">Invoice Total</span>
              <span className="font-bold text-slate-900">
                {fmt(invoice.grandTotal)}
              </span>
            </div>
            {invoice.totalPaid > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Already Paid</span>
                <span className="font-medium text-slate-700">
                  −{fmt(invoice.totalPaid)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1">
              <span className="font-semibold text-slate-700">Outstanding</span>
              <span className="font-bold text-red-600">{fmt(outstanding)}</span>
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
              min={invoice.date}
              className="h-10"
            />
            {errors.paymentDate && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.paymentDate.message}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <Label className="text-xs font-semibold text-slate-700 mb-1">
              Amount Received (₹) *
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
                {fmt(remainingAfter)} will remain outstanding on this invoice.
              </p>
            )}
          </div>

          {/* Payment Mode */}
          <div>
            <Label className="text-xs font-semibold text-slate-700 mb-1">
              Payment Mode *
            </Label>
            <select
              {...register("paymentMode")}
              className="w-full h-10 px-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
            >
              {PAYMENT_MODES.map((m) => (
                <option key={m} value={m}>
                  {m === "BankTransfer" ? "Bank Transfer" : m}
                </option>
              ))}
            </select>
          </div>

          {/* Bank Account — conditional */}
          {requiresBank && (
            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1">
                Bank Account *
              </Label>
              {bankAccounts.length === 0 ? (
                <p className="text-amber-600 text-xs border border-amber-200 rounded-lg bg-amber-50 p-3">
                  No bank accounts configured. Add one in Outlet Settings.
                </p>
              ) : (
                <select
                  {...register("bankAccountId")}
                  className="w-full h-10 px-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                >
                  <option value="">Select bank account...</option>
                  {bankAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.bankAccountId && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.bankAccountId.message}
                </p>
              )}
            </div>
          )}

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

          <DrawerFooter className="px-0 pb-0">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                amountInput > outstanding + 0.005 ||
                !amountInput
              }
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 font-bold text-sm shadow-lg shadow-emerald-100"
            >
              {isSubmitting
                ? "Recording..."
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
