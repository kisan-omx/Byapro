import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export interface CashTransactionCardProps {
  onPress?: () => void;
}

export const CashTransactionCard: React.FC<CashTransactionCardProps> = ({
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
      }}
      className="bg-surface mx-4 mb-3 p-3 rounded-xl border border-slate-200/80 shadow-2xs flex-row items-center justify-between"
    >
      <View className="flex-row items-center flex-1">
        {/* Primary Circle Icon */}
        <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-3">
          <MaterialCommunityIcons
            name="cash-multiple"
            size={20}
            color="#FFFFFF"
          />
        </View>

        <View className="flex-1 justify-center">
          <Text className="text-base font-semibold text-text">
            Cash Transactions
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CashTransactionCard;
