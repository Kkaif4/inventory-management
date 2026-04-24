# FRD — Batch Tracking with Unit Conversion & Selling Price
**Inventory Module — Batch Pricing Flow**
Version 1.0

---

## 1. What This Solves

When a product is purchased in a different unit than it is sold (e.g. bought by the Box, sold by the Piece), the cost per sellable unit must be calculated at the time of purchase receipt. This calculated base-unit cost is stored on the batch and drives the selling price for every sale that consumes from that batch.

---

## 2. Core Concept

```
Purchase Unit  =  Box
Base Unit      =  Piece
Conversion     =  1 Box = 10 Pieces

Purchase price on bill  =  ₹100 per Box
Base unit cost          =  ₹100 ÷ 10 = ₹10 per Piece

Batch stores:
  costPerBaseUnit = ₹10

Selling price calculation from this batch:
  If pricingMethod = MARKUP (20%):  ₹10 × 1.20 = ₹12 per Piece
  If pricingMethod = MANUAL:        User's set price per Piece
```

The batch becomes the source of truth for cost. Every sale that draws from this batch uses this cost for COGS accounting.

---

## 3. Data Flow — End to End

```
Purchase Bill Created
        │
        ▼
GRN Saved (goods physically received)
        │
        ▼
For each line item in the GRN:
  costPerPurchaseUnit = bill line rate
  costPerBaseUnit     = costPerPurchaseUnit ÷ conversionRatio

  Create Batch:
    batchNumber        = auto-generated
    variantId          = this variant
    warehouseId        = receiving warehouse
    qtyReceived        = GRN qty × conversionRatio  (stored in base units)
    qtyRemaining       = same
    costPerBaseUnit    = calculated above
    purchasePrice      = original bill rate (per purchase unit — stored for reference)
    sellingPricePerBaseUnit = calculated from costPerBaseUnit + pricing method
        │
        ▼
Sales Invoice Created
        │
        ▼
FIFO: oldest batch selected first
  For each unit sold:
    Use batch.sellingPricePerBaseUnit as the rate
    Record COGS at batch.costPerBaseUnit
```

---

## 4. Batch Record — Fields

```prisma
model CustomBatch {
  id                      String    @id @default(cuid())
  batchNumber             String    @unique
  variantId               String
  warehouseId             String
  outletId                String
  grnId                   String?                  // source GRN
  purchaseBillId          String?                  // source bill

  // Purchase side
  receivedDate            DateTime
  qtyReceived             Float                    // in BASE units always
  qtyRemaining            Float                    // in BASE units always
  purchaseUnitRate        Float                    // ₹100 per Box (original bill rate)
  costPerBaseUnit         Float                    // ₹10 per Piece (calculated)

  // Selling side
  pricingMethod           String                   // MARKUP or MANUAL
  markupPercent           Float?                   // if MARKUP
  sellingPricePerBaseUnit Float                    // ₹12 per Piece (calculated or set)

  status                  String    @default("ACTIVE")  // ACTIVE / EXHAUSTED
  createdAt               DateTime  @default(now())

  variant                 Variant   @relation(...)
  warehouse               Warehouse @relation(...)
  outlet                  Outlet    @relation(...)
}
```

---

## 5. Selling Price Calculation at Batch Creation

This runs at GRN save time, inside the same transaction.

```ts
function calculateBatchSellingPrice(
  purchaseUnitRate: number,
  conversionRatio: number,
  pricingMethod: "MARKUP" | "MANUAL",
  markupPercent: number | null,
  manualSellingPrice: number | null,   // variant's current manual price if set
): { costPerBaseUnit: number; sellingPricePerBaseUnit: number } {

  // Step 1: Cost per base unit
  const costPerBaseUnit = purchaseUnitRate / conversionRatio
  // Example: ₹100 / 10 = ₹10 per Piece

  // Step 2: Selling price per base unit
  let sellingPricePerBaseUnit: number

  if (pricingMethod === "MARKUP" && markupPercent !== null) {
    sellingPricePerBaseUnit = costPerBaseUnit * (1 + markupPercent / 100)
    // Example: ₹10 × 1.20 = ₹12 per Piece
  } else {
    // MANUAL: use the variant's current selling price
    // This is per BASE unit already (selling always in base unit)
    sellingPricePerBaseUnit = manualSellingPrice ?? costPerBaseUnit
  }

  return { costPerBaseUnit, sellingPricePerBaseUnit }
}
```

---

## 6. Multiple Items in One GRN / Bill

A single GRN or Purchase Bill can have multiple line items — each with a different product, different purchase unit, different conversion ratio, different rate. Each line item creates its own batch independently.

