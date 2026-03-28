"use client";

import { useState, useEffect } from "react";

/**
 * Hook to debounce a value
 * Useful for search inputs to avoid excessive server calls
 * @param value The value to debounce
 * @param delay Debounce delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
