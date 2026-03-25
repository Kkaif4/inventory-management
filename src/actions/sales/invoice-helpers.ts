"use server";

import { prisma } from "@/lib/prisma";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { withErrorHandler } from "@/lib/error-handler";
import { NumberingService } from "@/domains/foundation/numbering-service";

/**
 * Get customer with price list and credit information
 */
export async function getCustomerWithPricing(
  customerId: string,
  outletId: string,
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    const customer = await prisma.party.findUnique({
      where: { id: customerId },
      include: {
        priceList: {
          include: {
            entries: {
              include: {
                variant: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Calculate current balance
    const ledgerEntries = await prisma.ledgerEntry.groupBy({
      by: ["partyId"],
      where: { partyId: customerId },
      _sum: {
        debit: true,
        credit: true,
      },
    });

    const entry = ledgerEntries[0];
    const currentBalance = (entry?._sum.debit || 0) - (entry?._sum.credit || 0);

    return {
      ...customer,
      currentBalance,
      priceListEntries: customer.priceList?.entries || [],
    };
  });
}

/**
 * Get price for a variant from customer's price list, fallback to standard price
 */
export async function getVariantPrice(
  variantId: string,
  customerId?: string,
  outletId?: string,
) {
  return withErrorHandler(async () => {
    if (customerId && outletId) {
      await validateSessionOutletAccess(outletId);

      // Get customer's price list ID
      const customer = await prisma.party.findUnique({
        where: { id: customerId },
        select: { priceListId: true },
      });

      if (customer?.priceListId) {
        const priceListEntry = await prisma.priceListEntry.findFirst({
          where: {
            variantId,
            priceListId: customer.priceListId,
          },
        });

        if (priceListEntry) {
          return {
            price: priceListEntry.price,
            source: "customer_price_list",
          };
        }
      }
    }

    // Fallback to standard selling price
    const variant = await prisma.variant.findUnique({
      where: { id: variantId },
    });

    return {
      price: variant?.sellingPrice || 0,
      source: "standard_price",
    };
  });
}

/**
 * Get stock availability for a product at an outlet
 */
export async function getStockAvailability(
  variantId: string,
  outletId: string,
) {
  return withErrorHandler(async () => {
    // Find stock for this variant at the outlet (any warehouse)
    const stocks = await prisma.stock.findMany({
      where: {
        variantId,
        outletId,
      },
      include: {
        outlet: {
          select: {
            negativeStockPolicy: true,
          },
        },
      },
    });

    // Sum up stock across all warehouses in the outlet
    const totalQuantity = stocks.reduce((sum, s) => sum + s.quantity, 0);
    const policy = stocks[0]?.outlet?.negativeStockPolicy || "WARN";

    return {
      quantity: totalQuantity,
      policy,
    };
  });
}

/**
 * Validate if rate override is allowed for user role
 */
export async function canOverrideRate(outletId: string, userId: string) {
  return withErrorHandler(async () => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return false;

    // Allow rate override for ADMIN and SALES roles
    return ["ADMIN", "SALES"].includes(user.role);
  });
}

/**
 * Get all place of supply options for a customer
 */
export async function getPlaceOfSupplyOptions(outletId: string) {
  return withErrorHandler(async () => {
    const outlets = await prisma.outlet.findMany({
      where: { id: outletId },
      select: {
        state: true,
      },
    });

    // Return all Indian states for place of supply
    return {
      currentOutletState: outlets[0]?.state,
      allStates: [
        { code: "AP", name: "Andhra Pradesh" },
        { code: "AR", name: "Arunachal Pradesh" },
        { code: "AS", name: "Assam" },
        { code: "BR", name: "Bihar" },
        { code: "CT", name: "Chhattisgarh" },
        { code: "GA", name: "Goa" },
        { code: "GJ", name: "Gujarat" },
        { code: "HR", name: "Haryana" },
        { code: "HP", name: "Himachal Pradesh" },
        { code: "JK", name: "Jammu & Kashmir" },
        { code: "JH", name: "Jharkhand" },
        { code: "KA", name: "Karnataka" },
        { code: "KL", name: "Kerala" },
        { code: "MP", name: "Madhya Pradesh" },
        { code: "MH", name: "Maharashtra" },
        { code: "MN", name: "Manipur" },
        { code: "ML", name: "Meghalaya" },
        { code: "MZ", name: "Mizoram" },
        { code: "NL", name: "Nagaland" },
        { code: "OR", name: "Odisha" },
        { code: "PB", name: "Punjab" },
        { code: "RJ", name: "Rajasthan" },
        { code: "SK", name: "Sikkim" },
        { code: "TN", name: "Tamil Nadu" },
        { code: "TR", name: "Tripura" },
        { code: "UP", name: "Uttar Pradesh" },
        { code: "UK", name: "Uttarakhand" },
        { code: "WB", name: "West Bengal" },
      ],
    };
  });
}

/**
 * Get suggested next invoice number for UI (read-only peek, does not increment)
 * The actual number is assigned at save time by NumberingService.getNextNumber
 */
export async function getNextInvoiceNumber(
  outletId: string,
  billType: "NO1" | "NO2",
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    const fy = NumberingService.getFinancialYear(new Date());
    const type = billType === "NO1" ? ("SALES_INVOICE" as const) : ("CASH_MEMO" as const);
    const prefix = NumberingService.getPrefix(type);

    const series = await prisma.documentSeries.findUnique({
      where: { type_financialYear_outletId: { type, financialYear: fy, outletId } },
    });

    const nextNum = series ? series.nextNumber : 1;
    return `${prefix}/${fy}/${nextNum.toString().padStart(4, "0")}`;
  });
}
