# Implementation Checklist - Outlet-Scoped Data Fetching

**Start Date**: [To be filled]
**Expected Completion**: [To be filled]
**Owner**: [To be assigned]

---

## Phase 1: Backend Infrastructure (Days 1-2)

### [ ] Utility Functions

- [ ] Create `src/lib/outlet-auth.ts`

  ```typescript
  export async function validateOutletAccess(userId: string, outletId: string);
  export async function getCurrentUserOutlets(userId: string);
  export async function getSessionUserOutlets(session);
  ```

- [ ] Create `src/hooks/use-outlet.ts`

  ```typescript
  export function useOutlet();
  ```

- [ ] Update `src/lib/auth.ts`
  - [ ] Ensure session includes `availableOutlets`
  - [ ] Ensure JWT callback populates outlets

---

## Phase 2: Server Actions - Parties (Day 2-3)

### `src/actions/parties/index.ts`

- [ ] Update `getParties(outletId: string)`
  - [ ] Add `outletId` parameter
  - [ ] Add `await validateOutletAccess()`
  - [ ] Add `where: { outletId }`
  - [ ] Test: Returns only outlet-scoped parties

- [ ] Update `getVendorsByProduct(variantId: string, outletId: string)`
  - [ ] Add `outletId` parameter
  - [ ] Add authorization check
  - [ ] Filter by outletId

- [ ] Update `createParty(data, outletId: string)`
  - [ ] Add `outletId` to data
  - [ ] Validate authorization
  - [ ] Create with outletId

- [ ] Update `getVendorMetrics(outletId: string)`
  - [ ] Add parameter and filter

- [ ] Update `linkProductToVendor(variantId, vendorId, outletId)`
  - [ ] Validate vendor belongs to outlet
  - [ ] Validate product belongs to outlet

---

## Phase 3: Server Actions - Sales (Day 3-4)

### `src/actions/sales/quotations.ts`

- [ ] Update `getQuotations(outletId: string)`
  - [ ] Add parameter
  - [ ] Add `where: { outletId, type: "QUOTATION" }`
  - [ ] Test: Only returns quotations for selected outlet

- [ ] Update `createQuotation(data, outletId: string)`
  - [ ] Add outletId to transaction
  - [ ] Validate party belongs to outlet
  - [ ] Validate variants belong to outlet

- [ ] Update `getCustomers(outletId: string)`
  - [ ] Add parameter and filter

### `src/actions/sales/quotation.ts`

- [ ] Update `getQuotationById(id: string, outletId: string)`
  - [ ] Verify quotation belongs to outlet before returning

- [ ] Update `createQuotation()` - duplicate check if needed

- [ ] Update `getSalesInvoices(outletId: string)` if exists
  - [ ] Filter by outletId, type: "SALES_INVOICE"

### `src/actions/sales/sales-invoice.ts` (if exists)

- [ ] Update `getSalesInvoices(outletId: string)`
- [ ] Update `createSalesInvoice(data, outletId: string)`
- [ ] Update `getSalesInvoiceById(id, outletId: string)`

---

## Phase 4: Server Actions - Inventory (Day 4-5)

### `src/actions/inventory/index.ts`

- [ ] Update `getCurrentStock(outletId: string)`
  - [ ] Add parameter
  - [ ] Add `where: { outletId }`
  - [ ] Return stock only for selected outlet

- [ ] Update `getVariantsForSelection(outletId: string)`
  - [ ] Filter variants by outlet
  - [ ] Only show products in selected outlet

- [ ] Update `getInventoryLocations(outletId: string)`
  - [ ] Filter warehouses assigned to outlet
  - [ ] Show only relevant locations

- [ ] Update `createStockAdjustment(data, outletId: string)`
  - [ ] Validate outlet context
  - [ ] Ensure stock belongs to outlet
  - [ ] Create adjustment with outletId

- [ ] Update `createStockTransfer(data, outletId: string)`
  - [ ] Validate both from/to locations in outlet
  - [ ] Validate stock belongs to outlet

---

## Phase 5: Server Actions - Procurement (Day 5)

### `src/actions/procurement/index.ts`

- [ ] Update `getPurchaseOrders(outletId: string)`
  - [ ] Filter by outletId and type: "PURCHASE_ORDER"

- [ ] Update `createPurchaseOrder(data, outletId: string)`
  - [ ] Add outletId to transaction
  - [ ] Validate vendor accessible to outlet
  - [ ] Validate warehouse belongs to outlet

- [ ] Update `getGRNs(outletId: string)`
  - [ ] Filter by outletId

- [ ] Update `getBills(outletId: string)`
  - [ ] Filter by outletId

- [ ] Update `createPurchaseBill(data, outletId: string)`
  - [ ] Add outletId
  - [ ] Verify GRN belongs to outlet

