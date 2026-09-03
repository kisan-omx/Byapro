import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { supabase } from "../lib/supabase";
import * as SplashScreen from "expo-splash-screen";
export default function Index() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

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
      // Hide splash screen once we know the route
      // A short timeout ensures the new route has started rendering
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 10);
    }
  }, [initialRoute]);

  if (initialRoute === null) {
    return null;
  }

  return <Redirect href={initialRoute as any} />;
}
