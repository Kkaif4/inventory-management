import "dotenv/config";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { initializeCOA } from "../src/domains/accounting/ledger-service";
import { PrismaClient, Role } from "@/generated/prisma";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seed: Starting...");

  // 1. Create Warehouse
  const warehouseName = "Main Distribution Center";
  let warehouse = await prisma.warehouse.findFirst({
    where: { name: warehouseName },
  });

  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: {
        name: warehouseName,
        address: "Plot 45, Industrial Area Phase II, Mumbai",
      },
    });
    console.log("Seed: Warehouse created");
  }

  // 2. Create Outlet linked to Warehouse
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
        warehouses: {
          connect: [{ id: warehouse.id }],
        },
      },
    });
    console.log("Seed: Outlet created and linked to Warehouse");
  }

  // 2.5 Initialize Chart of Accounts (COA) for this outlet
  console.log("Seed: Initializing CoA for outlet...");
  await initializeCOA(outlet.id);
  console.log("Seed: CoA Initialized");

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
