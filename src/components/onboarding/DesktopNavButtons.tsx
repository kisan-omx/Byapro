import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DesktopNavButtonsProps } from "../../types/onboarding";

export function DesktopNavButtons({
  currentIndex,
  totalSlides,
  onPrev,
  onNext,
}: DesktopNavButtonsProps) {
  return (
    <>
      {currentIndex > 0 && (
        <TouchableOpacity
          onPress={onPrev}
          activeOpacity={0.8}
          className="absolute left-6 z-40 w-12 h-12 rounded-full bg-surface shadow-lg border border-border items-center justify-center"
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
      )}

      {currentIndex < totalSlides - 1 && (
        <TouchableOpacity
          onPress={onNext}
          activeOpacity={0.8}
          className="absolute right-6 z-40 w-12 h-12 rounded-full bg-surface shadow-lg border border-border items-center justify-center"
        >
          <Ionicons name="chevron-forward" size={24} color="#0F172A" />
        </TouchableOpacity>
      )}
    </>
  );
}
