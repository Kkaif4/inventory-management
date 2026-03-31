# Implementation Plan: Custom Accounts with Payment Modes

**FRD Reference**: Custom_Accounts_with_Payment_Modes.md  
**Status**: Ready for Implementation  
**Last Updated**: 2026-03-31

---

## 1. Executive Summary

Implement a robust financial account system that tracks all money movements across the ERP:
- Cash accounts (petty cash, cash drawers)
- Bank accounts (UPI, cheque, online transfers, cards)
- Internal transfers between accounts
- Balance tracking with transaction history
- Payment mode validation per account type

---

## 2. Database Schema Updates

### 2.1 New Models

#### `Account` Model

```prisma
model Account {
  id                String   @id @default(cuid())
  name              String   @unique
  type              AccountType  // CASH | BANK
  openingBalance    Float    @default(0)
  currentBalance    Float    @default(0)
  
  outletId          String
  outlet            Outlet   @relation(fields: [outletId], references: [id])
  
  transactions      AccountTransaction[]
  transfers         Transfer[]
  transfersTo       Transfer[] @relation("toAccount")
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([outletId])
  @@index([type])
}

enum AccountType {
  CASH
  BANK
}

// Link accounts to allowed payment modes
model AccountPaymentMode {
  id        String @id @default(cuid())
  accountId String
  mode      PaymentMode
  
  account   Account @relation(fields: [accountId], references: [id], onDelete: Cascade)
  
  @@unique([accountId, mode])
  @@index([accountId])
}

enum PaymentMode {
  CASH
  UPI
  CHEQUE
  ONLINE_TRANSFER
  CARD
}
```

#### `AccountTransaction` Model

```prisma
model AccountTransaction {
  id                String   @id @default(cuid())
  accountId         String
  account           Account  @relation(fields: [accountId], references: [id])
  
  type              TransactionType  // IN | OUT | TRANSFER_IN | TRANSFER_OUT
  amount            Float
  paymentMode       PaymentMode
  
  // Payment mode specific fields (optional)
  chequeNumber      String?
  chequeDate        DateTime?
  upiReferenceId    String?
  transactionId     String?  // Online transfer ID
  
  // Linked transaction (if from invoice, payment, expense, etc.)
  linkedTxnId       String?   // FK to Transaction/Payment/Expense
  linkedTxnType     String?   // "INVOICE_PAYMENT" | "VENDOR_PAYMENT" | "EXPENSE" | "TRANSFER"
  
  // Balance snapshot
  balanceAfter      Float
  
  remarks           String?
  userId            String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([accountId])
  @@index([type])
  @@index([createdAt])
  @@index([linkedTxnId])
}

enum TransactionType {
  IN            // Money received
  OUT           // Money paid
  TRANSFER_IN   // From another account
  TRANSFER_OUT  // To another account
}
```

#### `Transfer` Model (Internal Transfers)

```prisma
model Transfer {
  id                String   @id @default(cuid())
  fromAccountId     String
  toAccountId       String
  
  fromAccount       Account  @relation(fields: [fromAccountId], references: [id])
  toAccount         Account  @relation("toAccount", fields: [toAccountId], references: [id])
  
  amount            Float
  date              DateTime
  remarks           String?
  
  userId            String
  createdAt         DateTime @default(now())
  
  @@index([fromAccountId])
  @@index([toAccountId])
  @@index([createdAt])
}
```

### 2.2 Schema Modifications to Existing Models

#### `Payment` Model (Existing)
```prisma
model Payment {
  // ... existing fields ...
  
  accountId         String?  // NEW: Which account received the payment
  account           Account? @relation(fields: [accountId], references: [id])
  
  paymentMode       PaymentMode?  // NEW: Explicit payment mode
  chequeNumber      String?       // NEW: If mode is CHEQUE
  chequeDate        DateTime?     // NEW: If mode is CHEQUE
  
  @@index([accountId])
}
```

