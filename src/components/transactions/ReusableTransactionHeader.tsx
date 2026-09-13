import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export interface ReusableTransactionHeaderProps {
  title: string;
  paymentType?: "credit" | "cash";
  onPaymentTypeChange?: (type: "credit" | "cash") => void;
  showPaymentToggle?: boolean;
  onBack: () => void;
}

export default function ReusableTransactionHeader({
  title,
  paymentType = "cash",
  onPaymentTypeChange,
  showPaymentToggle = true,
  onBack,
}: ReusableTransactionHeaderProps) {
  return (
    <SafeAreaView
      edges={["top"]}
      className="bg-surface border-b border-slate-100"
    >
      <View className="flex-row items-center justify-between px-4 py-3 bg-surface">
        {/* Left: Back Button & Screen Title */}
        <View className="flex-row items-center flex-1 pr-2">
          <TouchableOpacity
            onPress={onBack}
            className="p-2 -ml-2 rounded-full active:bg-slate-100"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text
            className="text-xl font-bold text-text ml-2 flex-shrink"
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        {/* Right: Cash / Credit Toggle Switch (No Settings Icon) */}
        {showPaymentToggle ? (
          <View className="flex-row bg-slate-100 p-1 rounded-full items-center">
            <TouchableOpacity
              onPress={() => onPaymentTypeChange?.("cash")}
              className={`px-3.5 py-1.5 rounded-full ${
                paymentType === "cash" ? "bg-emerald-500" : "bg-transparent"
              }`}
              activeOpacity={0.8}
            >
              <Text
                className={`text-xs font-semibold ${
                  paymentType === "cash" ? "text-white" : "text-slate-600"
                }`}
              >
                Cash
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onPaymentTypeChange?.("credit")}
              className={`px-3.5 py-1.5 rounded-full ${
                paymentType === "credit" ? "bg-emerald-500" : "bg-transparent"
              }`}
              activeOpacity={0.8}
            >
              <Text
                className={`text-xs font-semibold ${
                  paymentType === "credit" ? "text-white" : "text-slate-600"
                }`}
              >
                Credit
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="w-6" />
        )}
      </View>
    </SafeAreaView>
  );
}
