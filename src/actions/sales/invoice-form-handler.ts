"use server";

import { z } from "zod";
import { getServerSession } from "next-auth";
import {
  createSalesInvoice,
  saveSalesInvoiceDraft,
  editSalesInvoice,
} from "./sales-invoice";
import { withErrorHandler } from "@/lib/error-handler";
import { ValidationError } from "@/lib/exceptions";
import { roundToTwo } from "@/lib/utils";
import { authOptions } from "@/lib/auth";

/**
 * Calculate GST breakdown based on outlet state and place of supply
 */
function calculateGSTBreakdown(
  taxableAmount: number,
  gstRate: number,
  outletState?: string,
  placeOfSupply?: string,
  isInterState: boolean = false,
) {
  const taxAmount = roundToTwo((taxableAmount * gstRate) / 100);

  if (isInterState) {
    return {
      cgst: 0,
      sgst: 0,
      igst: taxAmount,
    };
  } else {
    return {
      cgst: roundToTwo(taxAmount / 2),
      sgst: roundToTwo(taxAmount / 2),
      igst: 0,
    };
  }
}

/**
 * Transform form data to invoice item structure
 */
function transformItems(
  formItems: any[],
  billType: "NO1" | "NO2",
  outletState?: string,
  placeOfSupply?: string,
) {
  return formItems.map((item) => {
    const baseAmount = (item.quantity || 0) * (item.rate || 0);
    const discountAmount = (baseAmount * (item.discountPercent || 0)) / 100;
    const taxableValue = roundToTwo(baseAmount - discountAmount);

    if (billType === "NO2") {
      // Cash bill - no tax
      return {
        variantId: item.variantId,
        quantity: item.quantity,
        rate: item.rate,
        discountPercent: item.discountPercent || 0,
        taxableValue,
        cgst: 0,
        sgst: 0,
        igst: 0,
        hsnCode: item.hsnCode,
        gstRate: 0,
      };
    } else {
      // Legal invoice - calculate GST
      const gstRate = item.gstRate || 0;
      const isInterState =
        outletState && placeOfSupply && outletState !== placeOfSupply;
      const tax = calculateGSTBreakdown(
        taxableValue,
        gstRate,
        outletState,
        placeOfSupply,
        !!isInterState,
      );

      return {
        variantId: item.variantId,
        quantity: item.quantity,
        rate: item.rate,
        discountPercent: item.discountPercent || 0,
        taxableValue,
        cgst: tax.cgst,
        sgst: tax.sgst,
        igst: tax.igst,
        hsnCode: item.hsnCode,
        gstRate,
      };
    }
  });
}

/**
 * Create new sales invoice
 */
export async function handleCreateSalesInvoice(
  formData: any,
  outletState?: string,
  placeOfSupply?: string,
) {
  return withErrorHandler(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new ValidationError("Unauthorized");
    }

    const items = transformItems(
      formData.items,
      formData.billType,
      outletState,
      placeOfSupply,
    );

    return await createSalesInvoice({
      billType: formData.billType,
      partyId: formData.billType === "NO1" ? formData.partyId : undefined,
      fromOutletId: formData.fromOutletId,
      items,
      date: formData.date,
      userId: session.user.id,
      freightCost: formData.freightCost,
      remarks: formData.remarks,
      buyerName: formData.buyerName,
      buyerPhone: formData.buyerPhone,
    });
  });
}

/**
 * Save invoice as draft
 */
export async function handleSaveDraft(
  formData: any,
  outletState?: string,
  placeOfSupply?: string,
) {
  return withErrorHandler(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new ValidationError("Unauthorized");
    }

    const items = transformItems(
      formData.items,
      formData.billType,
      outletState,
      placeOfSupply,
    );

    return await saveSalesInvoiceDraft({
      billType: formData.billType,
      partyId: formData.billType === "NO1" ? formData.partyId : undefined,
      fromOutletId: formData.fromOutletId,
      items,
      date: formData.date,
      userId: session.user.id,
      freightCost: formData.freightCost,
      remarks: formData.remarks,
      buyerName: formData.buyerName,
      buyerPhone: formData.buyerPhone,
    });
  });
}

/**
 * Edit existing invoice
 */
export async function handleEditSalesInvoice(
  invoiceId: string,
  formData: any,
  outletState?: string,
  placeOfSupply?: string,
) {
  return withErrorHandler(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new ValidationError("Unauthorized");
    }

    const items = transformItems(
      formData.items,
      formData.billType,
      outletState,
      placeOfSupply,
    );

    return await editSalesInvoice(invoiceId, {
      billType: formData.billType,
      partyId: formData.billType === "NO1" ? formData.partyId : undefined,
      fromOutletId: formData.fromOutletId,
      items,
      date: formData.date,
      userId: session.user.id,
      freightCost: formData.freightCost,
      remarks: formData.remarks,
      buyerName: formData.buyerName,
      buyerPhone: formData.buyerPhone,
    });
  });
}
