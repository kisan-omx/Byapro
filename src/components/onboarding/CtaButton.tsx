import React from "react";
import { TouchableOpacity, Animated, View } from "react-native";
import { CtaButtonProps } from "../../types/onboarding";

export function CtaButton({
  scrollX,
  width,
  totalSlides,
  onPress,
}: CtaButtonProps) {
  const lastSlideIndex = totalSlides - 1;
  const transitionStart = (lastSlideIndex - 1) * width;
  const transitionEnd = lastSlideIndex * width;

  // Fades out the default text
  const defaultOpacity = scrollX.interpolate({
    inputRange: [transitionStart, transitionEnd],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const defaultTranslateY = scrollX.interpolate({
    inputRange: [transitionStart, transitionEnd],
    outputRange: [0, -10],
    extrapolate: "clamp",
  });

  // Fades in the final text
  const finalOpacity = scrollX.interpolate({
    inputRange: [transitionStart, transitionEnd],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const finalTranslateY = scrollX.interpolate({
    inputRange: [transitionStart, transitionEnd],
    outputRange: [10, 0],
    extrapolate: "clamp",
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="w-full bg-primary py-3.5 sm:py-4.5 rounded-full shadow-lg shadow-primary/30 items-center justify-center overflow-hidden h-[52px] sm:h-[58px]"
    >
      <View className="relative w-full h-full items-center justify-center">
        {/* Default Text */}
        <Animated.Text
          style={{
            opacity: defaultOpacity,
            transform: [{ translateY: defaultTranslateY }],
            position: "absolute",
          }}
          className="text-surface text-sm sm:text-base md:text-lg font-bold tracking-wide"
        >
          Use Byapro For Free
        </Animated.Text>

        {/* Final Text */}
        <Animated.Text
          style={{
            opacity: finalOpacity,
            transform: [{ translateY: finalTranslateY }],
            position: "absolute",
          }}
          className="text-surface text-sm sm:text-base md:text-lg font-bold tracking-wide"
        >
          Get Started Now
        </Animated.Text>
      </View>
    </TouchableOpacity>
  );
}
