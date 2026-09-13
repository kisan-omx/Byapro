import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ADD_PARTY_CONSTANTS } from "../../constants/addPartyConstants";

export interface AddPartyHeaderProps {
  onBack: () => void;
  title?: string;
}

export const AddPartyHeader: React.FC<AddPartyHeaderProps> = ({
  onBack,
  title = ADD_PARTY_CONSTANTS.HEADER_TITLE,
}) => {
  return (
    <View className="flex-row items-center px-4 py-3 bg-surface border-b border-border/40">
      {/* Back Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onBack}
        className="p-2 -ml-2 rounded-full active:bg-background"
        accessibilityLabel="Go back"
      >
        <Feather name="arrow-left" size={24} color="#0F172A" />
      </TouchableOpacity>

      {/* Header Title (Centered / Left Aligned) */}
      <Text
        className="flex-1 ml-3 text-lg font-bold text-text"
        numberOfLines={1}
      >
        {title}
      </Text>

      {/* Right side intentionally empty - NO settings cog icon as requested */}
    </View>
  );
};

export default AddPartyHeader;
