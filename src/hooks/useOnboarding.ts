import { useState, useRef, useEffect, useCallback } from "react";
import {
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
  Animated,
} from "react-native";
import { SLIDES_DATA, OnboardingConstants } from "../constants/onboardingData";

export function useOnboarding(onFinish?: () => void) {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Shared animated value that tracks exact scroll position — drives all interpolations
  const scrollX = useRef(new Animated.Value(0)).current;

  const hasFinished = useRef(false);
  const isDragging = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentIndexRef = useRef(0); // mirror of currentIndex for use inside setInterval

  const totalSlides = SLIDES_DATA.length;
  const isLastSlide = currentIndex === totalSlides - 1;
  const isLargeScreen = width >= OnboardingConstants.LARGE_SCREEN_BREAKPOINT;

  const safeFinish = useCallback(() => {
    if (!hasFinished.current && onFinish) {
      hasFinished.current = true;
      onFinish();
    }
  }, [onFinish]);

  // ─── Smooth programmatic scroll using scrollTo (pixel-perfect, no jank) ──────
  const scrollToSlide = useCallback(
    (index: number, animated = true) => {
      const clamped = Math.max(0, Math.min(index, totalSlides - 1));
      scrollViewRef.current?.scrollTo({ x: clamped * width, animated });
      setCurrentIndex(clamped);
      currentIndexRef.current = clamped;
    },
    [totalSlides, width],
  );

  // ─── Auto-slide ──────────────────────────────────────────────────────────────
  const startAutoSlide = useCallback(
    (fromIndex: number) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (fromIndex >= totalSlides - 1) return;

      intervalRef.current = setInterval(() => {
        if (isDragging.current) return;
        const next = currentIndexRef.current + 1;
        if (next >= totalSlides) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
        scrollViewRef.current?.scrollTo({ x: next * width, animated: true });
        setCurrentIndex(next);
        currentIndexRef.current = next;
      }, OnboardingConstants.AUTO_SLIDE_INTERVAL_MS);
    },
    [totalSlides, width],
  );

  useEffect(() => {
    startAutoSlide(0);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoSlide]);

  // ─── Scroll event — drives scrollX for real-time interpolations ──────────────
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: true,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!width) return;
        const x = event.nativeEvent.contentOffset.x;
        const index = Math.round(x / width);
        if (
          index !== currentIndexRef.current &&
          index >= 0 &&
          index < totalSlides
        ) {
          setCurrentIndex(index);
          currentIndexRef.current = index;
        }
      },
    },
  );

  const handleScrollBeginDrag = useCallback(() => {
    isDragging.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!width) return;
      const x = event.nativeEvent.contentOffset.x;
      const newIndex = Math.max(
        0,
        Math.min(Math.round(x / width), totalSlides - 1),
      );
      setCurrentIndex(newIndex);
      currentIndexRef.current = newIndex;
      startAutoSlide(newIndex);
    },
    [width, totalSlides, startAutoSlide],
  );

  const handleNext = useCallback(() => {
    if (!isLastSlide) {
      const next = currentIndexRef.current + 1;
      scrollToSlide(next);
      startAutoSlide(next);
    } else {
      safeFinish();
    }
  }, [isLastSlide, scrollToSlide, startAutoSlide, safeFinish]);

  const handlePrev = useCallback(() => {
    if (currentIndexRef.current > 0) {
      scrollToSlide(currentIndexRef.current - 1);
    }
  }, [scrollToSlide]);

  return {
    width,
    scrollX,
    currentIndex,
    totalSlides,
    isLastSlide,
    isLargeScreen,
    scrollViewRef,
    handleScroll,
    handleScrollBeginDrag,
    handleScrollEndDrag,
    handleMomentumScrollEnd,
    scrollToSlide,
    handleNext,
    handlePrev,
  };
}
