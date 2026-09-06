import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import TransactionHeader from '../../components/transactions/TransactionHeader';
import TransactionDateFilter from '../../components/transactions/TransactionDateFilter';
import TransactionCard from '../../components/transactions/TransactionCard';
import TransactionFloatingActions from '../../components/transactions/TransactionFloatingActions';
import DateFilterModal from '../../components/transactions/DateFilterModal';
import AddTransactionModal from '../../components/transactions/AddTransactionModal';
import { useTransactions } from '../../hooks/useTransactions';

export default function TransactionsScreen() {
  const router = useRouter();
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const {
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
  } = useTransactions();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Top White Header with Border (Title, Settings Icon & Search Bar) */}
      <TransactionHeader
        onOpenSettings={() => setIsFilterModalVisible(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenTypeFilter={() => setIsFilterModalVisible(true)}
      />

      {/* Main Transactions List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionCard
            item={item}
            onPressCard={(selectedItem) => {
              // Future invoice detail view or options
            }}
          />
        )}
        ListHeaderComponent={
          <TransactionDateFilter
            dateFilter={dateFilter}
            onOpenDateFilter={() => setIsFilterModalVisible(true)}
          />
        }
        ListFooterComponent={
          <View className="py-4 items-center justify-center pb-24">
            {loadingMore && <ActivityIndicator size="small" color="#0EA5E9" />}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View className="py-12 px-6 items-center justify-center">
              <View className="w-24 h-24 rounded-full bg-slate-100 border border-slate-200/80 items-center justify-center mb-4 shadow-xs">
                <MaterialCommunityIcons name="file-search-outline" size={48} color="#94A3B8" />
              </View>
              <Text className="text-lg font-bold text-text mb-1 text-center">
                No Transaction Found
              </Text>
              <Text className="text-sm font-medium text-text-secondary text-center px-4 mb-4">
                You can also create a new transaction from below
              </Text>
            </View>
          ) : (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color="#0EA5E9" />
              <Text className="text-xs text-text-secondary font-medium mt-3">
                Loading transactions...
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
            colors={['#0EA5E9']}
            tintColor="#0EA5E9"
          />
        }
      />

      {/* Floating Bottom Action Buttons */}
      <TransactionFloatingActions onOpenAddModal={() => setIsAddModalVisible(true)} />

      {/* Add Transaction Option Modal */}
      <AddTransactionModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
      />

      {/* Date & Type Filter Modal */}
      <DateFilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        selectedDateFilter={dateFilter}
        onSelectDateFilter={setDateFilter}
        selectedTypeFilter={typeFilter}
        onSelectTypeFilter={setTypeFilter}
      />
    </SafeAreaView>
  );
}