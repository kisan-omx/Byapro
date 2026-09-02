import { Stack } from "expo-router";
import "../style/global.css";

export default function RootLayout() {
  return <Stack 
    screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#F8FAFC" },
              animation: "none",
    }}
  />;
}
