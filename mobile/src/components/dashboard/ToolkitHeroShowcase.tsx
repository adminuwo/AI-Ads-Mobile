import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  PanResponder,
  useWindowDimensions,
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
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export interface ToolkitFeature {
  id: string;
  category: string;
  eyebrow: string;
  title: string;
  desc: string;
  color: string;
  glowColor: string;
  gradient: [string, string];
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  chips: [string, string, string];
  onPress: (navigation: any) => void;
}

export const TOOLKIT_FEATURES: ToolkitFeature[] = [
  {
    id: 'brand_dna',
    category: 'BRAND MEMORY CORE',
    eyebrow: 'PERSISTENT IDENTITY',
    title: 'Brand DNA Engine',
    desc: 'Extract your USPs, personas & tone into a permanent AI memory with 100% brand safety.',
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    gradient: ['#D97706', '#F59E0B'],
    icon: Dna,
    chips: ['USP Memory', 'Voice Synced', '100% Safe'],
    onPress: (nav) => nav.navigate('More', { screen: 'BrandDna' }),
  },
  {
    id: 'seo',
    category: 'SEARCH INTELLIGENCE',
    eyebrow: 'RANK #1 ON GOOGLE',
    title: 'SEO Intelligence',
    desc: 'Audit competitor keywords, find search gaps, and generate rank-ready blogs and metadata.',
    color: '#0D9488',
    glowColor: 'rgba(13, 148, 136, 0.4)',
    gradient: ['#0F766E', '#14B8A6'],
    icon: Search,
    chips: ['#1 Google', 'Keyword Audit', 'Auto Blogs'],
    onPress: (nav) => nav.navigate('More', { screen: 'SEO' }),
  },
  {
    id: 'campaigns',
    category: 'OMNICHANNEL ADS',
    eyebrow: 'MULTI-PLATFORM ENGINE',
    title: 'Ad Campaign Builder',
    desc: 'Generate and launch high-converting ads across Meta, Google & LinkedIn simultaneously.',
    color: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    gradient: ['#2563EB', '#60A5FA'],
    icon: Layers,
    chips: ['4.8x ROAS', 'Meta + Google', 'A/B Split'],
    onPress: (nav) => nav.navigate('More', { screen: 'Campaigns' }),
  },
  {
    id: 'strategy',
    category: 'AUTONOMOUS CMO',
    eyebrow: '90-DAY GROWTH BLUEPRINT',
    title: 'Marketing Strategy',
    desc: 'AI-engineered growth roadmap with daily execution steps, target audience personas & KPIs.',
    color: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    gradient: ['#7C3AED', '#A78BFA'],
    icon: Target,
    chips: ['90-Day Plan', 'CMO Engine', 'Daily KPIs'],
    onPress: (nav) => nav.navigate('Strategy', { screen: 'StrategyHome' }),
  },
  {
    id: 'calendar',
    category: 'AUTO-PUBLISH ENGINE',
    eyebrow: 'SCHEDULED PIPELINE',
    title: 'Content Calendar',
    desc: 'Visual calendar to plan, review, approve, and auto-publish content live across platforms.',
    color: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    gradient: ['#059669', '#34D399'],
    icon: Calendar,
    chips: ['Auto-Publish', 'Multi-Network', 'Visual Queue'],
    onPress: (nav) => nav.navigate('CalendarTab', { screen: 'CalendarHome' }),
  },
  {
    id: 'website_builder',
    category: 'ZERO-CODE BUILDER',
    eyebrow: 'PROMPT-TO-PAGE GENERATOR',
    title: 'AI Website Builder',
    desc: 'Describe your vision, get responsive landing pages with hero sections and CTAs in 60s.',
    color: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    gradient: ['#DB2777', '#F472B6'],
    icon: Globe,
    chips: ['Built in 60s', '100% Mobile', 'React Export'],
    onPress: (nav) => nav.navigate('More', { screen: 'WebsiteBuilder' }),
  },
  {
    id: 'asset_library',
    category: 'MEDIA VAULT',
    eyebrow: 'SECURE CLOUD STORAGE',
    title: 'Asset Library',
    desc: 'Store, tag, search, and securely organize all your brand media, logos, and 4K templates.',
    color: '#059669',
    glowColor: 'rgba(5, 150, 105, 0.4)',
    gradient: ['#047857', '#10B981'],
    icon: FolderKanban,
    chips: ['4K Assets', 'AI Tagging', 'Cloud Vault'],
    onPress: (nav) => nav.navigate('AssetLibraryTab'),
  },
  {
    id: 'creative_studio',
    category: 'VISUAL GENERATOR',
    eyebrow: '8K MULTI-FORMAT RENDERS',
    title: 'Creative Studio',
    desc: 'Generate photoreal graphics, vector visuals, and high-CTR banners with instant scaling.',
    color: '#7C3AED',
    glowColor: 'rgba(124, 58, 237, 0.4)',
    gradient: ['#6D28D9', '#8B5CF6'],
    icon: Palette,
    chips: ['8K UHD', 'Instant Scaling', 'High CTR'],
    onPress: (nav) => nav.navigate('More', { screen: 'CreativeStudio' }),
  },
  {
    id: 'content_studio',
    category: 'AI COPYWRITER',
    eyebrow: 'HIGH-CONVERTING HOOKS',
    title: 'Content Studio',
    desc: 'Generate viral captions, compelling ad copy, and persuasive CTAs for LinkedIn, Meta & blogs.',
    color: '#E11D48',
    glowColor: 'rgba(225, 29, 72, 0.4)',
    gradient: ['#BE123C', '#FB7185'],
    icon: PenTool,
    chips: ['Viral Hooks', 'Ad Copy', 'Multi-Format'],
    onPress: (nav) => nav.navigate('CreateTab', { screen: 'CreateHome' }),
  },
];

