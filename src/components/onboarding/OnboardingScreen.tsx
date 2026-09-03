import React, { useMemo } from "react";
import { View, Animated, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OnboardingSlide } from "./OnboardingSlide";
import { InvoiceGraphic } from "./InvoiceGraphic";
import { ItemsGraphic } from "./ItemsGraphic";
import { ReminderGraphic } from "./ReminderGraphic";
import { BackgroundPattern } from "./BackgroundPattern";
import { PaginationDots } from "./PaginationDots";
import { CtaButton } from "./CtaButton";
import { TopBarHeader } from "./TopBarHeader";
import { DesktopNavButtons } from "./DesktopNavButtons";
import { SLIDES_DATA } from "../../constants/onboardingData";
import { useOnboarding } from "../../hooks/useOnboarding";

export function OnboardingScreen({ onFinish }: { onFinish?: () => void }) {
  const {
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
  } = useOnboarding(onFinish);

  const slideGraphics = useMemo(
    () => [
      <InvoiceGraphic key="invoice" />,
      <ItemsGraphic key="items" />,
      <ReminderGraphic key="reminder" />,
    ],
    [],
  );

  const fullSlidesData = useMemo(
    () =>
      SLIDES_DATA.map((item, index) => ({
        ...item,
        graphic: slideGraphics[index],
      })),
    [slideGraphics],
  );

  return (
    <SafeAreaView className="flex-1 bg-surface justify-between relative">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Background Watermark Pattern */}
      <BackgroundPattern />

      {/* Top Bar with Skip Action */}
      <TopBarHeader showSkip={!isLastSlide} onSkip={onFinish || (() => {})} />

      {/* Main Slides — Animated.ScrollView for real-time scrollX tracking */}
      <View className="flex-1 relative justify-center">
        {isLargeScreen && (
          <DesktopNavButtons
            currentIndex={currentIndex}
            totalSlides={totalSlides}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}

        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          snapToInterval={width}
          snapToAlignment="center"
          disableIntervalMomentum={true}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          bounces={false}
          overScrollMode="never"
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          // Disable content inset adjustment so width is exact
          contentInsetAdjustmentBehavior="never"
        >
          {fullSlidesData.map((item, index) => (
            <OnboardingSlide
              key={item.id}
              title={item.title}
              graphic={item.graphic}
              index={index}
              scrollX={scrollX}
              width={width}
            />
          ))}
        </Animated.ScrollView>
      </View>

      {/* Bottom Navigation & Controls */}
      <View className="w-full px-4 sm:px-8 pb-6 sm:pb-8 pt-2 items-center">
        <View className="w-full max-w-md sm:max-w-lg items-center">
          <PaginationDots
            totalDots={totalSlides}
            currentIndex={currentIndex}
            scrollX={scrollX}
            width={width}
            onDotPress={scrollToSlide}
          />
          <CtaButton
            scrollX={scrollX}
            width={width}
            totalSlides={totalSlides}
            onPress={handleNext}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
