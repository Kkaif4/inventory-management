// Outstanding & Ageing Report Types

export interface CustomerOutstandingItem {
  id: string;
  customerName: string;
  customerPhone?: string | null;
  outstandingAmount: number;
  creditLimit: number;
  utilizationPercent: number;
  lastInvoiceDate?: Date;
  daysSinceLastTransaction: number;
  status: 'CURRENT' | 'OVERDUE_30' | 'OVERDUE_60' | 'OVERDUE_90';
}

export interface VendorOutstandingItem {
  id: string;
  vendorName: string;
  vendorPhone?: string | null;
  outstandingAmount: number;
  lastPODate?: Date;
  daysSinceLastTransaction: number;
  status: 'CURRENT' | 'OVERDUE_30' | 'OVERDUE_60' | 'OVERDUE_90';
}

// Report query parameters
export interface OutstandingReportParams {
  page: number;
  limit: number;
  outletId: string;
  search?: string;
  status?: string;
}
