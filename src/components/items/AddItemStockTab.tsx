import React from "react";
import { View, TouchableOpacity } from "react-native";
import { AddItemBaseField } from "./AddItemBaseField";
import { Feather } from "@expo/vector-icons";

export interface AddItemStockTabProps {
  stockQuantity: string;
  onStockQuantityChange: (v: string) => void;
  asOfDate: string;
  onAsOfDateChange: (v: string) => void;
  onAsOfDatePress: () => void;
  atPrice: string;
  onAtPriceChange: (v: string) => void;
  lowStockAlert: string;
  onLowStockAlertChange: (v: string) => void;
  itemLocation: string;
  onItemLocationChange: (v: string) => void;
}

export const AddItemStockTab: React.FC<AddItemStockTabProps> = ({
  stockQuantity,
  onStockQuantityChange,
  asOfDate,
  onAsOfDateChange,
  onAsOfDatePress,
  atPrice,
  onAtPriceChange,
  lowStockAlert,
  onLowStockAlertChange,
  itemLocation,
  onItemLocationChange,
}) => {
  return (
    <View className="px-4 pt-0 pb-0">
      {/* Opening Stock (Full Width) */}
      <View className="mb-4">
        <AddItemBaseField
          label="Opening Stock ⓘ"
          value={stockQuantity}
          onChangeText={onStockQuantityChange}
          keyboardType="decimal-pad"
        />
      </View>

      {/* Row: As of Date & At Price/Unit */}
      <View className="flex-row justify-between mb-4">
        <View className="flex-1 mr-2">
          <TouchableOpacity onPress={onAsOfDatePress} activeOpacity={0.7}>
            <View pointerEvents="none">
              <AddItemBaseField
                label="As of Date"
                value={asOfDate}
                onChangeText={onAsOfDateChange}
                editable={false}
                rightAction={
                  <Feather name="calendar" size={16} color="#94A3B8" />
                }
              />
            </View>
          </TouchableOpacity>
        </View>
        <View className="flex-1 ml-2">
          <AddItemBaseField
            label="At Price/Unit ⓘ"
            value={atPrice}
            onChangeText={onAtPriceChange}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {/* Row: Min Stock Qty & Item Location */}
      <View className="flex-row justify-between mb-4">
        <View className="flex-1 mr-2">
          <AddItemBaseField
            label="Min Stock Qty ⓘ"
            value={lowStockAlert}
            onChangeText={onLowStockAlertChange}
            keyboardType="decimal-pad"
          />
        </View>
        <View className="flex-1 ml-2">
          <AddItemBaseField
            label="Item Location"
            value={itemLocation}
            onChangeText={onItemLocationChange}
            autoCapitalize="words"
          />
        </View>
      </View>
    </View>
  );
};

export default AddItemStockTab;
