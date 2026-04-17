"use client";

import { useState, useEffect } from "react";
import { searchVariants } from "@/actions/inventory/search";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export function useVariantSearch(
  outletId: string,
  minLength = 3,
  debounceMs = 300,
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedQuery = useDebouncedValue(searchQuery, debounceMs);

  useEffect(() => {
    if (!outletId || debouncedQuery.length < minLength) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    searchVariants(outletId, debouncedQuery)
      .then((res) => {
        if (res.success && res.data) {
          setSearchResults(res.data);
        }
      })
      .finally(() => setIsLoading(false));
  }, [debouncedQuery, outletId, minLength]);

  function clearResults() {
    setSearchQuery("");
    setSearchResults([]);
  }

  return { searchQuery, setSearchQuery, searchResults, isLoading, clearResults };
}
