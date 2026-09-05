import { supabase } from '../lib/supabase';

/**
 * Fetches the business_id for the currently authenticated Firebase user.
 * Returns null if not found.
 */
let cachedBusinessId: { uid: string; id: string } | null = null;

export async function getBusinessId(firebaseUid: string): Promise<string | null> {
  if (cachedBusinessId && cachedBusinessId.uid === firebaseUid) {
    return cachedBusinessId.id;
  }

  const { data, error } = await supabase
    .from('users')
    .select('business_id')
    .eq('id', firebaseUid)
    .single();

  if (!error && data?.business_id) {
    cachedBusinessId = { uid: firebaseUid, id: data.business_id };
    return data.business_id;
  }

  // Fallback: Check businesses table where owner_id = firebaseUid
  const { data: businessData } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', firebaseUid)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (businessData?.id) {
    // Update users table in the background so subsequent lookups are fast
    supabase.from('users').update({ business_id: businessData.id }).eq('id', firebaseUid).then();
    return businessData.id;
  }

  return null;
}

export { getOrCreateParty } from './partyService';

/**
 * Resolves an expense category to a valid Supabase UUID.
 * If category exists in Supabase for this business, returns its UUID.
 * If not, creates the category in expense_categories and returns the new UUID.
 */
export async function getOrCreateExpenseCategory(
  businessId: string,
  categoryName: string,
): Promise<string> {
  const trimmedName = categoryName.trim();

  // Try finding existing category
  const { data: existing } = await supabase
    .from('expense_categories')
    .select('id')
    .eq('business_id', businessId)
    .ilike('name', trimmedName)
    .maybeSingle();

  if (existing?.id) {
    return existing.id;
  }

  // Create if not found
  const { data: created, error } = await supabase
    .from('expense_categories')
    .upsert(
      {
        business_id: businessId,
        name: trimmedName,
      },
      { onConflict: 'business_id,name' },
    )
    .select('id')
    .single();

  if (error) throw error;
  return created.id;
}


export interface SalePayload {
  businessId: string;
  partyId: string | null;       // null = cash sale
  invoiceNumber: string;
  totalAmount: number;
  receivedAmount: number;
  paymentType: 'cash' | 'credit' | 'partial';
  note?: string;
}

export interface PurchasePayload {
  businessId: string;
  partyId: string | null;
  totalAmount: number;
  paidAmount: number;
  paymentType: 'cash' | 'credit' | 'partial';
  note?: string;
}

export interface PaymentInPayload {
  businessId: string;
  partyId: string;
  amount: number;
  paymentMethod: 'cash' | 'bank' | 'cheque' | 'online';
  note?: string;
}

export interface PaymentOutPayload {
  businessId: string;
  partyId: string;
  amount: number;
  paymentMethod: 'cash' | 'bank' | 'cheque' | 'online';
  note?: string;
}

export interface ExpensePayload {
  businessId: string;
  categoryId: string;
  amount: number;
  paymentMethod: 'cash' | 'bank' | 'cheque' | 'online';
  note?: string;
}

/** Generate a simple sequential invoice number based on timestamp */
function generateInvoiceNumber(): string {
  return `INV-${Date.now()}`;
}

export async function recordSale(payload: SalePayload): Promise<void> {
  const { error } = await supabase.from('sales').insert({
    business_id: payload.businessId,
    party_id: payload.partyId,
    invoice_number: payload.invoiceNumber,
    total_amount: payload.totalAmount,
    received_amount: payload.receivedAmount,
    payment_type: payload.paymentType,
    note: payload.note ?? null,
  });
  if (error) throw error;
}

export async function recordPurchase(payload: PurchasePayload): Promise<void> {
  const { error } = await supabase.from('purchases').insert({
    business_id: payload.businessId,
    party_id: payload.partyId,
    total_amount: payload.totalAmount,
    paid_amount: payload.paidAmount,
    payment_type: payload.paymentType,
    note: payload.note ?? null,
  });
  if (error) throw error;
}

export async function recordPaymentIn(payload: PaymentInPayload): Promise<void> {
  const { error } = await supabase.from('payment_in').insert({
    business_id: payload.businessId,
    party_id: payload.partyId,
    amount: payload.amount,
    payment_method: payload.paymentMethod,
    note: payload.note ?? null,
  });
  if (error) throw error;
}

export async function recordPaymentOut(payload: PaymentOutPayload): Promise<void> {
  const { error } = await supabase.from('payment_out').insert({
    business_id: payload.businessId,
    party_id: payload.partyId,
    amount: payload.amount,
    payment_method: payload.paymentMethod,
    note: payload.note ?? null,
  });
  if (error) throw error;
}

export async function recordExpense(payload: ExpensePayload): Promise<void> {
  const { error } = await supabase.from('expenses').insert({
    business_id: payload.businessId,
    category_id: payload.categoryId,
    amount: payload.amount,
    payment_method: payload.paymentMethod,
    note: payload.note ?? null,
  });
  if (error) throw error;
}

export { generateInvoiceNumber };