#### `Transaction` Model (Existing - for expenses)
```prisma
model Transaction {
  // ... existing fields ...
  
  accountId         String?  // NEW: If type is EXPENSE, which account paid
  account           Account? @relation(fields: [accountId], references: [id])
  
  paymentMode       PaymentMode?  // NEW: How was it paid
  
  @@index([accountId])
}
```

---

## 3. Validation Rules

### 3.1 Account Creation
- ✅ Name is unique per outlet
- ✅ Type is CASH or BANK
- ✅ Opening balance ≥ 0
- ✅ CASH account allows only CASH payment mode
- ✅ BANK account allows UPI, CHEQUE, ONLINE_TRANSFER, CARD

### 3.2 Payment Mode Assignment
```
CASH Account → Can only use CASH payment mode
BANK Account → Can use: UPI, CHEQUE, ONLINE_TRANSFER, CARD

CHEQUE payments → Require cheque number + date
UPI payments     → Require UPI reference ID
Online transfers → Require transaction ID
```

### 3.3 Transaction Validation
- ✅ Account must be selected
- ✅ Payment mode must be valid for account type
- ✅ Amount > 0
- ✅ For transfers: fromAccount ≠ toAccount
- ✅ Payment mode specific fields must be provided

### 3.4 Balance Rules
- ✅ Balance = Opening Balance + Received - Paid ± Transfers
- ⚠️ Negative balance allowed (configurable per outlet)
- ✅ Real-time balance snapshot on every transaction

---

## 4. Server Actions

### 4.1 Account Management

**File**: `src/actions/accounts/index.ts`

```typescript
// Create Account
export async function createAccount(data: {
  name: string;
  type: "CASH" | "BANK";
  openingBalance?: number;
  outletId: string;
  userId: string;
}) -> { success: boolean; account?: Account; error?: AppError }

// Get Accounts (by outlet)
export async function getOutletAccounts(outletId: string) 
  -> { success: boolean; accounts?: Account[]; error?: AppError }

// Get Account Detail with Balance
export async function getAccountDetail(accountId: string)
  -> { success: boolean; account?: Account & { balance: number }; error?: AppError }

// Update Account
export async function updateAccount(accountId: string, data: {
  name?: string;
  openingBalance?: number;
}) -> { success: boolean; account?: Account; error?: AppError }

// Delete Account (only if no transactions)
export async function deleteAccount(accountId: string)
  -> { success: boolean; error?: AppError }
```

### 4.2 Payment Mode Assignment

**File**: `src/actions/accounts/payment-modes.ts`

```typescript
// Get allowed payment modes for account type
export async function getPaymentModesForAccount(accountId: string)
  -> PaymentMode[]

// Validate payment mode for account
export async function validatePaymentMode(
  accountId: string,
  paymentMode: PaymentMode
) -> boolean
```

### 4.3 Account Transactions

**File**: `src/actions/accounts/transactions.ts`

```typescript
// Record transaction (generic)
export async function recordAccountTransaction(data: {
  accountId: string;
  type: TransactionType;
  amount: number;
  paymentMode: PaymentMode;
  
  // Mode-specific fields
  chequeNumber?: string;
  chequeDate?: DateTime;
  upiReferenceId?: string;
  transactionId?: string;
  
  linkedTxnId?: string;
  linkedTxnType?: string;
  remarks?: string;
  userId: string;
}) -> { success: boolean; transaction?: AccountTransaction; error?: AppError }

// Get transaction history
export async function getAccountTransactionHistory(
  accountId: string,
  limit?: number,
  offset?: number
) -> AccountTransaction[]

// Calculate current balance
export async function getAccountBalance(accountId: string) -> number
```

### 4.4 Internal Transfers

**File**: `src/actions/accounts/transfers.ts`

