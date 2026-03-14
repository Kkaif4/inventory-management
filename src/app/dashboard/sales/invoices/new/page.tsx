"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver } from "react-hook-form";
import { toast } from "sonner";
import {
  User,
  Save,
  Info,
  Trash2,
  Search,
  Package,
  Receipt,
  FileText,
  Warehouse,
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { getParties } from "@/actions/parties";
import { getProducts } from "@/actions/products";
import { getCurrentStock, getInventoryLocations } from "@/actions/inventory";
import { createSalesInvoice } from "@/actions/sales/sales-invoice";
import {
  getQuotationById,
  convertQuotationToInvoice,
} from "@/actions/sales/quotation";
import { roundToTwo } from "@/lib/utils";
import { useOutletStore } from "@/store/use-outlet-store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InvoiceFormValues,
  invoiceSchema,
} from "@/validations/invoice.validation";

function InvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteId = searchParams.get("quoteId");
  const { currentOutletId } = useOutletStore();
  const { data: session } = useSession();

  const [parties, setParties] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<
    {
      id: string;
      name: string;
      negativeStockPolicy: string;
      warehouses: { id: string }[];
    }[]
  >([]);
  const [stockLevels, setStockLevels] = useState<
    {
      variantId: string;
      quantity: number;
      warehouseId?: string | null;
      outletId?: string | null;
    }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema) as Resolver<InvoiceFormValues>,
    defaultValues: {
      isInformal: false,
      date: new Date(),
      freightCost: 0,
      items: [
        {
          variantId: "",
          quantity: 1,
          unit: "BASE",
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
  const watchFreight = watch("freightCost") || 0;
  const watchOutletId = watch("fromOutletId");
  const watchIsInformal = watch("isInformal");
  const selectedOutlet = outlets.find((o) => o.id === watchOutletId);
  const primaryWarehouseId = selectedOutlet?.warehouses[0]?.id;

  useEffect(() => {
    if (currentOutletId) {
      setValue("fromOutletId", currentOutletId);
      loadInventoryData(currentOutletId).then(() => {
        if (quoteId) {
          loadQuotation(quoteId, currentOutletId);
        }
      });
    }
  }, [currentOutletId, quoteId]);

  const loadQuotation = async (id: string, outletId: string) => {
    try {
      const res = await getQuotationById(id, outletId);
      if (!res.success) {
        toast.error("Failed to load quotation: " + res.error?.message);
        return;
      }
      const quote = res.data;
      if (!quote) return;

      setValue("partyId", quote.partyId || "");
      setValue("isInformal", false);

      const items = quote.items.map((item: any) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        unit: item.unit || "BASE",
        rate: item.rate,
        gstRate: item.variant.product.gstRate,
        taxableValue: item.taxableValue,
        cgst: item.cgst,
        sgst: item.sgst,
        igst: item.igst,
      }));

      setValue("items", items);
      toast.success("Quotation details imported");
    } catch (error) {
      console.error(error);
      toast.error("Failed to load quotation");
    }
  };

  const loadInventoryData = async (outletId: string) => {
    try {
      const [partyRes, productRes, locationRes, stockRes] = await Promise.all([
        getParties(outletId),
        getProducts(outletId),
        getInventoryLocations(outletId),
        getCurrentStock(outletId),
      ]);

      if (!partyRes.success) throw new Error(partyRes.error?.message);
      if (!productRes.success) throw new Error(productRes.error?.message);
      if (!locationRes.success) throw new Error(locationRes.error?.message);
      if (!stockRes.success) throw new Error(stockRes.error?.message);

      setParties(partyRes.data!.filter((p: any) => p.type === "CUSTOMER"));
      setProducts(productRes.data!);
      setOutlets(locationRes.data!.outlets);
      setStockLevels(stockRes.data!);
    } catch (error: any) {
      toast.error("Initialization failed: " + error.message);
    }
  };

  const calculateRow = (index: number) => {
    const item = getValues(`items.${index}`);
    if (!item || !item.variantId) return;

    const variant = products
      .flatMap((p) => p.variants)
      .find((v) => v.id === item.variantId);
    const product = products.find((p) =>
      p.variants.some((v: any) => v.id === item.variantId),
    );

    if (!variant || !product) return;

    const taxable = roundToTwo(item.quantity * item.rate);
    const gstTotal = roundToTwo((taxable * item.gstRate) / 100);

    const customer = parties.find((p) => p.id === getValues("partyId"));
    const isInterState = customer && customer.state !== "Maharashtra";

    let cgst = 0,
      sgst = 0,
      igst = 0;

    if (isInterState) {
      igst = gstTotal;
    } else {
      cgst = roundToTwo(gstTotal / 2);
      sgst = roundToTwo(gstTotal / 2);
    }

    setValue(`items.${index}.taxableValue`, taxable);
    setValue(`items.${index}.cgst`, cgst);
    setValue(`items.${index}.sgst`, sgst);
    setValue(`items.${index}.igst`, igst);
  };

  const getAvailableStock = (variantId: string) => {
    const stock = stockLevels.find(
      (s) =>
        s.variantId === variantId &&
        (primaryWarehouseId
          ? s.warehouseId === primaryWarehouseId
          : s.outletId === watchOutletId),
    );
    return stock?.quantity || 0;
  };

  const getStockStatus = (index: number) => {
    const item = watchItems[index];
    if (!item?.variantId || !watchOutletId)
      return { isNegative: false, available: 0, requestedBase: 0 };

    const product = products.find((p) =>
      p.variants.some((v: any) => v.id === item.variantId),
    );
    if (!product) return { isNegative: false, available: 0, requestedBase: 0 };

    const conversionRatio = product.conversionRatio || 1;
    const requestedBase =
      item.unit === "SALES" ? item.quantity * conversionRatio : item.quantity;
    const available = getAvailableStock(item.variantId);

    return {
      isNegative: requestedBase > available,
      available,
      requestedBase,
      baseUnit: product.baseUnit,
    };
  };

  const totals = watchItems.reduce(
    (acc, item) => {
      acc.taxable = roundToTwo(acc.taxable + (item.taxableValue || 0));
      acc.gst = roundToTwo(
        acc.gst + (item.cgst || 0) + (item.sgst || 0) + (item.igst || 0),
      );
      return acc;
    },
    { taxable: 0, gst: 0 } as { taxable: number; gst: number },
  );

  const onSubmit: SubmitHandler<InvoiceFormValues> = async (data) => {
    try {
      if (!session?.user?.id) throw new Error("Unauthorized");
      setIsSubmitting(true);
      const res = await createSalesInvoice({
        ...data,
        userId: session.user.id,
      } as any);

      if (!res.success) {
        throw new Error(res.error?.message || "Failed to create Invoice");
      }

      // If converting from quotation, update its status
      if (quoteId) {
        await convertQuotationToInvoice(quoteId, session.user.id);
      }

      toast.success(
        quoteId
          ? "Quotation finalized as Invoice"
          : "Invoice created successfully",
      );
      router.push("/dashboard/sales");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create Invoice",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentOutletId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md">
          <Warehouse className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Assign Outlet</h2>
          <p className="text-slate-500 text-sm">
            Please select an active outlet from the navigation bar.
          </p>
          <Button
            onClick={() => router.push("/dashboard/sales")}
            variant="outline"
            className="w-full"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

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
            <p className="text-slate-500">Retail & B2B Billing Terminal.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-2 rounded-2xl border border-slate-200 w-fit">
        <Tabs
          value={watchIsInformal ? "informal" : "legal"}
          onValueChange={(v) => setValue("isInformal", v === "informal")}
        >
          <TabsList className="bg-transparent h-12 gap-1">
            <TabsTrigger
              value="legal"
              className="rounded-xl px-6 h-10 data-[state=active]:bg-brand data-[state=active]:text-white data-[state=active]:shadow-lg shadow-brand/20 transition-all font-black"
            >
              <Receipt className="w-4 h-4 mr-2" />
              NO. 1 LEGAL BILL
            </TabsTrigger>
            <TabsTrigger
              value="informal"
              className="rounded-xl px-6 h-10 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg shadow-amber-500/20 transition-all font-black"
            >
              <FileText className="w-4 h-4 mr-2" />
              NO. 2 RAW/CASH BILL
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {watchIsInformal && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start space-x-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <Info className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <h4 className="font-bold text-amber-900">Informal Billing Mode</h4>
            <p className="text-amber-700 text-sm mt-1">
              Inventory only update. No Ledger/GST impact.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Warehouse className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  Dispatch Location
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">
                    From Outlet*
                  </label>
                  <select
                    {...register("fromOutletId")}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
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

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                  <Package className="w-5 h-5 mr-3 text-blue-500" />
                  Cart Items
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    append({
                      variantId: "",
                      quantity: 1,
                      unit: "BASE",
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
                  + Add Line
                </button>
              </div>

              <div className="p-8 space-y-6">
                {fields.map((field, index) => {
                  const stockStatus = getStockStatus(index);
                  const isNegative = stockStatus.isNegative;
                  const item = watchItems[index];
                  const product = products.find((p) =>
                    p.variants.some((v: any) => v.id === item?.variantId),
                  );

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
                            {...register(`items.${index}.variantId` as const, {
                              onChange: (e) => {
                                const variantId = e.target.value;
                                const variant = products
                                  .flatMap((p) => p.variants)
                                  .find((v) => v.id === variantId);
                                const parent = products.find((p) =>
                                  p.variants.some(
                                    (v: any) => v.id === variantId,
                                  ),
                                );
                                if (variant && parent) {
                                  const customerId = getValues("partyId");
                                  const customer = parties.find(
                                    (p) => p.id === customerId,
                                  );
                                  const customPrice =
                                    customer?.priceList?.entries?.find(
                                      (e: any) => e.variantId === variantId,
                                    )?.price;
                                  const baseRate =
                                    customPrice ?? variant.sellingPrice;
                                  const currentUnit = getValues(
                                    `items.${index}.unit`,
                                  );
                                  const rate =
                                    currentUnit === "SALES"
                                      ? baseRate * (parent.conversionRatio || 1)
                                      : baseRate;
                                  setValue(
                                    `items.${index}.rate`,
                                    roundToTwo(rate),
                                  );
                                  setValue(
                                    `items.${index}.gstRate`,
                                    parent.gstRate,
                                  );
                                }
                                calculateRow(index);
                              },
                            })}
                            className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold shadow-sm"
                          >
                            <option value="">Search Product...</option>
                            {products.map((p) => (
                              <optgroup key={p.id} label={p.name}>
                                {p.variants.map((v: any) => (
                                  <option key={v.id} value={v.id}>
                                    {v.sku} (STK: {getAvailableStock(v.id)})
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="mt-8 p-3 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                        <div className="space-y-1 lg:col-span-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                            Qty
                          </label>
                          <input
                            type="number"
                            {...register(`items.${index}.quantity` as const, {
                              onChange: () => calculateRow(index),
                            })}
                            className={`w-full bg-white border-none rounded-xl p-3 text-sm font-black text-center shadow-sm ${isNegative ? "text-amber-600 ring-2 ring-amber-500/20" : "text-slate-900"}`}
                          />
                        </div>
                        <div className="space-y-1 lg:col-span-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                            Rate (₹)
                          </label>
                          <input
                            type="number"
                            {...register(`items.${index}.rate` as const, {
                              onChange: () => calculateRow(index),
                            })}
                            className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold text-right shadow-sm"
                          />
                        </div>
                        <div className="col-span-4 flex items-center justify-end space-x-6">
                          <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              Taxable Value
                            </p>
                            <p className="text-sm font-extrabold text-slate-800">
                              ₹
                              {(
                                watchItems[index]?.taxableValue || 0
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              GST Total
                            </p>
                            <p className="text-sm font-extrabold text-blue-600">
                              ₹
                              {(
                                (watchItems[index]?.cgst || 0) +
                                (watchItems[index]?.sgst || 0) +
                                (watchItems[index]?.igst || 0)
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                {watchIsInformal ? (
                  <User className="w-5 h-5 mr-3 text-amber-500" />
                ) : (
                  <Search className="w-5 h-5 mr-3 text-blue-500" />
                )}
                {watchIsInformal ? "Buyer Info" : "Relationship"}
              </h3>

              {!watchIsInformal ? (
                <div className="space-y-4">
                  <select
                    {...register("partyId")}
                    className={`w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20 ${errors.partyId ? "ring-2 ring-red-500" : ""}`}
                  >
                    <option value="">Pick Customer...</option>
                    {parties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.state})
                      </option>
                    ))}
                  </select>
                  {errors.partyId && (
                    <p className="text-red-500 text-xs font-bold pl-2">
                      {errors.partyId.message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    {...register("buyerName")}
                    placeholder="Customer Name"
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-amber-500/20"
                  />
                  <input
                    type="text"
                    {...register("buyerPhone")}
                    placeholder="Contact Mobile"
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              )}
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl sticky top-8">
              <h3 className="text-xl font-black uppercase tracking-widest text-slate-500 mb-8 border-b border-slate-800 pb-4">
                Checkout Total
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Subtotal</span>
                  <span className="font-black">
                    ₹ {totals.taxable.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Taxes</span>
                  <span className="font-black text-blue-400">
                    ₹ {totals.gst.toLocaleString()}
                  </span>
                </div>
                <div className="pt-8 border-t border-white/10">
                  <p className="text-4xl font-black text-emerald-400 text-center tracking-tighter">
                    ₹{" "}
                    {(
                      totals.taxable +
                      totals.gst +
                      (Number(watchFreight) || 0)
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  (watchItems.some((_, i) => getStockStatus(i).isNegative) &&
                    selectedOutlet?.negativeStockPolicy === "BLOCK")
                }
                className="w-full mt-10 bg-emerald-500 hover:bg-emerald-600 text-white py-6 rounded-2xl font-black text-xl shadow-2xl shadow-emerald-500/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Finish Invoice"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function NewSalesInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-10 h-10 text-brand animate-spin" />
        </div>
      }
    >
      <InvoiceForm />
    </Suspense>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
