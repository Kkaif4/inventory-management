"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Plus, Trash2, Printer } from "lucide-react";
import { roundToTwo } from "@/lib/utils";

export function POSClient({ variants }: { variants: any[] }) {
  const [items, setItems] = useState<
    { variantId: string; quantity: number; rate: number }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () =>
    setItems([...items, { variantId: "", quantity: 1, rate: 0 }]);
  const removeItem = (idx: number) =>
    setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, key: string, val: any) => {
    const newItems = [...items];
    (newItems[idx] as any)[key] = val;

    // Auto-fill rate if variant selected
    if (key === "variantId") {
      const v = variants.find((v) => v.id === val);
      if (v) newItems[idx].rate = v.sellingPrice || 0;
    }
    setItems(newItems);
  };

  const total = items.reduce((acc, it) => acc + it.quantity * it.rate, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Direct Cash Sale (POS)"
        subtitle="Quick billing for walk-in customers."
        breadcrumbs={[{ label: "Sales" }, { label: "POS" }]}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 bg-surface-base border border-border-default rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-text-primary">
              Current Bill
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={addItem}
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> Add Item (F2)
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((it, idx) => (
              <div
                key={idx}
                className="flex gap-4 items-end border-b border-border-default pb-3"
              >
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-muted">
                    Product
                  </label>
                  <select
                    className="w-full h-10 rounded-md border border-input px-3 text-sm"
                    value={it.variantId}
                    onChange={(e) =>
                      updateItem(idx, "variantId", e.target.value)
                    }
                  >
                    <option value="">Select...</option>
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.product.name} ({v.sku})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-muted">
                    Qty
                  </label>
                  <Input
                    type="number"
                    value={it.quantity}
                    onChange={(e) =>
                      updateItem(idx, "quantity", Number(e.target.value))
                    }
                  />
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-muted">
                    Rate
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={it.rate}
                    onChange={(e) =>
                      updateItem(idx, "rate", Number(e.target.value))
                    }
                  />
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-muted">
                    Total
                  </label>
                  <div className="h-10 flex items-center font-bold text-sm">
                    ₹{roundToTwo(it.quantity * it.rate).toFixed(2)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(idx)}
                  className="text-red-500 mb-1"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {items.length === 0 && (
              <div className="text-center py-10 text-text-muted italic">
                Scan product or click &quot;Add Item&quot; to begin.
              </div>
            )}
          </div>
        </div>

        <div className="col-span-4 space-y-6">
          <div className="bg-primary text-secondary rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center text-secondary/70">
              <span>Sub-Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-secondary/70">
              <span>Taxes (Included)</span>
              <span>₹0.00</span>
            </div>
            <div className="border-t border-secondary/20 pt-4 flex justify-between items-center text-2xl font-bold">
              <span>Grand Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <Button
              className="w-full h-14 text-lg bg-secondary text-primary hover:bg-secondary/90 gap-2 mt-4"
              disabled={total === 0 || isSubmitting}
            >
              <Printer className="w-5 h-5" />
              {isSubmitting ? "Processing..." : "PAY & PRINT (F8)"}
            </Button>
          </div>

          <div className="bg-surface-base border border-border-default rounded-lg p-4 text-xs space-y-2">
            <h4 className="font-bold text-text-secondary">Shortcuts</h4>
            <div className="flex justify-between">
              <span>Add Item</span>
              <kbd className="bg-surface-muted px-1 rounded">F2</kbd>
            </div>
            <div className="flex justify-between">
              <span>Focus Search</span>
              <kbd className="bg-surface-muted px-1 rounded">F4</kbd>
            </div>
            <div className="flex justify-between">
              <span>Complete Sale</span>
              <kbd className="bg-surface-muted px-1 rounded">F8</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
