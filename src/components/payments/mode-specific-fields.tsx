"use client";

import { type PaymentMode } from "@/validations/payment.validation";
import { UseFormRegisterReturn, FieldError, UseFormReturn } from "react-hook-form";
import { ChequeDetails } from "./cheque-details";
import { UPIDetails } from "./upi-details";
import { TransactionReference } from "./transaction-reference";
import { CardReference } from "./card-reference";

interface ModeSpecificFieldsProps {
  paymentMode: PaymentMode;
  form: any; // UseFormReturn from react-hook-form
  errors: any; // FormState errors
}

export function ModeSpecificFields({
  paymentMode,
  form,
  errors,
}: ModeSpecificFieldsProps) {
  // Don't render anything for CASH mode
  if (paymentMode === "CASH") {
    return null;
  }

  return (
    <div className="space-y-4 border-t border-slate-100 pt-4">
      {paymentMode === "CHEQUE" && (
        <ChequeDetails
          chequeNumberReg={form.register("chequeNumber")}
          chequeDateReg={form.register("chequeDate")}
          chequeNumberError={errors.chequeNumber}
          chequeDateError={errors.chequeDate}
        />
      )}

      {paymentMode === "UPI" && (
        <UPIDetails
          utrReferenceReg={form.register("utrReferenceId")}
          utrReferenceError={errors.utrReferenceId}
        />
      )}

      {paymentMode === "ONLINE_TRANSFER" && (
        <TransactionReference
          transactionIdReg={form.register("transactionId")}
          transactionIdError={errors.transactionId}
        />
      )}

      {paymentMode === "CARD" && (
        <CardReference
          cardReferenceReg={form.register("cardReference")}
          cardReferenceError={errors.cardReference}
        />
      )}
    </div>
  );
}
