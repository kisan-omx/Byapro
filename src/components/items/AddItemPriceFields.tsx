import React from "react";
import { View, Text, TextInput } from "react-native";
import { ADD_ITEM_CONSTANTS } from "../../constants/items";

interface PriceFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  returnKeyType?: "next" | "done";
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
  autoFocus?: boolean;
}

const PriceField: React.FC<PriceFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder = "0",
  required = false,
  returnKeyType = "next",
  onSubmitEditing,
  inputRef,
  autoFocus = false,
}) => (
  <View className="flex-1">
    <Text className="text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
      {label}
      {required && <Text className="text-error"> *</Text>}
    </Text>
    <TextInput
      ref={inputRef}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      keyboardType="decimal-pad"
      autoCorrect={false}
      autoFocus={autoFocus}
      returnKeyType={returnKeyType}
      onSubmitEditing={onSubmitEditing}
      className="bg-background border border-border/90 rounded-xl px-4 py-3.5 text-sm text-text font-medium"
    />
  </View>
);

export interface AddItemPriceFieldsProps {
  sellingPrice: string;
  onSellingPriceChange: (v: string) => void;
  purchasePrice: string;
  onPurchasePriceChange: (v: string) => void;
  sellingPriceRef?: React.RefObject<TextInput | null>;
  purchasePriceRef?: React.RefObject<TextInput | null>;
  onSellingPriceSubmit?: () => void;
  onPurchasePriceSubmit?: () => void;
}

/**
 * Selling Price + Purchase Price side-by-side row.
 */
export const AddItemPriceFields: React.FC<AddItemPriceFieldsProps> = ({
  sellingPrice,
  onSellingPriceChange,
  purchasePrice,
  onPurchasePriceChange,
  sellingPriceRef,
  purchasePriceRef,
  onSellingPriceSubmit,
  onPurchasePriceSubmit,
}) => (
  <View className="flex-row gap-x-3 mx-4 mt-4">
    <PriceField
      label={ADD_ITEM_CONSTANTS.FORM_LABELS.SELLING_PRICE}
      value={sellingPrice}
      onChangeText={onSellingPriceChange}
      placeholder={ADD_ITEM_CONSTANTS.PLACEHOLDERS.SELLING_PRICE}
      required
      returnKeyType="next"
      onSubmitEditing={onSellingPriceSubmit}
      inputRef={sellingPriceRef}
    />
    <PriceField
      label={ADD_ITEM_CONSTANTS.FORM_LABELS.PURCHASE_PRICE}
      value={purchasePrice}
      onChangeText={onPurchasePriceChange}
      placeholder={ADD_ITEM_CONSTANTS.PLACEHOLDERS.PURCHASE_PRICE}
      returnKeyType="next"
      onSubmitEditing={onPurchasePriceSubmit}
      inputRef={purchasePriceRef}
    />
  </View>
);

export default AddItemPriceFields;
