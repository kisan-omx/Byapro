import React, { useMemo } from "react";
import { View, Text, Animated, useWindowDimensions } from "react-native";
import { HeaderLogo } from "./HeaderLogo";
import { OnboardingSlideProps } from "../../types/onboarding";

export function OnboardingSlide({
  title,
  graphic,
  index,
  scrollX,
  width,
}: OnboardingSlideProps) {
  // Input range: one full page before, on this page, one full page after
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  // Graphic: scale down when off-screen, full size when active
  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.82, 1, 0.82],
    extrapolate: "clamp",
  });

  // Graphic + title: fade out when off-screen
  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.3, 1, 0.3],
    extrapolate: "clamp",
  });

  // Title: subtle vertical parallax (rises as it comes in from right)
  const translateY = scrollX.interpolate({
    inputRange,
    outputRange: [18, 0, 18],
    extrapolate: "clamp",
  });

  // Title: slight horizontal push for depth
  const translateX = scrollX.interpolate({
    inputRange,
    outputRange: [30, 0, -30],
    extrapolate: "clamp",
  });

  return (
    <View
      style={{ width }}
      className="flex-1 items-center justify-between px-3 sm:px-6 md:px-12 pt-3 sm:pt-6 pb-4 sm:pb-8"
    >
      <View className="w-full max-w-2xl items-center flex-1 justify-between">
        {/* Header Logo */}
        <HeaderLogo />

        {/* Graphic — scales in/out smoothly from scrollX */}
        <Animated.View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            opacity,
            transform: [{ scale }],
          }}
          className="my-1 sm:my-3"
        >
          {graphic}
        </Animated.View>

        {/* Title — parallax slides up + fades in */}
        <Animated.View
          style={{
            opacity,
            transform: [{ translateY }, { translateX }],
          }}
          className="w-full px-4 sm:px-8 mb-6 sm:mb-10"
        >
          <Text className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 text-center leading-snug tracking-tight">
            {title}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}
