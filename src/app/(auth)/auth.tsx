import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Image,
  ScrollView,
  useWindowDimensions,
  Animated,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HeaderLogo } from "../../components/onboarding/HeaderLogo";
import { BackgroundPattern } from "../../components/onboarding/BackgroundPattern";
import {
  auth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from "../../lib/firebase";
import { supabase } from "../../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Lazily require GoogleSignin only on native platforms to prevent Expo Go crashes
const getGoogleSignin = () => {
  if (Platform.OS !== "web") {
    try {
      return require("@react-native-google-signin/google-signin").GoogleSignin;
    } catch {
      return null;
    }
  }
  return null;
};

export default function AuthScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { width, height } = useWindowDimensions();

  // Configure Google Sign-In only on native platforms
  useEffect(() => {
    const GoogleSigninInstance = getGoogleSignin();
    if (GoogleSigninInstance) {
      try {
        GoogleSigninInstance.configure({
          webClientId:
            process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
            "520706100053-k05v9a5h4jnj6ali1urisj1k0oqbfm71.apps.googleusercontent.com",
          offlineAccess: true,
        });
      } catch (e) {
        console.log("Google Sign-In configure failed:", e);
      }
    }
  }, []);

  // Entrance animations for ultra-smooth UX
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Screen sizing helpers
  const isSmallDevice = height < 600 || width < 360;

  const checkBusinessAndNavigate = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 is no rows returned

      if (data && data.id) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/setup-business");
      }
    } catch (err) {
      console.error("Error checking business:", err);
      router.replace("/setup-business");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const GoogleSigninInstance = getGoogleSignin();
      if (GoogleSigninInstance) {
        // Check if Play Services are available
        await GoogleSigninInstance.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
        const signInResult = await GoogleSigninInstance.signIn();
        const idToken = signInResult.data?.idToken;

        if (idToken) {
          const credential = GoogleAuthProvider.credential(idToken);
          const userCredential = await signInWithCredential(auth, credential);
          if (userCredential.user) {
            const firebaseUser = userCredential.user;

            // Sync user to Supabase
            const { error: syncError } = await supabase.from("users").upsert({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              display_name: firebaseUser.displayName,
              photo_url: firebaseUser.photoURL,
              updated_at: new Date().toISOString(),
            });

            if (syncError) {
              console.warn(
                "Failed to sync user profile to Supabase:",
                syncError,
              );

              const errorText =
                syncError?.message || "Server rate limit exceeded.";
              Alert.alert(
                "Connection Sync Issue",
                `We couldn't sync your account profile: ${errorText}`,
              );

              try {
                await signOut(auth);
              } catch (signOutError) {
                console.warn("Sign out during fallback failed:", signOutError);
              }
              return;
            }

            const user = auth.currentUser;
            if (user) {
              await checkBusinessAndNavigate(user.uid);
            }
          }
        }
      }
    } catch (err: any) {
      console.log("Google Sign-In error details:", err?.message || err);
      Alert.alert("Google Sign-In Failed", err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface relative">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <BackgroundPattern />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: width >= 1024 ? 40 : width >= 768 ? 32 : 24,
          paddingVertical: isSmallDevice ? 16 : 32,
        }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top / Brand Info */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          className="items-center w-full max-w-md mt-4 sm:mt-8 md:mt-12"
        >
          <HeaderLogo />
        </Animated.View>

        {/* Center Auth CTA Card / Container */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          }}
          className="w-full max-w-md md:max-w-lg my-auto items-center py-8 sm:py-10 px-5 sm:px-8 md:bg-white/80 md:backdrop-blur-md md:rounded-3xl md:shadow-lg md:border md:border-slate-100"
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border border-slate-200 py-3.5 sm:py-4.5 px-5 rounded-full flex-row items-center justify-center shadow-md shadow-slate-200 active:scale-95 transition-transform"
            style={{ elevation: 3 }}
          >
            {loading ? (
              <ActivityIndicator color="#2563EB" size="small" />
            ) : (
              <>
                <Image
                  source={require("../../../assets/icons/google.png")}
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 mr-3"
                  resizeMode="contain"
                />
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                  className="text-slate-800 font-bold text-base sm:text-lg md:text-xl tracking-wide text-center"
                >
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text className="text-sm sm:text-base text-slate-400 text-center mt-5 sm:mt-7 leading-relaxed max-w-sm">
            By continuing, you agree to Byapro Terms of Service & Privacy
            Policy.
          </Text>
        </Animated.View>

        {/* Bottom Footer / Copyright Note */}
        <View className="w-full max-w-md items-center py-2">
          <Text className="text-[11px] sm:text-xs text-slate-400 text-center font-medium">
            © {new Date().getFullYear()} Byapro. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
