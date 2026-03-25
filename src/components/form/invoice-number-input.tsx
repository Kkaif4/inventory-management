"use client";

import * as React from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InvoiceNumberInputProps
  extends Omit<React.ComponentProps<"input">, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  suggestedNumber?: string;
  isPosted?: boolean;
  onValidation?: (isValid: boolean, isDuplicate: boolean) => void;
  validationFn?: (
    invoiceNo: string
  ) => Promise<{ isDuplicate: boolean }>;
}

type ValidationState = "valid" | "invalid" | "duplicate" | "checking" | null;

export function InvoiceNumberInput({
  value,
  onChange,
  suggestedNumber,
  isPosted = false,
  onValidation,
  validationFn,
  disabled,
  ...props
}: InvoiceNumberInputProps) {
  const [validationState, setValidationState] =
    React.useState<ValidationState>(null);
  const [isChecking, setIsChecking] = React.useState(false);
  const validationTimeoutRef = React.useRef<NodeJS.Timeout>(null);

  const validateFormat = (val: string): boolean => {
    if (!val) return false;
    // Allow alphanumeric, forward slash, hyphen
    const formatRegex = /^[A-Z0-9\-/]+$/;
    return formatRegex.test(val.toUpperCase());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();

    // Auto-format: INV20260042 → INV-2526-0042 (if user pastes)
    if (val && !val.includes("-") && !val.includes("/")) {
      // Try to auto-format if it looks like it needs it
      const match = val.match(/^([A-Z]+)(\d{4})(\d+)$/);
      if (match) {
        const [, prefix, fy, num] = match;
        val = `${prefix}-${fy}-${num}`;
      }
    }

    onChange(val);

    // Debounced validation
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    if (!val.trim()) {
      setValidationState(null);
      onValidation?.(false, false);
      return;
    }

    const isFormatValid = validateFormat(val);
    if (!isFormatValid) {
      setValidationState("invalid");
      onValidation?.(false, false);
      return;
    }

    // Check for duplicates if validation function provided
    if (validationFn) {
      setValidationState("checking");
      setIsChecking(true);

      validationTimeoutRef.current = setTimeout(async () => {
        try {
          const result = await validationFn(val);
          if (result.isDuplicate) {
            setValidationState("duplicate");
            onValidation?.(false, true);
          } else {
            setValidationState("valid");
            onValidation?.(true, false);
          }
        } catch (error) {
          console.error("Invoice number validation error:", error);
          setValidationState("valid"); // Assume valid if check fails
          onValidation?.(true, false);
        } finally {
          setIsChecking(false);
        }
      }, 500);
    } else {
      setValidationState("valid");
      onValidation?.(true, false);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value;
    if (val && !validateFormat(val)) {
      setValidationState("invalid");
    }
    props.onBlur?.(e);
  };

  return (
    <div className="space-y-2">
      <Input
        {...props}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={suggestedNumber ? `e.g., ${suggestedNumber}` : "INV-2526-0042"}
        disabled={disabled || isPosted}
        className={cn(
          "font-mono uppercase",
          isPosted && "bg-slate-100 cursor-not-allowed"
        )}
        maxLength={20}
      />

      {isPosted && (
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          🔒 Invoice number locked after posting
        </div>
      )}

      {!isPosted && validationState === "valid" && (
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
          <CheckCircle2 className="h-4 w-4" />
          ✓ Valid invoice number
        </div>
      )}

      {validationState === "invalid" && (
        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          <XCircle className="h-4 w-4" />
          ✗ Invalid format — use alphanumeric, / and - only
        </div>
      )}

      {validationState === "checking" && (
        <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
          <div className="animate-spin h-3 w-3 rounded-full border-2 border-blue-400 border-t-blue-700" />
          Checking...
        </div>
      )}

      {validationState === "duplicate" && (
        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          <AlertCircle className="h-4 w-4" />
          ⚠ This invoice number already exists. Use a different number.
        </div>
      )}
    </div>
  );
}
