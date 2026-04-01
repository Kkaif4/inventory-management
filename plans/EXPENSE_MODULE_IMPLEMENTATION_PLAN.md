# Implementation Plan: Expense Module

**Status:** Planning Phase  
**Based on:** FRD — Expense Management  
**Last Updated:** 2026-03-31

---

## 1. Overview

The Expense Module tracks business expenses that:
- **Reduce profit** (via P&L)
- **Do NOT create inventory** (unlike Purchases)
- **Reduce cash/bank** via accounts
- Support **GST compliance** (Input Tax Credit)
- Provide **categorized reporting** and audit trail

### Scope Boundaries

✅ **Included:**
- Expense entry (non-inventory)
- GST handling (optional)
- Payment tracking via operational accounts
- Categorization (5xxx GL accounts)
- Expense reports
- Cancellation & reversal

❌ **Excluded:**
- Purchase orders (those create inventory)
- Sales transactions
- Employee payroll (separate module)
- Asset depreciation

---

## 2. Data Model & Database Schema

### 2.1 New Tables/Models

#### `ExpenseCategory` (Linked to GL Accounts)
```prisma
model ExpenseCategory {
  id String @id @default(cuid())
  outletId String
  outlet Outlet @relation(fields: [outletId], references: [id], onDelete: Cascade)
  
  name String // "Rent", "Salary", "Electricity"
  code String // "5001", "5002", etc.
  glAccountId String // Link to GL Account (5xxx)
  glAccount GLAccount @relation(fields: [glAccountId], references: [id])
  
  isActive Boolean @default(true)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([code, outletId])
  @@index([outletId])
  @@index([glAccountId])
}
```

#### `Expense` (Main Transaction)
```prisma
model Expense {
  id String @id @default(cuid())
  outletId String
  outlet Outlet @relation(fields: [outletId], references: [id], onDelete: Cascade)
  
  // Document info
  txnNumber String // EXP-0001, EXP-0002
  date DateTime
  description String
  
  // Category & Vendor
  categoryId String
  category ExpenseCategory @relation(fields: [categoryId], references: [id])
  vendorId String?
  vendor Party? @relation(fields: [vendorId], references: [id], onDelete: SetNull)
  
  // Amount breakdown
  taxableAmount Decimal @db.Decimal(12, 2) // Without GST
  gstRate Int? // 0, 5, 12, 18 (null = no GST)
  inputGst Decimal @db.Decimal(12, 2) // GST amount (deductible)
  totalAmount Decimal @db.Decimal(12, 2) // taxableAmount + inputGst
  
  // Payment
  paymentMode String // "CASH", "BANK_TRANSFER", "UPI", "CHEQUE"
  accountId String // Link to operational account (Cash/Bank)
  account Account @relation(fields: [accountId], references: [id])
  
  // Attachment
  attachmentUrl String? // GST invoice, receipt
  
  // Audit
  status String @default("POSTED") // POSTED, CANCELLED
  createdBy String
  user User @relation(fields: [createdBy], references: [id])
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([outletId])
  @@index([categoryId])
  @@index([accountId])
  @@index([date])
  @@index([status])
}
```

#### `Attachment` (Image Storage - Expenses & Invoices)
```prisma
model Attachment {
  id String @id @default(cuid())
  
  // Module reference
  moduleType String // "EXPENSE" | "INVOICE"
  referenceId String // expenseId | invoiceId
  
  // File metadata
  fileName String // original filename (for audit)
  mimeType String @default("image/webp") // Always WebP
  size Int // bytes after compression
  
  // Image data (compressed WebP)
  data Bytes // Binary image data (stored as BYTEA in PostgreSQL)
  
  // Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Composite index for lookups
  @@unique([moduleType, referenceId]) // One attachment per record (can be extended to max 3)
  @@index([moduleType])
  @@index([createdAt])
}
```

#### Update `Expense` Model
```prisma
model Expense {
  // ... existing fields ...
  
  // Removed: attachmentUrl String?
  // Now use Attachment table instead for better control
  
  // Reverse relation (optional, for easy loading)
  // Uncomment if needed for queries
  // attachment Attachment?
}
```

#### Update `Outlet` Model
```prisma
model Outlet {
  // ... existing fields ...
  expenseCategories ExpenseCategory[]
  expenses Expense[]
  defaultExpenseCategory ExpenseCategory? // For quick entry
}
```

#### Update `Account` Model
```prisma
model Account {
  // ... existing fields ...
  expenses Expense[] // Reverse relation
}
```

#### Update `GLAccount` Model (if not already supporting 5xxx)
```prisma
model GLAccount {
  // ... existing fields ...
  expenseCategories ExpenseCategory[] // Reverse relation
}
```

#### Update `Transaction` Model (For Invoice Attachments)
```prisma
model Transaction {
  // ... existing fields ...
  // No direct relation; Attachment table handles via moduleType=INVOICE, referenceId=transactionId
}
```

---

## 3. Server Actions

### 3.1 Expense CRUD

**File:** `src/actions/expenses/index.ts`

