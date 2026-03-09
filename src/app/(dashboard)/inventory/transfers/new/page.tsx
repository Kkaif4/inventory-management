"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  createStockTransfer,
  getInventoryLocations,
  getVariantsForSelection,
} from "@/actions/inventory";
import { ArrowRightLeft, Save } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const transferSchema = z
  .object({
    variantId: z.string().min(1, "Product variant is required"),
    fromLocation: z.string().min(1, "Source location is required"),
    toLocation: z.string().min(1, "Destination location is required"),
    quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  })
  .refine((data) => data.fromLocation !== data.toLocation, {
    message: "Source and destination cannot be the same",
    path: ["toLocation"],
  });

type TransferFormValues = z.infer<typeof transferSchema>;

export default function NewTransferPage() {
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
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema) as any,
  });

  const onSubmit = async (data: TransferFormValues) => {
    try {
      setIsSubmitting(true);
      const fromLoc = locations.find((l) => l.id === data.fromLocation);
      const toLoc = locations.find((l) => l.id === data.toLocation);

      if (!fromLoc || !toLoc) return;

      await createStockTransfer({
        variantId: data.variantId,
        fromLocationId: data.fromLocation,
        fromLocationType: fromLoc.type as any,
        toLocationId: data.toLocation,
        toLocationType: toLoc.type as any,
        quantity: data.quantity,
      });

      router.push("/dashboard/inventory/current-stock");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to transfer stock:", error);
      alert(
        error.message ||
          "Failed to transfer stock. Check if source has enough quantity.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Stock Transfer
            </h2>
            <p className="text-sm text-slate-500">
              Move products between warehouses or outlets.
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Source Location *
              </label>
              <select
                {...register("fromLocation")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Select source...</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.type === "WAREHOUSE" ? "Warehouse: " : "Outlet: "}
                    {l.name}
                  </option>
                ))}
              </select>
              {errors.fromLocation && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.fromLocation.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Destination Location *
              </label>
              <select
                {...register("toLocation")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Select destination...</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.type === "WAREHOUSE" ? "Warehouse: " : "Outlet: "}
                    {l.name}
                  </option>
                ))}
              </select>
              {errors.toLocation && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.toLocation.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Transfer Quantity *
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

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-medium flex items-center disabled:opacity-50 shadow-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Transferring..." : "Complete Transfer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
