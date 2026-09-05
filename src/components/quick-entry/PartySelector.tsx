import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { EntryType } from './QuickEntryTabs';

interface PartySelectorProps {
  partyName: string;
  onPress: () => void;
  entryType: EntryType;
  error?: string | null;
}

export default function PartySelector({ partyName, onPress, entryType, error }: PartySelectorProps) {
  // Let's determine icon based on partyName or entryType for now
  // For 'Cash Sale', we'll use a cash icon
  const getIconName = () => {
    if (entryType === 'Expense') return 'shape-outline';
    if (partyName.includes('Cash')) return 'cash-multiple';
    return 'account-group-outline';
  };
  
  return (
    <View className="px-4 py-2 bg-surface">
      <TouchableOpacity 
        onPress={onPress}
        className={`flex-row items-center justify-between border rounded-xl p-3 bg-surface ${
          error ? 'border-error' : 'border-border'
        }`}
      >
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
             <MaterialCommunityIcons name={getIconName() as any} size={18} color="#0EA5E9" />
          </View>
          <Text className="text-base font-medium text-text">{partyName}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
      </TouchableOpacity>
      {!!error && (
        <Text className="text-error text-sm mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}
