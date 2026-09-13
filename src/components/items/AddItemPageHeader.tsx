import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { ADD_ITEM_CONSTANTS } from "../../constants/items";

export interface AddItemPageHeaderProps {
  onBack: () => void;
  onCamera?: () => void;
  onRemoveImage?: () => void;
  title?: string;
  imageUri?: string | null;
}

/**
 * Full-screen Add Item page header.
 * Back arrow (left) · Title (center-left) · Camera icon (right).
 * No settings cog — intentionally omitted as per design.
 */
export const AddItemPageHeader: React.FC<AddItemPageHeaderProps> = ({
  onBack,
  onCamera,
  onRemoveImage,
  title = ADD_ITEM_CONSTANTS.HEADER_TITLE,
  imageUri,
}) => {
  return (
    <SafeAreaView
      edges={["top"]}
      className="bg-surface border-b border-border/40"
    >
      <View className="flex-row items-center px-4 py-3 bg-surface">
        {/* Back Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          className="p-2 -ml-2 rounded-full active:bg-background"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>

        {/* Title */}
        <Text
          className="flex-1 ml-3 text-lg font-bold text-text"
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* Right side: image preview (if any) + camera icon */}
        <View className="flex-row items-center gap-2">
          {/* Image thumbnail — tap to remove */}
          {imageUri ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onRemoveImage}
              className="w-10 h-10 rounded-lg overflow-hidden border border-border justify-center items-center relative"
              accessibilityLabel="Remove photo"
            >
              <Image
                source={{ uri: imageUri }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
              <View className="absolute inset-0 bg-black/40 justify-center items-center">
                <Feather name="x" size={16} color="white" />
              </View>
            </TouchableOpacity>
          ) : null}

          {/* Camera icon — always visible */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onCamera}
            className="p-2 rounded-full active:bg-background"
            accessibilityLabel="Add photo"
          >
            <Ionicons name="camera-outline" size={24} color="#0EA5E9" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddItemPageHeader;
