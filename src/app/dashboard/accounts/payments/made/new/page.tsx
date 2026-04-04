"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createPayment, getAccounts } from "@/actions/accounting";
import { getParties } from "@/actions/parties";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PaymentModeSelector } from "@/components/accounts/payment-mode-selector";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useOutletStore } from "@/store/use-outlet-store";
import {
  generalPaymentSchema,
  GeneralPaymentFormValues,
} from "@/validations/payment.validation";
import { PaymentMode } from "@/generated/prisma";
import { getTodayDate } from "@/lib/utils/date";

function NewPaymentMadeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const { currentOutletId } = useOutletStore();

  const partyIdFromUrl = searchParams.get("partyId");
  const source = searchParams.get("source");
  const sourceId = searchParams.get("sourceId");
  const sourceName = searchParams.get("sourceName");

  useEffect(() => {
    if (!currentOutletId) return;
    getParties(currentOutletId).then((res) => {
      if (res.success) {
        setVendors(res.data!.filter((p) => p.type === "VENDOR"));
      } else {
        toast.error("Failed to load vendors: " + res.error?.message);
      }
    });
    getAccounts(currentOutletId).then((res) => {
      if (res.success) {
        setAccounts(res.data!.filter((a) => a.group === "ASSET"));
      } else {
        toast.error("Failed to load accounts: " + res.error?.message);
      }
    }); // Only banks/cash
  }, [currentOutletId]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GeneralPaymentFormValues>({
    resolver: zodResolver(generalPaymentSchema) as any,
    defaultValues: {
      partyId: partyIdFromUrl || "",
      paymentDate: getTodayDate(),
      amount: undefined,
      paymentMode: undefined,
      bankAccountId: "",
      chequeDate: undefined,
      chequeNumber: undefined,
    },
  });

  const selectedAccountId = watch("bankAccountId");
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const selectedMode = watch("paymentMode");
  const chequeDate = watch("chequeDate");

  // Auto-set payment mode when account is selected
  useEffect(() => {
    if (selectedAccount) {
      const accountType = selectedAccount.type as "CASH" | "BANK";

      // For CASH accounts, auto-select CASH mode
      if (accountType === "CASH") {
        setValue("paymentMode", "CASH");
      } else {
        // For BANK accounts, clear the selection so user can choose
        // Don't reset to empty, keep previous value or let user select
      }
    }
  }, [selectedAccount, setValue]);

  const onSubmit = async (data: GeneralPaymentFormValues) => {
    try {
      setIsSubmitting(true);
      const res = await createPayment({
        partyId: data.partyId,
        outletId: currentOutletId!,
        accountId: data.bankAccountId || "",
        amount: data.amount,
        date: new Date(data.paymentDate),
        type: "PAYMENT_MADE",
        reference: data.referenceNo || undefined,
      });
      if (res.success) {
        toast.success("Payment recorded successfully");
        if (source === "vendor" && sourceId) {
          router.push(`/dashboard/purchase/vendors/${sourceId}`);
        } else {
          router.push("/dashboard/purchases");
        }
        router.refresh();
      } else {
        toast.error("Failed to record payment: " + res.error?.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentOutletId) {
    return null;
  }

  const cancelHref =
    source === "vendor" && sourceId
      ? `/dashboard/purchase/vendors/${sourceId}`
      : "/dashboard/purchases";

  const breadcrumbs =
    source === "vendor" && sourceId
      ? [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Vendors", href: "/dashboard/purchase/vendors" },
          {
            label: sourceName || "Vendor",
            href: `/dashboard/purchase/vendors/${sourceId}`,
          },
          { label: "Make Payment" },
        ]
      : [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Accounts", href: "/dashboard/accounts" },
          { label: "Make Payment" },
        ];

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-10">
      <PageHeader
        title="Payment Made"
        subtitle="Record money paid to a vendor."
        breadcrumbs={breadcrumbs}
      />

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Paid To (Vendor) *
            </label>
            <select
              {...register("partyId")}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-slate-50 transition-all font-medium"
            >
              <option value="">Select Vendor...</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            {errors.partyId && (
              <p className="text-red-500 text-xs mt-1">
                {errors.partyId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Paid From (Bank/Cash) *
            </label>
            <select
              {...register("bankAccountId")}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-slate-50 transition-all font-medium"
            >
              <option value="">Select Account...</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type}) - {a.code}
                </option>
              ))}
            </select>
            {errors.bankAccountId && (
              <p className="text-red-500 text-xs mt-1">
                {errors.bankAccountId.message}
              </p>
            )}
          </div>

          {selectedAccountId && (
            <div>
              <PaymentModeSelector
                accountId={selectedAccountId}
                value={watch("paymentMode") as PaymentMode}
                onChange={(mode) => setValue("paymentMode", mode)}
                required={true}
                label="Payment Mode"
              />
              {errors.paymentMode && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.paymentMode.message}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  {...register("amount", { valueAsNumber: true })}
                  className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-bold text-lg text-slate-900"
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Date *
              </label>
              <input
                type="date"
                {...register("paymentDate")}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Reference / Notes
            </label>
            <textarea
              {...register("notes")}
              placeholder="Payment Notes..."
              rows={2}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Reference No
            </label>
            <input
              type="text"
              {...register("referenceNo")}
              placeholder="Cheque #, UTR, etc."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 text-white py-3.5 rounded-xl hover:bg-red-700 font-bold text-lg flex items-center justify-center shadow-lg disabled:opacity-50 active:scale-95 transition-all"
            >
              <Save className="w-5 h-5 mr-2" />
              {isSubmitting ? "Saving record..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>

      <div className="flex justify-center">
        <Link
          href={cancelHref}
          className="text-sm text-slate-400 hover:text-slate-600"
        >
          Cancel and return
        </Link>
      </div>
    </div>
  );
}

export default function NewPaymentMadePage() {
  return (
    <Suspense fallback={null}>
      <NewPaymentMadeContent />
    </Suspense>
  );
}
