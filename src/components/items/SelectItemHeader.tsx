import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { SELECT_ITEM_CONSTANTS } from "../../constants/selectItemConstants";

export interface SelectItemHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onBack: () => void;
}

/**
 * Header for the Select Item screen.
 * Layout: [← back] [🔍 Search & Select Item ______ ]
 * Uses SafeAreaView edges=["top"] — same pattern as ReusableTransactionHeader.
 */
export const SelectItemHeader: React.FC<SelectItemHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onBack,
}) => {
  return (
    <SafeAreaView
      edges={["top"]}
      className="bg-surface border-b border-border/80 shadow-xs"
    >
      <View className="flex-row items-center px-3 py-2.5">
        {/* Back Button */}
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          className="p-2 mr-1 rounded-lg"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>

        {/* Search Bar */}
        <View className="flex-1 flex-row items-center bg-background border border-border/90 rounded-xl px-3.5 py-2.5">
          <Feather name="search" size={18} color="#94A3B8" />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder={SELECT_ITEM_CONSTANTS.HEADER_SEARCH_PLACEHOLDER}
            placeholderTextColor="#94A3B8"
            className="flex-1 text-sm text-text font-medium p-0 ml-2"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => onSearchChange("")}
              className="p-1 ml-1"
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Feather name="x-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SelectItemHeader;
