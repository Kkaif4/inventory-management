# 🔧 IMPORT LOGIC IMPLEMENTATION PLAN

## Overview

Implement 6 focused fixes to the product import system to handle normal-casing headers, improve error tracking, validate batch dates, and simplify schema.

**Status**: Ready for implementation
**Affected Files**: 5 files
**Lines of Code**: ~150 new lines + modifications

---

## ISSUE #1: Normal Casing Headers (Product Group Name → productGroupName)

### Current State

- Sheet uses normal casing: "Product Group Name", "GST Rate", etc.
- Code expects camelCase: `productGroupName`, `gstRate`
- **Problem**: Data won't parse unless user converts headers to camelCase

### Solution

Add header normalization layer that maps normal-casing headers to internal camelCase field names.

### Files to Modify

1. `src/actions/products/import-logic.ts`

### Changes Required

#### 1A. Add FIELD_KEYS constant (reference/documentation)

```typescript
// Add at top of import-logic.ts after imports:

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
```

#### 1B. Add HEADER_TO_FIELD mapping

```typescript
// Add after FIELD_KEYS:

const HEADER_TO_FIELD: Record<string, string> = {
  "product group name": "productGroupName",
  "brand": "brand",
```
