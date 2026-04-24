# Batch Pricing & Selling Price Fixes - Root Cause Analysis & Implementation Plan

**Date:** 2026-04-20  
**Status:** Phase 1 & 2 Complete - Ready for Phase 3 (Hypothesis Testing)

---

## Executive Summary

Three distinct bugs found in batch creation and pricing system:

1. **purchaseBillId NULL after bill creation** — Wrong WHERE clause when linking batches
2. **sellingPricePerBaseUnit not used in invoices** — Calculated but not retrieved for sales
3. **Multiple POs same item fail** — Duplicate batchNumber due to hardcoded sequence=1

---

## Phase 1: Root Cause Investigation

### Bug #1: purchaseBillId Shows NULL After createPurchaseBill

**Evidence Chain:**

1. When user clicks "Accept Order" → `acceptPurchaseOrder()` called
   - **File:** `src/actions/procurement/index.ts:643-764`
   - **Line 701-714:** Calls `StockService.moveStock()` with batch pricing fields
   - **Does NOT pass:** `purchaseBillId` parameter
   - **Result:** Batches created with `purchaseBillId: undefined`

2. When user creates bill → `createPurchaseBill()` called
   - **File:** `src/actions/procurement/index.ts:334-541`
   - **Line 471-481:** Attempts to link batches to bill
   - **Query WHERE clause (line 473-476):**
     ```typescript
     where: {
       variantId: { in: variantIds },
       outletId: source.outletId,
       grnId: source.type === "GRN" ? source.id : null,  // 🔴 PROBLEM
     }
     ```
   - **Problem:** When `source.type === "PURCHASE_ORDER"`, `grnId` is set to `null`
   - **Reality:** Batches created by acceptPurchaseOrder have `grnId = undefined` (not `null`)
   - **Result:** WHERE clause doesn't match. Batches not linked.

**Root Cause:** `createPurchaseBill` assumes GRN is always the source. It doesn't handle PURCHASE_ORDER sources where batches were created directly.

---

### Bug #2: sellingPricePerBaseUnit Calculated But Not Used

**Evidence Chain:**

1. **Calculation happens correctly:**
   - **File:** `src/domains/inventory/batch-pricing.ts:24-56`
   - `calculateBatchPricing()` correctly computes:
     - Example: purchaseRate=100, ratio=10, markup=20% → sellingPrice=12 ✓

2. **Stored in CustomBatch:**
   - **File:** `src/domains/inventory/stock-service.ts:145-164`
   - When batch created: `sellingPricePerBaseUnit` field IS populated ✓

3. **Updated in variant master:**
   - **File:** `src/actions/procurement/index.ts:717-728`
   - Updates `variant.sellingPrice` to batch's calculated price ✓

4. **NOT retrieved when creating sales:**
   - **File:** Sales/invoice form (needs investigation)
   - **Issue:** When creating invoice, system uses variant.sellingPrice OR peekFIFOAllocation
   - **Missing:** No code reads batch.sellingPricePerBaseUnit for the oldest batch
   - **Result:** If variant.sellingPrice wasn't updated, invoice uses wrong price

**Root Cause:** Invoice creation doesn't use `peekFIFOAllocation().oldestBatchSellingPrice` to auto-fill pricing. Falls back to stale variant.sellingPrice.

---

### Bug #3: Multiple POs Same Item Fail to Accept

**Evidence Chain:**

1. **Batch number generation:**
   - **File:** `src/domains/inventory/batch-pricing.ts:67-79`
   - Format: `{SKU}-{YYYYMMDD}-{sequence}`
   - Example: `PROD123-20260420-001`

2. **Where sequence is generated:**
   - **File:** `src/domains/inventory/stock-service.ts:142-143`
   - **Hardcoded:** `generateBatchNumber(variantId.slice(-8), input.batchDate || new Date(), 1)`
   - **Sequence value:** Always `1` 🔴

3. **Database constraint:**
   - **File:** `prisma/schema.prisma` CustomBatch model
   - **batchNumber:** `@unique` constraint
   - **Result:** Cannot create 2 batches with same number

4. **Scenario triggering bug:**
   - Create PO #1 for Product A (qty=1 box) on 2026-04-20
   - Create PO #2 for Product A (qty=1 box) on 2026-04-20
   - Accept PO #1: Creates batch `AAAAA-20260420-001` ✓
   - Accept PO #2: Tries to create batch `AAAAA-20260420-001` → **UNIQUE CONSTRAINT VIOLATION** ✗

