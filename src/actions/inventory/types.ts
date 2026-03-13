export type StockStatus = "ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export type InventoryFilter = {
  warehouseId?: string;
  status?: StockStatus;
  search?: string;
  categoryId?: string;
  brand?: string[];
};
