import React from "react";
import { OnboardingScreen as OnboardingComponent } from "../components/onboarding/OnboardingScreen";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OnboardingRoute() {
  const router = useRouter();

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem("onboarding_completed", "true");
    } catch (e) {
      console.error("Failed to save onboarding completion:", e);
    }
    // Navigate to Google Auth screen instead of home tabs after onboarding
    router.replace("/auth");
  };

  return <OnboardingComponent onFinish={handleFinish} />;
}