- [ ] Update `getPurchaseOrderById(id, outletId: string)`
  - [ ] Verify PO belongs to outlet

---

## Phase 6: Server Actions - Reports & Accounting (Day 5-6)

### `src/actions/reports/index.ts`

- [ ] Update `getInventoryReport(outletId: string)`
  - [ ] Filter by outletId

- [ ] Update `getSalesReport(outletId: string, dateRange)`
  - [ ] Filter by outletId and date

- [ ] Update `getProcurementReport(outletId: string, dateRange)`
  - [ ] Filter by outletId

- [ ] Update any other report functions
  - [ ] All with outletId filter

### `src/actions/accounting/index.ts`

- [ ] Update `getPartyLedger(partyId, outletId: string)`
  - [ ] Validate party belongs to outlet
  - [ ] Return only outlet-scoped transactions

- [ ] Update `getAccountingReport(outletId: string)`
  - [ ] Filter by outletId

---

## Phase 7: Server Actions - Dashboard (Day 6)

### `src/actions/dashboard.ts`

- [ ] Update `getDashboardMetrics(outletId: string)`
  - [ ] All metrics filtered by outletId
  - [ ] KPIs specific to selected outlet

- [ ] Update `getDashboardCharts(outletId: string)`
  - [ ] Chart data filtered by outletId

---

## Phase 8: Frontend - OutletSwitcher (Day 6-7)

### `src/components/ui/outlet-switcher.tsx`

- [ ] Import Zustand store

  ```typescript
  import { useOutletStore } from "@/store/use-outlet-store";
  ```

- [ ] Connect to store
  - [ ] Get `currentOutletId`, `availableOutlets`, `setOutlet` from store
  - [ ] Remove hardcoded outlet list

- [ ] Implement outlet switching

  ```typescript
  const handleOutletChange = (outletId: string) => {
    setOutlet(outletId);
    // TODO: Invalidate queries here
  };
  ```

- [ ] Update UI to show current outlet
  - [ ] Display `currentOutlet.name`
  - [ ] Show available outlets in dropdown

- [ ] Handle edge cases
  - [ ] No outlets available
  - [ ] Only one outlet (hide switcher or show info)
  - [ ] Loading state while switching

- [ ] Test: Outlet changes persist to localStorage

---

## Phase 9: Frontend - Component Updates (Day 7-8)

### All Data-Fetching Components

#### Dashboard Pages

- [ ] `src/app/dashboard/page.tsx` (Dashboard home)
  - [ ] Get outletId from store
  - [ ] Pass to getDashboardMetrics()

- [ ] `src/app/dashboard/sales/**` pages
  - [ ] `quotations/page.tsx` → pass outletId to getQuotations()
  - [ ] `sales-invoice/page.tsx` → pass outletId to getSalesInvoices()
  - [ ] `challans/page.tsx` → add outlet filter if applicable
  - [ ] All client pages: extract outletId before fetching

- [ ] `src/app/dashboard/inventory/**` pages
  - [ ] `page.tsx` → pass outletId to getCurrentStock()
  - [ ] Add outlet-specific stock levels

- [ ] `src/app/dashboard/purchases/**` pages
  - [ ] `requests/page.tsx` → filter by outletId
  - [ ] `orders/page.tsx` → filter by outletId
  - [ ] `bills/page.tsx` → filter by outletId

- [ ] `src/app/dashboard/accounts/**` pages
  - [ ] `ledger/page.tsx` → filter by outletId

- [ ] `src/app/dashboard/reports/**` pages
  - [ ] All report pages filter by outletId

- [ ] `src/app/dashboard/master-data/**` pages
  - [ ] `categories/page.tsx` → filter by outletId
  - [ ] `products/page.tsx` → filter by outletId
  - [ ] `parties/page.tsx` → filter by outletId

#### Client Components

- [ ] Update all `*-client.tsx` components that call server actions
  - [ ] Add useOutlet() hook usage
  - [ ] Handle "outlet not selected" error
  - [ ] Show OutletRequired boundary if needed

---

## Phase 10: Error Handling (Day 8)

### Error Boundaries

- [ ] Create `src/components/outlet-required.tsx`

  ```typescript
  export function OutletRequired({ children }) {
    // Show message if outlet not selected
    // Show error if no outlets available
  }
  ```

- [ ] Wrap dashboard content with OutletRequired

### Error Messages

- [ ] Add user-friendly error messages
  - [ ] "Please select an outlet"
  - [ ] "You don't have access to this outlet"
  - [ ] "No outlets assigned to your account"

- [ ] Log authorization failures for auditing

---

## Phase 11: Database Indexing (Day 8-9)

### Prisma Schema

