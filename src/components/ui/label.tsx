import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }
>(({ className, children, required, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-xs font-semibold text-text-secondary uppercase tracking-widest leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className,
    )}
    {...props}
  >
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
));
Label.displayName = "Label";

export { Label };
