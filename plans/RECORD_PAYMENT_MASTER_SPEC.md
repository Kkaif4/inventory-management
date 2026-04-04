# Record Payment - Complete Master Specification

**Date:** April 3, 2026
**Status:** Comprehensive Specification | Ready for Full Implementation
**Scope:** Payment Recording Sidebar - Complete Refactor
**Complexity:** Medium
**Estimated Total Effort:** 10-15 hours

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Problems](#current-state-problems)
3. [Proposed Solution Architecture](#proposed-solution-architecture)
4. [Complete Functionality & Behavior Flows](#complete-functionality--behavior-flows)
5. [User Interaction Flows](#user-interaction-flows)
6. [Technical Implementation](#technical-implementation)
7. [Code Snippets & Examples](#code-snippets--examples)
8. [Data Model & State Management](#data-model--state-management)
9. [Testing Strategy & Scenarios](#testing-strategy--scenarios)
10. [Risk Assessment & Mitigation](#risk-assessment--mitigation)
11. [Implementation Timeline](#implementation-timeline)
12. [Success Criteria Checklist](#success-criteria-checklist)

---

## SECTION 1: Executive Summary

### Overview

The Record Payment sidebar requires a complete refactoring to improve user experience, eliminate field redundancy, and implement intelligent account filtering based on payment mode selection. The new design prioritizes payment mode as the primary decision point, followed by conditional account filtering. And remove System account concept cmopletly, we only suin dynamic accounts created by user.

### Key Changes

- **Payment Mode First**: Move payment mode selection to be the primary decision (currently secondary)
- **Dynamic Account Filtering**: Show only CASH accounts for cash payments, BANK accounts for other modes
- **Ledger Updates**: Automatically update account balance and vendor/customer ledger after payment
- **Mode-Specific Fields**: Conditionally show cheque numbers, UTR references, transaction IDs based on mode
- **Simplified UX**: Remove field redundancy and confusing labels

### Business Impact

- ✅ Faster payment recording (fewer validation errors)
- ✅ Accurate account balance tracking
- ✅ Automated ledger reconciliation
- ✅ Reduced user confusion and support tickets
- ✅ Better data integrity

---

## SECTION 2: Current State Problems

### Problem 1: Selection Order is Backwards

**Current Flow:**

```
Account Selection (ALL types) → Payment Mode Selection (dependent)
```

**Issue:** Users first select from a huge list of mixed account types, then manually set the payment mode. This creates confusion:

- Which account works with which mode?
- Why are all ASSET accounts shown?
- Why is account selection dependent on mode, not the other way around?

### Problem 2: Account Filtering Issues

**Current State:**

```
All ASSET accounts displayed
  ├─ CASH accounts
  ├─ BANK accounts
  └─ Mixed/unclear accounts
```

**Issues:**

- No separation between CASH and BANK accounts
- Users can't easily distinguish account types
- Payment mode constraints not clear until after account selection
- No filtering based on payment mode selection

### Problem 3: Duplicate/Redundant Fields

**Current Form Layout:**

```
Vendor/Customer Selector
↓
Account Selector ("Paid From Bank/Cash")
↓
Payment Mode Selector (dependent on account)
↓
Amount & Date
↓
Record Payment Button
```

**Issues:**

- "Bank/Cash" label creates confusion with "Payment Mode" selector
- Two different ways to specify payment method (account type + mode)
- Field purpose not immediately clear to users
- Confusing label: is "Bank/Cash Account" referring to account type or payment method?

### Problem 4: No Data Updates After Payment

**Current Behavior:**

```
User Records Payment
  ↓
Payment recorded in database
  ↓
Account balance: NOT updated
Vendor/Customer ledger: NOT updated
Transaction record: Created
  ↓
Result: Data inconsistency
```

**Issues:**

- Account balance doesn't reflect payments
- Vendor/customer outstanding balance not updated
- Manual reconciliation required
- Audit trail incomplete

### Problem 5: Missing Mode-Specific Information

**Current State:**

- CASH payments: No additional data captured
- UPI payments: No UTR/reference stored
- CHEQUE payments: No cheque number or date stored
- ONLINE payments: No transaction reference stored
- CARD payments: No authorization data stored

**Issue:** Incomplete payment records make reconciliation and auditing difficult

---

## SECTION 3: Proposed Solution Architecture

### New User Flow (Improved)

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: Vendor/Customer Selection                      │
│ Select from list of Vendors/Customers                  │
│ [Vendor Dropdown - Vendors Only]                        │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ STEP 2: PAYMENT MODE SELECTION (PRIMARY DECISION)      │
│ Choose how payment will be made                         │
│                                                          │
│ ◉ CASH                                                  │
│ ○ UPI / RTGS / IMPS                                     │
│ ○ CHEQUE                                                │
│ ○ ONLINE_TRANSFER (Bank Transfer)                       │
│ ○ CARD (Credit/Debit Card)                              │
│                                                          │
│ [Radio Button/Tab Selection]                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├─── IF CASH MODE ─────────┐
                 │                          │
┌────────────────▼────────────────────────┐ │
│ STEP 3a: SELECT CASH ACCOUNT            │ │
│ Select Cash payment account             │ │
│ [Dropdown - CASH Accounts Only]         │ │
│                                          │ │
│ Format: "Account Name - Balance"        │ │
│ Example: "Cash Box - ₹5,000"            │ │
└────────────────┬───────────────────────┬┘
                 │                       │
                 │    ┌─── IF OTHER MODES (UPI/CHEQUE/ONLINE/CARD) ─┐
                 │    │                                              │
┌────────────────▼────▼──────────────────────────────────┐
│ STEP 3b: SELECT BANK ACCOUNT                          │
│ Select Bank account for payment                       │
│ [Dropdown - BANK Accounts Only]                        │
│                                                        │
│ Format: "Account Name (Type) - Balance"               │
│ Example: "HDFC Current - ₹50,000"                     │
│ Example: "ICICI Savings - ₹25,000"                    │
└────────────────┬─────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────┐
│ STEP 4: MODE-SPECIFIC FIELDS (CONDITIONAL)           │
│ Additional required fields based on payment mode     │
│                                                       │
│ IF MODE = CASH:                                       │
│   (No additional fields needed)                        │
│                                                       │
│ IF MODE = UPI:                                        │
│   □ UTR / Reference ID                               │
│     [Text Input: "202604030123456"]                   │
│                                                       │
│ IF MODE = CHEQUE:                                     │
│   □ Cheque Number *                                   │
│     [Text Input: "ABC123456"]                         │
│   □ Cheque Date *                                     │
│     [Date Picker: Select date]                        │
│                                                       │
│ IF MODE = ONLINE_TRANSFER:                            │
│   □ Transaction ID / Reference                        │
│     [Text Input: "NEFT/RTGS reference"]              │
│                                                       │
│ IF MODE = CARD:                                       │
│   □ Card Reference / Authorization Code              │
│     [Text Input: "AUTH code or reference"]            │
└────────────────┬─────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────┐
│ STEP 5: COMMON PAYMENT DETAILS                        │
│ Information needed for all payment types              │
│                                                       │
│ Amount *                                              │
│   [Currency Input: "₹ 5,000.00"]                      │
│                                                       │
│ Payment Date *                                        │
│   [Date Picker: Today's date selected]               │
│                                                       │
│ Reference Number (Optional)                           │
│   [Text Input: "INV-2026-001"]                        │
│                                                       │
│ Notes (Optional)                                      │
│   [Text Area: "Payment for April invoice"]            │
└────────────────┬─────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────┐
│ STEP 6: RECORD & UPDATE                               │
│ Submit and update all related records                 │
│                                                       │
│ [Primary Button: "Record Payment & Update Ledger"]   │
│ [Secondary Button: "Cancel"]                          │
│                                                       │
│ ✅ On Success:                                        │
│   ├─ Account balance decremented                      │
│   ├─ Vendor/Customer ledger updated                   │
│   ├─ Transaction record created                       │
│   ├─ Audit log entry created                          │
│   └─ Redirect to list with success message            │
│                                                       │
│ ❌ On Error:                                          │
│   ├─ Validation errors highlighted                    │
│   ├─ Error message displayed                          │
│   └─ Form data preserved                              │
└─────────────────────────────────────────────────────┘
```

### Architecture Benefits

| Current                     | New                             | Benefit               |
| --------------------------- | ------------------------------- | --------------------- |
| Account first → Mode second | Mode first → Account second     | Clearer user intent   |
| All ASSET accounts mixed    | Filtered by mode (CASH or BANK) | Easier selection      |
| No mode-specific fields     | Mode-specific fields shown      | Complete data capture |
| No ledger updates           | Automatic ledger updates        | Data consistency      |
| Confusing labels            | Context-aware labels            | Better UX             |

---

## SECTION 4: Complete Functionality & Behavior Flows

### 4.1 Payment Mode Selection Behavior

#### CASH Mode

```
User selects: CASH
  ├─ Account selector immediately shows ONLY CASH accounts
  │  └─ Database query: WHERE type = 'CASH' AND outletId = currentOutletId
  ├─ Label changes to: "Pay From (Cash Box)"
  ├─ Mode-specific fields: NONE (no additional fields)
  └─ Validation: account.type MUST be CASH

Example Display:
  Cash Box - ₹5,000.00
  Petty Cash - ₹2,500.50
  Office Cash - ₹1,200.25
```

#### UPI/RTGS/IMPS Mode

```
User selects: UPI
  ├─ Account selector immediately shows ONLY BANK accounts
  │  └─ Database query: WHERE type = 'BANK' AND outletId = currentOutletId
  ├─ Label changes to: "Pay From (Bank Account)"
  ├─ Mode-specific field appears:
  │  └─ UTR / Reference ID (Optional but recommended)
  ├─ Format examples:
  │  ├─ NEFT: "2026040312345678"
  │  ├─ RTGS: "202604031A234567"
  │  └─ IMPS: "308201605123456"
  └─ Validation: account.type MUST be BANK

Example Display:
  HDFC Current Account - ₹50,000.00
  ICICI Savings Account - ₹25,500.75
  Axis Business - ₹18,900.00
```

#### CHEQUE Mode

```
User selects: CHEQUE
  ├─ Account selector immediately shows ONLY BANK accounts
  ├─ Label changes to: "Pay From (Bank Account)"
  ├─ Mode-specific fields appear (BOTH required):
  │  ├─ Cheque Number
  │  │  ├─ Format: Numeric or Alphanumeric
  │  │  ├─ Examples: "123456", "ABC123456"
  │  │  └─ Validation: Min 6 chars, Max 20 chars
  │  └─ Cheque Date
  │     ├─ Format: Date picker or text (DD-MM-YYYY)
  │     ├─ Validation: Cannot be in future, not older than 6 months
  │     └─ Default: Today's date
  ├─ Cheque tracking:
  │  └─ Used later for clearing status tracking
  └─ Validation: account.type MUST be BANK

Example:
  Cheque Number: "456789"
  Cheque Date: "15-04-2026"
  Account: "HDFC Current Account - ₹50,000.00"
```

#### ONLINE_TRANSFER Mode

```
User selects: ONLINE_TRANSFER
  ├─ Account selector immediately shows ONLY BANK accounts
  ├─ Label changes to: "Pay From (Bank Account)"
  ├─ Mode-specific field appears (Optional):
  │  └─ Transaction ID / Reference
  │     ├─ Examples: "NEFT_20260403_123456", "TXN_ABC_2026040301"
  │     └─ Used for reconciliation with bank statements
  └─ Validation: account.type MUST be BANK

Example:
  Transaction ID: "NEFT_20260403_987654"
  Account: "ICICI Savings Account - ₹25,500.75"
```

#### CARD Mode

```
User selects: CARD
  ├─ Account selector immediately shows ONLY BANK accounts
  ├─ Label changes to: "Pay From (Bank Account)"
  ├─ Mode-specific field appears (Optional):
  │  └─ Card Reference / Authorization Code
  │     └─ Examples: "AUTH123456", "401043", "Card txn ref"
  └─ Validation: account.type MUST be BANK

Example:
  Card Reference: "401043"
  Account: "HDFC Current Account - ₹50,000.00"
```

### 4.2 Account Selection & Filtering

#### Cash Account Selection Flow

```
CASH Mode Selected
  │
  ├─ Query Executed:
  │  └─ SELECT * FROM accounts
  │     WHERE type = 'CASH'
  │     AND outletId = currentOutletId
  │     ORDER BY name ASC
  │
  ├─ Results Displayed:
  │  ├─ Format: [Account Name - Current Balance]
  │  ├─ Examples:
  │  │  ├─ Cash Box - ₹5,000.00
  │  │  ├─ Petty Cash - ₹2,500.50
  │  │  └─ Office Cash - ₹1,200.25
  │  └─ Sorted: Alphabetically by name
  │
  ├─ User Selects Account
  │  └─ accountId stored in form state
  │
  └─ Account Data Stored:
     ├─ currentBalance (for ledger update later)
     └─ type verification: CASH confirmed

Validation Rule:
  ✓ Account must exist
  ✓ Account must belong to current outlet
  ✓ Account type must be CASH
```

#### Bank Account Selection Flow

```
UPI/CHEQUE/ONLINE/CARD Mode Selected
  │
  ├─ Query Executed:
  │  └─ SELECT * FROM accounts
  │     WHERE type = 'BANK'
  │     AND outletId = currentOutletId
  │     ORDER BY name ASC
  │
  ├─ Results Displayed:
  │  ├─ Format: [Bank Name - Account Type - Balance]
  │  ├─ Examples:
  │  │  ├─ HDFC Current - ₹50,000.00
  │  │  ├─ ICICI Savings - ₹25,500.75
  │  │  └─ Axis Business - ₹18,900.00
  │  └─ Sorted: Alphabetically by name
  │
  ├─ User Selects Account
  │  └─ accountId stored in form state
  │
  └─ Account Data Stored:
     ├─ currentBalance (for ledger update later)
     └─ type verification: BANK confirmed

Validation Rule:
  ✓ Account must exist
  ✓ Account must belong to current outlet
  ✓ Account type must be BANK
```

### 4.3 Amount & Date Validation

#### Amount Input

```
Input Constraints:
  ├─ Type: Currency (decimal)
  ├─ Min value: 0.01 (one paisa minimum)
  ├─ Max value: 999,999,999.99
  ├─ Decimal places: 2 (₹ format)
  └─ Required: Yes

Validation Rules:
  ├─ Must be greater than 0
  ├─ Must not exceed account balance (optional warning)
  ├─ Must be valid currency format
  └─ No negative values allowed

Format Display:
  ├─ Input: "5000" → Display: "₹5,000.00"
  ├─ Input: "5000.5" → Display: "₹5,000.50"
  └─ Input: "5000.567" → Error: "Max 2 decimals"

Error Messages:
  ├─ "Amount is required"
  ├─ "Amount must be greater than 0"
  ├─ "Amount format is invalid"
  └─ "Warning: Amount exceeds current balance"
```

#### Payment Date Input

```
Input Constraints:
  ├─ Type: Date
  ├─ Default: Today's date
  ├─ Format: DD-MM-YYYY or date picker
  └─ Required: Yes

Validation Rules:
  ├─ Cannot be in future
  ├─ Cannot be older than 90 days (configurable)
  ├─ For cheques: Cannot be older than 6 months
  └─ Must be valid date

Valid Range:
  ├─ Min date: 90 days ago (or outlet creation date)
  ├─ Max date: Today (or today + 30 days for cheques)
  └─ Default: Today

Error Messages:
  ├─ "Payment date is required"
  ├─ "Date cannot be in future"
  ├─ "Date is too old"
  └─ "Invalid date format"
```

### 4.4 Payment Record Creation & Ledger Update

#### Transaction Creation Process

```
User Submits Form
  │
  ├─ Validation Phase:
  │  ├─ Vendor/Customer exists: ✓
  │  ├─ Account exists: ✓
  │  ├─ Payment mode valid: ✓
  │  ├─ Account type matches mode: ✓
  │  ├─ Amount valid: ✓
  │  ├─ Date valid: ✓
  │  ├─ Mode-specific fields valid: ✓
  │  └─ All errors shown if any fail: ✗
  │
  ├─ Database Transaction Started:
  │  └─ Atomicity guaranteed: All or nothing
  │
  ├─ Step 1: Create AccountTransaction Record
  │  └─ INSERT INTO accountTransactions
  │     (accountId, type, amount, paymentMode,
  │      chequeNumber, chequeDate, utrReference,
  │      transactionId, remarks, userId, createdAt)
  │
  ├─ Step 2: Update Account Balance
  │  └─ UPDATE accounts
  │     SET currentBalance = currentBalance - amount
  │     WHERE id = accountId
  │
  ├─ Step 3: Update Vendor/Customer Ledger
  │  └─ UPDATE parties
  │     SET openingBalance = openingBalance - amount
  │     WHERE id = partyId
  │
  ├─ Step 4: Create Audit Log Entry
  │  └─ INSERT INTO auditLogs
  │     (entity, entityId, action, changes, userId, outletId)
  │
  ├─ Database Transaction Committed
  │  └─ All changes saved atomically
  │
  ├─ Cache Invalidation:
  │  ├─ Revalidate: /dashboard/accounts
  │  └─ Revalidate: /dashboard/purchase/vendors/{partyId}
  │
  └─ User Feedback:
     ├─ Success message: "Payment recorded & ledger updated"
     ├─ Redirect to: Payment list page
     └─ Show: Updated account balance + ledger position

Failure Handling:
  ├─ Validation error → Show errors in form
  ├─ Database error → Rollback + Show error message
  ├─ Authorization error → Show permission error
  └─ Other errors → Generic error message + logging
```

### 4.5 Account Balance Update Details

#### Balance Calculation

```
Account Balance After Payment:

Before:  Account.currentBalance = ₹10,000.00

Payment: Amount = ₹3,000.00

After:   Account.currentBalance = ₹10,000.00 - ₹3,000.00
                                = ₹7,000.00

Database Update:
  UPDATE accounts
  SET currentBalance = currentBalance - 3000
  WHERE id = 'account_123'

Verification:
  SELECT currentBalance FROM accounts WHERE id = 'account_123'
  Result: ₹7,000.00 ✓
```

#### Ledger Update Details

```
Vendor/Customer Ledger Update:

Before:  Party.openingBalance = ₹5,000.00 (Outstanding)

Payment: Amount = ₹3,000.00

After:   Party.openingBalance = ₹5,000.00 - ₹3,000.00
                               = ₹2,000.00 (Remaining Outstanding)

Database Update:
  UPDATE parties
  SET openingBalance = openingBalance - 3000
  WHERE id = 'party_123'

Verification:
  SELECT openingBalance FROM parties WHERE id = 'party_123'
  Result: ₹2,000.00 ✓

Display:
  Before: "Outstanding: ₹5,000.00"
  After:  "Outstanding: ₹2,000.00" ✓
```

### 4.6 Transaction Record Details

#### What Gets Stored

```
AccountTransaction Record Created:

{
  id: "txn_abc123def456",
  accountId: "account_123",
  type: "PAYMENT_MADE",
  amount: 3000.00,
  paymentMode: "CHEQUE",
  chequeNumber: "456789",           // If CHEQUE mode
  chequeDate: "2026-04-15",         // If CHEQUE mode
  utrReference: null,               // If UPI mode
  transactionId: null,              // If ONLINE mode
  referenceNumber: "INV-2026-001",
  remarks: "Payment for April invoice",
  balanceAfter: 7000.00,            // Account balance after this transaction
  userId: "user_123",
  createdAt: "2026-04-03T10:30:00Z",
  updatedAt: "2026-04-03T10:30:00Z"
}

Audit Log Record Created:

{
  id: "audit_xyz789",
  entity: "PAYMENT",
  entityId: "txn_abc123def456",
  action: "CREATE",
  changes: {
    account: "HDFC Current Account",
    amount: 3000.00,
    type: "PAYMENT_MADE",
    vendor: "ABC Vendor Ltd",
    mode: "CHEQUE",
    chequeNumber: "456789"
  },
  userId: "user_123",
  outletId: "outlet_456",
  createdAt: "2026-04-03T10:30:00Z"
}
```

---

## SECTION 5: User Interaction Flows

### Scenario 1: Record Cash Payment

```
USER JOURNEY: Record Cash Payment to Vendor

1. USER NAVIGATES TO PAYMENT PAGE
   └─ URL: /dashboard/accounts/payments/made/new
   └─ Page loads with empty form

2. SELECT VENDOR
   ├─ Click: "Paid To (Vendor)" dropdown
   ├─ See list: [Vendor A, Vendor B, Vendor C...]
   ├─ Select: "ABC Supplies Ltd"
   └─ Form updated: partyId = 'vendor_123'

3. SELECT PAYMENT MODE
   ├─ See payment mode options (radio buttons/tabs)
   ├─ Options: [Cash] [UPI] [Cheque] [Online] [Card]
   ├─ Click: "Cash" option
   └─ Mode selected: paymentMode = 'CASH'

4. ACCOUNT DROPDOWN UPDATES AUTOMATICALLY
   ├─ Dropdown now shows ONLY CASH accounts
   ├─ Display:
   │  ├─ Cash Box - ₹5,000.00
   │  ├─ Petty Cash - ₹2,500.50
   │  └─ Office Cash - ₹1,200.25
   ├─ Click: "Cash Box - ₹5,000.00"
   └─ Account selected: accountId = 'cash_box_123'

5. MODE-SPECIFIC FIELDS
   ├─ No additional fields for CASH mode
   ├─ Form continues to Amount section
   └─ (Skip UPI/Cheque/Online fields)

6. ENTER AMOUNT
   ├─ Click: "Amount" field
   ├─ Enter: "2500"
   ├─ Field shows: "₹2,500.00"
   └─ Amount stored: amount = 2500.00

7. PAYMENT DATE
   ├─ Date picker shows today's date
   ├─ Date preset: "03-04-2026" (today)
   ├─ Can modify if needed
   └─ Date stored: paymentDate = '2026-04-03'

8. ENTER OPTIONAL DETAILS
   ├─ Reference: "CASH-2026-001"
   ├─ Notes: "Payment collected by: John"
   └─ Optional fields filled

9. REVIEW & SUBMIT
   ├─ Form review:
   │  ├─ Vendor: ABC Supplies Ltd ✓
   │  ├─ Mode: CASH ✓
   │  ├─ Account: Cash Box ✓
   │  ├─ Amount: ₹2,500.00 ✓
   │  ├─ Date: 03-04-2026 ✓
   │  └─ Status: Ready to submit ✓
   ├─ Click: "Record Payment & Update Ledger" button
   └─ Form submitted

10. PROCESSING
    ├─ API Call: POST /api/payments/create
    ├─ Server validates all fields
    ├─ Database transaction starts
    ├─ AccountTransaction created
    ├─ Cash Box balance: ₹5,000 - ₹2,500 = ₹2,500 ✓
    ├─ Vendor ledger: ₹5,000 - ₹2,500 = ₹2,500 ✓
    ├─ Audit log created
    ├─ Transaction committed
    └─ Cache invalidated

11. SUCCESS
    ├─ Toast notification: "Payment recorded & ledger updated" ✓
    ├─ Redirect: /dashboard/purchases
    ├─ List updated with new payment
    ├─ Account balance showing: ₹2,500.00 ✓
    ├─ Vendor outstanding updated ✓
    └─ User sees confirmation

RESULT:
✅ Payment: ₹2,500 recorded
✅ Cash Box: ₹5,000 → ₹2,500
✅ Vendor Outstanding: ₹5,000 → ₹2,500
✅ Audit logged
✅ Data consistent
```

### Scenario 2: Record Cheque Payment

```
USER JOURNEY: Record Cheque Payment to Vendor

1-3. [Same as Scenario 1 - Select Vendor]

4. SELECT PAYMENT MODE - CHEQUE
   ├─ Click: "Cheque" option
   ├─ Mode selected: paymentMode = 'CHEQUE'
   └─ Form updates immediately

5. ACCOUNT DROPDOWN UPDATES
   ├─ Now shows ONLY BANK accounts
   ├─ Display:
   │  ├─ HDFC Current - ₹50,000.00
   │  ├─ ICICI Savings - ₹25,500.75
   │  └─ Axis Business - ₹18,900.00
   ├─ Click: "HDFC Current - ₹50,000.00"
   └─ Account selected: accountId = 'hdfc_current_123'

6. MODE-SPECIFIC FIELDS APPEAR - CHEQUE DETAILS
   ├─ Field 1: Cheque Number *
   │  ├─ Enter: "456789"
   │  └─ Stored: chequeNumber = '456789'
   │
   ├─ Field 2: Cheque Date *
   │  ├─ Date picker opens
   │  ├─ Select: "15-04-2026" (Cheque date, usually future)
   │  └─ Stored: chequeDate = '2026-04-15'
   └─ (Both fields required for CHEQUE mode)

7-9. [Same as Scenario 1 - Amount, Date, Optional Details]

10. REVIEW & SUBMIT
    ├─ Form review:
    │  ├─ Vendor: ABC Supplies Ltd ✓
    │  ├─ Mode: CHEQUE ✓
    │  ├─ Account: HDFC Current ✓
    │  ├─ Cheque #: 456789 ✓
    │  ├─ Cheque Date: 15-04-2026 ✓
    │  ├─ Amount: ₹5,000.00 ✓
    │  └─ Status: Ready to submit ✓
    ├─ Click: "Record Payment & Update Ledger" button
    └─ Form submitted

11. PROCESSING
    ├─ Cheque validation:
    │  ├─ Cheque number: Valid format ✓
    │  ├─ Cheque date: Valid date ✓
    │  └─ No duplicate cheque #: ✓
    ├─ Database transaction starts
    ├─ AccountTransaction created with cheque details
    ├─ HDFC Current balance: ₹50,000 - ₹5,000 = ₹45,000
    ├─ Vendor ledger: ₹5,000 - ₹5,000 = ₹0 (Settled)
    ├─ Transaction committed
    └─ Cache invalidated

12. SUCCESS
    ├─ Toast: "Payment recorded & ledger updated" ✓
    ├─ Redirect to payment list
    ├─ Payment shows:
    │  ├─ Type: CHEQUE
    │  ├─ Cheque #: 456789
    │  ├─ Amount: ₹5,000
    │  └─ Status: Recorded
    └─ User sees confirmation

RESULT:
✅ Payment: ₹5,000 recorded with Cheque #456789
✅ HDFC Current: ₹50,000 → ₹45,000
✅ Vendor Outstanding: ₹5,000 → ₹0 (Settled)
✅ Cheque details stored for reconciliation
✅ Audit logged with cheque details
```

### Scenario 3: Record UPI Payment

```
USER JOURNEY: Record UPI Payment to Vendor

1-3. [Same as Scenario 1 - Select Vendor]

4. SELECT PAYMENT MODE - UPI
   ├─ Click: "UPI / RTGS / IMPS" option
   ├─ Mode selected: paymentMode = 'UPI'
   └─ Form updates immediately

5. ACCOUNT DROPDOWN UPDATES
   ├─ Now shows ONLY BANK accounts
   ├─ Click: "ICICI Savings - ₹25,500.75"
   └─ Account selected: accountId = 'icici_savings_123'

6. MODE-SPECIFIC FIELD APPEARS - UTR REFERENCE
   ├─ Field: UTR / Reference ID (Optional)
   ├─ Placeholder: "e.g., 202604030123456"
   ├─ User enters: "202604031UPI123456"
   └─ Stored: utrReference = '202604031UPI123456'

7-9. [Same as Scenario 1 - Amount, Date, Optional Details]

10. SUBMIT FORM

11. PROCESSING & SUCCESS
    ├─ UPI payment recorded with UTR
    ├─ ICICI Savings: ₹25,500.75 - ₹3,500 = ₹22,000.75
    ├─ Vendor ledger updated
    ├─ UTR stored in transaction record
    └─ User sees success notification

RESULT:
✅ UPI Payment: ₹3,500 with UTR stored
✅ Account balance updated
✅ Ledger updated
✅ UTR reference available for bank reconciliation
```

---

## SECTION 6: Technical Implementation

### 6.1 Component Architecture

```
/src/app/dashboard/accounts/payments/made/new/
├─ page.tsx (Main Form Component)
│  ├─ State Management
│  │  ├─ vendorId
│  │  ├─ paymentMode
│  │  ├─ accountId
│  │  ├─ amount
│  │  ├─ paymentDate
│  │  ├─ chequeNumber (if CHEQUE)
│  │  ├─ chequeDate (if CHEQUE)
│  │  ├─ utrReference (if UPI)
│  │  ├─ transactionId (if ONLINE)
│  │  ├─ reference
│  │  └─ notes
│  │
│  ├─ Effects
│  │  ├─ Load vendors on mount
│  │  ├─ Load accounts when mode changes
│  │  ├─ Show/hide mode-specific fields
│  │  └─ Validate form in real-time
│  │
│  └─ Handlers
│     ├─ onVendorChange()
│     ├─ onModeChange()
│     ├─ onAccountChange()
│     ├─ onSubmit()
│     └─ onCancel()
│
├─ /components/payment-mode-selector.tsx
│  ├─ Props: mode, onChange
│  ├─ Display: Radio buttons or tabs
│  └─ Options: CASH, UPI, CHEQUE, ONLINE, CARD
│
├─ /components/payment-mode-fields.tsx (NEW)
│  ├─ Props: mode, register, watch, errors
│  ├─ Conditional rendering based on mode
│  ├─ CASH: Return null (no fields)
│  ├─ UPI: UTR input field
│  ├─ CHEQUE: Cheque # + Date fields
│  ├─ ONLINE: Transaction ID field
│  └─ CARD: Card reference field
│
└─ /actions/accounting/index.ts
   ├─ getCashAccounts(outletId)
   ├─ getBankAccounts(outletId)
   └─ createPayment(data)
```

### 6.2 Data Flow Diagram

```
┌─────────────────────────────────────┐
│ User Selects Payment Mode           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ useEffect Hook Triggered            │
│ Dependency: [selectedMode]          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Server Action Called                │
│ if mode === CASH:                   │
│   getCashAccounts(outletId)         │
│ else:                               │
│   getBankAccounts(outletId)         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Database Query                      │
│ SELECT * FROM accounts WHERE...     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Results Returned to Client          │
│ setAccounts(filteredAccounts)       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Form Updates                        │
│ Account dropdown refreshed          │
│ with filtered accounts              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Mode-Specific Fields                │
│ <PaymentModeSpecificFields          │
│   mode={selectedMode}               │
│   {...props}                        │
│ />                                  │
│ Conditionally render fields         │
└─────────────────────────────────────┘
```

### 6.3 Form Validation Flow

```
User Submits Form
  │
  ├─ Client-Side Validation (React Hook Form + Zod)
  │  ├─ partyId required? ✓
  │  ├─ paymentMode valid? ✓
  │  ├─ accountId required? ✓
  │  ├─ amount > 0? ✓
  │  ├─ paymentDate valid? ✓
  │  ├─ Mode-specific fields valid?
  │  │  ├─ CASH: (none)
  │  │  ├─ UPI: utrReference optional
  │  │  ├─ CHEQUE: chequeNumber required, chequeDate required
  │  │  ├─ ONLINE: transactionId optional
  │  │  └─ CARD: cardReference optional
  │  └─ If any error: Display errors, prevent submission
  │
  └─ Server-Side Validation (if passed client validation)
     ├─ Vendor/Customer exists? ✓
     ├─ Account exists and belongs to outlet? ✓
     ├─ Account type matches payment mode? ✓
     ├─ Amount positive? ✓
     ├─ Account has sufficient balance? (warning only)
     ├─ No duplicate cheque? (if CHEQUE mode)
     ├─ Cheque date valid? (if CHEQUE mode)
     └─ If any error: Rollback, return error

Validation Error Response Format:
{
  success: false,
  error: {
    message: "Validation failed",
    field: "chequeNumber",
    issues: ["Cheque number is required"]
  }
}

Success Response Format:
{
  success: true,
  data: {
    transactionId: "txn_abc123",
    accountBalance: 7000.00,
    vendorOutstanding: 2500.00
  }
}
```

---

## SECTION 7: Code Snippets & Examples

### 7.1 Account Filtering Functions

```typescript
// File: /src/actions/accounting/index.ts

/**
 * Get all CASH type accounts for an outlet
 * Used when payment mode is CASH
 */
export async function getCashAccounts(outletId: string) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    const accounts = await prisma.account.findMany({
      where: {
        outletId,
        type: "CASH",
      },
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        currentBalance: true,
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    return {
      success: true,
      data: accounts.map((acc) => ({
        id: acc.id,
        name: acc.name,
        code: acc.code,
        balance: acc.currentBalance,
        display: `${acc.name} - ₹${acc.currentBalance.toFixed(2)}`,
      })),
    };
  });
}

/**
 * Get all BANK type accounts for an outlet
 * Used when payment mode is UPI/CHEQUE/ONLINE/CARD
 */
export async function getBankAccounts(outletId: string) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    const accounts = await prisma.account.findMany({
      where: {
        outletId,
        type: "BANK",
      },
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        currentBalance: true,
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: accounts.map((acc) => ({
        id: acc.id,
        name: acc.name,
        code: acc.code,
        balance: acc.currentBalance,
        display: `${acc.name} - ₹${acc.currentBalance.toFixed(2)}`,
      })),
    };
  });
}

/**
 * Get accounts by type (helper for dynamic filtering)
 */
export async function getAccountsByType(outletId: string, mode: PaymentMode) {
  if (mode === "CASH") {
    return getCashAccounts(outletId);
  } else {
    return getBankAccounts(outletId);
  }
}
```

### 7.2 Payment Creation with Ledger Update

```typescript
// File: /src/actions/accounting/index.ts

/**
 * Create payment and update account/ledger balances atomically
 * Handles all payment types with mode-specific data
 */
export async function createPayment(data: {
  partyId: string;
  outletId: string;
  accountId: string;
  amount: number;
  date: Date;
  type: "PAYMENT_MADE" | "PAYMENT_RECEIVED";
  reference?: string;
  mode?: PaymentMode;
  chequeNumber?: string;
  chequeDate?: Date;
  utrReference?: string;
  transactionId?: string;
  cardReference?: string;
  notes?: string;
}) {
  return withErrorHandler(async () => {
    // Validate session access
    await validateSessionOutletAccess(data.outletId);

    // Validate account exists and belongs to outlet
    const account = await prisma.account.findFirst({
      where: {
        id: data.accountId,
        outletId: data.outletId,
      },
    });

    if (!account) {
      throw new ValidationError("Account not found");
    }

    // Validate account type matches payment mode
    if (data.mode === "CASH" && account.type !== "CASH") {
      throw new ValidationError("CASH mode requires a CASH account");
    }
    if (
      ["UPI", "CHEQUE", "ONLINE_TRANSFER", "CARD"].includes(data.mode || "") &&
      account.type !== "BANK"
    ) {
      throw new ValidationError(`${data.mode} mode requires a BANK account`);
    }

    // Validate vendor/party exists
    const vendor = await prisma.party.findFirst({
      where: {
        id: data.partyId,
        outletId: data.outletId,
      },
    });

    if (!vendor) {
      throw new ValidationError("Vendor/Customer not found");
    }

    // Use transaction for atomic updates
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create account transaction record
      const accountTransaction = await tx.accountTransaction.create({
        data: {
          accountId: data.accountId,
          type: data.type,
          amount: new Decimal(data.amount),
          paymentMode: data.mode as any,
          balanceAfter: new Decimal(
            data.type === "PAYMENT_MADE"
              ? account.currentBalance.toNumber() - data.amount
              : account.currentBalance.toNumber() + data.amount,
          ),
          remarks: data.notes || data.reference || "",
          userId: (await getServerSession(authOptions))?.user?.id || "",
          // Mode-specific details
          chequeNumber: data.chequeNumber || null,
          chequeDate: data.chequeDate || null,
          transactionId: data.transactionId || null,
          utrReference: data.utrReference || null,
          referenceNumber: data.reference || null,
        },
      });

      // 2. Update account balance
      const updatedAccount = await tx.account.update({
        where: { id: data.accountId },
        data: {
          currentBalance:
            data.type === "PAYMENT_MADE"
              ? { decrement: new Decimal(data.amount) }
              : { increment: new Decimal(data.amount) },
        },
      });

      // 3. Update vendor/party ledger balance
      const updatedParty = await tx.party.update({
        where: { id: data.partyId },
        data: {
          openingBalance:
            data.type === "PAYMENT_MADE"
              ? { decrement: new Decimal(data.amount) }
              : { increment: new Decimal(data.amount) },
        },
      });

      // 4. Create audit log entry
      await tx.auditLog.create({
        data: {
          entity: "PAYMENT",
          entityId: accountTransaction.id,
          action: "CREATE",
          changes: {
            account: account.name,
            amount: data.amount,
            type: data.type,
            vendor: vendor.name,
            mode: data.mode,
            chequeNumber: data.chequeNumber,
            utrReference: data.utrReference,
            transactionId: data.transactionId,
          },
          userId: (await getServerSession(authOptions))!.user!.id,
          outletId: data.outletId,
        },
      });

      return {
        transaction: accountTransaction,
        account: updatedAccount,
        party: updatedParty,
      };
    });

    // Revalidate related pages
    revalidatePath("/dashboard/accounts");
    revalidatePath(`/dashboard/purchase/vendors/${data.partyId}`);

    return {
      success: true,
      data: {
        transactionId: result.transaction.id,
        accountBalance: result.account.currentBalance,
        vendorOutstanding: result.party.openingBalance,
      },
    };
  });
}
```

### 7.3 Mode-Specific Fields Component

```typescript
// File: /src/components/accounts/payment-mode-fields.tsx

"use client";

import { PaymentMode } from "@/generated/prisma";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  UseFormRegister,
  FieldValues,
  UseFormWatch,
} from "react-hook-form";

interface PaymentModeSpecificFieldsProps {
  mode: PaymentMode | "";
  register: UseFormRegister<FieldValues>;
  watch: UseFormWatch<FieldValues>;
  errors: Record<string, any>;
}

/**
 * Conditionally render payment mode-specific fields
 * CASH: No additional fields
 * UPI: UTR/Reference
 * CHEQUE: Cheque number + date
 * ONLINE: Transaction ID
 * CARD: Card reference
 */
export function PaymentModeSpecificFields({
  mode,
  register,
  watch,
  errors,
}: PaymentModeSpecificFieldsProps) {
  // CASH mode - no additional fields needed
  if (mode === "CASH") {
    return null;
  }

  // UPI mode - UTR/Reference
  if (mode === "UPI") {
    return (
      <FormItem>
        <FormLabel className="block text-sm font-semibold text-slate-700 mb-1.5">
          UTR / Reference ID (Recommended)
        </FormLabel>
        <FormControl>
          <Input
            {...register("utrReference")}
            placeholder="e.g., 202604030123456"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </FormControl>
        {errors.utrReference && (
          <FormMessage>{errors.utrReference.message}</FormMessage>
        )}
      </FormItem>
    );
  }

  // CHEQUE mode - Cheque number and date (REQUIRED)
  if (mode === "CHEQUE") {
    return (
      <div className="grid grid-cols-2 gap-4">
        <FormItem>
          <FormLabel className="block text-sm font-semibold text-slate-700 mb-1.5">
            Cheque Number *
          </FormLabel>
          <FormControl>
            <Input
              {...register("chequeNumber", {
                required: "Cheque number is required",
                minLength: {
                  value: 6,
                  message: "Cheque number must be at least 6 characters",
                },
              })}
              placeholder="e.g., 456789"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </FormControl>
          {errors.chequeNumber && (
            <FormMessage>{errors.chequeNumber.message}</FormMessage>
          )}
        </FormItem>

        <FormItem>
          <FormLabel className="block text-sm font-semibold text-slate-700 mb-1.5">
            Cheque Date *
          </FormLabel>
          <FormControl>
            <Input
              type="date"
              {...register("chequeDate", {
                required: "Cheque date is required",
              })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </FormControl>
          {errors.chequeDate && (
            <FormMessage>{errors.chequeDate.message}</FormMessage>
          )}
        </FormItem>
      </div>
    );
  }

  // ONLINE_TRANSFER mode - Transaction ID
  if (mode === "ONLINE_TRANSFER") {
    return (
      <FormItem>
        <FormLabel className="block text-sm font-semibold text-slate-700 mb-1.5">
          Transaction ID / Reference (Recommended)
        </FormLabel>
        <FormControl>
          <Input
            {...register("transactionId")}
            placeholder="e.g., NEFT/RTGS reference number"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </FormControl>
        {errors.transactionId && (
          <FormMessage>{errors.transactionId.message}</FormMessage>
        )}
      </FormItem>
    );
  }

  // CARD mode - Card reference
  if (mode === "CARD") {
    return (
      <FormItem>
        <FormLabel className="block text-sm font-semibold text-slate-700 mb-1.5">
          Card Reference / Authorization Code
        </FormLabel>
        <FormControl>
          <Input
            {...register("cardReference")}
            placeholder="e.g., AUTH code or reference"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </FormControl>
        {errors.cardReference && (
          <FormMessage>{errors.cardReference.message}</FormMessage>
        )}
      </FormItem>
    );
  }

  return null;
}
```

### 7.4 Refactored Main Form Component

// File: /src/app/dashboard/accounts/payments/made/new/page.tsx

### 7.5 Updated Validation Schema

```typescript
// File: /src/validations/payment.validation.ts

import { z } from "zod";

export const generalPaymentSchema = z
  .object({
    partyId: z.string().min(1, "Vendor is required"),
    paymentMode: z.enum(["CASH", "UPI", "CHEQUE", "ONLINE_TRANSFER", "CARD"], {
      errorMap: () => ({ message: "Payment mode is required" }),
    }),
    accountId: z.string().min(1, "Account is required"),
    amount: z
      .number()
      .min(0.01, "Amount must be greater than 0")
      .max(999999999.99, "Amount exceeds maximum limit"),
    paymentDate: z.string().min(1, "Payment date is required"),

    // Optional mode-specific fields
    utrReference: z.string().optional(),
    chequeNumber: z.string().optional(),
    chequeDate: z.string().optional(),
    transactionId: z.string().optional(),
    cardReference: z.string().optional(),
    reference: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validate mode-specific required fields
    if (
      data.paymentMode === "UPI" &&
      data.utrReference &&
      data.utrReference.length < 6
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["utrReference"],
        message: "UTR must be at least 6 characters",
      });
    }

    if (data.paymentMode === "CHEQUE") {
      if (!data.chequeNumber || data.chequeNumber.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["chequeNumber"],
          message: "Cheque number is required (min 6 characters)",
        });
      }
      if (!data.chequeDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["chequeDate"],
          message: "Cheque date is required",
        });
      }
    }

    if (
      data.paymentMode === "ONLINE_TRANSFER" &&
      data.transactionId &&
      data.transactionId.length < 5
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["transactionId"],
        message: "Transaction ID is required (min 5 characters)",
      });
    }
  });

