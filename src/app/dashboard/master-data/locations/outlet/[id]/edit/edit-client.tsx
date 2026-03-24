"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { updateOutlet } from "@/actions/locations";
import { Store } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  OutletFormValues,
  outletSchema,
} from "@/validations/outlet.validation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { INDIAN_STATES } from "@/lib/constants";

export function OutletEditClient({
  outlet,
  warehouses,
}: {
  outlet: any;
  warehouses: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OutletFormValues>({
    resolver: zodResolver(outletSchema),
    defaultValues: {
      name: outlet.name,
      address: outlet.address || "",
      state: outlet.state || "",
      invoicePrefix: outlet.invoicePrefix,
      invoiceStartingNumber: outlet.invoiceStartingNumber || 1,
      gstin: outlet.gstin || "",
      defaultWarehouseId: outlet.defaultWarehouseId || "",
      negativeStockPolicy: outlet.negativeStockPolicy as any,
      batchTrackingEnabled: outlet.batchTrackingEnabled || false,
      inventoryValuationMethod: outlet.inventoryValuationMethod as any,
      allowRawCashBills: (outlet as any).allowRawCashBills || false,
      bankDetails: (outlet as any).bankDetails || "",
      warehouseIds: outlet.warehouses.map((w: any) => w.id),
    } as any,
  });

  const onSubmit = async (data: OutletFormValues) => {
    try {
      setIsSubmitting(true);
      const res = await updateOutlet(outlet.id, data);
      if (res.success) {
        toast.success("Outlet details synchronized");
        router.refresh();
        router.push("/dashboard/master-data/locations");
      } else {
        toast.error("Failed: " + res.error?.message);
      }
    } catch (error) {
      console.error("Failed to update outlet:", error);
      toast.error("Critical failure during update.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedWarehouseIds = form.watch("warehouseIds") || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/master-data/locations"
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Store className="w-6 h-6 text-slate-400" />
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Edit Sales Outlet
            </h2>
            <p className="text-slate-500">Node: {outlet.name}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-10 space-y-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Info Container */}
              <div className="md:col-span-2 space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                        Outlet Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Downtown Flagship Store"
                          className="h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                          Full Address *
                        </FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="Complete physical address"
                            rows={3}
                            className="w-full p-6 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-8">
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                            State *
                          </FormLabel>
                          <select
                            {...field}
                            className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 appearance-none text-sm cursor-pointer"
                          >
                            <option value="">Select State...</option>
                            {INDIAN_STATES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gstin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                            GSTIN (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="27AAAAA0000A1Z5"
                              className="h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 uppercase"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Billing Configuration Area */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-100">
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="invoicePrefix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                            Prefix
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="INV/"
                              className="h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="invoiceStartingNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                            Starts From
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="negativeStockPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                          Negative Stock Policy
                        </FormLabel>
                        <select
                          {...field}
                          className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 appearance-none text-sm cursor-pointer"
                        >
                          <option value="WARN">Warn and Allow</option>
                          <option value="BLOCK">Strictly Block</option>
                          <option value="ALLOW">Allow Silently</option>
                        </select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="inventoryValuationMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                          Inventory Valuation Method
                        </FormLabel>
                        <select
                          {...field}
                          className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 appearance-none text-sm cursor-pointer"
                        >
                          <option value="NONE">Standard (No Batch Tracking)</option>
                          <option value="FIFO">FIFO (Batch Tracking)</option>
                        </select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="allowRawCashBills"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-4 space-y-0 p-6 bg-slate-50 rounded-2xl">
                        <FormControl>
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded-lg border-none bg-white text-emerald-600 focus:ring-emerald-500/20"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-bold text-slate-900">
                            Allow Raw Cash Bills (No. 2)
                          </FormLabel>
                          <FormDescription className="text-[10px] leading-tight">
                            Enable informal/untaxed billing capability for this
                            outlet.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="batchTrackingEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-4 space-y-0 p-6 bg-slate-50 rounded-2xl">
                        <FormControl>
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded-lg border-none bg-white text-emerald-600 focus:ring-emerald-500/20"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-bold text-slate-900">
                            FIFO Batch Tracking
                          </FormLabel>
                          <FormDescription className="text-[10px] leading-tight">
                            Track stock by incoming batches and individual
                            landing costs.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Finance & Warehousing */}
              <div className="md:col-span-2 space-y-10 pt-10 border-t border-slate-100">
                <FormField
                  control={form.control}
                  name="bankDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                        Bank Details (Invoice Footer)
                      </FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="e.g. ICICI Bank, A/C: 123456789, IFSC: ICIC000123"
                          rows={3}
                          className="w-full p-6 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                      Fulfillment Sources *
                    </FormLabel>
                    <div className="grid grid-cols-1 gap-4">
                      {warehouses.map((w) => (
                        <label
                          key={w.id}
                          className={`flex items-center space-x-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                            selectedWarehouseIds.includes(w.id)
                              ? "bg-emerald-50 border-emerald-200"
                              : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedWarehouseIds.includes(w.id)}
                            onChange={(e) => {
                              const newValues = e.target.checked
                                ? [...selectedWarehouseIds, w.id]
                                : selectedWarehouseIds.filter(
                                    (id) => id !== w.id,
                                  );
                              form.setValue("warehouseIds", newValues);
                            }}
                            className="w-5 h-5 rounded-lg border-slate-300 text-emerald-600"
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">
                              {w.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                              Warehouse Node
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="defaultWarehouseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                          Primary Source *
                        </FormLabel>
                        <select
                          {...field}
                          className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 appearance-none text-sm cursor-pointer"
                        >
                          <option value="">Select Default...</option>
                          {warehouses
                            .filter((w) => selectedWarehouseIds.includes(w.id))
                            .map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.name}
                              </option>
                            ))}
                        </select>
                        <FormMessage />
                        <FormDescription className="text-[10px]">
                          Warehouse used by default for sales dispatch.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="pt-10 flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-16 px-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting
                  ? "Synchronizing Terminal..."
                  : "Update Sales Outlet"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
