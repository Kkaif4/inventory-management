# Image Attachment System Integration

**Date:** 2026-03-31  
**Status:** ✅ Plan Updated & Ready for Implementation

---

## Overview

The Expense Module Implementation Plan has been updated to include a **comprehensive image attachment system** for:
- 📄 **Expenses** — Store receipt images, bills
- 📋 **Sales Invoices** (Future) — Supporting documents

All image files are automatically compressed and converted to WebP format for efficient storage in the database.

---

## Key Features

### Upload & Processing

✅ **Supported Formats:** JPG, PNG  
✅ **Output Format:** WebP (auto-converted)  
✅ **Size Limit:** 5 MB before compression  
✅ **Compression Quality:** 80/100 (balance quality vs size)  
✅ **Max Dimensions:** 2000×2000 pixels  
✅ **Max Attachments:** 1-3 per record  
✅ **Storage:** Database BYTEA column (PostgreSQL)

### User Experience

- Drag & drop upload
- Preview thumbnail before save
- Remove/replace capability
- Full-screen image viewer (modal)
- Download original receipt

### Performance

- **Lazy loading:** Images loaded only on demand
- **Compression:** ~70-80% size reduction (3.5 MB JPG → 1 MB WebP)
- **Scalability:** ~10-15 GB for 10,000 expenses with attachments
- **No external storage:** Database-only (no S3, no file system)

---

## Data Model

### New Table: `Attachment`

```prisma
model Attachment {
  id String @id @default(cuid())
  moduleType String // "EXPENSE" | "INVOICE"
  referenceId String // expenseId | invoiceId
  
  fileName String // Original filename
  mimeType String @default("image/webp")
  size Int // Bytes after compression
  data Bytes // Binary WebP image
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([moduleType, referenceId])
  @@index([moduleType])
  @@index([createdAt])
}
```

### Updated Tables

**Expense Model:**
- Removed: `attachmentUrl` (was String?)
- Now uses `Attachment` table with proper binary storage

**Transaction Model (Invoice):**
- No direct relation (Attachment links via `referenceId`)

---

## Server Actions

### New: `src/actions/attachments/index.ts`

```typescript
// Upload image with auto-compression
uploadAttachment(moduleType, referenceId, file): StandardResponse<AttachmentMetadata>

// Get image data (for display)
getAttachment(attachmentId): StandardResponse<AttachmentWithData>

// Delete attachment
deleteAttachment(attachmentId, moduleType, referenceId): StandardResponse<void>

// List attachments for record (metadata only)
getAttachmentsByReference(moduleType, referenceId): StandardResponse<Attachment[]>
```

### New: `src/lib/image-processing.ts`

```typescript
// Compress & convert to WebP
compressAndConvertImage(buffer, options): Promise<{ buffer, size }>

// Validate file before upload
validateImageFile(file, maxSizeMB): { valid, error? }
```

---

## API Routes (New)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/attachments/upload` | POST | Upload image, compress, store |
| `/api/attachments/[id]/image` | GET | Stream WebP image to client |
| `/api/attachments/by-reference` | GET | List metadata for record |
| `/api/attachments/[id]` | DELETE | Remove attachment |

---

## UI Components (New)

### `src/components/attachments/attachment-upload.tsx`
- Drag & drop zone
- File input button
- Preview thumbnail
- Loading state
- Error messages with retry

### `src/components/attachments/attachment-preview.tsx`
- Image viewer
- Modal/lightbox for full-screen
- Download button
- File info display

### `src/components/attachments/attachment-list.tsx`
- Thumbnail grid/list
- File name and size
- Delete button (if permitted)

---

## Form Integration

### Expense Create/Edit Form

**Section 5: Attachment (Optional)**
```
┌─────────────────────────────┐
│ Upload Receipt/Bill         │
│                             │
│ [Drag & drop or select...] │
│                             │
│ Preview: [Thumbnail]        │
│          Receipt.jpg        │
│          2.3 MB            │
│ [Remove]                   │
└─────────────────────────────┘
```

**Form Submission Flow:**
1. Fill expense details (amount, category, etc.)
2. Select payment account
3. Upload image (optional)
4. Click Submit
5. Server:
   - Creates Expense
   - Compresses image
   - Stores Attachment
   - Returns expenseId

---

## Validation Rules

### File Validation

| Rule | Value | When |
|------|-------|------|
| **File Type** | JPG, PNG only | Client + Server |
| **MIME Type** | image/jpeg, image/png | Server validation |
| **Max Size (input)** | 5 MB | Client + Server |
| **Output Format** | image/webp | Server conversion |
| **Max Dimensions** | 2000×2000 px | Server resize |

### Error Handling

| Error | HTTP | Message | Recovery |
|-------|------|---------|----------|
| Invalid file type | 400 | "Only JPG/PNG supported" | Select different file |
| File too large | 400 | "Max 5 MB" | Compress offline or select smaller file |
| Compression failed | 500 | "Failed to process image" | Try another file |
| Module not found | 404 | "Expense not found" | Create expense first |
| Max attachments exceeded | 400 | "Max 3 attachments" | Remove old attachment |

