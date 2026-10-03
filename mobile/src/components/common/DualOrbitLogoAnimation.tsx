import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  ViewStyle,
  StyleProp,
} from 'react-native';

interface DualOrbitLogoAnimationProps {
  size?: number; // Base size of the outer container (default: 288)
  logoSize?: number; // Size of the center logo image (default: 224)
  source?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
}

/**
 * Dual-Orbit Cyber Ring Engine
 * 1. Outer Ring (Amber Gold #FBBF24): 3px border, right side transparent, spins Clockwise continuously (8.0s linear)
 * 2. Inner Ring (Electric Blue #3B82F6): 14px inset, 3px border, top side transparent, spins Counter-Clockwise continuously (6.0s linear)
 * 3. Core Logo Image: Centered statically in the middle with deep drop shadow, featuring full reference logo with hand, camera, sparks, orange arc, and blue arc.
 */
export const DualOrbitLogoAnimation: React.FC<DualOrbitLogoAnimationProps> = ({
  size = 288,
  logoSize,
  source = require('../../../assets/ai_ads_camera_full_logo.png'),
  style,
}) => {
  // Animated values for continuous rotation
  const outerRotateAnim = useRef(new Animated.Value(0)).current;
  const innerRotateAnim = useRef(new Animated.Value(0)).current;

  // Proportions based on 288px specification
  const scale = size / 288;
  const outerSize = size;
  const inset = 14 * scale;
  const innerSize = size - inset * 2;
  const actualLogoSize = logoSize ?? Math.round(size * 0.72);
  const borderWidth = Math.max(2.5, 3 * scale);

  useEffect(() => {
    // Outer Ring: Clockwise continuous linear rotation (0° -> 360°) over 8.0 seconds
    const outerLoop = Animated.loop(
      Animated.timing(outerRotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Inner Ring: Counter-Clockwise continuous linear rotation (360° -> 0°) over 6.0 seconds
    const innerLoop = Animated.loop(
      Animated.timing(innerRotateAnim, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    outerLoop.start();
    innerLoop.start();

    return () => {
      outerLoop.stop();
      innerLoop.stop();
    };
  }, [outerRotateAnim, innerRotateAnim]);

  // Outer rotation interpolation: 0deg -> 360deg (Clockwise)
  const outerRotate = outerRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Inner rotation interpolation: 360deg -> 0deg (Counter-Clockwise reverse spin)
  const innerRotate = innerRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* ── 1. Outer Orbit Ring (Amber Gold, 8s Clockwise) ── */}
      <Animated.View
        style={[
          styles.outerRing,
          {
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize / 2,
            borderWidth: borderWidth,
            borderColor: 'rgba(251, 191, 36, 0.45)', // Amber Gold #FBBF24
            borderRightColor: 'transparent', // The transparent arc gap per specification
            transform: [{ rotate: outerRotate }],
          },
        ]}
      />

      {/* ── 2. Inner Orbit Ring (Electric Blue, 6s Counter-Clockwise) ── */}
      <Animated.View
        style={[
          styles.innerRing,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            borderWidth: borderWidth,
            borderColor: 'rgba(59, 130, 246, 0.45)', // Electric Blue #3B82F6
            borderTopColor: 'transparent', // The transparent arc gap per specification
            transform: [{ rotate: innerRotate }],
          },
        ]}
      />

      {/* ── 3. Core Logo Image (224x224, Stationary Center with Deep Drop-Shadow) ── */}
      <View
        style={[
          styles.logoContainer,
          {
            width: actualLogoSize,
            height: actualLogoSize,
          },
        ]}
      >
        <Image
          source={source}
          style={{
            width: actualLogoSize,
            height: actualLogoSize,
          }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    borderStyle: 'solid',
  },
  innerRing: {
    position: 'absolute',
    borderStyle: 'solid',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    // Deep drop-shadow matching drop-shadow-2xl
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 12,
  },
});
