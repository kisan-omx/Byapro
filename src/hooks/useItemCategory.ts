import { useState, useCallback, useRef } from 'react';
import { auth } from '../lib/firebase';
import { getBusinessId } from '../services/quickEntryService';
import { getItemCategories, createItemCategory } from '../services/categoryService';
import { ItemCategory } from '../types/itemCategory';

// ─────────────────────────────────────────────────
// useItemCategory hook
// Handles: open/close modal, fetch list, search, add new
// ─────────────────────────────────────────────────
export function useItemCategory() {
  const [isVisible, setIsVisible] = useState(false);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateVisible, setIsCreateVisible] = useState(false);

  // Track if we've already loaded so we don't refetch every open
  const hasFetchedRef = useRef(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const user = auth.currentUser;
      if (!user) return;
      const businessId = await getBusinessId(user.uid);
      if (!businessId) return;
      const list = await getItemCategories(businessId);
      setCategories(list);
      hasFetchedRef.current = true;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const openModal = useCallback(() => {
    setIsVisible(true);
    setSearchQuery('');
    // Only fetch once unless reset
    if (!hasFetchedRef.current) {
      fetchCategories();
    }
  }, [fetchCategories]);

  const closeModal = useCallback(() => {
    setIsVisible(false);
    setSearchQuery('');
  }, []);

  const openCreateModal = useCallback(() => {
    setIsCreateVisible(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setIsCreateVisible(false);
  }, []);

  const addCategory = useCallback(
    async (name: string): Promise<ItemCategory | null> => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      try {
        setAdding(true);
        setError(null);
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');
        const businessId = await getBusinessId(user.uid);
        if (!businessId) throw new Error('No business found');
        const created = await createItemCategory(businessId, trimmed);
        // Optimistically prepend to list
        setCategories((prev) => [created, ...prev]);
        return created;
      } catch (err: any) {
        setError(err?.message ?? 'Failed to add category');
        return null;
      } finally {
        setAdding(false);
      }
    },
    [],
  );

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return {
    isVisible,
    openModal,
    closeModal,
    isCreateVisible,
    openCreateModal,
    closeCreateModal,
    categories: filteredCategories,
    allCategories: categories,
    searchQuery,
    setSearchQuery,
    loading,
    adding,
    error,
    addCategory,
    // Allow parent to force a refresh (e.g. after navigating back)
    refreshCategories: fetchCategories,
  };
}
