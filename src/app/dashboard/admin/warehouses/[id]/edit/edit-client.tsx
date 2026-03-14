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
  warehouseSchema,
  WarehouseFormValues,
} from "@/validations/warehouse.validation";

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
        toast.success("Warehouse records updated");
        router.push("/dashboard/admin/warehouses");
      } else {
        toast.error("Failed to update warehouse: " + res.error?.message);
      }
    } catch (error: any) {
      console.error("Failed to update warehouse:", error);
      toast.error(error.message || "Failed to update warehouse.");
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
            <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">
              Edit Warehouse
            </h2>
            <p className="text-sm text-slate-500">
              Update details for {warehouse.name}.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/admin/warehouses"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors border rounded-xl hover:bg-slate-50"
        >
          Cancel
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warehouse Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Northeast Logistics Hub"
                          className="font-bold uppercase"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
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
                      <FormLabel>Physical Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Complete storage hub address"
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
                    <FormLabel>State *</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full h-10 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                      >
                        <option value="">Select State...</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Delhi">Delhi</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warehouse Manager *</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name of manager" {...field} />
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
                      <FormLabel>Contact Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 00000 00000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2 bg-blue-600 hover:bg-blue-700 px-8 h-11 text-sm font-bold shadow-lg shadow-blue-100"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "Saving..." : "Synchronize Records"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
