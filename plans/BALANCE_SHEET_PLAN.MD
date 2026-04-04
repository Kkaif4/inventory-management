## Balance Sheet — Unified Account Model

---

### Architecture Decision: Merge GLAccount into Account

**Remove `GLAccount`. `Account` IS the GL account.**

Having two models (`Account` for operational cash/bank + `GLAccount` for ledger bookkeeping) means every transaction must update two things. When one is missed — which is exactly what the 5 diagnosed gaps show — the books go out of sync. One model eliminates that entire class of bug.

`Account` already exists, already has a type, already has a name, already knows which outlet it belongs to. The only thing `GLAccount` added was: accumulate `LedgerEntry` rows. That can point directly to `Account.id`.

---

### Unified Account Model (Target Schema)

```prisma
model Account {
  id             String       @id @default(cuid())
  name           String
  code           String?      // GL code: "1001", "1002", "1001-01", "1002-03"
  group          AccountGroup // ASSET | LIABILITY | EQUITY | INCOME | EXPENSE
  type           AccountType? // CASH | BANK | null (for non-operational accounts)
  isSystem       Boolean      @default(false)
  openingBalance Float        @default(0)
  currentBalance Float        @default(0)
  outletId       String
  outlet         Outlet       @relation(...)

  entries        LedgerEntry[]       // ← was on GLAccount, now here
  paymentModes   AccountPaymentMode[]
  transactions   AccountTransaction[]
  transfersFrom  Transfer[]
  transfersTo    Transfer[]
  payments       Payment[]
  expenses       Expense[]

  @@unique([code, outletId])
}
```

`AccountType` enum stays as CASH | BANK for operational accounts. System/ledger-only accounts (Debtors, Creditors, GST, etc.) have `type = null`.

---

### System Accounts (Seeded on Outlet Creation)

| Code | Name | Group | Type |
|------|------|-------|------|
| 1001 | Cash in Hand | ASSET | CASH |
| 1002 | Standard Bank Account | ASSET | BANK |
| 1003 | Sundry Debtors | ASSET | null |
| 1004 | Inventory Asset | ASSET | null |
| 1005 | Input CGST | ASSET | null |
| 1006 | Input SGST | ASSET | null |
| 1007 | Input IGST | ASSET | null |
| 2001 | Sundry Creditors | LIABILITY | null |
| 2002 | Output CGST | LIABILITY | null |
| 2003 | Output SGST | LIABILITY | null |
| 2004 | Output IGST | LIABILITY | null |
| 3001 | Sales Account | INCOME | null |
| 4001 | Purchase Account | EXPENSE | null |
| 4002 | Freight & Carriage | EXPENSE | null |
| 5001 | Opening Balance Offset | EQUITY | null |

These are created by `initializeCOA()` (renamed to `initializeSystemAccounts()`), seeded on outlet creation. Expense categories (Rent, Salaries, etc.) are also seeded as EXPENSE-group accounts with `isSystem = false` — they are user-visible.

---

### User-Created Cash/Bank Accounts

When a user creates a new cash or bank account ("HDFC Current A/c", "Petty Cash — Office"):

- A new `Account` row is created with `type = CASH` or `BANK`, `group = ASSET`
- Code is auto-generated: `1001-01`, `1001-02` for CASH; `1002-01`, `1002-02` for BANK
- Opening balance → post `LedgerEntry`: Dr this account, Cr `5001` (Opening Balance Offset)
- The account immediately appears on the Balance Sheet under Assets

---

### How Balances Are Calculated

For every account on the balance sheet:

```
Balance = openingBalance
        + SUM(LedgerEntry.debit where date ≤ asOnDate)
        - SUM(LedgerEntry.credit where date ≤ asOnDate)
```

For `currentBalance` (live operational balance on Account):
- Incremented/decremented directly on each transaction (existing pattern)
- `currentBalance` and the ledger-computed balance should always match — they are both derived from the same journal entries

---

### LedgerEntry (No Change Needed)

```prisma
model LedgerEntry {
  id            String    @id @default(cuid())
  accountId     String    // ← now points to Account.id (was GLAccount.id)
  partyId       String?
  transactionId String?
  date          DateTime  @default(now())
  debit         Float     @default(0)
  credit        Float     @default(0)
  reference     String?
  isReconciled  Boolean   @default(false)
  account       Account   @relation(...)   // ← changed target
  party         Party?    @relation(...)
  transaction   Transaction? @relation(...)
}
```

---

### Payment Model (Simplification)

