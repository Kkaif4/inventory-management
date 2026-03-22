import { prisma } from "@/lib/prisma";
import { ImportRow } from "@/validations/import.validation";
import { StockService } from "@/domains/inventory/stock-service";
import { NumberingService } from "@/domains/foundation/numbering-service";
import { AuditService } from "@/domains/audit/audit-service";

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

  // Group rows by productName
  const productGroups = new Map<string, ImportRow[]>();
  rows.forEach((row) => {
    const group = productGroups.get(row.productName) || [];
    group.push(row);
    productGroups.set(row.productName, group);
  });

  progress.total = productGroups.size;

  console.log(
    `[Import Debug] [Outlet: ${outletId}] Starting import session. Total products to process: ${productGroups.size}`,
  );

  // Cache for categories and warehouses to minimize lookups
  const categoryCache = new Map<string, string>(); // namePath -> id
  const warehouseCache = new Map<string, string>(); // name -> id

  for (const [productName, groupRows] of productGroups.entries()) {
    console.log(
      `[Import Debug] [Outlet: ${outletId}] Processing product: "${productName}" (${groupRows.length} variants)`,
    );
    try {
      await prisma.$transaction(async (tx) => {
        // 1. Validate product-level consistency across variants in the group
        const firstRow = groupRows[0];
        const inconsistent = groupRows.find(
          (r) =>
            r.hsnCode !== firstRow.hsnCode ||
            r.gstRate !== firstRow.gstRate ||
            r.baseUnit !== firstRow.baseUnit ||
            r.categoryL1 !== firstRow.categoryL1,
        );

        if (inconsistent) {
          throw new Error(
            `Inconsistent product details (HSN, GST, Unit, or Category) for product "${productName}". All variants must share the same product-level attributes.`,
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
        console.log(
          `[Import Debug] [Outlet: ${outletId}] [Product: "${productName}"] Resolved category path to ID: ${finalCategoryId}`,
        );

        // 3. Brand Resolution
        let brandId: string | null = null;
        if (firstRow.brand) {
          // In this schema, brand is just a string on Product, so we don't have a separate table.
          // brand is String? on Product
        }

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
          salesUnit: firstRow.salesUnit ?? null,
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
          console.log(
            `[Import Debug] [Outlet: ${outletId}] [Product: "${productName}"] Updated existing product`,
          );
        } else {
          product = await tx.product.create({
            data: productData,
          });
          progress.created++;
          console.log(
            `[Import Debug] [Outlet: ${outletId}] [Product: "${productName}"] Created new product`,
          );
        }

        // 5. Variant Upsert
        for (const row of groupRows) {
          let variant = await tx.variant.findFirst({
            where: { sku: row.variantSku },
          });

          const sellingPrice =
            row.pricingMethod === "MARKUP" &&
            row.markupPercent !== null &&
            row.markupPercent !== undefined
              ? Math.round(
                  row.purchasePrice *
                    (1 + (row.markupPercent as number) / 100) *
                    100,
                ) / 100
              : (row.sellingPrice ?? 0); // Use nullish coalescing to handle undefined/null

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
            console.log(
              `[Import Debug] [Outlet: ${outletId}] [Product: "${productName}"] Updated variant SKU: ${row.variantSku}`,
            );
          } else {
            variant = await tx.variant.create({
              data: variantData,
            });
            progress.variantsCreated++;
            console.log(
              `[Import Debug] [Outlet: ${outletId}] [Product: "${productName}"] Created new variant SKU: ${row.variantSku}`,
            );
          }

          // 6. Initial Stock Management
          if (row.currentStock > 0) {
            // Warehouse Resolution
            if (!row.warehouseName) {
              throw new Error(
                `Warehouse name is required for SKU ${row.variantSku} with clinical stock.`,
              );
            }

            let warehouseId = warehouseCache.get(
              row.warehouseName.toLowerCase(),
            );
            if (!warehouseId) {
              let warehouse = await tx.warehouse.findFirst({
                where: {
                  name: { equals: row.warehouseName, mode: "insensitive" },
                  outlets: { some: { id: outletId } },
                },
              });

              if (!warehouse) {
                warehouse = await tx.warehouse.create({
                  data: {
                    name: row.warehouseName,
                    outlets: { connect: { id: outletId } },
                  },
                });
              }
              warehouseId = warehouse.id;
              warehouseCache.set(row.warehouseName.toLowerCase(), warehouseId);
              console.log(
                `[Import Debug] [Outlet: ${outletId}] [Product: "${productName}"] Resolved warehouse "${row.warehouseName}" to ID: ${warehouseId}`,
              );
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

            console.log(
              `[Import Debug] [Outlet: ${outletId}] [Product: "${productName}"] Created stock adjustment ${txnNumber} for SKU: ${row.variantSku}, Qty: ${row.currentStock}`,
            );

            // Specific Batch creation if enabled
            let batchNumber: string | undefined = undefined;
            let batchDate: Date | undefined = undefined;

            if (outlet.batchTrackingEnabled) {
              batchDate = row.batchDate
                ? new Date(row.batchDate.split("/").reverse().join("-"))
                : new Date();
              const batchNumDate = batchDate
                .toISOString()
                .split("T")[0]
                .replace(/-/g, "");
              const randomSuffix = Math.floor(1000 + Math.random() * 9000);
              batchNumber = `${row.variantSku}-${batchNumDate}-${randomSuffix}`;
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
      console.log(
        `[Import Debug] [Outlet: ${outletId}] [Product: "${productName}"] Successfully processed product and its variants.`,
      );
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

  console.log(
    `[Import Debug] [Outlet: ${outletId}] Import session completed. Summary: Created: ${progress.created}, Updated: ${progress.updated}, Variants: ${progress.variantsCreated + progress.variantsUpdated}, Errors: ${progress.errors.length}`,
  );
  return progress;
}
