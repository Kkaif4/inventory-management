// Inventory Report Types

export interface CurrentStockItem {
  id: string;
  sku: string;
  productName: string;
  variantName: string;
  unitOfMeasure: string;
  warehouseName: string;
  quantity: number;
  inTransitQty: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  status: "critical" | "warning" | "normal" | "overstock";
}

export interface LowStockItem {
  id: string;
  sku: string;
  productName: string;
  variantName: string;
  unitOfMeasure: string;
  minLevel: number;
  currentStock: number;
  shortage: number;
  status: "critical" | "warning";
}

export interface StockLedgerItem {
  id: string;
  date: Date;
  sku: string;
  productName: string;
  variantName: string;
  warehouseName: string;
  transactionType: "PURCHASE" | "SALE" | "TRANSFER" | "ADJUSTMENT";
  referenceNumber: string;
  quantity: number;
  balance: number;
  costPerUnit: number | null;
  userId: string;
}

export interface StockValuationItem {
  id: string;
  sku: string;
  productName: string;
  variantName: string;
  unitOfMeasure: string;
  warehouseName: string;
  quantity: number;
  costPerUnit: number;
  totalValue: number;
  valuationMethod: "FIFO" | "WEIGHTED_AVERAGE";
}

export interface SlowMovingStockItem {
  id: string;
  sku: string;
  productName: string;
  variantName: string;
  unitOfMeasure: string;
  currentStock: number;
  minStockLevel: number;
  lastMovementDate: Date | null;
  daysSinceLastMovement: number;
  movementFrequency: "high" | "medium" | "low" | "dormant";
  estimatedMonthsOfStock: number;
}

// Report query parameters
export interface InventoryReportParams {
  page: number;
  limit: number;
  dateFrom: Date;
  dateTo: Date;
  outletId: string;
  warehouseId?: string;
  productId?: string;
  categoryId?: string;
  status?: string;
  search?: string;
}
