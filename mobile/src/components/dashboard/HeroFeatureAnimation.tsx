import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles,
  Zap,
  Target,
  Send,
  TrendingUp,
  Fingerprint,
  PenTool,
  Check,
  Wifi,
  Battery,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface FeatureLine {
  id: string;
  name: string;
  desc: string;
  badge: string;
  color: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
}

const FEATURE_LINES: FeatureLine[] = [
  {
    id: 'dna',
    name: 'Brand DNA',
    desc: 'Panch Tattva Voice & Style',
    badge: '100% Brand Safe',
    color: '#8B5CF6',
    icon: Fingerprint,
  },
  {
    id: 'creative',
    name: 'Creative Studio',
    desc: 'Instant 4K Banners & Video',
    badge: 'Auto Generated',
    color: '#F59E0B',
    icon: Sparkles,
  },
  {
    id: 'campaigns',
    name: 'Ad Campaigns',
    desc: 'Meta, Google & LinkedIn Ads',
    badge: 'Multi-Channel',
    color: '#0EA5E9',
    icon: Target,
  },
  {
    id: 'copy',
    name: 'AI Copywriter',
    desc: 'High-Converting Hooks & Captions',
    badge: '+340% CTR',
    color: '#EC4899',
    icon: PenTool,
  },
  {
    id: 'publish',
    name: 'Auto-Publish',
    desc: 'Smart Scheduled Pipeline',
    badge: 'Synced Live',
    color: '#10B981',
    icon: Send,
  },
  {
    id: 'seo',
    name: 'SEO & Growth ROI',
    desc: 'Rank #1 & Scale Conversions',
    badge: '4.8x ROI',
    color: '#6366F1',
    icon: TrendingUp,
  },
];

