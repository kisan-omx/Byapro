import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { DateFilterType } from '../../types/transaction';
import { DATE_FILTER_OPTIONS } from '../../constants/transactionConstants';

interface TransactionSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateFilter: DateFilterType;
  onOpenDateFilter: () => void;
  onOpenTypeFilter?: () => void;
}

export default function TransactionSearchFilter({
  searchQuery,
  onSearchChange,
  dateFilter,
  onOpenDateFilter,
  onOpenTypeFilter,
}: TransactionSearchFilterProps) {
  const selectedDateLabel =
    DATE_FILTER_OPTIONS.find((opt) => opt.id === dateFilter)?.label || 'All Time';

  return (
    <View className="px-4 mb-3">
      {/* Search Input Bar */}
      <View className="flex-row items-center bg-surface border border-border/90 rounded-xl px-3.5 py-2.5 shadow-xs">
        <Feather name="search" size={18} color="#94A3B8" className="mr-2" />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search transactions..."
          placeholderTextColor="#94A3B8"
          className="flex-1 text-sm text-text font-medium p-0"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} className="p-1 mr-1">
            <Feather name="x-circle" size={16} color="#94A3B8" />
          </TouchableOpacity>
        )}
        <View className="w-px h-5 bg-border mx-2" />
        <TouchableOpacity onPress={onOpenTypeFilter || onOpenDateFilter} className="p-1">
          <MaterialCommunityIcons name="filter-variant" size={22} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Date Filter Row (All Time / CHANGE) */}
      <View className="flex-row items-center justify-between mt-2.5 px-1">
        <TouchableOpacity
          onPress={onOpenDateFilter}
          className="flex-row items-center gap-x-2"
          activeOpacity={0.7}
        >
          <Feather name="calendar" size={16} color="#64748B" />
          <Text className="text-sm font-semibold text-text-secondary">{selectedDateLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onOpenDateFilter} activeOpacity={0.7}>
          <Text className="text-xs font-bold text-primary tracking-wider uppercase">CHANGE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
