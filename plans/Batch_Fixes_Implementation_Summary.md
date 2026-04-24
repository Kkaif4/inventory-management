# Batch Creation & Pricing Fixes - Implementation Summary

**Date:** 2026-04-20  
**Status:** ✅ Implemented & Build Verified (0 TypeScript errors)

---

## Changes Implemented

### ✅ Fix #1: Handle Multiple POs Same Day (Batch Number Duplicate Fix)

**Problem:** When creating multiple purchase orders for the same item on the same day, the second PO failed with UNIQUE constraint violation on `batchNumber`.

**Root Cause:** Batch numbers were always generated with `sequence=1`, causing duplicates:
- PO #1: `PROD-20260420-001` ✓
- PO #2: `PROD-20260420-001` → **UNIQUE CONSTRAINT ERROR** ✗

**Solution:** Use DocumentSeries to track and increment batch sequence globally.

**Files Changed:**

1. **src/domains/inventory/batch-pricing.ts**
   - Renamed `generateBatchNumber()` → `formatBatchNumber()`
   - Now just formats the number, doesn't generate it
   - DocumentSeries handles sequence incrementing

2. **src/domains/inventory/stock-service.ts**
   - Updated import to use `formatBatchNumber`
   - Added batch number generation via DocumentSeries (lines 143-165)
   - Creates/updates DocumentSeries with type="BATCH" for outlet
   - Each batch increments the sequence automatically

**Code:**
```typescript
// Get or create DocumentSeries for batch numbering
const series = await tx.documentSeries.upsert({
  where: {
    type_financialYear_outletId: {
      type: "BATCH",
      financialYear: new Date().getFullYear().toString(),
      outletId,
    },
  },
  update: {
    nextNumber: { increment: 1 },
  },
  create: {
    type: "BATCH",
    prefix: "BATCH",
    nextNumber: 2,
    financialYear: new Date().getFullYear().toString(),
    outletId,
  },
});

const sku = variantId.slice(-8);
const sequence = series.nextNumber - 1;
batchNumber = formatBatchNumber(sku, input.batchDate || new Date(), sequence);
```

**Impact:** ✓ Multiple POs for same item on same day now work seamlessly

---

### ✅ Fix #2: Link Batches to Purchase Bills (purchaseBillId NULL Fix)

**Problem:** After creating a purchase bill from a PO, `batch.purchaseBillId` remained NULL.

**Root Cause:** When `createPurchaseBill()` linked batches, it only checked for `grnId` match:
```typescript
// OLD - Wrong!
where: {
  grnId: source.type === "GRN" ? source.id : null,  // NULL when PO
}
```
Batches created from POs have `grnId = undefined`, so WHERE clause didn't match.

**Solution:** Add `purchaseOrderId` field to CustomBatch, track which PO created the batch, link via that.

**Files Changed:**

1. **prisma/schema.prisma**
   - Added `purchaseOrderId?: String` field to CustomBatch model
   - Migration created: `20260420104028_add_purchase_order_id_to_batch`

2. **src/domains/inventory/stock-service.ts**
   - Updated `StockMoveInput` type to include `purchaseOrderId`
   - When creating batch, store `purchaseOrderId: input.purchaseOrderId`

3. **src/actions/procurement/index.ts**
   
   a. `acceptPurchaseOrder()` (line 714)
   - Pass `purchaseOrderId: poTx.id` when calling StockService.moveStock
   
   b. `createGRN()` (line 170)
   - Pass `purchaseOrderId: data.poId` when calling StockService.moveStock
   
   c. `createPurchaseBill()` (lines 470-497)
   - Split linking logic into two cases:
   ```typescript
   if (source.type === "GRN") {
     // Link via grnId (existing logic)
     await tx.customBatch.updateMany({
       where: {
         grnId: source.id,
         variantId: { in: variantIds },
         outletId: source.outletId,
       },
       data: { purchaseBillId: bill.id },
     });
   } else if (source.type === "PURCHASE_ORDER") {
     // Link via purchaseOrderId (new logic)
     await tx.customBatch.updateMany({
       where: {
         purchaseOrderId: source.id,  // ✓ Matches!
         variantId: { in: variantIds },
         outletId: source.outletId,
       },
       data: { purchaseBillId: bill.id },
     });
   }
   ```

**Impact:** ✓ Batches now correctly linked to bills, `purchaseBillId` no longer NULL

---

### ✅ Fix #3: Use Batch Selling Price in Invoices

**Problem:** When creating invoices, system used stale `variant.sellingPrice` instead of the batch's calculated `sellingPricePerBaseUnit`.

**Scenario:**
- Purchase 1 box at 100rs (ratio 10) → cost = 10rs/unit, selling price = 12rs (markup 20%)
- This price IS calculated and stored in batch
- But when creating invoice, system still used old variant price
- Result: Invoice price wrong, profit margin wrong

**Solution:** Use `getVariantBatchPrice()` helper when adding items to invoice. Pre-fill with oldest batch's selling price.

**Files Changed:**

1. **src/actions/sales/invoice-helpers.ts** (already existed)
   - `getVariantBatchPrice()` function queries oldest active batch's `sellingPricePerBaseUnit`
   - Falls back to customer price list → standard price
   - Already implemented, just wasn't being called

