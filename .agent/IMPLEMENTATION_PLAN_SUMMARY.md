# 🔧 IMPORT LOGIC IMPLEMENTATION PLAN - SUMMARY

## Quick Overview

Implement 6 focused fixes to the product import system for normal-casing headers, row-number tracking, batch date validation, and simplified schema.

---

## ISSUE #1: Normal Casing Headers

**Files**: `src/actions/products/import-logic.ts`

**Changes**:

```typescript
// Add constants at top of file:
export const FIELD_KEYS = [
  "Product Group Name",
  "Brand",
  "HSN Code",
  "GST Rate",
  "Base Unit",
  "Purchase Unit",
  "Conversion Ratio",
  "Category L1",
  "Category L2",
  "Category L3",
  "Variant SKU",
  "Variant Spec",
  "Purchase Price",
  "Selling Price",
  "Pricing Method",
  "Markup Percent",
  "Min Stock Level",
  "Warehouse Name",
  "Current Stock",
  "Batch Date",
  "Batch Cost Per Unit",
];

const HEADER_TO_FIELD: Record<string, string> = {
  "product group name": "productGroupName",
  brand: "brand",
  "hsn code": "hsnCode",
  "gst rate": "gstRate",
  "base unit": "baseUnit",
  "purchase unit": "purchaseUnit",
  "conversion ratio": "conversionRatio",
  "category l1": "categoryL1",
  "category l2": "categoryL2",
  "category l3": "categoryL3",
  "variant sku": "variantSku",
  "variant spec": "variantSpec",
  "purchase price": "purchasePrice",
  "selling price": "sellingPrice",
  "pricing method": "pricingMethod",
  "markup percent": "markupPercent",
  "min stock level": "minStockLevel",
  "warehouse name": "warehouseName",
  "current stock": "currentStock",
  "batch date": "batchDate",
  "batch cost per unit": "batchCostPerUnit",
};

export function normalizeRow(raw: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(raw).map(([key, value]) => {
      const normalized = HEADER_TO_FIELD[key.trim().toLowerCase()];
      return [normalized ?? key.trim().toLowerCase(), value];
    }),
  );
}
```

**In validation loop** (line ~59):

```typescript
for (let i = 0; i < rows.length; i++) {
  const sheetRowNumber = i + 2; // row 1 = header
  const rawRow = normalizeRow(rows[i]); // ← ADD THIS
  // ... rest of loop
}
```

**Impact**: Normal-casing headers work automatically; mapping is internal.

---

## ISSUE #2: Actual Sheet Row Numbers

**Files**:

- `src/actions/products/import-logic.ts`
- `src/validations/import.validation.ts`

**Changes**:

1. **Extend type** (import.validation.ts):

```typescript
export type ImportRowWithMeta = ImportRow & {
  _sheetRow: number; // 1-based sheet row number
};
```

2. **Add formatter** (import-logic.ts):

```typescript
function formatZodError(e: any): string {
  if (e?.name === "ZodError" && e.issues?.length) {
    return e.issues
      .map((iss: any) => `${iss.path.join(".")}: ${iss.message}`)
      .join(" | ");
  }
  return e.message ?? "Unknown validation error";
}
```

3. **Update error reporting** in all error.push() calls:

```typescript
// Before: row: i + 1
// After:  row: sheetRowNumber, message: `Row ${sheetRowNumber}: ...`
```

4. **Attach row to valid rows**:

```typescript
const rowWithMeta: ImportRowWithMeta = { ...row, _sheetRow: sheetRowNumber };
validRows.push(rowWithMeta as any);
```

5. **Update productGroups type to propagate metadata**:

```typescript
// CRITICAL: Change this:
const productGroups = new Map<string, ImportRow[]>();

// To this (must match validRows element type):
const productGroups = new Map<string, ImportRowWithMeta[]>();
```

**Why**: Without this, `row._sheetRow` inside the group loop will be TypeScript error or silently `undefined`. Issues #3 and #4 both depend on `row._sheetRow` being available.

6. **Group errors show all rows**:

```typescript
const rowNumbers = groupRows.map((r) => r._sheetRow).join(", ");
message: `Rows ${rowNumbers}: Inconsistent product-level fields...`;
```

**Impact**: Every error includes "Row X:" prefix. Users can fix exact rows. Metadata flows through entire pipeline.

---

## ISSUE #3: Batch Date Validation

