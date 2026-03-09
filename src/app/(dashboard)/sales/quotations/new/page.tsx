"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FilePlus2,
  Save,
  Trash2,
  Plus,
  ArrowLeft,
  Search,
  Calculator,
  Percent,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { getParties } from "@/actions/parties";
import { getProducts } from "@/actions/products";
import { createQuotation } from "@/actions/sales/quotation";

const quoteSchema = z.object({
  partyId: z.string().min(1, "Customer is required"),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1, "Product is required"),
        quantity: z.coerce.number().min(0.01, "Qty > 0"),
        rate: z.coerce.number().min(0, "Rate >= 0"),
        gstRate: z.number(),
        taxableValue: z.number(),
        cgst: z.number(),
        sgst: z.number(),
        igst: z.number(),
      }),
    )
    .min(1, "At least one item required"),
});

type FormValues = z.infer<typeof quoteSchema>;

export default function NewQuotationPage() {
  const router = useRouter();
  const [parties, setParties] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getParties().then((data) =>
      setParties(data.filter((p) => p.type === "CUSTOMER")),
    );
    getProducts().then(setProducts);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(quoteSchema) as any,
    defaultValues: {
      items: [
        {
          variantId: "",
          quantity: 1,
          rate: 0,
          gstRate: 18,
          taxableValue: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");

  const calculateRow = (index: number) => {
    const item = watchItems[index];
    if (!item) return;

    const taxable = item.quantity * item.rate;
    const gst = (taxable * item.gstRate) / 100;
    const cgst = gst / 2;
    const sgst = gst / 2;

    setValue(`items.${index}.taxableValue`, taxable);
    setValue(`items.${index}.cgst`, cgst);
    setValue(`items.${index}.sgst`, sgst);
    setValue(`items.${index}.igst`, 0); // Assuming intra-state for now
  };

  const totals = watchItems.reduce(
    (acc, item) => {
      acc.taxable += item.taxableValue || 0;
      acc.gst += (item.cgst || 0) + (item.sgst || 0) + (item.igst || 0);
      return acc;
    },
    { taxable: 0, gst: 0 },
  );

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      await createQuotation(data);
      router.push("/dashboard/sales/quotations");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to create quotation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/sales/quotations"
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              New Quotation
            </h2>
            <p className="text-slate-500">
              Create a professional estimate for your client.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Customer Selection */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              Customer Details
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">
                Select Customer *
              </label>
              <select
                {...register("partyId")}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              >
                <option value="">Select a customer...</option>
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.gstin ? `(${p.gstin})` : ""}
                  </option>
                ))}
              </select>
              {errors.partyId && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.partyId.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Line Items</h3>
            </div>
            <button
              type="button"
              onClick={() =>
                append({
                  variantId: "",
                  quantity: 1,
                  rate: 0,
                  gstRate: 18,
                  taxableValue: 0,
                  cgst: 0,
                  sgst: 0,
                  igst: 0,
                })
              }
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-6 py-2.5 rounded-xl text-sm transition-all flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-8 py-4">Product / Item</th>
                  <th className="px-4 py-4 w-32">Qty</th>
                  <th className="px-4 py-4 w-40">Rate (₹)</th>
                  <th className="px-4 py-4 w-32">GST %</th>
                  <th className="px-4 py-4 text-right">Taxable</th>
                  <th className="px-4 py-4 text-right">GST</th>
                  <th className="px-8 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fields.map((field, index) => (
                  <tr
                    key={field.id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <select
                        {...register(`items.${index}.variantId` as const)}
                        onChange={(e) => {
                          const variantId = e.target.value;
                          const product = products
                            .flatMap((p) => p.variants)
                            .find((v) => v.id === variantId);
                          if (product) {
                            setValue(
                              `items.${index}.rate`,
                              product.sellingPrice,
                            );
                            // Find parent product for GST rate
                            const parent = products.find((p) =>
                              p.variants.some((v: any) => v.id === variantId),
                            );
                            if (parent)
                              setValue(
                                `items.${index}.gstRate`,
                                parent.gstRate,
                              );
                          }
                          calculateRow(index);
                        }}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500/10 outline-none"
                      >
                        <option value="">Select item...</option>
                        {products.map((p) => (
                          <optgroup key={p.id} label={p.name}>
                            {p.variants.map(
                              (v: {
                                id: string;
                                sku: string;
                                sellingPrice: number;
                              }) => (
                                <option key={v.id} value={v.id}>
                                  {v.sku} - ₹{v.sellingPrice}
                                </option>
                              ),
                            )}
                          </optgroup>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-6">
                      <input
                        type="number"
                        {...register(`items.${index}.quantity` as const)}
                        onChange={() => calculateRow(index)}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-center focus:ring-2 focus:ring-blue-500/10 outline-none"
                      />
                    </td>
                    <td className="px-4 py-6">
                      <input
                        type="number"
                        {...register(`items.${index}.rate` as const)}
                        onChange={() => calculateRow(index)}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-right focus:ring-2 focus:ring-blue-500/10 outline-none"
                      />
                    </td>
                    <td className="px-4 py-6">
                      <div className="relative">
                        <input
                          type="number"
                          {...register(`items.${index}.gstRate` as const)}
                          onChange={() => calculateRow(index)}
                          className="w-full bg-slate-50 border-none rounded-xl pl-4 pr-8 py-3 text-sm font-bold text-center focus:ring-2 focus:ring-blue-500/10 outline-none"
                        />
                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                      </div>
                    </td>
                    <td className="px-4 py-6 text-right font-bold text-slate-700">
                      ₹{" "}
                      {(watchItems[index]?.taxableValue || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-6 text-right font-bold text-blue-600">
                      ₹{" "}
                      {(
                        (watchItems[index]?.cgst || 0) +
                        (watchItems[index]?.sgst || 0)
                      ).toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-12 bg-slate-900 text-white flex flex-col md:flex-row justify-between gap-12">
            <div className="space-y-4 max-w-md">
              <div className="flex items-center space-x-2 text-blue-400">
                <FilePlus2 className="w-5 h-5" />
                <span className="font-bold tracking-widest uppercase text-xs">
                  Summary Note
                </span>
              </div>
              <p className="text-slate-400 text-sm italic underline decoration-slate-700 underline-offset-8">
                This quotation is valid for 15 days from the date of issue.
                Prices are subject to market conditions at the time of order
                placement.
              </p>
            </div>
            <div className="flex-1 max-w-md space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="text-slate-400 font-medium">
                  Sub-total (Taxable)
                </span>
                <span className="text-xl font-bold">
                  ₹{" "}
                  {totals.taxable.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="text-slate-400 font-medium">GST Amount</span>
                <span className="text-xl font-bold text-blue-400">
                  ₹{" "}
                  {totals.gst.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Grand Total</span>
                <span className="text-4xl font-black text-emerald-400 tracking-tighter">
                  ₹{" "}
                  {(totals.taxable + totals.gst).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative bg-blue-600 hover:bg-blue-700 text-white px-16 py-5 rounded-3xl font-black text-xl shadow-2xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 overflow-hidden"
          >
            <div className="relative z-10 flex items-center">
              <Save className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
              {isSubmitting ? "Generating..." : "Generate Quotation"}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>
        </div>
      </form>
    </div>
  );
}
