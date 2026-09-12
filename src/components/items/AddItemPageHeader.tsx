import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { ADD_ITEM_CONSTANTS } from '../../constants/items';

export interface AddItemPageHeaderProps {
  onBack: () => void;
  onCamera?: () => void;
  title?: string;
}

/**
 * Full-screen Add Item page header.
 * Back arrow (left) · Title (center-left) · Camera icon (right).
 * No settings cog — intentionally omitted as per design.
 */
export const AddItemPageHeader: React.FC<AddItemPageHeaderProps> = ({
  onBack,
  onCamera,
  title = ADD_ITEM_CONSTANTS.HEADER_TITLE,
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

      {/* Title */}
      <Text className="flex-1 ml-3 text-lg font-bold text-text" numberOfLines={1}>
        {title}
      </Text>

      {/* Camera Icon (right) */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onCamera}
        className="p-2 rounded-full active:bg-background"
        accessibilityLabel="Add photo"
      >
        <Ionicons name="camera-outline" size={24} color="#0EA5E9" />
      </TouchableOpacity>
    </View>
  );
};

export default AddItemPageHeader;
