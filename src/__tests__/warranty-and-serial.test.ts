import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

vi.mock("@/lib/outlet-auth", () => ({
  validateSessionOutletAccess: vi.fn().mockResolvedValue(undefined),
  requireAdminSession: vi.fn().mockResolvedValue("test-user"),
  getCurrentSessionOutlet: vi.fn().mockImplementation((id: string) => id),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ get: vi.fn().mockReturnValue(undefined) }),
}));

import { prisma } from "@/lib/prisma";
import { createGRN } from "@/actions/procurement";
import { createSalesInvoice } from "@/actions/sales/sales-invoice";
import { lookupSerialNumberWarranty } from "@/actions/sales/warranty";
import { ValidationError } from "@/lib/exceptions";

describe("Warranty & Serial Number Tracking Systems", () => {
  let testOutletId: string;
  let testUserId: string;
  let testProductId: string;
  let testVariantId: string;
  let customerId: string;
  let vendorId: string;
  let warehouseId: string;
  let testPoId: string;

  beforeAll(async () => {
    // 1. Create a test outlet
    const outlet = await prisma.outlet.create({
      data: {
        name: "Test Outlet for Warranty",
        address: "Test Address",
        state: "TEST",
        invoicePrefix: "WRT",
        allowRawCashBills: true,
      },
    });
    testOutletId = outlet.id;

    // 2. Create a test user
    const user = await prisma.user.create({
      data: {
        email: `test-wrt-${Date.now()}@example.com`,
        name: "Test User",
        password: "hashedpassword",
        role: "SALES",
      },
    });
    testUserId = user.id;

    // 3. Link user to outlet
    await prisma.outlet.update({
      where: { id: testOutletId },
      data: { users: { connect: { id: testUserId } } },
    });

    // 4. Create category
    const category = await prisma.category.create({
      data: {
        name: "Warranty Category",
        outletId: testOutletId,
      },
    });

    // 5. Create product with Serial Numbers and 12-month warranty
    const product = await prisma.product.create({
      data: {
        name: "Serial Tracked Product",
        gstRate: 18,
        baseUnit: "PCS",
        categoryId: category.id,
        outletId: testOutletId,
        hasSerialNumbers: true,
        warrantyMonths: 12,
      },
    });
    testProductId = product.id;

    // 6. Create variant
    const variant = await prisma.variant.create({
      data: {
        productId: testProductId,
        outletId: testOutletId,
        sku: `SN-PROD-${Date.now()}`,
        purchasePrice: 1500,
        sellingPrice: 2500,
      },
    });
    testVariantId = variant.id;

    // 7. Create warehouse
    const warehouse = await prisma.warehouse.create({
      data: {
        name: "Test Warehouse for Warranty",
        address: "Test Address",
        outlet: { connect: { id: testOutletId } },
      },
    });
    warehouseId = warehouse.id;

    // 8. Create vendor
    const vendor = await prisma.party.create({
      data: {
        type: "VENDOR",
        name: "Test Supplier",
        address: "Vendor Address",
        state: "TEST",
        outletId: testOutletId,
      },
    });
    vendorId = vendor.id;

    // 9. Create customer
    const customer = await prisma.party.create({
      data: {
        type: "CUSTOMER",
        name: "Walk-in Customer",
        phone: "9876543210",
        address: "Customer Address",
        state: "TEST",
        outletId: testOutletId,
      },
    });
    customerId = customer.id;

    // 10. Create mock Purchase Order transaction to allow receipt (GRN)
    const po = await prisma.transaction.create({
      data: {
        type: "PURCHASE_ORDER",
        txnNumber: `PO-WRT-${Date.now()}`,
        party: { connect: { id: vendorId } },
        outlet: { connect: { id: testOutletId } },
        toWarehouse: { connect: { id: warehouseId } },
        user: { connect: { id: testUserId } },
        totalTaxable: 3000,
        totalTax: 540,
        grandTotal: 3540,
        items: {
          create: [
            {
              variantId: testVariantId,
              quantity: 2,
              rate: 1500,
              taxableValue: 3000,
              cgst: 270,
              sgst: 270,
              igst: 0,
            },
          ],
        },
      },
    });
    testPoId = po.id;
  });

  afterAll(async () => {
    // Cleanup everything related to the test outlet
    await prisma.serialNumber.deleteMany({ where: { outletId: testOutletId } });
    await prisma.batchMovement.deleteMany({ where: { transaction: { outletId: testOutletId } } });
    await prisma.stockLedger.deleteMany({ where: { outletId: testOutletId } });
    await prisma.ledgerEntry.deleteMany({ where: { account: { outletId: testOutletId } } });
    await prisma.transactionItem.deleteMany({ where: { transaction: { outletId: testOutletId } } });
    await prisma.transaction.deleteMany({ where: { outletId: testOutletId } });
    await prisma.party.deleteMany({ where: { outletId: testOutletId } });
    await prisma.account.deleteMany({ where: { outletId: testOutletId } });
    await prisma.stock.deleteMany({ where: { warehouse: { outletId: testOutletId } } });
    await prisma.variant.deleteMany({ where: { product: { outletId: testOutletId } } });
    await prisma.product.deleteMany({ where: { outletId: testOutletId } });
    await prisma.category.deleteMany({ where: { outletId: testOutletId } });
    await prisma.warehouse.deleteMany({ where: { outletId: testOutletId } });
    await prisma.documentSeries.deleteMany({ where: { outletId: testOutletId } });
    await prisma.outlet.delete({ where: { id: testOutletId } });
    await prisma.user.delete({ where: { id: testUserId } });
  });

  describe("Purchase Order Ingestion (GRN Receipt)", () => {
    it("fails to create GRN if serial numbers are duplicated", async () => {
      // First attempt: simulate duplicate entries in database by adding dummy record
      await prisma.serialNumber.create({
        data: {
          serialNumber: "SN-DUP-001",
          variantId: testVariantId,
          outletId: testOutletId,
          status: "AVAILABLE",
        },
      });

      const res = await createGRN({
        poId: testPoId,
        items: [
          {
            variantId: testVariantId,
            quantityReceived: 1,
            serialNumbers: ["SN-DUP-001"],
          },
        ],
        userId: testUserId,
      });

      expect(res.success).toBe(false);
      expect(res.error?.message).toContain("Serial numbers already exist in database");

      // Clean up the dummy record
      await prisma.serialNumber.deleteMany({
        where: { serialNumber: "SN-DUP-001", outletId: testOutletId },
      });
    });

    it("successfully creates GRN and AVAILABLE serial number records", async () => {
      const res = await createGRN({
        poId: testPoId,
        items: [
          {
            variantId: testVariantId,
            quantityReceived: 2,
            serialNumbers: ["SN-W-001", "SN-W-002"],
          },
        ],
        userId: testUserId,
      });

      expect(res.success).toBe(true);

      // Verify SerialNumber status in DB
      const sns = await prisma.serialNumber.findMany({
        where: { outletId: testOutletId, variantId: testVariantId },
      });

      expect(sns).toHaveLength(2);
      expect(sns.map((s) => s.serialNumber)).toContain("SN-W-001");
      expect(sns.map((s) => s.serialNumber)).toContain("SN-W-002");
      expect(sns.every((s) => s.status === "AVAILABLE")).toBe(true);
    });
  });

  describe("POS Billing (Sales Invoices)", () => {
    it("fails sales billing validation if serial numbers are omitted for tracked product", async () => {
      const res = await createSalesInvoice({
        billType: "NO1",
        partyId: customerId,
        fromOutletId: testOutletId,
        items: [
          {
            variantId: testVariantId,
            quantity: 1,
            rate: 2500,
            taxableValue: 2500,
            cgst: 225,
            sgst: 225,
            igst: 0,
            serialNumbers: [], // Missing
          },
        ],
        date: new Date(),
        userId: testUserId,
      });

      expect(res.success).toBe(false);
      expect(res.error?.message).toContain("requires exactly 1 serial number");
    });

    it("fails sales billing validation if serial number is not available in stock", async () => {
      const res = await createSalesInvoice({
        billType: "NO1",
        partyId: customerId,
        fromOutletId: testOutletId,
        items: [
          {
            variantId: testVariantId,
            quantity: 1,
            rate: 2500,
            taxableValue: 2500,
            cgst: 225,
            sgst: 225,
            igst: 0,
            serialNumbers: ["SN-NON-EXISTENT"],
          },
        ],
        date: new Date(),
        userId: testUserId,
      });

      expect(res.success).toBe(false);
      expect(res.error?.message).toContain("is not available for product");
    });

    it("successfully creates billing invoice and associates serial number to item", async () => {
      const saleDate = new Date();
      const res = await createSalesInvoice({
        billType: "NO1",
        partyId: customerId,
        fromOutletId: testOutletId,
        items: [
          {
            variantId: testVariantId,
            quantity: 1,
            rate: 2500,
            taxableValue: 2500,
            cgst: 225,
            sgst: 225,
            igst: 0,
            serialNumbers: ["SN-W-001"],
          },
        ],
        date: saleDate,
        userId: testUserId,
      });

      expect(res.success).toBe(true);

      // Verify status updated to SOLD and warranty expiration date computed (12 months from today)
      const snRecord = await prisma.serialNumber.findFirst({
        where: { serialNumber: "SN-W-001", outletId: testOutletId },
      });

      expect(snRecord).toBeDefined();
      expect(snRecord?.status).toBe("SOLD");
      expect(snRecord?.warrantyExpiry).not.toBeNull();

      // Check that warrantyExpiry is close to 12 months in the future
      const expectedExpiry = new Date(saleDate);
      expectedExpiry.setMonth(expectedExpiry.getMonth() + 12);
      const diffMs = Math.abs(new Date(snRecord!.warrantyExpiry!).getTime() - expectedExpiry.getTime());
      expect(diffMs).toBeLessThan(1000 * 60 * 60 * 24); // within 1 day window
    });
  });

  describe("Warranty & Serial Number Lookup", () => {
    it("returns correct details for sold item with active warranty", async () => {
      const res = await lookupSerialNumberWarranty(testOutletId, "SN-W-001");
      expect(res.success).toBe(true);
      expect(res.data).not.toBeNull();

      const data = res.data!;
      expect(data.serialNumber).toBe("SN-W-001");
      expect(data.status).toBe("SOLD");
      expect(data.isWarrantyActive).toBe(true);
      expect(data.warrantyMonths).toBe(12);
      expect(data.variant.name).toBe("Serial Tracked Product");
      expect(data.sale).not.toBeNull();
      expect(data.sale?.buyerName).toBe("Walk-in Customer");
      expect(data.purchase).not.toBeNull();
      expect(data.purchase?.partyName).toBe("Test Supplier");
    });

    it("returns status AVAILABLE for unsold item", async () => {
      const res = await lookupSerialNumberWarranty(testOutletId, "SN-W-002");
      expect(res.success).toBe(true);
      expect(res.data).not.toBeNull();

      const data = res.data!;
      expect(data.serialNumber).toBe("SN-W-002");
      expect(data.status).toBe("AVAILABLE");
      expect(data.isWarrantyActive).toBe(false);
      expect(data.sale).toBeNull();
      expect(data.purchase).not.toBeNull();
    });

    it("returns null for non-existent serial numbers", async () => {
      const res = await lookupSerialNumberWarranty(testOutletId, "SN-DOES-NOT-EXIST");
      expect(res.success).toBe(true);
      expect(res.data).toBeNull();
    });
  });
});
