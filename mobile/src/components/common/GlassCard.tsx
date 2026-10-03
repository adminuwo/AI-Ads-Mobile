import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'bordered' | 'raised' | 'inset' | 'flat';
  glow?: boolean;
  glowColor?: string;
  accentColor?: string;
  noAccentBorder?: boolean;
}

const OUTER_LAYOUT_KEYS = new Set<string>([
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'width',
  'height',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginHorizontal',
  'marginVertical',
  'alignSelf',
  'zIndex',
  'position',
  'top',
  'bottom',
  'left',
  'right',
]);

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  onPress,
  variant = 'raised',
  glow = false,
  glowColor,
  accentColor,
  noAccentBorder = false,
}) => {
  const { colors, isDark } = useTheme();

  const isInset = variant === 'inset';
  const effectiveGlowColor = glowColor || colors.accent.primary;

  // Flatten incoming styles to split layout/border vs inner content styles
  const flattenedStyle = (StyleSheet.flatten(style) || {}) as ViewStyle;
  const outerStyle: ViewStyle = {};
  const innerStyle: ViewStyle = {};
  const borderProps: Partial<ViewStyle> = {};

  Object.entries(flattenedStyle).forEach(([key, val]) => {
    if (key.startsWith('border')) {
      (borderProps as any)[key] = val;
    } else if (OUTER_LAYOUT_KEYS.has(key)) {
      (outerStyle as any)[key] = val;
    } else {
      (innerStyle as any)[key] = val;
    }
  });

  // When outer container is flexed or dimensioned, expand inner gradient to fill
  if (outerStyle.flex !== undefined) {
    innerStyle.flex = 1;
  }
  if (outerStyle.height !== undefined) {
    innerStyle.height = '100%';
  }
  if (outerStyle.minHeight !== undefined) {
    innerStyle.minHeight = outerStyle.minHeight;
  }

  const customRadius = borderProps.borderRadius;
  const cardRadius = typeof customRadius === 'number' ? customRadius : 16;

  // Determine if a vertical accent indicator bar is requested
  const hasAccent =
    !isInset &&
    !noAccentBorder &&
    Boolean(
      accentColor ||
      (borderProps.borderLeftColor && (borderProps.borderLeftWidth ?? 0) > 1.5)
    );
  const resolvedAccentColor =
    accentColor || (borderProps.borderLeftColor as string) || colors.accent.primary;

  // Uniform crisp border width to ensure clean rounded corner rendering without RN corner bleeding
  const uniformBorderWidth =
    borderProps.borderWidth ??
    (borderProps.borderTopWidth !== undefined && borderProps.borderTopWidth === borderProps.borderBottomWidth
      ? borderProps.borderTopWidth
      : 1.2);

  // Base specular rim colors for neumorphic surface
  const defaultTopBorderColor = glow
    ? effectiveGlowColor
    : (isInset ? colors.neu.borderDark : colors.neu.borderLight);
  const defaultBottomBorderColor = glow
    ? effectiveGlowColor
    : (isInset ? colors.neu.borderLight : colors.neu.borderDark);
  const defaultSideBorderColor = glow
    ? effectiveGlowColor
    : (isInset ? colors.neu.borderDark : colors.neu.borderLight);

  const resolvedBorderTopColor = borderProps.borderTopColor ?? borderProps.borderColor ?? defaultTopBorderColor;
  const resolvedBorderBottomColor = borderProps.borderBottomColor ?? borderProps.borderColor ?? defaultBottomBorderColor;
  const resolvedBorderLeftColor = borderProps.borderColor ?? defaultSideBorderColor;
  const resolvedBorderRightColor = borderProps.borderRightColor ?? borderProps.borderColor ?? defaultSideBorderColor;

  // Neumorphic Dual-Shadow & Specular Rim Architecture
  const containerShadowStyle: ViewStyle = isInset
    ? {
        backgroundColor: (flattenedStyle.backgroundColor as string) ?? colors.neu.cardSecondary,
        borderRadius: cardRadius,
        borderTopWidth: uniformBorderWidth,
        borderBottomWidth: uniformBorderWidth,
        borderLeftWidth: uniformBorderWidth,
        borderRightWidth: uniformBorderWidth,
        borderTopColor: resolvedBorderTopColor,
        borderBottomColor: resolvedBorderBottomColor,
        borderLeftColor: resolvedBorderLeftColor,
        borderRightColor: resolvedBorderRightColor,
        borderStyle: borderProps.borderStyle,
        elevation: 0,
      }
    : {
        backgroundColor: (flattenedStyle.backgroundColor as string) ?? colors.neu.card,
        borderRadius: cardRadius,
        borderTopWidth: uniformBorderWidth,
        borderBottomWidth: uniformBorderWidth,
        borderLeftWidth: uniformBorderWidth,
        borderRightWidth: uniformBorderWidth,
        borderTopColor: resolvedBorderTopColor,
        borderBottomColor: resolvedBorderBottomColor,
        borderLeftColor: resolvedBorderLeftColor,
        borderRightColor: resolvedBorderRightColor,
        borderStyle: borderProps.borderStyle,

        // iOS Multi-layer Shadow (subtle and sleek)
        shadowColor: glow ? effectiveGlowColor : (isDark ? '#000000' : '#A3B1C6'),
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: isDark ? (glow ? 0.45 : 0.5) : (glow ? 0.3 : 0.4),
        shadowRadius: glow ? 8 : 5,

        // Android Neumorphic Elevation
        elevation: variant === 'elevated' ? 5 : (variant === 'flat' ? 0 : 2),
      };

  if (borderProps.borderTopLeftRadius !== undefined) {
    containerShadowStyle.borderTopLeftRadius = borderProps.borderTopLeftRadius;
  }
  if (borderProps.borderTopRightRadius !== undefined) {
    containerShadowStyle.borderTopRightRadius = borderProps.borderTopRightRadius;
  }
  if (borderProps.borderBottomLeftRadius !== undefined) {
    containerShadowStyle.borderBottomLeftRadius = borderProps.borderBottomLeftRadius;
  }
  if (borderProps.borderBottomRightRadius !== undefined) {
    containerShadowStyle.borderBottomRightRadius = borderProps.borderBottomRightRadius;
  }

  const gradientColors = isInset
    ? colors.neu.insetGradient
    : colors.neu.surfaceGradient;

  const innerRadiusStyle: ViewStyle = {
    borderRadius: Math.max(0, cardRadius - 1),
  };
  if (typeof borderProps.borderTopLeftRadius === 'number') {
    innerRadiusStyle.borderTopLeftRadius = Math.max(0, borderProps.borderTopLeftRadius - 1);
  }
  if (typeof borderProps.borderTopRightRadius === 'number') {
    innerRadiusStyle.borderTopRightRadius = Math.max(0, borderProps.borderTopRightRadius - 1);
  }
  if (typeof borderProps.borderBottomLeftRadius === 'number') {
    innerRadiusStyle.borderBottomLeftRadius = Math.max(0, borderProps.borderBottomLeftRadius - 1);
  }
  if (typeof borderProps.borderBottomRightRadius === 'number') {
    innerRadiusStyle.borderBottomRightRadius = Math.max(0, borderProps.borderBottomRightRadius - 1);
  }

  const content = (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.innerGradient,
        innerRadiusStyle,
        innerStyle,
      ]}
    >
      {hasAccent && (
        <View
          style={[
            styles.accentBar,
            {
              backgroundColor: resolvedAccentColor,
              borderTopLeftRadius: innerRadiusStyle.borderRadius ?? 15,
              borderBottomLeftRadius: innerRadiusStyle.borderRadius ?? 15,
            },
          ]}
          pointerEvents="none"
        />
      )}
      {children}
    </LinearGradient>
  );

  const hasMargin =
    outerStyle.margin !== undefined ||
    outerStyle.marginVertical !== undefined ||
    outerStyle.marginTop !== undefined ||
    outerStyle.marginBottom !== undefined;

  const defaultMargin = hasMargin ? null : styles.defaultMargin;

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={[styles.outerContainer, containerShadowStyle, defaultMargin, outerStyle]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.outerContainer, containerShadowStyle, defaultMargin, outerStyle]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: 16,
  },
  defaultMargin: {
    marginVertical: 2,
  },
  innerGradient: {
    padding: 12,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
    zIndex: 10,
  },
});
