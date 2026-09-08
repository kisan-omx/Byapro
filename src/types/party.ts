export type PartyType = 'customer' | 'supplier' | 'both';
export type BalanceType = 'To Receive' | 'To Give' | 'Settled';

export type PartyItemType = 'Cash' | 'Contact' | 'Party' | 'ExpenseCategory';

export type SyncStatus = 'saving' | 'synced' | 'failed';

export interface Party {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  subtitle?: string;
  type: PartyItemType;
  balance?: number;
  balanceType?: BalanceType;
  createdAt?: string;
  syncStatus?: SyncStatus;
  syncError?: string;
  rawPayload?: {
    businessId: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    type?: PartyType;
    openingBalance?: number;
    balanceType?: 'To Receive' | 'To Give' | 'Settled';
  };
}

export type PartyCategoryFilter = 'all' | 'customer' | 'supplier' | 'both';
export type PartyPaymentFilter = 'all' | 'to_receive' | 'to_give' | 'settled';

export interface AddPartyFormData {
  name: string;
  partyNumber?: string;
}
