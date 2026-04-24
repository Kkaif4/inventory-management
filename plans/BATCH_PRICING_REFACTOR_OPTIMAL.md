# Batch Pricing & Allocation - Optimal Schema & Implementation

**Date:** 2026-04-20  
**Status:** Design Phase  
**Owner:** Inventory Management

---

## Executive Summary

The current schema has **redundant and misplaced pricing fields** on `CustomBatch`. The design conflates two concerns:
1. **Cost tracking** (for COGS/inventory valuation) — belongs on batch
2. **Selling price calculation** (for invoicing) — determined at sale time, varies by customer

**Changes Required:**
- **Schema:** Remove redundant/misplaced fields; add `batchPricingMode` to Outlet
- **Logic:** Implement dual-mode batch allocation (STRICT vs LATEST_BATCH) in invoice/sales flow
- **No new models needed** — just cleaner field usage

---

## Current Schema Issues

### CustomBatch Problems

| Field | Problem | Solution |
|-------|---------|----------|
| `costPerUnit` | Redundant alias for `costPerBaseUnit` | Remove entirely |
| `sellingPricePerBaseUnit` | Calculated at batch creation; but pricing varies by customer/transaction | Remove; calculate at sale time |
| `pricingMethod` | Product property, not batch property | Remove from batch |
| `markupPercent` | Product property, not batch property | Remove from batch |

### Outlet Problems

| Field | Problem | Solution |
|-------|---------|----------|
| Missing `batchPricingMode` | No control over allocation strategy | Add enum field |

---

## Optimal Schema Changes

### 1. Update `Outlet` Model

```prisma
model Outlet {
  // ... existing fields ...
  
  // NEW: Batch pricing mode for FIFO allocation
  batchPricingMode    BatchPricingMode @default(STRICT)
  
  // ... rest ...
}

// NEW ENUM
enum BatchPricingMode {
  STRICT         // Use single batch with sufficient qty; fail if none
  LATEST_BATCH   // Consume FIFO; use last batch's cost for entire transaction
}
```

**Default:** `STRICT` (safer, clearer pricing)

### 2. Update `CustomBatch` Model

**REMOVE these fields:**
- `costPerUnit` — redundant, keep only `costPerBaseUnit`
- `sellingPricePerBaseUnit` — calculated at sale time, not batch time
- `pricingMethod` — belongs on Variant, not Batch
- `markupPercent` — belongs on Variant, not Batch

**KEEP these fields:**
```prisma
model CustomBatch {
  id                    String   @id @default(cuid())
  batchNumber           String   @unique
  variantId             String
  warehouseId           String
  outletId              String
  grnId                 String?
  purchaseOrderId       String?
  purchaseBillId        String?
  receivedDate          DateTime @default(now())
  quantityReceived      Float
  quantityConsumed      Float    @default(0)
  
  // Cost tracking (for COGS/FIFO valuation)
  purchaseUnitRate      Float    @default(0)       // Original bill rate
  costPerBaseUnit       Float    @default(0)       // ₹10/Piece = rate / conversionRatio
  
  status                String   @default("ACTIVE") // ACTIVE | EXHAUSTED
  createdAt             DateTime @default(now())
  
  // Relations
  movements             BatchMovement[]
  outlet                Outlet   @relation(fields: [outletId], references: [id])
  variant               Variant  @relation(fields: [variantId], references: [id])
  warehouse             Warehouse @relation(fields: [warehouseId], references: [id])
  
  @@index([variantId, warehouseId, receivedDate])
  @@index([outletId, variantId, warehouseId, receivedDate])
}
```

### 3. Migration SQL

```sql
-- Drop columns from custom_batch
ALTER TABLE custom_batch 
  DROP COLUMN cost_per_unit,
  DROP COLUMN selling_price_per_base_unit,
  DROP COLUMN pricing_method,
  DROP COLUMN markup_percent;

-- Add batch_pricing_mode to outlet
ALTER TABLE outlet 
  ADD COLUMN batch_pricing_mode VARCHAR(50) NOT NULL DEFAULT 'STRICT';
```

---

## Allocation Logic (Business Rules)

### Mode 1: STRICT (Default)

**Objective:** Never split across batches; fail if no single batch has sufficient qty.

**Algorithm:**
```
1. Fetch batches in FIFO order (oldest first by receivedDate)
2. For each batch:
   - available = quantityReceived - quantityConsumed
   - IF available >= requiredQty:
     * SELECT this batch
     * COST = batch.costPerBaseUnit
     * BREAK
3. IF no batch found:
   * Throw insufficient stock error
```

