import React from "react";
import { View, Text } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

export function HeaderLogo() {
  return (
    <View className="items-center justify-center mt-2 sm:mt-4 md:mt-6 mb-2 sm:mb-3">
      {/* Brand Logo & Name */}
      <View className="flex-row items-center justify-center gap-x-2 sm:gap-x-3">
        <View className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-tr from-error to-warning items-center justify-center shadow-md shadow-error/20 bg-error">
          <Ionicons
            name="play"
            size={18}
            color="#FFFFFF"
            style={{ transform: [{ rotate: "-90deg" }] }}
          />
        </View>
        <View className="flex-row items-baseline">
          <Text className="text-2xl sm:text-3xl md:text-4xl font-black text-text tracking-tight">
            Byapro
          </Text>
          <View className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary ml-1" />
        </View>
      </View>
      {/* Tagline */}
      <Text className="text-xs sm:text-sm md:text-base text-text-secondary mt-1 sm:mt-2 tracking-wide font-medium">
        Run Your Business. <Text className="font-bold text-text">Simply</Text>
      </Text>
    </View>
  );
}
