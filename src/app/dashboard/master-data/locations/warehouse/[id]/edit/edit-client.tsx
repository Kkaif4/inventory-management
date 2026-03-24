"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { updateWarehouse } from "@/actions/locations";
import { Building2, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import {
  WarehouseFormValues,
  warehouseSchema,
} from "@/validations/warehouse.validation";
import { INDIAN_STATES } from "@/lib/constants";

export function WarehouseEditClient({ warehouse }: { warehouse: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: warehouse.name,
      address: warehouse.address || "",
      state: warehouse.state || "",
      contactName: warehouse.contactName || "",
      contactPhone: warehouse.contactPhone || "",
    },
  });

  const onSubmit = async (data: WarehouseFormValues) => {
    try {
      setIsSubmitting(true);
      const res = await updateWarehouse(warehouse.id, data);

      if (res.success) {
        toast.success("Warehouse updated successfully");
        router.refresh();
        router.push("/dashboard/master-data/locations");
      } else {
        toast.error(
          "Failed to update warehouse: " +
            (res.error?.message || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("Failed to update warehouse:", error);
      toast.error("A technical error occurred while updating the warehouse.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/master-data/locations"
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Building2 className="w-6 h-6 text-slate-400" />
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Edit Warehouse
            </h2>
            <p className="text-slate-500">Update node: {warehouse.name}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-10 space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                        Warehouse Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Northeast Logistics Hub"
                          className="h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 uppercase"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="font-bold text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                        Full Address
                      </FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="Complete physical location details"
                          rows={3}
                          className="w-full p-6 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                      State / Region *
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 appearance-none text-sm cursor-pointer"
                      >
                        <option value="">Select State...</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                        Manager Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Node point of contact"
                          className="h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 appearance-none text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                        Direct Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+91 00000 00000"
                          className="h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 appearance-none text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-8 flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "Synchronizing..." : "Update Warehouse"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
