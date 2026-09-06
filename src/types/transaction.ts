export type TransactionType =
  | 'Sale'
  | 'Purchase'
  | 'PaymentIn'
  | 'PaymentOut'
  | 'Expense'
  | 'SaleReturn'
  | 'PurchaseReturn';

export type PaymentStatus = 'Paid' | 'Unpaid' | 'Partial' | 'N/A';

export type SyncStatus = 'saving' | 'saved' | 'failed';

export interface TransactionItem {
  id: string;
  type: TransactionType;
  indexNo: string; // e.g. "#1", "#15", "INV-101"
  partyName: string;
  totalAmount: number;
  secondaryAmount: number; // Unused or Paid/Pending amount
  secondaryLabel: string; // "Unused", "Paid", "Pending", etc.
  status: PaymentStatus;
  date: string; // e.g. "Aug 17, 26" or "2083 Bha 19 • 6:05 PM"
  rawDate: string; // ISO string for sorting/filtering
  note?: string;
  paymentMethod?: string;
  syncStatus?: SyncStatus;
  payload?: any; // Retained payload for retry capability
}

export type DateFilterType = 'all' | 'today' | 'yesterday' | 'this_month' | 'this_year';

export interface TransactionFilter {
  searchQuery: string;
  dateFilter: DateFilterType;
  typeFilter: TransactionType | 'All';
}
