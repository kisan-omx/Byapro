import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { DateFilterType, TransactionItem, TransactionType } from '../types/transaction';
import { fetchTransactions } from '../services/transactionService';
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
  const [page, setPage] = useState<number>(0);

  const [searchQuery, setSearchQueryState] = useState<string>('');
  const [dateFilter, setDateFilterState] = useState<DateFilterType>('all');
  const [typeFilter, setTypeFilterState] = useState<TransactionType | 'All'>('All');

  // Prevent duplicate concurrent page requests
  const isFetchingRef = useRef<boolean>(false);
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
      try {
        const { items: newItems, hasMore: more } = await fetchTransactions({
          firebaseUid: user.uid,
          page: 0,
          searchQuery: search,
          dateFilter: date,
          typeFilter: type,
        });

        setItems(newItems);
        setHasMore(more);
        setPage(0);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        isFetchingRef.current = false;
      }
    },
    [searchQuery, dateFilter, typeFilter],
  );

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle pull-to-refresh
  const refresh = useCallback(() => {
    setRefreshing(true);
    loadInitialData(searchQuery, dateFilter, typeFilter);
  }, [loadInitialData, searchQuery, dateFilter, typeFilter]);

  // Infinite scroll load more
  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || loadingMore || !hasMore || loading) return;

    const user = auth.currentUser;
    if (!user) return;

    isFetchingRef.current = true;
    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      const { items: newItems, hasMore: more } = await fetchTransactions({
        firebaseUid: user.uid,
        page: nextPage,
        searchQuery,
        dateFilter,
        typeFilter,
      });

      setItems((prev) => [...prev, ...newItems]);
      setHasMore(more);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more transactions:', error);
    } finally {
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [page, loadingMore, hasMore, loading, searchQuery, dateFilter, typeFilter]);

  // Filter setters (reset pagination to 0)
  const setSearchQuery = useCallback(
    (query: string) => {
      setSearchQueryState(query);
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      searchDebounceRef.current = setTimeout(() => {
        setLoading(true);
        loadInitialData(query, dateFilter, typeFilter);
      }, 250);
    },
    [loadInitialData, dateFilter, typeFilter],
  );

  const setDateFilter = useCallback(
    (filter: DateFilterType) => {
      setDateFilterState(filter);
      setLoading(true);
      loadInitialData(searchQuery, filter, typeFilter);
    },
    [loadInitialData, searchQuery, typeFilter],
  );

  const setTypeFilter = useCallback(
    (filter: TransactionType | 'All') => {
      setTypeFilterState(filter);
      setLoading(true);
      loadInitialData(searchQuery, dateFilter, filter);
    },
    [loadInitialData, searchQuery, dateFilter],
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
