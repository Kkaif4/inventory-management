
---

# Functional Requirements Document

## Module M03 — Inventory Management

Industrial Equipment & Hardware ERP

Version: **1.1**
Feature additions: **Batch-wise Inventory + FIFO Pricing**

---

# 1. Module Overview

Module **M03 — Inventory Management** manages stock quantities and value of every product variant across warehouses.

The module ensures:

* Accurate real-time stock balances
* Controlled stock movements through formal documents
* Multi-warehouse stock transfers
* Stock adjustment workflows with approval control
* Optional batch-wise inventory tracking with FIFO cost consumption
* Complete movement audit trail

---

# 2. Module Scope

The module covers the following functionality.

### 2.1 Core Inventory Functions

1. Real-time stock tracking per **variant per warehouse**
2. Inventory movement through formal documents only
3. Warehouse-to-warehouse transfers
4. Stock adjustment workflows
5. Inventory ledger reporting
6. Batch-based inventory tracking (optional)
7. FIFO cost consumption (when batch tracking enabled)

---

# 3. Screen Index

| Screen ID | Screen Name         | Type                   |
| --------- | ------------------- | ---------------------- |
| M03-S01   | Current Stock Table | List + Filters         |
| M03-S02   | Stock Ledger        | SlideOver              |
| M03-S03   | Stock Transfer      | Workflow Form          |
| M03-S04   | Stock Adjustment    | Form + Approval        |
| M03-S05   | Incoming Transfers  | Confirmation List      |
| M03-S06   | Batch Management    | Batch Register         |
| M03-S07   | Batch Ledger        | Batch Movement History |

---

# 4. Module Functional Rules

### Stock Structure

Stock is tracked at:

```
Product Variant + Warehouse
```

Example:

```
500W Drill Bit @ Main Warehouse
500W Drill Bit @ Branch Warehouse
```

These are separate stock records.

---

### Base Unit Rule

All stock quantities are  **stored in base units** .

Example

```
Purchase: 5 Box
Conversion: 1 Box = 10 Piece
Stored stock = 50 Piece
```

---

### Stock Movement Rule

Stock quantity cannot be edited directly.

Stock changes only through:

* GRN (Purchase Receipt)
* Sales Invoice
* Stock Transfer
* Stock Adjustment
* Sales Return
* Purchase Return
* Opening Stock

---

### Negative Stock Policy

Negative stock behavior is configurable per outlet.

| Policy | Behaviour                 |
| ------ | ------------------------- |
| Block  | Transaction rejected      |
| Warn   | Warning shown but allowed |
| Allow  | No validation             |

Default: **Warn**

---

### Adjustment Approval Rule

If adjustment value exceeds configured threshold:

```
Status → Pending Approval
```

Stock is updated only after Admin approval.

---

# 5. Batch-wise Inventory Tracking

Batch tracking is an **optional feature** enabled per outlet.

Default: **OFF**

When OFF:

* Batch fields hidden
* System behaves like normal quantity-based inventory

When ON:

* Each purchase receipt creates a **batch**
* Each batch records:
  * cost per unit
  * quantity received
  * quantity remaining

---

# 6. Batch Structure

Each batch stores:

| Field              | Description          |
| ------------------ | -------------------- |
| Batch Number       | System generated     |
| Variant            | Product variant      |
| Warehouse          | Stock location       |
| Received Date      | GRN date             |
| Quantity Received  | Total batch quantity |
| Quantity Consumed  | Units used           |
| Remaining Quantity | Current balance      |
| Cost Per Unit      | Purchase cost        |

---

# 7. Batch Number Format

Batch numbers are auto generated.

Format

```
[SKU]-[YYYYMMDD]-[SEQ]
```

Example

```
DRL500W-20250115-001
```

If multiple GRNs occur same day:

```
DRL500W-20250115-002
```

---

# 8. FIFO Consumption Logic

FIFO is mandatory when batch tracking is enabled.

Users  **cannot manually select batches** .

---

### FIFO Algorithm

1. Retrieve all batches for variant + warehouse
2. Sort batches by:

```
received_date ASC
```

3. Consume from oldest batch first
4. Continue until required quantity satisfied

---

### Example

| Batch     | Date   | Qty | Cost  |
| --------- | ------ | --- | ----- |
| BATCH-001 | Jan 1  | 10  | ₹100 |
| BATCH-002 | Jan 15 | 15  | ₹200 |

Stock total = 25

---

Sale of **10 units**

Consumption:

```
10 from BATCH-001
COGS = ₹100 × 10
```

