// Purchase Report Types

export interface PurchaseRegisterItem {
  id: string;
  poNumber: string;
  date: Date;
  vendorName: string;
  vendorPhone?: string;
  invoiceNumber?: string;
  invoiceDate?: Date;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  totalAmount: number;
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  grnStatus: 'PENDING' | 'RECEIVED' | 'PARTIAL';
}

export interface GRNSummaryItem {
  id: string;
  grnNumber: string;
  date: Date;
  poNumber: string;
  vendorName: string;
  totalItems: number;
  totalQuantity: number;
  totalAmount: number;
  receivedQuantity: number;
  pendingQuantity: number;
  discrepancies: number;
}

export interface PurchaseReturnItem {
  id: string;
  returnNumber: string;
  date: Date;
  vendorName: string;
  originalInvoiceNumber: string;
  sku: string;
  productName: string;
  variantName: string;
  quantityReturned: number;
  returnReason: string;
  creditValue: number;
  status: 'PENDING' | 'CREDITED' | 'APPROVED';
}

// Report query parameters
export interface PurchaseReportParams {
  page: number;
  limit: number;
  dateFrom: Date;
  dateTo: Date;
  outletId: string;
  vendorId?: string;
  search?: string;
  status?: string;
}
