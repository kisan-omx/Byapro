import React, { useCallback, useState } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";

import { useItems } from "../hooks/useItems";
import { Item } from "../types/item";
import { billingItemEvents } from "../services/billingItemEvents";

import SelectItemHeader from "../components/items/SelectItemHeader";
import SelectItemFilterBar from "../components/items/SelectItemFilterBar";
import SelectItemCard from "../components/items/SelectItemCard";
import SelectItemEmptyState from "../components/items/SelectItemEmptyState";
import { CategoryFilterModal } from "../components/items/CategoryFilterModal";
import { AddBillingItemModal } from "../components/items/AddBillingItemModal";

export default function SelectItemScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Responsive max width for tablets / wide screens
  const isWide = width >= 640;

  // Item data from existing hook (search, pagination, infinite scroll)
  const {
    items,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    error,
    searchQuery,
    setSearchQuery,
    loadMore,
    refresh,
  } = useItems();

  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [selectedItemForBilling, setSelectedItemForBilling] = useState<Item | null>(null);
  const [isBillingModalVisible, setIsBillingModalVisible] = useState(false);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleAddNewItem = useCallback(() => {
    router.navigate("/add-item");
  }, [router]);

  const handleItemPress = useCallback((item: Item) => {
    setSelectedItemForBilling(item);
    setIsBillingModalVisible(true);
  }, []);

  const handleBillingModalClose = useCallback(() => {
    setIsBillingModalVisible(false);
    setSelectedItemForBilling(null);
  }, []);

  const handleBillingModalSave = useCallback(
    (billingItem: any) => {
      // Emit the selected item configuration
      billingItemEvents.emitAdded(billingItem);

      // Close modal and go back to transaction form
      setIsBillingModalVisible(false);
      setSelectedItemForBilling(null);
      router.back();
    },
    [router],
  );

  const handleEndReached = useCallback(() => {
    if (!loadingMore && hasMore && !loading && !refreshing) {
      loadMore();
    }
  }, [loadingMore, hasMore, loading, refreshing, loadMore]);

  // ── Render helpers ────────────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item }: { item: Item }) => (
      <SelectItemCard item={item} onPress={handleItemPress} />
    ),
    [handleItemPress],
  );

  const keyExtractor = useCallback((item: Item) => item.id, []);

  const ListFooter = useCallback(() => {
    if (!loadingMore) return <View className="h-6" />;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#0EA5E9" />
      </View>
    );
  }, [loadingMore]);

  const ListEmpty = useCallback(
    () => (
      <SelectItemEmptyState
        isSearching={searchQuery.trim().length > 0}
        loading={loading}
        error={error}
        onRetry={refresh}
      />
    ),
    [searchQuery, loading, error, refresh],
  );

  return (
    <View className="flex-1 bg-background">
      {/* Max-width container for tablet / wide screen responsiveness */}
      <View
        style={{
          flex: 1,
          maxWidth: isWide ? 768 : undefined,
          width: "100%",
          alignSelf: "center",
        }}
      >
        {/* ── Header: back + search bar ─────────────────────────── */}
        <SelectItemHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onBack={handleBack}
        />

        {/* ── Filter bar: Category chip + Add New Item ──────────── */}
        <SelectItemFilterBar
          onOpenCategoryModal={() => setIsCategoryModalVisible(true)}
          onAddNewItem={handleAddNewItem}
        />

        {/* ── Item list with infinite scroll ───────────────────── */}
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={
            items.length === 0 ? { flex: 1 } : { paddingTop: 8, paddingBottom: 16 }
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          onRefresh={refresh}
          refreshing={refreshing}
          ListEmptyComponent={ListEmpty}
          ListFooterComponent={ListFooter}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* ── Category Filter Modal (existing component, reused) ─── */}
      <CategoryFilterModal
        visible={isCategoryModalVisible}
        onClose={() => setIsCategoryModalVisible(false)}
      />

      {/* ── Add Billing Item Modal ─── */}
      <AddBillingItemModal
        visible={isBillingModalVisible}
        item={selectedItemForBilling}
        onClose={handleBillingModalClose}
        onSave={handleBillingModalSave}
      />
    </View>
  );
}
