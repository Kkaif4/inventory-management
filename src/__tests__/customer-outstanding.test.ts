import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { createCustomer } from "@/actions/sales/customers";
import { createSalesInvoice } from "@/actions/sales/sales-invoice";
import { recordInvoicePayment } from "@/actions/sales/payment";
import { roundToTwo } from "@/lib/utils";

/**
 * Test Suite: Customer Outstanding and Payment Behavior
 *
 * Validates:
 * 1. Outstanding increases when invoice created
 * 2. Outstanding decreases when payment recorded
 * 3. Outstanding never becomes negative
 * 4. Overpayment is stored as customer credit
 * 5. Outstanding is calculated from actual invoices (not stale cache)
 */

describe("Customer Outstanding and Payment Behavior", () => {
  let testOutletId: string;
  let testUserId: string;
  let testProductId: string;
  let testVariantId: string;
  let customerId: string;

  beforeAll(async () => {
    // Setup test data
    const outlet = await prisma.outlet.create({
      data: {
        name: "Test Outlet",
        address: "Test Address",
        state: "TEST",
        invoicePrefix: "TST",
        allowRawCashBills: true,
      },
    });
    testOutletId = outlet.id;

    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: "Test User",
        password: "hashed",
        role: "SALES",
      },
    });
    testUserId = user.id;

    // Link user to outlet
    await prisma.outlet.update({
      where: { id: testOutletId },
      data: { users: { connect: { id: testUserId } } },
    });

    // Create category
    const category = await prisma.category.create({
      data: {
        name: "Test Category",
        outletId: testOutletId,
      },
    });

    // Create product
    const product = await prisma.product.create({
      data: {
        name: "Test Product",
        gstRate: 18,
        baseUnit: "PCS",
        categoryId: category.id,
        outletId: testOutletId,
      },
    });
    testProductId = product.id;

    // Create variant
    const variant = await prisma.variant.create({
      data: {
        productId: testProductId,
        sku: `SKU-${Date.now()}`,
        purchasePrice: 100,
        sellingPrice: 200,
      },
    });
    testVariantId = variant.id;

    // Create warehouse
    const warehouse = await prisma.warehouse.create({
      data: {
        name: "Test Warehouse",
        address: "Test Address",
      },
    });

    // Link warehouse to outlet
    await prisma.outlet.update({
      where: { id: testOutletId },
      data: { warehouses: { connect: { id: warehouse.id } } },
    });

    // Initialize chart of accounts
    const accounts = [
      { code: "1001", name: "Cash in Hand", group: "ASSET" as const },
      { code: "1002", name: "Bank Account", group: "ASSET" as const },
      { code: "1003", name: "Debtors", group: "ASSET" as const },
      { code: "2001", name: "Creditors", group: "LIABILITY" as const },
      { code: "2002", name: "Output CGST", group: "LIABILITY" as const },
      { code: "2003", name: "Output SGST", group: "LIABILITY" as const },
      { code: "2004", name: "Output IGST", group: "LIABILITY" as const },
      { code: "3001", name: "Sales", group: "INCOME" as const },
    ];

    for (const acc of accounts) {
      await prisma.account.upsert({
        where: { code_outletId: { code: acc.code, outletId: testOutletId } },
        update: {},
        create: { ...acc, outletId: testOutletId },
      });
    }

    // Create test customer
    const customerResult = await createCustomer(testOutletId, {
      name: "Test Customer",
      phone: "9999999999",
      email: "customer@test.com",
      address: "Test Address",
      state: "TEST",
      creditPeriod: 30,
      creditLimit: 10000,
      openingBalance: 0,
      isActive: true,
      b2b: false,
    });
    customerId = customerResult.data!.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.party.deleteMany({ where: { id: customerId } });
    await prisma.outlet.delete({ where: { id: testOutletId } });
    await prisma.user.delete({ where: { id: testUserId } });
  });

  it("Test 1: Invoice creation increases outstanding", async () => {
    const customerBefore = await prisma.party.findUnique({
      where: { id: customerId },
    });
    expect(customerBefore!.outstandingBalance).toBe(0);

    // Create invoice for ₹1000
    const invoiceResult = await createSalesInvoice({
      billType: "NO1",
      partyId: customerId,
      fromOutletId: testOutletId,
      items: [
        {
          variantId: testVariantId,
          quantity: 5,
          rate: 200,
          taxableValue: 1000,
          cgst: 90,
          sgst: 90,
          igst: 0,
        },
      ],
      date: new Date(),
      userId: testUserId,
    });

    const customerAfter = await prisma.party.findUnique({
      where: { id: customerId },
    });
    expect(customerAfter!.outstandingBalance).toBe(1180); // 1000 + 180 tax
  });

  it("Test 2: Full payment reduces outstanding to 0", async () => {
    const invoice = await prisma.transaction.findFirst({
      where: { partyId: customerId, type: "SALES_INVOICE" },
    });
    expect(invoice).toBeDefined();

    const paymentResult = await recordInvoicePayment({
      invoiceId: invoice!.id,
      outletId: testOutletId,
      partyId: customerId,
      amount: 1180,
      paymentDate: new Date().toString(),
      paymentMode: "Cash",
      userId: testUserId,
    });

    expect(paymentResult.data?.invoiceStatus).toBe("PAID");

    const customerAfter = await prisma.party.findUnique({
      where: { id: customerId },
    });
    expect(customerAfter!.outstandingBalance).toBe(0);
  });

  it("Test 3: Partial payment reduces outstanding", async () => {
    // Create new invoice for partial payment test
    const invoice2Result = await createSalesInvoice({
      billType: "NO1",
      partyId: customerId,
      fromOutletId: testOutletId,
      items: [
        {
          variantId: testVariantId,
          quantity: 5,
          rate: 200,
          taxableValue: 1000,
          cgst: 90,
          sgst: 90,
          igst: 0,
        },
      ],
      date: new Date(),
      userId: testUserId,
    });

    const customerAfterInvoice = await prisma.party.findUnique({
      where: { id: customerId },
    });
    expect(customerAfterInvoice!.outstandingBalance).toBe(1180);

    // Pay only ₹600
    const invoice2 = await prisma.transaction.findUnique({
      where: { id: invoice2Result.data!.invoice.id },
    });

    await recordInvoicePayment({
      invoiceId: invoice2!.id,
      outletId: testOutletId,
      partyId: customerId,
      amount: 600,
      paymentDate: new Date().toString(),
      paymentMode: "Cash",
      userId: testUserId,
    });

    const customerAfterPayment = await prisma.party.findUnique({
      where: { id: customerId },
    });
    expect(customerAfterPayment!.outstandingBalance).toBe(580); // 1180 - 600
  });

  it("Test 4: Overpayment stores as customer credit balance", async () => {
    const invoice = await prisma.transaction.findFirst({
      where: {
        partyId: customerId,
        type: "SALES_INVOICE",
        status: "PARTIALLY_PAID",
      },
    });
    expect(invoice).toBeDefined();

    const customerBefore = await prisma.party.findUnique({
      where: { id: customerId },
    });
    expect(customerBefore!.creditBalance).toBe(0);

    // Pay ₹800 when only ₹580 is due
    await recordInvoicePayment({
      invoiceId: invoice!.id,
      outletId: testOutletId,
      partyId: customerId,
      amount: 800,
      paymentDate: new Date().toString(),
      paymentMode: "Cash",
      userId: testUserId,
    });

    const customerAfter = await prisma.party.findUnique({
      where: { id: customerId },
    });
    // Outstanding should be 0 (not negative)
    expect(customerAfter!.outstandingBalance).toBe(0);
    // Excess ₹220 (800 - 580) should be stored as credit
    expect(customerAfter!.creditBalance).toBeGreaterThan(0);
  });

  it("Test 5: Outstanding never goes negative", async () => {
    const customer = await prisma.party.findUnique({
      where: { id: customerId },
    });
    expect(customer!.outstandingBalance).toBeGreaterThanOrEqual(0);
  });

  it("Test 6: Multiple invoices - outstanding is cumulative", async () => {
    // Reset to fresh customer for this test
    const testCustomer2 = await prisma.party.create({
      data: {
        type: "CUSTOMER",
        name: "Test Customer 2",
        address: "Test Address",
        state: "TEST",
        outletId: testOutletId,
      },
    });

    // Create first invoice: ₹1000
    const inv1 = await createSalesInvoice({
      billType: "NO1",
      partyId: testCustomer2.id,
      fromOutletId: testOutletId,
      items: [
        {
          variantId: testVariantId,
          quantity: 5,
          rate: 200,
          taxableValue: 1000,
          cgst: 90,
          sgst: 90,
          igst: 0,
        },
      ],
      date: new Date(),
      userId: testUserId,
    });

    const cust1 = await prisma.party.findUnique({
      where: { id: testCustomer2.id },
    });
    expect(cust1!.outstandingBalance).toBe(1180);

    // Create second invoice: ₹500
    const inv2 = await createSalesInvoice({
      billType: "NO1",
      partyId: testCustomer2.id,
      fromOutletId: testOutletId,
      items: [
        {
          variantId: testVariantId,
          quantity: 2.5,
          rate: 200,
          taxableValue: 500,
          cgst: 45,
          sgst: 45,
          igst: 0,
        },
      ],
      date: new Date(),
      userId: testUserId,
    });

    const cust2 = await prisma.party.findUnique({
      where: { id: testCustomer2.id },
    });
    // Should be 1180 + 590 = 1770
    expect(cust2!.outstandingBalance).toBe(1770);

    // Cleanup
    await prisma.party.delete({ where: { id: testCustomer2.id } });
  });
});
