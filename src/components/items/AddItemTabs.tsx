import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export type AddItemTab = "pricing" | "stock";

export interface AddItemTabsProps {
  activeTab: AddItemTab;
  onChangeTab: (tab: AddItemTab) => void;
}

export const AddItemTabs: React.FC<AddItemTabsProps> = ({
  activeTab,
  onChangeTab,
}) => {
  return (
    <View className="flex-row items-center border-b border-border/60 bg-white mt-0 mb-4">
      <TouchableOpacity
        onPress={() => onChangeTab("pricing")}
        className={`flex-1 items-center justify-center py-3 ${
          activeTab === "pricing" ? "border-b-2 border-primary" : ""
        }`}
      >
        <Text
          className={`text-sm font-bold ${
            activeTab === "pricing" ? "text-primary" : "text-text-secondary"
          }`}
        >
          Pricing
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onChangeTab("stock")}
        className={`flex-1 items-center justify-center py-3 ${
          activeTab === "stock" ? "border-b-2 border-primary" : ""
        }`}
      >
        <Text
          className={`text-sm font-bold ${
            activeTab === "stock" ? "text-primary" : "text-text-secondary"
          }`}
        >
          Stock
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddItemTabs;
