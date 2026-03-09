"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createParty } from "@/actions/parties";
import { Users, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const partySchema = z.object({
  type: z.enum(["VENDOR", "CUSTOMER"]),
  name: z.string().min(2, "Name must be at least 2 characters"),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  state: z.string().min(2, "State is required"),
  contactInfo: z.string().optional(),
  creditPeriod: z.coerce.number().min(0).default(0),
  creditLimit: z.coerce.number().optional(),
  openingBalance: z.coerce.number().default(0),
});

type PartyFormValues = z.infer<typeof partySchema>;

export default function NewPartyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PartyFormValues>({
    resolver: zodResolver(partySchema) as any,
    defaultValues: {
      type: "CUSTOMER",
      creditPeriod: 0,
      openingBalance: 0,
    },
  });

  const type = watch("type");

  const onSubmit = async (data: PartyFormValues) => {
    try {
      setIsSubmitting(true);
      await createParty(data);
      router.push("/dashboard/master-data/parties");
    } catch (error) {
      console.error("Failed to create party:", error);
      alert("Failed to create party.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              type === "CUSTOMER"
                ? "bg-emerald-100 text-emerald-600"
                : "bg-purple-100 text-purple-600"
            }`}
          >
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Add New Master Record
            </h2>
            <p className="text-sm text-slate-500">
              Create a Vendor or Customer entity profile.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/master-data/parties"
          className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2"
        >
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            Profile Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer border border-slate-200 p-3 rounded-lg flex-1 hover:bg-slate-50 transition-colors">
                <input
                  type="radio"
                  value="CUSTOMER"
                  {...register("type")}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-medium text-slate-800">
                  Customer (Debtor)
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer border border-slate-200 p-3 rounded-lg flex-1 hover:bg-slate-50 transition-colors">
                <input
                  type="radio"
                  value="VENDOR"
                  {...register("type")}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <span className="font-medium text-slate-800">
                  Vendor (Creditor)
                </span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Entity Name / Company *
              </label>
              <input
                {...register("name")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Business Name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contact Information
              </label>
              <input
                {...register("contactInfo")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Phone / Email / Person"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                PAN Number
              </label>
              <input
                {...register("pan")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                placeholder="e.g. ABCDE1234F"
              />
            </div>
          </div>
        </div>

        {/* Address & Taxes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            Address & Taxation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Billing Address *
              </label>
              <textarea
                {...register("address")}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Full address"
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                State / Province (For IGST Logic) *
              </label>
              <input
                {...register("state")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Maharashtra"
              />
              {errors.state && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.state.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                GSTIN
              </label>
              <input
                {...register("gstin")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                placeholder="leave blank if unregistered"
              />
            </div>
          </div>
        </div>

        {/* Commercials */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            Commercial Terms
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Credit Period (Days)
              </label>
              <input
                type="number"
                {...register("creditPeriod")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Credit Limit (₹)
              </label>
              <input
                type="number"
                step="1000"
                {...register("creditLimit")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                Opening Balance (₹)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("openingBalance")}
                className="w-full px-3 py-2 border border-blue-300 bg-blue-50 rounded-md focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              />
              <p className="text-xs text-slate-500 mt-1 mt-1">
                Positive ={" "}
                {type === "CUSTOMER" ? "Receivable (Dr.)" : "Payable (Cr.)"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium flex items-center shadow-sm disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSubmitting ? "Saving..." : "Save Party Record"}
          </button>
        </div>
      </form>
    </div>
  );
}
