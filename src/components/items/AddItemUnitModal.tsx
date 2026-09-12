import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ADD_ITEM_CONSTANTS } from '../../constants/items';

export interface AddItemUnitModalProps {
  visible: boolean;
  selectedUnit: string;
  units: string[];
  onSelect: (unit: string) => void;
  onClose: () => void;
}

/**
 * Bottom-sheet modal for selecting a unit of measurement.
 * Pill chips matching the existing UnitSelector design.
 */
export const AddItemUnitModal: React.FC<AddItemUnitModalProps> = ({
  visible,
  selectedUnit,
  units,
  onSelect,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/40 justify-end"
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="bg-surface rounded-t-2xl"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-slate-300" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-3 border-b border-border/60">
            <Text className="text-base font-bold text-text">
              {ADD_ITEM_CONSTANTS.FORM_LABELS.SELECT_UNIT}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Feather name="x" size={22} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* Unit grid */}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              padding: 16,
              paddingBottom: 32,
              gap: 10,
            }}
          >
            {units.map((unit) => {
              const isSelected = selectedUnit === unit;
              return (
                <TouchableOpacity
                  key={unit}
                  onPress={() => onSelect(unit)}
                  activeOpacity={0.75}
                  className={`px-4 py-2.5 rounded-full border ${
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'bg-slate-100/90 border-slate-200/80'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      isSelected ? 'text-white' : 'text-slate-700'
                    }`}
                  >
                    {unit}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default AddItemUnitModal;
