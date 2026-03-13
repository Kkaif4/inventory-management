"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Outlet {
  id: string;
  name: string;
  color?: string;
}

interface OutletState {
  currentOutletId: string | null;
  currentOutlet: Outlet | null;
  availableOutlets: Outlet[];
  setOutlet: (outletId: string) => void;
  setAvailableOutlets: (outlets: Outlet[]) => void;
  reset: () => void;
}

export const useOutletStore = create<OutletState>()(
  persist(
    (set, get) => ({
      currentOutletId: null,
      currentOutlet: null,
      availableOutlets: [],

      setOutlet: (outletId: string) => {
        if (outletId === "ALL") {
          set({
            currentOutletId: "ALL",
            currentOutlet: { id: "ALL", name: "All Outlets", color: "#000000" },
          });
          return;
        }

        const outlet = get().availableOutlets.find((o) => o.id === outletId);
        if (outlet) {
          set({ currentOutletId: outletId, currentOutlet: outlet });
        }
      },

      setAvailableOutlets: (outlets: Outlet[]) => {
        set({ availableOutlets: outlets });

        // Auto-select first outlet if none selected or if current one is not in the new list
        const currentId = get().currentOutletId;
        const exists = outlets.some((o) => o.id === currentId);

        if (!currentId || !exists) {
          if (outlets.length > 0) {
            set({ currentOutletId: outlets[0].id, currentOutlet: outlets[0] });
          } else {
            set({ currentOutletId: null, currentOutlet: null });
          }
        }
      },

      reset: () => {
        set({
          currentOutletId: null,
          currentOutlet: null,
          availableOutlets: [],
        });
      },
    }),
    {
      name: "outlet-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
