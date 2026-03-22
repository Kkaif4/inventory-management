## Functional Requirement

### What changes conceptually

The import sheet now has a clear two-level identity:

- **`productGroupName`** — identifies the product. Same value on every row that belongs to the same product. This becomes the product's name in the system.
- **`variantSku` + `variantSpec`** — identifies the variant within that product. These must be unique per row within the group.

`productName` column is **removed entirely**. The product's display name in the system comes from `productGroupName`.

### Grouping rule

Rows are grouped by `productGroupName` (case-insensitive, trimmed). All rows with the same `productGroupName` → one product, multiple variants.

### Product-level fields (must be identical across all rows in the same group)

```
productGroupName | brand | hsnCode | gstRate | baseUnit | purchaseUnit
salesUnit | conversionRatio | categoryL1 | categoryL2 | categoryL3
```

If any of these differ across rows sharing the same `productGroupName` → all rows in that group are rejected with a field-level conflict error. No partial product is created.

### Variant-level fields (can differ per row)

```
variantSku | variantSpec | purchasePrice | sellingPrice | pricingMethod
markupPercent | minStockLevel | warehouseName | currentStock | batchDate | batchCostPerUnit
```

---

## Updated Headers

Remove `productName`. Add `productGroupName` as the first column.

```
productGroupName | brand | hsnCode | gstRate | baseUnit | purchaseUnit | salesUnit | conversionRatio | categoryL1 | categoryL2 | categoryL3 | variantSku | variantSpec | purchasePrice | sellingPrice | pricingMethod | markupPercent | minStockLevel | warehouseName | currentStock | batchDate | batchCostPerUnit
```

### Updated `FIELD_KEYS`

```ts
const FIELD_KEYS = [
  "productGroupName", // replaces productName
  "brand",
  "hsnCode",
  "gstRate",
  "baseUnit",
  "purchaseUnit",
  "salesUnit",
  "conversionRatio",
  "categoryL1",
  "categoryL2",
  "categoryL3",
  "variantSku",
  "variantSpec",
  "purchasePrice",
  "sellingPrice",
  "pricingMethod",
  "markupPercent",
  "minStockLevel",
  "warehouseName",
  "currentStock",
  "batchDate",
  "batchCostPerUnit",
];
```

### Your data with the new structure

```
productGroupName   | variantSku  | variantSpec        | purchasePrice | currentStock
Adjustable Wrench  | TAP-WRN-10  | 10 Inch Adjustable | 280           | 85
Adjustable Wrench  | TAP-WRN-12  | 12 Inch Adjustable | 340           | 75
```

---

## Updated Field Definitions

| Header             | Required                                        | Type   | Rule                                                                                                |
| ------------------ | ----------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| `productGroupName` | Yes                                             | Text   | Max 120 chars. All rows with the same value (case-insensitive) belong to one product.               |
| `brand`            | No                                              | Text   | Auto-created if not found.                                                                          |
| `hsnCode`          | Yes                                             | Text   | Must be same across all rows in a group.                                                            |
| `gstRate`          | Yes                                             | Number | One of: 0, 0.25, 3, 5, 12, 18, 28. Must be same across group.                                       |
| `baseUnit`         | Yes                                             | Text   | Must match UoM master. Must be same across group.                                                   |
| `purchaseUnit`     | No                                              | Text   | Leave blank if same as baseUnit. Must be same across group.                                         |
| `salesUnit`        | No                                              | Text   | Leave blank if same as baseUnit. Must be same across group.                                         |
| `conversionRatio`  | No                                              | Number | Required if purchaseUnit or salesUnit differs from baseUnit. Default: 1. Must be same across group. |
| `categoryL1`       | Yes                                             | Text   | Lookup or create. Must be same across group.                                                        |
| `categoryL2`       | No                                              | Text   | Lookup or create under L1. Must be same across group.                                               |
| `categoryL3`       | No                                              | Text   | Lookup or create under L2. Must be same across group.                                               |
| `variantSku`       | Yes                                             | Text   | Globally unique. No two rows anywhere in the sheet or DB can share an SKU.                          |
| `variantSpec`      | No                                              | Text   | What makes this variant different. e.g. "10 Inch", "500W", "Model XR".                              |
| `purchasePrice`    | Yes                                             | Number | > 0. Per variant.                                                                                   |
| `sellingPrice`     | Yes if `pricingMethod = MANUAL`                 | Number | Leave blank if MARKUP. Per variant.                                                                 |
| `pricingMethod`    | Yes                                             | Text   | `MANUAL` or `MARKUP` (case-insensitive). Per variant.                                               |
| `markupPercent`    | Yes if `pricingMethod = MARKUP`                 | Number | 0–100. Per variant.                                                                                 |
| `minStockLevel`    | No                                              | Number | Default: 0. Per variant.                                                                            |
| `warehouseName`    | Yes if `currentStock > 0`                       | Text   | Case-insensitive lookup. Auto-created if not found. Per variant.                                    |
| `currentStock`     | No                                              | Number | Qty in base units. Creates Opening Stock entry if > 0. Per variant.                                 |
| `batchDate`        | Yes if batch tracking ON and `currentStock > 0` | Date   | DD/MM/YYYY. Per variant.                                                                            |
| `batchCostPerUnit` | No                                              | Number | Defaults to `purchasePrice` if blank. Per variant.                                                  |

