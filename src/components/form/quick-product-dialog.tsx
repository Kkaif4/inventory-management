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
import { createProduct, getNextSkuNumber } from "@/actions/products";
import { PRODUCT_UNITS } from "@/lib/constants";
import { getTaxInfoByCategory } from "@/lib/category-tax-map";
import { getGstRateByHsn } from "@/lib/hsn-data";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  Package,
  Layers,
  Percent,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

interface VariantItem {
  name: string;
  sku: string;
  purchasePrice: number | string;
  sellingPrice: number | string;
  pricingMethod: "MANUAL" | "MARKUP";
  markupPercent: number | string;
  minStockLevel: number | string;
}

interface QuickProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outletId: string;
  userId?: string;
  onProductCreated?: (product: any, variant: any) => void;
  initialName?: string;
}

function buildSkuPrefix(categoryName: string, productName: string): string {
  const cat = categoryName
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .substring(0, 2)
    .padEnd(2, "X");
  const name = productName
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .substring(0, 3)
    .padEnd(3, "X");
  return `${cat}-${name}`;
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
  
  // Basic Details
  const [name, setName] = React.useState(initialName);
  const [brand, setBrand] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");

  // Taxation
  const [hsnCode, setHsnCode] = React.useState("");
  const [gstRate, setGstRate] = React.useState<number>(18);

  // Units
  const [baseUnit, setBaseUnit] = React.useState("PCS");
  const [purchaseUnit, setPurchaseUnit] = React.useState("PCS");
  const [conversionRatio, setConversionRatio] = React.useState("1");
  const [hasCustomPurchaseUnit, setHasCustomPurchaseUnit] = React.useState(false);

  // Serial & Warranty
  const [hasSerialNumbers, setHasSerialNumbers] = React.useState(false);
  const [warrantyMonths, setWarrantyMonths] = React.useState<number | string>("0");

  // Single Mode Pricing & SKU
  const [singlePurchasePrice, setSinglePurchasePrice] = React.useState<string>("");
  const [singleSellingPrice, setSingleSellingPrice] = React.useState<string>("");
  const [singleMinStock, setSingleMinStock] = React.useState<string>("0");
  const [singleSku, setSingleSku] = React.useState<string>("");
  const [showAdvancedSku, setShowAdvancedSku] = React.useState(false);
  const [isGeneratingSku, setIsGeneratingSku] = React.useState(false);

  // Multi-variant mode
  const [showVariants, setShowVariants] = React.useState(false);
  const [variants, setVariants] = React.useState<VariantItem[]>([
    {
      name: "Default",
      sku: "",
      purchasePrice: "",
      sellingPrice: "",
      pricingMethod: "MANUAL",
      markupPercent: "0",
      minStockLevel: "0",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Pre-load categories on mount
  React.useEffect(() => {
    getCategories().then((res) => {
      if (res.success && res.data) {
        setCategories(res.data.map((c: any) => ({ id: c.id, name: c.name })));
      }
    });
  }, []);

  // Update on dialog open
  React.useEffect(() => {
    if (open) {
      setName(initialName);
    }
  }, [open, initialName]);

  // Auto SKU Generator
  React.useEffect(() => {
    if (!name.trim() || name.trim().length < 2 || !categoryId || !outletId) return;

    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return;

    const prefix = buildSkuPrefix(cat.name, name);
    const timer = setTimeout(async () => {
      setIsGeneratingSku(true);
      try {
        const nextNum = await getNextSkuNumber(prefix, outletId);
        if (nextNum?.success && nextNum.data) {
          const generated = `${prefix}-${nextNum.data}`;
          if (!singleSku || singleSku.startsWith(`${prefix}-`)) {
            setSingleSku(generated);
          }
        }
      } catch (err) {
        console.error("Failed to auto-generate SKU", err);
      } finally {
        setIsGeneratingSku(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [name, categoryId, categories, outletId]);

  const handleCategorySelect = (selectedId: string) => {
    setCategoryId(selectedId);
    const cat = categories.find((c) => c.id === selectedId);
    if (cat) {
      const taxInfo = getTaxInfoByCategory(cat.name);
      if (taxInfo.hsnCode) setHsnCode(taxInfo.hsnCode);
      if (taxInfo.gstRate !== undefined) setGstRate(taxInfo.gstRate);
    }
  };

  const handleBaseUnitChange = (newBase: string) => {
    setBaseUnit(newBase);
    if (!hasCustomPurchaseUnit) {
      setPurchaseUnit(newBase);
      setConversionRatio("1");
    }
  };

  const handlePurchaseUnitChange = (newPurchase: string) => {
    setPurchaseUnit(newPurchase);
    setHasCustomPurchaseUnit(newPurchase !== baseUnit);
    if (newPurchase === baseUnit) {
      setConversionRatio("1");
    }
  };

  // Add new variant in multi-variant mode
  const handleAddVariant = () => {
    const nextIndex = variants.length + 1;
    const cat = categories.find((c) => c.id === categoryId);
    const prefix = cat && name ? buildSkuPrefix(cat.name, name) : "VAR";

    setVariants((prev) => [
      ...prev,
      {
        name: `Variant ${nextIndex}`,
        sku: `${prefix}-${String(nextIndex).padStart(3, "0")}`,
        purchasePrice: singlePurchasePrice || "",
        sellingPrice: singleSellingPrice || "",
        pricingMethod: "MANUAL",
        markupPercent: "0",
        minStockLevel: singleMinStock || "0",
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof VariantItem, value: any) => {
    setVariants((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };

        // Auto-calculate selling price if markup is enabled
        if (field === "pricingMethod" && value === "MARKUP") {
          const cost = parseFloat(String(updated.purchasePrice)) || 0;
          const markup = parseFloat(String(updated.markupPercent)) || 0;
          updated.sellingPrice = Math.round(cost * (1 + markup / 100) * 100) / 100;
        } else if (field === "markupPercent" && updated.pricingMethod === "MARKUP") {
          const cost = parseFloat(String(updated.purchasePrice)) || 0;
          const markup = parseFloat(String(value)) || 0;
          updated.sellingPrice = Math.round(cost * (1 + markup / 100) * 100) / 100;
        } else if (field === "purchasePrice" && updated.pricingMethod === "MARKUP") {
          const cost = parseFloat(String(value)) || 0;
          const markup = parseFloat(String(updated.markupPercent)) || 0;
          updated.sellingPrice = Math.round(cost * (1 + markup / 100) * 100) / 100;
        } else if (field === "purchasePrice" && updated.pricingMethod === "MANUAL") {
          if (!updated.sellingPrice || updated.sellingPrice === item.purchasePrice) {
            updated.sellingPrice = value;
          }
        }

        return updated;
      })
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      toast.error("Product name must be at least 2 characters");
      return;
    }

    if (!categoryId) {
      toast.error("Please select or create a category");
      return;
    }

    if (!baseUnit) {
      toast.error("Base (Selling) unit is required");
      return;
    }

    const parsedRatio = parseFloat(conversionRatio);
    if (isNaN(parsedRatio) || parsedRatio <= 0) {
      toast.error("Conversion ratio must be a valid positive number");
      return;
    }

    if (gstRate > 0 && !hsnCode.trim()) {
      toast.error("HSN Code is required when GST rate is greater than 0%");
      return;
    }

    let variantPayloads: any[] = [];

    if (showVariants) {
      if (variants.length === 0) {
        toast.error("Please add at least one product variant");
        return;
      }

      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const cost = parseFloat(String(v.purchasePrice)) || 0;
        const sell = parseFloat(String(v.sellingPrice)) || 0;
        const minStock = parseFloat(String(v.minStockLevel)) || 0;
        const markup = parseFloat(String(v.markupPercent)) || 0;

        if (cost < 0 || sell < 0) {
          toast.error(`Variant ${i + 1} prices cannot be negative`);
          return;
        }

        variantPayloads.push({
          sku: v.sku.trim() || `AUTO-${Date.now()}-${i}`,
          purchasePrice: cost,
          sellingPrice: sell,
          pricingMethod: v.pricingMethod || "MANUAL",
          markupPercent: markup,
          minStockLevel: minStock,
          specifications: v.name ? { variantName: v.name } : {},
        });
      }
    } else {
      const cost = singlePurchasePrice.trim() ? parseFloat(singlePurchasePrice) : 0;
      const sell = singleSellingPrice.trim() ? parseFloat(singleSellingPrice) : 0;
      const minStock = parseFloat(singleMinStock) || 0;

      if (cost < 0 || sell < 0) {
        toast.error("Prices cannot be negative");
        return;
      }

      variantPayloads.push({
        sku: singleSku.trim() || "",
        purchasePrice: cost,
        sellingPrice: sell,
        pricingMethod: "MANUAL",
        minStockLevel: minStock,
        specifications: {},
      });
    }

    setIsSubmitting(true);
    try {
      const res = await createProduct({
        name: trimmedName,
        brand: brand.trim() || null,
        categoryId,
        baseUnit,
        purchaseUnit: purchaseUnit || baseUnit,
        conversionRatio: parsedRatio,
        gstRate: Number(gstRate) || 0,
        hsnCode: hsnCode.trim() || null,
        hasSerialNumbers,
        warrantyMonths: hasSerialNumbers ? Number(warrantyMonths) || 0 : 0,
        outletId,
        userId,
        variants: variantPayloads,
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
        setBrand("");
        setCategoryId("");
        setHsnCode("");
        setGstRate(18);
        setBaseUnit("PCS");
        setPurchaseUnit("PCS");
        setConversionRatio("1");
        setHasCustomPurchaseUnit(false);
        setHasSerialNumbers(false);
        setWarrantyMonths("0");
        setSinglePurchasePrice("");
        setSingleSellingPrice("");
        setSingleMinStock("0");
        setSingleSku("");
        setShowVariants(false);
        setVariants([
          {
            name: "Default",
            sku: "",
            purchasePrice: "",
            sellingPrice: "",
            pricingMethod: "MANUAL",
            markupPercent: "0",
            minStockLevel: "0",
          },
        ]);
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
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Create New Product / Item
          </DialogTitle>
          <p className="text-xs text-slate-500">
            Define complete product specifications, taxation, units, and variants directly.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Section 1: Basic Information */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="quick-product-name" className="text-xs font-semibold">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quick-product-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wireless Ergonomic Mouse, Ultra Fast SSD 1TB"
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quick-product-brand" className="text-xs font-semibold">
                  Brand (Optional)
                </Label>
                <Input
                  id="quick-product-brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Logitech, Samsung"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Category <span className="text-destructive">*</span>
              </Label>
              <CategoryComboboxWithCreate
                categories={categories}
                value={categoryId}
                onChange={handleCategorySelect}
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
          </div>

          {/* Section 2: Taxation & Units */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tax Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Taxation & HSN
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="quick-hsn" className="text-xs font-semibold">
                    HSN Code {gstRate > 0 && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="quick-hsn"
                    value={hsnCode}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHsnCode(val);
                      const autoRate = getGstRateByHsn(val);
                      if (autoRate !== null) setGstRate(autoRate);
                    }}
                    placeholder="e.g. 8471"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">GST Rate (%)</Label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-xs shadow-xs outline-none focus:ring-1 focus:ring-ring font-medium"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Serial Numbers Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Warranty & Serial Tracking
                </h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="quick-has-serial" className="text-xs font-semibold cursor-pointer">
                      Individual Serial Numbers / IMEI
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Track unique serials on purchase receipt & sale
                    </p>
                  </div>
                  <Switch
                    id="quick-has-serial"
                    checked={hasSerialNumbers}
                    onCheckedChange={setHasSerialNumbers}
                  />
                </div>
              </div>

              {hasSerialNumbers && (
                <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                  <Label htmlFor="quick-warranty" className="text-xs font-semibold whitespace-nowrap">
                    Warranty (Months):
                  </Label>
                  <Input
                    id="quick-warranty"
                    type="number"
                    min="0"
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(e.target.value)}
                    className="w-24 h-8 text-xs font-semibold"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Units & Packaging Conversion */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <Info className="w-4 h-4 text-blue-600" />
              Units & Packaging Conversion
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-700">
                  Selling Unit (Base) <span className="text-destructive">*</span>
                </Label>
                <select
                  value={baseUnit}
                  onChange={(e) => handleBaseUnitChange(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-white px-2.5 py-1 text-xs shadow-xs outline-none focus:ring-1 focus:ring-ring font-medium"
                >
                  {PRODUCT_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label} ({u.value})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-700">
                  Purchase Unit <span className="text-destructive">*</span>
                </Label>
                <select
                  value={purchaseUnit}
                  onChange={(e) => handlePurchaseUnitChange(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-white px-2.5 py-1 text-xs shadow-xs outline-none focus:ring-1 focus:ring-ring font-medium"
                >
                  {PRODUCT_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label} ({u.value})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="quick-conversion-ratio" className="text-[11px] font-semibold text-slate-700">
                  Conversion Ratio <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quick-conversion-ratio"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={conversionRatio}
                  onChange={(e) => setConversionRatio(e.target.value)}
                  placeholder="1"
                  className="h-9 text-xs bg-white font-semibold"
                  required
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
              <span>
                Packaging formula: 1 {purchaseUnit} = <strong className="text-slate-900 font-bold">{conversionRatio || 1} {baseUnit}</strong>
              </span>
              {purchaseUnit !== baseUnit && (
                <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Procured in {purchaseUnit}, inventory tracked in {baseUnit}
                </span>
              )}
            </div>
          </div>

          {/* Section 4: Progressive Disclosure (Single Pricing vs Multi-Variants) */}
          <div className="flex items-center justify-between p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl">
            <div className="space-y-0.5">
              <Label htmlFor="variants-switch" className="text-xs font-bold text-blue-950 cursor-pointer">
                Multiple Product Variants
              </Label>
              <p className="text-[11px] text-blue-800/80">
                Enable if this product comes in multiple sizes, colors, capacities, or packaging variants
              </p>
            </div>
            <Switch
              id="variants-switch"
              checked={showVariants}
              onCheckedChange={setShowVariants}
            />
          </div>

          {/* Single Mode Pricing */}
          {!showVariants ? (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pricing & Inventory Stock
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="single-purchase" className="text-xs font-semibold">
                    Cost / Purchase Price (₹)
                  </Label>
                  <Input
                    id="single-purchase"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={singlePurchasePrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSinglePurchasePrice(val);
                      // Auto-sync selling price if selling price is empty or was equal to previous cost
                      if (!singleSellingPrice || singleSellingPrice === singlePurchasePrice) {
                        setSingleSellingPrice(val);
                      }
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="single-selling" className="text-xs font-semibold">
                    Selling Price (₹)
                  </Label>
                  <Input
                    id="single-selling"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={singleSellingPrice}
                    onChange={(e) => setSingleSellingPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="single-min-stock" className="text-xs font-semibold">
                    Min Stock Alert Level
                  </Label>
                  <Input
                    id="single-min-stock"
                    type="number"
                    min="0"
                    value={singleMinStock}
                    onChange={(e) => setSingleMinStock(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Advanced SKU Dropdown */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvancedSku((prev) => !prev)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                >
                  {showAdvancedSku ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  Advanced Identifier (SKU / Barcode)
                </button>

                {showAdvancedSku && (
                  <div className="mt-2.5 max-w-sm space-y-1">
                    <Label htmlFor="single-sku" className="text-xs font-semibold">
                      SKU Code
                    </Label>
                    <Input
                      id="single-sku"
                      value={singleSku}
                      onChange={(e) => setSingleSku(e.target.value)}
                      placeholder={isGeneratingSku ? "Generating..." : "Auto-generated SKU"}
                      disabled={isGeneratingSku}
                    />
                    <p className="text-[10px] text-slate-400">
                      Auto-generated from category & name. You can override with a custom barcode.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Multi-Variant Mode */
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Product Variants ({variants.length})
                  </h3>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddVariant}
                  className="h-8 text-xs font-semibold text-blue-700 border-blue-200 bg-blue-50/50 hover:bg-blue-100 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Variant
                </Button>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {variants.map((v, index) => (
                  <div
                    key={index}
                    className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/60 relative group space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Variant #{index + 1}
                      </span>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(index)}
                          className="text-slate-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                          title="Remove variant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 text-xs">
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-[11px] font-semibold text-slate-600">
                          Variant Name / Spec
                        </Label>
                        <Input
                          value={v.name}
                          onChange={(e) => handleVariantChange(index, "name", e.target.value)}
                          placeholder="e.g. 128GB Black, XL Blue"
                          className="h-8 text-xs bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-[11px] font-semibold text-slate-600">
                          SKU Code
                        </Label>
                        <Input
                          value={v.sku}
                          onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                          placeholder="Auto if empty"
                          className="h-8 text-xs bg-white font-mono"
                        />
                      </div>

                      <div className="sm:col-span-1 space-y-1">
                        <Label className="text-[11px] font-semibold text-slate-600">
                          Cost Price (₹)
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={v.purchasePrice}
                          onChange={(e) => handleVariantChange(index, "purchasePrice", e.target.value)}
                          className="h-8 text-xs bg-white font-semibold"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="sm:col-span-1 space-y-1">
                        <Label className="text-[11px] font-semibold text-slate-600">
                          Pricing Mode
                        </Label>
                        <select
                          value={v.pricingMethod}
                          onChange={(e) => handleVariantChange(index, "pricingMethod", e.target.value)}
                          className="w-full h-8 px-2 border border-input rounded bg-white text-xs outline-none"
                        >
                          <option value="MANUAL">Manual</option>
                          <option value="MARKUP">Markup %</option>
                        </select>
                      </div>

                      {v.pricingMethod === "MARKUP" ? (
                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-[11px] font-semibold text-blue-700">
                            Margin %
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={v.markupPercent}
                            onChange={(e) => handleVariantChange(index, "markupPercent", e.target.value)}
                            className="h-8 text-xs bg-blue-50/50 border-blue-300 font-semibold"
                            placeholder="e.g. 20"
                          />
                        </div>
                      ) : null}

                      <div className={v.pricingMethod === "MARKUP" ? "sm:col-span-2 space-y-1" : "sm:col-span-3 space-y-1"}>
                        <Label className="text-[11px] font-semibold text-slate-600">
                          Selling Price (₹)
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={v.sellingPrice}
                          onChange={(e) => handleVariantChange(index, "sellingPrice", e.target.value)}
                          disabled={v.pricingMethod === "MARKUP"}
                          className="h-8 text-xs bg-white font-semibold"
                          placeholder="0.00"
                        />
                      </div>

                      <div className={v.pricingMethod === "MARKUP" ? "sm:col-span-2 space-y-1" : "sm:col-span-3 space-y-1"}>
                        <Label className="text-[11px] font-semibold text-slate-600">
                          Min Alert Stock
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          value={v.minStockLevel}
                          onChange={(e) => handleVariantChange(index, "minStockLevel", e.target.value)}
                          className="h-8 text-xs bg-white"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || !categoryId}
              className="bg-blue-600 hover:bg-blue-700 font-bold cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Product...
                </>
              ) : (
                "Save & Create Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
