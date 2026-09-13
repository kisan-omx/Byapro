import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "../style/global.css";

// Keep the splash screen visible while we fetch resources/auth state
SplashScreen.preventAutoHideAsync();

import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";

// Disable Reanimated strict mode warnings that clutter the console
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F8FAFC" },
        animation: "none",
      }}
    />
  );
}
