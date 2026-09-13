import React from "react";
import { View, Text, Pressable } from "react-native";
import { ADD_ITEM_CONSTANTS, ItemType } from "../../constants/items";

export interface AddItemTypeToggleProps {
  value: ItemType;
  onChange: (type: ItemType) => void;
}

/**
 * Product / Services segmented toggle.
 * Left pill = Product, Right pill = Services.
 * Active side gets the blue pill; inactive text is muted.
 */
export const AddItemTypeToggle: React.FC<AddItemTypeToggleProps> = ({
  value,
  onChange,
}) => {
  const types = ADD_ITEM_CONSTANTS.ITEM_TYPES;

  return (
    <View className="flex-row items-center justify-center bg-surface border-b border-border/40 py-3 px-4">
      {/* Track */}
      <View className="flex-row items-center bg-slate-100 rounded-full p-1">
        {types.map((type) => {
          const isActive = value === type.id;
          return (
            <Pressable
              key={type.id}
              onPress={() => onChange(type.id)}
              className={`px-6 py-1.5 rounded-full ${
                isActive ? "bg-primary shadow-sm" : "bg-transparent shadow-none"
              } active:opacity-80`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                className={`text-sm font-semibold ${
                  isActive ? "text-white" : "text-text-secondary"
                }`}
              >
                {type.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default AddItemTypeToggle;
