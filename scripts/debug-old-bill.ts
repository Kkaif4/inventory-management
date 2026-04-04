import { prisma } from "../src/lib/prisma";
import { createOldBill } from "../src/actions/sales/old-bill";
import { initializeCOA } from "../src/domains/accounting/ledger-service";

async function run() {
  const testOutletId = "debug_outlet_" + Date.now();
  const testUserId = "debug_user_" + Date.now();
  
  try {
    const outlet = await prisma.outlet.create({
      data: { id: testOutletId, name: "Debug Outlet", address: "Test", state: "TEST", invoicePrefix: "DBG", allowRawCashBills: true },
    });
    const user = await prisma.user.create({
      data: { id: testUserId, email: `dbg-${Date.now()}@example.com`, name: "OB User", password: "hashed", role: "SALES" },
    });
    
    await initializeCOA(testOutletId);

    const result = await createOldBill({
      billType: "OLD",
      fromOutletId: testOutletId,
      date: new Date("2023-01-15T10:00:00Z"),
      buyerName: "Historic Customer",
      buyerPhone: "1234567890",
      grandTotal: 1000,
      items: [{ itemDescription: "Historic Item 1", quantity: 10, rate: 100 }],
      payments: [{ amount: 600, paymentDate: new Date("2023-02-20T10:00:00Z"), note: "Test" }],
      userId: testUserId,
    });
    
    console.log("RESULT:::", JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("EXCEPTION:::", e);
  } finally {
    await prisma.account.deleteMany({ where: { outletId: testOutletId } });
    await prisma.outlet.delete({ where: { id: testOutletId } });
    await prisma.user.delete({ where: { id: testUserId } });
  }
}

run();
