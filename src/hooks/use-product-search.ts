"use client";

import { useState, useEffect, useMemo } from "react";
import { getProducts, getVariantBySerialNumber } from "@/actions/products";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export function useProductSearch(outletId: string, debounceMs = 250, partyId?: string) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebouncedValue(search, debounceMs);

  useEffect(() => {
    if (!outletId) return;

    setIsLoading(true);

    const searchPromise = getProducts(outletId, {
      search: debouncedSearch,
      limit: debouncedSearch === "" ? 10 : undefined,
      partyId,
    });

    const serialPromise = debouncedSearch.trim().length >= 3
      ? getVariantBySerialNumber(outletId, debouncedSearch.trim())
      : Promise.resolve({ success: true, data: null });

    Promise.all([searchPromise, serialPromise])
      .then(([prodRes, serialRes]) => {
        let finalProducts = prodRes.success && prodRes.data ? prodRes.data : [];

        if (serialRes.success && serialRes.data) {
          const serialData = serialRes.data as any;
          const exists = finalProducts.some(p =>
            p.variants.some((v: any) => v.id === serialData.variant.id)
          );

          if (!exists) {
            const newProduct = {
              ...serialData.product,
              variants: [
                {
                  ...serialData.variant,
                  matchedSerialNumber: serialData.serialNumber,
                }
              ]
            };
            finalProducts = [newProduct, ...finalProducts];
          } else {
            finalProducts = finalProducts.map(p => ({
              ...p,
              variants: p.variants.map((v: any) =>
                v.id === serialData.variant.id
                  ? { ...v, matchedSerialNumber: serialData.serialNumber }
                  : v
              )
            }));
          }
        }

        setProducts(finalProducts);
      })
      .catch((err) => {
        console.error("Product search failed:", err);
      })
      .finally(() => setIsLoading(false));
  }, [debouncedSearch, outletId, partyId]);

  const flatVariants = useMemo(() => {
    const list: { product: any; variant: any }[] = [];
    for (const p of products) {
      for (const v of p.variants || []) {
        list.push({ product: p, variant: v });
      }
    }
    return list;
  }, [products]);

  function clearResults() {
    setSearch("");
    setProducts([]);
  }

  return { search, setSearch, flatVariants, isLoading, clearResults };
}
