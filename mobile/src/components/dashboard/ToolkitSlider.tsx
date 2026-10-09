import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  FlatList,
} from 'react-native';
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
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export interface FeaturePreviewData {
  urlOrTarget: string;
  badge1: string;
  metricLabel: string;
  badge2: string;
  chips: [string, string];
  tags: [string, string, string, string];
}

export interface ToolkitSlideItem {
  id: string;
  badge: string;
  eyebrow: string;
  title: string;
  desc: string;
  color: string;
  glowColor: string;
  accentGradient: [string, string];
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  preview: FeaturePreviewData;
  onPress: (navigation: any) => void;
}

export const TOOLKIT_SLIDES: ToolkitSlideItem[] = [
  {
    id: 'brand_dna',
    badge: 'PERSISTENT BRAND MEMORY',
    eyebrow: '2026 EDITION • AI MEMORY CORE',
    title: 'Brand DNA Engine',
    desc: 'A persistent memory of your identity. It extracts your USPs, personas, and differentiators, enforcing brand safety.',
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    accentGradient: ['#D97706', '#F59E0B'],
    icon: Dna,
    preview: {
      urlOrTarget: 'URL: https://mybrand.com',
      badge1: 'Extracting',
      metricLabel: 'Brand Voice & Identity',
      badge2: '100% Synced',
      chips: ['USP: Zero Lag AI', 'Tone: Premium'],
      tags: ['#F59E0B', '#EC4899', '#8B5CF6', '#0EA5E9'],
    },
    onPress: (nav) => nav.navigate('More', { screen: 'BrandDna' }),
  },
  {
    id: 'seo',
    badge: 'AUTONOMOUS SEARCH ENGINE',
    eyebrow: 'RANK #1 ON GOOGLE • AUDITS',
    title: 'SEO Intelligence',
    desc: 'Audit competitor keywords, identify search gaps, and generate rank-ready blogs and technical metadata.',
    color: '#0D9488',
    glowColor: 'rgba(13, 148, 136, 0.45)',
    accentGradient: ['#0F766E', '#14B8A6'],
    icon: Search,
    preview: {
      urlOrTarget: 'Target: "ai ads marketing"',
      badge1: '#1 Rank',
      metricLabel: 'Search Visibility Health',
      badge2: '98/100 Score',
      chips: ['Keywords: 240+ Tracked', 'Traffic: +420%'],
      tags: ['#1 Google', 'High Intent', 'Auto Blog', 'Audited'],
    },
    onPress: (nav) => nav.navigate('More', { screen: 'SEO' }),
  },
  {
    id: 'campaigns',
    badge: 'MULTI-PLATFORM ADS ENGINE',
    eyebrow: 'OMNICHANNEL DEPLOYMENT',
    title: 'Ad Campaign Builder',
    desc: 'Generate and launch high-converting ad campaigns across Meta, Google & LinkedIn simultaneously.',
    color: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.45)',
    accentGradient: ['#2563EB', '#60A5FA'],
    icon: Layers,
    preview: {
      urlOrTarget: 'Channels: Meta + Google + Ads',
      badge1: 'Live Ads',
      metricLabel: 'Omnichannel Multi-Ad Engine',
      badge2: '4.8x ROAS',
      chips: ['A/B Creative Split', 'Budget: Auto-Sync'],
      tags: ['Feed 1:1', 'Story 9:16', 'Search Ads', 'Display'],
    },
    onPress: (nav) => nav.navigate('More', { screen: 'Campaigns' }),
  },
  {
    id: 'strategy',
    badge: '90-DAY STRATEGY BLUEPRINT',
    eyebrow: 'AUTONOMOUS CMO • ROADMAP',
    title: 'Marketing Strategy',
    desc: 'AI-engineered growth roadmap with daily execution steps, target audience personas, and KPIs.',
    color: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.45)',
    accentGradient: ['#7C3AED', '#A78BFA'],
    icon: Target,
    preview: {
      urlOrTarget: 'Autonomous CMO Blueprint',
      badge1: '90-Day Plan',
      metricLabel: 'Quarterly Growth Target: $250k',
      badge2: 'On Track',
      chips: ['Personas: 4 Defined', 'Cadence: Daily'],
      tags: ['Acquisition', 'Retention', 'SEO Engine', 'Virality'],
    },
    onPress: (nav) => nav.navigate('Strategy', { screen: 'StrategyHome' }),
  },
  {
    id: 'calendar',
    badge: 'SCHEDULED PIPELINE',
    eyebrow: 'AUTO-PUBLISH ENGINE',
    title: 'Content Calendar',
    desc: 'Interactive visual calendar to plan, review, approve, and auto-publish content live across platforms.',
    color: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    accentGradient: ['#059669', '#34D399'],
    icon: Calendar,
    preview: {
      urlOrTarget: 'Scheduled Omnichannel Queue',
      badge1: '18 Posts',
      metricLabel: 'Auto-Publish Delivery Engine',
      badge2: 'Live Synced',
      chips: ['Next Drop: Today 6PM', 'Approval: Approved'],
      tags: ['Instagram', 'LinkedIn', 'X / Twitter', 'Meta'],
    },
    onPress: (nav) => nav.navigate('CalendarTab', { screen: 'CalendarHome' }),
  },
  {
    id: 'website_builder',
    badge: 'ZERO-CODE LANDING PAGES',
    eyebrow: 'PROMPT-TO-PAGE GENERATOR',
    title: 'AI Website Builder',
    desc: 'Describe your page vision, receive responsive HTML/CSS layouts with hero sections and CTAs in 60s.',
    color: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.45)',
    accentGradient: ['#DB2777', '#F472B6'],
    icon: Globe,
    preview: {
      urlOrTarget: 'Prompt: "B2B SaaS landing page"',
      badge1: 'Built 60s',
      metricLabel: 'Responsive Layout & Sections',
      badge2: '100% Mobile',
      chips: ['Hero + Bento Grid', 'Export: React Code'],
      tags: ['Tailwind', 'Framer', 'SEO Meta', 'Fast CDN'],
    },
    onPress: (nav) => nav.navigate('More', { screen: 'WebsiteBuilder' }),
  },
  {
    id: 'asset_library',
    badge: 'CENTRALIZED MEDIA VAULT',
    eyebrow: 'SECURE CLOUD STORAGE',
    title: 'Asset Library',
    desc: 'Store, tag, search, and securely organize all your brand media, logos, and 4K creative templates.',
    color: '#059669',
    glowColor: 'rgba(5, 150, 105, 0.45)',
    accentGradient: ['#047857', '#10B981'],
    icon: FolderKanban,
    preview: {
      urlOrTarget: 'Media Vault: 142 4K Assets',
      badge1: 'Organized',
      metricLabel: 'Logos, Creatives & Banners',
      badge2: 'Cloud Synced',
      chips: ['Storage: Encrypted', 'Tags: AI Auto-Tagged'],
      tags: ['PNG 4K', 'SVG Vector', 'MP4 Reel', 'WEBP'],
    },
    onPress: (nav) => nav.navigate('AssetLibraryTab'),
  },
  {
    id: 'creative_studio',
    badge: '8K VISUAL GENERATOR',
    eyebrow: 'MULTI-FORMAT RENDERS',
    title: 'Creative Studio',
    desc: 'Generate photoreal graphics, vector ad visuals, and high-CTR social banners with instant format scaling.',
    color: '#7C3AED',
    glowColor: 'rgba(124, 58, 237, 0.45)',
    accentGradient: ['#6D28D9', '#8B5CF6'],
    icon: Palette,
    preview: {
      urlOrTarget: '8K Photoreal Visual Generator',
      badge1: '4 Variations',
      metricLabel: 'Instant Format Re-Scaling',
      badge2: 'Rendered',
      chips: ['Resolution: 8K UHD', 'Brand Safe: 100%'],
      tags: ['1:1 Square', '9:16 Story', '16:9 Banner', '4:5 Feed'],
    },
    onPress: (nav) => nav.navigate('More', { screen: 'CreativeStudio' }),
  },
  {
    id: 'content_studio',
    badge: 'HIGH-CONVERTING AI COPY',
    eyebrow: 'MULTI-CHANNEL HOOKS',
    title: 'Content Studio',
    desc: 'Generate viral captions, compelling ad copy, and persuasive CTAs for LinkedIn, Meta, and blogs.',
    color: '#E11D48',
    glowColor: 'rgba(225, 29, 72, 0.45)',
    accentGradient: ['#BE123C', '#FB7185'],
    icon: PenTool,
    preview: {
      urlOrTarget: 'High-Converting Copywriter',
      badge1: 'High CTR',
      metricLabel: 'Viral Hooks, Captions & CTAs',
      badge2: '5 Variants',
      chips: ['Tone: Punchy & Bold', 'Length: Multi-Format'],
      tags: ['Ad Copy', 'Hooks', 'Long Form', 'Email CTA'],
    },
    onPress: (nav) => nav.navigate('CreateTab', { screen: 'CreateHome' }),
  },
];

