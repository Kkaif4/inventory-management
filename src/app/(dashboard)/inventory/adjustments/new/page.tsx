"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  createStockAdjustment,
  getInventoryLocations,
  getVariantsForSelection,
} from "@/actions/inventory";
import { Settings2, Save } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const adjustmentSchema = z.object({
  variantId: z.string().min(1, "Product variant is required"),
  location: z.string().min(1, "Location is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  type: z.enum(["ADDITION", "DEDUCTION"]),
  reason: z.string().min(3, "Reason is required"),
});

type AdjustmentFormValues = z.infer<typeof adjustmentSchema>;

export default function NewAdjustmentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<
    { id: string; name: string; type: string }[]
  >([]);
  const [variants, setVariants] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([getInventoryLocations(), getVariantsForSelection()]).then(
      ([locs, vars]) => {
        const combinedLocs = [
          ...locs.warehouses.map((w) => ({ ...w, type: "WAREHOUSE" })),
          ...locs.outlets.map((o) => ({ ...o, type: "OUTLET" })),
        ];
        setLocations(combinedLocs);
        setVariants(vars);
      },
    );
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentSchema) as any,
    defaultValues: {
      type: "ADDITION",
      quantity: 1,
    },
  });

  const onSubmit = async (data: AdjustmentFormValues) => {
    try {
      setIsSubmitting(true);
      const selectedLoc = locations.find((l) => l.id === data.location);
      if (!selectedLoc) return;

      await createStockAdjustment({
        variantId: data.variantId,
        locationId: data.location,
        locationType: selectedLoc.type as any,
        quantity: data.quantity,
        type: data.type,
        reason: data.reason,
      });

      router.push("/dashboard/inventory/current-stock");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to adjust stock:", error);
      alert(error.message || "Failed to adjust stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Stock Adjustment
            </h2>
            <p className="text-sm text-slate-500">
              Manually correct or initialize stock levels.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/inventory/current-stock"
          className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2"
        >
          Cancel
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Product Variant *
            </label>
            <select
              {...register("variantId")}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
            >
              <option value="">Search for product...</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.product.name} ({v.sku})
                </option>
              ))}
            </select>
            {errors.variantId && (
              <p className="text-red-500 text-xs mt-1">
                {errors.variantId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Location *
            </label>
            <select
              {...register("location")}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">Select location...</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.type === "WAREHOUSE" ? "Warehouse: " : "Outlet: "}
                  {l.name}
                </option>
              ))}
            </select>
            {errors.location && (
              <p className="text-red-500 text-xs mt-1">
                {errors.location.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Adjustment Type
              </label>
              <select
                {...register("type")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="ADDITION">Addition (+)</option>
                <option value="DEDUCTION">Deduction (-)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                step="0.01"
                {...register("quantity")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.quantity && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.quantity.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reason / Remark *
            </label>
            <textarea
              {...register("reason")}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Initial stock entry, damaged goods, physical count correction..."
            />
            {errors.reason && (
              <p className="text-red-500 text-xs mt-1">
                {errors.reason.message}
              </p>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium flex items-center disabled:opacity-50 shadow-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Processing..." : "Process Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
