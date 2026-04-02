# Old Bill Mode — Implementation Plan

## Context

Users have physical record books with historical bills to enter into the system. The feature adds a third bill mode ("OLD") to the **existing** invoice UI — no separate page or form. Historical dates are critical: bill date, payment dates must flow through to the **ledger entries** correctly — not `createdAt`/system timestamps, but the actual historical dates the user enters.

**Key design rule for OLD bills:**
- **YES** `LedgerEntry` records created → party ledger, outstanding balance, account statements all reflect historical data
- **YES** `outstandingBalance` updated on Party → denormalized cache correctly reflects historical debts
- **YES** `OldBillPayment` amounts reduce outstanding via ledger entries (Debit Cash/Bank, Credit Sundry Debtors)
- **NO** Stock/Inventory updates → no physical inventory to deduct for historical bills
- **NO** Tax entries → OLD bills record a lump-sum total, no GST breakdown
- **YES** Sales/Revenue Registers & P&L → included for historical dates to provide a complete digital history within the system

**Already implemented (reuse):**
- `Attachment` model + `migrateAttachments()` — reuse as-is
- `lookupCustomerByPhone()` — extend to return multiple matches

---

## 1. Database Schema Changes

**File: `prisma/schema.prisma`**

### 1a. `BillType` enum — add `OLD`
```prisma
enum BillType { NO1  NO2  OLD }
```

### 1b. `Transaction` — add `customBillNo`
```prisma
customBillNo   String?    // Optional user-supplied bill number from physical book
```

### 1c. `TransactionItem` — nullable `variantId` + `itemDescription`
```prisma
model TransactionItem {
  variantId       String?   // null for OLD bill freeform items
  itemDescription String?   // freeform description for OLD bill items
  variant         Variant?  @relation(fields: [variantId], references: [id])
}
```

### 1d. New `OldBillPayment` model
```prisma
model OldBillPayment {
  id            String      @id @default(cuid())
  transactionId String
  amount        Float
  paymentDate   DateTime    // Historical date from book — shown in ledger
  note          String?
  createdAt     DateTime    @default(now())  // System audit only, never shown
  updatedAt     DateTime    @updatedAt
  transaction   Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  @@index([transactionId])
}
```

Reverse relation on Transaction: `oldBillPayments OldBillPayment[]`

> `paymentDate` = historical date user enters. `createdAt` = system timestamp. Ledger always shows `paymentDate`.

### 1e. Migration
```bash
npx prisma migrate dev --name add_old_bill_mode && npx prisma generate
```

---

## 2. Validation Schema

**File: `src/validations/invoice.validation.ts`**

```ts
const oldBillPaymentSchema = z.object({
  amount: z.number().min(0.01),
  paymentDate: z.coerce.date(),
  note: z.string().optional(),
});

export const createOldBillSchema = z.object({
  billType: z.literal("OLD"),
  fromOutletId: z.string().min(1),
  customBillNo: z.string().optional(),       // Optional — auto-generated if blank
  date: z.coerce.date(),                     // Historical bill date
  buyerName: z.string().min(1, "Customer name is required"),
  buyerPhone: z.string().optional(),         // Reference only, NOT a unique key
  partyId: z.string().optional(),            // Set after user picks/creates customer
  grandTotal: z.number().min(0.01, "Total must be > 0"),
  items: z.array(z.object({
    itemDescription: z.string().min(1),
    quantity: z.number().min(0.01),
    rate: z.number().min(0),
  })).optional(),
  payments: z.array(oldBillPaymentSchema).default([]),
  remarks: z.string().optional(),
}).superRefine((data, ctx) => {
  const totalPaid = data.payments.reduce((s, p) => s + p.amount, 0);
  if (totalPaid > data.grandTotal + 0.005) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Payments exceed total", path: ["payments"] });
  }
});
export type OldBillFormValues = z.infer<typeof createOldBillSchema>;
```

---

## 3. Server Action

