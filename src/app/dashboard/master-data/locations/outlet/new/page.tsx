"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOutlet, getLocations } from "@/actions/locations";
import { Store, Save } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  OutletFormValues,
  outletSchema,
} from "@/validations/outlet.validation";

export default function NewOutletPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>(
    [],
  );

  useEffect(() => {
    getLocations().then((res) => {
      if (res.success) {
        setWarehouses(res.data!.warehouses);
      } else {
        toast.error("Failed to load warehouses: " + res.error?.message);
      }
    });
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<OutletFormValues>({
    resolver: zodResolver(outletSchema),
    defaultValues: {
      negativeStockPolicy: "WARN",
      warehouseIds: [],
    },
  });

  const onSubmit = async (data: OutletFormValues) => {
    try {
      setIsSubmitting(true);
      const res = await createOutlet(data);
      if (res.success) {
        toast.success("Outlet created successfully");
        router.push("/dashboard/master-data/locations");
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
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
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
          href="/dashboard/master-data/locations"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Retail Showroom"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Invoice Prefix *
              </label>
              <input
                {...register("invoicePrefix")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. INV/RT/"
              />
              {errors.invoicePrefix && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.invoicePrefix.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Separate GSTIN (Optional)
              </label>
              <input
                {...register("gstin")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Only if independently registered"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Negative Stock Policy *
              </label>
              <select
                {...register("negativeStockPolicy")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="WARN">Warn User (Allow Sale)</option>
                <option value="BLOCK">Strict Block</option>
                <option value="ALLOW">Allow Silently</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Linked Warehouses (Fulfillment Sources) *
              </label>
              <div className="border border-slate-200 rounded-md p-3 space-y-2 max-h-48 overflow-y-auto bg-slate-50">
                {warehouses.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">
                    No warehouses available. Create one first.
                  </p>
                ) : (
                  <Controller
                    name="warehouseIds"
                    control={control}
                    render={({ field }) => (
                      <>
                        {warehouses.map((w) => (
                          <label
                            key={w.id}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              value={w.id}
                              checked={field.value.includes(w.id)}
                              onChange={(e) => {
                                const newValues = e.target.checked
                                  ? [...field.value, w.id]
                                  : field.value.filter((id) => id !== w.id);
                                field.onChange(newValues);
                              }}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-800">
                              {w.name}
                            </span>
                          </label>
                        ))}
                      </>
                    )}
                  />
                )}
              </div>
              {errors.warehouseIds && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.warehouseIds.message}
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium flex items-center disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Outlet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
