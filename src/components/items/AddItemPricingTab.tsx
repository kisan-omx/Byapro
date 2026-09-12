import React from 'react';
import { View } from 'react-native';
import { AddItemBaseField } from './AddItemBaseField';

export interface AddItemPricingTabProps {
  sellingPrice: string;
  onSellingPriceChange: (v: string) => void;
  purchasePrice: string;
  onPurchasePriceChange: (v: string) => void;
  isService?: boolean;
}

export const AddItemPricingTab: React.FC<AddItemPricingTabProps> = ({
  sellingPrice,
  onSellingPriceChange,
  purchasePrice,
  onPurchasePriceChange,
  isService,
}) => {
  return (
    <View className="px-4 pt-0 pb-0">
      {/* Sale Price */}
      <View className="mb-4">
        <AddItemBaseField
          label="Sale Price"
          value={sellingPrice}
          onChangeText={onSellingPriceChange}
          keyboardType="decimal-pad"
        />
      </View>

      {/* Purchase Price */}
      {!isService && (
        <View className="mb-4">
          <AddItemBaseField
            label="Purchase Price"
            value={purchasePrice}
            onChangeText={onPurchasePriceChange}
            keyboardType="decimal-pad"
          />
        </View>
      )}
    </View>
  );
};

export default AddItemPricingTab;
