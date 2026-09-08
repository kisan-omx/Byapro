export type PartyType = 'customer' | 'supplier' | 'both';
export type BalanceType = 'To Receive' | 'To Give' | 'Settled';

export type PartyItemType = 'Cash' | 'Contact' | 'Party' | 'ExpenseCategory';

export interface Party {
  id: string;
  name: string;
  phone?: string | null;
  subtitle?: string;
  type: PartyItemType;
  balance?: number;
  balanceType?: BalanceType;
  createdAt?: string;
}

export type PartyCategoryFilter = 'all' | 'customer' | 'supplier' | 'both';
export type PartyPaymentFilter = 'all' | 'to_receive' | 'to_give' | 'settled';
