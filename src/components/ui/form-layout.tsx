import * as React from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div
      className={cn(
        "space-y-6 py-6 border-b border-border-default last:border-0",
        className,
      )}
    >
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-text-muted">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface FormGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}

export function FormGrid({ children, cols = 2, className }: FormGridProps) {
  return (
    <div
      className={cn(
        "grid gap-6",
        cols === 1 && "grid-cols-1",
        cols === 2 && "grid-cols-1 md:grid-cols-2",
        cols === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        cols === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
