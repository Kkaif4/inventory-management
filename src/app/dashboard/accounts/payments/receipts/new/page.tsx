"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createPayment, getAccounts } from "@/actions/accounting";
import { getParties } from "@/actions/parties";
import { Wallet, Save, ArrowUpCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const paymentSchema = z.object({
  partyId: z.string().min(1, "Customer is required"),
  accountId: z.string().min(1, "Destination account is required"),
  amount: z.coerce.number().min(0.01, "Amount must be > 0"),
  date: z.string().min(1, "Date is required"),
  reference: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function NewPaymentReceiptPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    getParties().then((res) =>
      setCustomers(res.filter((p) => p.type === "CUSTOMER")),
    );
    getAccounts().then((res) =>
      setAccounts(res.filter((a) => a.group === "ASSET")),
    );
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      setIsSubmitting(true);
      await createPayment({
        ...data,
        date: new Date(data.date),
        type: "PAYMENT_RECEIPT",
      });
      router.push("/dashboard/master-data/parties");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to record receipt");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-10">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
          <ArrowUpCircle className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Payment Receipt</h2>
          <p className="text-sm text-slate-500">
            Record money received from a customer.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Received From (Customer) *
            </label>
            <select
              {...register("partyId")}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 transition-all font-medium"
            >
              <option value="">Select Customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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
              Deposit To (Bank/Cash) *
            </label>
            <select
              {...register("accountId")}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 transition-all font-medium"
            >
              <option value="">Select Account...</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.code})
                </option>
              ))}
            </select>
            {errors.accountId && (
              <p className="text-red-500 text-xs mt-1">
                {errors.accountId.message}
              </p>
            )}
          </div>

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
                  {...register("amount")}
                  className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-lg text-slate-900"
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
                {...register("date")}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Reference / Notes
            </label>
            <textarea
              {...register("reference")}
              placeholder="Cheque #, UTR, or Receipt Notes..."
              rows={2}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 text-white py-3.5 rounded-xl hover:bg-emerald-700 font-bold text-lg flex items-center justify-center shadow-lg disabled:opacity-50 active:scale-95 transition-all"
            >
              <Save className="w-5 h-5 mr-2" />
              {isSubmitting ? "Saving record..." : "Record Receipt"}
            </button>
          </div>
        </form>
      </div>

      <div className="flex justify-center">
        <Link
          href="/dashboard/master-data/parties"
          className="text-sm text-slate-400 hover:text-slate-600"
        >
          Cancel and return
        </Link>
      </div>
    </div>
  );
}
