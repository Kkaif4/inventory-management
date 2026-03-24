# 📊 IMPORT LOGIC ANALYSIS REPORT

## 1. SHEET HEADERS vs. IMPORT VALIDATION MAPPING

### Current CSV Headers (Normal Casing)

| #  | CSV Header          | Validation Field | Type   | Required         | Notes                                                                          |
| -- | ------------------- | ---------------- | ------ | ---------------- | ------------------------------------------------------------------------------ |
| 1  | Product Group Name  | productGroupName | string | ✅ YES           | Becomes Product.name                                                           |
| 2  | Brand               | brand            | string | ❌ NO            | Optional                                                                       |
| 3  | HSN Code            | hsnCode          | string | ❌ NO            | Optional                                                                       |
| 4  | GST Rate            | gstRate          | number | ✅ YES           | Must be: 0, 0.25, 3, 5, 12, 18, 28                                             |
| 5  | Base Unit           | baseUnit         | string | ✅ YES           | Unit of measurement (e.g., Piece, kg)                                          |
| 6  | Purchase Unit       | purchaseUnit     | string | ❌ NO            | Optional; if different from baseUnit, conversionRatio must be > 1              |
| 7  | Conversion Ratio    | conversionRatio  | number | ✅ YES*          | Default: 1                                                                     |
| 8  | Category L1         | categoryL1       | string | ✅ YES           | Top-level category                                                             |
| 9  | Category L2         | categoryL2       | string | ❌ NO            | Mid-level category                                                             |
| 10 | Category L3         | categoryL3       | string | ❌ NO            | Leaf-level category                                                            |
| 11 | Variant SKU         | variantSku       | string | ✅ YES           | Unique identifier; cannot exist across different products                      |
| 12 | Variant Spec        | variantSpec      | string | ❌ NO            | Specifications; stored as JSON {detail: ...}                                   |
| 13 | Purchase Price      | purchasePrice    | number | ✅ YES           | Must be ≥ 0                                                                   |
| 14 | Selling Price       | sellingPrice     | number | ⚠️ CONDITIONAL | Required ONLY if pricingMethod = "MANUAL"                                      |
| 15 | Pricing Method      | pricingMethod    | enum   | ✅ YES           | Must be: "MANUAL" or "MARKUP"                                                  |
| 16 | Markup Percent      | markupPercent    | number | ⚠️ CONDITIONAL | Required ONLY if pricingMethod = "MARKUP"; range: 0-100                        |
| 17 | Min Stock Level     | minStockLevel    | number | ✅ YES*          | Default: 0                                                                     |
| 18 | Warehouse Name      | warehouseName    | string | ⚠️ CONDITIONAL | Required if currentStock > 0                                                   |
| 19 | Current Stock       | currentStock     | number | ✅ YES*          | Default: 0                                                                     |
| 20 | Batch Date          | batchDate        | string | ⚠️ CONDITIONAL | Format: DD/MM/YYYY; Required if batchTrackingEnabled=true AND currentStock > 0 |
| 21 | Batch Cost Per Unit | batchCostPerUnit | number | ❌ NO            | Used for batch tracking; defaults to purchasePrice                             |

---

## 2. DATA FLOW & FIELD USAGE MAPPING

### A. PRODUCT-LEVEL FIELDS (Must be consistent across all variants of same product)

```
Fields that MUST be identical for all variants of same product:
├── brand
├── hsnCode
├── gstRate
├── baseUnit
├── purchaseUnit
├── conversionRatio
├── categoryL1
├── categoryL2
└── categoryL3
```

**Validation**: If two rows have same `productGroupName` but different values in above fields → **ERROR: "Inconsistent product-level details found"**

### B. PRODUCT TABLE INSERTION

```
Product Fields          ← Import Row Mapping
├── name                ← productGroupName (case-insensitive lookup)
├── brand               ← brand (nullable)
├── hsnCode             ← hsnCode (nullable)
├── gstRate             ← gstRate (required, validated GST slab)
├── baseUnit            ← baseUnit (required)
├── purchaseUnit        ← purchaseUnit (nullable)
├── conversionRatio     ← conversionRatio (default 1)
├── categoryId          ← resolved from categoryL1, L2, L3 (3-level hierarchy)
├── outletId            ← from options.outletId
└── isArchived          ← FALSE (default, not set by import)
```

**Logic**:

- Lookup Product by name (case-insensitive) + outletId
- If exists → UPDATE productData
- If not exists → CREATE productData

### C. CATEGORY RESOLUTION (3-Level Hierarchy)

