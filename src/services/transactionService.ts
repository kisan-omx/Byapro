import { supabase } from '../lib/supabase';
import { getBusinessId } from './quickEntryService';
import { DateFilterType, TransactionItem, TransactionType } from '../types/transaction';
import { PAGE_SIZE } from '../constants/transactionConstants';
import { getDateFilterBoundary } from '../utils/dateUtils';
import {
  mapSalesToItems,
  mapPurchasesToItems,
  mapPaymentInToItems,
  mapPaymentOutToItems,
  mapExpensesToItems,
} from '../utils/transactionMappers';

export interface FetchTransactionsParams {
  firebaseUid: string;
  page?: number; // 0-indexed page number
  searchQuery?: string;
  dateFilter?: DateFilterType;
  typeFilter?: TransactionType | 'All';
}

export async function fetchTransactions({
  firebaseUid,
  page = 0,
  searchQuery = '',
  dateFilter = 'all',
  typeFilter = 'All',
}: FetchTransactionsParams): Promise<{ items: TransactionItem[]; hasMore: boolean }> {
  const businessId = await getBusinessId(firebaseUid);
  if (!businessId) {
    return { items: [], hasMore: false };
  }

  // Determine date boundary if dateFilter is active
  const startDateIso = getDateFilterBoundary(dateFilter);

  // Calculate fetch range for combined records
  const fetchLimit = (page + 1) * PAGE_SIZE + 1;

  // Pre-query matching party IDs & expense category IDs for DB-side search
  const cleanQuery = searchQuery.trim();
  let matchingPartyIds: string[] = [];
  let matchingCategoryIds: string[] = [];

  if (cleanQuery) {
    const [partyRes, catRes] = await Promise.all([
      supabase
        .from('parties')
        .select('id')
        .eq('business_id', businessId)
        .ilike('name', `%${cleanQuery}%`),
      supabase
        .from('expense_categories')
        .select('id')
        .eq('business_id', businessId)
        .ilike('name', `%${cleanQuery}%`),
    ]);

    matchingPartyIds = (partyRes.data || []).map((p) => p.id);
    matchingCategoryIds = (catRes.data || []).map((c) => c.id);
  }

  // 1. Query sales
  const fetchSales = async (): Promise<{ data: any[] }> => {
    if (typeFilter !== 'All' && typeFilter !== 'Sale') return { data: [] };
    let q = supabase
      .from('sales')
      .select('id, party_id, invoice_number, total_amount, received_amount, payment_type, created_at, note')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(fetchLimit);

    if (startDateIso) q = q.gte('created_at', startDateIso);

    if (cleanQuery) {
      const filters: string[] = [`note.ilike.%${cleanQuery}%`];
      if (matchingPartyIds.length > 0) {
        filters.push(`party_id.in.(${matchingPartyIds.join(',')})`);
      }
      q = q.or(filters.join(','));
    }

    const res = await q;
    return { data: res.data || [] };
  };

  // 2. Query purchases
  const fetchPurchases = async (): Promise<{ data: any[] }> => {
    if (typeFilter !== 'All' && typeFilter !== 'Purchase') return { data: [] };
    let q = supabase
      .from('purchases')
      .select('id, party_id, total_amount, paid_amount, payment_type, created_at, note')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(fetchLimit);

    if (startDateIso) q = q.gte('created_at', startDateIso);

    if (cleanQuery) {
      const filters: string[] = [`note.ilike.%${cleanQuery}%`];
      if (matchingPartyIds.length > 0) {
        filters.push(`party_id.in.(${matchingPartyIds.join(',')})`);
      }
      q = q.or(filters.join(','));
    }

    const res = await q;
    return { data: res.data || [] };
  };

  // 3. Query payment_in
  const fetchPaymentIn = async (): Promise<{ data: any[] }> => {
    if (typeFilter !== 'All' && typeFilter !== 'PaymentIn') return { data: [] };
    let q = supabase
      .from('payment_in')
      .select('id, party_id, amount, payment_method, created_at, note')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(fetchLimit);

    if (startDateIso) q = q.gte('created_at', startDateIso);

    if (cleanQuery) {
      const filters: string[] = [`note.ilike.%${cleanQuery}%`];
      if (matchingPartyIds.length > 0) {
        filters.push(`party_id.in.(${matchingPartyIds.join(',')})`);
      }
      q = q.or(filters.join(','));
    }

    const res = await q;
    return { data: res.data || [] };
  };

  // 4. Query payment_out
  const fetchPaymentOut = async (): Promise<{ data: any[] }> => {
    if (typeFilter !== 'All' && typeFilter !== 'PaymentOut') return { data: [] };
    let q = supabase
      .from('payment_out')
      .select('id, party_id, amount, payment_method, created_at, note')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(fetchLimit);

    if (startDateIso) q = q.gte('created_at', startDateIso);

    if (cleanQuery) {
      const filters: string[] = [`note.ilike.%${cleanQuery}%`];
      if (matchingPartyIds.length > 0) {
        filters.push(`party_id.in.(${matchingPartyIds.join(',')})`);
      }
      q = q.or(filters.join(','));
    }

    const res = await q;
    return { data: res.data || [] };
  };

  // 5. Query expenses
  const fetchExpenses = async (): Promise<{ data: any[] }> => {
    if (typeFilter !== 'All' && typeFilter !== 'Expense') return { data: [] };
    let q = supabase
      .from('expenses')
      .select('id, category_id, amount, payment_method, created_at, note')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(fetchLimit);

    if (startDateIso) q = q.gte('created_at', startDateIso);

    if (cleanQuery) {
      const filters: string[] = [`note.ilike.%${cleanQuery}%`];
      if (matchingCategoryIds.length > 0) {
        filters.push(`category_id.in.(${matchingCategoryIds.join(',')})`);
      }
      q = q.or(filters.join(','));
    }

    const res = await q;
    return { data: res.data || [] };
  };

  const [salesRes, purchasesRes, paymentInRes, paymentOutRes, expensesRes] = await Promise.all([
    fetchSales(),
    fetchPurchases(),
    fetchPaymentIn(),
    fetchPaymentOut(),
    fetchExpenses(),
  ]);

  // Collect unique party IDs & expense category IDs for single batched lookups (avoid N+1 queries)
  const partyIds = new Set<string>();
  const categoryIds = new Set<string>();

  (salesRes.data || []).forEach((s) => s.party_id && partyIds.add(s.party_id));
  (purchasesRes.data || []).forEach((p) => p.party_id && partyIds.add(p.party_id));
  (paymentInRes.data || []).forEach((pi) => pi.party_id && partyIds.add(pi.party_id));
  (paymentOutRes.data || []).forEach((po) => po.party_id && partyIds.add(po.party_id));
  (expensesRes.data || []).forEach((e) => e.category_id && categoryIds.add(e.category_id));

  // Batch query party names
  const partyMap = new Map<string, string>();
  if (partyIds.size > 0) {
    const { data: parties } = await supabase
      .from('parties')
      .select('id, name')
      .in('id', Array.from(partyIds));

    (parties || []).forEach((party) => partyMap.set(party.id, party.name));
  }

  // Batch query category names
  const categoryMap = new Map<string, string>();
  if (categoryIds.size > 0) {
    const { data: categories } = await supabase
      .from('expense_categories')
      .select('id, name')
      .in('id', Array.from(categoryIds));

    (categories || []).forEach((cat) => categoryMap.set(cat.id, cat.name));
  }

  // Map into unified TransactionItem list
  const allItems: TransactionItem[] = [
    ...mapSalesToItems(salesRes.data || [], partyMap),
    ...mapPurchasesToItems(purchasesRes.data || [], partyMap),
    ...mapPaymentInToItems(paymentInRes.data || [], partyMap),
    ...mapPaymentOutToItems(paymentOutRes.data || [], partyMap),
    ...mapExpensesToItems(expensesRes.data || [], categoryMap),
  ];

  // Sort unified items strictly descending by date & ID (stable ordering rule 8)
  allItems.sort((a, b) => {
    const timeDiff = new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime();
    if (timeDiff !== 0) return timeDiff;
    return b.id.localeCompare(a.id);
  });

  // Filter by searchQuery if specified
  let filteredItems = allItems;
  if (cleanQuery) {
    const query = cleanQuery.toLowerCase();
    filteredItems = allItems.filter(
      (item) =>
        item.partyName.toLowerCase().includes(query) ||
        item.indexNo.toLowerCase().includes(query) ||
        (item.note && item.note.toLowerCase().includes(query)),
    );
  }

  // Pagination slice
  const startIndex = page * PAGE_SIZE;
  const pageItems = filteredItems.slice(startIndex, startIndex + PAGE_SIZE);
  const hasMore = filteredItems.length > startIndex + PAGE_SIZE;

  return {
    items: pageItems,
    hasMore,
  };
}
