import { useState, useEffect, useCallback, useRef } from 'react';
import { auth } from '../lib/firebase';
import { getBusinessId } from '../services/quickEntryService';
import { getItems, createItem, PAGE_SIZE } from '../services/itemService';
import { itemEvents } from '../services/itemEvents';
import { generateUUID } from '../utils/uuid';
import { Item, StockFilterType, TypeFilterType } from '../types/item';

// ─────────────────────────────────────────────────
// Simple page-0 cache (same pattern as useParties)
// ─────────────────────────────────────────────────
let itemCache: { items: Item[]; hasMore: boolean } | null = null;

export async function preloadItems() {
  if (itemCache) return;
  try {
    const user = auth.currentUser;
    const businessId = user ? await getBusinessId(user.uid) : null;
    const result = await getItems({ businessId, searchQuery: '', page: 0, pageSize: PAGE_SIZE });
    itemCache = { items: result.items, hasMore: result.hasMore };
  } catch {
    // Non-blocking
  }
}

// ─────────────────────────────────────────────────
// useItems hook
// ─────────────────────────────────────────────────
export function useItems() {
  // Filter & search state
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilterType>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilterType>('all');

  // Data states
  const [items, setItems] = useState<Item[]>(() =>
    itemCache ? itemCache.items : [],
  );
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(() => (itemCache ? itemCache.hasMore : true));
  const [error, setError] = useState<string | null>(null);

  // Pagination & concurrency guards
  const pageRef = useRef(0);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(hasMore);

  // ── Debounced search ───────────────────────────
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Fetch first page ───────────────────────────
  const fetchFirstPage = useCallback(
    async (query: string, stock: StockFilterType, type: TypeFilterType) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      const hasCached =
        !query.trim() && stock === 'all' && type === 'all' && itemCache && itemCache.items.length > 0;

      if (!hasCached) setLoading(true);
      setError(null);

      try {
        const user = auth.currentUser;
        const businessId = user ? await getBusinessId(user.uid) : null;

        const result = await getItems({
          businessId,
          searchQuery: query,
          page: 0,
          pageSize: PAGE_SIZE,
          stockFilter: stock,
          typeFilter: type,
        });

        pageRef.current = 0;
        hasMoreRef.current = result.hasMore;
        setHasMore(result.hasMore);
        setItems(result.items);

        // Update cache when no filters applied
        if (!query.trim() && stock === 'all' && type === 'all') {
          itemCache = { items: result.items, hasMore: result.hasMore };
        }
      } catch (err: any) {
        console.error('useItems: error fetching first page:', err);
        setError(err?.message || 'Failed to load items');
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [],
  );

  // Fetch on filter/search change
  useEffect(() => {
    pageRef.current = 0;
    hasMoreRef.current = true;
    setHasMore(true);
    fetchFirstPage(debouncedQuery, stockFilter, typeFilter);
  }, [debouncedQuery, stockFilter, typeFilter, fetchFirstPage]);

  // ── Pull-to-refresh ────────────────────────────
  const refresh = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setRefreshing(true);
    setError(null);

    try {
      const user = auth.currentUser;
      const businessId = user ? await getBusinessId(user.uid) : null;

      const result = await getItems({
        businessId,
        searchQuery: debouncedQuery,
        page: 0,
        pageSize: PAGE_SIZE,
        stockFilter,
        typeFilter,
      });

      pageRef.current = 0;
      hasMoreRef.current = result.hasMore;
      setHasMore(result.hasMore);
      setItems(result.items);
    } catch (err: any) {
      console.error('useItems: error refreshing:', err);
      setError(err?.message || 'Failed to refresh items');
    } finally {
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [debouncedQuery, stockFilter, typeFilter]);

  // ── Infinite scroll load more ──────────────────
  const loadMore = useCallback(async () => {
    if (!hasMoreRef.current || isFetchingRef.current || loading || loadingMore || refreshing) return;

    isFetchingRef.current = true;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;

    try {
      const user = auth.currentUser;
      const businessId = user ? await getBusinessId(user.uid) : null;

      const result = await getItems({
        businessId,
        searchQuery: debouncedQuery,
        page: nextPage,
        pageSize: PAGE_SIZE,
        stockFilter,
        typeFilter,
      });

      pageRef.current = nextPage;
      hasMoreRef.current = result.hasMore;
      setHasMore(result.hasMore);

      setItems((prev) => {
        const existingIds = new Set(prev.map((i) => i.id));
        const unique = result.items.filter((i) => !existingIds.has(i.id));
        return [...prev, ...unique];
      });
    } catch (err: any) {
      console.error('useItems: error loading more:', err);
    } finally {
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [debouncedQuery, stockFilter, typeFilter, loading, loadingMore, refreshing]);

  // ── Reset filters ──────────────────────────────
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setStockFilter('all');
    setTypeFilter('all');
  }, []);

  // ── Subscribe to item events (optimistic UI) ───
  useEffect(() => {
    const unsubCreated = itemEvents.onCreated((item) => {
      setItems((prev) => [item, ...prev.filter((i) => i.id !== item.id)]);
    });

    const unsubSaved = itemEvents.onSaved(({ tempId, realItem }) => {
      setItems((prev) =>
        prev.map((i) => (i.id === tempId ? { ...realItem, syncStatus: 'synced' } : i)),
      );
    });

    const unsubFailed = itemEvents.onFailed(({ tempId, errorMsg }) => {
      setItems((prev) =>
        prev.map((i) =>
          i.id === tempId ? { ...i, syncStatus: 'failed', syncError: errorMsg } : i,
        ),
      );
    });

    const unsubRetry = itemEvents.onRetry((item) => {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, syncStatus: 'saving', syncError: undefined } : i,
        ),
      );

      (async () => {
        try {
          const user = auth.currentUser;
          if (!user) throw new Error('Not authenticated');
          const businessId = await getBusinessId(user.uid);
          if (!businessId) throw new Error('No business found');

          const saved = await createItem({
            id: item.id,
            businessId,
            name: item.name,
            sellingPrice: item.sellingPrice,
            purchasePrice: item.purchasePrice ?? undefined,
            unit: item.unit ?? undefined,
            secondaryUnit: item.secondaryUnit ?? undefined,
            stockQuantity: item.stockQuantity,
            lowStockAlert: item.lowStockAlert ?? undefined,
            sku: item.sku ?? undefined,
          });

          itemEvents.emitSaved(item.id, saved);
        } catch (err: any) {
          itemEvents.emitFailed(item.id, err?.message || 'Failed to save item');
        }
      })();
    });

    return () => {
      unsubCreated();
      unsubSaved();
      unsubFailed();
      unsubRetry();
    };
  }, []);

  // ── Add item action (optimistic) ───────────────
  const addItem = useCallback(
    async (formData: {
      name: string;
      sellingPrice: number;
      purchasePrice?: number;
      unit?: string;
      stockQuantity?: number;
      lowStockAlert?: number;
      sku?: string;
      itemType?: 'product' | 'service';
    }) => {
      const tempId = generateUUID();
      const qty = formData.stockQuantity ?? 0;
      const lowAlert = formData.lowStockAlert ?? null;

      let stockStatus: Item['stockStatus'] = 'in_stock';
      if (qty <= 0) stockStatus = 'out_of_stock';
      else if (lowAlert != null && qty <= lowAlert) stockStatus = 'low_stock';

      const optimisticItem: Item = {
        id: tempId,
        businessId: '',
        name: formData.name.trim(),
        sku: formData.sku?.trim() || null,
        sellingPrice: formData.sellingPrice,
        purchasePrice: formData.purchasePrice ?? null,
        stockQuantity: qty,
        lowStockAlert: lowAlert,
        unit: formData.unit?.trim().toUpperCase() || null,
        itemType: formData.itemType ?? 'product',
        createdAt: new Date().toISOString(),
        stockStatus,
        avatarLetter: (formData.name.trim()[0] ?? '?').toUpperCase(),
        syncStatus: 'saving',
      };

      itemEvents.emitCreated(optimisticItem);

      // Save to DB in background (non-blocking for UI)
      (async () => {
        try {
          const user = auth.currentUser;
          if (!user) throw new Error('Not authenticated');
          const businessId = await getBusinessId(user.uid);
          if (!businessId) throw new Error('No business found');

          const saved = await createItem({
            id: tempId,
            businessId,
            name: formData.name.trim(),
            sellingPrice: formData.sellingPrice,
            purchasePrice: formData.purchasePrice,
            unit: formData.unit,
            stockQuantity: formData.stockQuantity,
            lowStockAlert: formData.lowStockAlert,
            sku: formData.sku,
            itemType: formData.itemType ?? 'product',
          });

          itemEvents.emitSaved(tempId, saved);
        } catch (err: any) {
          console.error('useItems: error saving new item:', err);
          itemEvents.emitFailed(tempId, err?.message || 'Failed to save item');
        }
      })();

      return optimisticItem;
    },
    [],
  );

  return {
    items,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    error,
    searchQuery,
    setSearchQuery,
    stockFilter,
    setStockFilter,
    typeFilter,
    setTypeFilter,
    loadMore,
    refresh,
    resetFilters,
    addItem,
  };
}
