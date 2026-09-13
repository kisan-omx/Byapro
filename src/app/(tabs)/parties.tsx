import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useParties } from "../../hooks/useParties";
import {
  PartyHeader,
  PartyFilterTabs,
  PartyCard,
  CashTransactionCard,
  PaymentFilterModal,
  AddPartyModal,
  PartyBottomActions,
} from "../../components/parties";

export default function PartiesScreen() {
  const router = useRouter();

  // Modals visibility state
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isAddPartyModalVisible, setIsAddPartyModalVisible] = useState(false);

  // Hook managing data, search, filtering, and pagination
  const {
    parties,
    loading,
    loadingMore,
    refreshing,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    paymentFilter,
    setPaymentFilter,
    loadMore,
    refresh,
    addNewParty,
  } = useParties();

  const handleSelectPaymentFilter = (filter: any) => {
    setPaymentFilter(filter);
    if (filter !== "all") {
      setCategoryFilter("all");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Top Header: Title, Settings Icon, Search Bar, Filter Button */}
      <PartyHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSettings={() => {
          // Future settings / party options
        }}
        onOpenFilter={() => setIsPaymentModalVisible(true)}
      />

      {/* Filter Tabs Bar: Customer, Supplier, Both, All Payment Dropdown */}
      <PartyFilterTabs
        categoryFilter={categoryFilter}
        onSelectCategory={setCategoryFilter}
        paymentFilter={paymentFilter}
        onSelectPaymentFilter={handleSelectPaymentFilter}
        onOpenPaymentModal={() => setIsPaymentModalVisible(true)}
      />

      {/* Main Parties List with Infinite Scroll & Pull-to-Refresh */}
      <FlatList
        data={parties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PartyCard
            party={item}
            onPress={(selectedParty) => {
              // Future party details navigation
            }}
          />
        )}
        ListHeaderComponent={
          /* Special Top Item: Cash Transactions */
          <CashTransactionCard
            onPress={() => {
              // Navigate or view cash transactions
            }}
          />
        }
        ListFooterComponent={
          <View className="py-4 items-center justify-center pb-28">
            {loadingMore && <ActivityIndicator size="small" color="#0EA5E9" />}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View className="py-12 px-6 items-center justify-center">
              <View className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200/80 items-center justify-center mb-3">
                <MaterialCommunityIcons
                  name="account-search-outline"
                  size={40}
                  color="#94A3B8"
                />
              </View>
              <Text className="text-base font-bold text-text mb-1 text-center">
                No Parties Found
              </Text>
              <Text className="text-xs font-medium text-text-secondary text-center px-4">
                Add a new customer or supplier using the button below
              </Text>
            </View>
          ) : (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color="#0EA5E9" />
              <Text className="text-xs text-text-secondary font-medium mt-3">
                Loading parties...
              </Text>
            </View>
          )
        }
        contentContainerStyle={{ flexGrow: 1 }}
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

      {/* Bottom Action: "Add New Party" Centered Button in Primary Color (No Logo) */}
      <PartyBottomActions
        onOpenAddPartyModal={() => router.push("/add-party")}
      />

      {/* Payment Status Dropdown Modal */}
      <PaymentFilterModal
        visible={isPaymentModalVisible}
        onClose={() => setIsPaymentModalVisible(false)}
        selectedPaymentFilter={paymentFilter}
        onSelectPaymentFilter={handleSelectPaymentFilter}
      />

      {/* Add New Party Modal */}
      <AddPartyModal
        visible={isAddPartyModalVisible}
        onClose={() => setIsAddPartyModalVisible(false)}
        onAddParty={async (params) => {
          await addNewParty(params);
        }}
      />
    </SafeAreaView>
  );
}
