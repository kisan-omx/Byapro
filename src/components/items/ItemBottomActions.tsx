import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../common/PrimaryButton';

export interface ItemBottomActionsProps {
  onOpenAddItemModal: () => void;
}

/**
 * Centered "Add New Item" floating action button.
 * Positioned absolute at bottom, centered horizontally.
 * Same pattern as PartyBottomActions.
 */
export const ItemBottomActions: React.FC<ItemBottomActionsProps> = ({
  onOpenAddItemModal,
}) => {
  return (
    <View className="absolute bottom-5 left-0 right-0 items-center justify-center pointer-events-box-none px-4">
      <PrimaryButton
        title="Add New Item"
        renderIcon={() => (
          <Ionicons
            name="cube-outline"
            size={20}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
        )}
        onPress={onOpenAddItemModal}
        className="bg-primary px-7 py-3.5 rounded-full shadow-xl shadow-primary/35 flex-row items-center justify-center"
        textClassName="text-base font-extrabold text-white tracking-wide"
      />
    </View>
  );
};

export default ItemBottomActions;
