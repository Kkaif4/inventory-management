"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

function syncOutletCookie(outletId: string | null) {
  if (typeof document === "undefined") return;
  if (outletId) {
    document.cookie = `selected_outlet_id=${outletId}; path=/; max-age=31536000; SameSite=Lax`;
  } else {
    document.cookie = `selected_outlet_id=; path=/; max-age=0`;
  }
}

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
        } else {
          const outlet = get().availableOutlets.find((o) => o.id === outletId);
          if (outlet) {
            set({ currentOutletId: outletId, currentOutlet: outlet });
          }
        }
        syncOutletCookie(outletId);
      },

      setAvailableOutlets: (outlets: Outlet[]) => {
        set({ availableOutlets: outlets });

        // Auto-select first outlet if none selected or if current one is not in the new list
        const currentId = get().currentOutletId;
        const exists = currentId === "ALL" || outlets.some((o) => o.id === currentId);

        if (!currentId || !exists) {
          if (outlets.length > 0) {
            set({ currentOutletId: outlets[0].id, currentOutlet: outlets[0] });
            syncOutletCookie(outlets[0].id);
          } else {
            set({ currentOutletId: null, currentOutlet: null });
          }
        } else if (currentId) {
          // Re-sync cookie with the persisted selection on page load
          syncOutletCookie(currentId);
        }
      },

      reset: () => {
        set({
          currentOutletId: null,
          currentOutlet: null,
          availableOutlets: [],
        });
        syncOutletCookie(null);
      },
    }),
    {
      name: "outlet-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
