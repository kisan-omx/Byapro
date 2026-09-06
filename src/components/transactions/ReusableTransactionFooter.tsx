import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface ReusableTransactionFooterProps {
  onSave: () => void;
  onSaveAndNew: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function ReusableTransactionFooter({
  onSave,
  onSaveAndNew,
  loading = false,
  disabled = false,
}: ReusableTransactionFooterProps) {
  return (
    <SafeAreaView edges={['bottom']} className="bg-surface">
      <View className="flex-row items-center justify-between bg-surface">
        {/* Save & New Button (50% Width, White BG, No Border) */}
        <TouchableOpacity
          onPress={onSaveAndNew}
          disabled={loading || disabled}
          className={`flex-1 py-4 items-center justify-center bg-surface ${
            loading || disabled ? 'opacity-50' : 'active:bg-slate-100'
          }`}
          activeOpacity={0.7}
        >
          <Text className="text-slate-500 text-base font-bold">Save & New</Text>
        </TouchableOpacity>

        {/* Save Primary Button (50% Width, Primary BG, No Border) */}
        <TouchableOpacity
          onPress={onSave}
          disabled={loading || disabled}
          className={`flex-1 py-4 bg-primary items-center justify-center ${
            loading || disabled ? 'opacity-70' : 'active:bg-primary/90'
          }`}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-base font-bold">Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
