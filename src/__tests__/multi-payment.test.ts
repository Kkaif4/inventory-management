import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

vi.mock("@/lib/outlet-auth", () => ({
  validateSessionOutletAccess: vi.fn().mockResolvedValue(undefined),
  requireAdminSession: vi.fn().mockResolvedValue("test-user"),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ get: vi.fn().mockReturnValue(undefined) }),
}));

import { prisma } from "@/lib/prisma";
import { createAccount, getOutletAccounts, getAccountDetail } from "@/actions/accounts/index";
import { createSalesInvoice } from "@/actions/sales/sales-invoice";
import { recordInvoiceMultiplePayments } from "@/actions/sales/payment";
import { recordVendorBillMultiplePayments } from "@/actions/purchase/payment";
import { createCustomer } from "@/actions/sales/customers";
import { roundToTwo } from "@/lib/utils";

describe("Multi-Payment & Split Payment System", () => {
  let testOutletId: string;
  let testUserId: string;
  let testProductId: string;
  let testVariantId: string;
  let customerId: string;
  let vendorId: string;
  let cashAccountId: string;
  let bankAccountId: string;

  beforeAll(async () => {
    // Setup test data
    const outlet = await prisma.outlet.create({
      data: {
        name: "Test Outlet for Multi Payments",
        address: "Test Address",
        state: "TEST",
        invoicePrefix: "MPA",
        allowRawCashBills: true,
      },
    });
    testOutletId = outlet.id;

    const user = await prisma.user.create({
      data: {
        email: `test-mp-${Date.now()}@example.com`,
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
        outletId: testOutletId,
      },
    });
    testVariantId = variant.id;

    // Create warehouse
    await prisma.warehouse.create({
      data: {
        name: "Test Warehouse",
        address: "Test Address",
        outlet: { connect: { id: testOutletId } },
      },
    });

    // Initialize chart of accounts
    const glAccounts = [
      { code: "1001", name: "Cash in Hand", group: "ASSET" as const },
      { code: "1002", name: "Bank Account", group: "ASSET" as const },
      { code: "1003", name: "Debtors", group: "ASSET" as const },
      { code: "2001", name: "Creditors", group: "LIABILITY" as const },
      { code: "2002", name: "Output CGST", group: "LIABILITY" as const },
      { code: "2003", name: "Output SGST", group: "LIABILITY" as const },
      { code: "2004", name: "Output IGST", group: "LIABILITY" as const },
      { code: "3001", name: "Sales", group: "INCOME" as const },
    ];

    for (const acc of glAccounts) {
      await prisma.account.upsert({
        where: { code_outletId: { code: acc.code, outletId: testOutletId } },
        update: {},
        create: { ...acc, outletId: testOutletId },
      });
    }

    // Create operational accounts
    const cashResult = await createAccount({
      name: "Cash Drawer 1",
      type: "CASH",
      openingBalance: 1000,
      outletId: testOutletId,
    });
    cashAccountId = cashResult.data!.id;

    const bankResult = await createAccount({
      name: "ICICI Bank 1",
      type: "BANK",
      openingBalance: 2000,
      outletId: testOutletId,
    });
    bankAccountId = bankResult.data!.id;

    // Create test customer
    const customerResult = await createCustomer(testOutletId, {
      name: "Test Customer Split",
      phone: "9999999991",
      email: "custsplit@test.com",
      address: "Test Address",
      state: "TEST",
      creditPeriod: 30,
      creditLimit: 50000,
      openingBalance: 0,
      isActive: true,
      b2b: false,
    });
    customerId = customerResult.data!.id;

    // Create test vendor
    const vendor = await prisma.party.create({
      data: {
        type: "VENDOR",
        name: "Test Vendor Split",
        phone: "9999999992",
        email: "vendorsplit@test.com",
        address: "Test Address",
        state: "TEST",
        outletId: testOutletId,
      },
    });
    vendorId = vendor.id;
  });

  afterAll(async () => {
    await prisma.payment.deleteMany({ where: { outletId: testOutletId } });
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

  it("Test 1: Create NO2 invoice with atomic multiple payments on creation", async () => {
    // Total taxable: ₹1000, tax 18% = ₹180. Grand total: ₹1180.
    // Pay ₹500 in Cash (via cashAccountId), and ₹680 in UPI (via bankAccountId)
    const result = await createSalesInvoice({
      billType: "NO2",
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
      payments: [
        {
          amount: 500,
          paymentMode: "CASH",
          bankAccountId: cashAccountId,
        },
        {
          amount: 680,
          paymentMode: "UPI",
          bankAccountId: bankAccountId,
        },
      ],
    });

    expect(result.success).toBe(true);
    const invoice = result.data!.invoice;
    expect(invoice.status).toBe("PAID");

    // Check payment records created
    const payments = await prisma.payment.findMany({
      where: { invoiceId: invoice.id },
      orderBy: { amount: "asc" },
    });
    expect(payments).toHaveLength(2);
    expect(payments[0].amount).toBe(500);
    expect(payments[0].paymentMode).toBe("CASH");
    expect(payments[1].amount).toBe(680);
    expect(payments[1].paymentMode).toBe("UPI");

    // Check account balance updates
    const cashAcc = await prisma.account.findUnique({ where: { id: cashAccountId } });
    const bankAcc = await prisma.account.findUnique({ where: { id: bankAccountId } });
    expect(cashAcc!.currentBalance).toBe(1500); // 1000 + 500
    expect(bankAcc!.currentBalance).toBe(2680); // 2000 + 680
  });

  it("Test 2: Record multiple payments on an existing sales invoice using recordInvoiceMultiplePayments", async () => {
    // Create new sales invoice of ₹1180 (no initial payment)
    const result = await createSalesInvoice({
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

    expect(result.success).toBe(true);
    const invoice = result.data!.invoice;
    expect(invoice.status).toBe("POSTED");

    // Get current balances
    const cashAccBefore = await prisma.account.findUnique({ where: { id: cashAccountId } });
    const bankAccBefore = await prisma.account.findUnique({ where: { id: bankAccountId } });

    // Record split payment: ₹400 via CASH (cashAccountId) and ₹780 via CARD (bankAccountId)
    const paymentResult = await recordInvoiceMultiplePayments({
      invoiceId: invoice.id,
      outletId: testOutletId,
      partyId: customerId,
      paymentDate: new Date().toISOString().split("T")[0],
      userId: testUserId,
      payments: [
        {
          amount: 400,
          paymentMode: "CASH",
          bankAccountId: cashAccountId,
        },
        {
          amount: 780,
          paymentMode: "CARD",
          bankAccountId: bankAccountId,
        },
      ],
    });

    expect(paymentResult.success).toBe(true);
    expect(paymentResult.data!.invoiceStatus).toBe("PAID");
    expect(paymentResult.data!.remaining).toBe(0);

    // Verify payments in DB
    const dbPayments = await prisma.payment.findMany({
      where: { invoiceId: invoice.id },
      orderBy: { amount: "asc" },
    });
    expect(dbPayments).toHaveLength(2);
    expect(dbPayments[0].amount).toBe(400);
    expect(dbPayments[1].amount).toBe(780);

    // Verify account balances
    const cashAccAfter = await prisma.account.findUnique({ where: { id: cashAccountId } });
    const bankAccAfter = await prisma.account.findUnique({ where: { id: bankAccountId } });
    expect(cashAccAfter!.currentBalance).toBe(roundToTwo(cashAccBefore!.currentBalance + 400));
    expect(bankAccAfter!.currentBalance).toBe(roundToTwo(bankAccBefore!.currentBalance + 780));
  });

  it("Test 3: Record multiple payments on a vendor purchase bill using recordVendorBillMultiplePayments", async () => {
    // Create a purchase bill (vendor transaction)
    const bill = await prisma.transaction.create({
      data: {
        type: "PURCHASE_ORDER",
        txnNumber: `BILL-${Date.now()}`,
        partyId: vendorId,
        outletId: testOutletId,
        grandTotal: 1000,
        status: "POSTED",
        date: new Date(),
        userId: testUserId,
      },
    });

    // Seed/adjust account balances to ensure we have money to pay
    await prisma.account.update({
      where: { id: cashAccountId },
      data: { currentBalance: 2000 },
    });
    await prisma.account.update({
      where: { id: bankAccountId },
      data: { currentBalance: 3000 },
    });

    // Record vendor multiple payments: ₹300 CASH and ₹700 BANK
    const paymentResult = await recordVendorBillMultiplePayments({
      invoiceId: bill.id,
      outletId: testOutletId,
      partyId: vendorId,
      paymentDate: new Date().toISOString().split("T")[0],
      userId: testUserId,
      payments: [
        {
          amount: 300,
          paymentMode: "CASH",
          bankAccountId: cashAccountId,
        },
        {
          amount: 700,
          paymentMode: "ONLINE_TRANSFER",
          bankAccountId: bankAccountId,
        },
      ],
    });

    expect(paymentResult.success).toBe(true);
    expect(paymentResult.data!.billStatus).toBe("PAID");
    expect(paymentResult.data!.remaining).toBe(0);

    // Check payment records in DB
    const dbPayments = await prisma.payment.findMany({
      where: { invoiceId: bill.id },
      orderBy: { amount: "asc" },
    });
    expect(dbPayments).toHaveLength(2);
    expect(dbPayments[0].amount).toBe(300);
    expect(dbPayments[1].amount).toBe(700);

    // Check account balance decrements
    const cashAccAfter = await prisma.account.findUnique({ where: { id: cashAccountId } });
    const bankAccAfter = await prisma.account.findUnique({ where: { id: bankAccountId } });
    expect(cashAccAfter!.currentBalance).toBe(1700); // 2000 - 300
    expect(bankAccAfter!.currentBalance).toBe(2300); // 3000 - 700
  });
});