const REPEAT_CYCLES = 20;
const START_CYCLE = 10;
const START_INDEX = START_CYCLE * TOOLKIT_SLIDES.length;

export const ToolkitSlider: React.FC = () => {
  const { isDark } = useTheme();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  // Compact portrait card geometry
  const cardWidth = Math.min(width * 0.65, 236);
  const cardGap = 14;
  const cardStep = cardWidth + cardGap;

  // Infinite virtual dataset
  const infiniteData = useMemo(
    () => Array.from({ length: REPEAT_CYCLES }, () => TOOLKIT_SLIDES).flat(),
    []
  );

  // Active slide index (0 to 8)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const activeSlideIndexRef = useRef(0);

  // Current raw scroll index in infinite array
  const currentScrollIndexRef = useRef(START_INDEX);
  const isInteracting = useRef(false);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

  // Native animated scroll value
  const scrollX = useRef(new Animated.Value(START_INDEX * cardStep)).current;
  const flatListRef = useRef<FlatList<ToolkitSlideItem>>(null);

  // 1. Continuous real-time scroll synchronization
  const handleScroll = useMemo(
    () =>
      Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        {
          useNativeDriver: true,
          listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const offsetX = event.nativeEvent.contentOffset.x;
            const rawIndex = Math.round(offsetX / cardStep);
            currentScrollIndexRef.current = rawIndex;
            const moduloIndex =
              ((rawIndex % TOOLKIT_SLIDES.length) + TOOLKIT_SLIDES.length) %
              TOOLKIT_SLIDES.length;

            if (moduloIndex !== activeSlideIndexRef.current) {
              activeSlideIndexRef.current = moduloIndex;
              setActiveSlideIndex(moduloIndex);
            }
          },
        }
      ),
    [cardStep, scrollX]
  );

  // 2. Seamless infinite boundary reset when momentum ends
  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    isInteracting.current = false;
    const offsetX = event.nativeEvent.contentOffset.x;
    const rawIndex = Math.round(offsetX / cardStep);
    currentScrollIndexRef.current = rawIndex;
    const currentCycle = Math.floor(rawIndex / TOOLKIT_SLIDES.length);

    // If drifted too close to the virtual boundaries, silently snap back to START_CYCLE
    if (currentCycle <= 2 || currentCycle >= 18) {
      const modulo =
        ((rawIndex % TOOLKIT_SLIDES.length) + TOOLKIT_SLIDES.length) %
        TOOLKIT_SLIDES.length;
      const resetIndex = START_CYCLE * TOOLKIT_SLIDES.length + modulo;
      currentScrollIndexRef.current = resetIndex;
      flatListRef.current?.scrollToOffset({
        offset: resetIndex * cardStep,
        animated: false,
      });
      scrollX.setValue(resetIndex * cardStep);
    }

    startAutoScroll();
  };

  // 3. Robust auto-scroll cycle
  const stopAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  }, []);

  const startAutoScroll = useCallback(() => {
    stopAutoScroll();
    autoScrollTimer.current = setInterval(() => {
      if (isInteracting.current) return;
      const nextIndex = currentScrollIndexRef.current + 1;
      currentScrollIndexRef.current = nextIndex;
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * cardStep,
        animated: true,
      });
    }, 3200);
  }, [cardStep, stopAutoScroll]);

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [startAutoScroll, stopAutoScroll]);

  // Initial alignment on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToOffset({
        offset: START_INDEX * cardStep,
        animated: false,
      });
      scrollX.setValue(START_INDEX * cardStep);
    }, 60);

    return () => clearTimeout(timer);
  }, [cardStep, scrollX]);

  // Drag interaction handlers
  const handleScrollBeginDrag = () => {
    isInteracting.current = true;
    stopAutoScroll();
  };

  const handleScrollEndDrag = () => {
    setTimeout(() => {
      if (!isInteracting.current) {
        startAutoScroll();
      }
    }, 1500);
  };

  // Nav buttons
  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const nextIndex = currentScrollIndexRef.current + 1;
    currentScrollIndexRef.current = nextIndex;
    flatListRef.current?.scrollToOffset({
      offset: nextIndex * cardStep,
      animated: true,
    });
    startAutoScroll();
  };

  const handlePrev = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const prevIndex = currentScrollIndexRef.current - 1;
    currentScrollIndexRef.current = prevIndex;
    flatListRef.current?.scrollToOffset({
      offset: prevIndex * cardStep,
      animated: true,
    });
    startAutoScroll();
  };

  const handleSelectDot = (targetIdx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const curModulo =
      ((currentScrollIndexRef.current % TOOLKIT_SLIDES.length) +
        TOOLKIT_SLIDES.length) %
      TOOLKIT_SLIDES.length;

    let diff = targetIdx - curModulo;
    if (diff > 4) diff -= TOOLKIT_SLIDES.length;
    if (diff < -4) diff += TOOLKIT_SLIDES.length;

    const nextIndex = currentScrollIndexRef.current + diff;
    currentScrollIndexRef.current = nextIndex;
    flatListRef.current?.scrollToOffset({
      offset: nextIndex * cardStep,
      animated: true,
    });
    startAutoScroll();
  };

  const handleLaunchModule = (slide: ToolkitSlideItem) => {
    Haptics.selectionAsync().catch(() => {});
    try {
      slide.onPress(navigation);
    } catch (err) {
      console.warn('Navigation error:', err);
    }
  };

  // Card Content View
  const renderCardContent = (slide: ToolkitSlideItem, slideIndex: number) => {
    const IconComp = slide.icon;
    const isColorTag = slide.id === 'brand_dna';

    return (
      <View style={styles.cardContentContainer}>
        {/* 1. Card Top Badge Bar */}
        <View style={styles.cardTopBar}>
          <View
            style={[
              styles.badgePill,
              {
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : '#F1F5F9',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <View
              style={[
                styles.badgeIconCircle,
                { backgroundColor: `${slide.color}25` },
              ]}
            >
              <IconComp size={9} color={slide.color} strokeWidth={2.4} />
            </View>
            <Text style={[styles.badgeText, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>
              {slide.badge}
            </Text>
          </View>

          {/* Card Top Number - Always 100% matched to this specific card */}
          <Text style={[styles.cardTopNum, { color: isDark ? '#64748B' : '#94A3B8' }]}>
            0{slideIndex + 1}
          </Text>
        </View>

        {/* 2. Middle Visual Component Window */}
        <View
          style={[
            styles.mockupWindow,
            {
              backgroundColor: isDark ? '#070A11' : '#F8FAFC',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            },
          ]}
        >
          {/* Row 1: Target URL / Feature with Status Badge */}
          <View style={styles.mockupRow}>
            <Text
              style={[
                styles.mockupUrlText,
                { color: isDark ? '#FDE68A' : '#D97706' },
              ]}
              numberOfLines={1}
            >
              {slide.preview.urlOrTarget}
            </Text>
            <View
              style={[
                styles.mockupMiniBadge,
                { backgroundColor: `${slide.color}20` },
              ]}
            >
              <Text style={[styles.mockupMiniBadgeText, { color: slide.color }]}>
                {slide.preview.badge1}
              </Text>
            </View>
          </View>

          {/* Row 2: Metric / Core Feature Title & Synced Badge */}
          <View style={styles.mockupRow}>
            <Text
              style={[
                styles.mockupMetricTitle,
                { color: isDark ? '#FFFFFF' : '#0F172A' },
              ]}
              numberOfLines={1}
            >
              {slide.preview.metricLabel}
            </Text>
            <View style={styles.mockupSyncedBadge}>
              <Text style={styles.mockupSyncedText}>
                {slide.preview.badge2}
              </Text>
            </View>
          </View>

          {/* Row 3: Live Sub-Chips */}
          <View style={styles.mockupChipsRow}>
            <View style={[styles.mockupPill, { backgroundColor: isDark ? '#141C2B' : '#EDF2F7' }]}>
              <Text style={[styles.mockupPillText, { color: isDark ? '#CBD5E1' : '#475569' }]}>
                {slide.preview.chips[0]}
              </Text>
            </View>
            <View style={[styles.mockupPill, { backgroundColor: isDark ? '#141C2B' : '#EDF2F7' }]}>
              <Text style={[styles.mockupPillText, { color: isDark ? '#CBD5E1' : '#475569' }]}>
                {slide.preview.chips[1]}
              </Text>
            </View>
          </View>

          {/* Row 4: Palette Dots or Live Feature Tags */}
          <View style={styles.mockupTagsRow}>
            <Text style={[styles.mockupPaletteLabel, { color: isDark ? '#64748B' : '#94A3B8' }]}>
              {isColorTag ? 'Palette:' : 'Capabilities:'}
            </Text>
            {isColorTag ? (
              <View style={styles.paletteDotsRow}>
                {slide.preview.tags.map((c, i) => (
                  <View key={i} style={[styles.paletteDot, { backgroundColor: c }]} />
                ))}
              </View>
            ) : (
              <View style={styles.tagPillsRow}>
                {slide.preview.tags.map((t, i) => (
                  <View key={i} style={styles.microTagPill}>
                    <Text style={styles.microTagText}>{t}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* 3. Card Bottom Typography & CTA */}
        <View style={styles.cardBottom}>
          <Text style={[styles.eyebrowText, { color: slide.color }]}>
            {slide.eyebrow}
          </Text>
          <Text
            style={[
              styles.cardTitleText,
              { color: isDark ? '#FFFFFF' : '#0F172A' },
            ]}
            numberOfLines={1}
          >
            {slide.title}
          </Text>
          <Text
            style={[
              styles.cardDescText,
              { color: isDark ? '#94A3B8' : '#64748B' },
            ]}
            numberOfLines={2}
          >
            {slide.desc}
          </Text>

          {/* Launch Module Link Button */}
          <View style={styles.launchModuleRow}>
            <Text style={[styles.launchModuleText, { color: isDark ? '#A5B4FC' : '#4F46E5' }]}>
              Launch Module
            </Text>
            <View
              style={[
                styles.launchArrowCircle,
                {
                  backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(79, 70, 229, 0.12)',
                  borderColor: isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(79, 70, 229, 0.3)',
                },
              ]}
            >
              <ArrowRight size={11} color={isDark ? '#A5B4FC' : '#4F46E5'} strokeWidth={2.4} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Card Item Renderer with 60 FPS Native Interpolation
  const renderItem = useCallback(
    ({ item, index }: { item: ToolkitSlideItem; index: number }) => {
      const slideIndex =
        ((index % TOOLKIT_SLIDES.length) + TOOLKIT_SLIDES.length) %
        TOOLKIT_SLIDES.length;

      const scale = scrollX.interpolate({
        inputRange: [
          (index - 1) * cardStep,
          index * cardStep,
          (index + 1) * cardStep,
        ],
        outputRange: [0.88, 1.0, 0.88],
        extrapolate: 'clamp',
      });

      const opacity = scrollX.interpolate({
        inputRange: [
          (index - 2) * cardStep,
          (index - 1) * cardStep,
          index * cardStep,
          (index + 1) * cardStep,
          (index + 2) * cardStep,
        ],
        outputRange: [0, 0.55, 1.0, 0.55, 0],
        extrapolate: 'clamp',
      });

      const dimmerOpacity = scrollX.interpolate({
        inputRange: [
          (index - 1) * cardStep,
          index * cardStep,
          (index + 1) * cardStep,
        ],
        outputRange: [0.42, 0, 0.42],
        extrapolate: 'clamp',
      });

      const isCurrentActive = slideIndex === activeSlideIndex;

      return (
        <View style={[styles.cardItemWrapper, { width: cardStep }]}>
          <Animated.View
            style={[
              styles.cardAnimatedContainer,
              {
                width: cardWidth,
                transform: [{ scale }],
                opacity,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => {
                if (isCurrentActive) {
                  handleLaunchModule(item);
                } else {
                  Haptics.selectionAsync().catch(() => {});
                  currentScrollIndexRef.current = index;
                  flatListRef.current?.scrollToOffset({
                    offset: index * cardStep,
                    animated: true,
                  });
                  startAutoScroll();
                }
              }}
              style={[
                styles.cardCard,
                {
                  backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
                  borderColor: isDark
                    ? isCurrentActive
                      ? 'rgba(255, 255, 255, 0.16)'
                      : 'rgba(255, 255, 255, 0.08)'
                    : isCurrentActive
                    ? 'rgba(0, 0, 0, 0.10)'
                    : 'rgba(0, 0, 0, 0.06)',
                },
              ]}
            >
              {renderCardContent(item, slideIndex)}

              {/* Side Card Dimmer Mask for depth and clean edges */}
              <Animated.View
                style={[
                  styles.cardDimmerMask,
                  {
                    backgroundColor: isDark ? '#060910' : '#FFFFFF',
                    opacity: dimmerOpacity,
                  },
                ]}
                pointerEvents="none"
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      );
    },
    [cardStep, cardWidth, activeSlideIndex, isDark, scrollX, startAutoScroll]
  );

  const currentItem = TOOLKIT_SLIDES[activeSlideIndex];

  return (
    <View style={styles.container}>
      {/* Soft Ambient Glow Halo behind active card matching theme */}
      <View style={styles.ambientHaloBackdrop} pointerEvents="none">
        <View
          style={[
            styles.ambientHaloCircle,
            { backgroundColor: currentItem.glowColor },
          ]}
        />
      </View>

      {/* ── 3D COVERFLOW STAGE: Continuous Horizontal Track ── */}
      <View style={styles.stage}>
        <Animated.FlatList
          ref={flatListRef as any}
          data={infiniteData}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardStep}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum={true}
          bounces={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          initialScrollIndex={START_INDEX}
          getItemLayout={(_, index) => ({
            length: cardStep,
            offset: cardStep * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              flatListRef.current?.scrollToOffset({
                offset: info.index * cardStep,
                animated: false,
              });
            }, 50);
          }}
          contentContainerStyle={{
            paddingHorizontal: Math.max(0, (width - cardStep) / 2),
            alignItems: 'center',
          }}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
        />
      </View>

      {/* ── BOTTOM CONTROLS BAR: [ < ]   01 / 09   [ > ] (Synchronized) ── */}
      <View style={styles.bottomNavRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePrev}
          style={[
            styles.navCircleBtn,
            {
              backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
            },
          ]}
        >
          <ChevronLeft size={16} color={isDark ? '#FFFFFF' : '#0F172A'} strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.bottomCounterBox}>
          <Text style={[styles.counterActiveNum, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            0{activeSlideIndex + 1}
          </Text>
          <Text style={[styles.counterSlash, { color: isDark ? '#64748B' : '#94A3B8' }]}>
            /
          </Text>
          <Text style={[styles.counterTotalNum, { color: isDark ? '#64748B' : '#94A3B8' }]}>
            0{TOOLKIT_SLIDES.length}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleNext}
          style={[
            styles.navCircleBtn,
            {
              backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
            },
          ]}
        >
          <ChevronRight size={16} color={isDark ? '#FFFFFF' : '#0F172A'} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      {/* ── PAGINATION DOTS (Centered below counter, matching GIF) ── */}
      <View style={styles.dotsContainer}>
        {TOOLKIT_SLIDES.map((slide, idx) => {
          const isSelected = idx === activeSlideIndex;

          return (
            <TouchableOpacity
              key={slide.id}
              activeOpacity={0.7}
              onPress={() => handleSelectDot(idx)}
              style={styles.dotHitArea}
            >
              <View
                style={[
                  styles.dotCircle,
                  isSelected
                    ? [styles.activeDotCircle, { backgroundColor: isDark ? '#F59E0B' : '#EA580C' }]
                    : [
                        styles.inactiveDotCircle,
                        {
                          backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.2)'
                            : 'rgba(0, 0, 0, 0.18)',
                        },
                      ],
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 2,
    alignItems: 'center',
    position: 'relative',
  },

  // Ambient Glow Backdrop
  ambientHaloBackdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientHaloCircle: {
    width: 220,
    height: 280,
    borderRadius: 110,
    opacity: 0.26,
  },

  // Stage with 3D Depth Track
  stage: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 330,
  },
  cardItemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  cardAnimatedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCard: {
    minHeight: 310,
    borderRadius: 18,
    borderWidth: 1.2,
    paddingVertical: 12,
    paddingHorizontal: 11,
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowColor: '#000000',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'space-between',
  },
  cardDimmerMask: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
  },
  cardContentContainer: {
    width: '100%',
    minHeight: 286,
    justifyContent: 'space-between',
  },

  // Top Badge Row
  cardTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeIconCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  cardTopNum: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  // Mockup Window (Center UI Showcase)
  mockupWindow: {
    borderRadius: 11,
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 8,
    gap: 4,
    marginBottom: 6,
  },
  mockupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  mockupUrlText: {
    fontSize: 9,
    fontWeight: '700',
    flex: 1,
  },
  mockupMiniBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  mockupMiniBadgeText: {
    fontSize: 7.5,
    fontWeight: '800',
  },
  mockupMetricTitle: {
    fontSize: 10,
    fontWeight: '800',
    flex: 1,
  },
  mockupSyncedBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
  },
  mockupSyncedText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#10B981',
  },
  mockupChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 1,
  },
  mockupPill: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mockupPillText: {
    fontSize: 8,
    fontWeight: '600',
  },
  mockupTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 1,
  },
  mockupPaletteLabel: {
    fontSize: 8,
    fontWeight: '700',
  },
  paletteDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paletteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tagPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexWrap: 'wrap',
  },
  microTagPill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  microTagText: {
    fontSize: 7,
    color: '#94A3B8',
    fontWeight: '600',
  },

  // Bottom Content Typography
  cardBottom: {
    gap: 2,
  },
  eyebrowText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardTitleText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: 1,
  },
  cardDescText: {
    fontSize: 9.5,
    fontWeight: '500',
    lineHeight: 13.5,
    marginTop: 2,
  },
  launchModuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  launchModuleText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: -0.1,
    textDecorationLine: 'underline',
  },
  launchArrowCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom Navigation Controls Bar (Synchronized)
  bottomNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginTop: 6,
  },
  navCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowColor: '#000000',
  },
  bottomCounterBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    minWidth: 64,
    justifyContent: 'center',
  },
  counterActiveNum: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  counterSlash: {
    fontSize: 14,
    fontWeight: '600',
  },
  counterTotalNum: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Pagination Dots (Cleanly positioned with proper clearance)
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
  },
  dotHitArea: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  dotCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDotCircle: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  inactiveDotCircle: {
    width: 5.5,
    height: 5.5,
    borderRadius: 2.75,
  },
});