---

## Implementation Plan

### 1. `import.validation.ts` — schema changes

```ts
// Replace productName with productGroupName
// All cross-field rules remain the same

const importRowSchema = z
  .object({
    productGroupName: z.string().min(1).max(120),
    brand: z.string().optional(),
    hsnCode: z.string().min(1),
    gstRate: z.number().refine((v) => [0, 0.25, 3, 5, 12, 18, 28].includes(v), {
      message: "gstRate must be one of: 0, 0.25, 3, 5, 12, 18, 28",
    }),
    baseUnit: z.string().min(1),
    purchaseUnit: z.string().optional(),
    salesUnit: z.string().optional(),
    conversionRatio: z.number().default(1),
    categoryL1: z.string().min(1),
    categoryL2: z.string().optional(),
    categoryL3: z.string().optional(),
    variantSku: z.string().min(1),
    variantSpec: z.string().optional(),
    purchasePrice: z.number().positive(),
    sellingPrice: z.number().positive().optional(),
    pricingMethod: z.enum(["MANUAL", "MARKUP"]),
    markupPercent: z.number().min(0).max(100).optional(),
    minStockLevel: z.number().default(0),
    warehouseName: z.string().optional(),
    currentStock: z.number().default(0),
    batchDate: z.string().optional(),
    batchCostPerUnit: z.number().positive().optional(),
  })
  .superRefine((row, ctx) => {
    // Rule 1: MARKUP requires markupPercent
    if (row.pricingMethod === "MARKUP" && !row.markupPercent) {
      ctx.addIssue({
        path: ["markupPercent"],
        message: "markupPercent is required when pricingMethod is MARKUP",
      });
    }

    // Rule 2: MANUAL requires sellingPrice
    if (row.pricingMethod === "MANUAL" && !row.sellingPrice) {
      ctx.addIssue({
        path: ["sellingPrice"],
        message: "sellingPrice is required when pricingMethod is MANUAL",
      });
    }

    // Rule 3: currentStock > 0 requires warehouseName
    if ((row.currentStock ?? 0) > 0 && !row.warehouseName) {
      ctx.addIssue({
        path: ["warehouseName"],
        message: "warehouseName is required when currentStock > 0",
      });
    }

    // Rule 4: unit conversion requires conversionRatio
    const unitsDiffer =
      (row.purchaseUnit && row.purchaseUnit !== row.baseUnit) ||
      (row.salesUnit && row.salesUnit !== row.baseUnit);
    if (unitsDiffer && (!row.conversionRatio || row.conversionRatio <= 1)) {
      ctx.addIssue({
        path: ["conversionRatio"],
        message:
          "conversionRatio > 1 is required when purchaseUnit or salesUnit differs from baseUnit",
      });
    }
  });

// Product-level fields — these must be consistent across rows in the same group
export const PRODUCT_LEVEL_FIELDS = [
  "brand",
  "hsnCode",
  "gstRate",
  "baseUnit",
  "purchaseUnit",
  "salesUnit",
  "conversionRatio",
  "categoryL1",
  "categoryL2",
  "categoryL3",
] as const;
```

---

### 2. `import.ts` — full updated logic

