import { TransactionItem } from '../types/transaction';
import { formatDate } from './dateUtils';

export function mapSalesToItems(
  salesList: any[],
  partyMap: Map<string, string>,
): TransactionItem[] {
  const totalSales = salesList.length;
  return salesList.map((s, idx) => {
    const partyName = s.party_id ? partyMap.get(s.party_id) || 'Customer' : 'Cash Sale';
    const total = Number(s.total_amount || 0);
    const received = Number(s.received_amount || 0);
    const balance = total - received;
    const itemNum = totalSales - idx;

    return {
      id: `sale-${s.id}`,
      type: 'Sale',
      indexNo: `#${itemNum}`,
      partyName,
      totalAmount: total,
      secondaryAmount: balance,
      secondaryLabel: 'Balance',
      status: balance <= 0 ? 'Paid' : received > 0 ? 'Partial' : 'Unpaid',
      date: formatDate(s.created_at),
      rawDate: s.created_at,
      note: s.note,
    };
  });
}

export function mapPurchasesToItems(
  purchasesList: any[],
  partyMap: Map<string, string>,
): TransactionItem[] {
  const totalPurchases = purchasesList.length;
  return purchasesList.map((p, idx) => {
    const partyName = p.party_id ? partyMap.get(p.party_id) || 'Supplier' : 'Cash Purchase';
    const total = Number(p.total_amount || 0);
    const paid = Number(p.paid_amount || 0);
    const balance = total - paid;
    const itemNum = totalPurchases - idx;

    return {
      id: `purchase-${p.id}`,
      type: 'Purchase',
      indexNo: `#${itemNum}`,
      partyName,
      totalAmount: total,
      secondaryAmount: balance,
      secondaryLabel: 'Balance',
      status: balance <= 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid',
      date: formatDate(p.created_at),
      rawDate: p.created_at,
      note: p.note,
    };
  });
}

export function mapPaymentInToItems(
  paymentInList: any[],
  partyMap: Map<string, string>,
): TransactionItem[] {
  const totalPaymentIn = paymentInList.length;
  return paymentInList.map((pi, idx) => {
    const partyName = pi.party_id ? partyMap.get(pi.party_id) || 'Party' : 'Cash';
    const amount = Number(pi.amount || 0);
    const itemNum = totalPaymentIn - idx;

    return {
      id: `pi-${pi.id}`,
      type: 'PaymentIn',
      indexNo: `#${itemNum}`,
      partyName,
      totalAmount: amount,
      secondaryAmount: amount,
      secondaryLabel: 'Unused',
      status: 'Paid',
      date: formatDate(pi.created_at),
      rawDate: pi.created_at,
      note: pi.note,
      paymentMethod: pi.payment_method,
    };
  });
}

export function mapPaymentOutToItems(
  paymentOutList: any[],
  partyMap: Map<string, string>,
): TransactionItem[] {
  const totalPaymentOut = paymentOutList.length;
  return paymentOutList.map((po, idx) => {
    const partyName = po.party_id ? partyMap.get(po.party_id) || 'Party' : 'Cash';
    const amount = Number(po.amount || 0);
    const itemNum = totalPaymentOut - idx;

    return {
      id: `po-${po.id}`,
      type: 'PaymentOut',
      indexNo: `#${itemNum}`,
      partyName,
      totalAmount: amount,
      secondaryAmount: amount,
      secondaryLabel: 'Unused',
      status: 'Paid',
      date: formatDate(po.created_at),
      rawDate: po.created_at,
      note: po.note,
      paymentMethod: po.payment_method,
    };
  });
}

export function mapExpensesToItems(
  expensesList: any[],
  categoryMap: Map<string, string>,
): TransactionItem[] {
  const totalExpenses = expensesList.length;
  return expensesList.map((e, idx) => {
    const categoryName = e.category_id ? categoryMap.get(e.category_id) || 'General Expense' : 'Expense';
    const amount = Number(e.amount || 0);
    const itemNum = totalExpenses - idx;

    return {
      id: `exp-${e.id}`,
      type: 'Expense',
      indexNo: `#${itemNum}`,
      partyName: categoryName,
      totalAmount: amount,
      secondaryAmount: amount,
      secondaryLabel: 'Unused',
      status: 'Paid',
      date: formatDate(e.created_at),
      rawDate: e.created_at,
      note: e.note,
      paymentMethod: e.payment_method,
    };
  });
}
