"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "warning" | "error" | "success";
  onClick?: () => void;
}

export function KPICard({
  label,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  onClick,
}: KPICardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-200 border-l-4",
        onClick && "cursor-pointer hover:shadow-md active:scale-[0.99]",
        variant === "default" && "border-l-brand",
        variant === "warning" && "border-l-amber-500",
        variant === "error" && "border-l-red-500",
        variant === "success" && "border-l-emerald-500",
      )}
      onClick={onClick}
    >
      <CardContent className="p-5 flex items-center gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
            variant === "default" && "bg-brand/5 text-brand",
            variant === "warning" && "bg-amber-50 text-amber-600",
            variant === "error" && "bg-red-50 text-red-600",
            variant === "success" && "bg-emerald-50 text-emerald-600",
          )}
        >
          <Icon className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-text-disabled uppercase tracking-widest mb-0.5">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-xl font-bold text-text-primary tracking-tight truncate">
              {value}
            </h4>
          </div>
          {subtitle && (
            <p className="text-xs text-text-muted mt-1 truncate">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
