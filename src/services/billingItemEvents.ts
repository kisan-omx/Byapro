import { Item } from "../types/item";

export interface BillingItemData {
  item: Item;
  quantity: number;
  rate: number;
  discountAmount: number;
  totalAmount: number;
}

type BillingItemAddedListener = (billingItem: BillingItemData) => void;

const listeners = new Set<BillingItemAddedListener>();

export const billingItemEvents = {
  onAdded(listener: BillingItemAddedListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  emitAdded(billingItem: BillingItemData) {
    listeners.forEach((listener) => {
      try {
        listener(billingItem);
      } catch (err) {
        console.error("Error in billingItem onAdded listener:", err);
      }
    });
  },
};
