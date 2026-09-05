import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { QUICK_LINKS, QuickLinkItem } from '../../constants/transactionConstants';

interface QuickLinksCardProps {
  onShowAll?: () => void;
  onOpenSettings?: () => void;
}

export default function QuickLinksCard({ onShowAll, onOpenSettings }: QuickLinksCardProps) {
  const router = useRouter();

  const handleAction = (link: QuickLinkItem) => {
    if (link.action === 'add_txn') {
      router.push('/quick-entry');
    } else if (link.action === 'show_all' && onShowAll) {
      onShowAll();
    } else if (link.action === 'txn_settings' && onOpenSettings) {
      onOpenSettings();
    }
  };

  return (
    <View className="mx-4 mb-3 bg-surface rounded-2xl p-4 border border-border/80 shadow-xs">
      <Text className="text-sm font-bold text-text mb-3">Quick Links</Text>

      <View className="flex-row items-center justify-between">
        {QUICK_LINKS.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleAction(item)}
            className="items-center flex-1"
            activeOpacity={0.7}
          >
            <View className={`w-12 h-10 rounded-xl ${item.bgColor} items-center justify-center mb-1.5`}>
              <Feather name={item.iconName as any} size={20} color={item.iconColor} />
            </View>
            <Text className="text-xs font-medium text-text-secondary text-center">
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
