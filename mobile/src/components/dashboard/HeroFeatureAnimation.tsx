import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import {
  Dna,
  Search,
  Layers,
  Target,
  Calendar,
  Globe,
  FolderKanban,
  Palette,
  PenTool,
  ChevronRight,
  Wifi,
  Battery,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export interface ToolkitFeatureItem {
  id: string;
  name: string;
  desc: string;
  badge: string;
  color: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  onPress: (navigation: any) => void;
}

export const TOOLKIT_FEATURES: ToolkitFeatureItem[] = [
  {
    id: 'brand_dna',
    name: 'Brand DNA',
    desc: 'Panch Tattva Voice & Memory',
    badge: 'Core Memory',
    color: '#EA580C',
    icon: Dna,
    onPress: (nav) => nav.navigate('More', { screen: 'BrandDna' }),
  },
  {
    id: 'seo',
    name: 'SEO Intelligence',
    desc: 'Rank #1 & Competitor Audit',
    badge: 'Rank #1',
    color: '#0D9488',
    icon: Search,
    onPress: (nav) => nav.navigate('More', { screen: 'SEO' }),
  },
  {
    id: 'campaigns',
    name: 'Ad Campaigns',
    desc: 'Meta, Google & LinkedIn Ads',
    badge: 'Omnichannel',
    color: '#3B82F6',
    icon: Layers,
    onPress: (nav) => nav.navigate('More', { screen: 'Campaigns' }),
  },
  {
    id: 'strategy',
    name: 'Marketing Strategy',
    desc: 'Autonomous 90-Day Plan',
    badge: 'Autonomous',
    color: '#8B5CF6',
    icon: Target,
    onPress: (nav) => nav.navigate('Strategy', { screen: 'StrategyHome' }),
  },
  {
    id: 'calendar',
    name: 'Content Calendar',
    desc: 'Smart Auto-Publishing Queue',
    badge: 'Auto-Publish',
    color: '#10B981',
    icon: Calendar,
    onPress: (nav) => nav.navigate('CalendarTab', { screen: 'CalendarHome' }),
  },
  {
    id: 'website_builder',
    name: 'AI Website Builder',
    desc: 'Instant Landing Pages in 60s',
    badge: 'Instant 60s',
    color: '#EC4899',
    icon: Globe,
    onPress: (nav) => nav.navigate('More', { screen: 'WebsiteBuilder' }),
  },
  {
    id: 'asset_library',
    name: 'Asset Library',
    desc: '4K Logos & Media Vault',
    badge: '4K Cloud',
    color: '#059669',
    icon: FolderKanban,
    onPress: (nav) => nav.navigate('AssetLibraryTab'),
  },
  {
    id: 'creative_studio',
    name: 'Creative Studio',
    desc: 'Photoreal Banners & Creatives',
    badge: '4K Photoreal',
    color: '#7C3AED',
    icon: Palette,
    onPress: (nav) => nav.navigate('More', { screen: 'CreativeStudio' }),
  },
  {
    id: 'content_studio',
    name: 'AI Copywriting',
    desc: 'High-Converting Copy & Hooks',
    badge: '+340% CTR',
    color: '#E11D48',
    icon: PenTool,
    onPress: (nav) => nav.navigate('CreateTab', { screen: 'CreateHome' }),
  },
];

// Single card geometry
const ITEM_HEIGHT = 54;
const ITEM_MARGIN_BOTTOM = 8;
const SINGLE_ITEM_SPAN = ITEM_HEIGHT + ITEM_MARGIN_BOTTOM; // 62px
const CYCLE_TOTAL_HEIGHT = TOOLKIT_FEATURES.length * SINGLE_ITEM_SPAN; // 9 * 62 = 558px

// Duplicated for 100% seamless infinite looping
const STREAM_FEATURES = [
  ...TOOLKIT_FEATURES,
  ...TOOLKIT_FEATURES,
  ...TOOLKIT_FEATURES,
];

export const HeroFeatureAnimation: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  // Continuous vertical ticker translateY
  const scrollAnim = useRef(new Animated.Value(0)).current;

  // Gentle floating bob
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Live indicator pulsing opacity
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Continuous Linear Auto-Scroll Loop (Native UI Thread)
    const scrollLoop = Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: -CYCLE_TOTAL_HEIGHT,
        duration: 18000, // 18 seconds for steady, comfortable reading speed
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    scrollLoop.start();

    // 2. Subtle Floating Bob
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -3.5,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 3.5,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();

    // 3. Pulsing Live Dot
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => {
      scrollLoop.stop();
      floatLoop.stop();
      pulseLoop.stop();
    };
  }, []);

  const handleCardPress = (item: ToolkitFeatureItem) => {
    Haptics.selectionAsync().catch(() => {});
    try {
      item.onPress(navigation);
    } catch (err) {
      console.warn('Navigation error:', err);
    }
  };

  const phoneWidth = Math.min(width * 0.78, 286);
  const phoneHeight = 340;

  const screenGradColors = isDark
    ? (['#0A0E17', '#0F172A', '#1A1838'] as const)
    : (['#FFFFFF', '#FFF5F8', '#F8FAFC'] as const);

  const maskTopColor = isDark ? '#0A0E17' : '#FFFFFF';
  const maskBottomColor = isDark ? '#1A1838' : '#F8FAFC';

  return (
    <View style={styles.container}>
      {/* Ambient Pulsing Glow Circle */}
      <View style={styles.ambientBackdrop} pointerEvents="none">
        <View
          style={[
            styles.ambientBlurCircle,
            {
              backgroundColor: isDark
                ? 'rgba(139, 92, 246, 0.16)'
                : 'rgba(252, 231, 243, 0.95)',
            },
          ]}
        />
      </View>

      {/* ── SLEEK SMARTPHONE MOCKUP ── */}
      <Animated.View
        style={[
          styles.phoneWrapper,
          {
            width: phoneWidth,
            height: phoneHeight,
            transform: [{ translateY: floatAnim }],
          },
        ]}
      >
        {/* Hardware Frame / Bezel */}
        <View
          style={[
            styles.phoneFrame,
            {
              backgroundColor: isDark ? '#090D16' : '#1E293B',
              borderColor: isDark ? '#334155' : '#334155',
              shadowColor: isDark ? '#8B5CF6' : '#F472B6',
            },
          ]}
        >
          {/* Hardware Side Button Accents */}
          <View style={styles.sideVolumeUp} />
          <View style={styles.sideVolumeDown} />
          <View style={styles.sidePowerBtn} />

          {/* Inner High-Resolution Display */}
          <LinearGradient
            colors={screenGradColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.phoneScreen}
          >
            {/* 1. Status Bar & Dynamic Island */}
            <View style={styles.statusBarRow}>
              <Text
                style={[
                  styles.statusTimeText,
                  { color: isDark ? '#94A3B8' : '#64748B' },
                ]}
              >
                9:41
              </Text>

              {/* Dynamic Island Notch Pill */}
              <View style={styles.dynamicIslandPill}>
                <View style={styles.cameraDot} />
              </View>

              <View style={styles.statusIconsRow}>
                <Wifi size={10} color={isDark ? '#94A3B8' : '#64748B'} />
                <Battery size={11} color={isDark ? '#94A3B8' : '#64748B'} />
              </View>
            </View>

            {/* 2. Compact Phone App Header */}
            <View style={styles.phoneAppHeader}>
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
                  <Text style={styles.phoneAppTagline}>Autonomous Toolkits</Text>
                </View>
              </View>

              {/* Pulsing Live Badge */}
              <View style={styles.liveActivePill}>
                <Animated.View
                  style={[
                    styles.greenLiveDot,
                    { opacity: pulseAnim },
                  ]}
                />
                <Text style={styles.liveActiveText}>AUTO-STREAM</Text>
              </View>
            </View>

            {/* 3. CONTINUOUS AUTO-SCROLLING TOOLKITS REEL VIEWPORT */}
            <View style={styles.scrollViewport}>
              {/* Top Gradient Dissolve Mask */}
              <LinearGradient
                colors={[maskTopColor, 'rgba(0,0,0,0)']}
                style={styles.topFadeMask}
                pointerEvents="none"
              />

              {/* Seamless Infinite Conveyor Container */}
              <Animated.View
                style={[
                  styles.streamContainer,
                  {
                    transform: [{ translateY: scrollAnim }],
                  },
                ]}
              >
                {STREAM_FEATURES.map((item, index) => {
                  const IconComponent = item.icon;

                  return (
                    <TouchableOpacity
                      key={`${item.id}-${index}`}
                      activeOpacity={0.78}
                      onPress={() => handleCardPress(item)}
                      style={[
                        styles.toolkitCard,
                        {
                          backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.05)'
                            : '#FFFFFF',
                          borderColor: isDark
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(226, 232, 240, 0.95)',
                        },
                      ]}
                    >
                      {/* Left: Glowing Icon Badge */}
                      <View
                        style={[
                          styles.cardIconBox,
                          {
                            backgroundColor: `${item.color}15`,
                            borderColor: `${item.color}35`,
                          },
                        ]}
                      >
                        <IconComponent
                          size={16}
                          color={item.color}
                          strokeWidth={2.4}
                        />
                      </View>

                      {/* Middle: Feature Title & Description */}
                      <View style={styles.cardInfoCol}>
                        <View style={styles.cardTitleRow}>
                          <Text
                            style={[
                              styles.cardTitleText,
                              { color: isDark ? '#F8FAFC' : '#0F172A' },
                            ]}
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.cardDescText,
                            { color: isDark ? '#94A3B8' : '#64748B' },
                          ]}
                          numberOfLines={1}
                        >
                          {item.desc}
                        </Text>
                      </View>

                      {/* Right: Category Badge Pill & Chevron */}
                      <View style={styles.cardRightCol}>
                        <View
                          style={[
                            styles.featureBadgePill,
                            {
                              backgroundColor: `${item.color}14`,
                              borderColor: `${item.color}30`,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.featureBadgeText,
                              { color: item.color },
                            ]}
                          >
                            {item.badge}
                          </Text>
                        </View>
                        <ChevronRight
                          size={11}
                          color={isDark ? '#64748B' : '#94A3B8'}
                          strokeWidth={2.2}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </Animated.View>

              {/* Bottom Gradient Dissolve Mask */}
              <LinearGradient
                colors={['rgba(0,0,0,0)', maskBottomColor]}
                style={styles.bottomFadeMask}
                pointerEvents="none"
              />
            </View>

            {/* 4. Bottom Home Indicator Bar */}
            <View style={styles.homeBarContainer}>
              <View
                style={[
                  styles.homeIndicatorBar,
                  { backgroundColor: isDark ? '#475569' : '#CBD5E1' },
                ]}
              />
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 12,
    position: 'relative',
  },

  // Soft Ambient Background Glow
  ambientBackdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientBlurCircle: {
    width: 270,
    height: 270,
    borderRadius: 135,
  },

  // Smartphone Wrapper
  phoneWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Smartphone Frame (Bezel)
  phoneFrame: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    borderWidth: 3.5,
    padding: 3,
    elevation: 14,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    position: 'relative',
  },

  // Side Hardware Accents
  sideVolumeUp: {
    position: 'absolute',
    left: -6,
    top: 68,
    width: 3.5,
    height: 24,
    borderRadius: 2,
    backgroundColor: '#475569',
  },
  sideVolumeDown: {
    position: 'absolute',
    left: -6,
    top: 100,
    width: 3.5,
    height: 24,
    borderRadius: 2,
    backgroundColor: '#475569',
  },
  sidePowerBtn: {
    position: 'absolute',
    right: -6,
    top: 80,
    width: 3.5,
    height: 34,
    borderRadius: 2,
    backgroundColor: '#475569',
  },

  // Inner Phone Screen
  phoneScreen: {
    flex: 1,
    borderRadius: 30,
    paddingHorizontal: 9,
    paddingTop: 8,
    paddingBottom: 6,
    overflow: 'hidden',
  },

  // Status Bar
  statusBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
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

  // Phone App Header
  phoneAppHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 6,
    paddingBottom: 4,
  },
  appHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniCameraLogo: {
    width: 20,
    height: 20,
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
    borderWidth: 0.5,
    borderColor: 'rgba(16, 185, 129, 0.25)',
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

  // ── Auto-Scrolling Viewport ──
  scrollViewport: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 16,
  },
  topFadeMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 22,
    zIndex: 10,
  },
  bottomFadeMask: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 26,
    zIndex: 10,
  },
  streamContainer: {
    width: '100%',
  },

  // ── Toolkit Feature Card ──
  toolkitCard: {
    height: ITEM_HEIGHT,
    marginBottom: ITEM_MARGIN_BOTTOM,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    gap: 9,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfoCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 1.5,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitleText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  cardDescText: {
    fontSize: 8.5,
    fontWeight: '500',
    lineHeight: 11,
  },
  cardRightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  featureBadgePill: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
  },
  featureBadgeText: {
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  // Bottom Home Bar
  homeBarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    paddingBottom: 1,
  },
  homeIndicatorBar: {
    width: 68,
    height: 3,
    borderRadius: 2,
  },
});