**Pricing:**
- Use selected batch's `costPerBaseUnit` for entire transaction
- Selling price determined by customer/variant settings (not batch)

**Example:**
```
Batch A: 10 units @ ₹10/pc
Batch B: 20 units @ ₹15/pc
Need: 15 units

→ Skip Batch A (only 10 available)
→ Use Batch B entirely
→ Cost = ₹15/pc
```

### Mode 2: LATEST_BATCH

**Objective:** Realistic FIFO inventory deduction; pricing from last batch used.

**Algorithm:**
```
1. Fetch batches in FIFO order (oldest first)
2. remaining = requiredQty
3. batches_used = []
4. For each batch:
   - available = quantityReceived - quantityConsumed
   - consumed = MIN(available, remaining)
   - IF consumed > 0:
     * Add to batches_used[consumed, costPerBaseUnit]
     * remaining -= consumed
5. IF remaining > 0:
   * Throw insufficient stock error
6. COST = last batch in batches_used.costPerBaseUnit
```

**Pricing:**
- Use last batch's `costPerBaseUnit` for entire transaction
- Example: consume 10 from BatchA + 5 from BatchB → use BatchB's cost

**Example:**
```
Batch A: 10 units @ ₹10/pc
Batch B: 20 units @ ₹15/pc
Need: 15 units

→ Consume 10 from Batch A
→ Consume 5 from Batch B
→ Cost = ₹15/pc (last batch)
```

---

## Selling Price Logic (At Sale Time)

When creating a sales invoice, determine the selling price:

```typescript
async function determineSalesPrice(
  variantId: string,
  customerId?: string,
  outletId: string,
): Promise<number> {
  // 1. Check customer's price list (highest priority)
  if (customerId) {
    const customer = await getCustomerWithPricing(customerId, outletId);
    if (customer.priceList?.entries?.length) {
      const entry = customer.priceList.entries.find(e => e.variantId === variantId);
      if (entry) return entry.price;
    }
  }
  
  // 2. Use variant's selling price (from Variant model)
  const variant = await getVariant(variantId);
  return variant.sellingPrice;
}
```

**Key:** Selling price is independent of batch cost.

---

## Implementation Steps

### Phase 1: Schema & Migration

1. **Create migration** for field removals and Outlet field addition
2. **Update Prisma schema** (remove 4 fields, add 1 enum + field)
3. **Run migration** on dev database

### Phase 2: Batch Allocation Service

**File:** `src/domains/inventory/batch-allocation.ts` (NEW)

```typescript
export type BatchAllocationInput = {
  variantId: string;
  warehouseId: string;
  outletId: string;
  requiredQty: number;
  mode: "STRICT" | "LATEST_BATCH";
};

export type BatchAllocationResult = {
  costPerUnit: number;           // For COGS
  batchesConsumed: Array<{
    batchId: string;
    batchNumber: string;
    quantity: number;
    costPerUnit: number;
  }>;
};

export async function allocateBatches(
  tx: Prisma.TransactionClient,
  input: BatchAllocationInput,
): Promise<BatchAllocationResult> {
  // Implements both STRICT and LATEST_BATCH modes
  // Returns cost to use and batches to consume
}
```

### Phase 3: Invoice Service Integration

**File:** `src/domains/sales/invoice-service.ts` (or update existing)

1. When creating sales invoice:
   - Get outlet's `batchPricingMode`
   - For each line item:
     * Call `allocateBatches()` with required mode
     * Get `costPerUnit` for invoice
     * Determine selling price separately (via `determineSalesPrice()`)
     * Create BatchMovement records for each batch consumed
     * Create StockLedger entry with allocated cost

2. Update `StockLedger`:
   - Ensure `costPerUnit` captures the allocated cost (batch cost, not selling price)

### Phase 4: Outlet Form Updates

**Files to update:**
- `src/app/dashboard/admin/outlets/new/page.tsx`
- `src/app/dashboard/admin/outlets/[id]/edit/page.tsx`
- `src/app/dashboard/master-data/locations/outlet/[id]/new.tsx`
- `src/app/dashboard/master-data/locations/outlet/[id]/edit.tsx`

**Add field to form:**
```typescript
<FormField
  control={form.control}
  name="batchPricingMode"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Batch Pricing Mode</FormLabel>
      <Select value={field.value} onValueChange={field.onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="STRICT">
            Strict (single batch, fails if insufficient)
          </SelectItem>
          <SelectItem value="LATEST_BATCH">
            Latest Batch (FIFO consumption, last batch pricing)
          </SelectItem>
        </SelectContent>
      </Select>
      <FormDescription>
        STRICT: Allocate from single batch. LATEST_BATCH: Consume FIFO, use last batch cost.
      </FormDescription>
    </FormItem>
  )}
/>
```

