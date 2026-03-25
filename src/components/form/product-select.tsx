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
}

export function ProductSelect({
  value,
  onChange,
  disabled,
  className,
  search: initialSearch,
}: ProductSelectProps) {
  const { currentOutletId } = useOutletStore();
  const [products, setProducts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [search, setSearch] = React.useState(initialSearch || "");
  const [selectedProductInfo, setSelectedProductInfo] = React.useState<{ name: string; sku: string } | null>(null);

  React.useEffect(() => {
    if (!currentOutletId) return;

    const loadProducts = async () => {
      setIsLoading(true);
      try {
        // Limit to 10 on initial load, full search when user types
        const limit = search === "" ? 10 : undefined;
        const res = await getProducts(currentOutletId, { search, limit });
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
  }, [currentOutletId, search]);

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
  };

  return (
    <Select value={value || ""} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger className={className}>
        {selectedProductInfo ? (
          <span className="truncate">
            <span className="font-mono text-xs text-muted-foreground">{selectedProductInfo.sku}</span>
            <span className="ml-2 font-medium">{selectedProductInfo.name}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">Search product...</span>
        )}
      </SelectTrigger>
      <SelectContent>
        <div className="p-2 border-b space-y-1">
          <input
            type="text"
            placeholder="Search by name, SKU, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded border border-slate-200 text-sm"
          />
          {search === "" && (
            <p className="text-xs text-muted-foreground px-1">Showing top 10 products. Type to search all...</p>
          )}
        </div>
        {isLoading ? (
          <div className="text-center py-4 text-sm text-slate-500">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-4 text-sm text-slate-500">
            No products found
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id}>
              {product.variants.map((variant: any) => (
                <SelectItem key={variant.id} value={variant.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">
                      {variant.sku}
                    </span>
                    <span>{product.name}</span>
                    <span className="text-xs text-slate-500">
                      @ ₹{variant.sellingPrice}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </div>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