```
importProductsAction(outletId, userId, rows, skipOnError):

1. Validate session and outlet access.

2. Fetch outlet config:
   - outlet.batchTrackingEnabled
   - outlet.defaultWarehouseId

3. Normalise all rows:
   - Trim whitespace on all string fields
   - Uppercase pricingMethod
   - Parse gstRate, purchasePrice, sellingPrice, conversionRatio,
     currentStock, markupPercent, minStockLevel as numbers
   - Parse batchDate as Date object

4. Row-level schema validation:
   - Run importRowSchema on every row
   - Collect per-row errors: { rowIndex, variantSku, field, message }
   - If skipOnError = false and any errors exist: return all errors, abort
   - If skipOnError = true: remove invalid rows from processing queue,
     continue with valid rows only

5. Sheet-level duplicate SKU check (across all valid rows):
   - Build Set of variantSkus from the current sheet
   - If any SKU appears more than once in the sheet:
       mark second+ occurrence as error:
       "Duplicate SKU '[sku]' in sheet at row [n]. SKUs must be unique."
   - Remove duplicate rows from queue

6. Group valid rows by productGroupName (case-insensitive trim):
   const groups = new Map<string, ValidRow[]>
   for each row:
     key = row.productGroupName.trim().toLowerCase()
     groups.get(key).push(row)   // or create new entry

7. Product-level field consistency check per group:
   for each group:
     referenceRow = group[0]
     for each row in group[1..]:
       for each field in PRODUCT_LEVEL_FIELDS:
         if row[field] !== referenceRow[field]:
           error: "Field '[field]' is '[row[field]]' on row [n] but '[referenceRow[field]]'
                   on row [referenceRow.rowIndex] for product '[productGroupName]'.
                   All variants of the same product must share identical product-level fields."
     If any conflict found:
       if skipOnError = true: remove entire group, add all group rows to errors
       if skipOnError = false: abort with errors

8. Build warehouse cache (to avoid repeated DB lookups):
   warehouseCache = Map<string, warehouseId>   // key: lowercased name

9. Process each group:

   a. Category resolution (3-level, lookup or create):
      categoryCache = Map<string, categoryId>   // scoped to this import session

      resolve(name, parentId):
        cacheKey = `${parentId ?? 'root'}::${name.toLowerCase()}`
        if categoryCache.has(cacheKey): return cached id
        existing = db.findFirst category where
          LOWER(name) = LOWER(name) AND parentId = parentId
        if existing:
          categoryCache.set(cacheKey, existing.id)
          return existing.id
        created = db.create category { name, parentId }
        categoryCache.set(cacheKey, created.id)
        return created.id

      l1Id = resolve(row.categoryL1, null)
      l2Id = row.categoryL2 ? resolve(row.categoryL2, l1Id) : null
      l3Id = row.categoryL3 ? resolve(row.categoryL3, l2Id ?? l1Id) : null
      finalCategoryId = l3Id ?? l2Id ?? l1Id

   b. Brand resolution (lookup or create):
      brandCache = Map<string, brandId>
      if row.brand:
        existing = db.findFirst brand where LOWER(name) = LOWER(row.brand)
        use existing.id or create + cache

   c. Product upsert:
      existing = db.findFirst product where
        LOWER(name) = LOWER(productGroupName) AND outletId = outletId

      if existing:
        db.update product { hsnCode, gstRate, baseUnit, purchaseUnit,
          salesUnit, conversionRatio, categoryId: finalCategoryId, brandId }
        productId = existing.id
        result.updatedProducts++
      else:
        product = db.create product {
          name: row.productGroupName,   // stored with original casing from first row
          hsnCode, gstRate, baseUnit, purchaseUnit, salesUnit,
          conversionRatio, categoryId: finalCategoryId, brandId, outletId
        }
        productId = product.id
        result.createdProducts++

   d. For each row (variant) in group:

      i. Variant upsert:
         existing = db.findFirst variant where sku = row.variantSku

         if existing:
           // Check it belongs to the same product
           if existing.productId !== productId:
             error: "SKU '[sku]' already exists under a different product
                     '[existingProduct.name]'. Cannot reassign SKUs."
             skip this row
           else:
             db.update variant { variantSpec, purchasePrice, sellingPrice,
               pricingMethod, markupPercent, minStockLevel }
             variantId = existing.id
             result.updatedVariants++
         else:
           // Calculate sellingPrice if MARKUP
           resolvedSellingPrice = pricingMethod === "MARKUP"
             ? purchasePrice * (1 + markupPercent / 100)
             : sellingPrice

           variant = db.create variant {
             productId, sku: variantSku, variantSpec,
             purchasePrice, sellingPrice: resolvedSellingPrice,
             pricingMethod, markupPercent, minStockLevel
           }
           variantId = variant.id
           result.createdVariants++

      ii. Stock entry (if currentStock > 0):

          // Resolve warehouse (with cache)
          warehouseId = resolveWarehouse(
            row.warehouseName, outletId, warehouseCache
          )
          // resolveWarehouse: case-insensitive lookup → create if not found → cache

          // Check if opening stock already exists for this variant + warehouse
          existingStock = db.findFirst stockLedger where
            variantId = variantId AND warehouseId = warehouseId
            AND movementType = OPENING

          if existingStock:
            warn: "Opening stock already exists for SKU '[sku]' at '[warehouseName]'.
                   Stock not updated. Adjust manually if needed."
            skip stock entry for this row
          else:
            adjRef = NumberingService.generate(OPENING_STOCK, outletId)

            adjustment = db.create stockAdjustment {
              reference: adjRef, type: OPENING, status: AUTO_APPROVED,
              warehouseId, outletId, createdBy: userId,
              reason: "Opening stock via product import"
            }

            if outlet.batchTrackingEnabled AND row.batchDate:
              resolvedBatchCost = row.batchCostPerUnit ?? row.purchasePrice
              batchNumber = generateBatchNumber(row.variantSku, row.batchDate)

              batch = db.create batch {
                batchNumber, variantId, warehouseId,
                receivedDate: row.batchDate,
                qtyReceived: row.currentStock,
                qtyRemaining: row.currentStock,
                costPerUnit: resolvedBatchCost,
                source: OPENING_IMPORT
              }
              batchId = batch.id
              result.createdBatches++
            else:
              batchId = null

            db.create stockLedger {
              variantId, warehouseId,
              movementType: OPENING,
              qtyIn: row.currentStock,
              qtyOut: 0,
              balance: row.currentStock,
              batchId,
              referenceType: STOCK_ADJUSTMENT,
              referenceId: adjustment.id,
              date: today,
              createdBy: userId
            }
            result.stockEntriesCreated++

10. After all groups:
    emit final progress event:
    {
      status: "complete",
      createdProducts, updatedProducts,
      createdVariants, updatedVariants,
      stockEntriesCreated, createdBatches,
      errors: RowError[]
    }
```

