import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SELECT_ITEM_CONSTANTS } from "../../constants/selectItemConstants";

export interface SelectItemFilterBarProps {
  onOpenCategoryModal: () => void;
  onAddNewItem: () => void;
}

/**
 * Filter bar for the Select Item screen.
 * Layout: [Category ▼]    [+ Add New Item]
 * Matches the design mockup exactly.
 */
export const SelectItemFilterBar: React.FC<SelectItemFilterBarProps> = ({
  onOpenCategoryModal,
  onAddNewItem,
}) => {
  return (
    <View className="bg-surface border-b border-border/60 px-4 py-2.5 flex-row items-center justify-between">
      {/* Left: Category filter chip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center" }}
      >
        <TouchableOpacity
          onPress={onOpenCategoryModal}
          activeOpacity={0.75}
          className="flex-row items-center px-4 py-2 rounded-full border bg-slate-100/90 border-slate-200/80 shadow-2xs mr-2"
        >
          <Text className="text-xs font-semibold text-slate-700 mr-1.5">
            {SELECT_ITEM_CONSTANTS.CATEGORY_CHIP_LABEL}
          </Text>
          <Feather name="chevron-down" size={14} color="#475569" />
        </TouchableOpacity>
      </ScrollView>

      {/* Right: Add New Item button */}
      <TouchableOpacity
        onPress={onAddNewItem}
        activeOpacity={0.75}
        className="flex-row items-center px-4 py-2 rounded-full border border-primary/30 bg-primary-light"
      >
        <Text className="text-xs font-semibold text-primary">
          {SELECT_ITEM_CONSTANTS.ADD_NEW_ITEM_LABEL}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SelectItemFilterBar;
