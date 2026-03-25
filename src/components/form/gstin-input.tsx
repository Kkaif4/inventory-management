"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { extractStateFromGSTIN } from "@/lib/gstin";

interface GSTINInputProps
  extends Omit<React.ComponentProps<"input">, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  selectedState?: string;
  onValidationChange?: (state: "valid" | "invalid" | "mismatch" | null) => void;
}

type ValidationState = "valid" | "invalid" | "mismatch" | null;

export function GSTINInput({
  value,
  onChange,
  selectedState,
  onValidationChange,
  onBlur: onBlurProp,
  ...props
}: GSTINInputProps) {
  const [validationState, setValidationState] =
    React.useState<ValidationState>(null);
  const [derivedState, setDerivedState] = React.useState<string | null>(null);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (value.trim() === "") {
      setValidationState(null);
      setDerivedState(null);
      onValidationChange?.(null);
      onBlurProp?.(e);
      return;
    }

    const uppercaseValue = value.toUpperCase();
    const isValidFormat = /^[A-Z0-9]{15}$/.test(uppercaseValue);

    if (!isValidFormat) {
      setValidationState("invalid");
      setDerivedState(null);
      onValidationChange?.("invalid");
      onBlurProp?.(e);
      return;
    }

    const derived = extractStateFromGSTIN(uppercaseValue);
    setDerivedState(derived || null);

    if (derived && selectedState && derived !== selectedState) {
      setValidationState("mismatch");
      onValidationChange?.("mismatch");
    } else {
      setValidationState("valid");
      onValidationChange?.("valid");
    }

    onBlurProp?.(e);
  };

  return (
    <div className="space-y-2">
      <Input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        onBlur={handleBlur}
        placeholder="15-character GSTIN"
        className="font-mono"
        maxLength={15}
      />

      {validationState === "valid" && (
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>✓ Valid GSTIN</span>
        </div>
      )}

      {validationState === "invalid" && (
        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          <XCircle className="h-4 w-4 shrink-0" />
          <span>✗ Invalid format — must be 15 alphanumeric characters</span>
        </div>
      )}

      {validationState === "mismatch" && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            ⚠ GSTIN suggests <strong>{derivedState}</strong> but State is{" "}
            <strong>{selectedState}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