```
Input: categoryL1, categoryL2, categoryL3
Process:
1. Filter nulls: [categoryL1, categoryL2, categoryL3] → only non-empty
2. For each category name:
   - Build path: "l1 > l2 > l3" (for caching)
   - Lookup: Category.findFirst({ name (case-insensitive), parentId, outletId })
   - If not found: CREATE new category
   - Update parentId for next iteration
3. Return final categoryId

Example:
   categoryL1="Tools" → Create/Find "Tools" (parent=null)
   categoryL2="Power Tools" → Create/Find "Power Tools" (parent=Tools.id)
   categoryL3="Drills" → Create/Find "Drills" (parent=PowerTools.id)
   Final categoryId = Drills.id
```

### D. VARIANT TABLE INSERTION

```
Variant Fields          ← Import Row Mapping
├── sku                 ← variantSku (unique, cannot reassign across products)
├── purchasePrice       ← purchasePrice (required)
├── sellingPrice        ← CALCULATED or from input:
│                         • If pricingMethod="MARKUP" AND markupPercent exists:
│                           sellingPrice = purchasePrice * (1 + markupPercent/100)
│                         • Else: sellingPrice (from row)
├── pricingMethod       ← pricingMethod (MANUAL or MARKUP)
├── markupPercent       ← markupPercent (nullable, conditional)
├── minStockLevel       ← minStockLevel (default 0)
├── specifications      ← JSON: { detail: variantSpec } (if variantSpec provided)
└── productId           ← product.id
```

**Logic**:

- Lookup Variant by SKU (globally unique)
- Idempotency check: If variant exists AND belongs to different product → **ERROR**
- If variant exists for this product → UPDATE variantData
- If not exists → CREATE variantData

### E. INITIAL STOCK MANAGEMENT (if currentStock > 0)

```
Step 1: Warehouse Resolution
├── Input: warehouseName (required if currentStock > 0)
├── Lookup: Warehouse.findFirst({ name (case-insensitive), outlets: { some: { id: outletId } } })
├── If not found: CREATE new warehouse and link to outlet
└── Return warehouseId

Step 2: Opening Stock Idempotency Check
├── Query: Transaction.findFirst({
│     type: "STOCK_ADJUSTMENT",
│     outletId,
│     remarks: "OPENING_IMPORT",
│     items: { some: { variantId } },
│     fromLocationId: warehouseId
│   })
├── If found: SKIP stock adjustment (prevent duplicate opening stock)
└── If not found: Continue to create adjustment

Step 3: Create Stock Adjustment Transaction
├── Generate txnNumber (auto-increment per outlet + transaction type)
├── Create Transaction record:
│   ├── type: "STOCK_ADJUSTMENT"
│   ├── txnNumber: auto-generated
│   ├── outletId: from options
│   ├── fromLocationId: warehouseId
│   ├── userId: from options
│   ├── status: "COMPLETED"
│   └── remarks: "OPENING_IMPORT"
├── Create TransactionItem:
│   ├── transactionId
│   ├── variantId
│   ├── quantity: currentStock
│   ├── rate: purchasePrice
│   └── taxableValue: purchasePrice * currentStock

Step 4: Batch Tracking (if outlet.batchTrackingEnabled=true)
├── Parse batchDate: DD/MM/YYYY format → convert to Date object
├── Generate batchNumber: "${sku}-${dateWithoutHyphens}-${random4digit}"
├── Create CustomBatch record:
│   ├── batchNumber (unique)
│   ├── variantId
│   ├── warehouseId
│   ├── outletId
│   ├── receivedDate: batchDate (or now() if not provided)
│   ├── quantityReceived: currentStock
│   ├── costPerUnit: batchCostPerUnit OR purchasePrice (fallback)

Step 5: Stock Ledger Update (via StockService.moveStock)
├── Create/Update Stock records (warehouse + outlet stock)
├── Create StockLedger entry:
│   ├── variantId
│   ├── warehouseId
│   ├── outletId
│   ├── transactionId
│   ├── quantity: currentStock (movement)
│   ├── balance: running balance
│   ├── type: "ADJUSTMENT_INC"
│   ├── userId
│   └── date: now()
```

---

## 3. PRISMA SCHEMA CROSS-CHECK

### Product Model