---

Sale of **7 units**

```
Batch1 exhausted
Consume from Batch2
```

COGS

```
7 × ₹200
```

---

### Partial Batch Example

Batch1 remaining = 5
Batch2 remaining = 15

Customer buys **10 units**

Consumption

| Batch     | Qty | Cost  |
| --------- | --- | ----- |
| BATCH-001 | 5   | ₹100 |
| BATCH-002 | 5   | ₹200 |

COGS

```
5×100 + 5×200 = ₹1500
```

---

# 9. Batch Interaction With Other Modules

| Module        | Interaction                |
| ------------- | -------------------------- |
| GRN           | Creates batch              |
| Sales Invoice | Consumes batch via FIFO    |
| Transfer      | Transfers batch quantities |
| Adjustment    | Adds/removes from batches  |
| Stock Ledger  | Shows batch movements      |
| Batch Ledger  | Shows lifecycle            |

---

# 10. Screen Specifications

---

# M03-S01 Current Stock Table

Route

```
/inventory
```

Access

```
Inventory Manager
Admin
Sales (read only)
```

---

## Purpose

Shows real-time inventory balances across warehouses.

Entry point to:

* Stock Ledger
* Stock Adjustment
* Stock Transfer
* Batch View

---

## Filters

| Filter       | Type      | Default                  |
| ------------ | --------- | ------------------------ |
| Warehouse    | Dropdown  | Outlet default warehouse |
| Stock Status | Segmented | All                      |

Stock Status Options

```
All
In Stock
Low Stock
Out of Stock
```

---

## Search Filters

| Filter   | Type                |
| -------- | ------------------- |
| Search   | Product name or SKU |
| Category | Hierarchical        |
| Brand    | Multi-select        |

Batch Mode Only:

| Filter       | Type                     |
| ------------ | ------------------------ |
| Batch Status | All / Active / Exhausted |

---

## Table Columns

| Column            | Description             |
| ----------------- | ----------------------- |
| SKU Code          | Variant SKU             |
| Product Name      | Product                 |
| Specification     | Variant specification   |
| Category          | Category hierarchy      |
| Warehouse         | Location                |
| Qty On Hand       | Stock quantity          |
| Unit              | Base unit               |
| Batches           | Active batch count      |
| Oldest Batch Cost | Cost of next FIFO batch |
| Min Stock         | Minimum threshold       |
| Last Movement     | Last stock movement     |
| Actions           | Row menu                |

---

# Row Actions

| Action         | Behaviour             |
| -------------- | --------------------- |
| View Ledger    | Opens stock ledger    |
| Adjust Stock   | Opens adjustment form |
| Transfer Stock | Opens transfer form   |
| View Batches   | Shows batch list      |

---

# M03-S02 Stock Ledger

Route

```
/inventory/ledger/{variant}/{warehouse}
```

Purpose:

Shows all stock movements with running balance.

---

## Ledger Columns

| Column        | Description                |
| ------------- | -------------------------- |
| Date          | Transaction date           |
| Movement Type | Purchase / Sale / Transfer |
| Reference     | Source document            |
| In Qty        | Quantity added             |
| Out Qty       | Quantity removed           |
| Balance       | Running balance            |
| User          | Transaction creator        |

---

Batch Mode adds:

| Column        | Description    |
| ------------- | -------------- |
| Batch Number  | Consumed batch |
| Batch Balance | Remaining qty  |
| Cost/Unit     | Batch cost     |

---

# M03-S03 Stock Transfer

Route

```
/inventory/transfers/new
```

Purpose

Move stock between warehouses.

---

## Transfer Lifecycle

| Stage      | Status             |
| ---------- | ------------------ |
| Draft      | DRAFT              |
| Dispatched | IN_TRANSIT         |
| Received   | RECEIVED           |
| Partial    | PARTIALLY_RECEIVED |

---

## Header Fields

| Field                 | Type   |
| --------------------- | ------ |
| Transfer Number       | Auto   |
| Transfer Date         | Date   |
| From Warehouse        | Select |
| To Warehouse          | Select |
| Expected Receipt Date | Date   |
| Reference             | Text   |

---

## Line Items

| Field         | Type   |
| ------------- | ------ |
| Product SKU   | Search |
| Available Qty | Auto   |
| Transfer Qty  | Number |
| Unit          | Auto   |

Batch mode shows FIFO preview.

---

# M03-S04 Stock Adjustment

Route

```
/inventory/adjustments/new
```

Purpose

Correct stock discrepancies.

---

