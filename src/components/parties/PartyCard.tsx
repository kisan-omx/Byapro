import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Party } from '../../types/party';
import { BALANCE_STATUS_CONFIG } from '../../constants/parties';

export interface PartyCardProps {
  party: Party;
  onPress?: (party: Party) => void;
}

export const PartyCard: React.FC<PartyCardProps> = ({ party, onPress }) => {
  const balanceType = party.balanceType || 'Settled';
  const statusConfig = BALANCE_STATUS_CONFIG[balanceType];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress && onPress(party)}
      style={{
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
      }}
      className="bg-surface mx-4 mb-2.5 p-3 rounded-xl border border-slate-200/80 shadow-2xs flex-row items-center justify-between"
    >
      {/* Left section: Party Name / Subtitle (No Avatar Logo) */}
      <View className="flex-1 mr-2 justify-center">
        <Text className="text-base font-semibold text-text mb-0.5" numberOfLines={1}>
          {party.name}
        </Text>
        <Text className="text-xs text-text-secondary font-semibold" numberOfLines={1}>
          {party.subtitle || 'No phone number'}
        </Text>
      </View>

      {/* Right section: Balance & Status */}
      <View className="items-end justify-center">
        <Text className={`text-base ${statusConfig.amountClass}`}>
          Rs. {party.balance ?? 0}
        </Text>
        <Text className={`text-xs mt-0.5 ${statusConfig.textClass}`}>
          {statusConfig.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default PartyCard;