---

### 3. `import-products-dialog.tsx` — updated preview

**Step 2 — Column mapping:**
Auto-match `productGroupName` header. If the uploaded sheet still has `productName`, show a mapping warning:

> _"Column 'productName' found. This column is no longer used. Please use 'productGroupName' instead. Map it now or download the updated template."_

**Step 3 — Preview grouped summary:**

```
┌──────────────────────────────────────────────────────────────────┐
│  Import Preview                                                  │
│                                                                  │
│  📦 1 product · 2 variants · 2 stock entries                    │
│                                                                  │
│  ▾ Adjustable Wrench                    [Taparia · Tools > Hand Tools > Wrenches]
│    Row 2  TAP-WRN-10  10 Inch  ₹280  85 units @₹280  ✓        │
│    Row 3  TAP-WRN-12  12 Inch  ₹340  75 units @₹340  ✓        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

Each product group is collapsible. Errors show inline on the offending row in red.

---

### 4. `generateBatchNumber` utility

```ts
function generateBatchNumber(
  sku: string,
  batchDate: Date,
  sequence: number = 1,
): string {
  const datePart = format(batchDate, "yyyyMMdd"); // e.g. 20260206
  const seq = String(sequence).padStart(3, "0"); // e.g. 001
  return `${sku}-${datePart}-${seq}`;
  // Result: TAP-WRN-10-20260206-001
}
```

If two rows share the same SKU + batchDate (shouldn't happen given SKU uniqueness, but defensive):
increment sequence → `TAP-WRN-10-20260206-002`.

---

### 5. Updated downloadable template

Two-tab Excel file:

**Tab 1 — Import Sheet** (with 3 example rows showing multi-variant correctly):

```
productGroupName   | variantSku  | variantSpec        | purchasePrice | sellingPrice | pricingMethod | currentStock | batchDate   | ...
Adjustable Wrench  | TAP-WRN-10  | 10 Inch Adjustable | 280           | 340          | MANUAL        | 85           | 06/02/2026  |
Adjustable Wrench  | TAP-WRN-12  | 12 Inch Adjustable | 340           | 410          | MANUAL        | 75           | 06/02/2026  |
Drill Bit Set      | DRL-SET-A   | 5 Piece Set        | 450           |              | MARKUP        | 30           | 06/02/2026  |
```

**Tab 2 — Instructions** (plain text rules):

- `productGroupName` = the product name. Repeat on every row for the same product.
- `variantSpec` = what makes this row a different variant (size, model, capacity).
- `batchDate` and `batchCostPerUnit` are only needed if batch tracking is enabled for your outlet.
- `sellingPrice` = leave blank when `pricingMethod` is `MARKUP`.
- `markupPercent` = leave blank when `pricingMethod` is `MANUAL`.
