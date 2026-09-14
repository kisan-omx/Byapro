import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Item } from "../../types/item";
import { SELECT_ITEM_CONSTANTS } from "../../constants/selectItemConstants";
import { getItemImageUrl } from "../../services/storageService";

export interface SelectItemCardProps {
  item: Item;
  onPress: (item: Item) => void;
}

/**
 * Item row card for the Select Item screen.
 * Matches the design mockup:
 *   [Avatar/Image]  Name (bold)
 *                   Category (only if set)
 *                   Rs. <price> [/unit ▼]    Stock: <qty> [unit]
 *
 * Intentionally simpler than ItemCard (no sync status, no retry button).
 * Designed purely for item selection in a transaction.
 */
export const SelectItemCard: React.FC<SelectItemCardProps> = ({
  item,
  onPress,
}) => {
  // Image: DB path takes priority, then local optimistic URI
  const displayImageUri = item.imagePath
    ? `${getItemImageUrl(item.imagePath)}?t=${new Date(item.updatedAt).getTime()}`
    : item.imageUrl || null;

  // Build the price display: "Rs. 120" or "Rs. 0"
  const priceText = `${SELECT_ITEM_CONSTANTS.PRICE_PREFIX} ${item.sellingPrice.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

  // Build the stock display: "Stock: 0" or "Stock: 0 BTL"
  const stockQty = item.stockQuantity.toLocaleString();
  const stockText = item.unit
    ? `${SELECT_ITEM_CONSTANTS.STOCK_LABEL} ${stockQty} ${item.unit}`
    : `${SELECT_ITEM_CONSTANTS.STOCK_LABEL} ${stockQty}`;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onPress(item)}
      className="bg-surface mx-3 mb-2.5 px-4 py-3.5 rounded-xl border border-slate-200/80"
      style={{
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
      }}
    >
      <View className="flex-row items-center">
        {/* Avatar: image if uploaded, otherwise first letter */}
        <View className="w-10 h-10 rounded-lg bg-slate-100 items-center justify-center mr-3 flex-shrink-0 overflow-hidden">
          {displayImageUri ? (
            <Image
              source={{ uri: displayImageUri }}
              style={{ width: 40, height: 40 }}
              resizeMode="cover"
            />
          ) : (
            <Text className="text-base font-bold text-slate-600">
              {item.avatarLetter}
            </Text>
          )}
        </View>

        {/* Details */}
        <View className="flex-1">
          {/* Item Name */}
          <Text
            className="text-sm font-bold text-text mb-0.5"
            numberOfLines={1}
          >
            {item.name}
          </Text>

          {/* Category — not displayed: Item type carries only categoryId (UUID),
              not the human-readable name. Omit to avoid showing raw UUIDs. */}

          {/* Price row + Stock */}
          <View className="flex-row items-center justify-between">
            {/* Price with optional unit + dropdown arrow */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onPress(item)}
              className="flex-row items-center"
            >
              <Text className="text-sm font-semibold text-text">
                {priceText}
                {item.unit ? (
                  <Text className="text-xs text-text-secondary font-medium">
                    {" "}
                    /{item.unit}
                  </Text>
                ) : null}
              </Text>
              <Ionicons
                name="chevron-down"
                size={14}
                color="#64748B"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>

            {/* Stock quantity */}
            <Text className="text-xs text-text-secondary font-medium">
              {stockText}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SelectItemCard;