export type GeneralPaymentFormValues = z.infer<typeof generalPaymentSchema>;
```

---

## SECTION 8: Data Model & State Management

### 8.1 Database Schema

```prisma
// Account model
model Account {
  id                String   @id @default(cuid())
  outletId          String
  outlet            Outlet   @relation(fields: [outletId], references: [id])

  name              String
  code              String
  type              AccountType    // CASH, BANK, CREDIT_CARD, etc.
  group             AccountGroup   // ASSET, LIABILITY, etc.

  currentBalance    Decimal  @default(0)
  openingBalance    Decimal  @default(0)

  // Relations
  transactions      AccountTransaction[]

  @@unique([outletId, code])
  @@index([outletId, type])
}

// AccountTransaction model
model AccountTransaction {
  id                String   @id @default(cuid())
  accountId         String
  account           Account  @relation(fields: [accountId], references: [id])

  type              TransactionType  // PAYMENT_MADE, PAYMENT_RECEIVED, etc.
  amount            Decimal
  paymentMode       PaymentMode?     // CASH, UPI, CHEQUE, ONLINE_TRANSFER, CARD

  // Mode-specific fields
  chequeNumber      String?
  chequeDate        DateTime?
  utrReference      String?
  transactionId     String?
  cardReference     String?
  referenceNumber   String?

  // Balance after this transaction
  balanceAfter      Decimal
  remarks           String?

  userId            String
  createdAt         DateTime @default(now())

  @@index([accountId])
  @@index([type])
  @@index([createdAt])
}

