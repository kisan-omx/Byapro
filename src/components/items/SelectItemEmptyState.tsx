import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SELECT_ITEM_CONSTANTS } from "../../constants/selectItemConstants";

export interface SelectItemEmptyStateProps {
  /** True when a search query is active */
  isSearching: boolean;
  /** True while initial data is loading */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Called when user taps Retry on error */
  onRetry: () => void;
}

/**
 * Empty / loading / error state for the Select Item FlatList.
 * Three modes:
 *   1. Loading spinner
 *   2. Error with retry
 *   3. No items (with context: searching vs. empty inventory)
 */
export const SelectItemEmptyState: React.FC<SelectItemEmptyStateProps> = ({
  isSearching,
  loading,
  error,
  onRetry,
}) => {
  // Loading
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  // Error
  if (error) {
    return (
      <View className="flex-1 items-center justify-center py-20 px-8">
        <View className="w-16 h-16 rounded-full bg-error-light border border-red-200/80 items-center justify-center mb-4">
          <Feather name="alert-circle" size={28} color="#DC2626" />
        </View>
        <Text className="text-base font-bold text-text mb-1 text-center">
          {SELECT_ITEM_CONSTANTS.ERROR_TITLE}
        </Text>
        <Text className="text-xs font-medium text-text-secondary text-center mb-5">
          {error}
        </Text>
        <TouchableOpacity
          onPress={onRetry}
          activeOpacity={0.75}
          className="px-6 py-2.5 rounded-lg bg-primary"
        >
          <Text className="text-sm font-semibold text-white">
            {SELECT_ITEM_CONSTANTS.ERROR_RETRY}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty (searching)
  if (isSearching) {
    return (
      <View className="flex-1 items-center justify-center py-20 px-8">
        <View className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200/80 items-center justify-center mb-4">
          <Feather name="search" size={28} color="#94A3B8" />
        </View>
        <Text className="text-base font-bold text-text mb-1 text-center">
          {SELECT_ITEM_CONSTANTS.EMPTY_SEARCH_TITLE}
        </Text>
        <Text className="text-xs font-medium text-text-secondary text-center">
          {SELECT_ITEM_CONSTANTS.EMPTY_SEARCH_SUBTITLE}
        </Text>
      </View>
    );
  }

  // Empty (no items at all)
  return (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <View className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200/80 items-center justify-center mb-4">
        <Feather name="package" size={28} color="#94A3B8" />
      </View>
      <Text className="text-base font-bold text-text mb-1 text-center">
        {SELECT_ITEM_CONSTANTS.EMPTY_TITLE}
      </Text>
      <Text className="text-xs font-medium text-text-secondary text-center">
        {SELECT_ITEM_CONSTANTS.EMPTY_SUBTITLE}
      </Text>
    </View>
  );
};

export default SelectItemEmptyState;
