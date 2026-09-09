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
    .maybeSingle(); // .single() throws if row missing; maybeSingle() returns null safely

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

export interface TransactionLineItem {
  itemId?: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  totalAmount: number;
}

export interface SalePayload {
  businessId: string;
  partyId: string | null;       // null = cash sale
  invoiceNumber?: string;
  totalAmount: number;
  receivedAmount: number;
  paymentType: 'cash' | 'credit' | 'partial';
  note?: string;
  items?: TransactionLineItem[];
}

export interface PurchasePayload {
  businessId: string;
  partyId: string | null;
  invoiceNumber?: string;
  totalAmount: number;
  paidAmount: number;
  paymentType: 'cash' | 'credit' | 'partial';
  note?: string;
  items?: TransactionLineItem[];
}

export interface SaleReturnPayload {
  businessId: string;
  saleId?: string | null;
  partyId: string | null;
  returnNumber?: string;
  totalAmount: number;
  refundedAmount: number;
  paymentType: 'cash' | 'credit' | 'partial';
  note?: string;
  items?: TransactionLineItem[];
}

export interface PurchaseReturnPayload {
  businessId: string;
  purchaseId?: string | null;
  partyId: string | null;
  returnNumber?: string;
  totalAmount: number;
  refundedAmount: number;
  paymentType: 'cash' | 'credit' | 'partial';
  note?: string;
  items?: TransactionLineItem[];
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

export async function recordSale(payload: SalePayload): Promise<string> {
  const { data, error } = await supabase.rpc('record_sale_transaction', {
    p_business_id: payload.businessId,
    p_party_id: payload.partyId,
    p_invoice_number: payload.invoiceNumber ?? null,
    p_total_amount: payload.totalAmount,
    p_received_amount: payload.receivedAmount,
    p_payment_type: payload.paymentType,
    p_note: payload.note ?? null,
    p_items: (payload.items || []).map((i) => ({
      item_id: i.itemId ?? null,
      item_name: i.itemName,
      quantity: i.quantity,
      unit_price: i.unitPrice,
      discount: i.discount ?? 0,
      total_amount: i.totalAmount,
    })),
  });
  if (error) throw error;
  return data;
}

export async function recordPurchase(payload: PurchasePayload): Promise<string> {
  const { data, error } = await supabase.rpc('record_purchase_transaction', {
    p_business_id: payload.businessId,
    p_party_id: payload.partyId,
    p_invoice_number: payload.invoiceNumber ?? null,
    p_total_amount: payload.totalAmount,
    p_paid_amount: payload.paidAmount,
    p_payment_type: payload.paymentType,
    p_note: payload.note ?? null,
    p_items: (payload.items || []).map((i) => ({
      item_id: i.itemId ?? null,
      item_name: i.itemName,
      quantity: i.quantity,
      unit_price: i.unitPrice,
      discount: i.discount ?? 0,
      total_amount: i.totalAmount,
    })),
  });
  if (error) throw error;
  return data;
}

export async function recordSaleReturn(payload: SaleReturnPayload): Promise<string> {
  const { data, error } = await supabase.rpc('record_sale_return_transaction', {
    p_business_id: payload.businessId,
    p_sale_id: payload.saleId ?? null,
    p_party_id: payload.partyId,
    p_return_number: payload.returnNumber ?? null,
    p_total_amount: payload.totalAmount,
    p_refunded_amount: payload.refundedAmount,
    p_payment_type: payload.paymentType,
    p_note: payload.note ?? null,
    p_items: (payload.items || []).map((i) => ({
      item_id: i.itemId ?? null,
      item_name: i.itemName,
      quantity: i.quantity,
      unit_price: i.unitPrice,
      total_amount: i.totalAmount,
    })),
  });
  if (error) throw error;
  return data;
}

export async function recordPurchaseReturn(payload: PurchaseReturnPayload): Promise<string> {
  const { data, error } = await supabase.rpc('record_purchase_return_transaction', {
    p_business_id: payload.businessId,
    p_purchase_id: payload.purchaseId ?? null,
    p_party_id: payload.partyId,
    p_return_number: payload.returnNumber ?? null,
    p_total_amount: payload.totalAmount,
    p_refunded_amount: payload.refundedAmount,
    p_payment_type: payload.paymentType,
    p_note: payload.note ?? null,
    p_items: (payload.items || []).map((i) => ({
      item_id: i.itemId ?? null,
      item_name: i.itemName,
      quantity: i.quantity,
      unit_price: i.unitPrice,
      total_amount: i.totalAmount,
    })),
  });
  if (error) throw error;
  return data;
}

export async function recordPaymentIn(payload: PaymentInPayload): Promise<string> {
  const { data, error } = await supabase.rpc('record_payment_in_transaction', {
    p_business_id: payload.businessId,
    p_party_id: payload.partyId,
    p_amount: payload.amount,
    p_payment_method: payload.paymentMethod,
    p_note: payload.note ?? null,
  });
  if (error) throw error;
  return data;
}

export async function recordPaymentOut(payload: PaymentOutPayload): Promise<string> {
  const { data, error } = await supabase.rpc('record_payment_out_transaction', {
    p_business_id: payload.businessId,
    p_party_id: payload.partyId,
    p_amount: payload.amount,
    p_payment_method: payload.paymentMethod,
    p_note: payload.note ?? null,
  });
  if (error) throw error;
  return data;
}

export async function recordExpense(payload: ExpensePayload): Promise<string> {
  const { data, error } = await supabase.rpc('record_expense_transaction', {
    p_business_id: payload.businessId,
    p_category_id: payload.categoryId,
    p_amount: payload.amount,
    p_payment_method: payload.paymentMethod,
    p_note: payload.note ?? null,
  });
  if (error) throw error;
  return data;
}

export { generateInvoiceNumber };