**File: `src/actions/sales/old-bill.ts`**

### txnNumber strategy
- `customBillNo` provided → `txnNumber = "OLD/" + customBillNo.trim()`
- `customBillNo` blank → `NumberingService.getNextNumber(outletId, "OLD_BILL", fy)` → `OLD/2024-25/0001`

Add `OLD_BILL: "OLD"` prefix to `src/domains/foundation/numbering-service.ts`.

### `createOldBill(data)` — inside `prisma.$transaction`
1. `validateSessionOutletAccess(fromOutletId)`
2. If `partyId` absent: `tx.party.create({ type:"CUSTOMER", name:buyerName, phone:buyerPhone, address:"—", state:"—", outstandingBalance:0, creditPeriod:0 })`
3. `totalPaid = sum(payments[].amount)`
4. `balance = grandTotal - totalPaid`
5. Status: `totalPaid===0` → POSTED | `totalPaid>=grandTotal-0.005` → PAID + `paidAt=payments[last].paymentDate` | else → PARTIALLY_PAID
6. Build `txnNumber` (catch P2002 → friendly error)
7. Fetch GL accounts: `1003` (Sundry Debtors), `3001` (Sales), `1001` (Cash in Hand)
8. `tx.transaction.create`:
   - `type:"SALES_INVOICE"`, `billType:"OLD"`, `isInformal:true`
   - `txnNumber`, `customBillNo?`, `date` (historical), `partyId`, `outletId`, `userId`
   - `grandTotal`, `totalTaxable:grandTotal`, `totalTax:0`, `freightCost:0`, `status`, `paidAt`
   - `items.createMany` → `{ variantId:null, itemDescription, quantity, rate, taxableValue:qty*rate, cgst:0, sgst:0, igst:0 }`
   - `oldBillPayments.createMany` → payment rows with historical `paymentDate`
9. **Ledger Entry — Invoice** (double-entry for the sale, dated = `data.date`):
   ```
   Debit  Sundry Debtors (1003)  → grandTotal   (receivable created)
   Credit Sales Account  (3001)  → grandTotal   (revenue recognized)
   ```
   `AccountingService.postJournalEntry(tx, { transactionId, partyId, date: data.date, entries })`
   → `date` is the historical bill date, NOT today's date
10. **Ledger Entries — Each Payment** (reduce receivable, dated = `payment.paymentDate`):
    For each `oldBillPayment`:
    ```
    Debit  Cash in Hand (1001)     → payment.amount
    Credit Sundry Debtors (1003)   → payment.amount
    ```
    Each payment posts its own journal entry against the same `transactionId` with `partyId`.
11. **Update `outstandingBalance`** on Party:
    `tx.party.update({ where: { id: partyId }, data: { outstandingBalance: { increment: balance } } })`
    (balance = grandTotal - totalPaid, i.e. only the unpaid portion increases outstanding)
12. **NO** `StockService` — no inventory to deduct for historical bills
13. `migrateAttachments("TEMP:" + txnNumber, createdTransaction.id)`
14. `revalidatePath("/dashboard/sales/invoices")`

---

## 4. Report & Query Filter Updates

### Why this is needed
OLD bills have **past dates** and produce **real ledger entries**. Without filters on revenue/expense reports, they would appear inside date-range queries and distort financial totals for the period they were entered in. However, OLD bills **should** appear in party ledgers, outstanding reports, and account statements — that's the whole point of digitization.

### Queries to add `billType: { not: "OLD" }` filter

