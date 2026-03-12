"use client";

import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAndClearData } from "@/lib/logout";

export function NoOutletLogout({ className }: { className?: string }) {
  return (
    <button
      onClick={() => logoutAndClearData()}
      className={cn("flex items-center gap-2 cursor-pointer", className)}
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  );
}
