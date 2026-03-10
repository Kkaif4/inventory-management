"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { updateOutlet } from "@/actions/locations";
import { Store, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const outletSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  invoicePrefix: z.string().min(1, "Invoice prefix is required"),
  gstin: z.string().optional(),
  negativeStockPolicy: z.enum(["WARN", "BLOCK", "ALLOW"]),
  warehouseIds: z.array(z.string()).min(1, "Must link at least one warehouse"),
});

type OutletFormValues = z.infer<typeof outletSchema>;

export function OutletEditClient({
  outlet,
  warehouses,
}: {
  outlet: any;
  warehouses: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<OutletFormValues>({
    resolver: zodResolver(outletSchema),
    defaultValues: {
      name: outlet.name,
      invoicePrefix: outlet.invoicePrefix,
      gstin: outlet.gstin || "",
      negativeStockPolicy: outlet.negativeStockPolicy as any,
      warehouseIds: outlet.warehouses.map((w: any) => w.id),
    },
  });

  const onSubmit = async (data: OutletFormValues) => {
    try {
      setIsSubmitting(true);
      await updateOutlet(outlet.id, data);
      toast.success("Outlet updated successfully");
      router.push("/dashboard/master-data/locations");
    } catch (error) {
      console.error("Failed to update outlet:", error);
      toast.error("Failed to update outlet. Please try again.");
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
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold"
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
                            className="flex items-center space-x-2 cursor-pointer group"
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
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-slate-800 group-hover:text-black font-medium transition-colors">
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
              className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 font-black text-xs uppercase tracking-widest flex items-center disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-emerald-100"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Updating..." : "Update Outlet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
