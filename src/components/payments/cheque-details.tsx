"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";

interface ChequeDetailsProps {
  chequeNumberReg: UseFormRegisterReturn;
  chequeDateReg: UseFormRegisterReturn;
  chequeNumberError?: FieldError;
  chequeDateError?: FieldError;
}

export function ChequeDetails({
  chequeNumberReg,
  chequeDateReg,
  chequeNumberError,
  chequeDateError,
}: ChequeDetailsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold text-slate-700 mb-1">
          Cheque Number *
        </Label>
        <Input
          type="text"
          placeholder="e.g., 123456"
          {...chequeNumberReg}
          className="h-10"
        />
        {chequeNumberError && (
          <p className="text-red-500 text-[10px] mt-1">
            {chequeNumberError.message}
          </p>
        )}
      </div>

      <div>
        <Label className="text-xs font-semibold text-slate-700 mb-1">
          Cheque Date *
        </Label>
        <Input
          type="date"
          {...chequeDateReg}
          className="h-10"
        />
        {chequeDateError && (
          <p className="text-red-500 text-[10px] mt-1">
            {chequeDateError.message}
          </p>
        )}
        <p className="text-slate-400 text-[10px] mt-1">
          Cheque must not be older than 6 months
        </p>
      </div>
    </div>
  );
}
