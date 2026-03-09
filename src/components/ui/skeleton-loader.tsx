"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function SkeletonLoader({
  className,
  variant = "text",
}: {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}) {
  return (
    <div
      className={cn(
        "animate-pulse bg-surface-elevated",
        variant === "text" && "h-4 w-full rounded",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-default",
        className,
      )}
    />
  );
}

export function SkeletonForm({ sections = 1, fieldsPerSection = 4 }) {
  return (
    <div className="space-y-8">
      {Array.from({ length: sections }).map((_, i) => (
        <div key={i} className="space-y-4">
          <SkeletonLoader className="h-6 w-1/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: fieldsPerSection }).map((_, j) => (
              <div key={j} className="space-y-2">
                <SkeletonLoader className="h-4 w-1/3" />
                <SkeletonLoader className="h-10 w-full" variant="rectangular" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