// Party (Vendor/Customer) model
model Party {
  id                String   @id @default(cuid())
  outletId          String
  outlet            Outlet   @relation(fields: [outletId], references: [id])

  name              String
  type              PartyType   // VENDOR, CUSTOMER, EMPLOYEE, etc.

  openingBalance    Decimal  @default(0)  // Outstanding balance

  @@unique([outletId, name])
  @@index([outletId, type])
}

// Enums
enum AccountType {
  CASH
  BANK
  CREDIT_CARD
  LOAN
}

enum PaymentMode {
  CASH
  UPI
  CHEQUE
  ONLINE_TRANSFER
  CARD
}

enum TransactionType {
  PAYMENT_MADE
  PAYMENT_RECEIVED
}

enum PartyType {
  VENDOR
  CUSTOMER
  EMPLOYEE
  SUPPLIER
}
```

### 8.2 Component State Management

```typescript
// Form State Structure
interface PaymentFormState {
  // Step 1: Vendor selection
  partyId: string;

  // Step 2: Payment mode
  paymentMode: PaymentMode | "";

  // Step 3: Account selection
  accountId: string;

  // Step 4: Mode-specific fields
  chequeNumber?: string;
  chequeDate?: string;
  utrReference?: string;
  transactionId?: string;
  cardReference?: string;

