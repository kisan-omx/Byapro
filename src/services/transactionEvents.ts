import { TransactionItem } from "../types/transaction";

type TransactionCreatedListener = (item: TransactionItem) => void;
type TransactionSavedListener = (data: {
  tempId: string;
  realItem?: TransactionItem;
}) => void;
type TransactionFailedListener = (data: {
  tempId: string;
  errorMsg?: string;
}) => void;
type TransactionRetryListener = (item: TransactionItem) => void;

const createdListeners = new Set<TransactionCreatedListener>();
const savedListeners = new Set<TransactionSavedListener>();
const failedListeners = new Set<TransactionFailedListener>();
const retryListeners = new Set<TransactionRetryListener>();

export const transactionEvents = {
  // Subscribe to optimistic transaction creation
  onCreated(listener: TransactionCreatedListener) {
    createdListeners.add(listener);
    return () => createdListeners.delete(listener);
  },

  // Subscribe to background save success
  onSaved(listener: TransactionSavedListener) {
    savedListeners.add(listener);
    return () => savedListeners.delete(listener);
  },

  // Subscribe to background save failure
  onFailed(listener: TransactionFailedListener) {
    failedListeners.add(listener);
    return () => failedListeners.delete(listener);
  },

  // Subscribe to user retry requests
  onRetry(listener: TransactionRetryListener) {
    retryListeners.add(listener);
    return () => retryListeners.delete(listener);
  },

  // Notify listeners that a transaction was created optimistically
  emitCreated(item: TransactionItem) {
    createdListeners.forEach((listener) => {
      try {
        listener(item);
      } catch (err) {
        console.error("Error in transaction onCreated listener:", err);
      }
    });
  },

  // Notify listeners that background save completed
  emitSaved(tempId: string, realItem?: TransactionItem) {
    savedListeners.forEach((listener) => {
      try {
        listener({ tempId, realItem });
      } catch (err) {
        console.error("Error in transaction onSaved listener:", err);
      }
    });
  },

  // Notify listeners that background save failed
  emitFailed(tempId: string, errorMsg?: string) {
    failedListeners.forEach((listener) => {
      try {
        listener({ tempId, errorMsg });
      } catch (err) {
        console.error("Error in transaction onFailed listener:", err);
      }
    });
  },

  // Notify system that user tapped Retry on a failed transaction
  emitRetry(item: TransactionItem) {
    retryListeners.forEach((listener) => {
      try {
        listener(item);
      } catch (err) {
        console.error("Error in transaction onRetry listener:", err);
      }
    });
  },
};
