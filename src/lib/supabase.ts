import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { auth } from "./firebase";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: async (url: RequestInfo | URL, options: RequestInit = {}) => {
      try {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          const headers = new Headers(options.headers);
          headers.set("Authorization", `Bearer ${token}`);
          options.headers = headers;
        }
      } catch (e: any) {
        if (e?.code !== "auth/network-request-failed") {
          console.error(
            "Error setting Firebase ID token in Supabase fetch:",
            e,
          );
        }
      }

      let response = await fetch(url, options);

      // Handle clock skew between Firebase and Supabase ("JWT issued at future")
      if (response.status === 401) {
        const clone = response.clone();
        try {
          const data = await clone.json();
          if (
            data?.code === "PGRST303" &&
            data?.message === "JWT issued at future"
          ) {
            console.warn("JWT clock skew detected. Retrying in 1.5s...");
            await new Promise((resolve) => setTimeout(resolve, 1500));
            // Ensure token is still valid or get a new one (getIdToken will return cached if valid)
            const user = auth.currentUser;
            if (user) {
              const token = await user.getIdToken();
              const headers = new Headers(options.headers);
              headers.set("Authorization", `Bearer ${token}`);
              options.headers = headers;
            }
            response = await fetch(url, options);
          }
        } catch (e) {
          // Ignore error parsing response body
        }
      }

      return response;
    },
  },
});
