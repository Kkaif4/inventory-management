"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Receipt,
  Save,
  Trash2,
  Plus,
  ArrowLeft,
  Search,
  AlertTriangle,
  Info,
  Warehouse,
  Package,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { getParties } from "@/actions/parties";
import { getProducts } from "@/actions/products";
import { getCurrentStock, getInventoryLocations } from "@/actions/inventory";
import { createSalesInvoice } from "@/actions/sales/sales-invoice";

const invoiceSchema = z.object({
  partyId: z.string().min(1, "Customer is required"),
  fromOutletId: z.string().min(1, "Outlet is required"),
  date: z.coerce.date(),
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

type FormValues = z.infer<typeof invoiceSchema>;

export default function NewSalesInvoicePage() {
  const router = useRouter();
  const [parties, setParties] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [stockLevels, setStockLevels] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getParties().then((data) =>
      setParties(data.filter((p) => p.type === "CUSTOMER")),
    );
    getProducts().then(setProducts);
    getInventoryLocations().then((data) => setOutlets(data.outlets));
    getCurrentStock().then(setStockLevels);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      date: new Date(),
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

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchItems = watch("items");
  const watchOutletId = watch("fromOutletId");
  const selectedOutlet = outlets.find((o) => o.id === watchOutletId);

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
    setValue(`items.${index}.igst`, 0);
  };

  const getAvailableStock = (variantId: string) => {
    const stock = stockLevels.find(
      (s) => s.variantId === variantId && s.outletId === watchOutletId,
    );
    return stock?.quantity || 0;
  };

  const hasLowStock = watchItems.some((item) => {
    if (!item.variantId || !watchOutletId) return false;
    return item.quantity > getAvailableStock(item.variantId);
  });

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
      await createSalesInvoice(data);
      router.push("/dashboard/sales/invoices");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to create Invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/sales"
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Generate Sales Invoice
            </h2>
            <p className="text-slate-500">
              Immediate billing for customer purchases.
            </p>
          </div>
        </div>
      </div>

      {hasLowStock && selectedOutlet?.negativeStockPolicy === "WARN" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start space-x-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <h4 className="font-bold text-amber-900">Inventory Warning</h4>
            <p className="text-amber-700 text-sm mt-1">
              One or more items in this invoice have insufficient stock at{" "}
              <span className="font-bold">{selectedOutlet.name}</span>. Since
              your policy is set to{" "}
              <span className="font-bold underline uppercase tracking-tighter">
                Warn and Allow
              </span>
              , you can proceed with the billing, but stock levels will become
              negative.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Sale Details */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Warehouse className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  Point of Sale
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">
                    Dispatch Outlet*
                  </label>
                  <select
                    {...register("fromOutletId")}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">Select Outlet...</option>
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} (Policy: {o.negativeStockPolicy})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">
                    Invoice Date*
                  </label>
                  <input
                    type="date"
                    {...register("date")}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                  <Package className="w-5 h-5 mr-3 text-blue-500" />
                  Billing Items
                </h3>
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
                  className="text-blue-600 hover:bg-blue-50 font-bold px-4 py-2 rounded-xl transition-all"
                >
                  + Add Item
                </button>
              </div>

              <div className="p-8 space-y-6">
                {fields.map((field, index) => {
                  const itemStock = getAvailableStock(
                    watchItems[index]?.variantId,
                  );
                  const isNegative = watchItems[index]?.quantity > itemStock;

                  return (
                    <div
                      key={field.id}
                      className={`p-6 rounded-2xl border ${isNegative ? "bg-amber-50/30 border-amber-100" : "bg-slate-50/30 border-slate-100"} space-y-4`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                            Product
                          </label>
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
                                const parent = products.find((p) =>
                                  p.variants.some(
                                    (v: any) => v.id === variantId,
                                  ),
                                );
                                if (parent)
                                  setValue(
                                    `items.${index}.gstRate`,
                                    parent.gstRate,
                                  );
                              }
                              calculateRow(index);
                            }}
                            className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold shadow-sm"
                          >
                            <option value="">Search Product...</option>
                            {products.map((p) => (
                              <optgroup key={p.id} label={p.name}>
                                {p.variants.map(
                                  (v: { id: string; sku: string }) => (
                                    <option key={v.id} value={v.id}>
                                      {v.sku} - Stock: {getAvailableStock(v.id)}
                                    </option>
                                  ),
                                )}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => remove(index)}
                          className="mt-8 p-3 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                            Qty
                          </label>
                          <input
                            type="number"
                            {...register(`items.${index}.quantity` as const)}
                            onChange={() => calculateRow(index)}
                            className={`w-full bg-white border-none rounded-xl p-3 text-sm font-black text-center shadow-sm ${isNegative ? "text-amber-600 ring-2 ring-amber-500/20" : "text-slate-900"}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                            Rate (₹)
                          </label>
                          <input
                            type="number"
                            {...register(`items.${index}.rate` as const)}
                            onChange={() => calculateRow(index)}
                            className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold text-right shadow-sm"
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-end space-x-8 pt-4">
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Taxable Value
                            </p>
                            <p className="font-extrabold text-slate-700">
                              ₹{" "}
                              {(
                                watchItems[index]?.taxableValue || 0
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              GST Total
                            </p>
                            <p className="font-extrabold text-blue-600">
                              ₹{" "}
                              {(
                                (watchItems[index]?.cgst || 0) +
                                (watchItems[index]?.sgst || 0)
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {isNegative && (
                        <div className="flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full w-fit">
                          <Info className="w-3 h-3 mr-1.5" />
                          STOCK OVERDRAW DETECTED: {itemStock} AVAILABLE
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Customer Hub */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                <Search className="w-5 h-5 mr-3 text-blue-500" />
                Customer
              </h3>
              <select
                {...register("partyId")}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Select Customer...</option>
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Billing Summary */}
            <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl shadow-slate-200 sticky top-8">
              <h3 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-8 border-b border-slate-800 pb-4">
                Order Total
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-black text-white">
                    ₹{" "}
                    {totals.taxable.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-medium">Taxes (GST)</span>
                  <span className="font-black text-blue-400">
                    ₹{" "}
                    {totals.gst.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="pt-6 border-t border-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 text-center">
                    Amount Due
                  </p>
                  <p className="text-5xl font-black text-emerald-400 text-center tracking-tighter">
                    ₹{" "}
                    {(totals.taxable + totals.gst).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  (hasLowStock &&
                    selectedOutlet?.negativeStockPolicy === "BLOCK")
                }
                className="w-full mt-10 group relative bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  <Save className="w-6 h-6 mr-3" />
                  {isSubmitting ? "Finalizing..." : "Complete Invoice"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-white/20 to-emerald-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
