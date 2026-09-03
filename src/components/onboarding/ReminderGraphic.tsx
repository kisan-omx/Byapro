import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function ReminderGraphic() {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    scaleAnim.setValue(0.5);
    opacityAnim.setValue(0);

    animRef.current = Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    animRef.current.start(() => {
      animRef.current = null;
    });

    // Cleanup: stop animation on unmount to prevent memory leak
    return () => {
      if (animRef.current) {
        animRef.current.stop();
      }
    };
  }, []);

  return (
    <View className="w-full items-center justify-center py-2 sm:py-4 relative px-2 sm:px-4 h-52 sm:h-64 md:h-72">
      <View className="items-center justify-center my-auto">
        {/* Vibrant Green Circle with Animated Spring Bounce */}
        <Animated.View
          style={{
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          }}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#00C853] items-center justify-center shadow-lg shadow-[#00C853]/20 mb-4 sm:mb-5"
        >
          <Ionicons name="checkmark-sharp" size={40} color="#FFFFFF" />
        </Animated.View>

        {/* Green Success Message */}
        <Animated.Text
          style={{ opacity: opacityAnim }}
          className="text-sm sm:text-base font-bold text-[#00C853] text-center tracking-wide"
        >
          Payment Reminder Sent Successfully.
        </Animated.Text>
      </View>
    </View>
  );
}