```typescript
// Create Expense
export async function createExpense(data: CreateExpenseInput): StandardResponse<Expense>
  - Validate outlet access
  - Validate category exists
  - Validate account exists
  - Auto-generate txnNumber
  - Immediately set status = "POSTED"
  - Create GLAccount entries (Dr Expense, Cr Account)
  - If GST: Create Input Tax Credit entry
  - Decrement account balance
  - Return created expense

// Get Expense Detail
export async function getExpenseDetail(expenseId: string, outletId: string): StandardResponse<Expense>
  - Include category, vendor, account details
  - Include related GL entries

// List Expenses (Paginated)
export async function getExpenses(
  outletId: string, 
  filters?: { categoryId?, dateFrom?, dateTo?, status? },
  pagination?: { page, limit }
): StandardResponse<PaginatedExpenses>

// Update Expense (Limited)
export async function updateExpense(expenseId: string, data: UpdateExpenseInput): StandardResponse<Expense>
  - Only allow updates to non-financial fields (description, vendor, attachment)
  - Do NOT allow amount/category changes post-creation

// Cancel Expense
export async function cancelExpense(expenseId: string, outletId: string): StandardResponse<Expense>
  - Validate status is POSTED
  - Create reverse journal entries
  - Restore account balance
  - Set status = "CANCELLED"
  - Audit: track who cancelled and when

// Bulk Cancel
export async function bulkCancelExpenses(expenseIds: string[], outletId: string): StandardResponse<{ cancelled: number }>
```

### 3.2 Category Management

**File:** `src/actions/expenses/categories.ts`

```typescript
// Get Expense Categories
export async function getExpenseCategories(outletId: string): StandardResponse<ExpenseCategory[]>

// Create Category
export async function createExpenseCategory(data: {
  outletId: string
  name: string
  code: string
  glAccountId: string
}): StandardResponse<ExpenseCategory>
  - Validate GL account exists and is 5xxx series
  - Ensure unique (code, outletId)

// Initialize Default Categories
export async function initializeDefaultExpenseCategories(outletId: string): StandardResponse<ExpenseCategory[]>
  - Create standard categories: Rent, Salary, Utilities, Fuel, Misc
  - Link to pre-created GL accounts (5001-5005)
  - Idempotent operation

// Update Category
export async function updateExpenseCategory(categoryId: string, data: Partial<ExpenseCategory>): StandardResponse<ExpenseCategory>
  - Name + isActive only (code immutable)
```

### 3.2a Attachment Management

**File:** `src/actions/attachments/index.ts`

```typescript
// Upload & Process Attachment (Image Only)
export async function uploadAttachment(data: {
  moduleType: "EXPENSE" | "INVOICE";
  referenceId: string;
  file: File; // FormData file
  outletId?: string; // For validation
}): StandardResponse<Attachment>
  - Validate moduleType and referenceId exist
  - Validate MIME type (JPG, PNG only)
  - Validate file size (max 5MB before compression)
  - Compress image using Sharp
  - Convert to WebP format
  - Store in Attachment table as binary
  - Return attachment metadata

// Get Attachment (Image Data)
export async function getAttachment(
  attachmentId: string
): StandardResponse<AttachmentWithData>
  - Returns: id, fileName, mimeType, data (binary)
  - Load image only when explicitly requested

// Delete Attachment
export async function deleteAttachment(
  attachmentId: string,
  moduleType: "EXPENSE" | "INVOICE",
  referenceId: string
): StandardResponse<void>
  - Validate user has permission
  - Delete from Attachment table
  - Return success

// List Attachments for Record
export async function getAttachmentsByReference(
  moduleType: "EXPENSE" | "INVOICE",
  referenceId: string
): StandardResponse<Attachment[]>
  - Returns metadata only (id, fileName, mimeType, size)
  - Does NOT load image data
  - Used in detail pages to show available attachments

// Image Compression Service
export async function compressImage(
  buffer: Buffer,
  targetFormat: "webp"
): StandardResponse<{ buffer: Buffer; format: string; size: number }>
  - Use Sharp library
  - Quality: 80 (balance size vs quality)
  - Max dimension: 2000x2000
  - Returns compressed buffer, format, and size
```

### 3.3 Reporting

**File:** `src/actions/expenses/reports.ts`

```typescript
// Expense Register (Full List)
export async function getExpenseRegister(
  outletId: string,
  filters?: { dateFrom, dateTo, categoryId }
): StandardResponse<ExpenseRegisterRow[]>
  - Returns: Date, Category, Description, Taxable, GST, Total, Account
  - Include hasAttachment flag (boolean, not data)

// Expense by Category (Summary)
export async function getExpensesByCategory(
  outletId: string,
  filters?: { dateFrom, dateTo }
): StandardResponse<ExpenseByCategoryRow[]>
  - Groups by category
  - Sums taxable, GST, total per category
  - Shows % of total expenses

// GST on Expenses (ITC Summary)
export async function getExpenseGST(
  outletId: string,
  filters?: { dateFrom, dateTo, gstRate }
): StandardResponse<ExpenseGSTRow[]>
  - Summarizes input tax credit by rate (5%, 12%, 18%)
  - Total recoverable GST
  - Useful for GST filings

// Expense Dashboard (KPIs)
export async function getExpenseDashboard(
  outletId: string,
  period: "TODAY" | "WEEK" | "MONTH" | "YEAR"
): StandardResponse<ExpenseDashboardMetrics>
  - Total expenses (period)
  - Avg expense per transaction
  - Top 5 categories by spend
  - Cash vs Bank split
```