- [ ] Add indexes to schema.prisma

  ```prisma
  model Party {
    @@index([outletId])
    @@index([outletId, type])
  }

  model Stock {
    @@index([outletId, variantId])
    @@index([outletId, warehouseId])
  }

  model Transaction {
    @@index([outletId, date(sort: Desc)])
    @@index([outletId, type])
  }

  model Product {
    @@index([outletId])
  }

  model Category {
    @@index([outletId])
  }
  ```

- [ ] Create migration

  ```bash
  npx prisma migrate dev --name add_outlet_indexes
  ```

- [ ] Test index creation in staging

---

## Phase 12: Testing (Day 9-10)

### Unit Tests

- [ ] Test `validateOutletAccess()` function
  - [ ] User with outlet access → returns true
  - [ ] User without access → throws error
  - [ ] Non-existent outlet → throws error

- [ ] Test each server action with outletId
  - [ ] Returns only data for outlet
  - [ ] Throws 403 for unauthorized outlet
  - [ ] Creates data with outletId
  - [ ] Updates/deletes only outlet's data

### Integration Tests

- [ ] Full flow: Login → Select Outlet → See Scoped Data
  - [ ] User logs in with multiple outlets
  - [ ] Select outlet 1 → see outlet 1 data
  - [ ] Switch to outlet 2 → see outlet 2 data
  - [ ] Verify old data is replaced, not merged

- [ ] Cross-outlet boundary test
  - [ ] User from outlet A cannot see outlet B data
  - [ ] Returns 403 for direct access
  - [ ] No leakage in reports

### E2E Tests

- [ ] User journey per outlet
  - [ ] Create party in outlet 1
  - [ ] Switch to outlet 2
  - [ ] Party not visible in outlet 2
  - [ ] Switch back to outlet 1
  - [ ] Party visible again

### Test Coverage Target

- [ ] Authorization: 100%
- [ ] Outlet filtering: 100%
- [ ] Happy path: 95%+
- [ ] Error cases: 90%+

---

## Phase 13: Monitoring & Verification (Day 10)

### Staging Environment

- [ ] Test with production-like data
- [ ] Monitor query performance
- [ ] Check error rates
- [ ] Verify indexes are being used

### Metrics to Monitor

- [ ] Query latency: Should be <100ms with indexes
- [ ] 403 error rate: Should be minimal after stabilization
- [ ] Cross-outlet data access attempts: Should be 0
- [ ] Outlet selection changes: Monitor user behavior

### Pre-Production Checklist

- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] Query performance acceptable
- [ ] Outlet switching works smoothly
- [ ] No data leakage detected
- [ ] All edge cases handled

---

## Phase 14: Production Deployment (Day 11)

### Pre-Deploy

- [ ] Database backup
- [ ] Rollback plan prepared
- [ ] Team on standby
- [ ] Monitoring dashboards ready

### Deployment Steps

1. [ ] Deploy database indexes (migration)
2. [ ] Wait for index creation to complete
3. [ ] Deploy backend changes
4. [ ] Monitor error rates for 5 minutes
5. [ ] Deploy frontend changes
6. [ ] Monitor user behavior
7. [ ] Celebrate! 🎉

### Post-Deploy

- [ ] Monitor logs for errors
- [ ] Check query performance
- [ ] Verify no data leakage
- [ ] Gather user feedback
- [ ] Document issues found
- [ ] Plan follow-up improvements

---

## Rollback Plan

If critical issue found:

- [ ] Identify the issue (query failing, data leaking, etc.)
- [ ] Stop deployments immediately
- [ ] Revert frontend changes
- [ ] Keep backend if backward-compatible
- [ ] Verify system stability
- [ ] Schedule post-mortem

---

## Sign-Off

### Before Implementation Start

- [ ] Backend Lead: ********\_******** Date: **\_\_\_**
- [ ] Frontend Lead: ******\_\_\_\_****** Date: **\_\_\_**
- [ ] Database Admin: ******\_\_\_****** Date: **\_\_\_**
- [ ] Product Owner: ******\_\_\_\_****** Date: **\_\_\_**

### After Each Phase

- [ ] Phase Complete: Yes / No
- [ ] Issues Found: ******\_\_\_\_******
- [ ] Ready for Next Phase: Yes / No
- [ ] Reviewed By: ********\_********

### Final Sign-Off (Production Ready)

- [ ] QA Verification: ******\_\_****** Date: **\_\_\_**
- [ ] DevOps Approval: ******\_\_****** Date: **\_\_\_**
- [ ] Product Sign-Off: ******\_****** Date: **\_\_\_**
- [ ] Ready to Deploy: ✓ / ✗

---

**Document Version**: 1.0
**Last Updated**: March 10, 2026
**Status**: Ready for Team Review
