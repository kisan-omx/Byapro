import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { registerCustomUnit } from '../../constants/items';

export interface SelectUnitModalProps {
  visible: boolean;
  title: string;
  selectedUnit: string;
  units: string[];
  onSelect: (unit: string) => void;
  onClose: () => void;
  onAddNewUnit?: (fullName: string, shortName: string) => void;
}

export const SelectUnitModal: React.FC<SelectUnitModalProps> = ({
  visible,
  title,
  selectedUnit,
  units,
  onSelect,
  onClose,
  onAddNewUnit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [fullNameInput, setFullNameInput] = useState('');
  const [shortNameInput, setShortNameInput] = useState('');

  const filteredUnits = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return units;
    return units.filter((u) => u.toLowerCase().includes(query));
  }, [units, searchQuery]);

  const handleSelect = (unit: string) => {
    onSelect(unit);
    setSearchQuery('');
    setIsAddingCustom(false);
  };

  const handleSaveCustomUnit = () => {
    const full = fullNameInput.trim().toUpperCase();
    const short = shortNameInput.trim() || full;
    if (full) {
      registerCustomUnit(full, short);
      if (onAddNewUnit) {
        onAddNewUnit(full, short);
      }
      onSelect(full);
      setFullNameInput('');
      setShortNameInput('');
      setIsAddingCustom(false);
      setSearchQuery('');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-end"
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-surface rounded-t-3xl max-h-[85%]"
            style={{ maxWidth: 640, width: '100%', alignSelf: 'center' }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle Bar */}
            <View className="items-center pt-3 pb-1">
              <View className="w-12 h-1.5 rounded-full bg-slate-300" />
            </View>

            {/* Header Title */}
            <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
              <Text className="text-lg font-bold text-text flex-1">{title}</Text>
              <TouchableOpacity onPress={onClose} className="p-1" accessibilityLabel="Close">
                <Feather name="x" size={22} color="#475569" />
              </TouchableOpacity>
            </View>

            {/* Search Input Box */}
            <View className="px-5 mb-3">
              <View className="flex-row items-center border border-border/80 rounded-xl px-3 py-2 bg-background">
                <Feather name="search" size={18} color="#94A3B8" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search Unit"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  className="flex-1 ml-2 text-sm font-medium text-text p-0"
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Feather name="x" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Unit List */}
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              className="px-5"
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              {filteredUnits.map((unit) => {
                const isSelected = selectedUnit === unit;
                return (
                  <TouchableOpacity
                    key={unit}
                    onPress={() => handleSelect(unit)}
                    activeOpacity={0.7}
                    className="flex-row items-center justify-between py-3.5 border-b border-border/30"
                  >
                    <Text
                      className={`text-base font-semibold tracking-wide ${
                        isSelected ? 'text-primary' : 'text-text'
                      }`}
                    >
                      {unit}
                    </Text>

                    {/* Radio Button Indicator */}
                    <View
                      className={`w-5 h-5 rounded-full items-center justify-center ${
                        isSelected
                          ? 'border-2 border-primary bg-surface'
                          : 'border border-slate-300'
                      }`}
                    >
                      {isSelected ? (
                        <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {filteredUnits.length === 0 ? (
                <View className="py-8 items-center justify-center">
                  <Text className="text-sm text-text-secondary">
                    No units found matching &quot;{searchQuery}&quot;
                  </Text>
                </View>
              ) : null}
            </ScrollView>

            {/* Bottom Button: + Add New Unit */}
            <View className="p-5 border-t border-border/40 bg-surface">
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setIsAddingCustom(true)}
                className="bg-primary rounded-xl py-3.5 items-center justify-center flex-row shadow-sm"
              >
                <Feather name="plus" size={18} color="#FFFFFF" />
                <Text className="text-white font-semibold text-base ml-1.5">
                  Add New Unit
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* Add New Unit Dialog Popup */}
      <Modal
        visible={isAddingCustom}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddingCustom(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <TouchableOpacity
            className="flex-1 bg-black/60 justify-center items-center px-4"
            activeOpacity={1}
            onPress={() => setIsAddingCustom(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              className="bg-surface rounded-2xl p-6 shadow-xl"
              style={{ maxWidth: 400, width: '100%', alignSelf: 'center' }}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Title */}
              <Text className="text-lg font-bold text-text mb-4">
                Add New Unit
              </Text>

              {/* Underlined Inputs Row: Full name & Shortname */}
              <View className="flex-row gap-x-4 mb-2">
                <View className="flex-1">
                  <TextInput
                    value={fullNameInput}
                    onChangeText={setFullNameInput}
                    placeholder="Full name"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="characters"
                    autoFocus
                    className="border-b border-slate-300 py-1.5 text-sm font-medium text-text"
                  />
                </View>

                <View className="flex-1">
                  <TextInput
                    value={shortNameInput}
                    onChangeText={setShortNameInput}
                    placeholder="Shortname"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="words"
                    className="border-b border-slate-300 py-1.5 text-sm font-medium text-text"
                  />
                </View>
              </View>

              {/* Red Warning Notice */}
              <Text className="text-xs font-semibold text-red-600 mt-2 mb-6">
                This Unit cannot be deleted.
              </Text>

              {/* Right-aligned Buttons: CANCEL  SAVE */}
              <View className="flex-row justify-end items-center">
                <TouchableOpacity
                  onPress={() => {
                    setFullNameInput('');
                    setShortNameInput('');
                    setIsAddingCustom(false);
                  }}
                  className="mr-6 py-1 px-2"
                >
                  <Text className="text-primary font-bold text-sm tracking-wider">
                    CANCEL
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveCustomUnit}
                  className="py-1 px-2"
                >
                  <Text className="text-primary font-bold text-sm tracking-wider">
                    SAVE
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </Modal>
  );
};

export default SelectUnitModal;
