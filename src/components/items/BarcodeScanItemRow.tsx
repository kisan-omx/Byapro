import React from "react";
import { View, Text, TouchableOpacity, Image, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Item } from "../../types/item";
import { getItemImageUrl } from "../../services/storageService";

export interface ScannedItem {
  item: Item;
  quantity: number;
}

export interface BarcodeScanItemRowProps {
  scannedItem: ScannedItem;
  onQuantityChange: (qty: number) => void;
  onRemove: () => void;
}

/**
 * Cart row for a scanned item.
 * [Avatar]  Name (bold)          [-][qty][+]  [×]
 *           Item Code: XXXX
 */
const BarcodeScanItemRow: React.FC<BarcodeScanItemRowProps> = ({
  scannedItem,
  onQuantityChange,
  onRemove,
}) => {
  const { item, quantity } = scannedItem;

  const displayImageUri = item.imagePath
    ? `${getItemImageUrl(item.imagePath)}?t=${new Date(item.updatedAt).getTime()}`
    : item.imageUrl || null;

  const handleDecrement = () => {
    const next = Math.max(0.5, quantity - 1);
    onQuantityChange(Math.round(next * 10) / 10);
  };

  const handleIncrement = () => {
    onQuantityChange(Math.round((quantity + 1) * 10) / 10);
  };

  const handleQtyText = (text: string) => {
    const parsed = parseFloat(text);
    if (!isNaN(parsed) && parsed > 0) {
      onQuantityChange(parsed);
    }
  };

  const qtyDisplay = quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(1);

  return (
    <View
      className="flex-row items-center bg-surface mx-3 mb-2.5 px-4 py-3.5 rounded-2xl"
      style={{
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: "rgba(148,163,184,0.15)",
      }}
    >
      {/* Avatar / Image — same as SelectItemCard */}
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

      {/* Name + item code */}
      <View className="flex-1 mr-2">
        <Text className="text-sm font-bold text-text mb-0.5" numberOfLines={1}>
          {item.name}
        </Text>
        {item.sku ? (
          <Text className="text-xs font-medium text-text-secondary">
            Item Code: {item.sku}
          </Text>
        ) : (
          <Text className="text-xs font-medium text-text-secondary">
            Rs. {item.sellingPrice.toLocaleString()}
          </Text>
        )}
      </View>

      {/* Quantity stepper */}
      <View
        className="flex-row items-center rounded-xl overflow-hidden bg-background"
        style={{ borderWidth: 1, borderColor: "rgba(148,163,184,0.3)" }}
      >
        <TouchableOpacity
          onPress={handleDecrement}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          className="w-8 h-8 items-center justify-center"
        >
          <Feather name="minus" size={14} color="#64748B" />
        </TouchableOpacity>

        <View className="w-px h-5 bg-slate-200" />

        <TextInput
          value={qtyDisplay}
          onChangeText={handleQtyText}
          keyboardType="numeric"
          style={{
            width: 42,
            textAlign: "center",
            fontSize: 13,
            fontWeight: "700",
            color: "#0F172A",
            paddingVertical: 0,
          }}
        />

        <View className="w-px h-5 bg-slate-200" />

        <TouchableOpacity
          onPress={handleIncrement}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          className="w-8 h-8 items-center justify-center"
        >
          <Feather name="plus" size={14} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Remove button */}
      <TouchableOpacity
        onPress={onRemove}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 6 }}
        className="ml-2.5 p-1.5"
      >
        <Feather name="x" size={16} color="#94A3B8" />
      </TouchableOpacity>
    </View>
  );
};

export default BarcodeScanItemRow;
