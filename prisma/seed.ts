import "dotenv/config";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Role,
  AccountType,
  NegativeStockPolicy,
  ValuationMethod,
  PaymentMode,
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

// ============================================================================
// Helper Functions
// ============================================================================
const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandom = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

const generateGSTIN = (): string => {
  const stateCode = randomBetween(1, 36).toString().padStart(2, "0");
  const pan = "ABCDE";
  const entity = randomBetween(100, 999);
  const status = "Z";
  const checksum = randomBetween(0, 9);
  return `${stateCode}${pan}${entity}${status}${checksum}`;
};

const generatePAN = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums = "0123456789";
  let pan = "";
  for (let i = 0; i < 5; i++) pan += pickRandom(chars.split(""));
  for (let i = 0; i < 4; i++) pan += pickRandom(nums.split(""));
  pan += pickRandom(chars.split(""));
  return pan;
};

const generatePhone = (): string =>
  "98" + randomBetween(1000000000, 9999999999).toString().slice(-8);

// ============================================================================
// Data Generation Sets
// ============================================================================
const OUTLET_DATA = [
  {
    name: "City Showroom - South",
    prefix: "INV/SS/",
    gstin: "27ABCDE1234F1Z5",
    address: "Plot 45, Industrial Area Phase II, Mumbai",
    state: "Maharashtra",
  },
  {
    name: "Downtown Store - West",
    prefix: "INV/DW/",
    gstin: "27ABCDE1234F1Z6",
    address: "Linking Road, Bandra, Mumbai",
    state: "Maharashtra",
  },
  {
    name: "Metro Hub - East",
    prefix: "INV/ME/",
    gstin: "27ABCDE1234F1Z7",
    address: "Thane Railway Station Area, Mumbai",
    state: "Maharashtra",
  },
];

const WAREHOUSE_NAMES = [
  "Main Distribution Center",
  "Secondary Warehouse",
  "Premium Stock",
  "Bulk Storage",
  "Quick Dispatch Hub",
];

const USER_ROLES = [
  { email: "admin@admin.com", name: "System Administrator", role: Role.ADMIN },
  { email: "manager@enterprise.com", name: "Store Manager", role: Role.INVENTORY_MANAGER },
  { email: "arjun@enterprise.com", name: "Arjun Sales", role: Role.SALES },
  { email: "priya@enterprise.com", name: "Priya Accounts", role: Role.ACCOUNTANT },
  { email: "rajesh@enterprise.com", name: "Rajesh Inventory", role: Role.INVENTORY_MANAGER },
];

const VENDOR_NAMES = [
  "Niharika Suppliers", "Apex Trading Co.", "Prime Imports Ltd.", "Global Logistics",
  "Best Quality Goods", "Express Distributors", "Eco Supplies", "Precision Industries",
  "Value Chain Ltd.", "Direct Import Co.", "Bulk Traders", "Premium Wholesalers",
  "Standard Enterprises", "Star Suppliers", "Union Trading", "Metro Distributors",
  "Alliance Imports", "Integrated Logistics", "Trusted Partners", "Central Supplies",
];

const CUSTOMER_NAMES = [
  "Retail Hardware Traders", "BuildRight Solutions", "Home Pro Stores", "DIY Masters",
  "Construction Hub", "Mega Mart Retail", "Quality Fix Stores", "Modern Hardware",
  "Smart Retailers", "Plus Building Supplies", "Precision Tools Co.", "Master Trade",
  "HomeWorks Ltd.", "BuildCare Systems", "Advance Hardware", "Professional Traders",
  "Eco Build Stores", "Standard Supply Chain", "Unity Enterprises", "Peak Retailers",
];

