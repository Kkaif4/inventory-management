import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";

interface Step {
  label: string;
  date?: string | null;
  status: "complete" | "current" | "upcoming";
}

interface WorkflowProgressProps {
  steps: Step[];
  className?: string;
}

export function WorkflowProgress({ steps, className }: WorkflowProgressProps) {
  return (
    <div className={cn("flex items-center w-full py-4", className)}>
      {steps.map((step, index) => (
        <React.Fragment key={step.label}>
          <div className="flex flex-col items-center relative group min-w-[100px] flex-1">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 transition-all duration-300",
                step.status === "complete" &&
                  "bg-brand border-brand text-white",
                step.status === "current" &&
                  "bg-surface-base border-brand text-brand ring-4 ring-brand/10",
                step.status === "upcoming" &&
                  "bg-surface-base border-border-strong text-text-disabled",
              )}
            >
              {step.status === "complete" ? (
                <Check className="w-4 h-4" />
              ) : (
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    step.status === "current"
                      ? "bg-brand animate-pulse"
                      : "bg-border-strong",
                  )}
                />
              )}
            </div>

            <div className="mt-2 text-center">
              <p
                className={cn(
                  "text-[10px] font-bold uppercase tracking-tight",
                  step.status === "upcoming"
                    ? "text-text-disabled"
                    : "text-text-primary",
                )}
              >
                {step.label}
              </p>
              {step.date && (
                <p className="text-[10px] text-text-muted mt-0.5">
                  {step.date}
                </p>
              )}
              {step.status === "current" && !step.date && (
                <p className="text-[10px] text-brand font-bold mt-0.5 animate-pulse">
                  (current)
                </p>
              )}
            </div>
          </div>

          {index < steps.length - 1 && (
            <div className="flex-1 h-0.5 bg-border-default relative -translate-y-4">
              <div
                className={cn(
                  "absolute inset-0 bg-brand transition-all duration-500",
                  step.status === "complete" ? "w-full" : "w-0",
                )}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