---

## 4. Validation & Types

### 4.1 Zod Schemas

**File:** `src/validations/expense.validation.ts`

```typescript
export const createExpenseSchema = z.object({
  outletId: z.string().cuid(),
  date: z.date(),
  categoryId: z.string().cuid(),
  description: z.string().min(5).max(500),
  vendorId: z.string().cuid().optional(),
  
  // Payment
  paymentMode: z.enum(["CASH", "BANK_TRANSFER", "UPI", "CHEQUE"]),
  accountId: z.string().cuid(),
  
  // Amount
  taxableAmount: z.number().positive(),
  gstRate: z.number().min(0).max(100).optional(),
  inputGst: z.number().min(0).optional(),
  
  // Attachment
  attachmentUrl: z.string().url().optional(),
});

export const updateExpenseSchema = z.object({
  description: z.string().min(5).max(500).optional(),
  vendorId: z.string().cuid().optional(),
  // Attachments managed via uploadAttachment() action
});

export const expenseCategorySchema = z.object({
  name: z.string().min(3).max(50),
  code: z.string().regex(/^5\d{3}$/), // 5xxx GL code
  glAccountId: z.string().cuid(),
});

// Attachment Validation (Server-side)
export const attachmentUploadSchema = z.object({
  moduleType: z.enum(["EXPENSE", "INVOICE"]),
  referenceId: z.string().cuid(),
  // File validation happens in handler (MIME, size)
  // FormData File object passed directly
});

export const attachmentValidationRules = {
  ALLOWED_MIMES: ["image/jpeg", "image/png"],
  OUTPUT_FORMAT: "image/webp",
  MAX_SIZE_BEFORE_COMPRESSION: 5 * 1024 * 1024, // 5MB
  MAX_ATTACHMENTS_PER_RECORD: 3,
  COMPRESSION_QUALITY: 80,
  MAX_DIMENSION: 2000,
};
```

### 4.2 TypeScript Interfaces

**File:** `src/types/expense.types.ts`

```typescript
export interface CreateExpenseInput {
  outletId: string;
  date: Date;
  categoryId: string;
  description: string;
  vendorId?: string;
  paymentMode: "CASH" | "BANK_TRANSFER" | "UPI" | "CHEQUE";
  accountId: string;
  taxableAmount: number;
  gstRate?: number;
  // Note: Attachment uploaded separately via uploadAttachment()
}

export interface ExpenseDetail {
  id: string;
  txnNumber: string;
  date: Date;
  category: { id: string; name: string };
  vendor?: { id: string; name: string };
  description: string;
  taxableAmount: number;
  gstRate?: number;
  inputGst: number;
  totalAmount: number;
  paymentMode: string;
  account: { id: string; name: string };
  status: "POSTED" | "CANCELLED";
  createdBy: string;
  createdAt: Date;
  attachments?: AttachmentMetadata[]; // Metadata only
}

export interface AttachmentMetadata {
  id: string;
  fileName: string;
  mimeType: string; // Always "image/webp"
  size: number; // bytes
  createdAt: Date;
}

export interface AttachmentWithData extends AttachmentMetadata {
  data: Buffer; // Binary image data
}

export interface AttachmentUploadInput {
  moduleType: "EXPENSE" | "INVOICE";
  referenceId: string;
  file: File;
}

export interface CompressedImageResult {
  buffer: Buffer;
  format: string;
  size: number;
}

export interface ExpenseRegisterRow {
  id: string;
  txnNumber: string;
  date: string;
  category: string;
  vendor?: string;
  description: string;
  taxable: number;
  gst: number;
  total: number;
  account: string;
  status: string;
}

export interface ExpenseByCategoryRow {
  category: string;
  count: number;
  totalTaxable: number;
  totalGst: number;
  total: number;
  percentOfTotal: number;
}

export interface ExpenseDashboardMetrics {
  totalExpenses: number;
  transactionCount: number;
  averageExpense: number;
  topCategories: { name: string; total: number }[];
  cashVsBank: { cash: number; bank: number };
  gstRecoverable: number;
}
```

---

## 5. UI Components

### 5.1 Pages

#### `src/app/dashboard/expenses/page.tsx`
- **Expense List Page**
- Search + filters (date range, category, payment mode)
- Table with columns: Date, Category, Description, Taxable, GST, Total, Account, Status
- Action buttons: View, Create, Bulk Cancel
- Pagination: 50 per page

