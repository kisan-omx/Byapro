import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { StockFilterType } from "../../types/item";
import { STOCK_FILTER_OPTIONS } from "../../constants/items";

export interface StockFilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedFilter: StockFilterType;
  onSelectFilter: (filter: StockFilterType) => void;
}

/**
 * Modal for selecting the stock level filter.
 * Options: All, In Stock, Low Stock, Out of Stock.
 * Same pattern as PaymentFilterModal.
 */
export const StockFilterModal: React.FC<StockFilterModalProps> = ({
  visible,
  onClose,
  selectedFilter,
  onSelectFilter,
}) => {
  const handleSelect = (filter: StockFilterType) => {
    onSelectFilter(filter);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/40 justify-end"
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="bg-surface rounded-t-2xl overflow-hidden"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-slate-300" />
          </View>

          {/* Title row */}
          <View className="flex-row items-center justify-between px-5 py-3 border-b border-border/60">
            <Text className="text-base font-bold text-text">
              Filter by Stock
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Feather name="x" size={20} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            className="pb-4"
          >
            {STOCK_FILTER_OPTIONS.map((option) => {
              const isSelected = selectedFilter === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleSelect(option.id)}
                  activeOpacity={0.75}
                  className={`flex-row items-center justify-between px-5 py-4 border-b border-border/40 ${
                    isSelected ? "bg-primary-light" : ""
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      isSelected ? "text-primary" : "text-text"
                    }`}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <Feather name="check" size={18} color="#0EA5E9" />
                  )}
                </TouchableOpacity>
              );
            })}
            {/* Bottom safe area padding */}
            <View className="h-8" />
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default StockFilterModal;
