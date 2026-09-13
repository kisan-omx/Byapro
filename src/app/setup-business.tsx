import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  StatusBar,
  BackHandler,
  useWindowDimensions,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define structures
interface CountryOption {
  name: string;
  currency: string;
  symbol: string;
}

const CATEGORIES = [
  "Retail Store / E-commerce",
  "Wholesale & Distribution",
  "Construction & Real Estate",
  "Pharmacy & Medical",
  "Clothing & Fashion",
  "Beauty & Wellness",
  "Services & Consulting",
  "Other",
];

const COUNTRIES: CountryOption[] = [
  { name: "Nepal", currency: "NPR", symbol: "रू" },
];

export default function SetupBusinessScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    COUNTRIES[0],
  ); // Default Nepal

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  useEffect(() => {
    const backAction = () => {
      setCancelModalVisible(true);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const handleBack = () => {
    setCancelModalVisible(true);
  };

  const handleConfirmExit = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      // Wait for AuthGuard's timeout to trigger setting user state to null.
      // Once that settles, the AuthGuard will automatically redirect to /auth.
      await new Promise((resolve) => setTimeout(resolve, 250));
    } catch (e) {
      console.error("Error signing out on back press:", e);
      router.replace("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSetup = async () => {
    if (!businessName.trim()) {
      setErrorMsg("Business name is required");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      // Retrieve the current user's UID
      const targetUserId = auth.currentUser?.uid;

      if (!targetUserId) {
        throw new Error("User not authenticated.");
      }

      // Save business to Supabase
      const { data, error } = await supabase
        .from("businesses")
        .insert({
          owner_id: targetUserId,
          name: businessName.trim(),
          category: category || null,
          country: selectedCountry.name,
          currency: selectedCountry.currency,
        })
        .select("id")
        .single();

      if (error) throw error;

      // Write business_id back to users table.
      // Without this, users.business_id stays null forever and
      // getBusinessId() always uses the slow businesses-table fallback
      // on every app open / service call.
      await supabase
        .from("users")
        .update({ business_id: data.id })
        .eq("id", targetUserId);

      // Navigate to tabs layout upon success
      router.replace("/(tabs)/home");
    } catch (e: any) {
      console.warn("Failed to save business details:", e);
      setErrorMsg(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 md:bg-slate-100">
      <StatusBar
        barStyle="dark-content"
        backgroundColor={isLargeScreen ? "#F1F5F9" : "#FFFFFF"}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: isLargeScreen ? "center" : "flex-start",
            alignItems: "center",
            paddingHorizontal: isLargeScreen ? 24 : 0,
            paddingVertical: isLargeScreen ? 40 : 0,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card / Form wrapper */}
          <View
            className={`w-full ${
              isLargeScreen
                ? "bg-white rounded-[32px] border border-slate-200/80 shadow-2xl max-w-[520px] p-8 md:p-10"
                : "bg-white flex-1 p-6 w-full"
            }`}
          >
            {/* Inner Content Container */}
            <View className="w-full">
              {/* Back button */}
              <TouchableOpacity
                onPress={handleBack}
                disabled={loading}
                activeOpacity={0.8}
                className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 items-center justify-center active:bg-slate-100 mb-6"
              >
                <Ionicons name="arrow-back" size={22} color="#0F172A" />
              </TouchableOpacity>

              <Text className="text-3xl font-extrabold text-slate-900 mb-2">
                Set up your business
              </Text>
              <Text className="text-base text-slate-500 mb-8">
                Enter a few details to get started.
              </Text>

              {errorMsg ? (
                <View className="bg-red-50 border border-red-100 rounded-xl p-3 mb-6">
                  <Text className="text-red-600 text-sm">{errorMsg}</Text>
                </View>
              ) : null}

              {/* Business Name Input */}
              <View className="mb-6">
                <TextInput
                  placeholder="Business Name"
                  placeholderTextColor="#94A3B8"
                  value={businessName}
                  onChangeText={(text) => {
                    setBusinessName(text);
                    if (errorMsg) setErrorMsg("");
                  }}
                  className="w-full border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-900 bg-white"
                  style={{
                    textAlignVertical: "center",
                  }}
                />
              </View>

              {/* Category Dropdown Selector */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setCategoryModalVisible(true)}
                className="w-full border border-slate-200 rounded-2xl px-5 py-4 flex-row justify-between items-center bg-white mb-6"
              >
                <Text
                  className={`text-base ${
                    category ? "text-slate-900 font-medium" : "text-slate-400"
                  }`}
                >
                  {category || "Business Category (Optional)"}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>

              {/* Country Dropdown Selector */}
              <View className="mb-6">
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setCountryModalVisible(true)}
                  className="w-full border border-slate-200 rounded-2xl px-5 py-4 flex-row justify-between items-center bg-white"
                >
                  <View className="flex-row items-center">
                    <Text className="text-slate-400 text-base mr-3">
                      Country
                    </Text>
                    <Text className="text-slate-900 text-base font-semibold">
                      {selectedCountry.name}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>
                <Text className="text-xs text-slate-400 mt-2 ml-1 leading-relaxed">
                  This automatically sets your default currency (
                  {selectedCountry.currency}).
                </Text>
              </View>

              {/* Submit Action Button */}
              <View className="mt-14 mb-10">
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleCompleteSetup}
                  disabled={loading || !businessName.trim()}
                  className={`w-full py-4 sm:py-5 rounded-2xl items-center justify-center flex-row ${
                    !businessName.trim() ? "bg-slate-100" : "bg-primary"
                  }`}
                  style={
                    businessName.trim()
                      ? {
                          shadowColor: "#2563EB",
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.2,
                          shadowRadius: 6,
                          elevation: 3,
                        }
                      : undefined
                  }
                >
                  {loading ? (
                    <ActivityIndicator
                      color={!businessName.trim() ? "#94A3B8" : "#FFFFFF"}
                      size="small"
                    />
                  ) : (
                    <Text
                      className={`text-base font-bold tracking-wide ${
                        !businessName.trim() ? "text-slate-400" : "text-white"
                      }`}
                    >
                      Complete Setup
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Selection Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View
          className={`flex-1 ${isLargeScreen ? "justify-center items-center p-6" : "justify-end"}`}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
        >
          <View
            className={`bg-white p-6 pb-10 w-full ${
              isLargeScreen
                ? "rounded-[24px] max-w-[440px] max-h-[80%]"
                : "rounded-t-[32px] max-h-[80%]"
            }`}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-slate-900">
                Select Business Category
              </Text>
              <TouchableOpacity
                onPress={() => setCategoryModalVisible(false)}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={["None (Skip)", ...CATEGORIES]}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected =
                  item === "None (Skip)" ? !category : category === item;
                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setCategory(item === "None (Skip)" ? "" : item);
                      setCategoryModalVisible(false);
                    }}
                    className="py-4 px-4 rounded-xl flex-row justify-between items-center mb-2"
                    style={{
                      backgroundColor: isSelected
                        ? "rgba(219, 234, 254, 0.5)"
                        : "#F8FAFC",
                      borderColor: isSelected ? "#DBEAFE" : "transparent",
                      borderWidth: 1,
                    }}
                  >
                    <Text
                      className={`text-base ${
                        isSelected
                          ? "text-primary font-semibold"
                          : "text-slate-700"
                      }`}
                    >
                      {item}
                    </Text>
                    {isSelected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#2563EB"
                      />
                    ) : null}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Country Selection Modal */}
      <Modal
        visible={countryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <View
          className={`flex-1 ${isLargeScreen ? "justify-center items-center p-6" : "justify-end"}`}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
        >
          <View
            className={`bg-white p-6 pb-10 w-full ${
              isLargeScreen
                ? "rounded-[24px] max-w-[440px] max-h-[80%]"
                : "rounded-t-[32px] max-h-[80%]"
            }`}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-slate-900">
                Select Country
              </Text>
              <TouchableOpacity
                onPress={() => setCountryModalVisible(false)}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.name}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedCountry(item);
                    setCountryModalVisible(false);
                  }}
                  className="py-4 px-4 rounded-xl flex-row justify-between items-center mb-2"
                  style={{
                    backgroundColor:
                      selectedCountry.name === item.name
                        ? "rgba(219, 234, 254, 0.5)"
                        : "#F8FAFC",
                    borderColor:
                      selectedCountry.name === item.name
                        ? "#DBEAFE"
                        : "transparent",
                    borderWidth: 1,
                  }}
                >
                  <View className="flex-row items-center">
                    <Text className="text-slate-800 text-base font-medium mr-2">
                      {item.name}
                    </Text>
                    <Text className="text-slate-400 text-sm">
                      ({item.currency} - {item.symbol})
                    </Text>
                  </View>
                  {selectedCountry.name === item.name ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#2563EB"
                    />
                  ) : null}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Cancel Setup Confirmation Modal */}
      <Modal
        visible={cancelModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View
          className="flex-1 justify-center items-center px-8"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <View className="bg-slate-800 rounded-3xl p-6 w-full max-w-[320px] shadow-2xl">
            <Text className="text-xl font-bold text-white mb-3">
              Cancel Setup?
            </Text>
            <Text className="text-base text-slate-300 mb-6 leading-relaxed">
              If you go back now, your login will be canceled. Are you sure you
              want to exit?
            </Text>
            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={() => setCancelModalVisible(false)}
                activeOpacity={0.7}
                className="px-2 py-1 mr-6"
              >
                <Text className="text-sm font-bold text-teal-400 tracking-wider">
                  CONTINUE SETUP
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  setCancelModalVisible(false);
                  await handleConfirmExit();
                }}
                activeOpacity={0.7}
                className="px-2 py-1"
              >
                <Text className="text-sm font-bold text-teal-400 tracking-wider">
                  EXIT
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