export const HeroFeatureAnimation: React.FC = () => {
  const { isDark } = useTheme();
  const { width } = useWindowDimensions();

  // 1. Phone 3D Entrance & Rotation Animation Values
  const phoneScale = useRef(new Animated.Value(0.4)).current;
  const phoneRotateY = useRef(new Animated.Value(1)).current; // 1 -> 0 (maps to -45deg -> 0deg)
  const phoneRotateZ = useRef(new Animated.Value(1)).current; // 1 -> 0 (maps to -12deg -> 0deg)
  const phoneTranslateY = useRef(new Animated.Value(45)).current;
  const phoneIdleFloat = useRef(new Animated.Value(0)).current;

  // 2. Phone Screen Power-On & Header Entrance
  const screenGlow = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  // 3. Line-By-Line Animated Values (one per feature)
  const lineAnims = useRef(
    FEATURE_LINES.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(14),
      scale: new Animated.Value(0.92),
    }))
  ).current;

  // 4. Live celebration chip at bottom of phone
  const celebrationOpacity = useRef(new Animated.Value(0)).current;
  const celebrationScale = useRef(new Animated.Value(0.85)).current;

  // Master sequence controller
  useEffect(() => {
    let isCancelled = false;

    const runMasterAnimation = () => {
      if (isCancelled) return;

      // Reset values
      phoneScale.setValue(0.4);
      phoneRotateY.setValue(1);
      phoneRotateZ.setValue(1);
      phoneTranslateY.setValue(45);
      screenGlow.setValue(0);
      headerOpacity.setValue(0);
      celebrationOpacity.setValue(0);
      celebrationScale.setValue(0.85);
      lineAnims.forEach((l) => {
        l.opacity.setValue(0);
        l.translateY.setValue(14);
        l.scale.setValue(0.92);
      });

      // Step 1: 3D Phone Rotates & Comes Upfront with momentum
      Animated.parallel([
        Animated.timing(phoneScale, {
          toValue: 1,
          duration: 1100,
          easing: Easing.out(Easing.back(1.15)),
          useNativeDriver: true,
        }),
        Animated.timing(phoneRotateY, {
          toValue: 0,
          duration: 1100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(phoneRotateZ, {
          toValue: 0,
          duration: 1100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(phoneTranslateY, {
          toValue: 0,
          duration: 1100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(screenGlow, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isCancelled) return;

        // Step 2: Screen turns on, AI Ads header appears
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start(() => {
          if (isCancelled) return;

          // Step 3: Stream features LINE BY LINE
          const lineStaggerAnimations = lineAnims.map((anim, index) => {
            return Animated.parallel([
              Animated.timing(anim.opacity, {
                toValue: 1,
                duration: 320,
                delay: index * 260, // Staggered line by line
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(anim.translateY, {
                toValue: 0,
                duration: 320,
                delay: index * 260,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
              }),
              Animated.timing(anim.scale, {
                toValue: 1,
                duration: 320,
                delay: index * 260,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ]);
          });

          Animated.parallel(lineStaggerAnimations).start(() => {
            if (isCancelled) return;

            // Step 4: Show bottom celebration badge
            Animated.parallel([
              Animated.timing(celebrationOpacity, {
                toValue: 1,
                duration: 350,
                useNativeDriver: true,
              }),
              Animated.spring(celebrationScale, {
                toValue: 1,
                friction: 6,
                useNativeDriver: true,
              }),
            ]).start(() => {
              if (isCancelled) return;

              // Step 5: Hold showcase for 4 seconds, then smoothly restart
              setTimeout(() => {
                if (isCancelled) return;

                Animated.timing(headerOpacity, {
                  toValue: 0,
                  duration: 400,
                  useNativeDriver: true,
                }).start(() => {
                  if (!isCancelled) {
                    runMasterAnimation();
                  }
                });
              }, 4200);
            });
          });
        });
      });
    };

    runMasterAnimation();

    // Idle floating bob for the phone
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(phoneIdleFloat, {
          toValue: -4,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(phoneIdleFloat, {
          toValue: 4,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();

    return () => {
      isCancelled = true;
      floatLoop.stop();
    };
  }, []);

  // 3D Rotations interpolation
  const rotateYInterpolate = phoneRotateY.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-42deg'],
  });

  const rotateZInterpolate = phoneRotateZ.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-10deg'],
  });

  // Responsive device sizing
  const phoneWidth = Math.min(width * 0.72, 268);
  const phoneHeight = 315;

  return (
    <View style={styles.container}>
      {/* Soft Ambient Radial Backdrop */}
      <View style={styles.ambientBackdrop} pointerEvents="none">
        <View
          style={[
            styles.ambientBlurCircle,
            {
              backgroundColor: isDark
                ? 'rgba(139, 92, 246, 0.16)'
                : 'rgba(252, 231, 243, 0.9)',
            },
          ]}
        />
      </View>

      {/* ── 3D ROTATING SMARTPHONE MOCKUP ── */}
      <Animated.View
        style={[
          styles.phone3DWrapper,
          {
            width: phoneWidth,
            height: phoneHeight,
            transform: [
              { perspective: 900 },
              { translateY: phoneTranslateY },
              { translateY: phoneIdleFloat },
              { scale: phoneScale },
              { rotateY: rotateYInterpolate },
              { rotateZ: rotateZInterpolate },
            ],
          },
        ]}
      >
        {/* Outer Phone Bezel / Metallic Frame */}
        <View
          style={[
            styles.phoneFrame,
            {
              backgroundColor: isDark ? '#090D16' : '#1E293B',
              borderColor: isDark ? '#334155' : '#475569',
              shadowColor: isDark ? '#8B5CF6' : '#A3B1C6',
            },
          ]}
        >
          {/* Inner Phone Screen Display */}
          <LinearGradient
            colors={
              isDark
                ? ['#0F172A', '#13192B', '#1E1B4B']
                : ['#FFFFFF', '#FFF5F8', '#F8FAFC']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.phoneScreen}
          >
            {/* Top Status Bar: Time & Dynamic Island */}
            <View style={styles.statusBarRow}>
              <Text
                style={[
                  styles.statusTimeText,
                  { color: isDark ? '#94A3B8' : '#64748B' },
                ]}
              >
                9:41
              </Text>

              {/* Dynamic Island Pill */}
              <View style={styles.dynamicIslandPill}>
                <View style={styles.cameraDot} />
              </View>

              <View style={styles.statusIconsRow}>
                <Wifi size={10} color={isDark ? '#94A3B8' : '#64748B'} />
                <Battery size={11} color={isDark ? '#94A3B8' : '#64748B'} />
              </View>
            </View>

            {/* App Header Inside Phone */}
            <Animated.View style={[styles.phoneAppHeader, { opacity: headerOpacity }]}>
              <View style={styles.appHeaderLeft}>
                <Image
                  source={require('../../../assets/ai_ads_camera_reference.png')}
                  style={styles.miniCameraLogo}
                  resizeMode="contain"
                />
                <View>
                  <Text
                    style={[
                      styles.phoneAppTitle,
                      { color: isDark ? '#FFFFFF' : '#0F172A' },
                    ]}
                  >
                    AI Ads<Text style={styles.tmSmall}>™</Text>
                  </Text>
                  <Text style={styles.phoneAppTagline}>Omnichannel Ad Engine</Text>
                </View>
              </View>

              <View style={styles.liveActivePill}>
                <View style={styles.greenLiveDot} />
                <Text style={styles.liveActiveText}>ACTIVE</Text>
              </View>
            </Animated.View>

            {/* ── LINE-BY-LINE FEATURE STREAM ── */}
            <View style={styles.featureStreamContainer}>
              {FEATURE_LINES.map((feat, index) => {
                const anim = lineAnims[index];
                const IconComp = feat.icon;

                return (
                  <Animated.View
                    key={feat.id}
                    style={[
                      styles.featureLineRow,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.05)'
                          : '#FFFFFF',
                        borderColor: isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(226, 232, 240, 0.9)',
                        opacity: anim.opacity,
                        transform: [
                          { translateY: anim.translateY },
                          { scale: anim.scale },
                        ],
                      },
                    ]}
                  >
                    {/* Feature Icon Dot */}
                    <View
                      style={[
                        styles.featureIconBadge,
                        { backgroundColor: `${feat.color}16` },
                      ]}
                    >
                      <IconComp size={12} color={feat.color} strokeWidth={2.4} />
                    </View>

                    {/* Feature Title & Description */}
                    <View style={styles.featureInfoCol}>
                      <Text
                        style={[
                          styles.featureLineTitle,
                          { color: isDark ? '#F1F5F9' : '#0F172A' },
                        ]}
                        numberOfLines={1}
                      >
                        {feat.name}
                      </Text>
                      <Text
                        style={[
                          styles.featureLineDesc,
                          { color: isDark ? '#94A3B8' : '#64748B' },
                        ]}
                        numberOfLines={1}
                      >
                        {feat.desc}
                      </Text>
                    </View>

                    {/* Feature Live Badge */}
                    <View
                      style={[
                        styles.featureLineBadge,
                        { backgroundColor: `${feat.color}14` },
                      ]}
                    >
                      <Check size={8} color={feat.color} strokeWidth={3} />
                      <Text
                        style={[
                          styles.featureLineBadgeText,
                          { color: feat.color },
                        ]}
                      >
                        {feat.badge}
                      </Text>
                    </View>
                  </Animated.View>
                );
              })}
            </View>

            {/* Bottom Celebration / Summary Pill */}
            <Animated.View
              style={[
                styles.celebrationPill,
                {
                  opacity: celebrationOpacity,
                  transform: [{ scale: celebrationScale }],
                },
              ]}
            >
              <Zap size={10} color="#2563EB" fill="#2563EB" />
              <Text style={styles.celebrationText}>
                All AI Systems Connected & Ready
              </Text>
            </Animated.View>
          </LinearGradient>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 325,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    position: 'relative',
  },

  // Soft glow backdrop
  ambientBackdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientBlurCircle: {
    width: 260,
    height: 260,
    borderRadius: 130,
  },

  // Phone 3D Wrapper
  phone3DWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Phone Outer Frame
  phoneFrame: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    borderWidth: 4,
    padding: 3,
    elevation: 16,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
  },

  // Phone Screen
  phoneScreen: {
    flex: 1,
    borderRadius: 26,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  // Status Bar
  statusBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  statusTimeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  dynamicIslandPill: {
    width: 48,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000000',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 6,
  },
  cameraDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1E293B',
  },
  statusIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // App Header
  phoneAppHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 6,
  },
  appHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniCameraLogo: {
    width: 22,
    height: 22,
  },
  phoneAppTitle: {
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  tmSmall: {
    fontSize: 8,
    fontWeight: '700',
  },
  phoneAppTagline: {
    fontSize: 8,
    color: '#94A3B8',
    fontWeight: '600',
  },
  liveActivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  greenLiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  liveActiveText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
  },

  // Feature Stream
  featureStreamContainer: {
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  featureLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 4.5,
    paddingHorizontal: 7,
    borderRadius: 10,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  featureIconBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureInfoCol: {
    flex: 1,
  },
  featureLineTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    lineHeight: 11,
  },
  featureLineDesc: {
    fontSize: 7.8,
    fontWeight: '500',
    lineHeight: 9.5,
  },
  featureLineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  featureLineBadgeText: {
    fontSize: 7.5,
    fontWeight: '800',
  },

  // Bottom Celebration Pill
  celebrationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginTop: 3,
  },
  celebrationText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#2563EB',
  },
});
