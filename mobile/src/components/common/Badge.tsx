import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'neutral';
  icon?: React.ReactNode;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  icon,
  style,
  size = 'md',
}) => {
  const { colors, isDark } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7',
          border: 'rgba(16, 185, 129, 0.4)',
          text: '#10B981',
        };
      case 'warning':
        return {
          bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
          border: 'rgba(245, 158, 11, 0.4)',
          text: '#F59E0B',
        };
      case 'danger':
        return {
          bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
          border: 'rgba(239, 68, 68, 0.4)',
          text: '#EF4444',
        };
      case 'info':
        return {
          bg: isDark ? 'rgba(14, 165, 233, 0.15)' : '#E0F2FE',
          border: 'rgba(14, 165, 233, 0.4)',
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
          bg: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.neu.cardSecondary,
          border: colors.neu.borderDark,
          text: colors.textSecondary,
        };
    }
  };

  const vStyle = getVariantStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: vStyle.bg,
          borderTopColor: colors.neu.borderLight,
          borderLeftColor: colors.neu.borderLight,
          borderBottomColor: vStyle.border,
          borderRightColor: vStyle.border,
          borderWidth: 1,
          shadowColor: isDark ? '#000000' : '#A3B1C6',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 0.25,
          shadowRadius: 2,
          elevation: 1,
        },
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
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
