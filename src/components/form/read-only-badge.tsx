"use client";

import * as React from "react";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReadOnlyBadgeProps {
  reason: string;
}

export function ReadOnlyBadge({ reason }: ReadOnlyBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="text-xs gap-1.5 bg-slate-50 border-slate-200 text-slate-600"
    >
      <Lock className="h-3 w-3" />
      {reason}
    </Badge>
  );
}
