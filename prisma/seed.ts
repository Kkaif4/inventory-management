import "dotenv/config";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaClient, Role } from "./generated";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seed: Starting...");

  // 1. Create Admin User
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
      },
    });
    console.log("Seed: Admin user created (admin@erp.com / admin123)");
  } else {
    console.log("Seed: Admin user already exists");
  }

  // 2. Create a default Outlet if none exists
  const existingOutlet = await prisma.outlet.findFirst();
  if (!existingOutlet) {
    await prisma.outlet.create({
      data: {
        name: "Main Head Office",
        invoicePrefix: "INV/HQ/",
        gstin: "27ABCDE1234F1Z5",
        bankDetails: "HDFC Bank, AC: 123456789, IFSC: HDFC0001",
      },
    });
    console.log("Seed: Default outlet created");
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
