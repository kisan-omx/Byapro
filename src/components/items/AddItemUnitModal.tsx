import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { ADD_ITEM_CONSTANTS, getUnitShortName } from "../../constants/items";
import { SelectUnitModal } from "./SelectUnitModal";
import { AddItemPageFooter } from "./AddItemPageFooter";

export interface AddItemUnitModalProps {
  visible: boolean;
  selectedUnit: string;
  selectedSecondaryUnit?: string;
  selectedConversionRate?: string;
  units: string[];
  onSelect: (
    unit: string,
    secondaryUnit: string,
    conversionRate?: string,
  ) => void;
  onClose: () => void;
}

export const AddItemUnitModal: React.FC<AddItemUnitModalProps> = ({
  visible,
  selectedUnit,
  selectedSecondaryUnit = "",
  selectedConversionRate = "",
  units,
  onSelect,
  onClose,
}) => {
  const [localUnit, setLocalUnit] = useState(selectedUnit);
  const [localSecondary, setLocalSecondary] = useState(selectedSecondaryUnit);
  const [localConversionRate, setLocalConversionRate] = useState(
    selectedConversionRate,
  );
  const [unitList, setUnitList] = useState<string[]>(units);
  const [activePicker, setActivePicker] = useState<
    "primary" | "secondary" | null
  >(null);

  useEffect(() => {
    if (visible) {
      setLocalUnit(selectedUnit);
      setLocalSecondary(selectedSecondaryUnit);
      setLocalConversionRate(selectedConversionRate);
      setUnitList(units);
      setActivePicker(null);
    }
  }, [
    visible,
    selectedUnit,
    selectedSecondaryUnit,
    selectedConversionRate,
    units,
  ]);

  const handleSave = () => {
    onSelect(localUnit, localSecondary, localConversionRate);
  };

  const handlePickerSelect = (unit: string) => {
    if (activePicker === "primary") {
      const newUnit = localUnit === unit ? "" : unit;
      setLocalUnit(newUnit);
      if (!newUnit) {
        setLocalSecondary("");
        setLocalConversionRate("");
      }
    } else if (activePicker === "secondary") {
      const newSec = localSecondary === unit ? "" : unit;
      setLocalSecondary(newSec);
      if (!newSec) {
        setLocalConversionRate("");
      }
    }
    setActivePicker(null);
  };

  const handleAddNewUnit = (fullName: string, shortName: string) => {
    const full = fullName.trim().toUpperCase();
    if (full && !unitList.includes(full)) {
      setUnitList((prev) => [...prev, full]);
    }
  };

  const primaryShort = getUnitShortName(localUnit);
  const secondaryShort = getUnitShortName(localSecondary);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView
        className="flex-1 bg-surface"
        edges={["top", "bottom", "left", "right"]}
      >
        <View
          style={{ flex: 1, maxWidth: 640, width: "100%", alignSelf: "center" }}
        >
          {/* Header */}
          <View className="flex-row items-center px-4 py-3 bg-surface border-b border-slate-100">
            <TouchableOpacity
              onPress={onClose}
              className="p-2 -ml-2 mr-3"
              accessibilityLabel="Back"
            >
              <Feather name="arrow-left" size={24} color="#1E293B" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-text flex-1">
              {ADD_ITEM_CONSTANTS.FORM_LABELS.SELECT_UNIT_TITLE}
            </Text>
          </View>

          {/* Keyboard Avoiding Body */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            <ScrollView
              className="flex-1 px-5 pt-6 bg-surface"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
            >
              {/* Primary Unit Field */}
              <View className="mb-6 relative">
                {/* Floating Notch Label */}
                <View className="absolute -top-2.5 left-3 px-1 bg-surface z-10">
                  <Text className="text-xs font-semibold text-slate-500">
                    Primary Unit
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setActivePicker("primary")}
                  className="flex-row items-center justify-between border border-slate-200 rounded-xl px-4 py-3.5 bg-surface"
                  style={{ minHeight: 56 }}
                >
                  <Text
                    className={`text-base font-semibold ${localUnit ? "text-text" : "text-slate-400"}`}
                  >
                    {localUnit || "Select Primary Unit"}
                  </Text>
                  <Feather name="chevron-right" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Secondary Unit Field */}
              <View className="mb-6 relative">
                {/* Floating Notch Label */}
                <View className="absolute -top-2.5 left-3 px-1 bg-surface z-10">
                  <Text className="text-xs font-semibold text-slate-500">
                    Secondary Unit
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setActivePicker("secondary")}
                  className="flex-row items-center justify-between border border-slate-200 rounded-xl px-4 py-3.5 bg-surface"
                  style={{ minHeight: 56 }}
                >
                  <Text
                    className={`text-base font-semibold ${localSecondary ? "text-text" : "text-slate-400"}`}
                  >
                    {localSecondary || "Select Secondary Unit"}
                  </Text>
                  <Feather name="chevron-right" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Conversion Rate Field (Shown if Secondary Unit is selected) */}
              {localSecondary ? (
                <View className="mb-6 relative">
                  {/* Floating Notch Label */}
                  <View className="absolute -top-2.5 left-3 px-1 bg-surface z-10">
                    <Text className="text-xs font-semibold text-slate-500">
                      Conversion Rate
                    </Text>
                  </View>
                  <View
                    className="flex-row items-center border border-slate-200 rounded-xl px-4 py-3 bg-surface"
                    style={{ minHeight: 56 }}
                  >
                    <TextInput
                      value={localConversionRate}
                      onChangeText={setLocalConversionRate}
                      placeholder="e.g. 22"
                      placeholderTextColor="#94A3B8"
                      keyboardType="decimal-pad"
                      className="flex-1 text-base font-semibold text-text p-0 m-0"
                    />
                  </View>
                </View>
              ) : null}

              {/* Live Conversion Rate Formula Indicator */}
              {localUnit && localSecondary && localConversionRate.trim() ? (
                <View className="flex-row items-center mt-1 mb-6 px-1 flex-wrap">
                  <Text className="text-base font-bold text-slate-700">
                    1 {primaryShort || localUnit}{" "}
                    <Text className="text-slate-500 font-semibold">
                      = {localConversionRate.trim()}{" "}
                      {secondaryShort || localSecondary}
                    </Text>
                  </Text>
                </View>
              ) : null}
            </ScrollView>

            {/* Footer Actions */}
            <AddItemPageFooter onCancel={onClose} onSave={handleSave} />
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>

      {/* Reusable Unit Picker Sheet */}
      <SelectUnitModal
        visible={activePicker !== null}
        title={
          activePicker === "primary"
            ? "Select Primary Unit"
            : "Select Secondary Unit"
        }
        selectedUnit={activePicker === "primary" ? localUnit : localSecondary}
        units={unitList}
        onSelect={handlePickerSelect}
        onClose={() => setActivePicker(null)}
        onAddNewUnit={handleAddNewUnit}
      />
    </Modal>
  );
};

export default AddItemUnitModal;
