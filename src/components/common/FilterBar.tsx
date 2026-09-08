import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface FilterChip {
  id: string;
  label: string;
  isSelected?: boolean;
  onPress: () => void;
  iconRight?: keyof typeof Feather.glyphMap;
}

export interface FilterBarProps {
  // Mode A: Simple Label + Action Button (e.g., Transactions Date Filter)
  label?: string;
  iconName?: keyof typeof Feather.glyphMap;
  actionText?: string;
  onActionPress?: () => void;

  // Mode B: Array of Chips (e.g., Parties, Items filters)
  chips?: FilterChip[];

  // Mode C: Custom Children Content
  children?: React.ReactNode;

  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  label,
  iconName = 'calendar',
  actionText = 'CHANGE',
  onActionPress,
  chips,
  children,
  className = '',
}) => {
  return (
    <View
      className={`bg-surface border-b border-border/80 px-4 py-2.5 mb-3 shadow-sm shadow-slate-200/80 ${className}`}
    >
      {/* Mode A: Label + Action Button */}
      {label && onActionPress && !chips && !children && (
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={onActionPress}
            className="flex-row items-center gap-x-2.5"
            activeOpacity={0.7}
          >
            <Feather name={iconName} size={19} color="#475569" />
            <Text className="text-base font-semibold text-text-secondary">
              {label}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onActionPress} activeOpacity={0.7}>
            <Text className="text-sm font-semibold text-primary tracking-wider uppercase">
              {actionText}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Mode B: Chips Array with Primary Active Style */}
      {chips && chips.length > 0 && !children && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center' }}
          className="flex-row"
        >
          {chips.map((chip) => (
            <TouchableOpacity
              key={chip.id}
              activeOpacity={0.75}
              onPress={chip.onPress}
              className={`px-4 py-2 rounded-full mr-2.5 border shadow-2xs flex-row items-center ${
                chip.isSelected
                  ? 'bg-primary border-primary'
                  : 'bg-slate-100/90 border-slate-200/80'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  chip.isSelected ? 'text-white' : 'text-slate-700'
                } ${chip.iconRight ? 'mr-1.5' : ''}`}
              >
                {chip.label}
              </Text>
              {chip.iconRight && (
                <Feather
                  name={chip.iconRight}
                  size={14}
                  color={chip.isSelected ? '#FFFFFF' : '#475569'}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Mode C: Custom Children */}
      {children}
    </View>
  );
};

export default FilterBar;
