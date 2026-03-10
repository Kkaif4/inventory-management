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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

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

  const form = useForm<AdjustmentFormValues>({
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
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">
              Stock Adjustment
            </h2>
            <p className="text-sm text-text-muted">
              Manually correct or initialize physical stock levels.
            </p>
          </div>
        </div>
        <Link href="/dashboard/inventory/current-stock">
          <Button variant="secondary" className="hover:bg-surface-hover">
            Cancel
          </Button>
        </Link>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="bg-surface border-border/50 shadow-none">
            <CardHeader className="border-b border-border/50 pb-4 bg-surface-elevated/20">
              <CardTitle className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                Adjustment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <FormField
                control={form.control}
                name="variantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Product Variant *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Search for product..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {variants.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.product.name} ({v.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.type === "WAREHOUSE"
                              ? "Warehouse: "
                              : "Outlet: "}
                            {l.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adjustment Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ADDITION">Addition (+)</SelectItem>
                          <SelectItem value="DEDUCTION">
                            Deduction (-)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason / Remark *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Initial stock entry, damaged goods, physical count correction..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end sticky bottom-6 z-10 bg-surface/80 backdrop-blur-xl p-4 shadow-2xl shadow-indigo-900/10 rounded-xl border border-border/60">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 px-8"
              size="lg"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? "Processing..." : "Process Adjustment"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
