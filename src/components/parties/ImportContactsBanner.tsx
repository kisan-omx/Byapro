import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { ADD_PARTY_CONSTANTS } from "../../constants/addPartyConstants";

export interface ImportContactsBannerProps {
  onPress: () => void;
}

export const ImportContactsBanner: React.FC<ImportContactsBannerProps> = ({
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="bg-[#FFE4E6] border border-[#FECDD3] rounded-xl p-4 flex-row items-center justify-between shadow-sm my-3 mx-4"
    >
      <View className="flex-row items-center flex-1 mr-2">
        {/* Circular Share / Contact Icon Container */}
        <View className="w-11 h-11 rounded-full bg-white items-center justify-center mr-3 shadow-sm">
          <Ionicons name="person-add" size={20} color="#F43F5E" />
        </View>

        {/* Text Details */}
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-900 leading-tight">
            {ADD_PARTY_CONSTANTS.IMPORT_BANNER.TITLE}
          </Text>
          <Text className="text-xs font-medium text-slate-600 mt-0.5">
            {ADD_PARTY_CONSTANTS.IMPORT_BANNER.SUBTITLE}
          </Text>
        </View>
      </View>

      {/* Right Chevron Arrow */}
      <Feather name="chevron-right" size={22} color="#64748B" />
    </TouchableOpacity>
  );
};

export default ImportContactsBanner;
