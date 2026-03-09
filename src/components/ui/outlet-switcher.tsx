"use client";

import * as React from "react";
import { Store, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function OutletSwitcher() {
  // Placeholder - In a real app, this would fetch outlets from a context/store
  const outlets = [
    { id: "1", name: "Head Office", color: "#1a56db" },
    { id: "2", name: "Main Warehouse", color: "#059669" },
  ];

  const [selected, setSelected] = React.useState(outlets[0]);

  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        className="h-10 px-3 hover:bg-slate-100 flex items-center gap-2 text-text-secondary"
      >
        <div
          className="w-2 h-2 rounded-full shadow-sm"
          style={{ backgroundColor: selected.color }}
        />
        <span className="font-medium text-sm">{selected.name}</span>
        <ChevronDown className="w-4 h-4 text-text-muted opacity-50" />
      </Button>
    </div>
  );
}
