export type ProductFilter = {
  search?: string;
  categoryId?: string;
  brand?: string;
};

export type VariantPayload = {
  sku: string;
  purchasePrice: number;
  sellingPrice: number;
  pricingMethod: "MANUAL" | "MARKUP";
  markupPercent?: number;
  minStockLevel: number;
  specifications: any;
  categoryId: string;
};
