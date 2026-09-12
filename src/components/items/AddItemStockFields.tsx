import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { ADD_ITEM_CONSTANTS } from '../../constants/items';

interface StockFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
}

const StockField: React.FC<StockFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder = '0',
  returnKeyType = 'next',
  onSubmitEditing,
  inputRef,
}) => (
  <View className="flex-1">
    <Text className="text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
      {label}
    </Text>
    <TextInput
      ref={inputRef}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      keyboardType="decimal-pad"
      autoCorrect={false}
      returnKeyType={returnKeyType}
      onSubmitEditing={onSubmitEditing}
      className="bg-background border border-border/90 rounded-xl px-4 py-3.5 text-sm text-text font-medium"
    />
  </View>
);

export interface AddItemStockFieldsProps {
  stockQuantity: string;
  onStockQuantityChange: (v: string) => void;
  lowStockAlert: string;
  onLowStockAlertChange: (v: string) => void;
  stockQtyRef?: React.RefObject<TextInput | null>;
  lowStockRef?: React.RefObject<TextInput | null>;
  onStockQtySubmit?: () => void;
  onLowStockSubmit?: () => void;
}

/**
 * Opening Stock + Low Stock Alert side-by-side row.
 */
export const AddItemStockFields: React.FC<AddItemStockFieldsProps> = ({
  stockQuantity,
  onStockQuantityChange,
  lowStockAlert,
  onLowStockAlertChange,
  stockQtyRef,
  lowStockRef,
  onStockQtySubmit,
  onLowStockSubmit,
}) => (
  <View className="flex-row gap-x-3 mx-4 mt-4">
    <StockField
      label={ADD_ITEM_CONSTANTS.FORM_LABELS.OPENING_STOCK}
      value={stockQuantity}
      onChangeText={onStockQuantityChange}
      placeholder={ADD_ITEM_CONSTANTS.PLACEHOLDERS.OPENING_STOCK}
      returnKeyType="next"
      onSubmitEditing={onStockQtySubmit}
      inputRef={stockQtyRef}
    />
    <StockField
      label={ADD_ITEM_CONSTANTS.FORM_LABELS.LOW_STOCK_ALERT}
      value={lowStockAlert}
      onChangeText={onLowStockAlertChange}
      placeholder={ADD_ITEM_CONSTANTS.PLACEHOLDERS.LOW_STOCK_ALERT}
      returnKeyType="next"
      onSubmitEditing={onLowStockSubmit}
      inputRef={lowStockRef}
    />
  </View>
);

export default AddItemStockFields;