2. **src/components/sales/pos-invoice-table.tsx**
   - Added import: `getVariantBatchPrice` from invoice-helpers
   - Made `confirmAddItem()` async
   - Before appending item, fetch batch price:
   ```typescript
   const confirmAddItem = async () => {
     // ... setup code ...
     
     // Get batch price if FIFO is enabled, fallback to customer/standard price
     let rate = variant.customerPrice ?? variant.sellingPrice ?? 0;
     try {
       const priceResult = await getVariantBatchPrice(
         variant.id,
         product.warehouseId || fromOutletId,
         fromOutletId,
         partyId,
       );
       if (priceResult.success && priceResult.data) {
         rate = (priceResult.data as any).price || rate;
       }
     } catch (error) {
       console.warn("Failed to fetch batch price, using standard price:", error);
     }

     append({
       // ... other fields ...
       rate,  // ✓ Uses batch price!
     });
   };
   ```

**Impact:** ✓ Invoices now pre-fill with correct batch pricing, not stale variant prices

---

## Database Migration

**Migration File:** `prisma/migrations/20260420104028_add_purchase_order_id_to_batch/migration.sql`

```sql
ALTER TABLE "CustomBatch" ADD COLUMN "purchaseOrderId" TEXT;
```

**Applied Successfully:** ✓ Database synced

---

## Testing Checklist

### Test 1: Multiple POs Same Item Same Day
```
GIVEN: Product A exists
WHEN: Create PO #1 for Product A, 1 box, 100rs
AND:  Create PO #2 for Product A, 1 box, 100rs
AND:  Accept PO #1
AND:  Accept PO #2
THEN: Both POs accepted
AND:  Batch PROD-20260420-001 exists (from PO #1)
AND:  Batch PROD-20260420-002 exists (from PO #2)
AND:  Both batches have correct sellingPricePerBaseUnit = 12 (100/10 * 1.20)
```

### Test 2: Bill Links Batches Correctly
```
GIVEN: PO #1 accepted with 3 items
WHEN: Create Purchase Bill from PO #1
THEN: All 3 batches have purchaseBillId = bill.id
AND:  All batches have purchaseUnitRate populated
AND:  All batches have costPerBaseUnit populated
AND:  All batches have sellingPricePerBaseUnit populated
```

### Test 3: Invoice Uses Batch Pricing
```
GIVEN: Batch with sellingPricePerBaseUnit = 12rs exists
WHEN: Create new invoice
AND:  Search for and add the product from that batch
THEN: Line item pre-fills with rate = 12 (batch price)
AND:  NOT variant.sellingPrice (old price)
```

### Test 4: GRN Path Still Works
```
GIVEN: PO #1 created and pending
WHEN: Create GRN from PO #1
AND:  Accept GRN
AND:  Create Bill from GRN
THEN: All batches linked correctly
AND:  grnId and purchaseOrderId both populated
AND:  purchaseBillId linked correctly
```

---

## Build Status

✅ **Build Successful**
- TypeScript: 0 errors
- Compilation: ✓ Success
- All routes compiled
- No warnings

---

## Files Modified Summary

| File | Changes | Lines |
|------|---------|-------|
| `prisma/schema.prisma` | Added purchaseOrderId field | +1 |
| `prisma/migrations/` | New migration for field | +5 |
| `src/domains/inventory/batch-pricing.ts` | Renamed function | ~5 |
| `src/domains/inventory/stock-service.ts` | DocumentSeries batching, purchaseOrderId storage | ~45 |
| `src/actions/procurement/index.ts` | Pass purchaseOrderId, split bill linking logic | ~35 |
| `src/components/sales/pos-invoice-table.tsx` | Use batch pricing in invoice pre-fill | ~20 |
| **Total** | **All Fixes** | **~110** |

---

## Known Limitations & Future Improvements

1. **Batch Number Format:** Currently uses SKU-YYYYMMDD-{sequence}
   - Could switch to UUID if deterministic sequence causes issues
   - Current approach is human-readable and auditable

2. **Performance:** Invoice form now makes an async call per item
   - Acceptable for typical invoices (5-50 items)
   - Could batch-fetch all prices if invoices regularly have 100+ items

3. **Fallback Chain:** Batch → Customer Price List → Standard Price
   - Ensures invoice always has a price
   - Can be customized per business logic

---

## Deployment Notes

1. **Database Migration:** Run before deploying code
   ```bash
   npx prisma migrate deploy
   ```

2. **Prisma Client:** Regenerate after schema changes
   ```bash
   npx prisma generate
   ```

3. **Build Verification:**
   ```bash
   npm run build  # Should succeed with 0 TypeScript errors
   ```

4. **Runtime Testing:**
   - Test the 4 scenarios above before marking as complete
   - Monitor error logs for getVariantBatchPrice failures

---

## Rollback Plan (if needed)

**To revert all changes:**
```bash
git revert HEAD~6:HEAD  # Assuming this is last 6 commits
# Or specific files:
git restore src/actions/procurement/index.ts
git restore src/domains/inventory/stock-service.ts
git restore src/components/sales/pos-invoice-table.tsx
npx prisma migrate resolve --rolled-back 20260420104028_add_purchase_order_id_to_batch
```

---

## Sign-Off

- ✅ Root Cause Analysis Complete
- ✅ Implementation Complete
- ✅ Build Verification Passed
- ✅ TypeScript Type Check Passed
- ✅ Database Migration Applied
- ⏳ Runtime Testing: **Pending User Validation**