**Add to validation schema** (`src/validations/outlet.validation.ts`):
```typescript
batchPricingMode: z.enum(["STRICT", "LATEST_BATCH"]).default("STRICT"),
```

### Phase 5: Update Stock Service

**File:** `src/domains/inventory/stock-service.ts`

1. Remove references to `sellingPricePerBaseUnit` in batch creation
2. For PURCHASE movements:
   - Calculate only `costPerBaseUnit`
   - Do NOT store selling price on batch
3. For SALE movements:
   - Call new `allocateBatches()` service
   - Create BatchMovements for each batch consumed
   - Use allocated cost for StockLedger

### Phase 6: Testing

**Test Cases:**

#### STRICT Mode
- ✅ Single batch with exact qty
- ✅ Single batch with more than required
- ✅ Skip insufficient batches, find one with enough
- ✅ Fail when no single batch has sufficient qty
- ✅ Multiple outlets with different modes

#### LATEST_BATCH Mode
- ✅ Consume from single batch (when enough in first)
- ✅ Consume from multiple batches
- ✅ Cost is from last batch used
- ✅ Fail when total stock insufficient
- ✅ Verify BatchMovement records created for each batch

#### Edge Cases
- ✅ Negative stock policy interaction
- ✅ Zero quantity movements
- ✅ Decimal quantities with conversion ratios
- ✅ Batch exhaustion filtering

---

## Files Affected

### Schema
- `prisma/schema.prisma` — Remove 4 fields, add 1 enum + 1 field

### New Files
- `src/domains/inventory/batch-allocation.ts` — Core allocation logic

### Modified Files
- `src/domains/inventory/stock-service.ts` — Remove selling price calc; add batch allocation call
- `src/domains/inventory/batch-pricing.ts` — Remove selling price logic (or keep as utility)
- `src/actions/sales/invoice-helpers.ts` — Integration with batch allocation
- `src/validations/outlet.validation.ts` — Add batchPricingMode field
- `src/app/dashboard/admin/outlets/new/page.tsx`
- `src/app/dashboard/admin/outlets/[id]/edit/page.tsx`
- `src/app/dashboard/master-data/locations/outlet/[id]/new.tsx`
- `src/app/dashboard/master-data/locations/outlet/[id]/edit.tsx`

---

## Benefits of This Approach

| Aspect | Benefit |
|--------|---------|
| **Cleaner Schema** | Remove misplaced fields; each field has clear purpose |
| **Correct Pricing** | Selling price determined at sale time, not batch time |
| **Flexibility** | Two modes support different business needs |
| **Auditability** | BatchMovement records show exact FIFO consumption |
| **No Breaking Changes** | Default to STRICT (existing behavior) |
| **Scalable** | Easy to add more modes later (e.g., WEIGHTED_AVG) |

---

## Migration Path

1. **Backward Compatibility:** Default `batchPricingMode = STRICT` matches current behavior
2. **Gradual Rollout:** Enable LATEST_BATCH per outlet as needed
3. **Data Integrity:** No data loss; just field removal and recalculation at sale time

---

## Performance Considerations

- **Batch Query:** Indexed on `(variantId, warehouseId, receivedDate)` — FIFO fetch is O(log N)
- **Allocation:** Linear scan through batches (typically 5-20 per variant) — O(N) acceptable
- **StockLedger:** Insert one record per transaction; BatchMovement one per batch used
- **No Aggregation Needed:** `quantityConsumed` updated per transaction

---

## Validation Rules (to enforce in code)

1. Required fields on CustomBatch:
   - `costPerBaseUnit` ≥ 0
   - `purchaseUnitRate` ≥ 0
   - `quantityReceived` > 0
   - `receivedDate` not in future

2. Batch availability:
   - `available = quantityReceived - quantityConsumed`
   - `available` must be ≥ 0
   - Filter out EXHAUSTED batches

3. Outlet constraints:
   - `batchPricingMode` must be STRICT or LATEST_BATCH
   - Must have outlet selected before allocation

---

## Rollback Plan

If issues arise:
1. Revert migration (restore dropped columns with NULL/defaults)
2. Revert code changes
3. Return to original single-batch logic
4. No data loss possible (columns just go unused temporarily)

---

## Summary

**Schema**: Clean, remove redundant fields, add batch pricing mode  
**Logic**: Implement dual-mode allocation (STRICT vs LATEST_BATCH)  
**Selling Price**: Determined at sale time based on customer/product settings  
**Implementation**: 6 phases, phased rollout per outlet  
**Testing**: Comprehensive test cases for both modes