```typescript
// Perform internal transfer
export async function transferBetweenAccounts(data: {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: DateTime;
  remarks?: string;
  userId: string;
}) -> { success: boolean; transfer?: Transfer; error?: AppError }

// Get transfer history
export async function getTransferHistory(
  accountId?: string,  // If null, get all transfers for outlet
  limit?: number
) -> Transfer[]
```

### 4.5 Integration with Existing Flows

#### In `recordInvoicePayment()` (Existing)
```typescript
// NEW: Before creating Payment record
if (data.accountId) {
  await recordAccountTransaction({
    accountId: data.accountId,
    type: "IN",
    amount: data.amount,
    paymentMode: data.paymentMode,
    // ... mode-specific fields
    linkedTxnId: data.invoiceId,
    linkedTxnType: "INVOICE_PAYMENT",
    userId: data.userId,
  });
}
```

#### In `recordVendorPayment()` (New/Existing)
```typescript
// NEW: Link account and payment mode
await recordAccountTransaction({
  accountId: data.accountId,
  type: "OUT",
  amount: data.amount,
  paymentMode: data.paymentMode,
  // ... mode-specific fields
  linkedTxnId: data.billId,
  linkedTxnType: "VENDOR_PAYMENT",
  userId: data.userId,
});
```

---

## 5. UI Components

### 5.1 Account Management Pages

**Path**: `src/app/dashboard/financials/accounts/`

```
├── page.tsx                    # Account list page (server)
├── accounts-client.tsx         # Client table with actions
├── [id]/
│   ├── page.tsx               # Account detail view
│   ├── transactions.tsx        # Transaction history
│   └── transfer-funds.tsx      # Transfer to another account
├── new/
│   ├── page.tsx               # Create account page
│   └── create-account-form.tsx # Form component
```

### 5.2 Forms and Dialogs

**Path**: `src/components/accounts/`

```
├── account-form.tsx            # Reusable account creation/edit
├── payment-mode-selector.tsx    # Dropdown with validation
├── transfer-dialog.tsx          # Internal transfer modal
├── transaction-details.tsx      # View/edit transaction
├── cheque-details-form.tsx      # For CHEQUE mode
├── upi-details-form.tsx         # For UPI mode
├── online-transfer-form.tsx     # For ONLINE_TRANSFER mode
```

### 5.3 Integration Points (Existing Components)

**Update**: `src/components/sales/payment-drawer.tsx`
```tsx
// Add account selection
<AccountSelector 
  outletId={invoice.outletId}
  onSelect={(account) => setSelectedAccount(account)}
/>

// Add payment mode selector (filtered by account type)
<PaymentModeSelector
  accountId={selectedAccount?.id}
  onChange={(mode) => setPaymentMode(mode)}
/>

// Show mode-specific fields conditionally
{paymentMode === "CHEQUE" && <ChequeDetailsForm />}
{paymentMode === "UPI" && <UpiDetailsForm />}
```

---

## 6. Data Flow Diagrams

### 6.1 Customer Payment Flow

```
Invoice View
    ↓
Record Payment Button
    ↓
Payment Drawer Opens
    ├── Select Account (CASH/BANK)
    ├── Select Payment Mode (based on account type)
    ├── Enter Amount
    ├── Enter Mode-Specific Details (if needed)
    └── Confirm
    ↓
recordInvoicePayment() 
    ├── Create Payment record ✓
    ├── Update Party.outstandingBalance ✓
    ├── Post Journal Entry ✓
    └── recordAccountTransaction() [NEW]
        ├── Create AccountTransaction (IN)
        ├── Update Account.currentBalance
        └── Create linked transaction
    ↓
Success Toast + Reload Invoice
    ├── Show updated Outstanding
    ├── Show updated Account Balance
    └── Show Payment History
```

### 6.2 Internal Transfer Flow

