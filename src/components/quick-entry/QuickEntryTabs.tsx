import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export type EntryType =
  | 'Sale'
  | 'Purchase'
  | 'Payment In'
  | 'Payment Out'
  | 'Expense'
  | 'Sale Return'
  | 'Purchase Return';

interface QuickEntryTabsProps {
  selectedTab: EntryType;
  onSelectTab: (tab: EntryType) => void;
}

const TABS: EntryType[] = ['Sale', 'Purchase', 'Payment In', 'Payment Out', 'Expense'];

export default function QuickEntryTabs({ selectedTab, onSelectTab }: QuickEntryTabsProps) {
  return (
    <View className="bg-surface py-2">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {TABS.map((tab) => {
          const isActive = tab === selectedTab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => onSelectTab(tab)}
              className={`px-4 py-2 rounded-full ${
                isActive ? 'bg-primary' : 'bg-background'
              }`}
            >
              <Text 
                className={`font-medium ${
                  isActive ? 'text-white' : 'text-text-secondary'
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