const PRODUCT_CATEGORIES = [
  { name: "Fasteners", description: "Bolts, nuts, screws, washers" },
  { name: "Tools", description: "Hand tools, power tools, accessories" },
  { name: "Hardware", description: "Hinges, locks, handles, accessories" },
  { name: "Plumbing", description: "Pipes, fittings, valves, fixtures" },
  { name: "Electrical", description: "Wires, switches, breakers, panels" },
  { name: "Safety Equipment", description: "Helmets, gloves, masks, vests" },
  { name: "Paint & Coatings", description: "Paints, varnishes, sealants" },
  { name: "Building Materials", description: "Cement, steel, bricks" },
  { name: "Hand Tools", description: "Hammers, saws, wrenches, screwdrivers" },
  { name: "Power Tools", description: "Drills, grinders, saws" },
];

const PRODUCT_NAMES = [
  // Fasteners
  { category: 0, name: "M8 Hex Bolt", unit: "PCS", price: 2.5 },
  { category: 0, name: "Stainless Steel Nut", unit: "PCS", price: 1.8 },
  { category: 0, name: "Spring Washer", unit: "PCS", price: 0.8 },
  { category: 0, name: "Coach Screw", unit: "PCS", price: 3.5 },
  { category: 0, name: "Eye Bolt", unit: "PCS", price: 4.2 },
  // Tools
  { category: 1, name: "Cordless Drill Kit", unit: "SET", price: 4500 },
  { category: 1, name: "Power Impact Driver", unit: "PCS", price: 3500 },
  { category: 1, name: "Angle Grinder 115mm", unit: "PCS", price: 2800 },
  // Hardware
  { category: 2, name: "Heavy Duty Hinge", unit: "PCS", price: 125 },
  { category: 2, name: "Mortise Lock", unit: "PCS", price: 450 },
  { category: 2, name: "Door Handle Chrome", unit: "PCS", price: 85 },
  // Plumbing
  { category: 3, name: "PVC Pipe 1 inch", unit: "MTR", price: 35 },
  { category: 3, name: "Brass Ball Valve", unit: "PCS", price: 280 },
  { category: 3, name: "Pipe Elbow 90deg", unit: "PCS", price: 15 },
  // Electrical
  { category: 4, name: "Copper Wire 1.5 SQ MM", unit: "MTR", price: 8 },
  { category: 4, name: "MCB 25A", unit: "PCS", price: 120 },
  { category: 4, name: "Electrical Switch", unit: "PCS", price: 45 },
  // Safety
  { category: 5, name: "Safety Helmet Yellow", unit: "PCS", price: 350 },
  { category: 5, name: "Cotton Gloves", unit: "PAIR", price: 35 },
  { category: 5, name: "N95 Mask", unit: "BOX", price: 850 },
  // Paint
  { category: 6, name: "Emulsion Paint 20L", unit: "CAN", price: 1200 },
  { category: 6, name: "Wood Varnish 5L", unit: "CAN", price: 580 },
  // Building Materials
  { category: 7, name: "Cement 50kg", unit: "BAG", price: 380 },
  { category: 7, name: "Steel Rod 12mm", unit: "MTR", price: 55 },
  // Hand Tools
  { category: 8, name: "Hammer 500g", unit: "PCS", price: 185 },
  { category: 8, name: "Adjustable Wrench", unit: "PCS", price: 420 },
  { category: 8, name: "Screwdriver Set", unit: "SET", price: 280 },
  // Power Tools
  { category: 9, name: "Electric Drill 500W", unit: "PCS", price: 1800 },
  { category: 9, name: "Bench Grinder", unit: "PCS", price: 4200 },
];