**Root Cause:** `generateBatchNumber()` always uses `sequence=1`. Need to query existing batches for same SKU/date and increment sequence.

---

## Phase 2: Pattern Analysis

### Comparison: Working vs Broken

| Aspect | CreateGRN | CreateGRN | AcceptPO | createPurchaseBill |
|--------|-----------|-----------|----------|-------------------|
| **Creates Stock** | ✓ | ✓ | ✓ | ✗ |
| **Creates CustomBatch** | ✓ | ✓ | ✓ | ✗ |
| **Sets grnId** | ✓ (line 169) | ✓ | ✗ (undefined) | N/A |
| **Handles batch linking** | ✓ via grnId | ✓ via grnId | ✗ no linking | ✓ but broken WHERE |
| **Calculates sellingPrice** | ✓ (line 174-180) | ✓ | ✓ (line 718) | ✓ (line 494-501) |
| **Updates variant.sellingPrice** | ✓ (line 189-197) | ✓ | ✓ (line 734-740) | ✓ (via recalc at 502-514) |

### Working Pattern (createGRN):
- Batches created with `grnId` set
- Bill links via: `grnId: source.id` (works!)
- Batch pricing calculated and stored

### Broken Pattern (acceptPurchaseOrder):
- Batches created without `grnId`
- Bill tries to link via: `grnId: null` (doesn't match!)
- Batch pricing calculated but not linked to bill

---

## Implementation Plan

### Fix #1: Link Batches When Source is PURCHASE_ORDER

**File:** `src/actions/procurement/index.ts`  
**Function:** `createPurchaseBill()` lines 471-481

**Current Code:**
```typescript
await tx.customBatch.updateMany({
  where: {
    variantId: { in: variantIds },
    outletId: source.outletId,
    grnId: source.type === "GRN" ? source.id : null,  // 🔴 Wrong
  },
  data: {
    purchaseBillId: bill.id,
  },
});
```

**Problem:** When source is PURCHASE_ORDER, `grnId: null` doesn't match batches that have `grnId = undefined`

**Fix:** Need TWO cases:
- If source is GRN: link via `grnId = source.id` ✓ (already works)
- If source is PURCHASE_ORDER: link via `transactionId = source.id` (new logic)

**Changes:**
```typescript
// If source is GRN, link via grnId
// If source is PURCHASE_ORDER, find batches created by that PO's acceptance
if (source.type === "GRN") {
  await tx.customBatch.updateMany({
    where: {
      variantId: { in: variantIds },
      outletId: source.outletId,
      grnId: source.id,
    },
    data: {
      purchaseBillId: bill.id,
    },
  });
} else if (source.type === "PURCHASE_ORDER") {
  // Find batches created when PO was accepted
  // Batches created during acceptance have same receivedDate as bill, 
  // and same variantIds, outletId
  await tx.customBatch.updateMany({
    where: {
      variantId: { in: variantIds },
      outletId: source.outletId,
      grnId: null,  // Not from GRN, created directly from PO
      // Match batches created around the same time as PO acceptance
      receivedDate: {
        gte: new Date(source.date),
        lte: new Date(source.date.getTime() + 86400000), // Within 24 hours
      },
    },
    data: {
      purchaseBillId: bill.id,
    },
  });
}
```

**Complexity:** Medium - Adds time-based matching, may catch wrong batches if multiple POs accepted same day

**Better Alternative:** Track which PO created each batch
- Add `purchaseOrderId` field to CustomBatch
- Pass it from acceptPurchaseOrder → StockService.moveStock

---

### Fix #2: Use Batch Selling Price in Invoice Creation

**File:** `src/components/sales/pos-invoice-form.tsx` or invoice creation logic  
**Issue:** When creating invoice, don't use variant.sellingPrice directly

**Current behavior (presumed):**
```typescript
// Bad: Uses stale variant price
rate = variant.sellingPrice
```

**Fix:** Use FIFO allocation to get oldest batch's price
```typescript
// Good: Uses actual batch price from purchase
const allocation = await StockService.peekFIFOAllocation(tx, {
  variantId,
  warehouseId: outlet.warehouse,
  outletId: outlet.id,
  quantity: itemQty,
});

rate = allocation.oldestBatchSellingPrice || variant.sellingPrice; // Fallback
```

**Files affected:**
- `src/actions/sales/index.ts` - Invoice creation
- `src/components/sales/pos-invoice-form.tsx` - Invoice form (pre-fill)

---

### Fix #3: Handle Duplicate Batch Numbers (Multiple POs Same Day)

**File:** `src/domains/inventory/batch-pricing.ts`  
**Function:** `generateBatchNumber()` + usage in `stock-service.ts`

**Current Code (stock-service.ts:143):**
```typescript
const batchNumber = input.batchNumber || 
  generateBatchNumber(variantId.slice(-8), input.batchDate || new Date(), 1);  // 🔴 sequence=1
```

**Problem:** Sequence always 1. Need to increment for duplicates.

**Fix Strategy:**
1. Query existing batches for same SKU/date
2. Count how many exist, use count+1 as sequence

**Implementation in stock-service.ts line 143:**
```typescript
if (!input.batchNumber) {
  // Find existing batch numbers for this variant on this date
  const existingBatches = await tx.customBatch.findMany({
    where: {
      variantId,
      receivedDate: {
        gte: new Date(input.batchDate || new Date()),
        lt: new Date((input.batchDate || new Date()).getTime() + 86400000),
      },
    },
    select: { batchNumber: true },
  });
  
  const sequence = existingBatches.length + 1;
  input.batchNumber = generateBatchNumber(
    variantId.slice(-8), 
    input.batchDate || new Date(), 
    sequence
  );
}
```

**Simpler Alternative:** Use UUID in batch number instead of sequence
```typescript
return `${sku}-${datePart}-${crypto.randomUUID().slice(0, 8)}`;
```
- Pro: No duplicates ever
- Con: Batch numbers less predictable

---

## Changes List

### Priority 1 (Critical - Blocks Multiple POs)
- [ ] Fix batch number generation to handle sequence incrementing
  - File: `src/domains/inventory/stock-service.ts` line 143
  - File: `src/domains/inventory/batch-pricing.ts` (optional refactor)
  - Impact: Users can now accept multiple POs for same item on same day
  - Estimated lines: 8-15

### Priority 2 (High - Data Integrity)
- [ ] Link batches to purchase bill for PURCHASE_ORDER sources
  - File: `src/actions/procurement/index.ts` lines 471-481
  - Approach: Add transactionId tracking or time-based matching
  - Impact: purchaseBillId no longer NULL
  - Estimated lines: 10-20

### Priority 3 (High - User Impact)
- [ ] Use batch selling price in invoice creation
  - File: `src/actions/sales/index.ts` (GRN/invoice creation logic)
  - File: `src/components/sales/pos-invoice-form.tsx` (pre-fill logic)
  - Impact: Invoices use correct batch pricing, not stale variant price
  - Estimated lines: 5-10 per file

### Optional Enhancement
- [ ] Add `purchaseOrderId` field to CustomBatch for future reference tracking
  - File: `prisma/schema.prisma`
  - File: New migration
  - Impact: Cleaner batch linking, auditable PO traceability

---

## Testing Strategy

### Test Case 1: Multiple POs Same Item Same Day
```
1. Create PO #1: Product A, 1 box, 100rs, ratio 10
2. Create PO #2: Product A, 1 box, 100rs, ratio 10  
3. Accept PO #1 → Should create batch PROD-20260420-001
4. Accept PO #2 → Should create batch PROD-20260420-002 (NOT fail)
5. Verify both batches exist and have correct selling price (12rs)
```

### Test Case 2: Bill Links Batches Correctly
```
1. Create & Accept PO
2. Create Purchase Bill from PO
3. Verify batch.purchaseBillId is NOT NULL
4. Verify batch.purchaseUnitRate and batch.costPerBaseUnit are populated
```

### Test Case 3: Invoice Uses Batch Price
```
1. Purchase item: 100rs/box, ratio 10 → 10rs/unit, markup 20% → 12rs selling
2. Accept PO, Create Bill
3. Create invoice with this item
4. Verify invoice line uses 12rs, not variant's old price
```

---

## Questions Before Implementation

1. **Should acceptPurchaseOrder also set a `purchaseOrderId` on the batch?**
   - Makes linking easier but requires schema change
   - Alternative: Use time-based or variant ID matching

2. **For invoice pricing fallback, what if peekFIFOAllocation is too expensive to call for every line item?**
   - Current batch pricing is already calculated and stored
   - Can we just read batch.sellingPricePerBaseUnit directly?

3. **Should batchNumber use deterministic sequence or random UUID?**
   - Deterministic: `SKU-YYYYMMDD-001` (predictable, but collision handling needed)
   - Random: `SKU-YYYYMMDD-{uuid8}` (collision-proof, less predictable)
