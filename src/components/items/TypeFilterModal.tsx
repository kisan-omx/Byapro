import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TypeFilterType } from '../../types/item';
import { UNIT_OPTIONS } from '../../constants/items';

export interface TypeFilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedFilter: TypeFilterType;
  onSelectFilter: (filter: TypeFilterType) => void;
}

/**
 * Modal for filtering items by unit/type (PCS, KG, BTL, etc.).
 * "All" resets the type filter.
 */
export const TypeFilterModal: React.FC<TypeFilterModalProps> = ({
  visible,
  onClose,
  selectedFilter,
  onSelectFilter,
}) => {
  const handleSelect = (filter: TypeFilterType) => {
    onSelectFilter(filter);
    onClose();
  };

  const options: { id: TypeFilterType; label: string }[] = [
    { id: 'all', label: 'All Types' },
    ...UNIT_OPTIONS.map((unit) => ({ id: unit, label: unit })),
  ];

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
            <Text className="text-base font-bold text-text">Filter by Type</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Feather name="x" size={20} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 360 }}
          >
            {options.map((option) => {
              const isSelected = selectedFilter === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleSelect(option.id)}
                  activeOpacity={0.75}
                  className={`flex-row items-center justify-between px-5 py-4 border-b border-border/40 ${
                    isSelected ? 'bg-primary-light' : ''
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      isSelected ? 'text-primary' : 'text-text'
                    }`}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <Feather name="check" size={18} color="#0EA5E9" />
                  )}
                </TouchableOpacity>
              );
            })}
            {/* Bottom safe area padding */}
            <View className="h-8" />
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default TypeFilterModal;
