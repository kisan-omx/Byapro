import { useState, useEffect, useCallback, useRef } from 'react';
import { auth } from '../lib/firebase';
import { getBusinessId } from '../services/quickEntryService';
import { getParties, PAGE_SIZE, FetchPartiesParams } from '../services/partyService';
import { Party } from '../components/quick-entry/PartySelectionModal';

export interface UsePartiesOptions {
  searchQuery?: string;
  type?: 'customer' | 'supplier' | 'both';
  enabled?: boolean;
}

let partyCache: {
  parties: Party[];
  hasMore: boolean;
} | null = null;

export async function preloadParties() {
  if (partyCache) return;
  try {
    const user = auth.currentUser;
    const businessId = user ? await getBusinessId(user.uid) : null;
    const result = await getParties({
      businessId,
      searchQuery: '',
      page: 0,
      pageSize: PAGE_SIZE,
    });
    partyCache = {
      parties: result.parties,
      hasMore: result.hasMore,
    };
  } catch (e) {
    // Non-blocking
  }
}

export function useParties(options: UsePartiesOptions = {}) {
  const { searchQuery = '', type, enabled = true } = options;

  // Cache-first: initialize with cached parties if available and not searching
  const [parties, setParties] = useState<Party[]>(() => {
    return !searchQuery.trim() && partyCache ? partyCache.parties : [];
  });
  const [loading, setLoading] = useState(() => {
    return !searchQuery.trim() && partyCache ? false : false;
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(() => {
    return partyCache ? partyCache.hasMore : true;
  });
  const [error, setError] = useState<string | null>(null);

  // Pagination refs to protect against stale closures and duplicate in-flight requests
  const pageRef = useRef(0);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(hasMore);

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Initial load or when search / filter changes
  const fetchFirstPage = useCallback(async (queryTerm: string) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    
    // Only show full loading spinner if we don't have cached data to display
    const hasCachedData = !queryTerm.trim() && partyCache && partyCache.parties.length > 0;
    if (!hasCachedData) {
      setLoading(true);
    }
    setError(null);

    try {
      const user = auth.currentUser;
      const businessId = user ? await getBusinessId(user.uid) : null;

      const result = await getParties({
        businessId,
        searchQuery: queryTerm,
        page: 0,
        pageSize: PAGE_SIZE,
        type,
      });

      pageRef.current = 0;
      hasMoreRef.current = result.hasMore;
      setHasMore(result.hasMore);
      setParties(result.parties);

      // Cache default first page
      if (!queryTerm.trim()) {
        partyCache = {
          parties: result.parties,
          hasMore: result.hasMore,
        };
      }
    } catch (err: any) {
      console.error('Error fetching first page of parties:', err);
      setError(err?.message || 'Failed to load parties');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [type]);

  // Trigger initial fetch or reset on query/filter/enabled change
  useEffect(() => {
    if (enabled) {
      pageRef.current = 0;
      hasMoreRef.current = true;
      setHasMore(true);
      fetchFirstPage(debouncedQuery);
    }
  }, [enabled, debouncedQuery, fetchFirstPage]);

  // Pull-to-refresh: resets pagination and loads the first 20
  const refresh = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setRefreshing(true);
    setError(null);

    try {
      const user = auth.currentUser;
      const businessId = user ? await getBusinessId(user.uid) : null;

      const result = await getParties({
        businessId,
        searchQuery: debouncedQuery,
        page: 0,
        pageSize: PAGE_SIZE,
        type,
      });

      pageRef.current = 0;
      hasMoreRef.current = result.hasMore;
      setHasMore(result.hasMore);
      setParties(result.parties);
    } catch (err: any) {
      console.error('Error refreshing parties:', err);
      setError(err?.message || 'Failed to refresh parties');
    } finally {
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [debouncedQuery, type]);

  // Infinite scroll: loads the next 20 and appends to current list
  const loadMore = useCallback(async () => {
    // Protection against duplicate / invalid page requests
    if (
      !hasMoreRef.current ||
      isFetchingRef.current ||
      loading ||
      loadingMore ||
      refreshing
    ) {
      return;
    }

    isFetchingRef.current = true;
    setLoadingMore(true);

    const nextPage = pageRef.current + 1;

    try {
      const user = auth.currentUser;
      const businessId = user ? await getBusinessId(user.uid) : null;

      const result = await getParties({
        businessId,
        searchQuery: debouncedQuery,
        page: nextPage,
        pageSize: PAGE_SIZE,
        type,
      });

      pageRef.current = nextPage;
      hasMoreRef.current = result.hasMore;
      setHasMore(result.hasMore);

      // Append new records; prevent duplicate IDs
      setParties((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueNew = result.parties.filter((p) => !existingIds.has(p.id));
        return [...prev, ...uniqueNew];
      });
    } catch (err: any) {
      console.error('Error loading more parties:', err);
    } finally {
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [debouncedQuery, loading, loadingMore, refreshing, type]);

  return {
    parties,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    error,
    loadMore,
    refresh,
  };
}
