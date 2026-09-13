import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Party } from "../../types/party";
import { BALANCE_STATUS_CONFIG } from "../../constants/parties";
import { partyEvents } from "../../services/partyEvents";

export interface PartyCardProps {
  party: Party;
  onPress?: (party: Party) => void;
  onRetry?: (party: Party) => void;
}

export const PartyCard: React.FC<PartyCardProps> = ({
  party,
  onPress,
  onRetry,
}) => {
  const balanceType = party.balanceType || "Settled";
  const statusConfig = BALANCE_STATUS_CONFIG[balanceType];

  const handleRetryPress = (e: any) => {
    e?.stopPropagation?.();
    if (onRetry) {
      onRetry(party);
    } else {
      partyEvents.emitRetry(party);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress && onPress(party)}
      style={{
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
      }}
      className={`bg-surface mx-4 mb-2.5 p-3 rounded-xl border border-slate-200/80 shadow-2xs flex-row items-center justify-between ${
        party.syncStatus === "failed" ? "border-rose-300" : ""
      }`}
    >
      {/* Left section: Party Name / Subtitle & Saving/Failed Status */}
      <View className="flex-1 mr-2 justify-center">
        <Text
          className="text-base font-semibold text-text mb-0.5"
          numberOfLines={1}
        >
          {party.name}
        </Text>
        <View className="flex-row items-center gap-x-2">
          <Text
            className="text-xs text-text-secondary font-semibold"
            numberOfLines={1}
          >
            {party.subtitle || "No phone number"}
          </Text>

          {/* Failed / Retry Indicator */}
          {party.syncStatus === "failed" && (
            <TouchableOpacity
              onPress={handleRetryPress}
              className="px-2 py-0.5 rounded-md bg-rose-100 flex-row items-center gap-x-1"
              activeOpacity={0.7}
            >
              <Feather name="refresh-cw" size={10} color="#E11D48" />
              <Text className="text-[10px] font-bold text-rose-700">
                Failed • Retry
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
