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
    // Guard: only navigate once per mount, ignore subsequent onAuthStateChanged events
    let hasNavigated = false;

    async function determineRoute() {
      try {
        const onboardingValue = await AsyncStorage.getItem("onboarding_completed");
        if (onboardingValue !== "true") {
          setInitialRoute("/onboarding");
          return;
        }

        const checkUserBusiness = async (userId: string) => {
          try {
            // ─── Critical fix ─────────────────────────────────────────────
            // On cold start, Firebase has restored the session but the ID
            // token may not be injected into the Supabase fetch interceptor
            // yet. We force-refresh the token here so the RLS policy
            // firebase_uid() can resolve correctly.
            const user = auth.currentUser;
            if (user) {
              await user.getIdToken(false); // warm up — uses cache if valid
            }
            // ─────────────────────────────────────────────────────────────

            // Use plain .select().limit(1) — returns an array, never throws.
            // .single() and .maybeSingle() both error with PGRST116 when
            // multiple rows exist (user has more than one business record).
            const { data, error } = await supabase
              .from("businesses")
              .select("id")
              .eq("owner_id", userId)
              .order("created_at", { ascending: false })
              .limit(1);

            if (error) {
              console.warn("Business check error:", error.message);
              return "/setup-business";
            }

            // data is always an array — route home if any business exists
            return Array.isArray(data) && data.length > 0
              ? "/(tabs)/home"
              : "/setup-business";
          } catch (err) {
            console.warn("Business check exception:", err);
            return "/setup-business";
          }
        };

        unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
          // Only act on the first resolved auth state per app open
          if (hasNavigated) return;

          if (user) {
            const route = await checkUserBusiness(user.uid);
            if (!hasNavigated) {
              hasNavigated = true;
              setInitialRoute(route);
            }
          } else {
            if (!hasNavigated) {
              hasNavigated = true;
              setInitialRoute("/auth");
            }
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
