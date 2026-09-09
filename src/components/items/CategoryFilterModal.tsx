import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface CategoryFilterModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Category filter modal — placeholder UI.
 * A dedicated category column does not exist on the items table yet.
 * This modal is shown when the user taps the Category chip.
 */
export const CategoryFilterModal: React.FC<CategoryFilterModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/40 justify-end"
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="bg-surface rounded-t-2xl overflow-hidden"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-slate-300" />
          </View>

          {/* Title row */}
          <View className="flex-row items-center justify-between px-5 py-3 border-b border-border/60">
            <Text className="text-base font-bold text-text">Filter by Category</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Feather name="x" size={20} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* Coming soon state */}
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <View className="py-14 px-8 items-center justify-center">
              <View className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200/80 items-center justify-center mb-4">
                <Feather name="tag" size={28} color="#94A3B8" />
              </View>
              <Text className="text-base font-bold text-text mb-1 text-center">
                Categories Coming Soon
              </Text>
              <Text className="text-xs font-medium text-text-secondary text-center px-4">
                Category filtering will be available once item categories are set up.
              </Text>
            </View>
            <View className="h-8" />
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default CategoryFilterModal;
