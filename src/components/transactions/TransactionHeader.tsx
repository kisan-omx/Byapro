import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface TransactionHeaderProps {
  onOpenSettings?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenTypeFilter?: () => void;
}

export default function TransactionHeader({
  onOpenSettings,
  searchQuery,
  onSearchChange,
  onOpenTypeFilter,
}: TransactionHeaderProps) {
  return (
    <View className="bg-surface border-b border-border/80 pt-2 px-4 pb-3 shadow-xs">
      {/* Title & Settings Gear Row */}
      <View className="flex-row items-center justify-between py-2 mb-2">
        <Text className="text-xl font-bold text-slate-800">Transactions</Text>

        <TouchableOpacity onPress={onOpenSettings} className="p-1">
          <Feather name="settings" size={22} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View className="flex-row items-center bg-background border border-border/90 rounded-xl px-3.5 py-2.5">
        <Feather name="search" size={18} color="#94A3B8" className="mr-2" />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search transactions..."
          placeholderTextColor="#94A3B8"
          className="flex-1 text-sm text-slate-800 font-medium p-0"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} className="p-1 mr-1">
            <Feather name="x-circle" size={16} color="#94A3B8" />
          </TouchableOpacity>
        )}
        <View className="w-px h-5 bg-border mx-2" />
        <TouchableOpacity onPress={onOpenTypeFilter || onOpenSettings} className="p-1">
          <MaterialCommunityIcons name="filter-variant" size={22} color="#475569" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
