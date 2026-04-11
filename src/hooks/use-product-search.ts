"use client";

import { useState, useEffect, useMemo } from "react";
import { getProducts } from "@/actions/products";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export function useProductSearch(outletId: string, debounceMs = 250) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebouncedValue(search, debounceMs);

  useEffect(() => {
    if (!outletId) return;

    setIsLoading(true);
    getProducts(outletId, {
      search: debouncedSearch,
      limit: debouncedSearch === "" ? 10 : undefined,
    })
      .then((res) => {
        if (res.success && res.data) {
          setProducts(res.data);
        }
      })
      .finally(() => setIsLoading(false));
  }, [debouncedSearch, outletId]);

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
