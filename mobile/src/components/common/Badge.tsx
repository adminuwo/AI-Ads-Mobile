import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'neutral';
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  icon,
  style,
}) => {
  const { colors, isDark } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7',
          border: 'rgba(16, 185, 129, 0.3)',
          text: '#10B981',
        };
      case 'warning':
        return {
          bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
          border: 'rgba(245, 158, 11, 0.3)',
          text: '#F59E0B',
        };
      case 'danger':
        return {
          bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
          border: 'rgba(239, 68, 68, 0.3)',
          text: '#EF4444',
        };
      case 'info':
        return {
          bg: isDark ? 'rgba(14, 165, 233, 0.15)' : '#E0F2FE',
          border: 'rgba(14, 165, 233, 0.3)',
          text: '#0EA5E9',
        };
      case 'accent':
        return {
          bg: colors.accent.tagBg,
          border: colors.accent.primary,
          text: colors.accent.tagText,
        };
      default:
        return {
          bg: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
          border: colors.border,
          text: colors.textSecondary,
        };
    }
  };

  const vStyle = getVariantStyles();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: vStyle.bg, borderColor: vStyle.border },
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.badgeText, { color: vStyle.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
