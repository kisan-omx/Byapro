import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TransactionItem } from '../../types/transaction';
import { TRANSACTION_TYPE_CONFIG } from '../../constants/transactionConstants';
import { transactionEvents } from '../../services/transactionEvents';

interface TransactionCardProps {
  item: TransactionItem;
  onPressCard?: (item: TransactionItem) => void;
  onPrint?: (item: TransactionItem) => void;
  onShare?: (item: TransactionItem) => void;
  onMoreOptions?: (item: TransactionItem) => void;
  onRetry?: (item: TransactionItem) => void;
}

export default function TransactionCard({
  item,
  onPressCard,
  onPrint,
  onShare,
  onMoreOptions,
  onRetry,
}: TransactionCardProps) {
  const badgeConfig = TRANSACTION_TYPE_CONFIG[item.type] || {
    label: item.type.toUpperCase(),
    bgClass: 'bg-emerald-100/90',
    textClass: 'text-emerald-600',
  };

  const handleMore = () => {
    if (onMoreOptions) onMoreOptions(item);
    else Alert.alert('Options', `Transaction ${item.indexNo}`);
  };

  const handleRetryPress = () => {
    if (onRetry) {
      onRetry(item);
    } else {
      transactionEvents.emitRetry(item);
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPressCard && onPressCard(item)}
      activeOpacity={0.8}
      className={`bg-surface mx-4 mb-3 rounded-2xl p-4 border ${
        item.syncStatus === 'failed'
          ? 'border-rose-300'
          : 'border-border/80'
      } shadow-sm`}
    >
      {/* Top Section: Title & Pill Badge on Left, #Index & Date stacked on Right */}
      <View className="flex-row items-start justify-between mb-3">
        {/* Left Side: Party Name & Pill Badges */}
        <View className="flex-1 pr-2">
          <Text className="text-base font-bold text-slate-700 mb-1.5" numberOfLines={1}>
            {item.partyName}
          </Text>
          <View className="flex-row items-center flex-wrap gap-1.5">
            {/* Transaction Type Badge */}
            <View className={`px-3 py-1 rounded-full ${badgeConfig.bgClass}`}>
              <Text className={`text-[11px] font-extrabold tracking-wider ${badgeConfig.textClass}`}>
                {badgeConfig.label}
              </Text>
            </View>

            {/* Explicit Saving Status Badge */}
            {item.syncStatus === 'saving' && (
              <View className="px-2.5 py-1 rounded-full bg-amber-100/90 flex-row items-center gap-x-1">
                <ActivityIndicator size={10} color="#D97706" />
                <Text className="text-[10px] font-bold text-amber-700">Saving...</Text>
              </View>
            )}

            {/* Explicit Failed & Retry Status Badge */}
            {item.syncStatus === 'failed' && (
              <TouchableOpacity
                onPress={handleRetryPress}
                className="px-2.5 py-1 rounded-full bg-rose-100/90 flex-row items-center gap-x-1"
                activeOpacity={0.7}
              >
                <Feather name="refresh-cw" size={10} color="#E11D48" />
                <Text className="text-[10px] font-bold text-rose-700">Failed • Tap to Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Right Side: #Index on top line, Date on second line */}
        <View className="items-end">
          <Text className="text-xs font-semibold text-text-secondary/70 mb-1">
            {item.indexNo}
          </Text>
          <Text className="text-xs font-medium text-text-secondary/70">
            {item.date}
          </Text>
        </View>
      </View>

      {/* Bottom Section: Total, Unused/Balance, and Bare Action Icons */}
      <View className="flex-row items-end justify-between pt-1">
        {/* Total Column */}
        <View className="flex-1 pr-2">
          <Text className="text-xs font-medium text-text-secondary" numberOfLines={1}>Total</Text>
          <Text
            className="text-base font-bold text-slate-700 mt-0.5"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            Rs {(item.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>

        {/* Secondary (Unused/Balance) Column */}
        <View className="flex-1 pr-2">
          <Text className="text-xs font-medium text-text-secondary" numberOfLines={1}>{item.secondaryLabel}</Text>
          <Text
            className="text-base font-bold text-slate-700 mt-0.5"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            Rs {(item.secondaryAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>

        {/* Action Icon (3 Dots) */}
        <View className="flex-row items-center pr-1">
          <TouchableOpacity onPress={handleMore} className="p-1">
            <Feather name="more-vertical" size={22} color="#808EA5" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
