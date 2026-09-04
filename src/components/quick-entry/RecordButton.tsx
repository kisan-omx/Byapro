import { TouchableOpacity, Text, View } from 'react-native';
import { EntryType } from './QuickEntryTabs';

interface RecordButtonProps {
  onPress: () => void;
  entryType: EntryType;
  amount: string;
}

export default function RecordButton({ onPress, entryType, amount }: RecordButtonProps) {
  const getButtonText = () => {
    switch (entryType) {
      case 'Sale': return 'Record Sales';
      case 'Purchase': return 'Record Purchase';
      case 'Payment In': return 'Record Payment In';
      case 'Payment Out': return 'Record Payment Out';
      case 'Expense': return 'Record Expense';
      default: return 'Record';
    }
  };

  return (
    <View className="px-4 py-3 bg-surface">
      <TouchableOpacity
        onPress={onPress}
        className="bg-primary py-4 rounded-xl items-center justify-center"
        activeOpacity={0.7}
        delayPressIn={0}
      >
        <Text className="text-white text-lg font-semibold">{getButtonText()}</Text>
      </TouchableOpacity>
    </View>
  );
}
