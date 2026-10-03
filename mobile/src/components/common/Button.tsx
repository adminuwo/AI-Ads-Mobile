import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'amber';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  style,
  textStyle,
  size = 'md',
}) => {
  const { colors, isDark } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    if (disabled || loading) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onPress();
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 14 };
      case 'lg':
        return { paddingVertical: 15, paddingHorizontal: 24 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 18 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return FONT_SIZES.caption;
      case 'lg':
        return FONT_SIZES.body;
      default:
        return FONT_SIZES.body;
    }
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        disabled={disabled || loading}
        style={[
          styles.touchable,
          {
            borderRadius: 16,
            borderTopColor: colors.neu.borderLight,
            borderLeftColor: colors.neu.borderLight,
            borderBottomColor: colors.neu.borderDark,
            borderRightColor: colors.neu.borderDark,
            borderWidth: 1.5,
            shadowColor: colors.accent.primary,
            shadowOffset: isPressed ? { width: 1, height: 1 } : { width: 4, height: 4 },
            shadowOpacity: isDark ? 0.6 : 0.45,
            shadowRadius: isPressed ? 4 : 8,
            elevation: isPressed ? 2 : 5,
            opacity: disabled ? 0.6 : 1,
            transform: [{ scale: isPressed ? 0.98 : 1 }],
          },
          style,
        ]}
      >
        <LinearGradient
          colors={colors.accent.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, getPadding(), { borderRadius: 14.5 }]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.contentRow}>
              {icon && <View style={styles.iconLeft}>{icon}</View>}
              <Text
                style={[
                  styles.primaryText,
                  { fontSize: getFontSize() },
                  textStyle,
                ]}
              >
                {title}
              </Text>
              {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  const isAmber = variant === 'amber';

  let textColor = colors.textPrimary;
  let gradientColors = isPressed ? colors.neu.insetGradient : colors.neu.surfaceGradient;

  if (isOutline) {
    textColor = colors.accent.primary;
  } else if (isDanger) {
    textColor = '#EF4444';
  } else if (isAmber) {
    textColor = '#F59E0B';
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled || loading}
      style={[
        styles.touchable,
        {
          borderRadius: 16,
          backgroundColor: isPressed ? colors.neu.cardSecondary : colors.neu.card,
          borderTopColor: isPressed ? colors.neu.borderDark : colors.neu.borderLight,
          borderLeftColor: isPressed ? colors.neu.borderDark : colors.neu.borderLight,
          borderBottomColor: isPressed ? colors.neu.borderLight : colors.neu.borderDark,
          borderRightColor: isPressed ? colors.neu.borderLight : colors.neu.borderDark,
          borderWidth: 1.5,
          shadowColor: isDark ? '#000000' : '#A3B1C6',
          shadowOffset: isPressed ? { width: 1, height: 1 } : { width: 4, height: 4 },
          shadowOpacity: isDark ? 0.65 : 0.55,
          shadowRadius: isPressed ? 3 : 6,
          elevation: isPressed ? 1 : 4,
          opacity: disabled ? 0.6 : 1,
          transform: [{ scale: isPressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, getPadding(), { borderRadius: 14.5 }]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <View style={styles.contentRow}>
            {icon && <View style={styles.iconLeft}>{icon}</View>}
            <Text
              style={[
                styles.secondaryText,
                { fontSize: getFontSize(), color: textColor },
                textStyle,
              ]}
            >
              {title}
            </Text>
            {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 16,
    marginVertical: 4,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
    letterSpacing: -0.2,
  },
  secondaryText: {
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.body,
    letterSpacing: -0.2,
  },
});
