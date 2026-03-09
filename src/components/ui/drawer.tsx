"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const SlideOverDrawer = DialogPrimitive.Root;
const SlideOverDrawerTrigger = DialogPrimitive.Trigger;

const SlideOverDrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    title: string;
    description?: string;
    footer?: React.ReactNode;
    size?: "md" | "lg" | "xl";
  }
>(
  (
    { className, children, title, description, footer, size = "md", ...props },
    ref,
  ) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-surface-overlay backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed inset-y-0 right-0 z-50 h-full bg-surface-base shadow-modal transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right flex flex-col",
          size === "md" && "w-full max-w-[480px]",
          size === "lg" && "w-full max-w-[640px]",
          size === "xl" && "w-full max-w-[800px]",
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default h-14 shrink-0">
          <div className="space-y-0.5">
            <DialogPrimitive.Title className="text-md font-bold text-text-primary uppercase tracking-tight">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="text-xs text-text-muted">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </div>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-border-default bg-surface-muted/30 shrink-0">
            {footer}
          </div>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ),
);
SlideOverDrawerContent.displayName = "SlideOverDrawerContent";

export { SlideOverDrawer, SlideOverDrawerTrigger, SlideOverDrawerContent };
