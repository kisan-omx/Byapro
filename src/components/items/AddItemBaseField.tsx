import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from "react-native";

export interface AddItemBaseFieldProps extends TextInputProps {
  label: string;
  required?: boolean;
  rightAction?: React.ReactNode;
  containerStyle?: ViewStyle;
  style?: any;
  className?: string;
}

/**
 * Reusable input field matching the AddItemNameField style.
 * Fixed height bordered container with the label pinned small at the top.
 */
export const AddItemBaseField: React.FC<AddItemBaseFieldProps> = ({
  label,
  required,
  rightAction,
  containerStyle,
  style,
  className,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[containerStyle, style]} className={className}>
      <View
        className={`flex-row items-center border rounded-xl px-3 bg-surface ${
          isFocused ? "border-primary" : "border-border"
        }`}
        style={{ height: 60 }}
      >
        {/* Label + Input stacked vertically */}
        <View className="flex-1 justify-center" style={{ height: 60 }}>
          {/* Label — only show at top if focused or has value */}
          {isFocused || textInputProps.value ? (
            <Text
              className={`text-xs font-medium ${
                isFocused ? "text-primary" : "text-text-secondary"
              }`}
              style={{ lineHeight: 14, marginBottom: 2 }}
            >
              {label}
              {required && <Text className="text-error"> *</Text>}
            </Text>
          ) : null}

          {/* Text input */}
          <TextInput
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            placeholder={
              isFocused || textInputProps.value
                ? textInputProps.placeholder
                : label + (required ? " *" : "")
            }
            placeholderTextColor="#94A3B8"
            className="text-sm font-medium text-text p-0 m-0"
            style={
              isFocused || textInputProps.value
                ? { height: 24, lineHeight: 20 }
                : { height: 60, textAlignVertical: "center" }
            }
            {...textInputProps}
          />
        </View>

        {/* Optional Right Action (e.g. Button or Icon) */}
        {rightAction && <View className="ml-3">{rightAction}</View>}
      </View>
    </View>
  );
};

export default AddItemBaseField;
