import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ADD_ITEM_CONSTANTS } from '../../constants/items';

export interface AddItemNameFieldProps {
  value: string;
  onChangeText: (v: string) => void;
  unit: string;
  onSelectUnit: () => void;
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
}

/**
 * Item Name field with a stable fixed-height bordered container.
 * Label is always pinned small at the top — no floating animation,
 * so typing never triggers a height change or layout reflow.
 * Only the border colour changes on focus.
 */
export const AddItemNameField: React.FC<AddItemNameFieldProps> = ({
  value,
  onChangeText,
  unit,
  onSelectUnit,
  onSubmitEditing,
  autoFocus = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mx-4 mt-4 mb-4">
      {/* Bordered container — fixed height so typing never resizes it */}
      <View
        className={`flex-row items-center border rounded-xl px-3 bg-surface ${
          isFocused ? 'border-primary' : 'border-border'
        }`}
        style={{ height: 60 }}
      >
        {/* Label + Input stacked vertically */}
        <View className="flex-1 justify-center" style={{ height: 60 }}>
          {/* Label — only at top if focused or has value */}
          {(isFocused || value) ? (
            <Text
              className={`text-xs font-medium ${
                isFocused ? 'text-primary' : 'text-text-secondary'
              }`}
              style={{ lineHeight: 14, marginBottom: 2 }}
            >
              {ADD_ITEM_CONSTANTS.FORM_LABELS.ITEM_NAME}
              {'  '}
              <Text className="text-error">*</Text>
            </Text>
          ) : null}

          {/* Text input — fixed below the label */}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={
              (isFocused || value)
                ? undefined
                : ADD_ITEM_CONSTANTS.FORM_LABELS.ITEM_NAME + ' *'
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
              (isFocused || value)
                ? { height: 24, lineHeight: 20 }
                : { height: 60, textAlignVertical: 'center' }
            }
          />
        </View>

        {/* Select Unit pill button — vertically centred */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSelectUnit}
          className="ml-3 bg-slate-100 border border-slate-200 rounded-full px-3.5 py-1.5"
          accessibilityLabel="Select unit of measurement"
        >
          <Text className="text-xs font-semibold text-text-secondary">
            {unit ? unit : ADD_ITEM_CONSTANTS.FORM_LABELS.SELECT_UNIT}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddItemNameField;

