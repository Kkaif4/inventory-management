"use client";

import { ChevronDown, Check } from "lucide-react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { useOutletStore } from "@/store/use-outlet-store";

export function OutletSwitcher() {
  const { currentOutlet, availableOutlets, setOutlet } = useOutletStore();

  if (!availableOutlets || availableOutlets.length === 0) {
    return null;
  }

  const selected = currentOutlet || availableOutlets[0];

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="ghost"
            className="h-10 px-3 hover:bg-slate-100 flex items-center gap-2 text-text-secondary outline-none focus-visible:ring-0"
          >
            <div
              className="w-2 h-2 rounded-full shadow-sm"
              style={{ backgroundColor: selected.color || "#6366f1" }}
            />
            <span className="font-medium text-sm">{selected.name}</span>
            <ChevronDown className="w-4 h-4 text-text-muted opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-56 mt-1 rounded-xl shadow-xl border-slate-200"
        >
          {availableOutlets.map(
            (outlet: { id: string; name: string; color?: string }) => (
              <DropdownMenuItem
                key={outlet.id}
                className="flex items-center justify-between py-2.5 px-3 cursor-pointer"
                onClick={() => setOutlet(outlet.id)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: outlet.color || "#6366f1" }}
                  />
                  <span className="text-sm font-medium">{outlet.name}</span>
                </div>
                {selected.id === outlet.id && (
                  <Check className="w-4 h-4 text-indigo-600" />
                )}
              </DropdownMenuItem>
            ),
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