Before: `Payment` had two account FKs:
- `glAccountId` → GLAccount (for bookkeeping)
- `operationalAccountId` → Account (for fund tracking)

After: One FK:
- `accountId` → Account (same record serves both purposes)

---

### ExpenseCategory (Simplification)

Before: `ExpenseCategory.glAccountId` → GLAccount

After: `ExpenseCategory.accountId` → Account (pointing to an EXPENSE-group account)

---

### Balance Sheet Assembly

#### Step 1 — Fetch all accounts with their ledger entries up to asOnDate

```ts
const accounts = await prisma.account.findMany({
  where: { outletId },
  select: {
    id, code, name, group, type,
    openingBalance,
    entries: {
      where: { date: { lte: asOnDate } },
      select: { debit: true, credit: true }
    }
  },
  orderBy: [{ group: "asc" }, { code: "asc" }]
})
```

#### Step 2 — Compute balance per account

```ts
balance = openingBalance + SUM(entries.debit) - SUM(entries.credit)
```

#### Step 3 — Split by group and overdraft logic

```ts
// BANK accounts with negative balance → Overdraft → Liabilities
const assets      = accounts.filter(a => a.group === "ASSET" && !(a.type === "BANK" && a.balance < 0))
const liabilities = accounts.filter(a => a.group === "LIABILITY")
                 + accounts.filter(a => a.type === "BANK" && a.balance < 0)  // overdrafts
const equity      = accounts.filter(a => a.group === "EQUITY")

// Net Profit: INCOME - EXPENSE → injected into Equity section
const incomeTotal  = sumOf(INCOME group accounts)
const expenseTotal = sumOf(EXPENSE group accounts)
const netProfit    = incomeTotal - expenseTotal
// Added as synthetic equity line: "Net Profit (Current Period)"
```

#### Step 4 — Balance check

```ts
Assets = Liabilities + Equity + Net Profit
```

---

### What Renders on the Balance Sheet

```
ASSETS

  Cash Accounts
    Cash in Hand (1001)              ₹43,500
    Petty Cash — Office (1001-01)     ₹5,800
    ─────────────────────────────────────────
    Total Cash                        ₹49,300

  Bank Accounts
    HDFC Bank — Current (1002-01)   ₹1,31,000
    SBI Bank — Savings (1002-02)      ₹35,000
    ─────────────────────────────────────────
    Total Bank                      ₹1,66,000

  Accounts Receivable (1003)        ₹1,85,000
  Inventory (1004)                  ₹4,20,000
  Input GST — ITC (1005–1007)         ₹38,000
  ═════════════════════════════════════════════
  Total Assets                      ₹8,58,300


LIABILITIES

  Sundry Creditors (2001)           ₹1,20,000
  Output GST Payable (2002–2004)      ₹28,800
  Bank Overdraft
    Kotak OD A/c (1002-03)           ₹30,000
  ═════════════════════════════════════════════
  Total Liabilities                 ₹1,78,800


EQUITY

  Opening Capital (5001)            ₹5,50,000
  Net Profit (current period)       ₹1,29,500
  ═════════════════════════════════════════════
  Total Equity                      ₹6,79,500

══════════════════════════════════════════════
Total Liabilities + Equity          ₹8,58,300  ✓
```

---

### Rules Summary

```
CASH account, balance > 0   → Assets → Cash Accounts
CASH account, balance < 0   → Flag as error (physical cash cannot be negative)
BANK account, balance > 0   → Assets → Bank Accounts
BANK account, balance < 0   → Liabilities → Bank Overdraft (shown as positive)
ASSET account (non-cash/bank)→ Assets → Other Assets (Debtors, Inventory, GST)
LIABILITY account            → Liabilities
INCOME + EXPENSE accounts    → Net Profit line in Equity (not shown individually)
```

---

### Migration Path

1. Add `code`, `group`, `isSystem` fields to `Account` model
2. Make `Account.type` optional (`AccountType?`)
3. Add `entries LedgerEntry[]` relation to `Account`
4. Change `LedgerEntry.accountId` FK target from `GLAccount` to `Account`
5. Migrate existing `GLAccount` rows → insert as `Account` rows (preserving codes and names)
6. Update `Payment`: drop `glAccountId` + `operationalAccountId`, add single `accountId`
7. Update `ExpenseCategory`: rename `glAccountId` → `accountId`
8. Drop `GLAccount` model
9. Update all `prisma.gLAccount.*` calls → `prisma.account.*` in action files
10. Update `initializeCOA()` → seed into `Account` table
