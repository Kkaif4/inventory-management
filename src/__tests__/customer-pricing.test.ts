import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

vi.mock("@/lib/outlet-auth", () => ({
  requireAdminSession: vi.fn().mockResolvedValue("test-user"),
  validateSessionOutletAccess: vi.fn().mockResolvedValue(undefined),
  getCurrentSessionOutlet: vi.fn().mockImplementation((id: string) => id),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn(() => ({ get: vi.fn() })) }));

import { prisma } from "@/lib/prisma";
import { getProducts } from "@/actions/products/index";

describe("Customer-specific pricing in getProducts", () => {
  let outletId: string;
  let customerId: string;
  let variantId: string;
  let otherVariantId: string;

  beforeAll(async () => {
    const outlet = await prisma.outlet.create({
      data: { name: "PricingTestOutlet", invoicePrefix: "PT", state: "MH" },
    });
    outletId = outlet.id;

    const category = await prisma.category.create({
      data: { name: "TestCat", outletId },
    });

    const ts = Date.now();
    const product = await prisma.product.create({
      data: {
        name: "TestProduct",
        gstRate: 18,
        baseUnit: "PCS",
        categoryId: category.id,
        outletId,
        variants: {
          create: [
            { sku: `TEST-SKU-${ts}`, outletId, sellingPrice: 100, purchasePrice: 60 },
            { sku: `TEST-SKU2-${ts}`, outletId, sellingPrice: 200, purchasePrice: 120 },
          ],
        },
      },
      include: { variants: true },
    });
    variantId = product.variants[0].id;
    otherVariantId = product.variants[1].id;

    const priceList = await prisma.priceList.create({
      data: {
        name: `VIP Prices ${ts}`,
        entries: { create: [{ variantId, price: 80 }] },
      },
    });

    const customer = await prisma.party.create({
      data: {
        type: "CUSTOMER",
        name: "VIP Customer",
        address: "Test",
        state: "MH",
        outletId,
        priceListId: priceList.id,
      },
    });
    customerId = customer.id;
  });

  afterAll(async () => {
    await prisma.priceListEntry.deleteMany({
      where: { variant: { product: { outletId } } },
    });
    await prisma.party.deleteMany({ where: { outletId } });
    await prisma.priceList.deleteMany({
      where: { entries: { some: { variant: { product: { outletId } } } } },
    });
    await prisma.variant.deleteMany({ where: { product: { outletId } } });
    await prisma.product.deleteMany({ where: { outletId } });
    await prisma.category.deleteMany({ where: { outletId } });
    await prisma.outlet.deleteMany({ where: { id: outletId } });
  });

  it("uses customer price list price when partyId is provided and entry exists", async () => {
    const result = await getProducts(outletId, { partyId: customerId });
    expect(result.success).toBe(true);
    const variant = result.data!.flatMap((p: any) => p.variants).find(
      (v: any) => v.id === variantId,
    );
    expect(variant).toBeDefined();
    expect(variant.customerPrice).toBe(80);
  });

  it("leaves customerPrice undefined when variant has no price list entry", async () => {
    const result = await getProducts(outletId, { partyId: customerId });
    expect(result.success).toBe(true);
    const variant = result.data!.flatMap((p: any) => p.variants).find(
      (v: any) => v.id === otherVariantId,
    );
    expect(variant).toBeDefined();
    expect(variant.customerPrice).toBeUndefined();
  });

  it("returns no customerPrice when partyId is not provided (no regression)", async () => {
    const result = await getProducts(outletId, {});
    expect(result.success).toBe(true);
    const variant = result.data!.flatMap((p: any) => p.variants).find(
      (v: any) => v.id === variantId,
    );
    expect(variant).toBeDefined();
    expect(variant.customerPrice).toBeUndefined();
  });
});