#### `src/app/dashboard/expenses/new/page.tsx`
- **Create Expense Page**
- Form with sections:
  1. Details (Date, Category, Description)
  2. Payment (Mode, Account selection)
  3. GST (Optional: taxable, rate, auto-calculated tax)
  4. Vendor (Optional dropdown)
  5. Attachment (Optional image upload)
     - Uses `<AttachmentUpload>` component
     - Shows preview if image selected
     - Upload occurs after expense created (separate action)
- Submission flow:
  - Submit form → createExpense() → get expenseId
  - If file selected → uploadAttachment(expenseId, file)
  - Redirect to detail page with success toast

#### `src/app/dashboard/expenses/[id]/page.tsx`
- **Expense Detail Page**
- Display all details
- Show related GL entries
- **Attachment section:**
  - Uses `<AttachmentList>` component
  - Shows thumbnails of uploaded images
  - Click to preview/enlarge
  - Delete button (if not cancelled)
- Action buttons: Edit metadata, Cancel, Print/Download
- Transaction timeline if cancelled

#### `src/app/dashboard/reports/expenses/register/page.tsx`
- **Expense Register Report**
- Full table of expenses
- Totals footer
- Export to CSV/PDF

#### `src/app/dashboard/reports/expenses/by-category/page.tsx`
- **Expense by Category Report**
- Table: Category, Count, Taxable, GST, Total, %
- Charts: Pie (category split), Bar (spend trend)

#### `src/app/dashboard/reports/expenses/gst/page.tsx`
- **GST on Expenses Report**
- Breakdown by rate (5%, 12%, 18%)
- Total recoverable GST
- Integration with GST filing

---

### 5.2 Components

#### `src/components/expenses/expense-form.tsx`
- **Reusable form** for create/edit
- Dynamic GST calculation: `inputGst = (taxableAmount * gstRate) / 100`
- Account selector with balance display
- Category selector with GL code display
- Vendor search (autocomplete)

#### `src/components/expenses/expense-list.tsx`
- **Expense table** with sorting
- Filters: Date range, Category, Payment mode, Status
- Pagination controls
- Row actions: View detail, Cancel, Edit metadata

#### `src/components/expenses/category-manager.tsx`
- **Category CRUD modal**
- List existing categories
- Add new category (name, code, GL account)
- Edit category (name, active flag only)
- Validation: Code must be 5xxx

#### `src/components/expenses/gst-calculator.tsx`
- **Inline calculator** in form
- Inputs: Taxable amount, GST rate
- Outputs: GST amount, Total
- Real-time update

#### `src/components/attachments/attachment-upload.tsx`
- **Reusable upload component** for Expense & Invoice forms
- Features:
  - Drag & drop zone
  - File input button
  - Preview (thumbnail, fileName, size)
  - Remove button
  - Loading state during compression
  - Error handling with retry
- Props:
  ```typescript
  interface AttachmentUploadProps {
    moduleType: "EXPENSE" | "INVOICE";
    referenceId: string;
    onUploadComplete?: (attachment: AttachmentMetadata) => void;
    onError?: (error: string) => void;
    maxAttachments?: number; // default 1
  }
  ```
- Validation on client: File type, size (5MB)
- Upload flow: User selects → Compress → Upload → Show preview

#### `src/components/attachments/attachment-preview.tsx`
- **Image viewer component**
- Props:
  ```typescript
  interface AttachmentPreviewProps {
    attachmentId: string;
    fileName: string;
    onClick?: () => void; // For modal expansion
  }
  ```
- Features:
  - Lazy load image data on click
  - Modal/lightbox for full-screen view
  - Download button
  - File info (size, format)

#### `src/components/attachments/attachment-list.tsx`
- **List of attachments** for a record
- Props:
  ```typescript
  interface AttachmentListProps {
    moduleType: "EXPENSE" | "INVOICE";
    referenceId: string;
    onDelete?: (attachmentId: string) => void;
    readOnly?: boolean;
  }
  ```
- Shows: Thumbnail, fileName, size, delete button

---

## 6. Image Processing & Attachment Handling

### 6.1 Compression Service

**File:** `src/lib/image-processing.ts`

```typescript
import sharp from "sharp";

interface CompressionOptions {
  quality?: number; // 1-100, default 80
  maxWidth?: number; // default 2000
  maxHeight?: number; // default 2000
  format?: "webp"; // only WebP for now
}

export async function compressAndConvertImage(
  buffer: Buffer,
  options: CompressionOptions = {}
): Promise<{ buffer: Buffer; size: number }>
  - Validate input buffer is image
  - Resize if > maxDimension (preserve aspect)
  - Convert to WebP with quality
  - Return compressed buffer + size
  - Errors: Throw with user-friendly message

export function validateImageFile(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string }
  - Check MIME type (JPG, PNG only)
  - Check file size (5MB default)
  - Return validation result
```

**Dependencies:**
- `sharp` — Image compression (npm install sharp)
- Already supports WebP conversion

### 6.2 Attachment Upload Handler

**File:** `src/lib/attachment-handler.ts`

