import { supabase } from "../lib/supabase";
import { getBusinessId } from "./quickEntryService";
import {
  DateFilterType,
  TransactionItem,
  TransactionType,
} from "../types/transaction";
import { PAGE_SIZE } from "../constants/transactionConstants";
import { getDateFilterBoundaries, formatDate } from "../utils/dateUtils";

export interface TransactionCursor {
  lastCreatedAt: string;
  lastId: string;
}

export interface FetchTransactionsParams {
  firebaseUid: string;
  cursor?: TransactionCursor;
  searchQuery?: string;
  dateFilter?: DateFilterType;
  typeFilter?: TransactionType | "All";
  limit?: number;
}

export async function fetchTransactions({
  firebaseUid,
  cursor,
  searchQuery = "",
  dateFilter = "all",
  typeFilter = "All",
  limit = PAGE_SIZE,
}: FetchTransactionsParams): Promise<{
  items: TransactionItem[];
  nextCursor?: TransactionCursor;
  hasMore: boolean;
}> {
  const businessId = await getBusinessId(firebaseUid);
  if (!businessId) {
    return { items: [], hasMore: false };
  }

  // Determine date boundaries if dateFilter is active
  const { startDateIso, endDateIso } = getDateFilterBoundaries(dateFilter);

  // Fetch limit (+1 to determine hasMore)
  const fetchLimit = limit + 1;

  let q = supabase
    .from("unified_transactions")
    .select(
      "id, raw_id, business_id, party_id, party_name, type, index_no, total_amount, secondary_amount, secondary_label, status, note, payment_method, created_at",
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .order("raw_id", { ascending: false })
    .limit(fetchLimit);

  if (typeFilter !== "All") {
    q = q.eq("type", typeFilter);
  }

  if (startDateIso) q = q.gte("created_at", startDateIso);
  if (endDateIso) q = q.lt("created_at", endDateIso);

  if (cursor?.lastCreatedAt) {
    q = q.lte("created_at", cursor.lastCreatedAt);
  }

  const cleanQuery = searchQuery.trim();
  if (cleanQuery) {
    q = q.or(
      `party_name.ilike.%${cleanQuery}%,note.ilike.%${cleanQuery}%,index_no.ilike.%${cleanQuery}%`,
    );
  }

  const { data, error } = await q;

  if (error || !data) {
    console.error("Error querying unified_transactions view:", error);
    return { items: [], hasMore: false };
  }

  // Apply keyset cursor filtering if cursor provided
  let filteredData = data;
  if (cursor) {
    const cursorTime = new Date(cursor.lastCreatedAt).getTime();
    filteredData = data.filter((row) => {
      const itemTime = new Date(row.created_at).getTime();
      if (itemTime < cursorTime) return true;
      if (itemTime === cursorTime)
        return String(row.raw_id).localeCompare(cursor.lastId) < 0;
      return false;
    });
  }

  const hasMore = filteredData.length > limit;
  const pageSlice = filteredData.slice(0, limit);

  const items: TransactionItem[] = pageSlice.map((row) => ({
    id: row.id,
    type: row.type as TransactionType,
    indexNo: row.index_no,
    partyName: row.party_name,
    totalAmount: Number(row.total_amount || 0),
    secondaryAmount: Number(row.secondary_amount || 0),
    secondaryLabel: row.secondary_label,
    status: row.status,
    date: formatDate(row.created_at),
    rawDate: row.created_at,
    note: row.note,
    paymentMethod: row.payment_method,
  }));

  const lastItem = items[items.length - 1];
  const nextCursor: TransactionCursor | undefined = lastItem
    ? {
        lastCreatedAt: lastItem.rawDate,
        lastId: lastItem.id.replace(/^(sale|purchase|pi|po|exp|sr|pr)-/, ""),
      }
    : undefined;

  return {
    items,
    nextCursor,
    hasMore,
  };
}

export async function fetchSingleTransaction(
  businessId: string,
  rawId: string,
  type: TransactionType,
): Promise<TransactionItem | null> {
  const prefixMap: Record<TransactionType, string> = {
    Sale: "sale-",
    Purchase: "purchase-",
    PaymentIn: "pi-",
    PaymentOut: "po-",
    Expense: "exp-",
    SaleReturn: "sr-",
    PurchaseReturn: "pr-",
    Quotation: "q-",
  };
  const prefix = prefixMap[type] || "";
  const targetId = `${prefix}${rawId}`;

  const { data, error } = await supabase
    .from("unified_transactions")
    .select(
      "id, raw_id, business_id, party_id, party_name, type, index_no, total_amount, secondary_amount, secondary_label, status, note, payment_method, created_at",
    )
    .eq("business_id", businessId)
    .eq("id", targetId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    type: data.type as TransactionType,
    indexNo: data.index_no,
    partyName: data.party_name,
    totalAmount: Number(data.total_amount || 0),
    secondaryAmount: Number(data.secondary_amount || 0),
    secondaryLabel: data.secondary_label,
    status: data.status,
    date: formatDate(data.created_at),
    rawDate: data.created_at,
    note: data.note,
    paymentMethod: data.payment_method,
    syncStatus: "saved",
  };
}
