import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { getTrialBalance } from "@/actions/reports/index";
import { initializeCOA, AccountingService } from "@/domains/accounting/ledger-service";

// Mock authentication logic
vi.mock('@/lib/outlet-auth', () => ({
  requireAdminSession: vi.fn().mockResolvedValue("test-user-id"),
  validateSessionOutletAccess: vi.fn().mockResolvedValue(undefined),
  getCurrentSessionOutlet: vi.fn().mockImplementation((id) => id || "test-outlet-1"),
}));

describe("Trial Balance Reproduction Tests", () => {
  let outlet1Id: string;
  let outlet2Id: string;

  beforeAll(async () => {
    // Setup two outlets
    const outlet1 = await prisma.outlet.create({
      data: {
        name: "Outlet 1",
        invoicePrefix: "O1",
        state: "TEST",
      },
    });
    outlet1Id = outlet1.id;

    const outlet2 = await prisma.outlet.create({
      data: {
        name: "Outlet 2",
        invoicePrefix: "O2",
        state: "TEST",
      },
    });
    outlet2Id = outlet2.id;

    await initializeCOA(outlet1Id);
    await initializeCOA(outlet2Id);
  });

  afterAll(async () => {
    // Cleanup
    await prisma.ledgerEntry.deleteMany({
      where: { account: { outletId: { in: [outlet1Id, outlet2Id] } } }
    });
    await prisma.account.deleteMany({
      where: { outletId: { in: [outlet1Id, outlet2Id] } }
    });
    await prisma.outlet.deleteMany({
      where: { id: { in: [outlet1Id, outlet2Id] } }
    });
  });

  it("Bug 1: Trial Balance ignores account opening balance", async () => {
    // Get an account in outlet 1
    const cashAcc = await prisma.account.findFirst({
      where: { code: "1001", outletId: outlet1Id }
    });

    // Set an opening balance
    await prisma.account.update({
      where: { id: cashAcc!.id },
      data: { openingBalance: 5000 }
    });

    // Pass outlet1Id explicitly so getCurrentSessionOutlet mock returns it
    const result = await getTrialBalance(outlet1Id);
    expect(result.success).toBe(true);

    const trialBalance = result.data!;
    const cashEntry = trialBalance.find(a => a.code === "1001" && a.name === "Cash in Hand");

    expect(cashEntry?.debit).toBe(5000);
  });

  it("Bug 2: Trial Balance fetches accounts from all outlets instead of current outlet", async () => {
    // Pass outlet1Id explicitly — mock returns it, so only outlet1's 3 accounts are returned
    const result = await getTrialBalance(outlet1Id);
    expect(result.success).toBe(true);

    const trialBalance = result.data!;

    // outlet1 has exactly 3 accounts (from initializeCOA); outlet2's accounts must not appear
    expect(trialBalance.length).toBe(3);
  });
});
