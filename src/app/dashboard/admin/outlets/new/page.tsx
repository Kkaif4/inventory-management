"use client";

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOutlet, getLocations } from "@/actions/locations";
import { Store, Save } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  outletSchema,
  OutletFormValues,
} from "@/validations/outlet.validation";
import * as z from "zod";

export default function NewOutletPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>(
    [],
  );

  useEffect(() => {
    getLocations().then((res) => {
      if (res.success) setWarehouses(res.data!.warehouses);
      else toast.error("Failed to load locations");
    });
  }, []);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof outletSchema>>({
    resolver: zodResolver(outletSchema),
    defaultValues: {
      name: "",
      address: "",
      state: "",
      invoicePrefix: "INV",
      invoiceStartingNumber: 1,
      gstin: "",
      defaultWarehouseId: "",
      negativeStockPolicy: "WARN",
      warehouseIds: [],
      batchTrackingEnabled: false,
    },
  });

  const selectedWarehouseIds = watch("warehouseIds") || [];

  const onSubmit: SubmitHandler<OutletFormValues> = async (values) => {
    try {
      setIsSubmitting(true);
      const res = await createOutlet(values);
      if (res.success) {
        toast.success("Outlet established successfully");
        router.push("/dashboard/admin/outlets");
      } else {
        toast.error("Failed to create outlet: " + res.error?.message);
      }
    } catch (error) {
      console.error("Failed to create outlet:", error);
      toast.error("Failed to create outlet. Please try again.");
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
              Add Sales Outlet
            </h2>
            <p className="text-sm text-slate-500">
              Create a new point of sale and fulfillment center.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/admin/outlets"
          className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none uppercase font-bold text-sm"
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
                Full Address *
              </label>
              <textarea
                {...register("address")}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Complete registered address"
              />
              {errors.address && (
                <p className="text-red-500 text-[10px] mt-1 italic">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                State (Point of Sale) *
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
                Separate GSTIN (Optional)
              </label>
              <input
                {...register("gstin")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase text-sm"
                placeholder="15-char limit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Invoice Prefix *
              </label>
              <input
                {...register("invoicePrefix")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase text-sm"
                placeholder="e.g. INV/RT/"
              />
              {errors.invoicePrefix && (
                <p className="text-red-500 text-[10px] mt-1 italic">
                  {errors.invoicePrefix.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Starting No. (Current FY)
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
              {errors.defaultWarehouseId && (
                <p className="text-red-500 text-[10px] mt-1 italic">
                  {errors.defaultWarehouseId.message}
                </p>
              )}
              {selectedWarehouseIds.length === 0 && (
                <p className="text-[10px] text-amber-600 mt-1 italic">
                  Link warehouses below to select default.
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Available Fulfillment Sources *
              </label>
              <div className="border border-slate-100 rounded-2xl p-4 space-y-2 max-h-48 overflow-y-auto bg-slate-50/50">
                {warehouses.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">
                    No warehouses available. Create one first.
                  </p>
                ) : (
                  <Controller
                    name="warehouseIds"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {warehouses.map((w) => (
                          <label
                            key={w.id}
                            className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${
                              field.value?.includes(w.id)
                                ? "bg-white border-blue-200 shadow-sm"
                                : "bg-transparent border-slate-100 opacity-60 grayscale"
                            }`}
                          >
                            <input
                              type="checkbox"
                              value={w.id}
                              checked={field.value?.includes(w.id)}
                              onChange={(e) => {
                                const newValues = e.target.checked
                                  ? [...(field.value || []), w.id]
                                  : (field.value || []).filter(
                                      (id) => id !== w.id,
                                    );
                                field.onChange(newValues);
                              }}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-offset-0 focus:ring-blue-500"
                            />
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">
                              {w.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  />
                )}
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
              className="bg-slate-900 text-white px-8 py-3 rounded-2xl hover:bg-slate-800 font-black text-xs uppercase tracking-widest flex items-center disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-slate-200"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Processing..." : "Establish Outlet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