```typescript
interface AttachmentHandlerResult {
  success: boolean;
  attachment?: AttachmentWithData;
  error?: string;
}

export async function handleAttachmentUpload(
  file: File,
  moduleType: "EXPENSE" | "INVOICE",
  referenceId: string
): Promise<AttachmentHandlerResult>
  - Validate file (MIME, size)
  - Convert FormData File to Buffer
  - Compress image via Sharp
  - Store in DB via Attachment table
  - Return metadata only (not data)

export async function getAttachmentForDisplay(
  attachmentId: string
): Promise<Buffer>
  - Fetch from DB
  - Return Buffer (for streaming to client)
```

### 6.3 Database Constraints

**Attachment Table Indexes:**
- `UNIQUE (moduleType, referenceId)` — One attachment per record (enforced at app level)
- `INDEX (moduleType)` — Fast lookups by module
- `INDEX (createdAt)` — Audit trail sorting

**Storage Consideration:**
- PostgreSQL BYTEA column stores binary data efficiently
- WebP compression typically reduces image to 20-40% of original size
- 5MB input → ~1-2MB WebP stored
- Suitable for reasonable volume (~10K images = ~10-20GB)

---

## 7. Accounting Integration

### 7.1 Journal Entry Logic

**Without GST:**
```
Dr. Expense Account (5xxx)      ₹100
    Cr. Cash/Bank Account                ₹100
```

**With GST (18%):**
```
Dr. Expense Account (5xxx)       ₹100
Dr. Input CGST (1401)            ₹9
Dr. Input SGST (1402)            ₹9
    Cr. Cash/Bank Account                ₹118
```

**On Cancellation:**
```
Reverse all entries above
Dr. Cash/Bank Account            ₹118
    Cr. Expense Account (5xxx)           ₹100
    Cr. Input CGST (1401)                ₹9
    Cr. Input SGST (1402)                ₹9
```

### 7.2 GL Account Integration

**Mapping:**
- **Expense Categories** → **5xxx GL Accounts** (Expense group)
- **Input GST** → **1401/1402** (Asset group - ITC)
- **Account** → **1001/1002** (Cash/Bank - Asset)

**During Expense Creation:**
```typescript
// Use AccountingService.postJournalEntry()
const entries = [
  { accountId: expenseCategoryGlId, debit: taxableAmount },
];

if (inputGst > 0) {
  entries.push({ accountId: inputCgstGlId, debit: inputGst * 0.5 });
  entries.push({ accountId: inputSgstGlId, debit: inputGst * 0.5 });
}

entries.push({ accountId: accountGlId, credit: totalAmount });

await AccountingService.postJournalEntry(tx, { transactionId: expenseId, entries });
```

**Account Balance Update:**
```typescript
// Decrement account balance
await Account.update({
  where: { id: accountId },
  data: { currentBalance: { decrement: totalAmount } }
});
```

---

## 8. Attachment API Endpoints

### 8.1 Client-Side Upload (FormData)

**Endpoint:** `POST /api/attachments/upload`

**Request:**
```typescript
const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("moduleType", "EXPENSE");
formData.append("referenceId", expenseId);

const response = await fetch("/api/attachments/upload", {
  method: "POST",
  body: formData,
});
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "attach_...",
    "fileName": "receipt.jpg",
    "mimeType": "image/webp",
    "size": 156234,
    "createdAt": "2026-03-31T10:30:00Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Only JPG and PNG images are supported"
  }
}
```

### 8.2 Image Display Endpoint

**Endpoint:** `GET /api/attachments/[attachmentId]/image`

**Response:**
- HTTP 200 with `Content-Type: image/webp`
- Binary WebP image data
- Cached with `Cache-Control: public, max-age=86400`

**Usage in Components:**
```jsx
<img 
  src={`/api/attachments/${attachmentId}/image`} 
  alt="Receipt" 
  className="max-w-full h-auto"
/>
```

### 8.3 Metadata Endpoint

