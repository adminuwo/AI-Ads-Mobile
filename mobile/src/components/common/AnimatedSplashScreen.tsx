import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { DualOrbitLogoAnimation } from './DualOrbitLogoAnimation';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

interface AnimatedSplashScreenProps {
  onFinish: () => void;
  durationMs?: number; // default ~6000ms
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  onFinish,
  durationMs = 6000,
}) => {
  const { width, height } = useWindowDimensions();

  // Responsive scale factor for all screen sizes (sleek, refined, and compact)
  const logoContainerSize = Math.min(180, Math.round(width * 0.46), Math.round(height * 0.22));
  const coreLogoSize = Math.round(logoContainerSize * 0.72);

  // Animation values
  const screenFade = useRef(new Animated.Value(1)).current;
  const contentScale = useRef(new Animated.Value(0.85)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance animation: Logo animation & brand title fade-in
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(contentScale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Exit animation after durationMs
    const exitTimer = setTimeout(() => {
      triggerExit();
    }, durationMs);

    return () => {
      clearTimeout(exitTimer);
    };
  }, []);

  const triggerExit = () => {
    Animated.timing(screenFade, {
      toValue: 0,
      duration: 550,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: screenFade,
        },
      ]}
    >
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

      {/* ── Center Section: Exact Dual Orbit Animation + AI Ads —TM ── */}
      <Animated.View
        style={[
          styles.centerSection,
          {
            opacity: contentOpacity,
            transform: [{ scale: contentScale }],
          },
        ]}
      >
        {/* Dual Counter-Rotating Orbit Rings Logo Engine */}
        <View style={styles.logoAnimWrapper}>
          <DualOrbitLogoAnimation
            size={logoContainerSize}
            logoSize={coreLogoSize}
            source={require('../../../assets/ai_ads_camera_full_logo.png')}
          />
        </View>

        {/* Brand Title: ONLY AI Ads —TM */}
        <View style={styles.brandTitleRow}>
          <Text style={styles.titleAI}>AI</Text>
          <Text style={styles.titleAds}> Ads</Text>
          <Text style={styles.titleTM}> —TM</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoAnimWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: 6,
  },
  titleAI: {
    fontSize: FONT_SIZES.hero,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.hero,
    color: '#F59E0B',
    letterSpacing: -0.3,
  },
  titleAds: {
    fontSize: FONT_SIZES.hero,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.hero,
    color: '#6366F1',
    letterSpacing: -0.3,
  },
  titleTM: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
    color: '#F59E0B',
    marginTop: 2,
    letterSpacing: 0.3,
  },
});
