import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from "firebase/auth";
// @ts-ignore
import { getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import googleServices from "../../google-services.json";

// Extract configuration from google-services.json
const client = googleServices.client[0];
const projectInfo = googleServices.project_info;

export const firebaseConfig = {
  apiKey: client.api_key[0].current_key,
  appId: client.client_info.mobilesdk_app_id,
  projectId: projectInfo.project_id,
  messagingSenderId: projectInfo.project_number,
  storageBucket: projectInfo.storage_bucket,
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: Platform.OS === "web" 
      ? undefined 
      : getReactNativePersistence(AsyncStorage),
  });
} catch {
  authInstance = getAuth(app);
}

export const auth = authInstance;

export { GoogleAuthProvider, signInWithCredential, signOut };
