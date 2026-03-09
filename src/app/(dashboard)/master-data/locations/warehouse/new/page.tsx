"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createWarehouse } from "@/actions/locations";
import { Building2, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const warehouseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().optional(),
});

type WarehouseFormValues = z.infer<typeof warehouseSchema>;

export default function NewWarehousePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
  });

  const onSubmit = async (data: WarehouseFormValues) => {
    try {
      setIsSubmitting(true);
      await createWarehouse(data);
      router.push("/dashboard/master-data/locations");
    } catch (error) {
      console.error("Failed to create warehouse:", error);
      alert("Failed to create warehouse. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Add Warehouse</h2>
            <p className="text-sm text-slate-500">
              Create a new storage location for inventory tracking.
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Warehouse Name *
            </label>
            <input
              {...register("name")}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Main Godown"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Address
            </label>
            <textarea
              {...register("address")}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Physical location address"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium flex items-center disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Warehouse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