**Endpoint:** `GET /api/attachments/by-reference?moduleType=EXPENSE&referenceId=...`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "attach_...",
      "fileName": "receipt.jpg",
      "mimeType": "image/webp",
      "size": 156234,
      "createdAt": "2026-03-31T10:30:00Z"
    }
  ]
}
```

### 8.4 Delete Endpoint

**Endpoint:** `DELETE /api/attachments/[attachmentId]`

**Request Body:**
```json
{
  "moduleType": "EXPENSE",
  "referenceId": "exp_..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": null
}
```

---

## 8. Reports & Analytics

### 7.1 Dashboard Widgets

**Expense Dashboard** (`src/app/dashboard/financials/expenses/page.tsx`):
- KPI cards: Total (period), Avg per transaction, Count
- Category breakdown (pie chart)
- Payment mode split (bar chart)
- Trend line (expense per month)
- Top 5 expense categories

### 7.2 Standard Reports

| Report | Format | Data |
|--------|--------|------|
| Expense Register | Table + PDF/CSV | All expenses, sortable/filterable |
| By Category | Grouped table | Total per category, % of total |
| GST Summary | Table | ITC by rate, total recoverable |
| Account Impact | Table | Cash vs Bank spend trend |

---

## 12. Validation Rules

### Expense Fields

| Field | Rule |
|-------|------|
| **Category** | Required, must exist |
| **Date** | Required, not future-dated |
| **Amount** | Required, > 0 |
| **Account** | Required, must exist, type = BANK or CASH |
| **Payment Mode** | Required, valid enum |
| **GST Rate** | Optional, if set: 0, 5, 12, or 18 |
| **Description** | Required, 5-500 chars |
| **Vendor** | Optional, if selected must exist |

### Attachment Rules

| Rule | Value | Enforcement |
|------|-------|------------|
| **File Type** | JPG, PNG only | Client + Server MIME validation |
| **Max Size (input)** | 5 MB | Client + Server size check |
| **Output Format** | WebP only | Server conversion via Sharp |
| **Max Attachments** | 1-3 per record | Server unique constraint |
| **Max Dimensions** | 2000×2000 px | Server resize via Sharp |
| **Compression Quality** | 80/100 | Server Sharp parameter |
| **Module Type** | EXPENSE \| INVOICE | Required enum |
| **Reference ID** | Must exist in target table | Server FK validation |

---

## 13. Error Handling

### Expense Errors

| Error | HTTP | Message |
|-------|------|---------|
| Category not found | 404 | "Expense category not found" |
| Account not found | 404 | "Account not found" |
| Invalid amount | 400 | "Amount must be > 0" |
| Insufficient funds | 400 | "Account balance insufficient" |
| Cannot update posted | 400 | "Cannot modify posted expense" |
| Cannot cancel already cancelled | 400 | "Expense already cancelled" |
| Unauthorized | 403 | "Access denied to this outlet" |

### Attachment Errors

| Error | HTTP | Code | Message | Recovery |
|-------|------|------|---------|----------|
| Invalid file type | 400 | `INVALID_FILE_TYPE` | "Only JPG and PNG images are supported" | User selects different file |
| File too large | 400 | `FILE_TOO_LARGE` | "Image must be less than 5MB" | User compresses image offline |
| Compression failed | 500 | `COMPRESSION_ERROR` | "Failed to process image. Try another file" | Retry with different image |
| Module not found | 404 | `MODULE_NOT_FOUND` | "Expense/Invoice not found" | Create expense first, then upload |
| Max attachments exceeded | 400 | `MAX_ATTACHMENTS_EXCEEDED` | "Maximum 3 attachments per record" | Remove old attachment, try again |
| Invalid module type | 400 | `INVALID_MODULE_TYPE` | "moduleType must be EXPENSE or INVOICE" | Use correct module type |
| Database write failed | 500 | `DB_ERROR` | "Failed to save attachment" | Retry operation |
| Attachment not found | 404 | `ATTACHMENT_NOT_FOUND` | "Attachment not found" | Refresh page, try again |
| Unauthorized delete | 403 | `UNAUTHORIZED` | "Cannot delete this attachment" | Check permissions |

---

## 14. Implementation Phases

### Phase 1: Foundation (3-4 days)
**Database, Types, Core Actions**
- [ ] Add `Expense`, `ExpenseCategory`, `Attachment` models to schema
- [ ] Create migrations (expense module + attachments)
- [ ] Implement Zod schemas & TypeScript types
- [ ] Seed default expense categories per outlet
- [ ] Create basic CRUD actions: createExpense, getExpenses, getExpenseDetail
- [ ] Install `sharp` dependency
- [ ] Create image processing utility: `compressAndConvertImage()`

### Phase 2: Attachment System (2-3 days)
**Image Upload, Compression, Storage**
- [ ] Create `src/actions/attachments/index.ts` with upload/delete actions
- [ ] Create `src/lib/attachment-handler.ts` — File validation + compression
- [ ] Create API routes: `/api/attachments/upload`, `/api/attachments/[id]/image`, `/api/attachments/by-reference`, `/api/attachments/[id]` (DELETE)
- [ ] Test image compression: JPG/PNG → WebP (verify size reduction, quality)
- [ ] Error handling: Invalid MIME, oversized files, compression failures

### Phase 3: UI Components (3-4 days)
**Forms, Lists, Attachment Components**
- [ ] Create `expense-form.tsx` with all 5 sections
- [ ] Create `expense-list.tsx` with filters & pagination
- [ ] Create `gst-calculator.tsx` inline component
- [ ] Create `attachment-upload.tsx` — Drag & drop, preview, loading
- [ ] Create `attachment-preview.tsx` — Image viewer, modal, download
- [ ] Create `attachment-list.tsx` — Thumbnail list with delete
- [ ] Update sidebar with Expenses link

### Phase 4: Pages & Integration (3-4 days)
**Routing, Form Submission, GL Integration**
- [ ] Create `/expenses` list page
- [ ] Create `/expenses/new` create page
- [ ] Create `/expenses/[id]` detail page
- [ ] Implement form submission: createExpense → uploadAttachment (if image)
- [ ] Implement GL entry creation: `AccountingService.postJournalEntry()`
- [ ] Implement account balance updates: decrement on create, increment on cancel
- [ ] Create category manager modal

### Phase 5: Reporting (2-3 days)
**Reports & Dashboard**
- [ ] Create `/reports/expenses/register` — Full expense table
- [ ] Create `/reports/expenses/by-category` — Grouped summary
- [ ] Create `/reports/expenses/gst` — ITC summary
- [ ] Create `/financials/expenses` — Dashboard with KPIs & charts
- [ ] Implement report actions: getExpenseRegister, getExpensesByCategory, etc.

### Phase 6: Testing & Polish (2-3 days)
**Validation, Error Handling, Optimization**
- [ ] Unit tests: Expense validation, GST calculation, image compression
- [ ] Integration tests: Create → GL entries, Cancel → Reversal, Account balance
- [ ] Attachment tests: Valid/invalid files, size limits, compression accuracy
- [ ] E2E tests: Create expense with image → View → Cancel flow
- [ ] Error handling: User-friendly messages, retry logic
- [ ] Performance: Lazy load images, cache attachments, optimize queries
- [ ] TypeScript: Zero errors, strict mode

---

## 11. Critical Files Checklist

### Database
- [ ] `prisma/schema.prisma` — Add Expense, ExpenseCategory, Attachment models
- [ ] `prisma/migrations/20260401_add_expense_module/migration.sql` — Schema
- [ ] `prisma/migrations/20260402_add_attachment_support/migration.sql` — Attachment table

### Server Actions
- [ ] `src/actions/expenses/index.ts` — CRUD
- [ ] `src/actions/expenses/categories.ts` — Categories
- [ ] `src/actions/expenses/reports.ts` — Reports
- [ ] `src/actions/attachments/index.ts` — Upload, get, delete, list

### Utilities & Libraries
- [ ] `src/lib/image-processing.ts` — Sharp compression utility
- [ ] `src/lib/attachment-handler.ts` — Upload handler logic
- [ ] Update `package.json` — Add `sharp` dependency

### Validation
- [ ] `src/validations/expense.validation.ts` — Zod schemas + attachment rules
- [ ] `src/types/expense.types.ts` — TypeScript types + attachment interfaces

### Components
- [ ] `src/components/expenses/expense-form.tsx`
- [ ] `src/components/expenses/expense-list.tsx`
- [ ] `src/components/expenses/category-manager.tsx`
- [ ] `src/components/expenses/gst-calculator.tsx`
- [ ] `src/components/attachments/attachment-upload.tsx` (NEW)
- [ ] `src/components/attachments/attachment-preview.tsx` (NEW)
- [ ] `src/components/attachments/attachment-list.tsx` (NEW)

### API Routes
- [ ] `src/app/api/attachments/upload/route.ts` (NEW)
- [ ] `src/app/api/attachments/[id]/image/route.ts` (NEW)
- [ ] `src/app/api/attachments/by-reference/route.ts` (NEW)
- [ ] `src/app/api/attachments/[id]/route.ts` — DELETE endpoint (NEW)

### Pages
- [ ] `src/app/dashboard/expenses/page.tsx`
- [ ] `src/app/dashboard/expenses/new/page.tsx`
- [ ] `src/app/dashboard/expenses/[id]/page.tsx`
- [ ] `src/app/dashboard/reports/expenses/register/page.tsx`
- [ ] `src/app/dashboard/reports/expenses/by-category/page.tsx`
- [ ] `src/app/dashboard/reports/expenses/gst/page.tsx`
- [ ] `src/app/dashboard/financials/expenses/page.tsx` (Dashboard)

### Sidebar Navigation
- [ ] Update `src/components/layout/sidebar.tsx` — Add Expenses link

### Testing
- [ ] `src/__tests__/expense-module.test.ts` — Comprehensive tests
- [ ] `src/__tests__/attachment-system.test.ts` — Image compression, upload, validation

---

## 12. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Immediate POSTED status | Expenses are recorded when paid; no approval workflow |
| No draft system | Expenses are simple; drafts add complexity |
| Immutable amounts post-creation | Prevents accounting discrepancies; use cancel + recreate |
| GL account per category | Ensures proper expense categorization in P&L |
| Input GST on expenses | Captures ITC for compliance; supports B2B invoices |
| Account balance tracking | Real-time cash flow; enables overdraft warnings |
| Category initialization per outlet | Multi-outlet support; customizable categories |
| Optional vendor field | Some expenses (utility bills) may not have a vendor |

---

## 13. Testing Strategy

### Unit Tests
- Expense creation with/without GST
- GST calculation accuracy
- Amount validation
- Category + account existence

### Integration Tests
- Create expense → GL entries created
- Cancel expense → GL entries reversed
- Account balance decremented/incremented
- Multiple outlets isolation

### E2E Tests
- Create → View → Cancel flow
- Filter & search in list
- Report generation accuracy

---

## 14. Performance Considerations

- **Indexes:**
  - `Expense(outletId, date)` — For date range queries
  - `Expense(categoryId)` — For category filters
  - `Expense(accountId)` — For account reconciliation
  - `ExpenseCategory(outletId)` — For category lookups

- **Caching:**
  - Category list per outlet (static, invalidate on create)
  - Dashboard metrics (cache 1 hour)

- **Pagination:**
  - Expense list: 50 per page default
  - Reports: Full page (no pagination for accuracy)

---

## 15. Timeline Estimate

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Foundation | 3-4 days | Not started |
| Phase 2: Attachment System | 2-3 days | Not started |
| Phase 3: UI Components | 3-4 days | Not started |
| Phase 4: Pages & Integration | 3-4 days | Not started |
| Phase 5: Reporting | 2-3 days | Not started |
| Phase 6: Testing & Polish | 2-3 days | Not started |
| **Total** | **3-4 weeks** | **Planned** |

---

## 16. Attachment System Architecture

### 16.1 Upload Flow (Client → Server)

```
User selects image
    ↓
