import { ReactNode } from "react";
import { Animated } from "react-native";

export interface SlideDataItem {
  id: string;
  title: string;
}

export interface OnboardingSlideProps {
  title: string;
  graphic: ReactNode;
  index: number;
  scrollX: Animated.Value;
  width: number;
}

export interface PaginationDotsProps {
  totalDots: number;
  currentIndex: number;
  scrollX: Animated.Value;
  width: number;
  onDotPress: (index: number) => void;
}

export interface CtaButtonProps {
  scrollX: Animated.Value;
  width: number;
  totalSlides: number;
  onPress: () => void;
}

export interface TopBarHeaderProps {
  showSkip: boolean;
  onSkip: () => void;
}

export interface DesktopNavButtonsProps {
  currentIndex: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
}
