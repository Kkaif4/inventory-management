import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Metric {
  label: string;
  value: string | number;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}

export interface ReportMetricsProps {
  metrics: Metric[];
}

const variantStyles: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  default: {
    bg: "bg-white",
    border: "border-slate-200",
    text: "text-slate-900",
  },
  success: {
    bg: "bg-emerald-50/40",
    border: "border-emerald-100",
    text: "text-emerald-700",
  },
  warning: {
    bg: "bg-amber-50/40",
    border: "border-amber-100",
    text: "text-amber-700",
  },
  danger: {
    bg: "bg-red-50/40",
    border: "border-red-100",
    text: "text-red-700",
  },
};

export function ReportMetrics({ metrics }: ReportMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => {
        const variant = metric.variant || "default";
        const style = variantStyles[variant];

        return (
          <Card
            key={idx}
            className={cn(
              "shadow-sm",
              style.bg,
              "border-" in style && style.border,
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {metric.label}
              </CardTitle>
              {metric.icon && (
                <div className={cn("h-5 w-5 opacity-75", style.text)}>
                  {metric.icon}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", style.text)}>
                {metric.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
