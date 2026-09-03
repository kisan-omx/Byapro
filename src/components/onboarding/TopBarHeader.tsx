import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { TopBarHeaderProps } from "../../types/onboarding";

export function TopBarHeader({ showSkip, onSkip }: TopBarHeaderProps) {
  return (
    <View className="w-full px-5 sm:px-8 pt-8 sm:pt-4 pb-1 flex-row justify-between items-center z-30">
      <View className="w-12" />
      {showSkip ? (
        <TouchableOpacity
          onPress={onSkip}
          activeOpacity={0.7}
          className="px-3.5 py-1.5 rounded-full bg-border/50"
        >
          <Text className="text-xs sm:text-sm font-bold text-text-secondary">
            Skip
          </Text>
        </TouchableOpacity>
      ) : (
        <View className="w-12" />
      )}
    </View>
  );
}