| File | Function | Risk | Fix |
|------|----------|------|-----|
| `src/actions/reports/sales.ts` | `getSalesRegisterReport()` | **INCLUDED** — historical sales are part of the digitized history | NO filter needed |
| `src/actions/reports/pnl.ts` | P&L queries | **INCLUDED** — historical revenue is reflected via ledger entries on historical dates | NO filter needed |
| `src/actions/dashboard.ts` | `getDashboardStats()` (today's sales aggregate) | LOW — already date-filtered to today | Historical dates auto-excluded; no change needed |

### Queries where OLD bills are intentionally INCLUDED

| File | Function | Reason |
|------|----------|--------|
| `src/actions/sales/sales-invoice.ts` | `getSalesInvoices()`, `getSalesInvoicesPaginated()` | Invoice list shows OLD bills with badge |
| `src/actions/accounting/index.ts` | `getPartyLedger()` | **Must show** — OLD bills appear in party ledger with historical dates |
| `src/actions/accounting/index.ts` | `getAccountStatement()` | **Must show** — OLD bill entries visible in account statements |
| `src/actions/reports/outstanding.ts` | `getCustomerOutstandingReport()` | **Must show** — outstanding balance includes OLD bills |
| `src/actions/sales/customers.ts` | Customer outstanding display | **Must show** — denormalized `outstandingBalance` already includes it |
| `src/actions/parties/index.ts` | `getPartiesWithBalances()` | **Must show** — balances from ledger include OLD entries |
| `Party.outstandingBalance` | Denormalized cache | **Updated** for OLD bills — reflects historical debts |

### Exact filter to add (only for period-based revenue reports)
```ts
billType: { not: "OLD" }
// OR if using prisma's enum type:
billType: { not: BillType.OLD }
```

---

## 5. Customer Lookup — Multi-Match Support

Phone is NOT unique — multiple customers can share a phone number.

**`src/actions/parties/index.ts`** — modify to return array:
```ts
export async function searchCustomersByPhone(outletId: string, phone: string): Promise<Party[]>
// findMany where phone contains the entered digits
```

**UI flow in `pos-invoice-header.tsx`:**
```
User types phone (optional):
  ├── 0 results → "No match" + "Create Customer" button
  ├── 1 result  → auto-select, green badge "Found: {name}"
  └── 2+ results → dropdown list to pick + "Create new" at bottom
```

**"Create Customer" dialog** — minimal fields: Name (required), Phone (pre-filled), State:
```ts
// Add to src/actions/sales/customers.ts:
export async function createMinimalCustomer(
  outletId: string,
  data: { name: string; phone?: string; state?: string }
)
// Creates Party: type=CUSTOMER, address="—", state=data.state??"—"
```

---

## 6. Extend Existing Invoice UI

### 6a. `pos-invoice-header.tsx`

**Add OLD as 3rd button:**
```tsx
<Button
  onClick={() => { form.setValue("billType","OLD"); form.setValue("partyId",""); }}
  className={billType==="OLD" ? "bg-purple-700 text-white" : ""}
  disabled={items.length > 0}
>OLD</Button>
```

**Custom bill number (optional, OLD mode only):**
```tsx
{billType === "OLD" && (
  <Input placeholder="Bill # (optional)" {...form.register("customBillNo")} className="w-40 font-mono" />
)}
```

**Invoice number preview:** Show `customBillNo || "Auto"` in OLD mode; skip `peekNextInvoiceNumber` API call.

**Customer lookup:** multi-match flow (§5) with create dialog on not-found.

### 6b. `pos-invoice-table.tsx`

Freeform item rows in OLD mode:
```tsx
{billType === "OLD"
  ? <Input placeholder="Item description" {...form.register(`items.${i}.itemDescription`)} />
  : <ProductSearchPopover ... />
}
```
No HSN, tax, or unit fields shown for OLD mode rows.

### 6c. `pos-invoice-footer.tsx`

**Grand total** — user-editable in OLD mode:
```tsx
{billType === "OLD"
  ? <Input type="number" {...form.register("grandTotal", { valueAsNumber: true })} className="w-32 text-right" />
  : <span>₹{grandTotal.toFixed(2)}</span>
}
```

**Payments section** (OLD mode only, `useFieldArray({ name: "payments" })`):
```tsx
{billType === "OLD" && (
  <>
    <div className="flex justify-between"><span>Payments from book</span>
      <Button size="sm" onClick={() => appendPayment(...)}>+ Add Payment</Button>
    </div>
    {paymentFields.map((f,i) => (
      <div key={f.id} className="grid grid-cols-[140px_1fr_1fr_auto] gap-2">
        <Input type="date" {...form.register(`payments.${i}.paymentDate`)} />
        <Input type="number" {...form.register(`payments.${i}.amount`, { valueAsNumber:true })} />
        <Input placeholder="Note" {...form.register(`payments.${i}.note`)} />
        <Button variant="ghost" size="icon" onClick={() => removePayment(i)}><Trash2/></Button>
      </div>
    ))}
    <div className="flex justify-between text-sm">
      <span>Paid</span><span>₹{totalPaid.toFixed(2)}</span>
    </div>
    <div className={`flex justify-between font-bold ${balance>0?"text-red-600":"text-green-600"}`}>
      <span>Balance</span><span>₹{balance.toFixed(2)}</span>
    </div>
  </>
)}
```

**Post button** — OLD mode: "Post Old Bill", `bg-purple-700`.

### 6d. `pos-invoice-form.tsx`

**`canSubmit`:**
```ts
const canSubmit = !!fromOutletId && (
  billType === "OLD"
    ? !!buyerName && (items.length > 0 || attachmentCount > 0)
    : billType === "NO2" ? filledItemsCount > 0
    : filledItemsCount > 0 && !!partyId
);
```

**Submit handler:**
```ts
if (billType === "OLD") result = await handleCreateOldBill(data as OldBillFormValues);
```

**Mode switch clear:**
```ts
if (newBillType !== "OLD") { form.setValue("customBillNo",""); form.setValue("payments",[]); }
```

---

## 7. Form Handler

**File: `src/actions/sales/old-bill-form-handler.ts`**
```ts
"use server"
export async function handleCreateOldBill(formData: OldBillFormValues) {
  return withErrorHandler(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new ValidationError("Unauthorized");
    return createOldBill({ ...formData, userId: session.user.id });
  });
}
```

---

## 8. Invoice Detail Page

**File: `src/app/dashboard/sales/invoices/[id]/page.tsx`**

Add to query: `include: { oldBillPayments: { orderBy: { paymentDate: "asc" } } }`

OLD bill display:
- `"Book Bill #: {customBillNo}"` if present
- Payment history from `oldBillPayments[]` — show `paymentDate` (historical), amount, note
- Balance = `grandTotal - sum(oldBillPayments.amount)` in red/green
- Existing attachment component works as-is
- Hide "Record Payment" button for OLD bills

---

## 9. Guard in Payment Action

**File: `src/actions/sales/payment.ts`**
```ts
if (invoice.billType === "NO2" || invoice.billType === "OLD") {
  throw new ValidationError("Cannot record payments against this bill type.");
}
```

---

## 10. Bill Type Badge

Wherever bill type badge rendered:
```tsx
{billType === "OLD" && <Badge className="text-purple-700 border-purple-300 bg-purple-50">OLD</Badge>}
```

---

## 11. i18n Keys

Add `oldBill` key to `en/`, `hi/`, `mr/` message files:
```json
{
  "mode": "OLD BILL", "billNoPlaceholder": "Bill # (optional)",
  "grandTotalLabel": "Bill Total (₹)", "addPayment": "Add Payment",
  "paymentsFromBook": "Payments from book", "paid": "Paid", "balance": "Balance",
  "postButton": "Post Old Bill", "createCustomer": "Create Customer",
  "multipleMatches": "Multiple customers found — pick one",
  "successToast": "Old bill posted successfully",
  "itemsOrImageRequired": "Add item details or attach a bill photo"
}
```

---

## Implementation Order

1. Schema changes → migrate → generate
2. `OLD_BILL` prefix in numbering service
3. Validation schema (`createOldBillSchema`, `oldBillPaymentSchema`)
4. `createOldBill` server action
5. **Report filter updates** (§4) — add `billType: { not: "OLD" }` to 5 files
6. `createMinimalCustomer` + `searchCustomersByPhone`
7. `handleCreateOldBill` form handler
8. Extend `pos-invoice-header.tsx` — OLD button, customBillNo, multi-match + create dialog
9. Extend `pos-invoice-table.tsx` — freeform rows
10. Extend `pos-invoice-footer.tsx` — payments, balance, grand total input, purple button
11. Update `pos-invoice-form.tsx` — wire OLD submit, canSubmit, mode-switch clear
12. Invoice detail page — oldBillPayments, balance, customBillNo
13. Payment guard + bill type badge + i18n

---

## Edge Cases

| Scenario | Handling |
|---|---|
| `customBillNo` blank | Auto-generate `OLD/FY/seq` |
| Phone matches multiple customers | Dropdown picker shown |
| Phone blank | Skip lookup; user types name; create if needed |
| No items AND no attachment | `canSubmit=false`; hint shown |
| Payments > grandTotal | Zod blocks submit |
| Zero payments | Valid — status: POSTED |
| All paid | Status: PAID, `paidAt = last paymentDate` (historical) |
| Old bill in sales register | **Included** — accurately reflects historical sales for the period |
| Old bill in invoice listing | Shown with OLD badge (intentional) |
| Old bill in customer outstanding | **Included** — outstanding reflects historical debts |
| Old bill in party ledger | **Included** — ledger entries show historical transactions |
| P&L report | **Included** — reflects historical revenue for backdated periods |
| Account statement | **Included** — Sales/Debtors accounts show OLD entries |

---

## Critical Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | BillType enum, TransactionItem, OldBillPayment model, customBillNo |
| `src/domains/foundation/numbering-service.ts` | Add OLD_BILL prefix |
| `src/validations/invoice.validation.ts` | createOldBillSchema, oldBillPaymentSchema |
| `src/actions/reports/sales.ts` | `billType: { not: "OLD" }` filter |
| `src/actions/reports/outstanding.ts` | `billType: { not: "OLD" }` filter in transaction subquery |
| `src/actions/sales/customers.ts` | `billType: { not: "OLD" }` in outstanding calc; add `createMinimalCustomer` |
| `src/actions/purchase/vendors.ts` | `billType: { not: "OLD" }` in outstanding calc |
| `src/actions/parties/index.ts` | `searchCustomersByPhone()` returns array |
| `src/components/sales/pos-invoice-header.tsx` | OLD button, customBillNo, multi-match, create dialog |
| `src/components/sales/pos-invoice-table.tsx` | Freeform item rows |
| `src/components/sales/pos-invoice-footer.tsx` | Payments section, balance, grand total input |
| `src/components/sales/pos-invoice-form.tsx` | Wire OLD submit, canSubmit, mode-switch |
| `src/actions/sales/payment.ts` | OLD guard |
| `src/app/dashboard/sales/invoices/[id]/page.tsx` | oldBillPayments display |

## Files to Create

| File | Purpose |
|------|---------|
| `src/actions/sales/old-bill.ts` | Core server action |
| `src/actions/sales/old-bill-form-handler.ts` | Form submission wrapper |

---

## Verification

1. `npx tsc --noEmit` — no type errors
2. `npm run build` — clean build
3. Post an OLD bill dated 6 months ago — verify sales register for that period does NOT include it
4. Post same OLD bill — verify customer outstanding report does NOT include it
5. Check P&L — not affected (no ledger entries)
6. Post an OLD bill — verify it appears in the invoice list with OLD badge
7. Check dashboard today's sales — not affected (different date)
8. Phone search returning 2 matches — picker shows both
9. Phone with no match — create customer dialog opens
10. Add 3 payment rows → balance live-updates
11. Leave `customBillNo` blank — auto-generates OLD/FY/seq
12. Invoice detail: shows historical bill date, historical payment dates, balance, image
