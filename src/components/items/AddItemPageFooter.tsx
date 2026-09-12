import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ADD_ITEM_CONSTANTS } from '../../constants/items';

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
    <SafeAreaView edges={['bottom']} className="bg-surface border-t border-border">
      <View className="flex-row items-center">
        {/* Cancel */}
        <Pressable
          onPress={onCancel}
          disabled={loading}
          className={`flex-1 py-4 items-center justify-center ${
            loading ? 'opacity-50' : 'opacity-100'
          } active:opacity-70 bg-surface`}
          accessibilityLabel="Cancel"
        >
          <Text className="text-slate-600 text-base font-bold">
            {ADD_ITEM_CONSTANTS.BUTTONS.CANCEL}
          </Text>
        </Pressable>

        {/* Save */}
        <Pressable
          onPress={onSave}
          disabled={saveDisabled}
          className={`flex-1 py-4 items-center justify-center ${
            saveDisabled ? 'bg-slate-200 opacity-100' : 'bg-primary active:bg-primary/90'
          } active:opacity-80`}
          accessibilityLabel="Save item"
        >
          {loading ? (
            <ActivityIndicator color={saveDisabled ? '#94A3B8' : 'white'} />
          ) : (
            <Text
              className={`text-base font-bold ${
                saveDisabled ? 'text-slate-400' : 'text-white'
              }`}
            >
              {ADD_ITEM_CONSTANTS.BUTTONS.SAVE}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default AddItemPageFooter;
