"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";

interface UPIDetailsProps {
  utrReferenceReg: UseFormRegisterReturn;
  utrReferenceError?: FieldError;
}

export function UPIDetails({
  utrReferenceReg,
  utrReferenceError,
}: UPIDetailsProps) {
  return (
    <div>
      <Label className="text-xs font-semibold text-slate-700 mb-1">
        UTR / Reference ID{" "}
        <span className="text-slate-400 font-normal">(optional)</span>
      </Label>
      <Input
        type="text"
        placeholder="e.g., 202404031234567"
        {...utrReferenceReg}
        className="h-10"
      />
      {utrReferenceError && (
        <p className="text-red-500 text-[10px] mt-1">
          {utrReferenceError.message}
        </p>
      )}
      <p className="text-slate-400 text-[10px] mt-1">
        Unique Transaction Reference (max 50 chars)
      </p>
    </div>
  );
}
