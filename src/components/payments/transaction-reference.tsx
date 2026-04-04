"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";

interface TransactionReferenceProps {
  transactionIdReg: UseFormRegisterReturn;
  transactionIdError?: FieldError;
}

export function TransactionReference({
  transactionIdReg,
  transactionIdError,
}: TransactionReferenceProps) {
  return (
    <div>
      <Label className="text-xs font-semibold text-slate-700 mb-1">
        Transaction ID{" "}
        <span className="text-slate-400 font-normal">(optional)</span>
      </Label>
      <Input
        type="text"
        placeholder="e.g., TXN20240403123456"
        {...transactionIdReg}
        className="h-10"
      />
      {transactionIdError && (
        <p className="text-red-500 text-[10px] mt-1">
          {transactionIdError.message}
        </p>
      )}
      <p className="text-slate-400 text-[10px] mt-1">
        Bank transfer reference ID (max 50 chars)
      </p>
    </div>
  );
}