Validate file (MIME, size) [CLIENT]
    ↓
Show preview thumbnail
    ↓
User clicks "Upload"
    ↓
Send FormData to /api/attachments/upload
    ↓
Server receives request
    ↓
Validate again (MIME, size) [SERVER]
    ↓
Read file into Buffer
    ↓
Compress via Sharp (JPG/PNG → WebP)
    ↓
Store in Attachment table (binary data)
    ↓
Return metadata (id, fileName, mimeType, size)
    ↓
Success toast, show preview
```

### 16.2 Display Flow (Server → Client)

```
User opens expense detail
    ↓
Fetch expense + load attachment metadata (lightweight)
    ↓
Show attachment thumbnails in list
    ↓
User clicks image
    ↓
Request /api/attachments/[id]/image
    ↓
Server streams WebP binary
    ↓
Display in <img> or modal lightbox
    ↓
User can download (right-click save)
```

### 16.3 Storage Calculation

**Example:**
- Original JPG: 5.2 MB
- Validation: ✗ Exceeds 5 MB limit → Rejected

**Example:**
- Original JPG: 3.5 MB
- Compressed WebP: ~0.8-1.2 MB (70-80% reduction)
- Stored in DB: 1 MB BYTEA column

**Scalability:**
- 10,000 expenses with attachments = ~10-15 GB database size
- Suitable for mid-market ERP
- Future: Archive old attachments to file storage if needed

### 16.4 Security Considerations

**Validation:**
- ✅ MIME type validation (server-side, not just extension)
- ✅ File size limits strictly enforced
- ✅ Binary data stored as-is (no executable risk)
- ✅ Access control: User can only see attachments for their outlet

**No Risk:**
- ❌ Fake extensions (validated by MIME type)
- ❌ Oversized files (rejected at server)
- ❌ Compression bombs (Sharp has built-in safeguards)

---

## 17. Invoice Attachment Support (Future-Ready)

The `Attachment` table is designed to support both **Expense** and **Invoice** modules:

```typescript
const attachment = await uploadAttachment({
  moduleType: "INVOICE", // or "EXPENSE"
  referenceId: invoiceId, // Links to Transaction.id
  file: imageFile,
});
```

**Mapping:**
- `moduleType: "INVOICE"` → Linked to `Transaction.id` (sales invoices)
- `moduleType: "EXPENSE"` → Linked to `Expense.id`

**Future Work:**
- Add attachment upload to invoice detail page
- Update invoice form with attachment component
- No code changes needed (already designed for both)

---

## 18. Success Criteria

✅ **Phase Completion Checklist:**
- [ ] Database schema supports all expense features
- [ ] Create expense → GL entries + account balance updated
- [ ] Cancel expense → GL entries reversed + balance restored
- [ ] Reports show accurate totals and categories
- [ ] GST calculation correct (18% example: ₹100 → ₹18 GST → ₹118 total)
- [ ] Multi-outlet isolation: expenses from one outlet don't appear in another
- [ ] Role-based: Only authorized users can create/cancel
- [ ] **Attachment:** JPG/PNG → WebP conversion works
- [ ] **Attachment:** File size validation (max 5MB before compression)
- [ ] **Attachment:** Compressed image < original size
- [ ] **Attachment:** Upload → Preview → Download flow works
- [ ] **Attachment:** Image preview loads quickly
- [ ] **Attachment:** Delete removes from DB cleanly
- [ ] **Attachment:** Module type validation (EXPENSE/INVOICE)
- [ ] Zero TypeScript errors
- [ ] Build succeeds
- [ ] All tests passing (expense + attachment)

---

## 19. Notes

- This plan assumes existing accounting infrastructure (GL accounts, journal entries, account service)
- Expense module does NOT interact with inventory or purchase modules
- GST is optional per expense; some expenses may be zero-rated or exempt
- Attachment system is **DB-only** (no external S3, file system storage)
- Sharp library handles image compression transparently; no manual format conversion
- WebP format is modern, widely supported in browsers (>95% support)
- Future enhancement: Recurring expenses (monthly rent, subscriptions)
- Future enhancement: Expense approval workflow for high-value expenses
- Future enhancement: Budget tracking & alerts
- Future enhancement: Invoice attachments (uses same Attachment table)

---

**Next Step:** Approve plan and begin Phase 1 implementation.
