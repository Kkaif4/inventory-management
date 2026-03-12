"use client";

import { useOutletStore } from "@/store/use-outlet-store";
import { useCallback } from "react";

interface Outlet {
  id: string;
  name: string;
}

/**
 * Hook to access outlet context in client components
 * Usage:
 * const { currentOutletId, currentOutlet, setOutlet, availableOutlets } = useOutlet();
 */
export function useOutlet() {
  const {
    currentOutletId,
    currentOutlet,
    availableOutlets,
    setOutlet,
    setAvailableOutlets,
    reset,
  } = useOutletStore();

  /**
   * Validate that outlet context is set
   * Throws error if no outlet is selected
   */
  const validateOutletContext = useCallback(() => {
    if (!currentOutletId) {
      throw new Error("Outlet context not found. Please select an outlet.");
    }
    return currentOutletId;
  }, [currentOutletId]);

  /**
   * Change outlet and validate
   */
  const switchOutlet = useCallback(
    (outletId: string) => {
      const outlet = availableOutlets.find((o) => o.id === outletId);
      if (!outlet) {
        throw new Error(`Outlet ${outletId} not found in available outlets`);
      }
      setOutlet(outletId);
    },
    [availableOutlets, setOutlet],
  );

  return {
    // State
    currentOutletId,
    currentOutlet,
    availableOutlets,

    // Actions
    setOutlet: switchOutlet,
    setAvailableOutlets,
    reset,

    // Utilities
    validateOutletContext,
    hasOutletContext: !!currentOutletId,
    isMultiOutlet: availableOutlets.length > 1,
  };
}
