import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DateFilterType } from '../../types/transaction';
import { DATE_FILTER_OPTIONS } from '../../constants/transactionConstants';

interface TransactionDateFilterProps {
  dateFilter: DateFilterType;
  onOpenDateFilter: () => void;
}

export default function TransactionDateFilter({
  dateFilter,
  onOpenDateFilter,
}: TransactionDateFilterProps) {
  const selectedDateLabel =
    DATE_FILTER_OPTIONS.find((opt) => opt.id === dateFilter)?.label || 'All Time';

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-surface border-b border-border/80 mb-3 shadow-sm">
      {/* Left: Slate Gray Calendar Icon + Date Filter Name (Semibold, text-base) */}
      <TouchableOpacity
        onPress={onOpenDateFilter}
        className="flex-row items-center gap-x-2.5"
        activeOpacity={0.7}
      >
        <Feather name="calendar" size={19} color="#475569" />
        <Text className="text-base font-semibold text-text-secondary">{selectedDateLabel}</Text>
      </TouchableOpacity>

      {/* Right: CHANGE Trigger Button (Semibold, text-sm) */}
      <TouchableOpacity onPress={onOpenDateFilter} activeOpacity={0.7}>
        <Text className="text-sm font-semibold text-primary tracking-wider uppercase">CHANGE</Text>
      </TouchableOpacity>
    </View>
  );
}
