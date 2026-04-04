# Accounts & Payment Modes Integration Guide

## Overview

The Operational Accounts system has been integrated into the sales payment flow. This document explains how the integration works and where to find the relevant code.

## System Architecture

### Two Account Types

1. **GL Accounts** (Chart of Accounts for bookkeeping)
   - Used for journal entries
   - Maintained in `gLAccount` model
   - Used by accounting reports and financial statements

2. **Operational Accounts** (Cash/Bank for fund tracking)
   - New model: `Account` with types CASH | BANK
   - Tracks real money movements
   - Linked to operational transactions

### Payment Flow with Accounts

```
Customer Payment Recording
    ↓
Payment Drawer (with Account Selection)
    ↓
recordInvoicePayment() server action
    ├─ Creates Payment record (GL + Operational account info)
    ├─ Creates Journal Entries (for bookkeeping)
    └─ Creates AccountTransaction (for fund tracking)
    ↓
Update Invoice Status & Party Outstanding
    ↓
Success
```

## Integration Points

### 1. Payment Drawer (`src/components/sales/payment-drawer.tsx`)

**Changes:**
- Added `getOutletOperationalAccounts()` import
- Added `operationalAccounts` state
- Added "Receiving Account" selector (optional)
- Loads both GL and operational accounts on mount

**User Experience:**
- Shows account selector after Payment Mode
- Displays account type and current balance
- Optional selection - customer payments work with or without it
- Helps users track cash/bank reconciliation

### 2. Payment Validation (`src/validations/payment.validation.ts`)

**New Fields in `recordPaymentSchema`:**
```typescript
operationalAccountId: z.string().optional()
chequeNumber: z.string().max(20).optional()
chequeDate: z.string().optional()
upiReferenceId: z.string().max(50).optional()
transactionId: z.string().max(50).optional()
```

**Old Fields (Still Present):**
- `bankAccountId` → GL account for journal entries
- `paymentMode` → payment method (Cash, UPI, Cheque, etc.)

### 3. Record Invoice Payment Action (`src/actions/sales/payment.ts`)

**Changes in `recordInvoicePayment()`:**

Step 4b (NEW): After creating Payment record:
```typescript
if (data.operationalAccountId) {
  // Get current account balance
  // Create AccountTransaction (type: IN)
  // Update account currentBalance
}
```

**New Function:**
```typescript
getOutletOperationalAccounts(outletId: string)
```
Returns all Account records for an outlet with balance info.

**Modified Function:**
```typescript
getInvoicePayments(invoiceId: string)
```
Now includes `operationalAccount` in the response (was `bankAccount` for GL).

### 4. Account Actions (`src/actions/accounts/`)

**Available Server Actions:**

Accounts Management:
- `createAccount()` - Create CASH or BANK account
- `getOutletAccounts()` - List all accounts
- `getAccountDetail()` - Full account with history
- `updateAccount()` - Rename or change opening balance
- `deleteAccount()` - Delete if no transactions

Transactions:
- `recordAccountTransaction()` - Record IN/OUT/TRANSFER_IN/TRANSFER_OUT
- `getAccountTransactionHistory()` - Transaction list with filters
- `getAccountBalance()` - Balance at specific date

Transfers:
- `transferBetweenAccounts()` - Internal transfer (atomic)
- `getTransferHistory()` - Transfer history for account

### 5. Payment Mode Validation

**Allowed Modes by Account Type:**

```
CASH Account:
  ✅ Only CASH mode allowed

BANK Account:
  ✅ UPI
  ✅ CHEQUE (requires chequeNumber, chequeDate)
  ✅ ONLINE_TRANSFER (requires transactionId)
  ✅ CARD
  ❌ CASH (not allowed for bank accounts in operational system)
```

## How to Use

### For Users

1. **Recording a Customer Payment:**
   - Open Invoice Detail Page
   - Click "Record Payment"
   - Select Payment Mode (Cash, UPI, etc.)
   - (Optional) Select Operational Account to track cash/bank
   - Enter amount and confirm
   - Payment is recorded with fund tracking

