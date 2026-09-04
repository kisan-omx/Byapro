import { View, Text } from 'react-native';
import { useState, useEffect } from 'react';

interface AmountDisplayProps {
  amount: string;
  liveResult?: string;
}

export default function AmountDisplay({ amount, liveResult }: AmountDisplayProps) {
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const formatNumberWithCommas = (str: string) => {
    return str.replace(/[\d.]+/g, (match) => {
      const parts = match.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    });
  };

  // Format the amount for display
  // Add commas to numbers, replace * with × and / with ÷
  const displayAmount = formatNumberWithCommas(amount || '').replace(/\*/g, '×').replace(/\//g, '÷');
  const displayLiveResult = liveResult ? formatNumberWithCommas(liveResult) : '';

  return (
    <View className="px-4 py-4 flex-1 bg-surface">
      <View className="h-[160px] border border-border rounded-2xl justify-end items-end p-6">
        <View className="flex-row items-center">
          <Text 
            className="text-text font-semibold"
            style={{ fontSize: 40 }}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {displayAmount || '0'}
          </Text>
          <View 
            className="w-[1.5px] h-9 bg-primary ml-1 rounded-full" 
            style={{ opacity: cursorVisible ? 1 : 0 }} 
          />
        </View>
        
        {displayLiveResult ? (
          <Text className="text-text-secondary text-2xl font-medium mt-2">
            = {displayLiveResult}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