---

## Implementation Phases (Updated)

| Phase | Focus | Duration |
|-------|-------|----------|
| 1 | Foundation (schema, types, core actions) | 3-4 days |
| **2** | **Attachment System (upload, compress, API)** | **2-3 days** |
| 3 | UI Components (forms, upload, preview) | 3-4 days |
| 4 | Pages & Integration (GL, accounts) | 3-4 days |
| 5 | Reporting (registers, dashboards) | 2-3 days |
| 6 | Testing & Polish | 2-3 days |
| **Total** | **3-4 weeks** | |

---

## Dependencies

**New Package:**
```bash
npm install sharp
```

**Sharp Library:**
- Image compression & conversion
- Supports JPG, PNG, WebP
- Built-in safeguards (no compression bombs)
- Performance-optimized

---

## Security

### Validations

✅ **MIME Type** — Server validates (not just extension)  
✅ **File Size** — Strictly enforced at 5 MB input  
✅ **Binary Data** — Stored as-is (no executable risk)  
✅ **Access Control** — User can only see own outlet's attachments

### No Risk

❌ **Fake Extensions** — Caught by MIME validation  
❌ **Oversized Files** — Rejected at validation  
❌ **Compression Bombs** — Sharp handles safely

---

## Future: Invoice Attachments

The `Attachment` table is already designed for multi-module support:

```typescript
// Future: Same table, different moduleType
uploadAttachment({
  moduleType: "INVOICE", // "EXPENSE" or "INVOICE"
  referenceId: invoiceId,
  file: receiptImage
})
```

**What's Needed Later:**
- Add attachment upload to invoice form
- Add attachment list to invoice detail page
- No database changes (already designed)

---

## Success Criteria (Attachment-Specific)

✅ **Upload:**
- [ ] JPG/PNG → WebP conversion works
- [ ] File size validation (max 5 MB input)
- [ ] Compressed size < original size
- [ ] Metadata stored accurately

✅ **Display:**
- [ ] Preview loads quickly
- [ ] Modal lightbox works
- [ ] Download button works
- [ ] Metadata shown (size, format)

✅ **Management:**
- [ ] Delete removes from DB cleanly
- [ ] Max 3 attachments enforced
- [ ] Module type validation works

✅ **Error Handling:**
- [ ] Invalid file type → clear error message
- [ ] Oversized file → clear error message
- [ ] Compression failure → retry option
- [ ] Network error → user-friendly message

✅ **Performance:**
- [ ] Upload doesn't block form submission
- [ ] Image loading lazy (on demand)
- [ ] Thumbnail generation instant
- [ ] No browser memory leaks

---

## File Checklist

### New Files
- [ ] `src/actions/attachments/index.ts` — Upload, delete, fetch actions
- [ ] `src/lib/image-processing.ts` — Sharp compression utility
- [ ] `src/lib/attachment-handler.ts` — Upload handler logic
- [ ] `src/components/attachments/attachment-upload.tsx`
- [ ] `src/components/attachments/attachment-preview.tsx`
- [ ] `src/components/attachments/attachment-list.tsx`
- [ ] `src/app/api/attachments/upload/route.ts`
- [ ] `src/app/api/attachments/[id]/image/route.ts`
- [ ] `src/app/api/attachments/by-reference/route.ts`
- [ ] `src/app/api/attachments/[id]/route.ts` (DELETE)
- [ ] `src/__tests__/attachment-system.test.ts`

### Updated Files
- [ ] `prisma/schema.prisma` — Add Attachment model
- [ ] `prisma/migrations/...` — Create Attachment table
- [ ] `src/validations/expense.validation.ts` — Add attachment rules
- [ ] `src/types/expense.types.ts` — Add attachment types
- [ ] `package.json` — Add `sharp` dependency
- [ ] `src/app/dashboard/expenses/new/page.tsx` — Integrate upload
- [ ] `src/app/dashboard/expenses/[id]/page.tsx` — Show attachments
- [ ] `src/components/expenses/expense-form.tsx` — Add attachment section

---

## Status

🚀 **Implementation Plan Complete**

The Expense Module Implementation Plan has been fully updated with:
- ✅ Database schema for attachments
- ✅ Server actions for upload/delete/fetch
- ✅ Image processing (compression, conversion)
- ✅ API routes for client communication
- ✅ UI components (upload, preview, list)
- ✅ Validation rules & error handling
- ✅ Security considerations
- ✅ Performance optimizations
- ✅ Future invoice support (ready)

**Ready to proceed with Phase 1 implementation.**

---

## References

- **Main Plan:** `plans/EXPENSE_MODULE_IMPLEMENTATION_PLAN.md`
- **Expense FRD:** `plans/EXPENCE_MODULE_FRD.md`
- **Image Attachment Requirements:** Provided in task
