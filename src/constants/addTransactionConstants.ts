import { AddTransactionSection } from '../types/addTransaction';

export const ADD_TRANSACTION_SECTIONS: AddTransactionSection[] = [
  {
    id: 'sale_section',
    title: 'Sale Transactions',
    options: [
      {
        id: 'sale',
        label: 'Sale',
        iconName: 'tag-outline',
        entryType: 'Sale',
      },
      {
        id: 'payment_in',
        label: 'Payment-In',
        iconName: 'cash-plus',
        entryType: 'Payment In',
      },
      {
        id: 'sale_return',
        label: 'Sale return',
        iconName: 'tag-minus-outline',
        entryType: 'Sale Return',
      },
    ],
  },
  {
    id: 'purchase_section',
    title: 'Purchase Transactions',
    options: [
      {
        id: 'purchase',
        label: 'Purchase',
        iconName: 'cart-outline',
        entryType: 'Purchase',
      },
      {
        id: 'payment_out',
        label: 'Payment-Out',
        iconName: 'cash-minus',
        entryType: 'Payment Out',
      },
      {
        id: 'purchase_return',
        label: 'Purchase return',
        iconName: 'cart-minus',
        entryType: 'Purchase Return',
      },
    ],
  },
  {
    id: 'other_section',
    title: 'Other Transactions',
    options: [
      {
        id: 'expense',
        label: 'Expense',
        iconName: 'wallet-outline',
        entryType: 'Expense',
      },
    ],
  },
];
