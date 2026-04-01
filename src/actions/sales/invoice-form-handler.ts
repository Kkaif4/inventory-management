"use server";

import { z } from "zod";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import {
  createSalesInvoice,
  saveSalesInvoiceDraft,
  editSalesInvoice,
} from "./sales-invoice";
import { withErrorHandler } from "@/lib/error-handler";
import { ValidationError, NotFoundError } from "@/lib/exceptions";
import { roundToTwo } from "@/lib/utils";
import { authOptions } from "@/lib/auth";
import { NumberingService } from "@/domains/foundation/numbering-service";
import { migrateAttachments } from "@/actions/attachments";

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

    const result = await createSalesInvoice({
      billType: formData.billType,
      txnNumber: formData.txnNumber,
      partyId: formData.billType === "NO1" ? formData.partyId : undefined,
      fromOutletId: formData.fromOutletId,
      items,
      date:
        formData.date instanceof Date ? formData.date : new Date(formData.date),
      userId: session.user.id,
      headerDiscount: formData.headerDiscount || 0,
      freightCost: formData.freightCost || 0,
      remarks: formData.remarks,
      buyerName: formData.buyerName,
      buyerPhone: formData.buyerPhone,
    });

    // If invoice was created successfully, migrate any temporary attachments
    if (result.success && result.data?.invoice?.id) {
      const tempReferenceId = `TEMP:${formData.txnNumber}`;
      await migrateAttachments(
        "INVOICE",
        tempReferenceId,
        result.data.invoice.id,
      );
    }

    // Return full result with invoice and FIFO breakdown for UI notification
    return result;
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
      date:
        formData.date instanceof Date ? formData.date : new Date(formData.date),
      userId: session.user.id,
      headerDiscount: formData.headerDiscount || 0,
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
      date:
        formData.date instanceof Date ? formData.date : new Date(formData.date),
      userId: session.user.id,
      headerDiscount: formData.headerDiscount || 0,
      freightCost: formData.freightCost,
      remarks: formData.remarks,
      buyerName: formData.buyerName,
      buyerPhone: formData.buyerPhone,
    });
  });
}

/**
 * Fetch outlet FIFO settings to inform frontend if rates will be calculated
 */
export async function getOutletFIFOSettings(outletId: string) {
  return withErrorHandler(async () => {
    const outlet = await prisma.outlet.findUnique({
      where: { id: outletId },
      select: {
        batchTrackingEnabled: true,
        inventoryValuationMethod: true,
      },
    });

    if (!outlet) throw new NotFoundError("Outlet not found");

    const fifoEnabled =
      outlet.batchTrackingEnabled || outlet.inventoryValuationMethod === "FIFO";

    return {
      fifoEnabled,
      inventoryValuationMethod: outlet.inventoryValuationMethod,
    };
  });
}

/**
 * Peek at the next invoice number without incrementing the counter
 */
export async function peekNextInvoiceNumber(
  outletId: string,
  billType: "NO1" | "NO2",
) {
  return withErrorHandler(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new ValidationError("Not authenticated");

    const type = billType === "NO2" ? "CASH_MEMO" : "SALES_INVOICE";
    const nextNumber = await NumberingService.peekNextNumber(
      prisma,
      outletId,
      type as any,
    );

    return nextNumber;
  });
}
