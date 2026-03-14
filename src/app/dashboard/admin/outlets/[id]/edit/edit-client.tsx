"use client";

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { updateOutlet } from "@/actions/locations";
import { Store, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import {
  outletSchema,
  OutletFormValues,
} from "@/validations/outlet.validation";

export function OutletEditClient({
  outlet,
  warehouses,
}: {
  outlet: {
    id: string;
    name: string;
    address: string | null;
    state: string | null;
    invoicePrefix: string;
    invoiceStartingNumber: number;
    gstin: string | null;
    defaultWarehouseId: string | null;
    negativeStockPolicy: string;
    batchTrackingEnabled: boolean;
    warehouses: { id: string }[];
  };
  warehouses: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof outletSchema>>({
    resolver: zodResolver(outletSchema),
    defaultValues: {
      name: outlet.name || "",
      address: outlet.address || "",
      state: outlet.state || "",
      invoicePrefix: outlet.invoicePrefix || "INV",
      invoiceStartingNumber: outlet.invoiceStartingNumber || 1,
      gstin: outlet.gstin || "",
      defaultWarehouseId: outlet.defaultWarehouseId || "",
      negativeStockPolicy: outlet.negativeStockPolicy as any,
      warehouseIds: (outlet.warehouses || []).map((w: { id: string }) => w.id),
      batchTrackingEnabled: outlet.batchTrackingEnabled || false,
    },
  });

  const selectedWarehouseIds = watch("warehouseIds") || [];

  const onSubmit: SubmitHandler<OutletFormValues> = async (data) => {
    try {
      setIsSubmitting(true);
      const res = await updateOutlet(outlet.id, data);
      if (res.success) {
        toast.success("Outlet details synchronized");
        router.push("/dashboard/admin/outlets");
      } else {
        toast.error("Failed to update outlet: " + res.error?.message);
      }
    } catch (error) {
      console.error("Failed to update outlet:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update outlet.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Edit Sales Outlet
            </h2>
            <p className="text-sm text-slate-500">
              Update configuration for {outlet.name}.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/admin/outlets"
          className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2 border rounded-xl"
        >
          Cancel
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Outlet Name *
              </label>
              <input
                {...register("name")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none uppercase font-black text-sm"
                placeholder="e.g. Retail Showroom"
              />
              {errors.name && (
                <p className="text-red-500 text-[10px] mt-1 italic">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Registered Address *
              </label>
              <textarea
                {...register("address")}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Complete address for billing"
              />
              {errors.address && (
                <p className="text-red-500 text-[10px] mt-1 italic">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Point of Sale State *
              </label>
              <select
                {...register("state")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
              >
                <option value="">Select State...</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Delhi">Delhi</option>
              </select>
              {errors.state && (
                <p className="text-red-500 text-[10px] mt-1 italic">
                  {errors.state.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                GSTIN (Outlet Specific)
              </label>
              <input
                {...register("gstin")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Invoice Series Prefix *
              </label>
              <input
                {...register("invoicePrefix")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase text-sm"
              />
              <p className="text-[10px] text-slate-400 mt-1 italic leading-tight">
                Warning: Once invoices are generated, this prefix cannot be
                changed.
              </p>
              {errors.invoicePrefix && (
                <p className="text-red-500 text-[10px] mt-1 italic">
                  {errors.invoicePrefix.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Current Series Starting No.
              </label>
              <input
                type="number"
                {...register("invoiceStartingNumber", { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Negative Stock Policy *
              </label>
              <select
                {...register("negativeStockPolicy")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
              >
                <option value="WARN">Warn but Allow</option>
                <option value="BLOCK">Strict Block</option>
                <option value="ALLOW">Allow Silently</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Default Warehouse *
              </label>
              <select
                {...register("defaultWarehouseId")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
              >
                <option value="">Select Primary...</option>
                {warehouses
                  .filter((w) => selectedWarehouseIds.includes(w.id))
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Batch Tracking (FIFO)
              </label>
              <div className="flex items-center space-x-2 h-10 px-3 border border-slate-300 rounded-md bg-white text-sm">
                <input
                  type="checkbox"
                  {...register("batchTrackingEnabled")}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-600 font-medium">
                  Enable Batch-wise FIFO tracking
                </span>
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <label className="block text-sm font-bold text-slate-900 mb-3 uppercase tracking-tight">
                Linked fulfillment Centers *
              </label>
              <div className="border border-slate-100 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/50">
                {warehouses.map((w) => (
                  <label
                    key={w.id}
                    className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedWarehouseIds.includes(w.id)
                        ? "bg-white border-emerald-200 shadow-sm"
                        : "bg-transparent border-slate-100 opacity-60 grayscale"
                    }`}
                  >
                    <Controller
                      name="warehouseIds"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          checked={field.value.includes(w.id)}
                          onChange={(e) => {
                            const newValues = e.target.checked
                              ? [...field.value, w.id]
                              : field.value.filter((id: string) => id !== w.id);
                            field.onChange(newValues);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      )}
                    />
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter line-clamp-1">
                      {w.name}
                    </span>
                  </label>
                ))}
              </div>
              {errors.warehouseIds && (
                <p className="text-red-500 text-[10px] mt-1 italic">
                  {errors.warehouseIds.message}
                </p>
              )}
            </div>
          </div>

          <div className="pt-6 flex justify-end border-t border-slate-50">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 text-white px-8 py-3 rounded-2xl hover:bg-emerald-700 font-black text-xs uppercase tracking-widest flex items-center disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-emerald-100"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Updating..." : "Synchronize Outlet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