```
Accounts Page
    ↓
"Transfer Funds" Button
    ↓
Transfer Modal Opens
    ├── Select From Account
    ├── Select To Account
    ├── Enter Amount
    └── Confirm
    ↓
transferBetweenAccounts()
    ├── Validate: from ≠ to ✓
    ├── Validate: amount > 0 ✓
    ├── Create Transfer record
    ├── recordAccountTransaction() [OUT]
    │   └── From Account - (amount)
    ├── recordAccountTransaction() [IN]
    │   └── To Account + (amount)
    └── Update both balances
    ↓
Success Toast + Reload Accounts
```

---

## 7. Critical Integration Points

### 7.1 Payment Recording (Existing `recordInvoicePayment`)

```typescript
// BEFORE: Only updates Party.outstandingBalance
await tx.party.update({
  where: { id: partyId },
  data: { outstandingBalance: { increment: grandTotal } }
});

// AFTER: Also record in Account
await recordAccountTransaction(tx, {
  accountId: data.accountId,  // NEW
  type: "IN",
  amount: data.amount,
  paymentMode: data.paymentMode,  // NEW
  chequeNumber: data.chequeNumber,  // NEW (conditional)
  linkedTxnId: invoiceId,
  linkedTxnType: "INVOICE_PAYMENT",
  userId: data.userId,
});
```

### 7.2 Vendor Payment (New or Enhanced)

Similar to customer payment, but:
- Direction: OUT (money leaving)
- Party field: Vendor/Vendor
- Accounts deducted

### 7.3 Expense Recording

```typescript
// If expense is recorded with account payment
recordAccountTransaction({
  accountId: data.accountId,
  type: "OUT",
  amount: data.amount,
  paymentMode: data.paymentMode,
  linkedTxnId: expenseId,
  linkedTxnType: "EXPENSE",
  userId: data.userId,
});
```

---

## 8. Validation Rules (Server Side)

### 8.1 Account Type → Payment Mode Validation

```typescript
const ALLOWED_MODES = {
  CASH: ["CASH"],
  BANK: ["UPI", "CHEQUE", "ONLINE_TRANSFER", "CARD"],
};

function validatePaymentMode(accountType: string, mode: PaymentMode) {
  if (!ALLOWED_MODES[accountType]?.includes(mode)) {
    throw new ValidationError(
      `Payment mode ${mode} not allowed for ${accountType} account`
    );
  }
}
```

### 8.2 Payment Mode Required Fields

```typescript
const REQUIRED_FIELDS = {
  CHEQUE: ["chequeNumber", "chequeDate"],
  UPI: ["upiReferenceId"],
  ONLINE_TRANSFER: ["transactionId"],
  CASH: [],
  CARD: [],
};

function validateModeFields(mode: PaymentMode, data: Record<string, any>) {
  const required = REQUIRED_FIELDS[mode] || [];
  for (const field of required) {
    if (!data[field]) {
      throw new ValidationError(`${field} is required for ${mode} payment`);
    }
  }
}
```

---

## 9. Balance Calculation Logic

```typescript
async function calculateAccountBalance(accountId: string): Promise<number> {
  const account = await tx.account.findUnique({
    where: { id: accountId },
    select: { openingBalance: true },
  });

  const transactions = await tx.accountTransaction.findMany({
    where: { accountId },
    select: { type: true, amount: true },
  });

  let balance = account.openingBalance;

  for (const txn of transactions) {
    if (txn.type === "IN" || txn.type === "TRANSFER_IN") {
      balance += txn.amount;
    } else if (txn.type === "OUT" || txn.type === "TRANSFER_OUT") {
      balance -= txn.amount;
    }
  }

  return balance;
}
```

---

## 10. Reporting & Views

### 10.1 Account List View

**Columns**:
- Account Name
- Type (CASH/BANK)
- Current Balance
- Opening Balance
- Last Transaction Date
- Actions (View, Edit, Transfer, Delete)

### 10.2 Account Detail View

**Sections**:
- Account Summary (name, type, opening balance, current balance)
- Transaction History (sortable, filterable by type/mode)
- Recent Transfers (if applicable)
- Quick Actions (Transfer Funds, Record Transaction)

