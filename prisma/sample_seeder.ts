import "dotenv/config";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@/generated/prisma";
import { NegativeStockPolicy, ValuationMethod } from "@/generated/prisma/index";

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
    logSection("🌱 SEED (MINIMAL): Starting Database Seeding");
    console.log(
      `Database URL: ${process.env.DATABASE_URL?.substring(0, 30)}...`,
    );

    // ========================================================================
    // Global Expense Categories
    // ========================================================================
    logSection("💳 Expense Categories (Global)");

    const expenseCategories = [
      { name: "Rent", description: "Rent and lease payments", code: "EXP-001" },
      {
        name: "Salaries & Wages",
        description: "Employee salaries and wages",
        code: "EXP-002",
      },
      {
        name: "Utilities",
        description: "Electricity, water, and other utilities",
        code: "EXP-003",
      },
      {
        name: "Fuel & Transportation",
        description: "Fuel, vehicle maintenance, and transport costs",
        code: "EXP-004",
      },
      {
        name: "Office Supplies",
        description: "Office supplies and consumables",
        code: "EXP-005",
      },
      {
        name: "Marketing & Advertising",
        description: "Marketing, advertising, and promotional expenses",
        code: "EXP-006",
      },
      {
        name: "Repairs & Maintenance",
        description: "Building and equipment repairs",
        code: "EXP-007",
      },
      {
        name: "Professional Services",
        description: "Accounting, legal, and consulting fees",
        code: "EXP-008",
      },
      {
        name: "Insurance",
        description: "Business insurance premiums",
        code: "EXP-009",
      },
      {
        name: "Miscellaneous",
        description: "Other miscellaneous expenses",
        code: "EXP-010",
      },
    ];

    let expCount = 0;
    for (const cat of expenseCategories) {
      const existing = await prisma.expenseCategory.findUnique({
        where: { name: cat.name },
      });

      if (!existing) {
        await prisma.expenseCategory.create({
          data: {
            name: cat.name,
            description: cat.description,
            code: cat.code,
            isActive: true,
          },
        });
        expCount++;
      }
    }
    log(`Created ${expCount} expense categories`);

    // ========================================================================
    // Outlets & Document Series
    // ========================================================================
    logSection("🏪 Outlets");

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const financialYear =
      month >= 3
        ? `${year}-${(year + 1).toString().slice(-2)}`
        : `${year - 1}-${year.toString().slice(-2)}`;

    const outletData = [
      {
        name: "Main Outlet",
        invoicePrefix: "INV/",
        address: "Madhya Pradesh, India",
        state: "Madhya Pradesh",
      },
      {
        name: "Secondary Outlet",
        invoicePrefix: "SEC/",
        address: "Mumbai, India",
        state: "Maharashtra",
      },
    ];

    const outlets: Array<{ id: string; name: string }> = [];

    for (const data of outletData) {
      let outlet = await prisma.outlet.findFirst({
        where: { name: data.name },
      });

      if (!outlet) {
        outlet = await prisma.outlet.create({
          data: {
            name: data.name,
            invoicePrefix: data.invoicePrefix,
            address: data.address,
            state: data.state,
            negativeStockPolicy: NegativeStockPolicy.WARN,
            allowRawCashBills: true,
            invoiceStartingNumber: 1,
            batchTrackingEnabled: true,
            inventoryValuationMethod: ValuationMethod.NONE,
          },
        });
        log(`Created outlet: ${data.name}`);
      } else {
        log(`Outlet exists: ${data.name}`);
      }

      outlets.push({ id: outlet.id, name: outlet.name });
    }

    // Create DocumentSeries for each outlet
    logSection("📄 Document Series");

    const documentTypes = [
      { type: "SALES_INVOICE", prefix: "INV" },
      { type: "CASH_MEMO", prefix: "CM" },
      { type: "OLD_BILL", prefix: "OLD" },
      { type: "EXPENSE", prefix: "EXP" },
    ];

    for (const outlet of outlets) {
      for (const doc of documentTypes) {
        const existing = await prisma.documentSeries.findUnique({
          where: {
            type_financialYear_outletId: {
              type: doc.type,
              financialYear,
              outletId: outlet.id,
            },
          },
        });

        if (!existing) {
          await prisma.documentSeries.create({
            data: {
              type: doc.type,
              prefix: doc.prefix,
              financialYear,
              outletId: outlet.id,
              nextNumber: 1,
            },
          });
          log(`Created DocumentSeries: ${doc.type} for ${outlet.name}`);
        } else {
          log(`DocumentSeries exists: ${doc.type} for ${outlet.name}`);
        }
      }
    }

    // ========================================================================
    // Admin User
    // ========================================================================
    logSection("👥 Admin User");

    const adminEmail = "kartik@admin.com";
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("[EMAIL_ADDRESS]", 10);
      await prisma.user.create({
        data: {
          email: adminEmail,
          name: "System Administrator",
          role: Role.ADMIN,
          password: hashedPassword,
          isActive: true,
          outlets: {
            connect: outlets.map((o) => ({ id: o.id })),
          },
        },
      });
      log(
        `Created admin user: ${adminEmail} (connected to ${outlets.length} outlets)`,
      );
    } else {
      // Ensure admin is connected to all outlets
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          outlets: {
            connect: outlets.map((o) => ({ id: o.id })),
          },
        },
      });
      log(
        `Admin user exists: ${adminEmail} (connected to ${outlets.length} outlets)`,
      );
    }

    logSection("✅ Seeding Completed Successfully");
    console.log("\n📋 Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Admin:        kartik@admin.com / password123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    logError("Seeding failed");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
