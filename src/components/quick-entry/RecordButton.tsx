import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { EntryType } from './QuickEntryTabs';

interface RecordButtonProps {
  onPress: () => void;
  entryType: EntryType;
  amount: string;
  isCredit?: boolean;
  loading?: boolean;
}

export default function RecordButton({ onPress, entryType, amount, isCredit, loading }: RecordButtonProps) {
  const getButtonText = () => {
    switch (entryType) {
      case 'Sale':        return isCredit ? 'Record Credit Sale' : 'Record Sales';
      case 'Purchase':    return isCredit ? 'Record Credit Purchase' : 'Record Purchase';
      case 'Payment In':  return 'Record Payment In';
      case 'Payment Out': return 'Record Payment Out';
      case 'Expense':     return 'Record Expense';
      default:            return 'Record';
    }
  };

  return (
    <View className="px-4 py-3 bg-surface">
      <TouchableOpacity
        onPress={onPress}
        disabled={loading}
        className={`bg-primary py-4 rounded-xl items-center justify-center ${loading ? 'opacity-70' : ''}`}
        activeOpacity={0.7}
        delayPressIn={0}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-lg font-semibold">{getButtonText()}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
