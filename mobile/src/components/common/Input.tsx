import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  isPassword = false,
  containerStyle,
  style,
  ...props
}) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}

      {/* Neumorphic Inset Carved Well */}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.inputBackground,
            borderTopColor: error
              ? colors.danger
              : isFocused
              ? colors.accent.primary
              : colors.neu.borderDark,
            borderLeftColor: error
              ? colors.danger
              : isFocused
              ? colors.accent.primary
              : colors.neu.borderDark,
            borderBottomColor: error
              ? colors.danger
              : isFocused
              ? colors.accent.primary
              : colors.neu.borderLight,
            borderRightColor: error
              ? colors.danger
              : isFocused
              ? colors.accent.primary
              : colors.neu.borderLight,
            borderWidth: isFocused ? 2 : 1.5,
          },
        ]}
      >
        <LinearGradient
          colors={colors.neu.insetGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.innerGradientWrapper}
        >
          {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

          <TextInput
            placeholderTextColor={colors.textMuted}
            secureTextEntry={isPassword && !showPassword}
            style={[
              styles.input,
              { color: colors.textPrimary },
              props.multiline && styles.multilineInput,
              style,
            ]}
            {...props}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
          />

          {isPassword ? (
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showPassword ? (
                <EyeOff size={18} color={colors.textMuted} />
              ) : (
                <Eye size={18} color={colors.textMuted} />
              )}
            </TouchableOpacity>
          ) : (
            rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>
          )}
        </LinearGradient>
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 6,
  },
  label: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  innerGradientWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    minHeight: 48,
    borderRadius: 14.5,
  },
  iconContainer: {
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.body,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.body,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
    marginTop: 4,
    marginLeft: 2,
  },
});
