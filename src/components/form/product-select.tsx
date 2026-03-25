"use client";

import * as React from "react";
import { useOutletStore } from "@/store/use-outlet-store";
import { getProducts } from "@/actions/products";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ProductSelectProps {
  value?: string;
  onChange: (variantId: string, productData: any) => void;
  disabled?: boolean;
  className?: string;
  search?: string;
  outletId?: string;
}

export function ProductSelect({
  value,
  onChange,
  disabled,
  className,
  search: initialSearch,
  outletId: propOutletId,
}: ProductSelectProps) {
  const { currentOutletId } = useOutletStore();
  const outletId = propOutletId || currentOutletId;
  const [products, setProducts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [search, setSearch] = React.useState(initialSearch || "");
  const [selectedProductInfo, setSelectedProductInfo] = React.useState<{
    name: string;
    sku: string;
  } | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!outletId) return;

    const loadProducts = async () => {
      setIsLoading(true);
      try {
        // Limit to 10 on initial load, full search when user types
        const limit = search === "" ? 10 : undefined;
        const res = await getProducts(outletId, { search, limit });
        if (res.success) {
          setProducts(res.data || []);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(loadProducts, 300); // Debounce
    return () => clearTimeout(timer);
  }, [outletId, search]);

  const handleChange = (variantId: string | null) => {
    if (!variantId) return;
    const product = products.find((p) =>
      p.variants.some((v: any) => v.id === variantId),
    );
    const variant = product?.variants.find((v: any) => v.id === variantId);
    setSelectedProductInfo({
      name: product?.name || "",
      sku: variant?.sku || "",
    });
    onChange(variantId, { product, variant });
    setIsOpen(false);
  };

  const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && products.length > 0) {
      e.preventDefault();
      // Select first product from filtered results
      const firstProduct = products[0];
      const firstVariant = firstProduct?.variants?.[0];
      if (firstVariant) {
        handleChange(firstVariant.id);
      }
    }
  };

  return (
    <Select
      value={value || ""}
      onValueChange={handleChange}
      disabled={disabled}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger className={className}>
        {selectedProductInfo ? (
          <span className="truncate">
            <span className="font-mono text-xs text-muted-foreground">
              {selectedProductInfo.sku}
            </span>
            <span className="ml-2 font-medium">{selectedProductInfo.name}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">Search product...</span>
        )}
      </SelectTrigger>
      <SelectContent className="min-w-[450px]">
        <div className="p-2 border-b space-y-2">
          <input
            type="text"
            placeholder="Type product name, SKU or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleEnterPress}
            className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            autoFocus
          />
          <div className="text-xs text-slate-500 px-1 flex justify-between">
            <span>
              {search === ""
                ? "Showing top 10 products. Type to search all..."
                : products.length > 0
                  ? `${products.length} result${products.length !== 1 ? "s" : ""} found. Press Enter to select.`
                  : "No products found"}
            </span>
          </div>
        </div>
        {isLoading ? (
          <div className="text-center py-4 text-sm text-slate-500">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-4 text-sm text-slate-500">
            {search === ""
              ? "Start typing to search..."
              : "No matching products"}
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {products.map((product) => (
              <div key={product.id}>
                {product.variants.map((variant: any) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500 whitespace-nowrap">
                        {variant.sku}
                      </span>
                      <span className="font-medium truncate max-w-xs">
                        {product.name}
                      </span>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        @ ₹{variant.sellingPrice}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </div>
            ))}
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
