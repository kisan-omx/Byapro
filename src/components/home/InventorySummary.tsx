import { View, Text } from 'react-native';

export default function InventorySummary() {
  return (
    <View className="bg-surface mx-4 px-4 pt-4 pb-4 mt-4 mb-6 rounded-xl shadow-sm border border-border/50">
      {/* Header */}
      <View className="mb-3">
        <Text className="text-base font-bold text-text">Inventory</Text>
      </View>

      {/* Dashed Divider */}
      <View className="border-b border-dashed border-border/60 mb-4" />

      {/* Summary Boxes */}
      <View className="flex-row justify-between">
        <View className="w-[48%] bg-background p-3 rounded-lg">
          <Text className="text-xs text-text-secondary mb-1 font-medium">Stock Value</Text>
          <Text className="text-base font-bold text-success">Rs 0.00</Text>
        </View>
        <View className="w-[48%] bg-background p-3 rounded-lg">
          <Text className="text-xs text-text-secondary mb-1 font-medium">No. of Items</Text>
          <Text className="text-base font-bold text-text">5</Text>
        </View>
      </View>
    </View>
  );
}
