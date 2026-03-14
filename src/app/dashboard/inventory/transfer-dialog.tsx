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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Trash2, ArrowRight } from "lucide-react";
import { searchVariants } from "@/actions/inventory/search";
import { createTransfer } from "@/actions/inventory";
import { toast } from "sonner";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

interface TransferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  outletId: string;
  userId: string;
  warehouses: { id: string; name: string }[];
}

export function TransferDialog({
  isOpen,
  onClose,
  outletId,
  userId,
  warehouses,
}: TransferDialogProps) {
  const [fromWh, setFromWh] = useState<string>("");
  const [toWh, setToWh] = useState<string>("");
  const [items, setItems] = useState<any[]>([]);
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

  const addItem = (variant: any) => {
    if (items.some((i) => i.id === variant.id)) {
      toast.error("Item already added");
      return;
    }
    setItems([...items, { ...variant, quantity: 1 }]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const updateQty = (id: string, qty: number) => {
    setItems(items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  };

  const handleTransfer = () => {
    if (!fromWh || !toWh) {
      toast.error("Please select both warehouses");
      return;
    }
    if (fromWh === toWh) {
      toast.error("Source and Target cannot be same");
      return;
    }
    if (items.length === 0) {
      toast.error("Add at least one item");
      return;
    }

    startTransition(async () => {
      try {
        await createTransfer(outletId, userId, {
          fromWarehouseId: fromWh,
          toWarehouseId: toWh,
          items: items.map((i) => ({ variantId: i.id, quantity: i.quantity })),
        });
        toast.success("Stock transfer dispatched!");
        onClose();
        setItems([]);
        setFromWh("");
        setToWh("");
      } catch (error: any) {
        toast.error(error.message || "Failed to create transfer");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Stock Transfer
            <Badge
              variant="outline"
              className="ml-2 font-normal text-[10px] uppercase tracking-wider"
            >
              M03-S03
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 flex-1 overflow-y-auto">
          {/* Warehouse Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-slate-500 font-bold">
                Source Warehouse
              </Label>
              <Select
                value={fromWh}
                onValueChange={(val) => setFromWh(val || "")}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select source">
                    {warehouses.find((w) => w.id === fromWh)?.name}
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
            <div className="space-y-2">
              <Label className="text-xs uppercase text-slate-500 font-bold flex items-center gap-2">
                <ArrowRight className="h-3 w-3" /> Target Warehouse
              </Label>
              <Select value={toWh} onValueChange={(val) => setToWh(val || "")}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select target">
                    {warehouses.find((w) => w.id === toWh)?.name}
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
          </div>

          {/* Product Search */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search products by SKU or Name..."
                className="pl-9 h-11"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />

              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-xl z-50 max-h-60 overflow-y-auto overflow-x-hidden">
                  {searchResults.map((variant) => (
                    <button
                      key={variant.id}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between group border-b border-slate-50 last:border-0"
                      onClick={() => addItem(variant)}
                    >
                      <div>
                        <div className="font-medium text-slate-900 group-hover:text-brand">
                          {variant.product.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {variant.sku}
                        </div>
                      </div>
                      <Plus className="h-4 w-4 text-slate-300 group-hover:text-brand" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="w-[120px]">SKU</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="w-[120px] text-right">Qty</TableHead>
                    <TableHead className="w-[80px] text-right">Unit</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-slate-400"
                      >
                        No items added yet. Search and add products above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs text-slate-500">
                          {item.sku}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.product.name}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="h-8 text-right font-bold w-24 ml-auto"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQty(item.id, Number(e.target.value))
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right text-slate-500 text-xs uppercase">
                          {item.product.baseUnit}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-slate-100 pt-4 p-6 bg-slate-50/30">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            className="bg-brand hover:bg-brand/90 px-8 font-bold"
            onClick={handleTransfer}
            disabled={isPending}
          >
            {isPending ? "Processing..." : "Dispatch Transfer"}
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
