import { supabase } from '../lib/supabase';
import { Party } from '../components/quick-entry/PartySelectionModal';

export const PAGE_SIZE = 20;

export interface FetchPartiesParams {
  businessId?: string | null;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
  type?: 'customer' | 'supplier' | 'both';
}

export interface FetchPartiesResponse {
  parties: Party[];
  hasMore: boolean;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
}: FetchPartiesParams): Promise<FetchPartiesResponse> {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('parties')
    .select('id, name, phone, type, created_at')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(from, to);

  if (businessId) {
    query = query.eq('business_id', businessId);
  }

  if (type) {
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
  const parties: Party[] = rawList.map((p: any) => ({
    id: p.id,
    name: p.name,
    subtitle: p.phone || 'Party',
    type: 'Party' as const,
  }));

  const hasMore = rawList.length === pageSize;

  return { parties, hasMore };
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
  const { data: byName } = await supabase
    .from('parties')
    .select('id')
    .eq('business_id', businessId)
    .ilike('name', party.name.trim())
    .maybeSingle();

  if (byName?.id) {
    return byName.id;
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
