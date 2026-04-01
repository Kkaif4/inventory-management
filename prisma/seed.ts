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

  // 12. Create GL Accounts for Expense Categories (5xxx series)
  const expenseGLAccounts = [
    { code: "5001", name: "Rent Expense" },
    { code: "5002", name: "Salary Expense" },
    { code: "5003", name: "Utilities Expense" },
    { code: "5004", name: "Fuel & Travel Expense" },
    { code: "5005", name: "Miscellaneous Expense" },
  ];

  const glAccountMap: Record<string, string> = {};

  for (const glAcc of expenseGLAccounts) {
    let glAccount = await prisma.gLAccount.findFirst({
      where: { code: glAcc.code, outletId: outlet.id },
    });

    if (!glAccount) {
      glAccount = await prisma.gLAccount.create({
        data: {
          code: glAcc.code,
          name: glAcc.name,
          group: "EXPENSE",
          outletId: outlet.id,
        },
      });
    }
    glAccountMap[glAcc.code] = glAccount.id;
  }
  console.log("Seed: Expense GL Accounts created (5001-5005)");

  // 13. Create Expense Categories linked to GL Accounts
  const expenseCategories = [
    { name: "Rent", code: "5001" },
    { name: "Salary", code: "5002" },
    { name: "Utilities", code: "5003" },
    { name: "Fuel & Travel", code: "5004" },
    { name: "Miscellaneous", code: "5005" },
  ];

  const expenseCategoryMap: Record<string, string> = {};

  for (const cat of expenseCategories) {
    let expCat = await prisma.expenseCategory.findFirst({
      where: { code: cat.code, outletId: outlet.id },
    });

    if (!expCat) {
      expCat = await prisma.expenseCategory.create({
        data: {
          name: cat.name,
          code: cat.code,
          glAccountId: glAccountMap[cat.code],
          outletId: outlet.id,
          isActive: true,
        },
      });
    }
    expenseCategoryMap[cat.code] = expCat.id;
  }
  console.log("Seed: Expense Categories created (Rent, Salary, Utilities, Fuel, Misc)");

  // 14. Create sample Expense records
  if (adminUser) {
    const today = new Date();

    // Sample rent expense (POSTED) - 25000 @ 0% GST
    const rentExpenseExists = await prisma.expense.findFirst({
      where: { txnNumber: "EXP-0001", outletId: outlet.id },
    });

    if (!rentExpenseExists) {
      await prisma.expense.create({
        data: {
          txnNumber: "EXP-0001",
          date: today,
          outletId: outlet.id,
          categoryId: expenseCategoryMap["5001"],
          description: "Monthly rent for shop premises",
          vendorId: vendor.id,
          paymentMode: "CHEQUE",
          accountId: cashAccount.id,
          taxableAmount: 25000,
          gstRate: null,
          inputGst: 0,
          totalAmount: 25000,
          status: "POSTED",
          createdBy: adminUser.id,
        } as any,
      });
    }

    // Sample salary expense (POSTED) - 15000 @ 0% GST
    const salaryExpenseExists = await prisma.expense.findFirst({
      where: { txnNumber: "EXP-0002", outletId: outlet.id },
    });

    if (!salaryExpenseExists) {
      await prisma.expense.create({
        data: {
          txnNumber: "EXP-0002",
          date: today,
          outletId: outlet.id,
          categoryId: expenseCategoryMap["5002"],
          description: "Staff salary payment",
          vendorId: vendor.id,
          paymentMode: "CASH",
          accountId: cashAccount.id,
          taxableAmount: 15000,
          gstRate: null,
          inputGst: 0,
          totalAmount: 15000,
          status: "POSTED",
          createdBy: adminUser.id,
        } as any,
      });
    }

    // Sample utilities expense (DRAFT) - 3500 @ 18% GST = 630 ITC
    const utilitiesExpenseExists = await prisma.expense.findFirst({
      where: { txnNumber: "EXP-0003", outletId: outlet.id },
    });

    if (!utilitiesExpenseExists) {
      await prisma.expense.create({
        data: {
          txnNumber: "EXP-0003",
          date: today,
          outletId: outlet.id,
          categoryId: expenseCategoryMap["5003"],
          description: "Electricity and water bills",
          vendorId: vendor.id,
          paymentMode: "ONLINE_TRANSFER",
          accountId: bankAccount.id,
          taxableAmount: 3500,
          gstRate: 18,
          inputGst: 630,
          totalAmount: 4130,
          status: "DRAFT",
          createdBy: adminUser.id,
        } as any,
      });
    }

    console.log("Seed: Sample expenses created (Rent, Salary, Utilities)");
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
