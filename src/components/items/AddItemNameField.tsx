import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { ADD_ITEM_CONSTANTS, getUnitShortName } from "../../constants/items";

export interface AddItemNameFieldProps {
  value: string;
  onChangeText: (v: string) => void;
  unit: string;
  secondaryUnit?: string;
  conversionRate?: string;
  onSelectUnit: () => void;
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
}

/**
 * Item Name field with a stable fixed-height bordered container.
 * Shows "Select Unit" pill when no unit is set, "Edit Unit" when unit is set.
 * Shows conversion rate formula just below the field when both units and rate are set.
 */
export const AddItemNameField: React.FC<AddItemNameFieldProps> = ({
  value,
  onChangeText,
  unit,
  secondaryUnit,
  conversionRate,
  onSelectUnit,
  onSubmitEditing,
  autoFocus = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const hasUnit = !!unit;
  const showFormula = hasUnit && !!secondaryUnit && !!conversionRate?.trim();
  const primaryShort = getUnitShortName(unit);
  const secondaryShort = getUnitShortName(secondaryUnit);

  return (
    <View className="mx-4 mt-4 mb-4">
      {/* Bordered container — fixed height so typing never resizes it */}
      <View
        className={`flex-row items-center border rounded-xl px-3 bg-surface ${
          isFocused ? "border-primary" : "border-border"
        }`}
        style={{ height: 60 }}
      >
        {/* Label + Input stacked vertically */}
        <View className="flex-1 justify-center" style={{ height: 60 }}>
          {/* Label — only at top if focused or has value */}
          {isFocused || value ? (
            <Text
              className={`text-xs font-medium ${
                isFocused ? "text-primary" : "text-text-secondary"
              }`}
              style={{ lineHeight: 14, marginBottom: 2 }}
            >
              {ADD_ITEM_CONSTANTS.FORM_LABELS.ITEM_NAME}
              {"  "}
              <Text className="text-error">*</Text>
            </Text>
          ) : null}

          {/* Text input — fixed below the label */}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={
              isFocused || value
                ? undefined
                : ADD_ITEM_CONSTANTS.FORM_LABELS.ITEM_NAME + " *"
            }
            placeholderTextColor="#94A3B8"
            autoCapitalize="words"
            autoCorrect={false}
            autoFocus={autoFocus}
            returnKeyType="next"
            onSubmitEditing={onSubmitEditing}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="text-sm font-medium text-text p-0 m-0"
            style={
              isFocused || value
                ? { height: 24, lineHeight: 20 }
                : { height: 60, textAlignVertical: "center" }
            }
          />
        </View>

        {/* Unit button — "Select Unit" or "Edit Unit" */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSelectUnit}
          className={`ml-3 rounded-full px-3.5 py-1.5 border ${
            hasUnit
              ? "bg-primary/10 border-primary/30"
              : "bg-slate-100 border-slate-200"
          }`}
          accessibilityLabel="Select unit of measurement"
        >
          <Text
            className={`text-xs font-semibold ${hasUnit ? "text-primary" : "text-text-secondary"}`}
          >
            {hasUnit ? "Edit Unit" : ADD_ITEM_CONSTANTS.FORM_LABELS.SELECT_UNIT}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conversion Rate Formula — shown below item name field when both units & rate are set */}
      {showFormula ? (
        <Text className="text-xs font-semibold text-text-secondary text-right mt-1.5 mr-1">
          1 {primaryShort || unit} = {conversionRate!.trim()}{" "}
          {secondaryShort || secondaryUnit}
        </Text>
      ) : null}
    </View>
  );
};

export default AddItemNameField;
