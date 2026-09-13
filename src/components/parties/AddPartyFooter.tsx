import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface AddPartyFooterProps {
  onSave: () => void;
  onSaveAndNew: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const AddPartyFooter: React.FC<AddPartyFooterProps> = ({
  onSave,
  onSaveAndNew,
  loading = false,
  disabled = false,
}) => {
  return (
    <SafeAreaView
      edges={["bottom"]}
      className="bg-surface border-t border-border"
    >
      <View className="flex-row items-center justify-between bg-surface">
        {/* Save & New Button (50% Width, White BG) */}
        <TouchableOpacity
          onPress={onSaveAndNew}
          disabled={loading || disabled}
          className={`flex-1 py-4 items-center justify-center bg-surface ${
            loading || disabled ? "opacity-50" : "active:bg-slate-100"
          }`}
          activeOpacity={0.7}
        >
          <Text className="text-slate-600 text-base font-bold">Save & New</Text>
        </TouchableOpacity>

        {/* Save Party Primary Button (50% Width, Primary BG) */}
        <TouchableOpacity
          onPress={onSave}
          disabled={loading || disabled}
          className={`flex-1 py-4 bg-primary items-center justify-center ${
            loading || disabled ? "opacity-70" : "active:bg-primary/90"
          }`}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-base font-bold">Save Party</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddPartyFooter;