### 10.3 Transaction History Report

**Filters**:
- Date range
- Transaction type (IN/OUT/TRANSFER_IN/TRANSFER_OUT)
- Payment mode
- Amount range

**Columns**:
- Date
- Type
- Payment Mode
- Amount
- Balance After
- Reference (linked transaction)
- Remarks

### 10.4 Internal Transfers Report

**Columns**:
- Date
- From Account
- To Account
- Amount
- Remarks
- Created By

---

## 11. Implementation Phases

### Phase 1: Database & Core Logic (Week 1)
- [ ] Add Account, AccountTransaction, Transfer models to Prisma
- [ ] Create migration
- [ ] Write validation logic
- [ ] Implement account server actions
- [ ] Implement transaction recording

**Files to create**:
- `src/actions/accounts/index.ts`
- `src/actions/accounts/payment-modes.ts`
- `src/actions/accounts/transactions.ts`
- `src/actions/accounts/transfers.ts`
- `src/lib/account-validation.ts`
- `prisma/migrations/[timestamp]_add_accounts.sql`

### Phase 2: UI Components (Week 2)
- [ ] Create account management pages
- [ ] Build account forms
- [ ] Implement payment mode selector
- [ ] Create transfer modal
- [ ] Add transaction history view

**Files to create**:
- `src/app/dashboard/financials/accounts/page.tsx`
- `src/app/dashboard/financials/accounts/[id]/page.tsx`
- `src/app/dashboard/financials/accounts/new/page.tsx`
- `src/components/accounts/*` (multiple components)

### Phase 3: Integration (Week 3)
- [ ] Update `recordInvoicePayment()` to use accounts
- [ ] Add account selection to payment drawer
- [ ] Integrate with vendor payments (if applicable)
- [ ] Integrate with expense tracking (if applicable)

**Files to modify**:
- `src/components/sales/payment-drawer.tsx`
- `src/actions/sales/payment.ts`
- Vendor/Expense related files

### Phase 4: Testing & Polish (Week 4)
- [ ] Unit tests for balance calculation
- [ ] Integration tests for transactions
- [ ] E2E tests for payment flow
- [ ] Data migration (if upgrading existing system)
- [ ] Documentation

---

## 12. Migration Strategy (If Upgrading Existing Data)

### 12.1 For Existing Payments

1. Create default accounts per outlet:
   - "Cash (Default)"
   - "Bank (Default)"

2. Backfill existing Payment records:
   ```sql
   INSERT INTO AccountTransaction (...)
   SELECT 
     cash_account_id,
     'IN',
     amount,
     'CASH',  -- or infer from payment mode
     -- ...
   FROM Payment
   WHERE createdAt < migration_date
   ```

3. Update Payment records with accountId

### 12.2 Validation

- [ ] Total account balances match ledger
- [ ] All payments are linked
- [ ] No orphaned transactions

---

## 13. Error Handling

### 13.1 Common Errors

```typescript
// Account Type Mismatch
throw new ValidationError(
  "BANK account cannot use CASH payment mode"
);

// Missing Mode Details
throw new ValidationError(
  "Cheque number required for CHEQUE payment mode"
);

// Invalid Transfer
throw new ValidationError(
  "Cannot transfer to the same account"
);

// Insufficient Details
throw new ValidationError(
  "Payment mode specific details missing"
);
```

---

## 14. Performance Considerations

### 14.1 Indexes
```prisma
// On AccountTransaction
@@index([accountId])
@@index([type])
@@index([createdAt])

// On Account
@@index([outletId])
@@index([type])

// On Transfer
@@index([fromAccountId])
@@index([toAccountId])
```

### 14.2 Balance Caching
- Store `currentBalance` on Account model (denormalized)
- Update atomically on every transaction
- Recalculate on demand if needed

### 14.3 Query Optimization
- Eager load account + payment mode on transactions
- Use select to limit fields
- Paginate transaction history

---

## 15. Security Considerations

