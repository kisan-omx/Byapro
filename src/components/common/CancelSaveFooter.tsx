import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface CancelSaveFooterProps {
  onCancel: () => void;
  onSave: () => void;
  cancelLabel?: string;
  saveLabel?: string;
  loading?: boolean;
  disabled?: boolean;
}

export const CancelSaveFooter: React.FC<CancelSaveFooterProps> = ({
  onCancel,
  onSave,
  cancelLabel = 'Cancel',
  saveLabel = 'Save',
  loading = false,
  disabled = false,
}) => {
  return (
    <SafeAreaView edges={['bottom']} className="bg-surface pt-4 pb-4 px-4 border-t border-border/50 mt-auto">
      <View className="flex-row items-center gap-4">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onCancel}
          disabled={loading}
          className="flex-1 py-3.5 border border-slate-300 rounded-xl items-center justify-center bg-surface"
        >
          <Text className="text-slate-700 text-base font-bold">{cancelLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSave}
          disabled={loading || disabled}
          className={`flex-1 py-3.5 rounded-xl items-center justify-center ${
            loading || disabled ? 'bg-primary/70' : 'bg-primary'
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white text-base font-bold">{saveLabel}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CancelSaveFooter;
