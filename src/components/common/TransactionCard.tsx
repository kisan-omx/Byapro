import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TransactionItem } from '../../types/transaction';
import { TRANSACTION_TYPE_CONFIG } from '../../constants/transactionConstants';
import { transactionEvents } from '../../services/transactionEvents';

export interface TransactionCardProps {
  item: TransactionItem;
  onPressCard?: (item: TransactionItem) => void;
  onPrint?: (item: TransactionItem) => void;
  onShare?: (item: TransactionItem) => void;
  onMoreOptions?: (item: TransactionItem) => void;
  onRetry?: (item: TransactionItem) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  item,
  onPressCard,
  onPrint,
  onShare,
  onMoreOptions,
  onRetry,
}) => {
  const badgeConfig = TRANSACTION_TYPE_CONFIG[item.type] || {
    label: item.type,
    bgClass: 'bg-emerald-100',
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

  const renderStatusBadge = () => {
    if (!item.status || item.status === 'N/A' || item.type === 'PaymentIn' || item.type === 'PaymentOut') {
      return null;
    }

    let bgClass = 'bg-emerald-100/90';
    let textClass = 'text-emerald-700';

    if (item.status === 'Unpaid') {
      bgClass = 'bg-rose-100/90';
      textClass = 'text-rose-600';
    } else if (item.status === 'Partial') {
      bgClass = 'bg-amber-100/90';
      textClass = 'text-amber-700';
    }

    return (
      <View className={`px-2.5 py-0.5 rounded-md ${bgClass}`}>
        <Text className={`text-xs font-bold ${textClass}`}>
          {item.status}
        </Text>
      </View>
    );
  };

  const typeLabel = `${badgeConfig.label} ${item.indexNo || ''}`.trim();
  const formattedAmount = (item.totalAmount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return (
    <TouchableOpacity
      onPress={() => onPressCard && onPressCard(item)}
      onLongPress={handleMore}
      activeOpacity={0.8}
      style={{
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
      }}
      className={`bg-surface mx-4 mb-2.5 rounded-xl p-3 border border-slate-200/80 shadow-2xs ${
        item.syncStatus === 'failed' ? 'border-rose-300' : ''
      }`}
    >
      {/* Row 1: Type + Index on Left, Amount on Right */}
      <View className="flex-row items-center justify-between mb-0.5">
        <Text className={`text-sm font-semibold ${badgeConfig.textClass}`} numberOfLines={1}>
          {typeLabel}
        </Text>
        <Text className="text-base font-bold text-slate-800">
          Rs. {formattedAmount}
        </Text>
      </View>

      {/* Row 2: Party Name on Left, Status Badge in Vertical Center Right */}
      <View className="flex-row items-center justify-between mb-0.5 min-h-[22px]">
        <Text className="text-base font-bold text-slate-900 flex-1 pr-2" numberOfLines={1}>
          {item.partyName || 'Cash Sale'}
        </Text>
        {renderStatusBadge()}
      </View>

      {/* Row 3: Date on Left & Sync Status */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-xs font-medium text-slate-400">
            {item.date}
          </Text>

          {/* Failed / Retry Indicator */}
          {item.syncStatus === 'failed' && (
            <TouchableOpacity
              onPress={handleRetryPress}
              className="px-2 py-0.5 rounded-md bg-rose-100 flex-row items-center gap-x-1"
              activeOpacity={0.7}
            >
              <Feather name="refresh-cw" size={10} color="#E11D48" />
              <Text className="text-[10px] font-bold text-rose-700">Failed • Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TransactionCard;
