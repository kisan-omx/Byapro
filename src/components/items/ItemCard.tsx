import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Item } from '../../types/item';
import { STOCK_STATUS_CONFIG } from '../../constants/items';
import { itemEvents } from '../../services/itemEvents';

export interface ItemCardProps {
  item: Item;
  onPress?: (item: Item) => void;
  onRetry?: (item: Item) => void;
}

/**
 * Single inventory item card.
 * Layout:
 *   [Avatar] | Name (bold)       [Unit badge]
 *            | Sales   Purchase   Quantity
 */
export const ItemCard: React.FC<ItemCardProps> = ({ item, onPress, onRetry }) => {
  const statusConfig = STOCK_STATUS_CONFIG[item.stockStatus];

  const handleRetry = (e: any) => {
    e?.stopPropagation?.();
    if (onRetry) {
      onRetry(item);
    } else {
      itemEvents.emitRetry(item);
    }
  };

  const isSaving = item.syncStatus === 'saving';
  const isFailed = item.syncStatus === 'failed';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress?.(item)}
      style={{
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
      }}
      className={`bg-surface mx-3 mb-2.5 p-3.5 rounded-xl border shadow-2xs ${
        isFailed ? 'border-rose-300' : 'border-slate-200/80'
      }`}
    >
      {/* Row 1: Avatar + Name + Unit badge */}
      <View className="flex-row items-center mb-2">
        {/* Avatar letter */}
        <View className="w-12 h-12 rounded-md bg-slate-100 items-center justify-center mr-3 flex-shrink-0">
          <Text className="text-lg font-bold text-slate-600">{item.avatarLetter}</Text>
        </View>

        {/* Name */}
        <Text
          className="flex-1 text-base font-semibold text-text"
          numberOfLines={1}
        >
          {item.name}
        </Text>

        {/* Unit badge (top-right, like "General" / "Cold Drink" in screenshot) */}
        {item.unit ? (
          <View className="ml-2 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/70">
            <Text className="text-xs font-semibold text-text-secondary">{item.unit}</Text>
          </View>
        ) : null}
      </View>

      {/* Row 2: Sales / Purchase / Quantity */}
      <View className="flex-row items-center pl-16">
        {/* Sales price */}
        <View className="flex-1">
          <Text className="text-[10px] text-text-secondary font-medium mb-0.5">Sales</Text>
          <Text className="text-sm font-semibold text-text">
            Rs. {item.sellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>

        {/* Purchase price */}
        <View className="flex-1">
          <Text className="text-[10px] text-text-secondary font-medium mb-0.5">Purchase</Text>
          <Text className="text-sm font-semibold text-text">
            Rs. {item.purchasePrice != null ? item.purchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </Text>
        </View>

        {/* Quantity + stock status */}
        <View className="items-end">
          <Text className="text-[10px] text-text-secondary font-medium mb-0.5">Quantity</Text>
          <Text className={`text-sm ${statusConfig.textClass}`}>
            {item.stockQuantity.toLocaleString()}
            {item.unit ? ` ${item.unit}` : ''}
          </Text>
        </View>
      </View>

      {/* Failed indicator only */}

      {isFailed && (
        <View className="mt-2 pl-12 flex-row items-center">
          <TouchableOpacity
            onPress={handleRetry}
            className="px-2 py-0.5 rounded-md bg-rose-100 flex-row items-center gap-x-1"
            activeOpacity={0.7}
          >
            <Feather name="refresh-cw" size={10} color="#E11D48" />
            <Text className="text-[10px] font-bold text-rose-700">Failed • Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ItemCard;
