import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { DateFilterType, TransactionItem, TransactionType } from '../types/transaction';
import { fetchTransactions, TransactionCursor } from '../services/transactionService';
import { transactionEvents } from '../services/transactionEvents';
import { auth } from '../lib/firebase';
import {
  getBusinessId,
  getOrCreateParty,
  getOrCreateExpenseCategory,
  recordSale,
  recordPurchase,
  recordPaymentIn,
  recordPaymentOut,
  recordExpense,
  generateInvoiceNumber,
} from '../services/quickEntryService';

export function useTransactions() {
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const [searchQuery, setSearchQueryState] = useState<string>('');
  const [dateFilter, setDateFilterState] = useState<DateFilterType>('all');
  const [typeFilter, setTypeFilterState] = useState<TransactionType | 'All'>('All');

  // Keyset cursor & preloading state refs
  const cursorRef = useRef<TransactionCursor | undefined>(undefined);
  const preloadedBufferRef = useRef<{ items: TransactionItem[]; nextCursor?: TransactionCursor; hasMore: boolean } | null>(null);
  const isFetchingRef = useRef<boolean>(false);
  const isPreloadingRef = useRef<boolean>(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribe to optimistic creation, background save, background failure, & user retry events
  useEffect(() => {
    const unsubCreated = transactionEvents.onCreated((newItem) => {
      setItems((prev) => [newItem, ...prev]);
    });

    const unsubSaved = transactionEvents.onSaved(({ tempId, realItem }) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === tempId ? (realItem ? realItem : { ...item, syncStatus: 'saved' }) : item,
        ),
      );
    });

    const unsubFailed = transactionEvents.onFailed(({ tempId, errorMsg }) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === tempId ? { ...item, syncStatus: 'failed', syncError: errorMsg } : item,
        ),
      );
    });

    const unsubRetry = transactionEvents.onRetry(async (retryItem) => {
      if (!retryItem || !retryItem.payload) return;

      // Mark card state as saving immediately
      setItems((prev) =>
        prev.map((item) =>
          item.id === retryItem.id ? { ...item, syncStatus: 'saving', syncError: undefined } : item,
        ),
      );

      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Please log in to record transactions.');
        const businessId = await getBusinessId(user.uid);
        if (!businessId) throw new Error('Could not find your business.');

        const { entryType, amountNum, selectedParty } = retryItem.payload;
        switch (entryType) {
          case 'Sale': {
            const isCash = !selectedParty;
            const partyId = selectedParty
              ? await getOrCreateParty(businessId, selectedParty)
              : null;
            await recordSale({
              businessId,
              partyId,
              invoiceNumber: generateInvoiceNumber(),
              totalAmount: amountNum,
              receivedAmount: isCash ? amountNum : 0,
              paymentType: isCash ? 'cash' : 'credit',
            });
            break;
          }
          case 'Purchase': {
            const isCash = !selectedParty;
            const partyId = selectedParty
              ? await getOrCreateParty(businessId, selectedParty)
              : null;
            await recordPurchase({
              businessId,
              partyId,
              totalAmount: amountNum,
              paidAmount: isCash ? amountNum : 0,
              paymentType: isCash ? 'cash' : 'credit',
            });
            break;
          }
          case 'Payment In': {
            const partyId = await getOrCreateParty(businessId, selectedParty!);
            await recordPaymentIn({
              businessId,
              partyId,
              amount: amountNum,
              paymentMethod: 'cash',
            });
            break;
          }
          case 'Payment Out': {
            const partyId = await getOrCreateParty(businessId, selectedParty!);
            await recordPaymentOut({
              businessId,
              partyId,
              amount: amountNum,
              paymentMethod: 'cash',
            });
            break;
          }
          case 'Expense': {
            const categoryId = await getOrCreateExpenseCategory(businessId, selectedParty!.name);
            await recordExpense({
              businessId,
              categoryId,
              amount: amountNum,
              paymentMethod: 'cash',
            });
            break;
          }
        }

        // Successfully saved on retry!
        transactionEvents.emitSaved(retryItem.id);
      } catch (err: any) {
        console.error('Retry save failed:', err);
        transactionEvents.emitFailed(retryItem.id, err?.message);
        Alert.alert(
          'Retry Failed',
          err?.message || 'Something went wrong while saving. Tap card to try again.',
        );
      }
    });

    return () => {
      unsubCreated();
      unsubSaved();
      unsubFailed();
      unsubRetry();
    };
  }, []);

  // Background prefetch function
  const prefetchNextPage = useCallback(
    async (currentCursor?: TransactionCursor, search = searchQuery, date = dateFilter, type = typeFilter) => {
      if (!currentCursor || isPreloadingRef.current) return;
      const user = auth.currentUser;
      if (!user) return;

      isPreloadingRef.current = true;
      try {
        const res = await fetchTransactions({
          firebaseUid: user.uid,
          cursor: currentCursor,
          searchQuery: search,
          dateFilter: date,
          typeFilter: type,
        });

        preloadedBufferRef.current = res;
      } catch (err) {
        console.error('Background prefetch error:', err);
      } finally {
        isPreloadingRef.current = false;
      }
    },
    [searchQuery, dateFilter, typeFilter],
  );

  // Initial load
  const loadInitialData = useCallback(
    async (search = searchQuery, date = dateFilter, type = typeFilter) => {
      const user = auth.currentUser;
      if (!user) {
        setItems([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      isFetchingRef.current = true;
      preloadedBufferRef.current = null;
      cursorRef.current = undefined;

      try {
        const { items: newItems, nextCursor, hasMore: more } = await fetchTransactions({
          firebaseUid: user.uid,
          cursor: undefined,
          searchQuery: search,
          dateFilter: date,
          typeFilter: type,
        });

        setItems(newItems);
        setHasMore(more);
        cursorRef.current = nextCursor;

        // Trigger background prefetch for page 2 if page 1 has more
        if (more && nextCursor) {
          prefetchNextPage(nextCursor, search, date, type);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        isFetchingRef.current = false;
      }
    },
    [searchQuery, dateFilter, typeFilter, prefetchNextPage],
  );

  // Initial load effect
  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle pull-to-refresh
  const refresh = useCallback(() => {
    setRefreshing(true);
    loadInitialData(searchQuery, dateFilter, typeFilter);
  }, [loadInitialData, searchQuery, dateFilter, typeFilter]);

  // Infinite scroll load more with instant buffer consumption & prefetching
  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || loadingMore || !hasMore || loading) return;

    const user = auth.currentUser;
    if (!user) return;

    // Check if preloaded buffer is ready
    if (preloadedBufferRef.current && preloadedBufferRef.current.items.length > 0) {
      const buffer = preloadedBufferRef.current;
      preloadedBufferRef.current = null;

      setItems((prev) => [...prev, ...buffer.items]);
      setHasMore(buffer.hasMore);
      cursorRef.current = buffer.nextCursor;

      // Trigger background prefetch for the NEXT page
      if (buffer.hasMore && buffer.nextCursor) {
        prefetchNextPage(buffer.nextCursor);
      }
      return;
    }

    // Fallback: fetch next page directly
    if (!cursorRef.current) return;
    isFetchingRef.current = true;
    setLoadingMore(true);

    try {
      const { items: newItems, nextCursor, hasMore: more } = await fetchTransactions({
        firebaseUid: user.uid,
        cursor: cursorRef.current,
        searchQuery,
        dateFilter,
        typeFilter,
      });

      setItems((prev) => [...prev, ...newItems]);
      setHasMore(more);
      cursorRef.current = nextCursor;

      if (more && nextCursor) {
        prefetchNextPage(nextCursor);
      }
    } catch (error) {
      console.error('Error loading more transactions:', error);
    } finally {
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [loadingMore, hasMore, loading, searchQuery, dateFilter, typeFilter, prefetchNextPage]);

  // Filter setters (debounced text search & guarded filter updates)
  const setSearchQuery = useCallback(
    (query: string) => {
      setSearchQueryState(query);
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      if (query.trim() === '') {
        setLoading(true);
        loadInitialData('', dateFilter, typeFilter);
      } else {
        searchDebounceRef.current = setTimeout(() => {
          setLoading(true);
          loadInitialData(query, dateFilter, typeFilter);
        }, 300);
      }
    },
    [loadInitialData, dateFilter, typeFilter],
  );

  const setDateFilter = useCallback(
    (filter: DateFilterType) => {
      if (filter === dateFilter) return;
      setDateFilterState(filter);
      setLoading(true);
      loadInitialData(searchQuery, filter, typeFilter);
    },
    [loadInitialData, searchQuery, typeFilter, dateFilter],
  );

  const setTypeFilter = useCallback(
    (filter: TransactionType | 'All') => {
      if (filter === typeFilter) return;
      setTypeFilterState(filter);
      setLoading(true);
      loadInitialData(searchQuery, dateFilter, filter);
    },
    [loadInitialData, searchQuery, dateFilter, typeFilter],
  );

  const resetFilters = useCallback(() => {
    setSearchQueryState('');
    setDateFilterState('all');
    setTypeFilterState('All');
    setLoading(true);
    loadInitialData('', 'all', 'All');
  }, [loadInitialData]);

  return {
    items,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    searchQuery,
    dateFilter,
    typeFilter,
    loadMore,
    refresh,
    setSearchQuery,
    setDateFilter,
    setTypeFilter,
    resetFilters,
  };
}
