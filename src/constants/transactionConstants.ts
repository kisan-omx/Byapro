import { DateFilterType, TransactionType } from '../types/transaction';

export const PAGE_SIZE = 20;

export interface TypeBadgeStyle {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass?: string;
}

export const TRANSACTION_TYPE_CONFIG: Record<TransactionType, TypeBadgeStyle> = {
  PaymentIn: {
    label: 'Payment In',
    bgClass: 'bg-emerald-100',
    textClass: 'text-emerald-600',
  },
  Sale: {
    label: 'Sale',
    bgClass: 'bg-primary/10',
    textClass: 'text-primary',
  },
  Purchase: {
    label: 'Purchase',
    bgClass: 'bg-rose-100',
    textClass: 'text-rose-500',
  },
  Expense: {
    label: 'Expense',
    bgClass: 'bg-rose-100',
    textClass: 'text-rose-500',
  },
  PaymentOut: {
    label: 'Payment Out',
    bgClass: 'bg-rose-100',
    textClass: 'text-rose-500',
  },
  SaleReturn: {
    label: 'Sale Return',
    bgClass: 'bg-emerald-100',
    textClass: 'text-emerald-600',
  },
  PurchaseReturn: {
    label: 'Purchase Return',
    bgClass: 'bg-rose-100',
    textClass: 'text-rose-500',
  },
  Quotation: {
    label: 'Quotation',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-600',
  },
};

export interface TypeFilterOption {
  id: TransactionType | 'All';
  label: string;
}

export const TRANSACTION_TYPE_OPTIONS: TypeFilterOption[] = [
  { id: 'All', label: 'All Transactions' },
  { id: 'Sale', label: 'Sale' },
  { id: 'SaleReturn', label: 'Sales Return' },
  { id: 'PaymentIn', label: 'Payment In' },
  { id: 'PaymentOut', label: 'Payment Out' },
  { id: 'Purchase', label: 'Purchase' },
  { id: 'PurchaseReturn', label: 'Purchase Return' },
  { id: 'Expense', label: 'Expense' },
];

export interface DateFilterOption {
  id: DateFilterType;
  label: string;
  defaultSubtitle?: string;
}

export const DATE_FILTER_OPTIONS: DateFilterOption[] = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this_week', label: 'This Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'this_fiscal_year', label: 'This Fiscal Year' },
  { id: 'this_year', label: 'This Year' },
  { id: 'all', label: 'All Time', defaultSubtitle: 'See Transactions of all time' },
];

export interface QuickLinkItem {
  id: string;
  title: string;
  iconName: string;
  bgColor: string;
  iconColor: string;
  route?: string;
  action?: 'add_txn' | 'sale_report' | 'txn_settings' | 'show_all';
}

export const QUICK_LINKS: QuickLinkItem[] = [
  {
    id: '1',
    title: 'Add Txn',
    iconName: 'file-plus',
    bgColor: 'bg-red-100',
    iconColor: '#EF4444',
    action: 'add_txn',
  },
  {
    id: '2',
    title: 'Sale Report',
    iconName: 'clipboard',
    bgColor: 'bg-sky-100',
    iconColor: '#0EA5E9',
    action: 'sale_report',
  },
  {
    id: '3',
    title: 'Txn Settings',
    iconName: 'settings',
    bgColor: 'bg-slate-100',
    iconColor: '#64748B',
    action: 'txn_settings',
  },
  {
    id: '4',
    title: 'Show All',
    iconName: 'grid',
    bgColor: 'bg-blue-100',
    iconColor: '#3B82F6',
    action: 'show_all',
  },
];