### 15.1 Authorization
- [ ] User can only view/edit accounts in their outlet
- [ ] Only authorized roles can create accounts
- [ ] Only authorized users can perform transfers

### 15.2 Audit Trail
- [ ] All transactions logged with userId
- [ ] Account modifications tracked
- [ ] Transfer history immutable

### 15.3 Data Integrity
- [ ] Transactions are immutable (no edit/delete, only create)
- [ ] Balance calculations are read-only
- [ ] Double-entry principle (TRANSFER_OUT ↔ TRANSFER_IN)

---

## 16. Testing Strategy

### 16.1 Unit Tests

```typescript
// test/accounts/validation.test.ts
- validatePaymentMode() 
- validateModeFields()
- calculateAccountBalance()

// test/accounts/transactions.test.ts
- recordAccountTransaction()
- getAccountTransactionHistory()
```

### 16.2 Integration Tests

```typescript
// test/accounts/integration.test.ts
- recordInvoicePayment() → Account transaction
- transferBetweenAccounts() → Both accounts updated
- Balance consistency
```

### 16.3 E2E Tests

```
- Customer pays invoice → Account updated
- Transfer between accounts → Both balances change
- Invalid payment mode → Error shown
```

---

## 17. Success Criteria

✅ Account CRUD operations fully functional  
✅ Payment modes validated per account type  
✅ All transactions recorded in accounts  
✅ Balances calculated correctly and in real-time  
✅ Internal transfers working bidirectionally  
✅ Transaction history complete and auditable  
✅ Reports show accurate data  
✅ No orphaned transactions  
✅ All validation rules enforced  
✅ Zero balance drift during testing  

---

## 18. Known Limitations & Future Work

### 18.1 Phase 2 (Future)
- Bank reconciliation (match bank statement to transactions)
- Recurring transactions/standing orders
- Account groups/hierarchies
- Multi-currency support

### 18.2 Phase 3 (Future)
- Double-entry bookkeeping (full GL)
- Financial statements (P&L, Balance Sheet)
- Audit trails with versioning
- Compliance reporting

---

## 19. Rollback Plan

If critical issues arise:

1. **Data Integrity Issue**: Disable account-related features, keep payments in legacy mode
2. **Performance Degradation**: Archive old transactions to separate table
3. **Logic Error**: Deploy hotfix maintaining backward compatibility

---

## 20. File Checklist

### New Files to Create
- [ ] `src/actions/accounts/index.ts`
- [ ] `src/actions/accounts/payment-modes.ts`
- [ ] `src/actions/accounts/transactions.ts`
- [ ] `src/actions/accounts/transfers.ts`
- [ ] `src/lib/account-validation.ts`
- [ ] `src/app/dashboard/financials/accounts/page.tsx`
- [ ] `src/app/dashboard/financials/accounts/[id]/page.tsx`
- [ ] `src/app/dashboard/financials/accounts/new/page.tsx`
- [ ] `src/components/accounts/account-form.tsx`
- [ ] `src/components/accounts/payment-mode-selector.tsx`
- [ ] `src/components/accounts/transfer-dialog.tsx`
- [ ] `src/validations/account.validation.ts`

### Files to Modify
- [ ] `prisma/schema.prisma` (new models)
- [ ] `src/components/sales/payment-drawer.tsx`
- [ ] `src/actions/sales/payment.ts`
- [ ] `src/app/dashboard/layout.tsx` (add Accounts navigation)

### Database
- [ ] Create migration for new tables

---

## 21. Questions for Stakeholder Approval

1. ✅ Should negative account balances be allowed? (configurable per outlet?)
2. ✅ Do we need bank reconciliation immediately or in Phase 2?
3. ✅ Should transfers between accounts require approval?
4. ✅ Do we need receipt/reference printing for each payment mode?
5. ✅ Should accounts have spending limits?

---

**End of Implementation Plan**

Ready to begin Phase 1 implementation.