2. **Managing Accounts:**
   - Go to Financials → Accounts
   - Create CASH or BANK account
   - View account details and transaction history
   - Transfer funds between accounts
   - See real-time balance updates

### For Developers

1. **Creating a Payment with Account Tracking:**

```typescript
// In a server action
const result = await recordInvoicePayment({
  invoiceId: "...",
  outletId: "...",
  partyId: "...",
  paymentDate: new Date().toISOString().split("T")[0],
  amount: 1000,
  paymentMode: "UPI",
  operationalAccountId: "account-id", // Track in operational account
  upiReferenceId: "UPI-REF-123",
  userId: "user-id",
});
```

2. **Recording an Internal Transfer:**

```typescript
import { transferBetweenAccounts } from "@/actions/accounts/transfers";

const result = await transferBetweenAccounts({
  fromAccountId: "cash-account-id",
  toAccountId: "bank-account-id",
  amount: 5000,
  date: new Date(),
  remarks: "Deposit to bank",
  outletId: "outlet-id",
  userId: "user-id",
});
```

3. **Getting Account Balance:**

```typescript
import { getAccountBalance } from "@/actions/accounts/transactions";

const balance = await getAccountBalance(
  accountId,
  outletId,
  // Optional: as of specific date
  new Date("2026-03-20")
);
```

## Data Model Relationships

```
Payment
  ├─ glAccountId (FK to GLAccount) - for journal entries
  ├─ operationalAccountId (FK to Account) - for fund tracking
  ├─ paymentMode - payment method
  └─ referenceNo - cheque/UPI ID

Account
  ├─ type (CASH | BANK)
  ├─ currentBalance (denormalized)
  ├─ openingBalance
  └─ AccountTransaction[]

AccountTransaction
  ├─ type (IN | OUT | TRANSFER_IN | TRANSFER_OUT)
  ├─ paymentMode
  ├─ amount
  ├─ balanceAfter (snapshot)
  └─ linkedTxnId / linkedTxnType (for INVOICE_PAYMENT links)

Transfer
  ├─ fromAccount
  ├─ toAccount
  └─ amount
```

## Validation Rules

1. **Payment Mode ↔ Account Type**
   - CASH account: only CASH mode
   - BANK account: UPI, CHEQUE, ONLINE_TRANSFER, CARD
   - No cross-type usage

2. **Required Fields by Payment Mode**
   - CHEQUE: chequeNumber, chequeDate
   - UPI: upiReferenceId
   - ONLINE_TRANSFER: transactionId
   - CASH/CARD: none required

3. **Transfer Validation**
   - Cannot transfer to same account
   - Amount must be > 0
   - Both accounts must belong to same outlet

## Balance Calculation

```
Account Current Balance = Opening Balance + All IN transactions - All OUT transactions

Real-time Updates:
- Every transaction updates currentBalance immediately
- balanceAfter snapshot stored with each transaction
- Optional: get balance as of specific date using transaction history
```

## Testing the Integration

1. **Create an Account:**
   - Go to Financials → Accounts → New
   - Create "Cash Drawer" (CASH type)
   - Create "HDFC Bank" (BANK type)
   - Set opening balances

2. **Record a Payment:**
   - Create an invoice (₹1000)
   - Click "Record Payment"
   - Select CASH mode
   - Select "Cash Drawer" account
   - Enter ₹500
   - Confirm

3. **Verify:**
   - Go to Accounts → Cash Drawer
   - See transaction with amount ₹500
   - Balance should increase by ₹500

## Known Limitations

- GL accounts and Operational accounts are separate systems
- No auto-sync between GL journal entries and account transactions
- Payment mode validation is client-side on drawer (server validates too)
- No bank reconciliation yet (future feature)

## Future Enhancements

- Bank reconciliation workflow
- Recurring/scheduled transfers
- Account hierarchies
- Multi-currency support
- Budget tracking
- Financial dashboards with account metrics
