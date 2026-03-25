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
        "space-y-6 border-b border-slate-100 pb-8 last:border-0",
        className,
      )}
    >
      <div className="space-y-1">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-slate-600">{description}</p>
        )}
      </div>
      <div>{children}</div>
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
