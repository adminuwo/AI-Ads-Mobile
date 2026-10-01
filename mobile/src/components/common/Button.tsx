import React from 'react';
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
        return 12;
      case 'lg':
        return 15;
      default:
        return 14;
    }
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handlePress}
        disabled={disabled || loading}
        style={[
          styles.touchable,
          { opacity: disabled ? 0.6 : 1 },
          style,
        ]}
      >
        <LinearGradient
          colors={colors.accent.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, getPadding()]}
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

  let bgColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  let borderColor = colors.border;
  let textColor = colors.textPrimary;

  if (isOutline) {
    bgColor = 'transparent';
    borderColor = colors.accent.primary;
    textColor = colors.accent.primary;
  } else if (isDanger) {
    bgColor = isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2';
    borderColor = 'rgba(239, 68, 68, 0.3)';
    textColor = '#EF4444';
  } else if (isAmber) {
    bgColor = isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7';
    borderColor = 'rgba(245, 158, 11, 0.3)';
    textColor = '#F59E0B';
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.secondaryButton,
        getPadding(),
        {
          backgroundColor: bgColor,
          borderColor,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    borderRadius: 14,
    borderWidth: 1,
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
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  secondaryText: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
