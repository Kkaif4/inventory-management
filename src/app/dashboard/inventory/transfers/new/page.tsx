"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useOutletStore } from "@/store/use-outlet-store";
import {
  createStockTransfer,
  getInventoryLocations,
  getVariantsForSelection,
} from "@/actions/inventory";
import { InventoryFilter, StockStatus } from "@/actions/inventory/types";
import { ArrowRightLeft, Save } from "lucide-react";
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
import {
  TransferFormValues,
  transferSchema,
} from "@/validations/transfer.validation";

export default function NewTransferPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { currentOutletId } = useOutletStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<
    { id: string; name: string; type: string }[]
  >([]);
  const [variants, setVariants] = useState<any[]>([]);

  useEffect(() => {
    if (!currentOutletId) return;
    Promise.all([
      getInventoryLocations(currentOutletId),
      getVariantsForSelection(currentOutletId),
    ]).then(([locsRes, varsRes]) => {
      if (!locsRes.success) {
        toast.error(
          "Failed to load inventory locations: " + locsRes.error?.message,
        );
        return;
      }
      if (!varsRes.success) {
        toast.error(
          "Failed to load product variants: " + varsRes.error?.message,
        );
        return;
      }
      const locs = locsRes.data!;
      const vars = varsRes.data!;

      const combinedLocs = [
        ...locs.warehouses.map((w) => ({ ...w, type: "WAREHOUSE" })),
        ...locs.outlets.map((o) => ({ ...o, type: "OUTLET" })),
      ];
      setLocations(combinedLocs);
      setVariants(vars);
    });
  }, [currentOutletId]);

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const onSubmit = async (data: TransferFormValues) => {
    try {
      setIsSubmitting(true);
      const fromLoc = locations.find((l) => l.id === data.fromLocation);
      const toLoc = locations.find((l) => l.id === data.toLocation);

      if (!fromLoc || !toLoc) {
        toast.error("Source or destination location not found.");
        return;
      }

      const res = await createStockTransfer(
        currentOutletId!,
        session?.user?.id as string,
        {
          variantId: data.variantId,
          fromLocationId: data.fromLocation,
          fromLocationType: fromLoc.type as any,
          toLocationId: data.toLocation,
          toLocationType: toLoc.type as any,
          quantity: data.quantity,
        },
      );

      if (res.success) {
        toast.success("Stock transfer dispatched!");
        router.push("/dashboard/inventory");
        router.refresh();
      } else {
        toast.error("Failed to dispatch transfer: " + res.error?.message);
      }
    } catch (error: any) {
      console.error("Failed to transfer stock:", error);
      toast.error(
        error.message ||
          "Failed to transfer stock. Check if source has enough quantity.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">
              Stock Transfer
            </h2>
            <p className="text-sm text-text-muted">
              Move products securely between warehouses or outlets.
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
                Transfer Details
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fromLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Location *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source..." />
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

                <FormField
                  control={form.control}
                  name="toLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination Location *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination..." />
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
              </div>

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transfer Quantity *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
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
              {isSubmitting ? "Transferring..." : "Complete Transfer"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
