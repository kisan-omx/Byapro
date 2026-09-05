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
    label: 'PAYMENT-IN',
    bgClass: 'bg-emerald-100/90',
    textClass: 'text-emerald-600',
  },
  Sale: {
    label: 'SALE',
    bgClass: 'bg-emerald-100/90',
    textClass: 'text-emerald-600',
  },
  Purchase: {
    label: 'PURCHASE',
    bgClass: 'bg-rose-100',
    textClass: 'text-rose-700',
  },
  Expense: {
    label: 'EXPENSE',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-700',
  },
  PaymentOut: {
    label: 'PAYMENT-OUT',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-700',
  },
};

export const DATE_FILTER_OPTIONS: { id: DateFilterType; label: string }[] = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this_month', label: 'This Month' },
  { id: 'this_year', label: 'This Year' },
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
