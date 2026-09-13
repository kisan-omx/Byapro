import { Party } from "../types/party";

type PartyCreatedListener = (party: Party) => void;
type PartySavedListener = (data: { tempId: string; realParty?: Party }) => void;
type PartyFailedListener = (data: {
  tempId: string;
  errorMsg?: string;
}) => void;
type PartyRetryListener = (party: Party) => void;

const createdListeners = new Set<PartyCreatedListener>();
const savedListeners = new Set<PartySavedListener>();
const failedListeners = new Set<PartyFailedListener>();
const retryListeners = new Set<PartyRetryListener>();

export const partyEvents = {
  // Subscribe to optimistic party creation
  onCreated(listener: PartyCreatedListener) {
    createdListeners.add(listener);
    return () => createdListeners.delete(listener);
  },

  // Subscribe to background save success
  onSaved(listener: PartySavedListener) {
    savedListeners.add(listener);
    return () => savedListeners.delete(listener);
  },

  // Subscribe to background save failure
  onFailed(listener: PartyFailedListener) {
    failedListeners.add(listener);
    return () => failedListeners.delete(listener);
  },

  // Subscribe to user retry requests
  onRetry(listener: PartyRetryListener) {
    retryListeners.add(listener);
    return () => retryListeners.delete(listener);
  },

  // Notify listeners that a party was created optimistically
  emitCreated(party: Party) {
    createdListeners.forEach((listener) => {
      try {
        listener(party);
      } catch (err) {
        console.error("Error in party onCreated listener:", err);
      }
    });
  },

  // Notify listeners that background save completed
  emitSaved(tempId: string, realParty?: Party) {
    savedListeners.forEach((listener) => {
      try {
        listener({ tempId, realParty });
      } catch (err) {
        console.error("Error in party onSaved listener:", err);
      }
    });
  },

  // Notify listeners that background save failed
  emitFailed(tempId: string, errorMsg?: string) {
    failedListeners.forEach((listener) => {
      try {
        listener({ tempId, errorMsg });
      } catch (err) {
        console.error("Error in party onFailed listener:", err);
      }
    });
  },

  // Notify system that user tapped Retry on a failed party
  emitRetry(party: Party) {
    retryListeners.forEach((listener) => {
      try {
        listener(party);
      } catch (err) {
        console.error("Error in party onRetry listener:", err);
      }
    });
  },
};