```
GRN-001:
  Line 1: Wrench    — 5 Box × ₹100/Box  → Batch WRN-20260206-001
  Line 2: Drill Bit — 3 Box × ₹200/Box  → Batch DRL-20260206-001
  Line 3: Hammer    — 20 Nos × ₹50/Nos  → Batch HMR-20260206-001
```

Each batch is a separate record. They share the same `grnId` and `purchaseBillId` for traceability but they are otherwise independent. Stock for each variant is tracked separately.

**Processing loop:**

```ts
for (const line of grnLines) {
  const variant = await getVariant(line.variantId)
  const conversionRatio = variant.conversionRatio ?? 1

  const { costPerBaseUnit, sellingPricePerBaseUnit } =
    calculateBatchSellingPrice(
      line.ratePerPurchaseUnit,
      conversionRatio,
      variant.pricingMethod,
      variant.markupPercent,
      variant.sellingPrice
    )

  await createBatch({
    batchNumber:             generateBatchNumber(variant.sku, grn.receivedDate),
    variantId:               line.variantId,
    warehouseId:             grn.warehouseId,
    outletId:                grn.outletId,
    grnId:                   grn.id,
    purchaseBillId:          bill.id,
    receivedDate:            grn.receivedDate,
    qtyReceived:             line.qtyReceived * conversionRatio,  // base units
    qtyRemaining:            line.qtyReceived * conversionRatio,
    purchaseUnitRate:        line.ratePerPurchaseUnit,
    costPerBaseUnit,
    pricingMethod:           variant.pricingMethod,
    markupPercent:           variant.markupPercent,
    sellingPricePerBaseUnit,
  })
}
```

---

## 7. Same Variant, Different Batches, Different Costs

This is the FIFO scenario. Two batches of the same wrench at different costs:

```
BATCH-001  received 01 Jan   cost ₹10/Piece   selling ₹12/Piece   remaining: 50
BATCH-002  received 15 Jan   cost ₹15/Piece   selling ₹18/Piece   remaining: 80
```

When a sales invoice is created for 60 Wrenches:

```
FIFO consumption:
  Take 50 from BATCH-001 at ₹12/Piece  →  ₹600
  Take 10 from BATCH-002 at ₹18/Piece  →  ₹180

Invoice line shows:
  Product: Wrench    Qty: 60 Pcs
  Rate: auto-filled from FIFO batch = ₹12/Piece (oldest batch rate)

  Since the order spans two batches:
  The rate shown is BATCH-001's rate (first batch consumed).
  The remaining 10 Pcs are billed at ₹18 internally for COGS.

  On the invoice to the customer:
  → One line, one rate (the oldest batch rate) OR
  → One line, blended rate (total value ÷ qty)
  → This is a display decision — see Section 10
```

COGS journal entries are created per batch consumed (one entry per batch, not one entry per invoice line). This is the correct accounting behaviour.

---

## 8. Sales Invoice — How Selling Price Is Used

When a user adds a product to a sales invoice:

```
1. System fetches FIFO batch for this variant at the outlet's warehouse
   (oldest batch with remaining qty > 0)

2. Auto-fills the Rate field with:
   batch.sellingPricePerBaseUnit

3. User sees the rate field pre-filled
   (editable if user has price override permission)

4. User enters qty (in Sales Unit — same as Base Unit in this system)

5. On Post:
   FIFO consumption runs
   COGS entry: Dr COGS, Cr Inventory at batch.costPerBaseUnit per unit consumed
```

**When stock spans multiple batches on a single invoice line:**

The rate auto-filled is always the **oldest available batch rate**. If the user accepts this rate and the sale spans into a newer batch with a different cost, the COGS will be split at the actual batch costs but the invoice shows one rate. This is standard practice.

---

## 9. Variant Selling Price Update Behaviour

When a new batch is created with a higher or lower cost:

**MARKUP pricing:**
The batch's `sellingPricePerBaseUnit` is calculated fresh at GRN time using the new cost. The variant's selling price on the master record is also updated to reflect the latest batch's selling price. This way the next invoice auto-fills with the new price.

```ts
// After creating the new batch, update the variant master:
await prisma.variant.update({
  where: { id: variantId },
  data: {
    sellingPrice: newBatch.sellingPricePerBaseUnit,  // update master
    // purchasePrice also updated to reflect latest cost
    purchasePrice: line.ratePerPurchaseUnit,
  }
})

// Show notification to user:
// "Selling price for Wrench updated from ₹12 to ₹18 based on new purchase cost."
```

**MANUAL pricing:**
The batch stores the variant's current manual selling price at the time of GRN. The variant master is NOT automatically updated — the user set the price manually and that decision is respected. The batch's `sellingPricePerBaseUnit` = variant's current `sellingPrice` at GRN time.

---

## 10. Invoice Display — Rate on Multi-Batch Consumption

Two options. Pick one before building:

