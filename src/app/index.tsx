import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { supabase } from "../lib/supabase";
import * as SplashScreen from "expo-splash-screen";

export default function Index() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;

    async function determineRoute() {
      try {
        const onboardingValue = await AsyncStorage.getItem("onboarding_completed");
        if (onboardingValue !== "true") {
          setInitialRoute("/onboarding");
          return;
        }

        const checkUserBusiness = async (userId: string) => {
          try {
            const { data, error } = await supabase
              .from("businesses")
              .select("id")
              .eq("owner_id", userId)
              .single();
            if (error || !data?.id) {
              return "/setup-business";
            }
            return "/(tabs)/home";
          } catch (err) {
            return "/setup-business";
          }
        };

        unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
          if (user) {
            const route = await checkUserBusiness(user.uid);
            setInitialRoute(route);
          } else {
            setInitialRoute("/auth");
          }
        });
      } catch (e) {
        setInitialRoute("/auth");
      }
    }

    determineRoute();

    return () => {
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
    };
  }, []);

  useEffect(() => {
    if (initialRoute) {
      // Use requestAnimationFrame to ensure the routing happens on the next frame
      requestAnimationFrame(() => {
        router.replace(initialRoute as any);
        
        // Wait for the new route to fully mount before hiding splash
        // 300ms is a safe buffer to prevent any empty frames
        setTimeout(() => {
          SplashScreen.hideAsync().catch(() => {});
        }, 300);
      });
    }
  }, [initialRoute]);

  // Always return the fallback UI while determining route AND during the transition
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: "#208AEF", justifyContent: "center", alignItems: "center" }]}>
      <ActivityIndicator size="large" color="#FFFFFF" />
    </View>
  );
}
