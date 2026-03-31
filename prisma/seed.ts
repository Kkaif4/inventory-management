import "dotenv/config";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@/generated/prisma";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seed: Starting...");

  // 1. Create Outlet first (Warehouse now depends on Outlet)
  const outletName = "City Showroom - South";
  let outlet = await prisma.outlet.findFirst({
    where: { name: outletName },
  });

  if (!outlet) {
    outlet = await prisma.outlet.create({
      data: {
        name: outletName,
        invoicePrefix: "INV/SS/",
        gstin: "27ABCDE1234F1Z5",
        bankDetails: "HDFC Bank, AC: 987654321, IFSC: HDFC0001",
        negativeStockPolicy: "WARN",
        allowRawCashBills: true,
        address: "Plot 45, Industrial Area Phase II, Mumbai",
        state: "Maharashtra",
        invoiceStartingNumber: 1,
        batchTrackingEnabled: true,
      },
    });
    console.log("Seed: Outlet created");
  }

  // 2. Create Warehouse linked to Outlet
  const warehouseName = "Main Distribution Center";
  let warehouse = await prisma.warehouse.findFirst({
    where: { name: warehouseName },
  });

  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: {
        name: warehouseName,
        address: "Plot 45, Industrial Area Phase II, Mumbai",
        state: "Maharashtra",
        contactName: "Mangesh",
        contactPhone: "9876543210",
        outletId: outlet.id,
        isDefault: true,
      },
    });
    console.log("Seed: Warehouse created and linked to Outlet");
  }

  // 3. Create Admin User
  const adminEmail = "admin@admin.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "System Administrator",
        role: Role.ADMIN,
        password: hashedPassword,
        isActive: true,
        outlets: {
          connect: [{ id: outlet.id }],
        },
      },
    });
    console.log(
      "Seed: Admin user created (admin@admin.com / admin123) and linked to outlet",
    );
  } else {
    // Ensure existing admin is linked
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        outlets: {
          connect: [{ id: outlet.id }],
        },
      },
    });
    console.log("Seed: Admin user already exists, updated outlet linkage");
  }

  // 4. Create Staff Member
  const staffEmail = "arjun@enterprise.com";
  const existingStaff = await prisma.user.findUnique({
    where: { email: staffEmail },
  });

  if (!existingStaff) {
    const hashedPassword = await bcrypt.hash("staff123", 10);
    await prisma.user.create({
      data: {
        email: staffEmail,
        name: "Arjun Sales",
        role: Role.SALES,
        password: hashedPassword,
        isActive: true,
      },
    });
    console.log("Seed: Staff user created (arjun@enterprise.com / staff123)");
  }

  // 5. Create a Vendor
  const vendorName = "Niharika Suppliers";
  let vendor = await prisma.party.findFirst({
    where: { name: vendorName, type: "VENDOR" },
  });

  if (!vendor) {
    vendor = await prisma.party.create({
      data: {
        type: "VENDOR",
        name: vendorName,
        gstin: "27AABBCCDD1234E",
        pan: "AABBCC1234E",
        address: "Industrial Estate, Kurla",
        state: "Maharashtra",
        contactInfo: "niharika@suppliers.com",
        phone: "9820012345",
        email: "sales@niharika.com",
        bankName: "State Bank of India",
        bankAccountName: "Niharika Suppliers Current A/C",
        bankAccountNumber: "123456789012",
        bankIfsc: "SBIN0001234",
        openingBalance: 0,
        outletId: outlet.id,
      },
    });
    console.log("Seed: Vendor created with detailed info");
  }

  // 6. Create a Customer
  const customerName = "Retail Hardware Traders";
  let customer = await prisma.party.findFirst({
    where: { name: customerName, type: "CUSTOMER" },
  });

  if (!customer) {
    customer = await prisma.party.create({
      data: {
        type: "CUSTOMER",
        name: customerName,
        address: "Linking Road, Santacruz",
        state: "Maharashtra",
        contactInfo: "contact@retailhardware.com",
        phone: "9821198765",
        email: "retail@hardware.com",
        openingBalance: 0,
        outletId: outlet.id,
      },
    });
    console.log("Seed: Customer created with detailed info");
  }

  // 7. Create Operational Accounts for the outlet (Main Cash Account)
  const cashAccount = await prisma.account.upsert({
    where: { name_outletId: { name: "Main Cash", outletId: outlet.id } },
    update: {},
    create: {
      name: "Main Cash",
      type: "CASH",
      openingBalance: 10000,
      currentBalance: 10000,
      outletId: outlet.id,
    },
  });
  console.log("Seed: Cash account created (Main Cash, Opening: ₹10,000)");

  // 8. Create Bank Account
  const bankAccount = await prisma.account.upsert({
    where: { name_outletId: { name: "HDFC Bank", outletId: outlet.id } },
    update: {},
    create: {
      name: "HDFC Bank",
      type: "BANK",
      openingBalance: 50000,
      currentBalance: 50000,
      outletId: outlet.id,
    },
  });
  console.log("Seed: Bank account created (HDFC Bank, Opening: ₹50,000)");

  // 9. Add payment modes for Cash Account (only CASH)
  await prisma.accountPaymentMode.upsert({
    where: {
      accountId_mode: { accountId: cashAccount.id, mode: "CASH" },
    },
    update: {},
    create: { accountId: cashAccount.id, mode: "CASH" },
  });
  console.log("Seed: Payment mode CASH added to Main Cash account");

  // 10. Add payment modes for Bank Account (UPI, CHEQUE, ONLINE_TRANSFER, CARD)
  const bankPaymentModes = ["UPI", "CHEQUE", "ONLINE_TRANSFER", "CARD"];
  for (const mode of bankPaymentModes) {
    await prisma.accountPaymentMode.upsert({
      where: {
        accountId_mode: { accountId: bankAccount.id, mode: mode as any },
      },
      update: {},
      create: { accountId: bankAccount.id, mode: mode as any },
    });
  }
  console.log(
    "Seed: Payment modes (UPI, CHEQUE, ONLINE_TRANSFER, CARD) added to HDFC Bank account",
  );

  // 11. Create sample Account Transaction (initial deposit)
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@admin.com" },
  });

  if (adminUser) {
    await prisma.accountTransaction.create({
      data: {
        accountId: cashAccount.id,
        type: "IN",
        amount: 5000,
        paymentMode: "CASH",
        balanceAfter: 15000,
        remarks: "Initial cash deposit at store opening",
        userId: adminUser.id,
      },
    });
    console.log(
      "Seed: Sample account transaction created (Cash IN ₹5,000, Balance: ₹15,000)",
    );
  }

  console.log("Seed: Completed successfully");
}

main()
  .catch((e) => {
    console.error("Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
