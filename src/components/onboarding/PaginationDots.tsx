import React from "react";
import { View, TouchableOpacity, Animated } from "react-native";
import { PaginationDotsProps } from "../../types/onboarding";

export function PaginationDots({
  totalDots,
  scrollX,
  width,
  onDotPress,
}: PaginationDotsProps) {
  return (
    <View className="flex-row items-center justify-center gap-x-2 sm:gap-x-3 mb-5 sm:mb-6">
      {Array.from({ length: totalDots }).map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

        const activeOpacity = scrollX.interpolate({
          inputRange,
          outputRange: [0, 1, 0],
          extrapolate: "clamp",
        });

        const inactiveOpacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.4, 0, 0.4],
          extrapolate: "clamp",
        });

        return (
          <TouchableOpacity
            key={i}
            activeOpacity={0.7}
            onPress={() => onDotPress(i)}
            style={{
              paddingVertical: 4,
              width: 28,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Active Pill */}
            <Animated.View
              style={{ opacity: activeOpacity }}
              className="absolute h-2 sm:h-2.5 w-7 rounded-full bg-primary"
            />
            {/* Inactive Dot */}
            <Animated.View
              style={{ opacity: inactiveOpacity }}
              className="absolute h-2 sm:h-2.5 w-2.5 rounded-full bg-primary"
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
