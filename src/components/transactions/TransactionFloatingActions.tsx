import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface TransactionFloatingActionsProps {
  onOpenAddModal?: () => void;
}

export default function TransactionFloatingActions({ onOpenAddModal }: TransactionFloatingActionsProps) {
  const router = useRouter();

  return (
    <View className="absolute bottom-6 left-0 right-0 items-center px-4 pointer-events-box-none">
      <View className="flex-row items-center justify-center gap-x-3.5 bg-transparent">
        {/* Payment In Pill Button */}
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/quick-entry', params: { type: 'Payment In' } })}
          className="flex-row items-center bg-emerald-500 px-5 py-3.5 rounded-full shadow-lg"
          activeOpacity={0.85}
        >
          <Feather name="arrow-down-left" size={20} color="#FFFFFF" className="mr-2" />
          <Text className="text-white font-bold text-base">Payment In</Text>
        </TouchableOpacity>

        {/* Floating Plus Button */}
        <TouchableOpacity
          onPress={() => (onOpenAddModal ? onOpenAddModal() : router.push('/quick-entry'))}
          className="w-14 h-14 rounded-full bg-surface border border-emerald-400 items-center justify-center shadow-lg"
          activeOpacity={0.85}
        >
          <Feather name="plus" size={28} color="#10B981" />
        </TouchableOpacity>

        {/* New Sale Pill Button */}
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/quick-entry', params: { type: 'Sale' } })}
          className="flex-row items-center bg-primary px-5 py-3.5 rounded-full shadow-lg"
          activeOpacity={0.85}
        >
          <Feather name="tag" size={18} color="#FFFFFF" className="mr-2" />
          <Text className="text-white font-bold text-base">New Sale</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
