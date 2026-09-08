import { supabase } from '../lib/supabase';
import { Party, PartyPaymentFilter, PartyType } from '../types/party';

export const PAGE_SIZE = 20;

export interface FetchPartiesParams {
  businessId?: string | null;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
  type?: 'customer' | 'supplier' | 'both' | 'all';
  paymentFilter?: PartyPaymentFilter;
}

export interface FetchPartiesResponse {
  parties: Party[];
  hasMore: boolean;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Helper to format date string to Nepalese/Bikram Sambat or standard short format
 */
function formatDateSubtitle(createdAt?: string, phone?: string | null): string {
  if (phone) return phone;
  if (!createdAt) return 'No phone number';
  try {
    const d = new Date(createdAt);
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getFullYear()} ${months[d.getMonth()]} ${day}`;
  } catch {
    return 'No phone number';
  }
}

/**
 * Fetches paginated parties from Supabase.
 * - PAGE_SIZE = 20
 * - Stable ordering: ORDER BY created_at DESC, id DESC
 * - Server-side search on name or phone
 */
export async function getParties({
  businessId,
  searchQuery,
  page = 0,
  pageSize = PAGE_SIZE,
  type,
  paymentFilter,
}: FetchPartiesParams): Promise<FetchPartiesResponse> {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  if (!businessId) {
    return { parties: [], hasMore: false };
  }

  let query = supabase
    .from('parties')
    .select('id, name, phone, type, created_at')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(from, to);

  if (type && type !== 'all') {
    query = query.or(`type.eq.${type},type.eq.both`);
  }

  const trimmed = searchQuery?.trim();
  if (trimmed) {
    // Sanitize search term to prevent PostgREST syntax errors with special chars
    const sanitized = trimmed.replace(/[,()"\\]/g, '');
    if (sanitized) {
      query = query.or(`name.ilike.%${sanitized}%,phone.ilike.%${sanitized}%`);
    }
  }

  const { data, error } = await query;
  if (error) throw error;

  const rawList = data || [];
  let parties: Party[] = rawList.map((p: any) => {
    const rawBalance = p.balance ?? 0;
    let balanceType: 'To Receive' | 'To Give' | 'Settled' = 'Settled';
    if (rawBalance > 0) {
      balanceType = 'To Receive';
    } else if (rawBalance < 0) {
      balanceType = 'To Give';
    }

    return {
      id: p.id,
      name: p.name,
      phone: p.phone,
      subtitle: formatDateSubtitle(p.created_at, p.phone),
      type: 'Party' as const,
      balance: Math.abs(rawBalance),
      balanceType,
      createdAt: p.created_at,
    };
  });

  if (paymentFilter && paymentFilter !== 'all') {
    if (paymentFilter === 'to_receive') {
      parties = parties.filter((p) => p.balanceType === 'To Receive');
    } else if (paymentFilter === 'to_give') {
      parties = parties.filter((p) => p.balanceType === 'To Give');
    } else if (paymentFilter === 'settled') {
      parties = parties.filter((p) => p.balanceType === 'Settled');
    }
  }

  const hasMore = rawList.length === pageSize;

  return { parties, hasMore };
}

/**
 * Creates a new party record in Supabase.
 */
export async function createNewParty(params: {
  id?: string;
  businessId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  type?: PartyType;
  openingBalance?: number;
  balanceType?: 'To Receive' | 'To Give' | 'Settled';
}): Promise<Party> {
  const { id, businessId, name, phone, email, address, type = 'both', openingBalance = 0, balanceType = 'Settled' } = params;

  let signedBalance = 0;
  if (openingBalance > 0) {
    signedBalance = balanceType === 'To Give' ? -Math.abs(openingBalance) : Math.abs(openingBalance);
  }

  const insertPayload: any = {
    business_id: businessId,
    name: name.trim(),
    phone: phone?.trim() || null,
    type,
  };

  if (id) insertPayload.id = id;
  if (email?.trim()) insertPayload.email = email.trim();
  if (address?.trim()) insertPayload.address = address.trim();
  if (signedBalance !== 0) insertPayload.balance = signedBalance;

  let res = await supabase
    .from('parties')
    .upsert(insertPayload, { onConflict: 'id' })
    .select('id, name, phone, type, created_at')
    .single();

  // If PostgREST returns missing column error (code PGRST204 or message mentioning column), fallback safely to core fields
  if (res.error && (res.error.code === 'PGRST204' || res.error.message?.includes('column'))) {
    const fallbackPayload: any = {
      business_id: businessId,
      name: name.trim(),
      phone: phone?.trim() || null,
      type,
    };
    if (id) fallbackPayload.id = id;
    res = await supabase
      .from('parties')
      .upsert(fallbackPayload, { onConflict: 'id' })
      .select('id, name, phone, type, created_at')
      .single();
  }

  if (res.error) throw res.error;

  const data = res.data;

  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    email: email?.trim() || null,
    address: address?.trim() || null,
    subtitle: formatDateSubtitle(data.created_at, data.phone),
    type: 'Party',
    balance: Math.abs(signedBalance),
    balanceType: signedBalance > 0 ? 'To Receive' : signedBalance < 0 ? 'To Give' : 'Settled',
    createdAt: data.created_at,
    syncStatus: 'synced',
  };
}

/**
 * Resolves a party to a valid Supabase UUID.
 * If party exists in Supabase, returns its UUID.
 * If not, inserts the party into the parties table and returns the new UUID.
 */
export async function getOrCreateParty(
  businessId: string,
  party: { id: string; name: string; subtitle?: string; type?: string },
): Promise<string> {
  // If the party is already a confirmed Supabase party with a valid UUID
  if (party.type === 'Party' && UUID_REGEX.test(party.id)) {
    const { data: existing } = await supabase
      .from('parties')
      .select('id')
      .eq('business_id', businessId)
      .eq('id', party.id)
      .maybeSingle();

    if (existing?.id) {
      return existing.id;
    }
  }

  const phone =
    party.subtitle && party.subtitle !== 'No phone number'
      ? party.subtitle.replace(/[^\d+]/g, '').trim()
      : null;

  // Try matching by phone first if available
  if (phone) {
    const { data: byPhone } = await supabase
      .from('parties')
      .select('id')
      .eq('business_id', businessId)
      .eq('phone', phone)
      .maybeSingle();

    if (byPhone?.id) {
      return byPhone.id;
    }
  }

  // Try matching by name
  const { data: byNameRows } = await supabase
    .from('parties')
    .select('id')
    .eq('business_id', businessId)
    .ilike('name', party.name.trim())
    .limit(1);

  if (byNameRows && byNameRows.length > 0 && byNameRows[0]?.id) {
    return byNameRows[0].id;
  }

  // Create new party in Supabase
  const { data: created, error } = await supabase
    .from('parties')
    .insert({
      business_id: businessId,
      name: party.name.trim(),
      phone: phone || null,
      type: 'both',
    })
    .select('id')
    .single();

  if (error) throw error;
  return created.id;
}

/**
 * Checks if a party with the given name (case-insensitive) already exists for the business.
 */
export async function checkPartyExistsByName(businessId: string, name: string): Promise<boolean> {
  const trimmed = name.trim();
  if (!trimmed || !businessId) return false;

  try {
    const { data, error } = await supabase
      .from('parties')
      .select('id')
      .eq('business_id', businessId)
      .ilike('name', trimmed)
      .limit(1);

    if (error) {
      console.error('Error checking existing party by name:', error);
      return false;
    }

    return Array.isArray(data) && data.length > 0;
  } catch (err) {
    console.error('Error checking existing party by name:', err);
    return false;
  }
}