  // Step 5: Common details
  amount: number;
  paymentDate: string;

  // Additional
  reference?: string;
  notes?: string;
}

// UI State
interface PaymentUIState {
  isSubmitting: boolean;
  vendorsList: Party[];
  accountsList: Account[];
  selectedMode: PaymentMode | "";
  isLoadingAccounts: boolean;
  error?: string;
}
```

---

## SECTION 9: Testing Strategy & Scenarios

### 9.1 Unit Test Cases

#### Account Filtering Tests

```typescript
describe("Account Filtering Functions", () => {
  describe("getCashAccounts()", () => {
    it("should return only CASH type accounts", async () => {
      const result = await getCashAccounts("outlet_123");
      expect(result.data).toHaveLength(3);
      expect(result.data.every((acc) => acc.type === "CASH")).toBe(true);
    });

    it("should filter by outlet", async () => {
      const result = await getCashAccounts("outlet_123");
      expect(result.data.every((acc) => acc.outletId === "outlet_123")).toBe(
        true,
      );
    });

    it("should return error if unauthorized", async () => {
      const result = await getCashAccounts("other_outlet");
      expect(result.success).toBe(false);
    });
  });

  describe("getBankAccounts()", () => {
    it("should return only BANK type accounts", async () => {
      const result = await getBankAccounts("outlet_123");
      expect(result.data).toHaveLength(5);
      expect(result.data.every((acc) => acc.type === "BANK")).toBe(true);
    });
  });
});
```

#### Payment Creation Tests

```typescript
describe("createPayment()", () => {
  it("should create payment and update account balance", async () => {
    const initialBalance = 10000;
    const paymentAmount = 3000;

    const result = await createPayment({
      partyId: "vendor_123",
      outletId: "outlet_123",
      accountId: "cash_123",
      amount: paymentAmount,
      date: new Date(),
      type: "PAYMENT_MADE",
      mode: "CASH",
    });

    expect(result.success).toBe(true);
    expect(result.data.accountBalance).toBe(initialBalance - paymentAmount);
  });

  it("should update vendor ledger", async () => {
    const result = await createPayment({...});
    expect(result.data.vendorOutstanding).toBeLessThan(expectedOutstanding);
  });

  it("should validate account type matches payment mode", async () => {
    const result = await createPayment({
      ...validData,
      mode: "CASH",
      accountId: "bank_account_123", // Wrong type
    });

    expect(result.success).toBe(false);
    expect(result.error.message).toContain("CASH mode requires CASH account");
  });

  it("should require cheque number for CHEQUE mode", async () => {
    const result = await createPayment({
      ...validData,
      mode: "CHEQUE",
      chequeNumber: undefined,
    });

    expect(result.success).toBe(false);
  });
});
```

### 9.2 Integration Test Scenarios

#### End-to-End: Cash Payment

```typescript
test("E2E: Record cash payment and verify all updates", async () => {
  // 1. Get initial balances
  const initialAccount = await db.account.findUnique({
    where: { id: "cash_123" },
  });
  const initialVendor = await db.party.findUnique({
    where: { id: "vendor_123" },
  });

  // 2. Record payment
  const payment = await createPayment({
    partyId: "vendor_123",
    outletId: "outlet_123",
    accountId: "cash_123",
    amount: 2500,
    date: new Date(),
    type: "PAYMENT_MADE",
    mode: "CASH",
    reference: "CASH-001",
  });

  // 3. Verify payment created
  expect(payment.success).toBe(true);

  // 4. Verify account balance updated
  const updatedAccount = await db.account.findUnique({
    where: { id: "cash_123" },
  });
  expect(updatedAccount.currentBalance).toBe(
    initialAccount.currentBalance.toNumber() - 2500,
  );

  // 5. Verify vendor ledger updated
  const updatedVendor = await db.party.findUnique({
    where: { id: "vendor_123" },
  });
  expect(updatedVendor.openingBalance).toBe(
    initialVendor.openingBalance.toNumber() - 2500,
  );

  // 6. Verify transaction record created
  const transaction = await db.accountTransaction.findUnique({
    where: { id: payment.data.transactionId },
  });
  expect(transaction).toMatchObject({
    amount: 2500,
    paymentMode: "CASH",
    type: "PAYMENT_MADE",
    referenceNumber: "CASH-001",
  });

  // 7. Verify audit log created
  const audit = await db.auditLog.findFirst({
    where: { entityId: payment.data.transactionId },
  });
  expect(audit).toBeDefined();
  expect(audit.action).toBe("CREATE");
});
```

#### End-to-End: Cheque Payment

```typescript
test("E2E: Record cheque payment with all mode-specific data", async () => {
  const payment = await createPayment({
    partyId: "vendor_456",
    outletId: "outlet_123",
    accountId: "hdfc_bank_123",
    amount: 5000,
    date: new Date(),
    type: "PAYMENT_MADE",
    mode: "CHEQUE",
    chequeNumber: "456789",
    chequeDate: new Date("2026-04-15"),
  });

  // Verify cheque-specific data
  const transaction = await db.accountTransaction.findUnique({
    where: { id: payment.data.transactionId },
  });
  expect(transaction).toMatchObject({
    paymentMode: "CHEQUE",
    chequeNumber: "456789",
    chequeDate: new Date("2026-04-15"),
  });
});
```

### 9.3 User Acceptance Testing

#### Test Case 1: Cash Payment Flow

```
Steps:
1. Navigate to New Payment page
2. Select Vendor: "ABC Supplies"
3. Select Mode: CASH
4. Verify: Only cash accounts shown
5. Select Account: "Cash Box"
6. Verify: No mode-specific fields shown
7. Enter Amount: 2500
8. Enter Date: Today
9. Click: Record Payment
10. Verify: Success message shown
11. Verify: Account balance decreased
12. Verify: Vendor balance decreased

