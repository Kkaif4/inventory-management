"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";

interface CardReferenceProps {
  cardReferenceReg: UseFormRegisterReturn;
  cardReferenceError?: FieldError;
}

export function CardReference({
  cardReferenceReg,
  cardReferenceError,
}: CardReferenceProps) {
  return (
    <div>
      <Label className="text-xs font-semibold text-slate-700 mb-1">
        Card Reference{" "}
        <span className="text-slate-400 font-normal">(optional)</span>
      </Label>
      <Input
        type="text"
        placeholder="e.g., Card ending in 4242"
        {...cardReferenceReg}
        className="h-10"
      />
      {cardReferenceError && (
        <p className="text-red-500 text-[10px] mt-1">
          {cardReferenceError.message}
        </p>
      )}
      <p className="text-slate-400 text-[10px] mt-1">
        Card reference or auth code (max 50 chars)
      </p>
    </div>
  );
}
