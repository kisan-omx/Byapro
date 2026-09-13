import { EntryType } from "../components/quick-entry/QuickEntryTabs";

export type TransactionOptionId =
  | "sale"
  | "payment_in"
  | "sale_return"
  | "purchase"
  | "payment_out"
  | "purchase_return"
  | "expense";

export interface TransactionCategoryOption {
  id: TransactionOptionId;
  label: string;
  iconName: string;
  entryType?: EntryType; // Optional target QuickEntry tab
  route?: string; // Optional custom route
}

export interface AddTransactionSection {
  id: string;
  title: string;
  options: TransactionCategoryOption[];
}