## Adjustment Types

| Type          | Effect           |
| ------------- | ---------------- |
| Increase      | Add stock        |
| Decrease      | Remove stock     |
| Write-Off     | Remove + expense |
| Opening Stock | Initial entry    |

---

## Header Fields

| Field             | Type   |
| ----------------- | ------ |
| Adjustment Number | Auto   |
| Date              | Date   |
| Warehouse         | Select |
| Adjustment Type   | Select |
| Reason            | Text   |

---

# Approval Workflow

If adjustment value exceeds threshold:

```
Status → Pending Approval
```

Admin must:

* Approve
* Reject

---

# M03-S05 Incoming Transfers

Route

```
/inventory/transfers/incoming
```

Purpose

Destination warehouse confirms transfers.

---

## Table Columns

| Column           | Description     |
| ---------------- | --------------- |
| Transfer No      | Transfer ID     |
| Date Dispatched  | Source date     |
| From Warehouse   | Source          |
| Items            | SKU count       |
| Total Qty        | Quantity        |
| Expected Receipt | ETA             |
| Status           | Transfer status |

---

# M03-S06 Batch Management

Route

```
/inventory/batches
```

Visible  **only when batch tracking enabled** .

Purpose

View all batches.

---

## Batch Table

| Column       | Description       |
| ------------ | ----------------- |
| Batch Number | Identifier        |
| Product      | Variant           |
| SKU          | SKU code          |
| Warehouse    | Location          |
| GRN Date     | Batch creation    |
| Original Qty | Quantity received |
| Consumed     | Units sold        |
| Remaining    | Current balance   |
| Cost/Unit    | Purchase price    |
| Batch Value  | Remaining value   |

---

# M03-S07 Batch Ledger

Route

```
/inventory/batches/{batch}/ledger
```

Purpose

Track lifecycle of a batch.

---

## Batch Summary

| Metric      | Description       |
| ----------- | ----------------- |
| Received    | Original qty      |
| Consumed    | Used qty          |
| Remaining   | Current qty       |
| Batch Value | Remaining × cost |

---

# Batch Ledger Columns

| Column        | Description           |
| ------------- | --------------------- |
| Date          | Movement date         |
| Event         | GRN / Sale / Transfer |
| Reference     | Document              |
| Qty In        | Added                 |
| Qty Out       | Consumed              |
| Batch Balance | Running qty           |

---

# 11. Accounting Integration

| Event               | Debit                 | Credit           |
| ------------------- | --------------------- | ---------------- |
| GRN                 | Inventory             | GRNI             |
| Purchase Bill       | GRNI                  | Vendor           |
| Sales Invoice       | Customer              | Sales            |
| COGS                | COGS                  | Inventory        |
| Transfer            | Destination Inventory | Source Inventory |
| Adjustment Increase | Inventory             | Adjustment       |
| Adjustment Decrease | Adjustment            | Inventory        |
| Write Off           | Expense               | Inventory        |

Batch mode generates  **COGS per batch consumed** .

---

# 12. Key System Settings

| Setting                       | Default        | Effect                    |
| ----------------------------- | -------------- | ------------------------- |
| Negative Stock Policy         | Warn           | Controls stock validation |
| Adjustment Approval Threshold | ₹10,000       | Approval requirement      |
| Batch Tracking                | OFF            | Enables batch features    |
| Batch Prefix                  | SKU prefix     | Batch numbering           |
| Inventory Valuation           | Moving Average | FIFO when batch enabled   |

---

# 13. Key Data Entities

| Entity                 | Purpose           |
| ---------------------- | ----------------- |
| stock_ledger           | Movement records  |
| batches                | Batch inventory   |
| batch_movements        | Batch history     |
| stock_transfers        | Transfer header   |
| stock_transfer_lines   | Transfer items    |
| stock_adjustments      | Adjustment header |
| stock_adjustment_lines | Adjustment items  |

---

# 14. Critical Technical Requirement

FIFO must run inside  **database transaction lock** .

Algorithm must:

1. Lock batch rows
2. Sort by received date
3. Consume sequentially
4. Update quantities atomically

This prevents  **race conditions from concurrent invoices** .

---

If you want, I can also produce a **much stronger version of this FRD** that most ERP teams use:

• **ER Diagram for Inventory**
• **Database schema (Prisma / SQL)**
• **API endpoints for each screen**
• **State machine diagrams (Transfers / Adjustments)**
• **Sequence diagrams for FIFO consumption**

That would turn this into a  **production-grade system design doc** , not just an FRD.
