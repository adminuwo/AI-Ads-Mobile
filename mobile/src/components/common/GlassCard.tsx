import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'bordered';
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  glow = false,
}) => {
  const { colors, isDark } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: isDark ? colors.cardBackground : '#FFFFFF',
    borderColor: glow ? colors.accent.primary : colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    shadowColor: glow ? colors.accent.primary : '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? (glow ? 0.35 : 0.25) : 0.06,
    shadowRadius: glow ? 12 : 8,
    elevation: variant === 'elevated' ? 4 : 2,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[cardStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};
