"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createGRN, getPurchaseOrders } from "@/actions/procurement";
import { Truck, Save, PackageCheck } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useOutletStore } from "@/store/use-outlet-store";

const grnSchema = z.object({
  poId: z.string().min(1, "Select a PO"),
  items: z
    .array(
      z.object({
        variantId: z.string(),
        sku: z.string(),
        productName: z.string(),
        orderedQty: z.number(),
        quantityReceived: z.coerce.number().min(0, "Invalid qty"),
      }),
    )
    .min(1),
});

type GRNFormValues = z.infer<typeof grnSchema>;

export default function NewGRNPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const { currentOutlet } = useOutletStore();
  if (!currentOutlet) {
    return;
  }

  useEffect(() => {
    getPurchaseOrders(currentOutlet.id).then(setPurchaseOrders);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<GRNFormValues>({
    resolver: zodResolver(grnSchema) as any,
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "items",
  });

  const handlePOSelect = (id: string) => {
    const po = purchaseOrders.find((p) => p.id === id);
    if (!po) {
      setSelectedPO(null);
      replace([]);
      return;
    }

    setSelectedPO(po);
    const grnItems = po.items.map((item: any) => ({
      variantId: item.variantId,
      sku: item.variant.sku,
      productName: item.variant.product.name,
      orderedQty: item.quantity,
      quantityReceived: item.quantity, // Default to full receipt
    }));

    replace(grnItems);
    setValue("poId", id);
  };

  const onSubmit = async (data: GRNFormValues) => {
    try {
      setIsSubmitting(true);
      await createGRN({
        poId: data.poId,
        items: data.items.map((i) => ({
          variantId: i.variantId,
          quantityReceived: i.quantityReceived,
        })),
        userId: session?.user?.id!,
      });
      router.push("/dashboard/inventory/current-stock");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to process GRN");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Goods Receipt Note (GRN)
            </h2>
            <p className="text-sm text-slate-500">
              Record physical arrival of goods.
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
              Select Purchase Order *
            </label>
            <select
              {...register("poId")}
              onChange={(e) => handlePOSelect(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
            >
              <option value="">Select Pending PO...</option>
              {purchaseOrders.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.txnNumber} - {po.party?.name} (
                  {new Date(po.date).toLocaleDateString()})
                </option>
              ))}
            </select>
            {errors.poId && (
              <p className="text-red-500 text-xs mt-1">{errors.poId.message}</p>
            )}
          </div>

          {selectedPO && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center">
                <PackageCheck className="w-4 h-4 mr-2" /> Line Items Receipt
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs font-medium text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Item / SKU</th>
                      <th className="px-4 py-3 text-center">Ordered Qty</th>
                      <th className="px-6 py-3 w-48 text-right">
                        Received Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fields.map((field, index) => (
                      <tr key={field.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">
                            {field.productName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {field.sku}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-slate-600 font-medium">
                          {field.orderedQty}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <input
                            type="number"
                            step="0.01"
                            {...register(
                              `items.${index}.quantityReceived` as const,
                            )}
                            className="w-32 px-3 py-1.5 text-sm border border-slate-300 rounded-md text-right focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 text-white px-10 py-3 rounded-lg hover:bg-emerald-700 font-bold text-lg flex items-center shadow-lg disabled:opacity-50"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Saving GRN..." : "Confirm Stock Receipt"}
                </button>
              </div>
            </div>
          )}

          {!selectedPO && (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-xl">
              <div className="flex flex-col items-center">
                <Truck className="w-12 h-12 text-slate-200 mb-3" />
                <p className="text-slate-400">
                  Please select a Purchase Order to begin receiving stock.
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
