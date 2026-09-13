import { useState, useEffect, useCallback, useRef } from "react";
import { auth } from "../lib/firebase";
import { getBusinessId } from "../services/quickEntryService";
import {
  getParties,
  createNewParty,
  PAGE_SIZE,
} from "../services/partyService";
import {
  Party,
  PartyCategoryFilter,
  PartyPaymentFilter,
  PartyType,
} from "../types/party";
import { partyEvents } from "../services/partyEvents";
import { generateUUID } from "../utils/uuid";

export interface UsePartiesOptions {
  searchQuery?: string;
  type?: "customer" | "supplier" | "both" | "all";
  paymentFilter?: PartyPaymentFilter;
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
      searchQuery: "",
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
  const { enabled = true } = options;

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState(options.searchQuery || "");
  const [categoryFilter, setCategoryFilter] = useState<PartyCategoryFilter>(
    options.type === "customer" || options.type === "supplier"
      ? options.type
      : "all",
  );
  const [paymentFilter, setPaymentFilter] = useState<PartyPaymentFilter>(
    options.paymentFilter || "all",
  );

  // Data states
  const [parties, setParties] = useState<Party[]>(() => {
    return !searchQuery.trim() && partyCache ? partyCache.parties : [];
  });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(() =>
    partyCache ? partyCache.hasMore : true,
  );
  const [error, setError] = useState<string | null>(null);

  // Refs for pagination control
  const pageRef = useRef(0);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(hasMore);

  // Debounce search query
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch first page helper
  const fetchFirstPage = useCallback(
    async (
      queryTerm: string,
      cat: PartyCategoryFilter,
      pay: PartyPaymentFilter,
    ) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      const hasCachedData =
        !queryTerm.trim() &&
        cat === "all" &&
        pay === "all" &&
        partyCache &&
        partyCache.parties.length > 0;
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
          type: cat,
          paymentFilter: pay,
        });

        pageRef.current = 0;
        hasMoreRef.current = result.hasMore;
        setHasMore(result.hasMore);
        setParties(result.parties);

        if (!queryTerm.trim() && cat === "all" && pay === "all") {
          partyCache = {
            parties: result.parties,
            hasMore: result.hasMore,
          };
        }
      } catch (err: any) {
        console.error("Error fetching first page of parties:", err);
        setError(err?.message || "Failed to load parties");
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [],
  );

  // Fetch on state changes
  useEffect(() => {
    if (enabled) {
      pageRef.current = 0;
      hasMoreRef.current = true;
      setHasMore(true);
      fetchFirstPage(debouncedQuery, categoryFilter, paymentFilter);
    }
  }, [enabled, debouncedQuery, categoryFilter, paymentFilter, fetchFirstPage]);

  // Pull-to-refresh
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
        type: categoryFilter,
        paymentFilter,
      });

      pageRef.current = 0;
      hasMoreRef.current = result.hasMore;
      setHasMore(result.hasMore);
      setParties(result.parties);
    } catch (err: any) {
      console.error("Error refreshing parties:", err);
      setError(err?.message || "Failed to refresh parties");
    } finally {
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [debouncedQuery, categoryFilter, paymentFilter]);

  // Infinite scroll load more
  const loadMore = useCallback(async () => {
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
        type: categoryFilter,
        paymentFilter,
      });

      pageRef.current = nextPage;
      hasMoreRef.current = result.hasMore;
      setHasMore(result.hasMore);

      setParties((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueNew = result.parties.filter((p) => !existingIds.has(p.id));
        return [...prev, ...uniqueNew];
      });
    } catch (err: any) {
      console.error("Error loading more parties:", err);
    } finally {
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [
    debouncedQuery,
    categoryFilter,
    paymentFilter,
    loading,
    loadingMore,
    refreshing,
  ]);

  // Reset filters helper
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setCategoryFilter("all");
    setPaymentFilter("all");
  }, []);

  useEffect(() => {
    const unsubscribeCreated = partyEvents.onCreated((party) => {
      setParties((prev) => [party, ...prev.filter((p) => p.id !== party.id)]);
    });

    const unsubscribeSaved = partyEvents.onSaved(({ tempId, realParty }) => {
      setParties((prev) =>
        prev.map((p) =>
          p.id === tempId ? { ...(realParty || p), syncStatus: "synced" } : p,
        ),
      );
    });

    const unsubscribeFailed = partyEvents.onFailed(({ tempId, errorMsg }) => {
      setParties((prev) =>
        prev.map((p) =>
          p.id === tempId
            ? { ...p, syncStatus: "failed", syncError: errorMsg }
            : p,
        ),
      );
    });

    const unsubscribeRetry = partyEvents.onRetry((party) => {
      setParties((prev) =>
        prev.map((p) =>
          p.id === party.id
            ? { ...p, syncStatus: "saving", syncError: undefined }
            : p,
        ),
      );

      (async () => {
        try {
          const user = auth.currentUser;
          if (!user) throw new Error("User not authenticated");
          const businessId = await getBusinessId(user.uid);
          if (!businessId) throw new Error("No business found");

          const raw = party.rawPayload || {
            businessId,
            name: party.name,
            phone: party.phone || undefined,
            email: party.email || undefined,
            address: party.address || undefined,
            type: "both" as PartyType,
            openingBalance: party.balance || 0,
            balanceType: party.balanceType || "Settled",
          };

          const saved = await createNewParty({
            id: party.id,
            ...raw,
          });

          partyEvents.emitSaved(party.id, saved);
        } catch (err: any) {
          console.error("Error retrying party save:", err);
          partyEvents.emitFailed(
            party.id,
            err?.message || "Failed to save party",
          );
        }
      })();
    });

    return () => {
      unsubscribeCreated();
      unsubscribeSaved();
      unsubscribeFailed();
      unsubscribeRetry();
    };
  }, []);

  // Add party action
  const addNewParty = useCallback(
    async (params: { name: string; phone?: string; type?: PartyType }) => {
      const tempId = generateUUID();
      const optimisticParty: Party = {
        id: tempId,
        name: params.name.trim(),
        phone: params.phone?.trim() || null,
        type: "Party",
        subtitle: params.phone?.trim() || "No phone number",
        balance: 0,
        balanceType: "Settled",
        createdAt: new Date().toISOString(),
        syncStatus: "saving",
      };

      partyEvents.emitCreated(optimisticParty);

      (async () => {
        try {
          const user = auth.currentUser;
          if (!user) throw new Error("User not authenticated");
          const businessId = await getBusinessId(user.uid);
          if (!businessId) throw new Error("No business found");

          const rawPayload = {
            businessId,
            name: params.name.trim(),
            phone: params.phone?.trim() || undefined,
            type: params.type || "both",
          };

          const created = await createNewParty({
            id: tempId,
            ...rawPayload,
          });

          created.rawPayload = rawPayload;
          partyEvents.emitSaved(tempId, created);
        } catch (err: any) {
          console.error("Error saving modal party:", err);
          partyEvents.emitFailed(
            tempId,
            err?.message || "Failed to save party",
          );
        }
      })();

      return optimisticParty;
    },
    [],
  );

  return {
    parties,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    error,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    paymentFilter,
    setPaymentFilter,
    loadMore,
    refresh,
    resetFilters,
    addNewParty,
  };
}