async function main() {
  try {
    logSection("🌱 SEED: Starting Database Seeding");
    console.log(
      `Database URL: ${process.env.DATABASE_URL?.substring(0, 30)}...`,
    );

    // Create/retrieve outlets
    const outlets: Awaited<ReturnType<typeof prisma.outlet.create>>[] = [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const financialYear =
      month >= 3
        ? `${year}-${(year + 1).toString().slice(-2)}`
        : `${year - 1}-${year.toString().slice(-2)}`;

    const documentTypes = [
      { type: "SALES_INVOICE", prefix: "INV" },
      { type: "CASH_MEMO", prefix: "CM" },
      { type: "OLD_BILL", prefix: "OLD" },
      { type: "EXPENSE", prefix: "EXP" },
    ];

    for (const outletData of OUTLET_DATA) {
      let outlet = await prisma.outlet.findFirst({
        where: { name: outletData.name },
      });

      if (!outlet) {
        outlet = await prisma.outlet.create({
          data: {
            name: outletData.name,
            invoicePrefix: outletData.prefix,
            gstin: outletData.gstin,
            bankDetails: "HDFC Bank, AC: 987654321, IFSC: HDFC0001",
            negativeStockPolicy: pickRandom([NegativeStockPolicy.WARN, NegativeStockPolicy.ALLOW]),
            allowRawCashBills: true,
            address: outletData.address,
            state: outletData.state,
            invoiceStartingNumber: 1,
            batchTrackingEnabled: true,
            inventoryValuationMethod: pickRandom([ValuationMethod.NONE, ValuationMethod.FIFO]),
          },
        });
        log(`Created outlet: ${outletData.name}`);
      } else {
        log(`Outlet exists: ${outletData.name}`);
      }

      outlets.push(outlet);

      // Ensure DocumentSeries
      for (const doc of documentTypes) {
        await prisma.documentSeries.upsert({
          where: {
            type_financialYear_outletId: {
              type: doc.type,
              financialYear,
              outletId: outlet.id,
            },
          },
          update: {},
          create: {
            type: doc.type,
            prefix: doc.prefix,
            financialYear,
            outletId: outlet.id,
            nextNumber: 1,
          },
        });
      }
    }

    // Create warehouses for each outlet
    for (const outlet of outlets) {
      for (let i = 0; i < randomBetween(2, 3); i++) {
        const warehouseName = `${outlet.name} - ${WAREHOUSE_NAMES[i]}`;
        const existing = await prisma.warehouse.findFirst({
          where: { name: warehouseName, outletId: outlet.id },
        });

        if (!existing) {
          await prisma.warehouse.create({
            data: {
              name: warehouseName,
              address: outlet.address,
              state: outlet.state,
              contactName: `Manager ${i}`,
              contactPhone: generatePhone(),
              outletId: outlet.id,
              isDefault: i === 0,
            },
          });
          log(`Created warehouse: ${warehouseName}`);
        }
      }
    }

    logSection("👥 Users");

    // Create users linked to all outlets
    for (const userRole of USER_ROLES) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userRole.email },
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash("password123", 10);
        await prisma.user.create({
          data: {
            email: userRole.email,
            name: userRole.name,
            role: userRole.role,
            password: hashedPassword,
            isActive: true,
            outlets: {
              connect: outlets.map((o) => ({ id: o.id })),
            },
          },
        });
        log(`Created user: ${userRole.email} (${userRole.role})`);
      } else {
        // Ensure user is linked to all outlets
        await prisma.user.update({
          where: { email: userRole.email },
          data: {
            outlets: {
              connect: outlets.map((o) => ({ id: o.id })),
            },
          },
        });
        log(`User exists: ${userRole.email}`);
      }
    }

    logSection("🤝 Parties (Vendors & Customers)");

    // Create vendors for each outlet
    for (const outlet of outlets) {
      let created = 0;

      for (const vendorName of VENDOR_NAMES) {
        const existing = await prisma.party.findFirst({
          where: { name: vendorName, type: "VENDOR", outletId: outlet.id },
        });

        if (!existing) {
          await prisma.party.create({
            data: {
              type: "VENDOR",
              name: vendorName,
              gstin: generateGSTIN(),
              pan: generatePAN(),
              address: `Industrial Estate, ${outlet.state ?? "Maharashtra"}`,
              state: outlet.state ?? "Maharashtra",
              contactInfo: `contact@${vendorName.toLowerCase().replace(/\s+/g, "")}.com`,
              phone: generatePhone(),
              email: `sales@${vendorName.toLowerCase().replace(/\s+/g, "")}.com`,
              bankName: "State Bank of India",
              bankAccountName: `${vendorName} Account`,
              bankAccountNumber: randomBetween(1000000000000, 9999999999999).toString(),
              bankIfsc: "SBIN0001234",
              openingBalance: randomBetween(0, 100000),
              outletId: outlet.id,
            },
          });
          created++;
        }
      }

      log(`${outlet.name}: ${created} vendors created/updated`);

      // Create customers for each outlet
      let customerCreated = 0;
      for (const customerName of CUSTOMER_NAMES) {
        const existing = await prisma.party.findFirst({
          where: { name: customerName, type: "CUSTOMER", outletId: outlet.id },
        });

        if (!existing) {
          await prisma.party.create({
            data: {
              type: "CUSTOMER",
              name: customerName,
              address: `Market Area, ${outlet.state ?? "Maharashtra"}`,
              state: outlet.state ?? "Maharashtra",
              contactInfo: `contact@${customerName.toLowerCase().replace(/\s+/g, "")}.com`,
              phone: generatePhone(),
              email: `info@${customerName.toLowerCase().replace(/\s+/g, "")}.com`,
              openingBalance: randomBetween(0, 50000),
              outletId: outlet.id,
            },
          });
          customerCreated++;
        }
      }

      log(`${outlet.name}: ${customerCreated} customers created/updated`);
    }

    logSection("💰 Accounts (Cash & Bank)");

    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@admin.com" },
    });

    // Create accounts for each outlet
    for (const outlet of outlets) {
      const cashAccount = await prisma.account.upsert({
        where: { name_outletId: { name: "Main Cash", outletId: outlet.id } },
        update: {},
        create: {
          name: "Main Cash",
          type: AccountType.CASH,
          group: "ASSET",
          isSystem: false,
          openingBalance: randomBetween(5000, 20000),
          currentBalance: randomBetween(5000, 20000),
          outletId: outlet.id,
        },
      });

      const bankNames = ["HDFC Current", "ICICI Savings", "Axis Bank"];
      for (const bankName of bankNames) {
        await prisma.account.upsert({
          where: { name_outletId: { name: bankName, outletId: outlet.id } },
          update: {},
          create: {
            name: bankName,
            type: AccountType.BANK,
            group: "ASSET",
            isSystem: false,
            openingBalance: randomBetween(25000, 100000),
            currentBalance: randomBetween(25000, 100000),
            outletId: outlet.id,
          },
        });
      }

      // Sample transactions
      if (adminUser) {
        await prisma.accountTransaction.create({
          data: {
            accountId: cashAccount.id,
            type: "IN",
            amount: randomBetween(2000, 10000),
            paymentMode: PaymentMode.CASH,
            balanceAfter: cashAccount.currentBalance + randomBetween(2000, 10000),
            remarks: "Opening cash deposit",
            userId: adminUser.id,
          },
        });
      }

      log(`${outlet.name}: 4 accounts created (1 cash, 3 bank)`);
    }

    logSection("📦 Products & Categories");

    // Create products and categories for each outlet
    let totalProducts = 0;
    let skuCounter = 1000;
    for (const outlet of outlets) {
      const categoryMap = new Map<number, string>();

      // Create categories per outlet
      for (let i = 0; i < PRODUCT_CATEGORIES.length; i++) {
        const cat = PRODUCT_CATEGORIES[i];
        const existing = await prisma.category.findFirst({
          where: {
            name: cat.name,
            outletId: outlet.id,
            parentId: null,
          },
        });

        if (!existing) {
          const created = await prisma.category.create({
            data: {
              name: cat.name,
              description: cat.description,
              isActive: true,
              outletId: outlet.id,
            },
          });
          categoryMap.set(i, created.id);
        } else {
          categoryMap.set(i, existing.id);
        }
      }

      // Create products per outlet
      let outletProductCount = 0;
      for (const productData of PRODUCT_NAMES) {
        const categoryId = categoryMap.get(productData.category);
        if (!categoryId) continue;

        const productName = productData.name;
        const existing = await prisma.product.findFirst({
          where: {
            name: productName,
            outletId: outlet.id,
          },
        });

        if (!existing) {
          const product = await prisma.product.create({
            data: {
              name: productName,
              brand: "Generic",
              hsnCode: `${100 + outletProductCount}`.padStart(4, "0"),
              gstRate: 18,
              baseUnit: productData.unit,
              categoryId,
              outletId: outlet.id,
            },
          });

          // Create variant for product
          await prisma.variant.create({
            data: {
              productId: product.id,
              sku: `SKU-${(skuCounter++).toString().padStart(6, "0")}`,
              purchasePrice: productData.price * 0.7,
              sellingPrice: productData.price,
              minStockLevel: randomBetween(5, 20),
            },
          });

          outletProductCount++;
          totalProducts++;
        }
      }

      log(`${outlet.name}: Created ${outletProductCount} products`);
    }
    log(`Total: ${totalProducts} products created across all outlets`);

    logSection("💳 Expense Categories");

    // Global expense categories
    const expenseCategories = [
      { name: "Rent", description: "Rent and lease payments", code: "EXP-001" },
      { name: "Salaries & Wages", description: "Employee salaries and wages", code: "EXP-002" },
      { name: "Utilities", description: "Electricity, water, and other utilities", code: "EXP-003" },
      { name: "Fuel & Transportation", description: "Fuel, vehicle maintenance, and transport costs", code: "EXP-004" },
      { name: "Office Supplies", description: "Office supplies and consumables", code: "EXP-005" },
      { name: "Marketing & Advertising", description: "Marketing, advertising, and promotional expenses", code: "EXP-006" },
      { name: "Repairs & Maintenance", description: "Building and equipment repairs", code: "EXP-007" },
      { name: "Professional Services", description: "Accounting, legal, and consulting fees", code: "EXP-008" },
      { name: "Insurance", description: "Business insurance premiums", code: "EXP-009" },
      { name: "Miscellaneous", description: "Other miscellaneous expenses", code: "EXP-010" },
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

    logSection("📊 Sample Stock Levels");

    // Create sample stock entries for products
    for (const outlet of outlets) {
      const warehouses = await prisma.warehouse.findMany({
        where: { outletId: outlet.id },
      });

      const products = await prisma.product.findMany({
        where: { outletId: outlet.id },
        include: { variants: true },
      });

      for (const product of products) {
        for (const variant of product.variants) {
          for (const warehouse of warehouses.slice(0, 1)) {
            // Add stock to first warehouse
            const stockQty = randomBetween(50, 500);
            await prisma.stock.upsert({
              where: {
                variantId_warehouseId_outletId: {
                  variantId: variant.id,
                  warehouseId: warehouse.id,
                  outletId: outlet.id,
                },
              },
              update: { quantity: stockQty },
              create: {
                variantId: variant.id,
                warehouseId: warehouse.id,
                outletId: outlet.id,
                quantity: stockQty,
              },
            });
          }
        }
      }

      log(`${outlet.name}: Stock levels initialized`);
    }

    logSection("✅ Seeding Completed Successfully");
    console.log("\n📋 Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Admin:        admin@admin.com / password123");
    console.log("👤 Manager:      manager@enterprise.com / password123");
    console.log("🛒 Sales:        arjun@enterprise.com / password123");
    console.log("📊 Accountant:   priya@enterprise.com / password123");
    console.log("📦 Inventory:    rajesh@enterprise.com / password123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log(`✅ Created ${outlets.length} outlets with:`);
    console.log(`   • ${outlets.length * 2}-${outlets.length * 3} warehouses total`);
    console.log(`   • ${VENDOR_NAMES.length * outlets.length} vendors`);
    console.log(`   • ${CUSTOMER_NAMES.length * outlets.length} customers`);
    console.log(`   • ${totalProducts} products across all outlets`);
    console.log(`   • Sample inventory, accounts & transactions\n`);
  } catch (error) {
    logError("Seeding failed");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