```prisma
model Product {
  id              String    @id @default(cuid())
  name            String    ← productGroupName
  brand           String?   ← brand (nullable)
  hsnCode         String?   ← hsnCode (nullable)
  gstRate         Float     ← gstRate
  baseUnit        String    ← baseUnit
  purchaseUnit    String?   ← purchaseUnit (nullable)
  conversionRatio Float?    @default(1)  ← conversionRatio
  categoryId      String    ← resolved from categoryL1/L2/L3
  isArchived      Boolean   @default(false)  ← NOT SET by import
  category        Category  @relation(...)
  variants        Variant[]
  outletId        String
  outlet          Outlet    @relation(...)
  @@unique([name, outletId])  ← Ensures product uniqueness per outlet
}
```

✅ **Mapping Match**: All import fields map correctly to Product schema.

### Variant Model

```prisma
model Variant {
  id               String      @id @default(cuid())
  productId        String      ← product.id
  sku              String      ← variantSku
  specifications   Json?       ← { detail: variantSpec }
  purchasePrice    Float       ← purchasePrice
  sellingPrice     Float       ← calculated or from input
  pricingMethod    String      @default("MANUAL")  ← pricingMethod
  markupPercent    Float?      ← markupPercent
  minStockLevel    Float       @default(0)  ← minStockLevel
  priceListEntries PriceListEntry[]
  stocks           Stock[]
  txnItems         TransactionItem[]
  batches          CustomBatch[]
  stockLedger      StockLedger[]
  product          Product     @relation(...)
  suppliers        VendorProduct[]
  @@unique([sku])             ← Global SKU uniqueness
}
```

✅ **Mapping Match**: All import fields map correctly to Variant schema.

### Stock Movement (Transaction + TransactionItem)

```prisma
model Transaction {
  type             TxType     ← "STOCK_ADJUSTMENT"
  txnNumber        String     ← auto-generated
  outletId         String     ← from options
  fromLocationId   String?    ← warehouseId
  userId           String     ← from options
  status           String     @default("DRAFT")  ← set to "COMPLETED"
  remarks          String?    ← "OPENING_IMPORT"
}

model TransactionItem {
  variantId        String     ← variant.id
  quantity         Float      ← currentStock
  rate             Float      ← purchasePrice
  taxableValue     Float      ← purchasePrice * currentStock
}
```

✅ **Mapping Match**: Stock management fields properly utilize Transaction/TransactionItem models.

### Batch Tracking (CustomBatch)

```prisma
model CustomBatch {
  batchNumber      String     @unique  ← "${sku}-${date}-${random}"
  variantId        String     ← variant.id
  warehouseId      String     ← warehouse.id
  outletId         String     ← from options
  receivedDate     DateTime   ← batchDate (parsed DD/MM/YYYY)
  quantityReceived Float      ← currentStock
  costPerUnit      Float      ← batchCostPerUnit OR purchasePrice
}

model StockLedger {
  variantId        String     ← variant.id
  warehouseId      String     ← warehouse.id
  outletId         String     ← from options
  transactionId    String     ← transaction.id
  quantity         Float      ← currentStock (net movement)
  type             String     ← "ADJUSTMENT_INC"
  userId           String     ← from options
}
```

✅ **Mapping Match**: Batch tracking properly uses CustomBatch and StockLedger models.

---

## 4. VALIDATION RULES & CONSTRAINTS

| Rule # | Field(s)                  | Condition                                                        | Action                                          | Priority     |
| ------ | ------------------------- | ---------------------------------------------------------------- | ----------------------------------------------- | ------------ |
| R1     | productGroupName          | Must be provided                                                 | REJECT if empty                                 | 🔴 ERROR     |
| R2     | gstRate                   | Must match: 0, 0.25, 3, 5, 12, 18, 28                            | REJECT if not in list                           | 🔴 ERROR     |
| R3     | baseUnit                  | Must be provided                                                 | REJECT if empty                                 | 🔴 ERROR     |
| R4     | categoryL1                | Must be provided                                                 | REJECT if empty                                 | 🔴 ERROR     |
| R5     | variantSku                | Must be provided & unique                                        | REJECT if empty or duplicate in sheet           | 🔴 ERROR     |
| R6     | purchasePrice             | Must be provided & ≥ 0                                          | REJECT if < 0                                   | 🔴 ERROR     |
| R7     | pricingMethod             | Must be "MANUAL" or "MARKUP"                                     | REJECT if invalid                               | 🔴 ERROR     |
| R8     | sellingPrice              | Required if pricingMethod="MANUAL"                               | REJECT if MANUAL without price                  | 🔴 ERROR     |
| R9     | markupPercent             | Required if pricingMethod="MARKUP"; 0-100                        | REJECT if MARKUP without percent                | 🔴 ERROR     |
| R10    | warehouseName             | Required if currentStock > 0                                     | REJECT if stock without warehouse               | 🔴 ERROR     |
| R11    | batchDate                 | Required if batchTrackingEnabled AND currentStock > 0            | REJECT if batch tracking enabled without date   | 🔴 ERROR     |
| R12    | conversionRatio           | Must be > 1 if purchaseUnit ≠ baseUnit                          | REJECT if ratio ≤ 1 with different units       | 🔴 ERROR     |
| R13    | Product-Level Fields      | All variants of same product must match                          | REJECT if inconsistent across variants          | 🔴 ERROR     |
| R14    | SKU Reassignment          | SKU cannot exist under different product                         | REJECT if SKU already assigned to other product | 🔴 ERROR     |
| R15    | Opening Stock Idempotency | Cannot create duplicate opening stock for same variant+warehouse | SKIP if already exists (warning)                | ⚠️ WARNING |

