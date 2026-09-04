import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

interface ShortcutItemProps {
  title: string;
  iconName: keyof typeof MaterialIcons.glyphMap | keyof typeof Feather.glyphMap;
  iconFamily?: 'MaterialIcons' | 'Feather';
  route?: string;
}

const ShortcutItem = ({ title, iconName, iconFamily = 'MaterialIcons', route }: ShortcutItemProps) => {
  const router = useRouter();
  return (
    <TouchableOpacity 
      className="w-[23%] items-center mb-6"
      onPress={() => route ? router.push(route as any) : null}
    >
      <View className="w-12 h-12 bg-primary-light rounded-full items-center justify-center mb-2">
        {iconFamily === 'MaterialIcons' ? (
          <MaterialIcons name={iconName as any} size={24} color="#0EA5E9" />
        ) : (
          <Feather name={iconName as any} size={22} color="#0EA5E9" />
        )}
      </View>
      <Text className="text-xs font-medium text-text-secondary text-center leading-tight">
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default function Shortcuts() {
  return (
    <View className="bg-surface mx-4 px-4 pt-4 pb-8 mt-2 rounded-xl shadow-sm border border-border/50">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-bold text-text">Shortcuts</Text>
        <TouchableOpacity className="flex-row items-center">
          <Feather name="edit" size={16} color="#0EA5E9" />
          <Text className="text-sm font-semibold text-primary ml-1">Edit Menu</Text>
        </TouchableOpacity>
      </View>
      
      <View className="flex-row flex-wrap justify-between">
        <ShortcutItem title="Quick Entry" iconName="flash-on" route="/quick-entry" />
        <ShortcutItem title="Sales Invoice" iconName="receipt" />
        <ShortcutItem title="Payment In" iconName="account-balance-wallet" />
        <ShortcutItem title="Payment Out" iconName="account-balance-wallet" />
        
        <ShortcutItem title="Purchase" iconName="shopping-cart" />
        <ShortcutItem title="Add Item" iconName="inventory" />
        <ShortcutItem title="Expense" iconName="account-balance-wallet" />
        <ShortcutItem title="Sales Return" iconName="assignment-return" />
      </View>
    </View>
  );
}
