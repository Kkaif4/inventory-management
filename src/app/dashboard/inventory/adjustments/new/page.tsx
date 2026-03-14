"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useOutletStore } from "@/store/use-outlet-store";

import {
  createStockAdjustment,
  getInventoryLocations,
  getVariantsForSelection,
} from "@/actions/inventory";
import { Settings2, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  adjustmentSchema,
  AdjustmentFormValues,
} from "@/validations/stock-adjustment.validation";
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

export default function NewAdjustmentPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { currentOutletId } = useOutletStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<
    { id: string; name: string; type: string }[]
  >([]);
  const [variants, setVariants] = useState<any[]>([]);

  if (!currentOutletId) return;
  useEffect(() => {
    Promise.all([
      getInventoryLocations(currentOutletId),
      getVariantsForSelection(currentOutletId),
    ]).then(([locsRes, varsRes]) => {
      if (!locsRes.success || !varsRes.success) {
        toast.error("Failed to load adjustment resources");
        return;
      }

      const locs = locsRes.data!;
      const vars = varsRes.data!;

      // Filter to show only WAREHOUSE
      const warehouseLocs = locs.warehouses.map((w) => ({
        ...w,
        type: "WAREHOUSE",
      }));
      const outletLocs = locs.outlets.map((o) => ({
        ...o,
        type: "OUTLET",
      }));
      setLocations([...warehouseLocs, ...outletLocs] as any);
      setVariants(vars);
    });
  }, []);

  const form = useForm<z.infer<typeof adjustmentSchema>>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      items: [{ variantId: "", quantity: 1, type: "ADDITION" }],
      reason: "",
      location: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = async (data: AdjustmentFormValues) => {
    try {
      setIsSubmitting(true);
      const selectedLoc = locations.find((l) => l.id === data.location);
      if (!selectedLoc) return;

      const res = await createStockAdjustment(
        currentOutletId,
        session?.user?.id as string,
        {
          locationId: data.location,
          reason: data.reason,
          items: data.items,
        },
      );

      if (res.success) {
        toast.success("Inventory adjusted successfully");
        router.push("/dashboard/inventory/current-stock");
        router.refresh();
      } else {
        toast.error("Failed to adjust inventory: " + res.error?.message);
      }
    } catch (error) {
      console.error("Failed to adjust stock:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to adjust stock",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Warehouse Only) *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select warehouse..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((l) => (
                            <SelectItem key={l.id} value={l.id}>
                              {l.name}
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
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason / Remark *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Initial stock entry, damaged goods..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                    Adjusted Items
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      append({ variantId: "", quantity: 1, type: "ADDITION" })
                    }
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-12 gap-4 items-end bg-surface-elevated/10 p-4 rounded-lg border border-border/30 relative group"
                    >
                      <div className="col-span-12 md:col-span-5">
                        <FormField
                          control={form.control}
                          name={`items.${index}.variantId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Variant *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select product..." />
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
                      </div>

                      <div className="col-span-12 md:col-span-3">
                        <FormField
                          control={form.control}
                          name={`items.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="ADDITION">
                                    Addition (+)
                                  </SelectItem>
                                  <SelectItem value="DEDUCTION">
                                    Deduction (-)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-10 md:col-span-3">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Qty *</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2 md:col-span-1 flex justify-center pb-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={() => index > 0 && remove(index)}
                          disabled={index === 0 && fields.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
