import { prisma } from "@/lib/prisma";
import {
  ImportRow,
  ImportRowWithMeta,
  importRowSchema,
  PRODUCT_LEVEL_FIELDS,
} from "@/validations/import.validation";
import { StockService } from "@/domains/inventory/stock-service";
import { NumberingService } from "@/domains/foundation/numbering-service";
import { AuditService } from "@/domains/audit/audit-service";
import { parseBatchDate } from "@/lib/utils/date";

// ISSUE #1: Normal Casing Headers
export const FIELD_KEYS = [
  "Product Group Name",
  "Brand",
  "HSN Code",
  "GST Rate",
  "Base Unit",
  "Purchase Unit",
  "Conversion Ratio",
  "Category L1",
  "Category L2",
  "Category L3",
  "Variant SKU",
  "Variant Spec",
  "Purchase Price",
  "Selling Price",
  "Pricing Method",
  "Markup Percent",
  "Min Stock Level",
  "Warehouse Name",
  "Current Stock",
  "Batch Date",
  "Batch Cost Per Unit",
];

const HEADER_TO_FIELD: Record<string, string> = {
  "product group name": "productGroupName",
  brand: "brand",
  "hsn code": "hsnCode",
  "gst rate": "gstRate",
  "base unit": "baseUnit",
  "purchase unit": "purchaseUnit",
  "conversion ratio": "conversionRatio",
  "category l1": "categoryL1",
  "category l2": "categoryL2",
  "category l3": "categoryL3",
  "variant sku": "variantSku",
  "variant spec": "variantSpec",
  "purchase price": "purchasePrice",
  "selling price": "sellingPrice",
  "pricing method": "pricingMethod",
  "markup percent": "markupPercent",
  "min stock level": "minStockLevel",
  "warehouse name": "warehouseName",
  "current stock": "currentStock",
  "batch date": "batchDate",
  "batch cost per unit": "batchCostPerUnit",
};

export function normalizeRow(raw: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(raw).map(([key, value]) => {
      const normalized = HEADER_TO_FIELD[key.trim().toLowerCase()];
      return [normalized ?? key.trim().toLowerCase(), value];
    }),
  );
}

// ISSUE #2: Helper to format Zod errors
function formatZodError(e: any): string {
  if (e?.name === "ZodError" && e.issues?.length) {
    return e.issues
      .map((iss: any) => `${iss.path.join(".")}: ${iss.message}`)
      .join(" | ");
  }
  return e.message ?? "Unknown validation error";
}

export type ImportProgress = {
  processed: number;
  total: number;
  created: number;
  updated: number;
  variantsCreated: number;
  variantsUpdated: number;
  stockEntries: number;
  batches: number;
  errors: { row: number; sku: string; field: string; message: string }[];
};

export type ImportOptions = {
  outletId: string;
  userId: string;
  skipOnError: boolean;
};