Expected Result: ✅ PASS
```

#### Test Case 2: Cheque Payment with Validation

```
Steps:
1. Select Mode: CHEQUE
2. Verify: Only bank accounts shown
3. Select Account: "HDFC Current"
4. Verify: Cheque fields appear
5. Enter Cheque #: (empty)
6. Click: Record Payment
7. Verify: Error "Cheque number required"
8. Enter Cheque #: "456789"
9. Verify: Error cleared
10. Enter Cheque Date: (empty)
11. Click: Record Payment
12. Verify: Error "Cheque date required"
13. Enter Cheque Date: "15-04-2026"
14. Enter Amount: 5000
15. Click: Record Payment
16. Verify: Success message

Expected Result: ✅ PASS
```

---

## SECTION 10: Risk Assessment & Mitigation

### Risk Matrix

| Risk                                   | Severity | Probability | Mitigation                                        |
| -------------------------------------- | -------- | ----------- | ------------------------------------------------- |
| Account balance becomes negative       | HIGH     | LOW         | Add balance validation warning, optional blocking |
| Duplicate cheque numbers               | MEDIUM   | MEDIUM      | Add unique constraint check, validation           |
| Transaction rollback mid-process       | HIGH     | LOW         | Use database transactions, error handling         |
| Vendor ledger mismatch                 | MEDIUM   | MEDIUM      | Audit logging, reconciliation reports             |
| User confusion with new flow           | LOW      | MEDIUM      | Help tooltips, onboarding, documentation          |
| Performance issues with large datasets | LOW      | LOW         | Add pagination, indexing, caching                 |
| Data loss on network error             | MEDIUM   | LOW         | Client-side caching, retry logic                  |

### Mitigation Strategies

1. **Database Transactions**
   - All updates wrapped in `prisma.$transaction()`
   - Atomicity guaranteed: all or nothing
   - Automatic rollback on error

2. **Validation & Error Handling**
   - Client-side validation with Zod
   - Server-side validation
   - Clear error messages
   - Form data preserved on error

3. **Audit Logging**
   - Every payment logged with timestamp
   - User ID tracked
   - All changes recorded
   - Audit trail for compliance

4. **Testing**
   - Unit tests for account filtering
   - Integration tests for payment flow
   - UAT with real users
   - Regression testing

---

## SECTION 11: Implementation Timeline

### Phase 1: Account Filtering (2-3 hours)

**Goal:** Implement backend account filtering functions

- [ ] Create `getCashAccounts()` function
- [ ] Create `getBankAccounts()` function
- [ ] Add validation and error handling
- [ ] Test both functions

**Deliverables:**

- Two new action functions ready for use

### Phase 2: Form Refactoring (3-4 hours)

**Goal:** Restructure form with new flow

- [ ] Move payment mode selector to top
- [ ] Update form state management
- [ ] Implement conditional account filtering
- [ ] Update form labels
- [ ] Add mode-specific field visibility logic

**Deliverables:**

- Form with new payment mode → account flow
- Dynamic account loading working

### Phase 3: Mode-Specific Fields (2-3 hours)

**Goal:** Create PaymentModeSpecificFields component

- [ ] Create component structure
- [ ] Implement CASH mode (none)
- [ ] Implement UPI fields
- [ ] Implement CHEQUE fields
- [ ] Implement ONLINE fields
- [ ] Implement CARD fields
- [ ] Add validation for each mode

**Deliverables:**

- Reusable component for mode-specific fields

### Phase 4: Ledger Updates (3-4 hours)

**Goal:** Implement account and ledger balance updates

- [ ] Update `createPayment()` action
- [ ] Implement account balance update
- [ ] Implement vendor/customer ledger update
- [ ] Add audit logging
- [ ] Add transaction error handling

**Deliverables:**

- Payment creation with automatic ledger updates

### Phase 5: Testing & QA (4-5 hours)

**Goal:** Comprehensive testing

- [ ] Unit tests for account filtering
- [ ] Integration tests for payment flow
- [ ] E2E tests for all payment modes
- [ ] UAT scenarios
- [ ] Performance testing

**Deliverables:**

- All tests passing
- Ready for production

### Phase 6: Deployment & Monitoring (1-2 hours)

**Goal:** Deploy to production

- [ ] Merge to main branch
- [ ] Deploy to staging
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] User communication

---

## SECTION 12: Success Criteria Checklist

### Functional Requirements

- [ ] Payment mode is primary selection (not secondary)
- [ ] Account selector shows filtered accounts based on payment mode
- [ ] CASH mode shows only CASH accounts
- [ ] UPI/CHEQUE/ONLINE/CARD show only BANK accounts
- [ ] Mode-specific fields appear/disappear correctly
- [ ] All mode-specific fields work (cheque, UTR, etc.)
- [ ] Payment amount validated (> 0)
- [ ] Payment date validated
- [ ] Form submission successful

### Data Updates

- [ ] Account balance decremented after payment
- [ ] Vendor/customer ledger decreased after payment
- [ ] Transaction record created with all details
- [ ] Audit log entry created
- [ ] Mode-specific data stored (cheque #, UTR, etc.)
- [ ] Balance calculations correct
- [ ] Ledger calculations correct

### User Experience

- [ ] Form is intuitive and easy to follow
- [ ] Error messages are clear
- [ ] Success message confirms action
- [ ] No confusing labels or fields
- [ ] Form data preserved on error
- [ ] Loading states shown
- [ ] Mobile-friendly layout

### Performance

- [ ] Page loads in < 2 seconds
- [ ] Form submission completes in < 3 seconds
- [ ] Account filtering instant (< 500ms)
- [ ] No unnecessary re-renders
- [ ] No memory leaks

### Security & Compliance

- [ ] Outlet access validated
- [ ] Vendor access validated
- [ ] Account access validated
- [ ] Audit trail complete
- [ ] User actions logged
- [ ] No data leaks
- [ ] Proper error handling

### Testing

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] UAT scenarios pass
- [ ] No regression issues
- [ ] All edge cases handled

---

## Conclusion

This comprehensive specification provides complete details for implementing the Record Payment refactor including:

✅ **Clear Problem Statement**: Identified all current issues
✅ **Detailed Solution**: New user flow and architecture
✅ **Complete Behavior Flows**: Step-by-step user journeys
✅ **Implementation Code**: Production-ready snippets
✅ **Testing Strategy**: Comprehensive test scenarios
✅ **Risk Mitigation**: Identified and addressed risks
✅ **Timeline**: Realistic implementation phases
✅ **Success Criteria**: Measurable outcomes

---