---

## 5. ISSUES & GAPS FOUND

### ❌ CRITICAL ISSUES

**Issue #1: CSV Header Format Mismatch**

- **Problem**: CSV headers use spaces (Normal Casing) but import logic expects camelCase field names
- **Example**: CSV has "Product Group Name" but import parses as `productGroupName`
- **Impact**: Data won't be parsed correctly unless CSV is converted to camelCase before upload
- **Solution**: Need CSV header normalization layer OR frontend parser to convert headers

**Issue #2: Missing Outlet Context in Validation**

- **Problem**: batchDate validation requires `outlet.batchTrackingEnabled` flag, but this is context-dependent validation
- **Impact**: Schema validation doesn't catch this; only caught at import-logic stage
- **Solution**: ✅ Already handled correctly in import-logic.ts (dynamic validation at line 232)

**Issue #3: Row Index Tracking**

- **Problem**: Error messages use `row: 0` instead of actual row number from import
- **Impact**: Users can't identify which rows failed in their import file
- **Solution**: Track row index throughout validation process and pass to errors

---

### ⚠️ LOGICAL ISSUES

**Issue #4: Selling Price Calculation Logic**

- **Problem**: Line 266-273 calculates sellingPrice with `?? 0` fallback
- **Risk**: If pricingMethod="MANUAL" and no sellingPrice, defaults to 0 (loss-making)
- **Current**: Validation at schema level prevents this, but defensive code uses fallback
- **Status**: ✅ Safe because schema-level validation catches it first

**Issue #5: Batch Date Format Parsing**

- **Problem**: Line 392 assumes DD/MM/YYYY format: `.split("/").reverse().join("-")`
- **Risk**: Accepts dates like "31/02/2026" without validation
- **Solution**: Add date validity check (day range 1-31, month 1-12, valid leap year)

**Issue #6: Warehouse Lookup with Outlet Filter**

- **Problem**: Line 318 filters warehouses by `outlets: { some: { id: outletId } }`
- **Risk**: Could create warehouse without outlet connection if outlet not linked properly
- **Solution**: ✅ Correctly handled by connecting at create time

---

### 📋 MISSING/UNUSED FIELDS

**Field: Product.isArchived**

- **Status**: Not set by import logic (defaults to false)
- **Question**: Should import allow setting archived status? Currently NO
- **Recommendation**: Add optional column for this

**Field: Variant.priceListEntries**

- **Status**: Not used by import
- **Question**: Should import support price list assignments? Currently NO
- **Recommendation**: Consider for future phase

**Field: Party.priceListId**

- **Status**: Not used by import
- **Question**: Should import link products to customer price lists? Currently NO
- **Recommendation**: Consider for future phase

---

## 6. CHANGES NEEDED - ACTION PLAN

### Priority 1: CRITICAL (Fix immediately)

```
1. Add CSV Header Normalization
   └─ Convert "Product Group Name" → "productGroupName" during upload parsing
   └─ Create mapping layer OR update import endpoint to handle both formats

2. Row Index Tracking
   └─ Pass row number through validation pipeline
   └─ Use actual row index in error messages (not just 0)
   └─ Example: "Row 5: Invalid GST Rate"

3. Batch Date Validation
   └─ Add proper date parsing and validation
   └─ Validate day (1-31), month (1-12), year, leap years
   └─ Show error message with expected format
```

### Priority 2: HIGH (Fix within sprint)

