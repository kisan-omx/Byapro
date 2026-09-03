import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  // Calculate padding that accounts for system navigation bars on BOTH iOS and Android
  // This prevents the Android bottom navigation buttons from overlapping the app's tab bar.
  const bottomPadding = Math.max(insets.bottom + 8, 12);
  const barHeight = 60 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true, // Crucial UI fix: Prevents tab bar from hovering over keyboard
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E2E8F0",
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: barHeight,
          // Subtle shadow for better UI layering
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        },
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#475569",
        tabBarLabelStyle: {
          fontSize: 11.5,
          fontWeight: "500",
          marginTop: 2,
          letterSpacing: -0.2,
        },
        tabBarItemStyle: {
          paddingHorizontal: 0,
        },
        tabBarButton: (props) => (
          <TouchableOpacity {...props} activeOpacity={1} />
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "receipt" : "receipt-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="parties"
        options={{
          title: "Parties",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="items"
        options={{
          title: "Items",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "cube" : "cube-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