**Files**:

- `src/lib/utils/date.ts` (NEW)
- `src/actions/products/import-logic.ts`

**New utility file** (src/lib/utils/date.ts):

```typescript
export function parseBatchDate(dateStr: string, rowNumber: number): Date {
  if (!dateStr || typeof dateStr !== "string") {
    throw new Error(
      `Row ${rowNumber}: Batch Date is required when batch tracking enabled and stock > 0.`,
    );
  }

  const parts = dateStr.trim().split("/");
  if (parts.length !== 3) {
    throw new Error(
      `Row ${rowNumber}: Batch Date "${dateStr}" is not in DD/MM/YYYY format.`,
    );
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    throw new Error(
      `Row ${rowNumber}: Batch Date contains non-numeric values.`,
    );
  }

  if (month < 1 || month > 12) {
    throw new Error(`Row ${rowNumber}: Batch Date has invalid month ${month}.`);
  }

  if (day < 1 || day > 31) {
    throw new Error(`Row ${rowNumber}: Batch Date has invalid day ${day}.`);
  }

  const date = new Date(year, month - 1, day);

  // Rollover check (e.g. 31 Feb → 3 Mar)
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    throw new Error(
      `Row ${rowNumber}: Batch Date "${dateStr}" is invalid — day ${day} does not exist in month ${month}/${year}.`,
    );
  }

  return date;
}
```

**Usage in import-logic.ts** (line ~390):

```typescript
import { parseBatchDate } from "@/lib/utils/date";

// Replace:
batchDate = row.batchDate
  ? new Date(row.batchDate.split("/").reverse().join("-"))
  : new Date();

// With:
if (!row.batchDate) {
  throw new Error(
    `Row ${row._sheetRow}: Batch Date is required but missing. This is a validation bug — report it.`,
  );
}
batchDate = parseBatchDate(row.batchDate, row._sheetRow);
```

**Impact**: Invalid dates like "31/02/2026" rejected with exact row number.

---

## ISSUE #4: Deterministic Batch Numbers

**Files**: `src/actions/products/import-logic.ts`

**Changes**:

1. **Initialize sequence map** (before group loop, line ~125):

```typescript
const categoryCache = new Map<string, string>();
const warehouseCache = new Map<string, string>();
const batchSeqMap = new Map<string, number>(); // ← ADD THIS
```

2. **Replace random suffix** (line ~395):

```typescript
// Before (wrong — uses UTC, causes date shift on non-UTC servers):
const randomSuffix = Math.floor(1000 + Math.random() * 9000);
const batchNumDate = batchDate.toISOString().split("T")[0].replace(/-/g, "");
batchNumber = `${row.variantSku}-${batchNumDate}-${randomSuffix}`;

// After (correct — uses local date components, no UTC shift):
const datePart = [
  batchDate.getFullYear(),
  String(batchDate.getMonth() + 1).padStart(2, "0"),
  String(batchDate.getDate()).padStart(2, "0"),
].join("");
const seqKey = `${row.variantSku}-${datePart}`;
const seq = (batchSeqMap.get(seqKey) ?? 0) + 1;
batchSeqMap.set(seqKey, seq);
batchNumber = `${row.variantSku}-${datePart}-${String(seq).padStart(3, "0")}`;
// Result: TAP-WRN-10-20260206-001
// Safe: uses same year/month/day already validated by parseBatchDate
```

**Why UTC fix matters**: If server runs in IST (UTC+5:30) and batch date is 06/02/2026, `new Date(2026, 1, 6)` is midnight local time = `01/02/2026 18:30 UTC` the previous day. `toISOString()` returns `"2026-02-05T18:30:00.000Z"`, producing wrong date `20260205` instead of `20260206`. Local date components avoid this entirely.

**Impact**: Same import twice = same batch numbers (deterministic, idempotent).

---

## ISSUE #5: Remove Sales Unit Column

**Files**:

- `src/actions/products/import-logic.ts` (HEADER_TO_FIELD)
- `src/validations/import.validation.ts`
- `sample.csv`
- `create-excel-template.js`

**Changes**:

1. **Remove from HEADER_TO_FIELD**:

```typescript
// Remove this line:
"sales unit": "salesUnit",
```

2. **Remove from FIELD_KEYS**:

```typescript
// Remove "Sales Unit" from array
```

