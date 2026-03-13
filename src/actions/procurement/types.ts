export type PurchaseItemPayload = {
  variantId: string;
  quantity: number;
  unit?: string;
  conversionRatio?: number;
  rate: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
};
