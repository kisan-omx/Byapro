import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ADD_ITEM_CONSTANTS } from "../../constants/items";

export interface AddItemPageFooterProps {
  onCancel: () => void;
  onSave: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Cancel / Save footer for the Add Item full-screen page.
 * Cancel: plain text, left half.
 * Save: primary background, right half — greyed when disabled.
 * Same two-column pattern as AddPartyFooter.
 */
export const AddItemPageFooter: React.FC<AddItemPageFooterProps> = ({
  onCancel,
  onSave,
  loading = false,
  disabled = false,
}) => {
  const saveDisabled = loading || disabled;

  return (
    <SafeAreaView
      edges={["bottom"]}
      className="bg-surface border-t border-border"
    >
      <View className="flex-row items-center justify-between bg-surface">
        {/* Cancel */}
        <TouchableOpacity
          onPress={onCancel}
          disabled={loading}
          className={`flex-1 py-4 items-center justify-center bg-surface ${
            loading ? "opacity-50" : "active:bg-slate-100"
          }`}
          activeOpacity={0.7}
          accessibilityLabel="Cancel"
        >
          <Text className="text-slate-600 text-base font-bold">
            {ADD_ITEM_CONSTANTS.BUTTONS.CANCEL}
          </Text>
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity
          onPress={onSave}
          disabled={saveDisabled}
          className={`flex-1 py-4 bg-primary items-center justify-center ${
            saveDisabled ? "opacity-70" : "active:bg-primary/90"
          }`}
          activeOpacity={0.8}
          accessibilityLabel="Save item"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-base font-bold">
              {ADD_ITEM_CONSTANTS.BUTTONS.SAVE}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddItemPageFooter;