3. **Remove from importRowSchema** (import.validation.ts):

```typescript
// Remove: salesUnit: z.string().optional(),
```

4. **Update templates**:

- Remove "Sales Unit" column from sample.csv
- Remove from create-excel-template.js headers
- Regenerate: `node create-excel-template.js`

**Final CSV Headers** (21 columns):

```
Product Group Name | Brand | HSN Code | GST Rate | Base Unit | Purchase Unit |
Conversion Ratio | Category L1 | Category L2 | Category L3 | Variant SKU |
Variant Spec | Purchase Price | Selling Price | Pricing Method | Markup Percent |
Min Stock Level | Warehouse Name | Current Stock | Batch Date | Batch Cost Per Unit
```

**Impact**: Less confusion; sales always use Base Unit.

---

## ISSUE #6: Template Updates

**Files**:

- `sample.csv`
- `create-excel-template.js`
- `sample-template.xlsx`

**Changes**:

1. Update CSV header and remove Sales Unit column from all rows
2. Update create-excel-template.js to remove Sales Unit
3. Run: `node create-excel-template.js` to regenerate Excel template

**New Template Headers**: 21 columns (down from 22)

---

## Implementation Sequence

### Phase 1: Setup (30 min)

- [ ] Create `src/lib/utils/date.ts` with `parseBatchDate` function
- [ ] Add FIELD_KEYS, HEADER_TO_FIELD, normalizeRow to import-logic.ts
- [ ] Add formatZodError function
- [ ] Extend ImportRow type with ImportRowWithMeta

### Phase 2: Core Logic (60 min)

- [ ] Update validation loop with normalizeRow and sheetRowNumber
- [ ] Update all error.push() calls with row numbers
- [ ] Update validRows type to ImportRowWithMeta[]
- [ ] Update product-level consistency errors
- [ ] Add batchSeqMap initialization and deterministic sequence

### Phase 3: Schema Cleanup (15 min)

- [ ] Remove "sales unit" from HEADER_TO_FIELD
- [ ] Remove "Sales Unit" from FIELD_KEYS
- [ ] Remove salesUnit from importRowSchema

### Phase 4: Templates (20 min)

- [ ] Update sample.csv
- [ ] Update create-excel-template.js
- [ ] Regenerate sample-template.xlsx

### Phase 5: Testing (45 min)

- [ ] `npm run build` succeeds with zero errors
- [ ] Test normal-casing headers work
- [ ] Test invalid batch dates show row numbers
- [ ] Test batch number determinism (same import = same batches)
- [ ] Verify all error messages include row numbers

---

## File Changes Summary

| File                                 | Type       | Effort |
| ------------------------------------ | ---------- | ------ |
| src/lib/utils/date.ts                | NEW        | Low    |
| src/actions/products/import-logic.ts | MODIFY     | Medium |
| src/validations/import.validation.ts | MODIFY     | Low    |
| sample.csv                           | MODIFY     | Low    |
| create-excel-template.js             | MODIFY     | Low    |
| sample-template.xlsx                 | REGENERATE | N/A    |

**Total Effort**: ~3 hours

---

## Success Criteria

✅ Normal-casing headers work end-to-end
✅ All errors include "Row X:" with actual sheet rows
✅ Invalid batch dates rejected with row-specific error
✅ Same import twice = same batch numbers (deterministic)
✅ Sales Unit removed from schema and templates
✅ Build succeeds with zero TypeScript errors
✅ All error scenarios tested and verified

---

## Risk Assessment

| Risk                             | Severity | Mitigation                                    |
| -------------------------------- | -------- | --------------------------------------------- |
| normalizeRow misses a header     | Medium   | Test all 21 headers individually              |
| Row number off-by-one            | High     | Verify row 1 = header, data starts row 2      |
| Date edge cases (leap years)     | Medium   | Test 29/02 on leap/non-leap years             |
| Type errors on ImportRowWithMeta | Medium   | Run `npm run build` after Phase 2             |
| Batch collisions                 | Low      | Collision impossible with unique SKU+date key |

---

## Next Steps

1. Create this implementation plan document ✅
2. Review and approve scope
3. Implement Phase 1 (Setup utilities)
4. Implement Phase 2 (Core import logic)
5. Implement Phase 3 (Schema cleanup)
6. Implement Phase 4 (Templates)
7. Execute Phase 5 (Testing)
8. Verify build and deploy
