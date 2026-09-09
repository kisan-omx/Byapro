import { Item } from '../types/item';

// ─────────────────────────────────────────────────
// Typed callbacks
// ─────────────────────────────────────────────────
type CreatedCallback = (item: Item) => void;
type SavedCallback = (payload: { tempId: string; realItem: Item }) => void;
type FailedCallback = (payload: { tempId: string; errorMsg: string }) => void;
type RetryCallback = (item: Item) => void;

// ─────────────────────────────────────────────────
// Simple in-memory event bus for item CRUD events.
// Follows the same pattern as partyEvents.ts.
// ─────────────────────────────────────────────────
class ItemEventBus {
  private createdListeners: CreatedCallback[] = [];
  private savedListeners: SavedCallback[] = [];
  private failedListeners: FailedCallback[] = [];
  private retryListeners: RetryCallback[] = [];

  // ── Emit ────────────────────────────────────────
  emitCreated(item: Item) {
    this.createdListeners.forEach((cb) => cb(item));
  }

  emitSaved(tempId: string, realItem: Item) {
    this.savedListeners.forEach((cb) => cb({ tempId, realItem }));
  }

  emitFailed(tempId: string, errorMsg: string) {
    this.failedListeners.forEach((cb) => cb({ tempId, errorMsg }));
  }

  emitRetry(item: Item) {
    this.retryListeners.forEach((cb) => cb(item));
  }

  // ── Subscribe ───────────────────────────────────
  onCreated(cb: CreatedCallback): () => void {
    this.createdListeners.push(cb);
    return () => {
      this.createdListeners = this.createdListeners.filter((l) => l !== cb);
    };
  }

  onSaved(cb: SavedCallback): () => void {
    this.savedListeners.push(cb);
    return () => {
      this.savedListeners = this.savedListeners.filter((l) => l !== cb);
    };
  }

  onFailed(cb: FailedCallback): () => void {
    this.failedListeners.push(cb);
    return () => {
      this.failedListeners = this.failedListeners.filter((l) => l !== cb);
    };
  }

  onRetry(cb: RetryCallback): () => void {
    this.retryListeners.push(cb);
    return () => {
      this.retryListeners = this.retryListeners.filter((l) => l !== cb);
    };
  }
}

export const itemEvents = new ItemEventBus();
