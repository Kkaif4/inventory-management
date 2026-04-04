import "dotenv/config";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Role,
  AccountType,
  AccountGroup,
} from "@/generated/prisma";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ============================================================================
// Logging Helpers
// ============================================================================
const log = (message: string) => console.log(`✓ ${message}`);
const logError = (message: string) => console.error(`✗ ${message}`);
const logSection = (title: string) => console.log(`\n📋 ${title}`);

async function main() {
  try {
    logSection("🌱 SEED: Starting Database Seeding");
    console.log(
      `Database URL: ${process.env.DATABASE_URL?.substring(0, 30)}...`,
    );

    logSection("🏪 Outlet & Warehouse");

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
      log(`Outlet created: ${outletName}`);
    } else {
      log(`Outlet already exists: ${outletName}`);
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
      log(`Warehouse created: ${warehouseName}`);
    } else {
      log(`Warehouse already exists: ${warehouseName}`);
    }

    logSection("👥 Users");

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
      log(`Admin user created: ${adminEmail} / admin123`);
    } else {
      // Ensure existing admin is linked to outlet
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          outlets: {
            connect: [{ id: outlet.id }],
          },
        },
      });
      log(`Admin user already exists: ${adminEmail}`);
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
          outlets: {
            connect: [{ id: outlet.id }],
          },
        },
      });
      log(`Staff user created: ${staffEmail} / staff123`);
    } else {
      log(`Staff user already exists: ${staffEmail}`);
    }

    logSection("🤝 Parties (Vendors & Customers)");

    // 5. Create a Vendor
    const vendorName = "Niharika Suppliers";
    let vendor = await prisma.party.findFirst({
      where: { name: vendorName, type: "VENDOR", outletId: outlet.id },
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
      log(`Vendor created: ${vendorName}`);
    } else {
      log(`Vendor already exists: ${vendorName}`);
    }

    // 6. Create a Customer
    const customerName = "Retail Hardware Traders";
    let customer = await prisma.party.findFirst({
      where: { name: customerName, type: "CUSTOMER", outletId: outlet.id },
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
      log(`Customer created: ${customerName}`);
    } else {
      log(`Customer already exists: ${customerName}`);
    }

    logSection("💰 Accounts (Cash & Bank)");

    // 7. Create Operational Accounts for the outlet (Main Cash Account)
    // CASH accounts support CASH payment mode
    const cashAccount = await prisma.account.upsert({
      where: { name_outletId: { name: "Main Cash", outletId: outlet.id } },
      update: {},
      create: {
        name: "Main Cash",
        type: AccountType.CASH,
        group: "ASSET",
        isSystem: false,
        openingBalance: 10000,
        currentBalance: 10000,
        outletId: outlet.id,
      },
    });
    log(
      `✓ Cash account: ${cashAccount.name} | Opening: ₹10,000 | Supports: CASH payments`,
    );

    // 8. Create Bank Account
    // BANK accounts support UPI, CHEQUE, ONLINE_TRANSFER, CARD payment modes
    const bankAccount = await prisma.account.upsert({
      where: { name_outletId: { name: "HDFC Current", outletId: outlet.id } },
      update: {},
      create: {
        name: "HDFC Current",
        type: AccountType.BANK,
        group: "ASSET",
        isSystem: false,
        openingBalance: 50000,
        currentBalance: 50000,
        outletId: outlet.id,
      },
    });
    log(
      `✓ Bank account: ${bankAccount.name} | Opening: ₹50,000 | Supports: UPI, CHEQUE, ONLINE_TRANSFER, CARD`,
    );

    // 9. Create additional bank account for diversity
    const bankAccount2 = await prisma.account.upsert({
      where: { name_outletId: { name: "ICICI Savings", outletId: outlet.id } },
      update: {},
      create: {
        name: "ICICI Savings",
        type: AccountType.BANK,
        group: "ASSET",
        isSystem: false,
        openingBalance: 25000,
        currentBalance: 25000,
        outletId: outlet.id,
      },
    });
    log(
      `✓ Bank account: ${bankAccount2.name} | Opening: ₹25,000 | Supports: UPI, CHEQUE, ONLINE_TRANSFER, CARD`,
    ); // 9. Create sample Account Transaction (initial deposit)
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
      log(
        `✓ Sample transaction: Cash IN ₹5,000 | Balance after: ₹15,000 | Status: Recorded`,
      );
    }

    logSection("📊 GL Accounts (Chart of Accounts)");

    // Define account groups and accounts
    const accountStructure = [
      {
        group: AccountGroup.ASSET,
        code: "1001",
        name: "Cash in Hand",
      },
      {
        group: AccountGroup.ASSET,
        code: "1002",
        name: "Bank Accounts",
      },
      {
        group: AccountGroup.ASSET,
        code: "1010",
        name: "Accounts Receivable",
      },
      {
        group: AccountGroup.LIABILITY,
        code: "2001",
        name: "Accounts Payable",
      },
      {
        group: AccountGroup.LIABILITY,
        code: "2010",
        name: "GST Input Tax Credit",
      },
      {
        group: AccountGroup.EQUITY,
        code: "3001",
        name: "Capital Account",
      },
      {
        group: AccountGroup.INCOME,
        code: "4001",
        name: "Sales Revenue",
      },
      {
        group: AccountGroup.INCOME,
        code: "4002",
        name: "Service Revenue",
      },
      {
        group: AccountGroup.EXPENSE,
        code: "5001",
        name: "Rent Expense",
      },
      {
        group: AccountGroup.EXPENSE,
        code: "5002",
        name: "Salaries & Wages",
      },
      {
        group: AccountGroup.EXPENSE,
        code: "5003",
        name: "Utilities (Electricity, Water)",
      },
      {
        group: AccountGroup.EXPENSE,
        code: "5004",
        name: "Fuel & Transportation",
      },
      {
        group: AccountGroup.EXPENSE,
        code: "5005",
        name: "Office Supplies",
      },
      {
        group: AccountGroup.EXPENSE,
        code: "5006",
        name: "Marketing & Advertising",
      },
      {
        group: AccountGroup.EXPENSE,
        code: "5007",
        name: "Repairs & Maintenance",
      },
      {
        group: AccountGroup.EXPENSE,
        code: "5008",
        name: "Professional Services",
      },
      {
        group: AccountGroup.EXPENSE,
        code: "5009",
        name: "Insurance",
      },
      {
        group: AccountGroup.EXPENSE,
        code: "5010",
        name: "Miscellaneous Expenses",
      },
    ];

    // Create GL accounts (now merged into Account model)
    for (const acc of accountStructure) {
      const existing = await prisma.account.findFirst({
        where: {
          code: acc.code,
          outletId: outlet.id,
        },
      });

      if (!existing) {
        await prisma.account.create({
          data: {
            code: acc.code,
            name: acc.name,
            group: acc.group,
            isSystem: true,
            type: null,
            openingBalance: 0,
            currentBalance: 0,
            outletId: outlet.id,
          },
        });
        log(`GL Account: ${acc.code} - ${acc.name}`);
      }
    }

    logSection("💳 Expense Categories (Predefined)");

    // Define predefined expense categories
    const expenseCategories = [
      { code: "5001", name: "Rent", description: "Rent and lease payments" },
      {
        code: "5002",
        name: "Salaries & Wages",
        description: "Employee salaries and wages",
      },
      {
        code: "5003",
        name: "Utilities",
        description: "Electricity, water, and other utilities",
      },
      {
        code: "5004",
        name: "Fuel & Transportation",
        description: "Fuel, vehicle maintenance, and transport costs",
      },
      {
        code: "5005",
        name: "Office Supplies",
        description: "Office supplies and consumables",
      },
      {
        code: "5006",
        name: "Marketing & Advertising",
        description: "Marketing, advertising, and promotional expenses",
      },
      {
        code: "5007",
        name: "Repairs & Maintenance",
        description: "Building and equipment repairs",
      },
      {
        code: "5008",
        name: "Professional Services",
        description: "Accounting, legal, and consulting fees",
      },
      {
        code: "5009",
        name: "Insurance",
        description: "Business insurance premiums",
      },
      {
        code: "5010",
        name: "Miscellaneous",
        description: "Other miscellaneous expenses",
      },
    ];

    for (const cat of expenseCategories) {
      const existing = await prisma.expenseCategory.findFirst({
        where: {
          code: cat.code,
          outletId: outlet.id,
        },
      });

      if (!existing) {
        // Get the account for this category (merged into Account model)
        const account = await prisma.account.findFirst({
          where: {
            code: cat.code,
            outletId: outlet.id,
          },
        });

        if (account) {
          await prisma.expenseCategory.create({
            data: {
              name: cat.name,
              code: cat.code,
              accountId: account.id,
              outletId: outlet.id,
              isActive: true,
            },
          });
          log(`Expense Category: ${cat.code} - ${cat.name}`);
        }
      }
    }

    logSection("✅ Seeding Completed Successfully");
    console.log("\n📋 Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin User:  admin@admin.com / admin123");
    console.log("Staff User:  arjun@enterprise.com / staff123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    logError("Seeding failed");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
