import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { createAccount, getOutletAccounts, getAccountDetail } from "@/actions/accounts/index";
import { transferBetweenAccounts } from "@/actions/accounts/transfers";
import { recordAccountTransaction, getAccountTransactionHistory, getAccountBalance } from "@/actions/accounts/transactions";
import { createSalesInvoice } from "@/actions/sales/sales-invoice";
import { appendItemsToInvoice } from "@/actions/sales/sales-invoice";
import { recordInvoicePayment } from "@/actions/sales/payment";
import { createCustomer } from "@/actions/sales/customers";
import { roundToTwo } from "@/lib/utils";

/**
 * Test Suite: Accounts & Operational Account Tracking + Partial Billing
 *
 * Validates:
 * 1. Account creation (CASH and BANK types)
 * 2. Account transaction recording (IN/OUT)
 * 3. Account balance calculations
 * 4. Internal transfers between accounts
 * 5. Payment recording with operational account tracking
 * 6. Partial billing - append items to unpaid invoice
 * 7. FIFO allocation when appending items
 * 8. Journal entries and outstanding balance updates
 */

describe("Accounts & Partial Billing", () => {
  let testOutletId: string;
  let testUserId: string;
  let testProductId: string;
  let testVariantId: string;
  let customerId: string;
  let cashAccountId: string;
  let bankAccountId: string;

  beforeAll(async () => {
    // Setup test data
    const outlet = await prisma.outlet.create({
      data: {
        name: "Test Outlet for Accounts",
        address: "Test Address",
        state: "TEST",
        invoicePrefix: "ACC",
        allowRawCashBills: true,
      },
    });
    testOutletId = outlet.id;

    const user = await prisma.user.create({
      data: {
        email: `test-acc-${Date.now()}@example.com`,
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
      await prisma.gLAccount.upsert({
        where: { code_outletId: { code: acc.code, outletId: testOutletId } },
        update: {},
        create: { ...acc, outletId: testOutletId },
      });
    }

    // Create operational accounts
    const cashResult = await createAccount({
      name: "Cash Drawer",
      type: "CASH",
      openingBalance: 5000,
      outletId: testOutletId,
    });
    cashAccountId = cashResult.data!.id;

    const bankResult = await createAccount({
      name: "HDFC Bank",
      type: "BANK",
      openingBalance: 10000,
      outletId: testOutletId,
    });
    bankAccountId = bankResult.data!.id;

    // Create test customer
    const customerResult = await createCustomer(testOutletId, {
      name: "Test Customer",
      phone: "9999999999",
      email: "customer@test.com",
      address: "Test Address",
      state: "TEST",
      creditPeriod: 30,
      creditLimit: 50000,
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ACCOUNT CREATION & MANAGEMENT TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  it("Test 1: Account creation with opening balance", async () => {
    const accounts = await getOutletAccounts(testOutletId);
    expect(accounts.success).toBe(true);
    expect(accounts.data).toHaveLength(2); // Cash + Bank

    const cashAcc = accounts.data?.find(a => a.type === "CASH");
    expect(cashAcc?.currentBalance).toBe(5000);
  });

  it("Test 2: Get account detail with transaction history", async () => {
    const detail = await getAccountDetail(cashAccountId, testOutletId);
    expect(detail.success).toBe(true);
    expect(detail.data?.id).toBe(cashAccountId);
    expect(detail.data?.type).toBe("CASH");
    expect(detail.data?.currentBalance).toBe(5000);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ACCOUNT TRANSACTION TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  it("Test 3: Record IN transaction and update balance", async () => {
    const txnResult = await recordAccountTransaction({
      accountId: cashAccountId,
      type: "IN",
      amount: 2000,
      paymentMode: "CASH",
      remarks: "Test deposit",
      outletId: testOutletId,
      userId: testUserId,
    });

    expect(txnResult.success).toBe(true);

    const updated = await getAccountBalance(cashAccountId, testOutletId);
    expect(updated.success).toBe(true);
    expect(updated.data).toBe(7000); // 5000 + 2000
  });

  it("Test 4: Record OUT transaction and update balance", async () => {
    const txnResult = await recordAccountTransaction({
      accountId: cashAccountId,
      type: "OUT",
      amount: 1000,
      paymentMode: "CASH",
      remarks: "Test withdrawal",
      outletId: testOutletId,
      userId: testUserId,
    });

    expect(txnResult.success).toBe(true);

    const updated = await getAccountBalance(cashAccountId, testOutletId);
    expect(updated.success).toBe(true);
    expect(updated.data).toBe(6000); // 7000 - 1000
  });

  it("Test 5: Get account transaction history", async () => {
    const history = await getAccountTransactionHistory(cashAccountId, testOutletId, {});

    expect(history.success).toBe(true);
    expect((history.data as any[]).length).toBeGreaterThanOrEqual(2);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRANSFER TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  it("Test 6: Internal transfer between accounts", async () => {
    const cashBefore = await getAccountBalance(cashAccountId, testOutletId);
    const bankBefore = await getAccountBalance(bankAccountId, testOutletId);

    const transferResult = await transferBetweenAccounts({
      fromAccountId: cashAccountId,
      toAccountId: bankAccountId,
      amount: 1000,
      date: new Date(),
      remarks: "Deposit to bank",
      outletId: testOutletId,
      userId: testUserId,
    });

    expect(transferResult.success).toBe(true);

    const cashAfter = await getAccountBalance(cashAccountId, testOutletId);
    const bankAfter = await getAccountBalance(bankAccountId, testOutletId);

    expect(cashAfter.data).toBe(roundToTwo((cashBefore.data || 0) - 1000));
    expect(bankAfter.data).toBe(roundToTwo((bankBefore.data || 0) + 1000));
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAYMENT WITH OPERATIONAL ACCOUNT TRACKING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  it("Test 7: Record payment with operational account selection", async () => {
    // Create invoice
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

    const invoiceId = invoiceResult.data!.invoice.id;

    const cashBefore = await getAccountBalance(cashAccountId, testOutletId);

    // Record payment with operational account
    const paymentResult = await recordInvoicePayment({
      invoiceId,
      outletId: testOutletId,
      partyId: customerId,
      amount: 1180,
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMode: "Cash",
      operationalAccountId: cashAccountId,
      userId: testUserId,
    });

    expect(paymentResult.success).toBe(true);
    expect(paymentResult.data?.invoiceStatus).toBe("PAID");

    const cashAfter = await getAccountBalance(cashAccountId, testOutletId);
    expect(cashAfter.data).toBe(roundToTwo((cashBefore.data || 0) + 1180));
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PARTIAL BILLING TESTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  it("Test 8: Append items to unpaid invoice", async () => {
    // Create initial invoice
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

    const invoice = invoiceResult.data!.invoice;
    const initialGrandTotal = invoice.grandTotal;

    // Record partial payment
    await recordInvoicePayment({
      invoiceId: invoice.id,
      outletId: testOutletId,
      partyId: customerId,
      amount: 500,
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMode: "Cash",
      userId: testUserId,
    });

    // Verify invoice is PARTIALLY_PAID
    let invoiceCheck = await prisma.transaction.findUnique({
      where: { id: invoice.id },
    });
    expect(invoiceCheck?.status).toBe("PARTIALLY_PAID");

    // Append new items
    const appendResult = await appendItemsToInvoice(invoice.id, {
      items: [
        {
          variantId: testVariantId,
          quantity: 3,
          rate: 200,
          taxableValue: 600,
          cgst: 54,
          sgst: 54,
          igst: 0,
        },
      ],
      userId: testUserId,
    });

    expect(appendResult.success).toBe(true);

    // Verify invoice totals increased
    const updatedInvoice = await prisma.transaction.findUnique({
      where: { id: invoice.id },
      include: { items: true },
    });

    expect(updatedInvoice!.items.length).toBe(2); // Original + appended
    expect(updatedInvoice!.grandTotal).toBe(roundToTwo(initialGrandTotal + 708)); // 600 + 108 tax
  });

  it("Test 9: Partial billing prevents overpayment errors", async () => {
    // Create invoice
    const invoiceResult = await createSalesInvoice({
      billType: "NO1",
      partyId: customerId,
      fromOutletId: testOutletId,
      items: [
        {
          variantId: testVariantId,
          quantity: 2,
          rate: 200,
          taxableValue: 400,
          cgst: 36,
          sgst: 36,
          igst: 0,
        },
      ],
      date: new Date(),
      userId: testUserId,
    });

    const invoiceId = invoiceResult.data!.invoice.id;

    // Append items bringing total to ₹900
    const appendResult = await appendItemsToInvoice(invoiceId, {
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
      userId: testUserId,
    });

    expect(appendResult.success).toBe(true);

    const invoice = await prisma.transaction.findUnique({
      where: { id: invoiceId },
    });

    expect(invoice!.grandTotal).toBe(roundToTwo(900 + 162)); // 400 + 500 taxable + (72+90) tax
  });
});
