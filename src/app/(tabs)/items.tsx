import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useItems } from "../../hooks/useItems";
import {
  ItemHeader,
  ItemFilterBar,
  ItemCard,
  ItemBottomActions,
  AddItemModal,
  CategoryFilterModal,
  StockFilterModal,
  TypeFilterModal,
} from "../../components/items";

export default function ItemsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // 2 columns on tablet/larger (≥ 640px), 1 on phone
  const numColumns = width >= 640 ? 2 : 1;

  // ── Modal visibility ─────────────────────────────
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isStockModalVisible, setIsStockModalVisible] = useState(false);
  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);

  // ── Data & filter state via hook ─────────────────
  const {
    items,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    searchQuery,
    setSearchQuery,
    stockFilter,
    setStockFilter,
    typeFilter,
    setTypeFilter,
    loadMore,
    refresh,
    addItem,
  } = useItems();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View
        style={{ flex: 1, maxWidth: 1024, width: "100%", alignSelf: "center" }}
      >
        {/* ── Header: Title, Search, Filter icon ──── */}
        <ItemHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenSettings={() => {
            // Future: open combined filter modal
          }}
          onOpenFilter={() => setIsStockModalVisible(true)}
        />

        {/* ── Filter chips: Category, Stock, Type ──── */}
        <ItemFilterBar
          stockFilter={stockFilter}
          typeFilter={typeFilter}
          onOpenCategoryModal={() => setIsCategoryModalVisible(true)}
          onOpenStockModal={() => setIsStockModalVisible(true)}
          onOpenTypeModal={() => setIsTypeModalVisible(true)}
        />

        {/* ── Items list with infinite scroll ──────── */}
        <FlatList
          key={String(numColumns)}
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <ItemCard
                item={item}
                onPress={() => {
                  // Future: navigate to item detail/edit screen
                }}
              />
            </View>
          )}
          ListFooterComponent={
            <View className="py-4 items-center justify-center pb-28">
              {loadingMore && (
                <ActivityIndicator size="small" color="#0EA5E9" />
              )}
            </View>
          }
          ListEmptyComponent={
            !loading ? (
              /* Empty state */
              <View className="py-16 px-6 items-center justify-center">
                <View className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200/80 items-center justify-center mb-4">
                  <MaterialCommunityIcons
                    name="package-variant-closed"
                    size={40}
                    color="#94A3B8"
                  />
                </View>
                <Text className="text-base font-bold text-text mb-1 text-center">
                  No Items Found
                </Text>
                <Text className="text-xs font-medium text-text-secondary text-center px-4">
                  Add your first item using the button below
                </Text>
              </View>
            ) : (
              /* Initial loading skeleton */
              <View className="py-16 items-center justify-center">
                <ActivityIndicator size="large" color="#0EA5E9" />
                <Text className="text-xs text-text-secondary font-medium mt-3">
                  Loading inventory...
                </Text>
              </View>
            )
          }
          contentContainerStyle={{ flexGrow: 1, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={["#0EA5E9"]}
              tintColor="#0EA5E9"
            />
          }
        />

        {/* ── Centered "Add New Item" FAB ───────────── */}
        <ItemBottomActions
          onOpenAddItemModal={() => router.push("/add-item")}
        />

        {/* ── Add Item Modal ────────────────────────── */}
        <AddItemModal
          visible={isAddModalVisible}
          onClose={() => setIsAddModalVisible(false)}
          onAddItem={async (data) => {
            await addItem(data);
          }}
        />

        {/* ── Category Filter Modal ─────────────────── */}
        <CategoryFilterModal
          visible={isCategoryModalVisible}
          onClose={() => setIsCategoryModalVisible(false)}
        />

        {/* ── Stock Filter Modal ────────────────────── */}
        <StockFilterModal
          visible={isStockModalVisible}
          onClose={() => setIsStockModalVisible(false)}
          selectedFilter={stockFilter}
          onSelectFilter={setStockFilter}
        />

        {/* ── Type / Unit Filter Modal ──────────────── */}
        <TypeFilterModal
          visible={isTypeModalVisible}
          onClose={() => setIsTypeModalVisible(false)}
          selectedFilter={typeFilter}
          onSelectFilter={setTypeFilter}
        />
      </View>
    </SafeAreaView>
  );
}