**Option A — Oldest batch rate (recommended)**
Invoice shows the oldest batch's selling price as the rate. Simple, predictable. User knows what to expect. COGS is split internally per batch but the customer sees one clean rate.

```
Wrench    60 Pcs    ₹12.00    ₹720.00
```

**Option B — Blended rate**
Invoice shows `total value ÷ qty`. This changes per invoice depending on how many batches are consumed.

```
Wrench    60 Pcs    ₹12.50    ₹750.00
(50 × ₹12 + 10 × ₹18 = ₹750 ÷ 60 = ₹12.50)
```

**Recommendation: Option A.** Blended rates confuse customers and make re-billing difficult. Option A is how most businesses handle this in practice. Document this as a fixed behaviour.

---

## 11. Batch Number Generation

```ts
function generateBatchNumber(
  sku: string,
  receivedDate: Date,
  sequence: number
): string {
  const datePart = [
    receivedDate.getFullYear(),
    String(receivedDate.getMonth() + 1).padStart(2, "0"),
    String(receivedDate.getDate()).padStart(2, "0"),
  ].join("")

  return `${sku}-${datePart}-${String(sequence).padStart(3, "0")}`
  // Example: TAP-WRN-10-20260206-001
}
```

Sequence is per SKU + date within the import/GRN session. Same SKU received twice on the same day → `TAP-WRN-10-20260206-001` and `TAP-WRN-10-20260206-002`.

---

## 12. COGS Accounting Entries on Sale

For each batch consumed on a sales invoice:

```
Batch BATCH-001 consumed 50 Pcs @ ₹10 cost:
  Dr  Cost of Goods Sold       ₹500
  Cr  Inventory — BATCH-001    ₹500

Batch BATCH-002 consumed 10 Pcs @ ₹15 cost:
  Dr  Cost of Goods Sold       ₹150
  Cr  Inventory — BATCH-002    ₹150
```

One journal entry pair per batch consumed. If a single invoice line draws from 3 batches, 3 COGS entries are created. This gives exact cost tracing per batch.

---

## 13. Edge Cases

### 13.1 Conversion ratio = 1 (purchase unit = base unit)

No conversion needed. `costPerBaseUnit = purchaseUnitRate`. Batch creation proceeds as normal.

### 13.2 First purchase (no existing batch)

No FIFO to run. New batch is created. Variant selling price updated if MARKUP. Invoice auto-fills with the new batch's selling price.

### 13.3 Partial batch on sale

Batch `qtyRemaining` is reduced by the qty consumed. If `qtyRemaining` hits zero, batch status → `EXHAUSTED`. Next sale moves to the next oldest batch automatically.

### 13.4 Batch tracking is OFF for the outlet

This entire flow does not run. Selling price comes from variant master record only. No batch records are created. COGS uses moving average cost.

### 13.5 GRN with no linked purchase bill yet

Batch is still created at GRN time using the GRN's recorded rate. When the purchase bill is linked later, `purchaseBillId` is updated on the batch. The cost is not changed — it was locked at GRN time.

### 13.6 Purchase bill rate differs from GRN rate

This happens when the vendor bills at a different price than the PO. The batch cost uses the **purchase bill rate**, not the PO rate. If the bill is created after the GRN, the batch cost is updated to match the bill rate when the bill is posted. Selling price recalculates accordingly.

```ts
// When purchase bill is posted and rate differs from GRN:
if (billLineRate !== batch.purchaseUnitRate) {
  const newCostPerBaseUnit = billLineRate / conversionRatio
  const newSellingPrice = pricingMethod === "MARKUP"
    ? newCostPerBaseUnit * (1 + markupPercent / 100)
    : batch.sellingPricePerBaseUnit  // manual: unchanged

  await prisma.customBatch.update({
    where: { id: batch.id },
    data: {
      purchaseUnitRate: billLineRate,
      costPerBaseUnit: newCostPerBaseUnit,
      sellingPricePerBaseUnit: newSellingPrice,
    }
  })
}
```

---

## 14. Summary of What Changes in Existing Modules

| Module | What changes |
|---|---|
| GRN Save | After saving GRN lines, create one batch per line item with calculated costs |
| Purchase Bill Post | If bill rate ≠ GRN rate, update batch costs |
| Sales Invoice — line item | Auto-fill rate from FIFO batch's `sellingPricePerBaseUnit` |
| Sales Invoice — Post | FIFO consumption creates COGS entries per batch consumed |
| Variant Master | On MARKUP batch creation: update `sellingPrice` to new batch's selling price. Show notification. |
| Stock Ledger | Each movement tagged with `batchId` |
| Batch Ledger (M03-S07) | Shows `costPerBaseUnit`, `sellingPricePerBaseUnit`, `purchaseUnitRate` per batch |
