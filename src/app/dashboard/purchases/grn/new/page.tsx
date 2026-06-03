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
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

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
        hasSerialNumbers: z.boolean().optional(),
        serialNumbersText: z.string().optional(),
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
    return null;
  }

  useEffect(() => {
    getPurchaseOrders(currentOutlet.id).then((res) => {
      if (res.success) {
        setPurchaseOrders(res.data!);
      } else {
        toast.error("Failed to load purchase orders: " + res.error?.message);
      }
    });
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
      hasSerialNumbers: item.variant.product.hasSerialNumbers,
      serialNumbersText: "",
    }));

    replace(grnItems);
    setValue("poId", id);
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "productName",
      header: "Item / SKU",
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-medium text-slate-900">
            {row.original.productName}
          </div>
          <div className="text-xs text-slate-500">{row.original.sku}</div>
        </div>
      ),
    },
    {
      accessorKey: "orderedQty",
      header: () => <div className="text-center">Ordered Qty</div>,
      cell: ({ row }) => (
        <div className="text-center text-sm text-slate-600 font-medium">
          {row.original.orderedQty}
        </div>
      ),
    },
    {
      id: "receivedQty",
      header: () => <div className="text-right">Received Qty</div>,
      cell: ({ row }) => (
        <div className="text-right space-y-2">
          <input
            type="number"
            step="0.01"
            {...register(`items.${row.index}.quantityReceived` as const)}
            className="w-32 px-3 py-1.5 text-sm border border-slate-300 rounded-md text-right focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          {row.original.hasSerialNumbers && (
            <div className="text-left mt-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">
                Serial Numbers (one per line)
              </label>
              <textarea
                rows={3}
                placeholder="Enter serial numbers..."
                {...register(`items.${row.index}.serialNumbersText` as const)}
                className="w-full text-xs font-mono border border-slate-300 rounded-md p-1.5 focus:ring-2 focus:ring-emerald-500 outline-none mt-1"
              />
            </div>
          )}
        </div>
      ),
    },
  ];

  const onSubmit = async (data: GRNFormValues) => {
    try {
      // Validate serial numbers count match quantityReceived
      for (const item of data.items) {
        if (item.hasSerialNumbers) {
          const sns = item.serialNumbersText
            ? item.serialNumbersText
                .split("\n")
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
            : [];
          if (sns.length !== Number(item.quantityReceived)) {
            toast.error(
              `Item "${item.productName}" requires exactly ${item.quantityReceived} serial numbers. You entered ${sns.length}.`
            );
            return;
          }
        }
      }

      setIsSubmitting(true);
      const res = await createGRN({
        poId: data.poId,
        items: data.items.map((i) => ({
          variantId: i.variantId,
          quantityReceived: i.quantityReceived,
          serialNumbers: i.hasSerialNumbers && i.serialNumbersText
            ? i.serialNumbersText
                .split("\n")
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
            : undefined,
        })),
        userId: session?.user?.id!,
      });
      if (res.success) {
        toast.success("GRN created successfully");
        router.push("/dashboard/inventory/current-stock");
        router.refresh();
      } else {
        toast.error("Failed to create GRN: " + res.error?.message);
      }
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
                <DataTable columns={columns} data={fields} />
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
