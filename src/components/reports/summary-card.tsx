import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SummaryCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?:
    | "emerald"
    | "amber"
    | "rose"
    | "blue"
    | "slate"
    | "indigo"
    | "violet"
    | "green"
    | "orange"
    | "red";
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
}

const colorConfigs: Record<
  string,
  { bg: string; text: string; iconBg: string; border: string; glow: string }
> = {
  emerald: {
    bg: "bg-emerald-50/50",
    text: "text-emerald-700",
    iconBg: "bg-emerald-100/80",
    border: "border-emerald-100",
    glow: "group-hover:shadow-emerald-500/10",
  },
  amber: {
    bg: "bg-amber-50/50",
    text: "text-amber-700",
    iconBg: "bg-amber-100/80",
    border: "border-amber-100",
    glow: "group-hover:shadow-amber-500/10",
  },
  rose: {
    bg: "bg-rose-50/50",
    text: "text-rose-700",
    iconBg: "bg-rose-100/80",
    border: "border-rose-100",
    glow: "group-hover:shadow-rose-500/10",
  },
  blue: {
    bg: "bg-blue-50/50",
    text: "text-blue-700",
    iconBg: "bg-blue-100/80",
    border: "border-blue-100",
    glow: "group-hover:shadow-blue-500/10",
  },
  indigo: {
    bg: "bg-indigo-50/50",
    text: "text-indigo-700",
    iconBg: "bg-indigo-100/80",
    border: "border-indigo-100",
    glow: "group-hover:shadow-indigo-500/10",
  },
  violet: {
    bg: "bg-violet-50/50",
    text: "text-violet-700",
    iconBg: "bg-violet-100/80",
    border: "border-violet-100",
    glow: "group-hover:shadow-violet-500/10",
  },
  slate: {
    bg: "bg-slate-50/50",
    text: "text-slate-700",
    iconBg: "bg-slate-100/80",
    border: "border-slate-100",
    glow: "group-hover:shadow-slate-500/10",
  },
};

export function SummaryCard({
  label,
  value,
  icon,
  color = "slate",
  description,
  trend,
}: SummaryCardProps) {
  // Map old colors to new ones for compatibility
  const mappedColor =
    color === "green"
      ? "emerald"
      : color === "orange"
        ? "amber"
        : color === "red"
          ? "rose"
          : color;
  const config =
    colorConfigs[mappedColor as keyof typeof colorConfigs] ||
    colorConfigs.slate;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-white border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",
        config.border,
        config.glow,
      )}
    >
      {/* Decorative gradient corner */}
      <div
        className={cn(
          "absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full opacity-20 transition-transform duration-500 group-hover:scale-150",
          config.bg,
        )}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div
            className={cn(
              "p-2.5 rounded-xl transition-colors duration-300",
              config.iconBg,
              config.text,
            )}
          >
            {icon}
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold",
                trend.isUp
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700",
              )}
            >
              <span>{trend.isUp ? "↑" : "↓"}</span>
              <span>{trend.value}%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">
            {label}
          </p>
          <div className="flex items-baseline space-x-2">
            <h3
              className={cn(
                "text-3xl font-black tracking-tight transition-colors",
                config.text,
              )}
            >
              {value}
            </h3>
          </div>
          {description && (
            <p className="text-xs text-slate-400 font-medium mt-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