export async function processProductImport(
  rows: ImportRow[],
  options: ImportOptions,
  onProgress?: (progress: ImportProgress) => void,
) {
  const { outletId, userId, skipOnError } = options;
  const progress: ImportProgress = {
    processed: 0,
    total: 0,
    created: 0,
    updated: 0,
    variantsCreated: 0,
    variantsUpdated: 0,
    stockEntries: 0,
    batches: 0,
    errors: [],
  };

  const outlet = await prisma.outlet.findUnique({
    where: { id: outletId },
    select: { id: true, batchTrackingEnabled: true },
  });

  if (!outlet) throw new Error("Outlet not found");

  // Zod Validation & Global Duplicate SKU Check
  const skuSet = new Set<string>();
  const validRows: ImportRowWithMeta[] = [];

  for (let i = 0; i < rows.length; i++) {
    const sheetRowNumber = i + 2; // row 1 = header, data starts row 2
    const rawRow = normalizeRow(rows[i]); // ISSUE #1: Normalize headers
    let row: ImportRow;

    // A. Zod Parsing
    try {
      const normalized = { ...rawRow } as any;
      if (typeof normalized.pricingMethod === "string") {
        normalized.pricingMethod = normalized.pricingMethod
          .toUpperCase()
          .trim();
      }
      if (typeof normalized.gstRate === "string") {
        normalized.gstRate = parseFloat(
          normalized.gstRate.replace("%", "").trim(),
        );
      }
      row = importRowSchema.parse(normalized);
    } catch (e: any) {
      let message = formatZodError(e);
      progress.errors.push({
        row: sheetRowNumber, // ISSUE #2: Use actual sheet row number
        sku: rawRow.variantSku || "Unknown SKU",
        field: "validation",
        message: `Row ${sheetRowNumber}: Schema error: ${message}`,
      });
      if (!skipOnError)
        throw new Error(`Row ${sheetRowNumber} validation failed: ${message}`);
      continue; // Skip invalid row
    }

    // B. Duplicate SKU Check
    if (skuSet.has(row.variantSku)) {
      progress.errors.push({
        row: sheetRowNumber, // ISSUE #2: Use actual sheet row number
        sku: row.variantSku,
        field: "variantSku",
        message: `Row ${sheetRowNumber}: Duplicate SKU '${row.variantSku}' found in sheet. SKUs must be uniquely defined.`,
      });
      if (!skipOnError) {
        throw new Error(`Duplicate SKU '${row.variantSku}' in sheet.`);
      }
    } else {
      skuSet.add(row.variantSku);
      // ISSUE #2: Attach sheet row metadata for error reporting downstream
      const rowWithMeta: ImportRowWithMeta = {
        ...row,
        _sheetRow: sheetRowNumber,
      };
      validRows.push(rowWithMeta);
    }
  }

  // Group rows by productGroupName (case-insensitive trim)
  const productGroups = new Map<string, ImportRowWithMeta[]>();
  validRows.forEach((row) => {
    const key = row.productGroupName.trim().toLowerCase();
    const group = productGroups.get(key) || [];
    group.push(row);
    productGroups.set(key, group);
  });

  progress.total = productGroups.size;

  // Cache for categories and warehouses to minimize lookups
  const categoryCache = new Map<string, string>(); // namePath -> id
  const warehouseCache = new Map<string, string>(); // name -> id
  const batchSeqMap = new Map<string, number>(); // ISSUE #4: Initialize sequence map for deterministic batch numbers

  for (const [groupKey, groupRows] of productGroups.entries()) {
    // We use the first row's original casing for the product name
    const productName = groupRows[0].productGroupName.trim();

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Validate product-level consistency across variants in the group
        const firstRow = groupRows[0];
        const inconsistent = groupRows.find((row) => {
          return PRODUCT_LEVEL_FIELDS.some(
            (field) => row[field] !== firstRow[field],
          );
        });

        if (inconsistent) {
          // ISSUE #2: Show all row numbers for group
          const rowNumbers = groupRows.map((r) => r._sheetRow).join(", ");
          throw new Error(
            `Rows ${rowNumbers}: Inconsistent product-level details found for product "${productName}". All variants must share identical product-level attributes (brand, hsnCode, gstRate, category, etc.).`,
          );
        }

        // 2. Category Resolution (3-level)
        let parentId: string | null = null;
        let finalCategoryId: string | null = null;

        const catLevels = [
          firstRow.categoryL1,
          firstRow.categoryL2,
          firstRow.categoryL3,
        ].filter(Boolean) as string[];
        let currentPath = "";

        for (const catName of catLevels) {
          currentPath += (currentPath ? " > " : "") + catName.toLowerCase();
          if (categoryCache.has(currentPath)) {
            parentId = categoryCache.get(currentPath)!;
          } else {
            let cat: { id: string } | null = await tx.category.findFirst({
              where: {
                name: { equals: catName, mode: "insensitive" },
                parentId,
                outletId,
              },
            });

            if (!cat) {
              cat = await tx.category.create({
                data: {
                  name: catName,
                  parentId,
                  outletId,
                },
              });
            }
            parentId = cat.id;
            categoryCache.set(currentPath, cat.id);
          }
          finalCategoryId = parentId;
        }

        // 3. Brand is handled directly in productData creation since it is a String field.

        // 4. Product Upsert
        let product = await tx.product.findFirst({
          where: {
            name: { equals: productName, mode: "insensitive" },
            outletId,
          },
        });

        const productData = {
          name: productName,
          brand: firstRow.brand ?? null,
          hsnCode: firstRow.hsnCode ?? null,
          gstRate: firstRow.gstRate,
          baseUnit: firstRow.baseUnit,
          purchaseUnit: firstRow.purchaseUnit ?? null,
          conversionRatio: firstRow.conversionRatio ?? 1,
          categoryId: finalCategoryId!,
          outletId,
        };

        if (product) {
          product = await tx.product.update({
            where: { id: product.id },
            data: productData,
          });
          progress.updated++;
        } else {
          product = await tx.product.create({
            data: productData,
          });
          progress.created++;
        }

        // 5. Variant Upsert
        for (const row of groupRows) {
          // Dynamic validation for batchDate
          if (
            row.currentStock > 0 &&
            outlet.batchTrackingEnabled &&
            !row.batchDate
          ) {
            throw new Error(
              `batchDate is required for SKU ${row.variantSku} when batch tracking is enabled and initial stock is provided.`,
            );
          }

          let variant = await tx.variant.findFirst({
            where: { sku: row.variantSku },
          });

          // Idempotency check: if variant exists, it MUST belong to the current product!
          if (variant && variant.productId !== product!.id) {
            throw new Error(
              `SKU '${row.variantSku}' already exists under a different product. SKUs cannot be reassigned across products.`,
            );
          }

          const sellingPrice =
            row.pricingMethod === "MARKUP"
              ? Math.round(
                  row.purchasePrice * (1 + row.markupPercent! / 100) * 100,
                ) / 100
              : row.sellingPrice!; // guaranteed by schema validation

          const variantData = {
            sku: row.variantSku,
            purchasePrice: row.purchasePrice,
            sellingPrice,
            pricingMethod: row.pricingMethod,
            markupPercent: row.markupPercent,
            minStockLevel: row.minStockLevel,
            specifications: row.variantSpec ? { detail: row.variantSpec } : {},
            productId: product!.id,
          };

          if (variant) {
            variant = await tx.variant.update({
              where: { id: variant.id },
              data: variantData,
            });
            progress.variantsUpdated++;
          } else {
            variant = await tx.variant.create({
              data: variantData,
            });
            progress.variantsCreated++;
          }

          // 6. Initial Stock Management
          if (row.currentStock > 0) {
            // Warehouse Resolution
            if (!row.warehouseName) {
              throw new Error(
                `Warehouse name is required for SKU ${row.variantSku} with initial stock.`,
              );
            }

            let warehouseId = warehouseCache.get(
              row.warehouseName.toLowerCase(),
            );
            if (!warehouseId) {
              let warehouse = await tx.warehouse.findFirst({
                where: {
                  name: { equals: row.warehouseName, mode: "insensitive" },
                  outletId,
                },
              });

              if (!warehouse) {
                warehouse = await tx.warehouse.create({
                  data: {
                    name: row.warehouseName,
                    outletId,
                  },
                });
              }
              warehouseId = warehouse.id;
              warehouseCache.set(row.warehouseName.toLowerCase(), warehouseId);
            }

            // Check if opening stock already exists
            const existingAdjustment = await tx.transaction.findFirst({
              where: {
                type: "STOCK_ADJUSTMENT",
                outletId,
                remarks: "OPENING_IMPORT",
                items: { some: { variantId: variant.id } },
                fromLocationId: warehouseId,
              },
            });

            if (existingAdjustment) {
              progress.errors.push({
                row: 0, // Need to handle row index correctly if possible
                sku: row.variantSku,
                field: "currentStock",
                message: `Opening stock already exists for ${row.variantSku} at ${row.warehouseName}. Stock not updated.`,
              });
              console.warn(
                `[Import Debug] [Outlet: ${outletId}] [Product: "${productName}"] Opening stock already exists for SKU: ${row.variantSku}. Skipping stock adjustment.`,
              );
              continue;
            }

            // Generate adjustment record
            const txnNumber = await NumberingService.getNextNumber(
              tx,
              outletId,
              "STOCK_ADJUSTMENT",
            );
            const transaction = await tx.transaction.create({
              data: {
                type: "STOCK_ADJUSTMENT",
                txnNumber,
                outletId,
                fromLocationId: warehouseId,
                userId,
                status: "COMPLETED",
                remarks: "OPENING_IMPORT",
              },
            });

            await tx.transactionItem.create({
              data: {
                transactionId: transaction.id,
                variantId: variant.id,
                quantity: row.currentStock,
                rate: row.purchasePrice,
                taxableValue: row.purchasePrice * row.currentStock,
              },
            });

            // Specific Batch creation if enabled
            let batchNumber: string | undefined = undefined;
            let batchDate: Date | undefined = undefined;

            if (outlet.batchTrackingEnabled) {
              // ISSUE #3: Use parseBatchDate for validation
              // ISSUE #4: Use deterministic sequence instead of random suffix
              if (!row.batchDate) {
                throw new Error(
                  `Row ${row._sheetRow}: Batch Date is required but missing. This is a validation bug — report it.`,
                );
              }
              batchDate = parseBatchDate(row.batchDate, row._sheetRow);

              // ISSUE #4: Deterministic batch number using local date components
              const datePart = [
                batchDate.getFullYear(),
                String(batchDate.getMonth() + 1).padStart(2, "0"),
                String(batchDate.getDate()).padStart(2, "0"),
              ].join("");
              const seqKey = `${row.variantSku}-${datePart}`;
              const seq = (batchSeqMap.get(seqKey) ?? 0) + 1;
              batchSeqMap.set(seqKey, seq);
              batchNumber = `${row.variantSku}-${datePart}-${String(seq).padStart(3, "0")}`;
              progress.batches++;
            }

            // Use StockService to handle Ledger and Stock records
            await StockService.moveStock(tx, {
              variantId: variant.id,
              warehouseId,
              outletId,
              transactionId: transaction.id,
              quantity: row.currentStock,
              type: "ADJUSTMENT_INC",
              userId,
              costPerUnit: row.batchCostPerUnit || row.purchasePrice,
              batchNumber,
              batchDate,
            });

            progress.stockEntries++;
          }
        }

        await AuditService.log({
          action: product ? "UPDATE" : "CREATE",
          entity: "IMPORT",
          entityId: productName,
          userId,
          newValues: { productName, variants: groupRows.length },
        });
      });
    } catch (error: any) {
      console.error(
        `[Import Debug] [Outlet: ${outletId}] [Product: "${productName}"] Failed to process: ${error.message}`,
      );
      if (!skipOnError) {
        throw error;
      }
      progress.errors.push({
        row: 0, // Group level
        sku: productName,
        field: "general",
        message: error.message || "Unknown error during group processing",
      });
    }

    progress.processed++;
    if (onProgress) {
      onProgress({ ...progress });
    }
  }

  return progress;
}
