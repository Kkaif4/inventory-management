"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CategoryComboboxWithCreate } from "@/components/form/category-combobox-with-create";
import { getCategories } from "@/actions/categories";
import { createProduct } from "@/actions/products";
import { PRODUCT_UNITS } from "@/lib/constants";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface QuickProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outletId: string;
  userId?: string;
  onProductCreated?: (product: any, variant: any) => void;
  initialName?: string;
}

export function QuickProductDialog({
  open,
  onOpenChange,
  outletId,
  userId = "system",
  onProductCreated,
  initialName = "",
}: QuickProductDialogProps) {
  const [categories, setCategories] = React.useState<{ id: string; name: string }[]>([]);
  const [name, setName] = React.useState(initialName);
  const [categoryId, setCategoryId] = React.useState("");
  const [baseUnit, setBaseUnit] = React.useState("PCS");
  const [purchasePrice, setPurchasePrice] = React.useState<string>("");
  const [sellingPrice, setSellingPrice] = React.useState<string>("");
  const [gstRate, setGstRate] = React.useState<number>(18);
  const [hsnCode, setHsnCode] = React.useState("");
  const [sku, setSku] = React.useState("");
  const [hasSerialNumbers, setHasSerialNumbers] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName(initialName);
      getCategories().then((res) => {
        if (res.success && res.data) {
          setCategories(res.data.map((c: any) => ({ id: c.id, name: c.name })));
        }
      });
    }
  }, [open, initialName]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Product name is required");
      return;
    }
    if (!categoryId) {
      toast.error("Please select or create a category");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createProduct({
        name: trimmedName,
        categoryId,
        baseUnit,
        purchaseUnit: baseUnit,
        conversionRatio: 1,
        gstRate: Number(gstRate) || 0,
        hsnCode: hsnCode.trim() || null,
        hasSerialNumbers,
        warrantyMonths: 0,
        outletId,
        userId,
        variants: [
          {
            sku: sku.trim() || "",
            purchasePrice: parseFloat(purchasePrice) || 0,
            sellingPrice: parseFloat(sellingPrice) || 0,
            pricingMethod: "MANUAL",
            minStockLevel: 0,
            specifications: {},
          },
        ],
      });

      if (res.success && res.data) {
        toast.success(`Product "${trimmedName}" created successfully`);
        const product = res.data;
        const variant = product.variants?.[0];
        if (onProductCreated) {
          onProductCreated(product, variant);
        }
        onOpenChange(false);
        // Reset form
        setName("");
        setCategoryId("");
        setPurchasePrice("");
        setSellingPrice("");
        setHsnCode("");
        setSku("");
        setHasSerialNumbers(false);
      } else {
        toast.error(res.error?.message || "Failed to create product");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Create New Product / Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="quick-product-name" className="text-xs font-semibold">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quick-product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wireless Mouse, Cement 50kg"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Category <span className="text-destructive">*</span>
            </Label>
            <CategoryComboboxWithCreate
              categories={categories}
              value={categoryId}
              onChange={setCategoryId}
              outletId={outletId}
              userId={userId}
              placeholder="Select or type to create category..."
              onCategoryCreated={(cat) => setCategories((prev) => [...prev, cat])}
              onCategoryUpdated={(cat) =>
                setCategories((prev) =>
                  prev.map((c) => (c.id === cat.id ? cat : c))
                )
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Base Unit</Label>
              <select
                value={baseUnit}
                onChange={(e) => setBaseUnit(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus:ring-1 focus:ring-ring"
              >
                {PRODUCT_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label} ({u.value})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">GST Rate (%)</Label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus:ring-1 focus:ring-ring"
              >
                <option value={0}>0% (Exempt / Nil)</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18%</option>
                <option value={28}>28%</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quick-purchase-price" className="text-xs font-semibold">
                Purchase Price (₹)
              </Label>
              <Input
                id="quick-purchase-price"
                type="number"
                step="0.01"
                min="0"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quick-selling-price" className="text-xs font-semibold">
                Selling Price (₹)
              </Label>
              <Input
                id="quick-selling-price"
                type="number"
                step="0.01"
                min="0"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quick-hsn" className="text-xs font-semibold">
                HSN Code
              </Label>
              <Input
                id="quick-hsn"
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                placeholder="e.g. 8471"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quick-sku" className="text-xs font-semibold">
                SKU (optional)
              </Label>
              <Input
                id="quick-sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Auto-generated if empty"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <div className="space-y-0.5">
              <Label htmlFor="quick-has-serial" className="text-xs font-semibold cursor-pointer">
                Track Serial Numbers
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Enable if items have unique serial / IMEI numbers
              </p>
            </div>
            <Switch
              id="quick-has-serial"
              checked={hasSerialNumbers}
              onCheckedChange={setHasSerialNumbers}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim() || !categoryId}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