```
4. Add Row Index to ImportRow Type
   └─ Extend ImportRow schema to include original row number
   └─ Track through all validation steps

5. Improve Error Messages
   └─ Show which specific rule failed (R1, R2, etc.)
   └─ Provide example of correct format
   └─ Suggest fix action

6. Add Optional Field: isArchived
   └─ Add to CSV header (optional)
   └─ Add to import schema (optional)
   └─ Allow users to import archived products

7. Add Batch Date Format Validation
   └─ Check date exists and is valid
   └─ Handle leap years, month-end dates
   └─ Clear error message if invalid
```

### Priority 3: MEDIUM (Nice to have)

```
8. Add Progress Tracking with Row Numbers
   └─ Show: "Processing row 45 of 100"
   └─ Allow error recovery mode

9. Add Dry-Run Mode
   └─ Validate all rows without importing
   └─ Show all errors upfront
   └─ Allow user to fix and retry

10. Add Bulk Category Creation
    └─ Auto-create missing category hierarchies
    └─ Show created categories in import summary

11. Add Warehouse Pre-population
    └─ Allow users to provide warehouse list upfront
    └─ Avoid repeated lookups
```

---

## 7. SUMMARY TABLE: CSV COLUMN → DATABASE FIELD MAPPING

| CSV Column          | Import Field     | Zod Type | DB Model    | DB Field        | Transformation    | Notes                              |
| ------------------- | ---------------- | -------- | ----------- | --------------- | ----------------- | ---------------------------------- |
| Product Group Name  | productGroupName | string   | Product     | name            | Identity          | Case-insensitive lookup            |
| Brand               | brand            | string?  | Product     | brand           | Nullable          | Direct assignment                  |
| HSN Code            | hsnCode          | string?  | Product     | hsnCode         | Nullable          | Direct assignment                  |
| GST Rate            | gstRate          | number   | Product     | gstRate         | Identity          | Validated against slab             |
| Base Unit           | baseUnit         | string   | Product     | baseUnit        | Identity          | Direct assignment                  |
| Purchase Unit       | purchaseUnit     | string?  | Product     | purchaseUnit    | Nullable          | Direct assignment                  |
| Conversion Ratio    | conversionRatio  | number   | Product     | conversionRatio | Default 1         | Direct assignment                  |
| Category L1         | categoryL1       | string   | Category    | name            | Hierarchical      | Creates parent category            |
| Category L2         | categoryL2       | string?  | Category    | name            | Hierarchical      | Creates mid category               |
| Category L3         | categoryL3       | string?  | Category    | name            | Hierarchical      | Creates leaf category + returns ID |
| Variant SKU         | variantSku       | string   | Variant     | sku             | Identity          | Globally unique                    |
| Variant Spec        | variantSpec      | string?  | Variant     | specifications  | JSON              | Wrapped: {detail: value}           |
| Purchase Price      | purchasePrice    | number   | Variant     | purchasePrice   | Identity          | Direct assignment                  |
| Selling Price       | sellingPrice     | number?  | Variant     | sellingPrice    | Conditional       | Calculated if MARKUP               |
| Pricing Method      | pricingMethod    | enum     | Variant     | pricingMethod   | Identity          | "MANUAL" or "MARKUP"               |
| Markup Percent      | markupPercent    | number?  | Variant     | markupPercent   | Nullable          | Used for calculation               |
| Min Stock Level     | minStockLevel    | number   | Variant     | minStockLevel   | Default 0         | Direct assignment                  |
| Warehouse Name      | warehouseName    | string?  | Warehouse   | name            | Lookup/Create     | Case-insensitive                   |
| Current Stock       | currentStock     | number   | Transaction | -               | Creates txn item  | Triggers stock ledger              |
| Batch Date          | batchDate        | string?  | CustomBatch | receivedDate    | Parsed DD/MM/YYYY | If batch tracking enabled          |
| Batch Cost Per Unit | batchCostPerUnit | number?  | CustomBatch | costPerUnit     | Fallback          | Defaults to purchasePrice          |

---

## 8. CONCLUSION

✅ **Overall Assessment**: Import logic is **well-structured** and handles complex product-variant-stock relationships correctly.

**Key Strengths**:

- Proper 3-level category hierarchy handling
- Robust idempotency checks (SKU uniqueness, opening stock prevention)
- Dynamic validation based on outlet config
- Transaction-based consistency
- Batch tracking support

**Key Weaknesses**:

- ❌ CSV header format mismatch (normal casing vs camelCase)
- ⚠️ Row index not tracked through validation
- ⚠️ Batch date format validation too lenient
- ⚠️ Missing optional fields (isArchived)

**Recommended Priority**: Fix header normalization first, then improve error messages with row indices.
