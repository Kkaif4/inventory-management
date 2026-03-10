"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createPurchaseOrder } from "@/actions/procurement";
import { getParties } from "@/actions/parties";
import {
  getInventoryLocations,
  getVariantsForSelection,
} from "@/actions/inventory";
import { ShoppingCart, Plus, Trash2, Save } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const itemSchema = z.object({
  variantId: z.string().min(1, "Item is required"),
  quantity: z.coerce.number().min(0.01, "Qty required"),
  rate: z.coerce.number().min(0.01, "Rate required"),
  gstPercent: z.coerce.number().default(18),
});

const poSchema = z.object({
  partyId: z.string().min(1, "Supplier is required"),
  toLocationId: z.string().min(1, "Destination required"),
  items: z.array(itemSchema).min(1, "Add at least one item"),
});

type POFormValues = z.infer<typeof poSchema>;

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

  useEffect(() => {
    getParties().then((res) =>
      setSuppliers(res.filter((p) => p.type === "VENDOR")),
    );
    getInventoryLocations().then((res) => setLocations(res.warehouses));
    getVariantsForSelection().then((res) => setVariants(res));
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<POFormValues>({
    resolver: zodResolver(poSchema) as any,
    defaultValues: {
      items: [{ variantId: "", quantity: 1, rate: 0, gstPercent: 18 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const selectedSupplierId = watch("partyId");
  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  // Totals calculations
  const totals = watchedItems.reduce(
    (acc, item) => {
      const taxable = (item.quantity || 0) * (item.rate || 0);
      const tax = taxable * (item.gstPercent / 100);
      return {
        taxable: acc.taxable + taxable,
        tax: acc.tax + tax,
        grand: acc.grand + taxable + tax,
      };
    },
    { taxable: 0, tax: 0, grand: 0 },
  );

  const onSubmit = async (data: POFormValues) => {
    try {
      setIsSubmitting(true);

      const payload = {
        partyId: data.partyId,
        toLocationId: data.toLocationId,
        items: data.items.map((item) => {
          const taxableValue = item.quantity * item.rate;
          const tax = taxableValue * (item.gstPercent / 100);

          // Logic for IGST vs CGST/SGST based on company state vs supplier state
          // For now, simplicity: all to GST (implementation plan says to handle state logic in phase 5, but we'll prepare fields)
          return {
            variantId: item.variantId,
            quantity: item.quantity,
            rate: item.rate,
            taxableValue,
            cgst: tax / 2,
            sgst: tax / 2,
            igst: 0,
          };
        }),
      };

      await createPurchaseOrder(payload as any);
      router.push("/dashboard/purchases/orders");
    } catch (error) {
      console.error(error);
      alert("Failed to create PO");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              New Purchase Order
            </h2>
            <p className="text-sm text-slate-500">
              Request stock from a vendor.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/purchases/orders"
          className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2"
        >
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Supplier (Vendor) *
              </label>
              <select
                {...register("partyId")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
              >
                <option value="">Select Supplier...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.state})
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
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Destination Warehouse *
              </label>
              <select
                {...register("toLocationId")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
              >
                <option value="">Select Warehouse...</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              {errors.toLocationId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.toLocationId.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* PO Items */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-sm font-semibold text-slate-700 uppercase tracking-wider">
            <span>Order Items</span>
            <button
              type="button"
              onClick={() =>
                append({ variantId: "", quantity: 1, rate: 0, gstPercent: 18 })
              }
              className="text-blue-600 flex items-center hover:text-blue-800"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </button>
          </div>

          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-medium text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Item / SKU</th>
                <th className="px-4 py-3 w-32 text-center">Qty</th>
                <th className="px-4 py-3 w-40">Rate (Excl. Tax)</th>
                <th className="px-4 py-3 w-32">GST %</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fields.map((field, index) => (
                <tr key={field.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3">
                    <select
                      {...register(`items.${index}.variantId` as const)}
                      className="w-full border-none bg-transparent focus:ring-0 text-sm font-medium text-slate-900"
                    >
                      <option value="">Search item...</option>
                      {variants.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.product.name} ({v.sku})
                        </option>
                      ))}
                    </select>
                    {errors.items?.[index]?.variantId && (
                      <p className="text-red-500 text-[10px] mt-0.5 ml-1">
                        {errors.items[index]?.variantId?.message}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.quantity` as const)}
                      className="w-full px-2 py-1 text-sm border border-slate-200 rounded text-center focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-slate-400 text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.rate` as const)}
                        className="w-full pl-5 pr-2 py-1 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      {...register(`items.${index}.gstPercent` as const)}
                      className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-slate-900 text-sm">
                    ₹
                    {(
                      (watchedItems[index]?.quantity || 0) *
                      (watchedItems[index]?.rate || 0)
                    ).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Breakdown */}
        <div className="flex justify-end pt-4">
          <div className="w-80 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-3">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Sub-Total (Taxable)</span>
              <span>₹{totals.taxable.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Tax (GST)</span>
              <span>₹{totals.tax.toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-lg text-slate-900">
              <span>Total Amount</span>
              <span>₹{totals.grand.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-bold text-lg flex items-center shadow-lg disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSubmitting ? "Generating PO..." : "Issue Purchase Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
