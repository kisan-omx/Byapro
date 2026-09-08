import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
  iconName?: keyof typeof Feather.glyphMap;
  iconSize?: number;
  iconColor?: string;
  renderIcon?: () => React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  loading = false,
  disabled = false,
  className = '',
  textClassName = '',
  iconName,
  iconSize = 18,
  iconColor = '#FFFFFF',
  renderIcon,
  onPress,
  ...props
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      className={`bg-primary py-3.5 px-6 rounded-full items-center justify-center shadow-xs flex-row ${
        disabled || loading ? 'opacity-60' : 'active:opacity-90'
      } ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          {renderIcon ? (
            renderIcon()
          ) : iconName ? (
            <Feather
              name={iconName}
              size={iconSize}
              color={iconColor}
              style={{ marginRight: 8 }}
            />
          ) : null}
          <Text
            className={`text-white text-base font-extrabold text-center ${textClassName}`}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
