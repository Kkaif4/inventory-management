"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, AlertCircle } from "lucide-react";
import { searchVariants } from "@/actions/inventory/search";
import { createAdjustment } from "@/actions/inventory";
import { toast } from "sonner";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

interface AdjustmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  outletId: string;
  userId: string;
  warehouses: { id: string; name: string }[];
}

export function AdjustmentDialog({
  isOpen,
  onClose,
  outletId,
  userId,
  warehouses,
}: AdjustmentDialogProps) {
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState<string>("0");
  const [reason, setReason] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.length > 2) {
      const res = await searchVariants(outletId, val);
      if (res.success) setSearchResults(res.data!);
      else setSearchResults([]);
    } else {
      setSearchResults([]);
    }
  };

  const selectVariant = (variant: any) => {
    setSelectedVariant(variant);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleAdjustment = () => {
    if (!warehouseId) {
      toast.error("Please select a warehouse");
      return;
    }
    if (!selectedVariant) {
      toast.error("Please select a product");
      return;
    }
    const qty = parseFloat(quantity);
    if (qty === 0 || isNaN(qty)) {
      toast.error("Please enter a valid non-zero quantity");
      return;
    }
    if (!reason) {
      toast.error("Reason is required for auditing");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createAdjustment(outletId, userId, {
          warehouseId,
          variantId: selectedVariant.id,
          quantity: qty,
          reason,
        });

        if (!res.success) {
          toast.error(res.error?.message || "Failed to create adjustment");
          return;
        }

        const result = res.data!;
        if (result.status === "PENDING_APPROVAL") {
          toast.info("Adjustment exceeds threshold. Sent for Admin approval.");
        } else {
          toast.success("Stock adjusted successfully!");
        }

        onClose();
        setWarehouseId("");
        setSelectedVariant(null);
        setQuantity("0");
        setReason("");
      } catch (error: any) {
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            Inventory Adjustment
            <Badge
              variant="outline"
              className="ml-2 font-normal text-[10px] uppercase"
            >
              M03-S04
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Warehouse */}
          <div className="space-y-2">
            <Label className="text-xs uppercase text-slate-500 font-bold">
              Target Warehouse
            </Label>
            <Select
              value={warehouseId}
              onValueChange={(val) => setWarehouseId(val || "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select warehouse">
                  {warehouses.find((w) => w.id === warehouseId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Search or Display */}
          <div className="space-y-2">
            <Label className="text-xs uppercase text-slate-500 font-bold">
              Product to Adjust
            </Label>
            {selectedVariant ? (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <div className="font-bold text-slate-900">
                    {selectedVariant.product.name}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {selectedVariant.sku}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedVariant(null)}
                  className="h-7 text-xs text-slate-400"
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search SKU or Name..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                    {searchResults.map((v) => (
                      <button
                        key={v.id}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 border-b last:border-0"
                        onClick={() => selectVariant(v)}
                      >
                        <div className="font-medium text-sm">
                          {v.product.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {v.sku}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Qty & Reason */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-slate-500 font-bold">
                Qty Delta (+/-)
              </Label>
              <Input
                type="number"
                placeholder="e.g +10 or -5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="font-bold text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-slate-500 font-bold">
                Reason
              </Label>
              <Select
                value={reason}
                onValueChange={(val) => setReason(val || "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Reason Code">
                    {reason === "DAMAGED" && "Damaged Goods"}
                    {reason === "STOCK_OUT" && "Stock Outdated"}
                    {reason === "CORRECTION" && "Data Entry Correction"}
                    {reason === "FOUND" && "Found in Audit"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAMAGED">Damaged Goods</SelectItem>
                  <SelectItem value="STOCK_OUT">Stock Outdated</SelectItem>
                  <SelectItem value="CORRECTION">
                    Data Entry Correction
                  </SelectItem>
                  <SelectItem value="FOUND">Found in Audit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {Math.abs(parseFloat(quantity)) > 50 && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex gap-2 items-start">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-xs text-amber-700">
                Large adjustment detected. This will require Admin approval
                before stock is updated.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleAdjustment}
            disabled={isPending}
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            {isPending ? "Submitting..." : "Apply Adjustment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Badge({ children, variant, className }: any) {
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded text-[10px] font-bold border",
        variant === "outline" ? "border-slate-300 text-slate-500" : "",
        className,
      )}
    >
      {children}
    </span>
  );
}
