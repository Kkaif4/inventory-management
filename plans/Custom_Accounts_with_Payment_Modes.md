Here’s a **clean, complete FRD** for your Custom Accounts + Payment Modes feature — no fluff, business-focused, and implementable.

---

# 📄 Functional Requirement Document (FRD)

## Feature: Custom Accounts with Payment Modes

---

## 1. Overview

The system must allow users to create and manage financial accounts to track all money movements.

Accounts will be used for:

- Receiving payments
- Making payments
- Recording expenses
- Internal transfers

Each transaction must be linked to an account and a payment mode.

---

## 2. Objectives

- Track all cash and bank balances accurately
- Support multiple payment methods (UPI, cheque, etc.)
- Enable internal fund transfers
- Prevent inconsistent or untraceable money flow

---

## 3. Account Types

### 3.1 Cash Account

- Represents physical cash (cash drawer, petty cash)
- Supports only **Cash** transactions

---

### 3.2 Bank Account

- Represents bank balances
- Supports multiple payment modes:
  - UPI
  - Cheque
  - Online Transfer (NEFT/RTGS/IMPS)
  - Card (optional)

---

## 4. Account Management

### 4.1 Create Account

User can create a new account with:

- Account Name (required)
- Account Type (Cash / Bank) (required)
- Opening Balance (optional)

---

### 4.2 View Accounts

User can:

- View list of all accounts
- See current balance of each account

---

### 4.3 Update Account

User can:

- Edit account name
- Update basic details (non-critical)

---

### 4.4 Delete Account

- Allowed only if no transactions are linked
- Otherwise, disable deletion or allow archive

---

## 5. Payment Modes

### 5.1 Definition

Payment Mode defines **how money is transferred**, not where it is stored.

---

### 5.2 Allowed Modes

| Account Type | Allowed Modes                      |
| ------------ | ---------------------------------- |
| Cash         | Cash only                          |
| Bank         | UPI, Cheque, Online Transfer, Card |

---

### 5.3 Mode-Specific Fields

- **Cheque**
  - Cheque Number
  - Cheque Date

- **UPI**
  - UPI Reference ID

- **Online Transfer**
  - Transaction ID

---

## 6. Transaction Usage

Accounts must be used in all financial transactions:

---

### 6.1 Customer Payment (Money In)

- Select Account
- Select Payment Mode
- Amount is added to selected account

---

### 6.2 Vendor Payment (Money Out)

- Select Account
- Select Payment Mode
- Amount is deducted from selected account

---

### 6.3 Expense Entry

- Select Account
- Select Payment Mode
- Amount is deducted

---

## 7. Internal Transfer

### 7.1 Purpose

Transfer funds between accounts.

---

### 7.2 Flow

User selects:

- From Account
- To Account
- Amount

---

### 7.3 System Behavior

- Deduct from source account
- Add to destination account
- Record both sides of transaction

---

### 7.4 Validation

- Source and destination cannot be same
- Amount must be greater than zero

---

## 8. Balance Calculation

Each account balance is derived from:

```text
Opening Balance
+ Money Received
- Money Paid
± Transfers
```

---

## 9. Validation Rules

- Account must be selected for every transaction
- Payment mode must match account type
- No transaction without account
- Prevent invalid payment mode selection
- Optional: prevent negative balance

---

## 10. Reporting

System should support:

- Account-wise balance view
- Transaction history per account
- Filter by payment mode
- Transfer logs

---

## 11. Edge Cases

- Overpayment → allowed, balance increases
- Transfer to same account → reject
- Invalid payment mode → reject
- Missing reference details (for cheque/UPI) → validation error

---

## 12. Key Principles

- Account = where money is stored
- Payment Mode = how money is moved
- Always track both separately
- Never allow unlinked transactions

---

## 13. Summary

This feature ensures:

- Accurate financial tracking
- Clean separation of account vs payment mode
- Full visibility of all money movement
- Scalable foundation for future accounting features

---

# ⚠️ Final Reality Check

If you skip:

- proper account linking
- mode validation
- transfer tracking

👉 your balances will drift
👉 reconciliation will fail
👉 reports will be useless

---

If you want next level, I can give you:

- ledger-based accounting (proper double entry)
- reconciliation flow (bank vs system)

That’s what separates basic ERP from serious systems.
