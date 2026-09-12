import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AddItemBaseField } from './AddItemBaseField';

export interface AddItemCodeCategoryProps {
  sku: string;
  onChangeSku: (val: string) => void;
  category?: string;
  onSelectCategory?: () => void;
  onAssignCode?: () => void;
}

export const AddItemCodeCategory: React.FC<AddItemCodeCategoryProps> = ({
  sku,
  onChangeSku,
  category = '',
  onSelectCategory,
  onAssignCode,
}) => {
  return (
    <View className="mx-4">
      {/* Item Code / Barcode */}
      <View className="mb-4">
        <AddItemBaseField
          label="Item Code / Barcode"
          value={sku}
          onChangeText={onChangeSku}
          autoCapitalize="none"
          autoCorrect={false}
          rightAction={
            !sku ? (
              <TouchableOpacity
                onPress={onAssignCode}
                className="bg-blue-50 px-3 py-1.5 rounded-full"
              >
                <Text className="text-primary text-xs font-bold">Assign Code</Text>
              </TouchableOpacity>
            ) : undefined
          }
        />
      </View>

      {/* Item Category (Dropdown style but matching the pinned label look) */}
      <View className="mb-4">
        <TouchableOpacity onPress={onSelectCategory} activeOpacity={0.8}>
          <View
            className="flex-row items-center border border-border rounded-xl px-3 bg-surface"
            style={{ height: 60 }}
          >
          <View className="flex-1 justify-center" style={{ height: 60 }}>
            {category ? (
              <>
                <Text
                  className="text-xs font-medium text-text-secondary"
                  style={{ lineHeight: 14, marginBottom: 2 }}
                >
                  Item Category
                </Text>
                <Text
                  className="text-sm font-medium text-text"
                  style={{ height: 24, lineHeight: 20 }}
                >
                  {category}
                </Text>
              </>
            ) : (
              <Text
                className="text-sm font-medium text-slate-400"
                style={{ height: 60, textAlignVertical: 'center' }}
              >
                Item Category
              </Text>
            )}
          </View>
          <View className="ml-3">
            <Feather name="chevron-down" size={20} color="#94A3B8" />
          </View>
        </View>
      </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddItemCodeCategory;