const AUTO_SLIDE_DURATION = 3800; // ms per story slide

export const ToolkitHeroShowcase: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  currentIndexRef.current = currentIndex;

  const isPaused = useRef(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Icon pulse micro-animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Start continuous story progress bar
  const startProgress = useCallback(() => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: AUTO_SLIDE_DURATION,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isPaused.current) {
        goToNext();
      }
    });
  }, [progressAnim]);

  // Transition to next feature
  const goToNext = useCallback(() => {
    const nextIdx = (currentIndexRef.current + 1) % TOOLKIT_FEATURES.length;
    transitionToSlide(nextIdx, 'left');
  }, []);

  // Transition to previous feature
  const goToPrev = useCallback(() => {
    const prevIdx =
      (currentIndexRef.current - 1 + TOOLKIT_FEATURES.length) %
      TOOLKIT_FEATURES.length;
    transitionToSlide(prevIdx, 'right');
  }, []);

  // Smooth slide transition
  const transitionToSlide = (targetIdx: number, direction: 'left' | 'right') => {
    progressAnim.stopAnimation();

    // Slide out
    Animated.timing(slideAnim, {
      toValue: direction === 'left' ? -1 : 1,
      duration: 180,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex(targetIdx);
      slideAnim.setValue(direction === 'left' ? 1 : -1);

      // Slide in
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
        useNativeDriver: true,
      }).start(() => {
        startProgress();
      });
    });
  };

  useEffect(() => {
    startProgress();

    // Subtle gentle pulse on icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      progressAnim.stopAnimation();
    };
  }, []);

  // Swipe gesture detection
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dy) < 30,
      onPanResponderGrant: () => {
        isPaused.current = true;
        progressAnim.stopAnimation();
      },
      onPanResponderRelease: (_, gestureState) => {
        isPaused.current = false;
        if (gestureState.dx < -40) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          goToNext();
        } else if (gestureState.dx > 40) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          goToPrev();
        } else {
          startProgress();
        }
      },
      onPanResponderTerminate: () => {
        isPaused.current = false;
        startProgress();
      },
    })
  ).current;

  const currentFeature = TOOLKIT_FEATURES[currentIndex];
  const IconComponent = currentFeature.icon;

  const handleLaunch = () => {
    Haptics.selectionAsync().catch(() => {});
    try {
      currentFeature.onPress(navigation);
    } catch (err) {
      console.warn('Navigation error:', err);
    }
  };

  const handleDotTap = (idx: number) => {
    if (idx === currentIndex) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    transitionToSlide(idx, idx > currentIndex ? 'left' : 'right');
  };

  // Interpolated slide transforms
  const contentTranslateX = slideAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-40, 0, 40],
  });

  const contentOpacity = slideAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 1, 0],
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* ── Soft Ambient Glow behind card ── */}
      <View style={styles.ambientGlowWrapper} pointerEvents="none">
        <View
          style={[
            styles.ambientGlowCircle,
            { backgroundColor: currentFeature.glowColor },
          ]}
        />
      </View>

      {/* ── Main Showcase Glass Card ── */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? '#0D111D' : '#FFFFFF',
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.06)',
            shadowColor: isDark ? '#000000' : currentFeature.color,
          },
        ]}
      >
        {/* ── 1. Top Story Segment Progress Bars (9 Features) ── */}
        <View style={styles.storyProgressRow}>
          {TOOLKIT_FEATURES.map((feat, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <TouchableOpacity
                key={feat.id}
                activeOpacity={0.7}
                onPress={() => handleDotTap(idx)}
                style={styles.storySegmentTrack}
              >
                {isCurrent ? (
                  <View
                    style={[
                      styles.storySegmentBase,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.12)'
                          : 'rgba(0, 0, 0, 0.08)',
                      },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.storySegmentFill,
                        {
                          backgroundColor: currentFeature.color,
                          width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          }),
                        },
                      ]}
                    />
                  </View>
                ) : (
                  <View
                    style={[
                      styles.storySegmentBase,
                      {
                        backgroundColor: isCompleted
                          ? currentFeature.color
                          : isDark
                          ? 'rgba(255, 255, 255, 0.12)'
                          : 'rgba(0, 0, 0, 0.08)',
                      },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── 2. Top Meta Header Row ── */}
        <View style={styles.metaRow}>
          {/* Left Category Pill */}
          <View
            style={[
              styles.categoryPill,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.06)'
                  : 'rgba(0, 0, 0, 0.04)',
                borderColor: `${currentFeature.color}35`,
              },
            ]}
          >
            <View
              style={[
                styles.categoryDot,
                { backgroundColor: currentFeature.color },
              ]}
            />
            <Text
              style={[
                styles.categoryText,
                { color: isDark ? '#E2E8F0' : '#334155' },
              ]}
            >
              {currentFeature.category}
            </Text>
          </View>

          {/* Right Counter + Arrow Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={goToPrev}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[
                styles.arrowBtn,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(0, 0, 0, 0.04)',
                },
              ]}
            >
              <ChevronLeft
                size={14}
                color={isDark ? '#94A3B8' : '#64748B'}
                strokeWidth={2.4}
              />
            </TouchableOpacity>

            <Text
              style={[
                styles.counterText,
                { color: isDark ? '#CBD5E1' : '#475569' },
              ]}
            >
              <Text
                style={{
                  color: isDark ? '#FFFFFF' : '#0F172A',
                  fontWeight: '800',
                }}
              >
                0{currentIndex + 1}
              </Text>
              {' / '}0{TOOLKIT_FEATURES.length}
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={goToNext}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[
                styles.arrowBtn,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(0, 0, 0, 0.04)',
                },
              ]}
            >
              <ChevronRight
                size={14}
                color={isDark ? '#94A3B8' : '#64748B'}
                strokeWidth={2.4}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 3. Animated Feature Showcase Body ── */}
        <Animated.View
          style={[
            styles.showcaseBody,
            {
              transform: [{ translateX: contentTranslateX }],
              opacity: contentOpacity,
            },
          ]}
        >
          {/* Main Content Row: Icon + Title & Desc */}
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={handleLaunch}
            style={styles.featureInfoRow}
          >
            {/* Glowing Icon Square */}
            <Animated.View
              style={[
                styles.iconBox,
                {
                  backgroundColor: `${currentFeature.color}15`,
                  borderColor: `${currentFeature.color}40`,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <IconComponent
                size={22}
                color={currentFeature.color}
                strokeWidth={2.2}
              />
            </Animated.View>

            {/* Title & Desc */}
            <View style={styles.textContainer}>
              <Text
                style={[styles.eyebrowText, { color: currentFeature.color }]}
              >
                {currentFeature.eyebrow}
              </Text>
              <Text
                style={[
                  styles.titleText,
                  { color: isDark ? '#FFFFFF' : '#0F172A' },
                ]}
                numberOfLines={1}
              >
                {currentFeature.title}
              </Text>
              <Text
                style={[
                  styles.descText,
                  { color: isDark ? '#94A3B8' : '#64748B' },
                ]}
                numberOfLines={2}
              >
                {currentFeature.desc}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Chips Row: 3 Highlight Tags */}
          <View style={styles.chipsRow}>
            {currentFeature.chips.map((chip, idx) => (
              <View
                key={idx}
                style={[
                  styles.chipPill,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.04)',
                    borderColor: isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.06)',
                  },
                ]}
              >
                <Sparkles size={8} color={currentFeature.color} />
                <Text
                  style={[
                    styles.chipText,
                    { color: isDark ? '#CBD5E1' : '#475569' },
                  ]}
                >
                  {chip}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── 4. Bottom Action Row: Launch Module CTA ── */}
        <View style={styles.bottomActionRow}>
          <Text
            style={[
              styles.swipeHintText,
              { color: isDark ? '#64748B' : '#94A3B8' },
            ]}
          >
            Swipe or tap to explore
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLaunch}
            style={styles.launchBtn}
          >
            <LinearGradient
              colors={currentFeature.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.launchGradient}
            >
              <Text style={styles.launchBtnText}>Open Tool</Text>
              <ArrowRight size={12} color="#FFFFFF" strokeWidth={2.4} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    position: 'relative',
    alignItems: 'center',
  },

  // Soft Ambient Glow
  ambientGlowWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientGlowCircle: {
    width: 240,
    height: 180,
    borderRadius: 90,
    opacity: 0.22,
  },

  // Main Card
  card: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    elevation: 4,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    overflow: 'hidden',
  },

  // 1. Story Segment Bars
  storyProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
    width: '100%',
  },
  storySegmentTrack: {
    flex: 1,
    paddingVertical: 2,
  },
  storySegmentBase: {
    height: 2.8,
    borderRadius: 1.5,
    overflow: 'hidden',
    width: '100%',
  },
  storySegmentFill: {
    height: '100%',
    borderRadius: 1.5,
  },

  // 2. Meta Row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  categoryText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  arrowBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: -0.2,
  },

  // 3. Showcase Body
  showcaseBody: {
    width: '100%',
  },
  featureInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 1,
  },
  eyebrowText: {
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  descText: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
    marginTop: 1,
  },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  chipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 8.5,
    fontWeight: '700',
  },

  // 4. Bottom Action Row
  bottomActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  swipeHintText: {
    fontSize: 8.5,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  launchBtn: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  launchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  launchBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
});
