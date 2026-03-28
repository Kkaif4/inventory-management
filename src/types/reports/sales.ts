// Sales Report Types

export interface SalesRegisterItem {
  id: string;
  invoiceNumber: string;
  date: Date;
  customerName: string;
  customerPhone?: string | null;
  invoiceType: 'TAXED' | 'UNTAXED';
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  totalAmount: number;
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  paymentMode?: string;
}

export interface ItemWiseSalesItem {
  id: string;
  invoiceNumber: string;
  date: Date;
  sku: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitOfMeasure: string;
  rate: number;
  taxableValue: number;
  gstRate: number;
  totalTax: number;
  totalAmount: number;
  customerName: string;
}

// Report query parameters
export interface SalesReportParams {
  page: number;
  limit: number;
  dateFrom: Date;
  dateTo: Date;
  outletId: string;
  customerId?: string;
  search?: string;
  paymentStatus?: string;
}
