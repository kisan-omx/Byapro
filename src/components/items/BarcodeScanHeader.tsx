import React, { useState, useRef } from "react";
import { View, TextInput, TouchableOpacity, Text, TouchableWithoutFeedback } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export interface BarcodeScanHeaderProps {
  code: string;
  onCodeChange: (code: string) => void;
  onSearch: () => void;
  onBack: () => void;
}

const BarcodeScanHeader: React.FC<BarcodeScanHeaderProps> = ({
  code,
  onCodeChange,
  onSearch,
  onBack,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  return (
    <SafeAreaView
      edges={["top"]}
      className="bg-surface"
      style={{ borderBottomWidth: 1, borderBottomColor: "rgba(148,163,184,0.2)" }}
    >
      {/* Title row */}
      <View className="flex-row items-center px-2 pt-1.5 pb-1">
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          className="p-2 mr-1 rounded-xl"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-[17px] font-bold text-text tracking-tight">
          Barcode Scanning
        </Text>
      </View>

      {/* Outlined Item Code field with Search button INSIDE */}
      <View className="px-4 pb-4 pt-2">
        <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
          <View
            className="flex-row items-center bg-background rounded-2xl overflow-visible"
            style={{
              borderWidth: 1.5,
              borderColor: isFocused ? "#3B82F6" : "#E2E8F0",
              shadowColor: isFocused ? "#3B82F6" : "transparent",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: isFocused ? 0.12 : 0,
              shadowRadius: 6,
              elevation: isFocused ? 2 : 0,
            }}
          >
            {/* Floating label */}
            <Text
              pointerEvents="none"
              style={{ position: "absolute", top: -10, left: 14, zIndex: 10 }}
              className={`px-1.5 text-xs font-semibold bg-background ${isFocused ? "text-primary" : "text-slate-500"}`}
            >
              Item Code
            </Text>

            {/* Text input */}
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={onCodeChange}
              placeholder="Enter or scan code"
              placeholderTextColor="#CBD5E1"
              className="flex-1 text-sm text-text font-medium"
              style={{ paddingVertical: 13, paddingHorizontal: 16 }}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={onSearch}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />

            {/* Divider */}
            <View className="w-px h-9 bg-slate-200" />

            {/* Search button right inside the field */}
            <TouchableOpacity
              onPress={onSearch}
              activeOpacity={0.8}
              className="px-5 py-3.5"
            >
              <Text className="text-sm font-bold text-primary">
                Search
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </SafeAreaView>
  );
};

export default BarcodeScanHeader;
