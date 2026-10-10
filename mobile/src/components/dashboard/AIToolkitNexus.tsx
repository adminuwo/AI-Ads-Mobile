import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
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
  Sparkles,
  Zap,
  Activity,
  Cpu,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';

export interface AgentModule {
  id: string;
  code: string;
  name: string;
  role: string;
  desc: string;
  color: string;
  glowColor: string;
  gradient: [string, string];
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  metricLabel: string;
  metricValue: string;
  metricTag: string;
  tags: [string, string];
  onPress: (navigation: any) => void;
}

export const AGENT_MODULES: AgentModule[] = [
  {
    id: 'brand_dna',
    code: 'CORE • 01',
    name: 'Brand DNA Engine',
    role: 'Autonomous Memory Core',
    desc: 'Extracts your unique voice, personas & USPs into a persistent AI memory model.',
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    gradient: ['#D97706', '#F59E0B'],
    icon: Dna,
    metricLabel: 'BRAND VOICE',
    metricValue: '100% Synced',
    metricTag: 'AI Guardrails',
    tags: ['Persistent Memory', 'Zero Drift'],
    onPress: (nav) => nav.navigate('More', { screen: 'BrandDna' }),
  },
  {
    id: 'seo',
    code: 'SEARCH • 02',
    name: 'SEO Intelligence',
    role: 'Competitor Gap Auditor',
    desc: 'Audits competitor keywords and auto-generates rank-ready blogs and schema metadata.',
    color: '#0D9488',
    glowColor: 'rgba(13, 148, 136, 0.45)',
    gradient: ['#0F766E', '#14B8A6'],
    icon: Search,
    metricLabel: 'ORGANIC HEALTH',
    metricValue: '98/100 Score',
    metricTag: '#1 Google Rank',
    tags: ['240+ Keywords', 'Auto Blogs'],
    onPress: (nav) => nav.navigate('More', { screen: 'SEO' }),
  },
  {
    id: 'campaigns',
    code: 'OMNI • 03',
    name: 'Ad Campaign Builder',
    role: 'Multi-Channel Ad Deployer',
    desc: 'Simultaneously generates and launches high-converting ad sets on Meta, Google & LinkedIn.',
    color: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.45)',
    gradient: ['#2563EB', '#60A5FA'],
    icon: Layers,
    metricLabel: 'ESTIMATED ROAS',
    metricValue: '4.8x Target',
    metricTag: 'Live Budget Sync',
    tags: ['A/B Creative', 'Feed & Stories'],
    onPress: (nav) => nav.navigate('More', { screen: 'Campaigns' }),
  },
  {
    id: 'strategy',
    code: 'CMO • 04',
    name: 'Marketing Strategy',
    role: 'Autonomous CMO Blueprint',
    desc: 'Engineers 90-day growth roadmaps with daily execution steps, target personas and KPIs.',
    color: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.45)',
    gradient: ['#7C3AED', '#A78BFA'],
    icon: Target,
    metricLabel: 'GROWTH TARGET',
    metricValue: '$250k Pace',
    metricTag: '90-Day Roadmap',
    tags: ['Daily Actions', 'Persona Engine'],
    onPress: (nav) => nav.navigate('Strategy', { screen: 'StrategyHome' }),
  },
  {
    id: 'calendar',
    code: 'QUEUE • 05',
    name: 'Content Calendar',
    role: 'Live Auto-Publish Engine',
    desc: 'Visual schedule to plan, review, approve, and auto-dispatch content across social channels.',
    color: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    gradient: ['#059669', '#34D399'],
    icon: Calendar,
    metricLabel: 'SCHEDULED QUEUE',
    metricValue: '18 Posts Live',
    metricTag: 'Next: 6:00 PM',
    tags: ['Auto-Dispatch', 'Omnichannel'],
    onPress: (nav) => nav.navigate('CalendarTab', { screen: 'CalendarHome' }),
  },
  {
    id: 'website_builder',
    code: 'WEB • 06',
    name: 'AI Website Builder',
    role: 'Prompt-To-Page Generator',
    desc: 'Transforms text prompts into responsive, production-ready landing pages in 60 seconds.',
    color: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.45)',
    gradient: ['#DB2777', '#F472B6'],
    icon: Globe,
    metricLabel: 'GENERATION TIME',
    metricValue: '60s Export',
    metricTag: 'Mobile Optimized',
    tags: ['Bento Grid', 'Tailwind/React'],
    onPress: (nav) => nav.navigate('More', { screen: 'WebsiteBuilder' }),
  },
  {
    id: 'asset_library',
    code: 'VAULT • 07',
    name: 'Asset Library',
    role: 'Centralized Media Vault',
    desc: 'AI-tagged cloud storage for brand logos, vector assets, 4K templates, and ad creatives.',
    color: '#059669',
    glowColor: 'rgba(5, 150, 105, 0.45)',
    gradient: ['#047857', '#10B981'],
    icon: FolderKanban,
    metricLabel: 'MEDIA ASSETS',
    metricValue: '142 Files',
    metricTag: 'AES-256 Encrypted',
    tags: ['AI Auto-Tag', 'Instant Fetch'],
    onPress: (nav) => nav.navigate('AssetLibraryTab'),
  },
  {
    id: 'creative_studio',
    code: 'STUDIO • 08',
    name: 'Creative Studio',
    role: '8K Photoreal Visual Engine',
    desc: 'Renders high-CTR photoreal creatives and vector illustrations with 1-click format resizing.',
    color: '#7C3AED',
    glowColor: 'rgba(124, 58, 237, 0.45)',
    gradient: ['#6D28D9', '#8B5CF6'],
    icon: Palette,
    metricLabel: 'OUTPUT QUALITY',
    metricValue: '8K UHD Renders',
    metricTag: 'Multi-Aspect Ratio',
    tags: ['1:1 • 9:16 • 16:9', 'Brand Safe'],
    onPress: (nav) => nav.navigate('More', { screen: 'CreativeStudio' }),
  },
  {
    id: 'content_studio',
    code: 'COPY • 09',
    name: 'Content Studio',
    role: 'Viral AI Copywriter',
    desc: 'Produces viral hooks, ad copy variations, and persuasive CTAs optimized for Meta & LinkedIn.',
    color: '#E11D48',
    glowColor: 'rgba(225, 29, 72, 0.45)',
    gradient: ['#BE123C', '#FB7185'],
    icon: PenTool,
    metricLabel: 'ENGAGEMENT PACE',
    metricValue: 'High CTR Hooks',
    metricTag: '5 Variants Each',
    tags: ['Punchy CTAs', 'Multi-Language'],
    onPress: (nav) => nav.navigate('Studio'),
  },
];

const AUTO_ROTATE_MS = 3800;

export const AIToolkitNexus: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { setActiveToolkitFeature } = useWorkspace();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);
  activeIdxRef.current = activeIdx;

  const dockScrollRef = useRef<ScrollView>(null);
  const isInteracting = useRef(false);

  // Animations
  const morphAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Shimmer scanning light loop
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Radar pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Morph to new agent
  const selectAgent = useCallback((targetIdx: number) => {
    if (targetIdx === activeIdxRef.current) return;
    Haptics.selectionAsync().catch(() => {});

    // Morph down
    Animated.timing(morphAnim, {
      toValue: 0.94,
      duration: 110,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setActiveIdx(targetIdx);

      // Auto-scroll dock to make active icon visible
      dockScrollRef.current?.scrollTo({
        x: Math.max(0, targetIdx * 48 - width / 2 + 30),
        animated: true,
      });

      // Morph up with spring bounce
      Animated.spring(morphAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }).start();
    });
  }, [width, morphAnim]);

  // Auto-rotation timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (isInteracting.current) return;
      const next = (activeIdxRef.current + 1) % AGENT_MODULES.length;
      selectAgent(next);
    }, AUTO_ROTATE_MS);

    return () => clearInterval(timer);
  }, [selectAgent]);

  const activeAgent = AGENT_MODULES[activeIdx];
  const IconComp = activeAgent.icon;

  const handleLaunch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const isToolkitItem = [
      'brand_dna',
      'seo',
      'campaigns',
      'strategy',
      'website_builder',
      'creative_studio',
      'content_studio',
    ].includes(activeAgent.id);

    if (isToolkitItem) {
      setActiveToolkitFeature(activeAgent.id);
    } else {
      setActiveToolkitFeature(null);
    }

    try {
      activeAgent.onPress(navigation);
    } catch (e) {
      console.warn('Navigation error:', e);
    }
  };

  // Shimmer beam translate
  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={styles.nexusContainer}>
      {/* ── Soft Ambient Radial Backdrop ── */}
      <View style={styles.ambientHalo} pointerEvents="none">
        <View
          style={[
            styles.ambientCircle,
            { backgroundColor: activeAgent.glowColor },
          ]}
        />
      </View>

      {/* ── 1. Top Cybernetic Status Bar: [ ● AI SUITE RUNNING • 9 AGENTS ] ── */}
      <View style={styles.statusBarRow}>
        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            },
          ]}
        >
          <Animated.View
            style={[
              styles.radarDot,
              {
                backgroundColor: activeAgent.color,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: isDark ? '#E2E8F0' : '#1E293B' },
            ]}
          >
            NEXUS AI SUITE
          </Text>
          <View
            style={[
              styles.statusDivider,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
            ]}
          />
          <Text style={[styles.statusSubText, { color: activeAgent.color }]}>
            {activeAgent.code}
          </Text>
        </View>

        {/* Live Active Pill */}
        <View
          style={[
            styles.liveTagPill,
            { backgroundColor: `${activeAgent.color}15`, borderColor: `${activeAgent.color}35` },
          ]}
        >
          <Activity size={10} color={activeAgent.color} />
          <Text style={[styles.liveTagText, { color: activeAgent.color }]}>
            ONLINE
          </Text>
        </View>
      </View>

      {/* ── 2. The Futuristic Obsidian Glass Showcase Card ── */}
      <Animated.View
        style={[
          styles.nexusCard,
          {
            backgroundColor: isDark ? '#080C14' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
            shadowColor: activeAgent.color,
            transform: [{ scale: morphAnim }],
          },
        ]}
      >
        {/* Continuous Gliding Shimmer Beam */}
        <Animated.View
          style={[
            styles.shimmerBeam,
            {
              transform: [{ translateX: shimmerTranslateX }],
            },
          ]}
          pointerEvents="none"
        />

        <TouchableOpacity
          activeOpacity={0.92}
          onPress={handleLaunch}
          style={styles.cardInteractiveInner}
        >
          {/* Top Row: Glowing Holographic Icon + Title & Category */}
          <View style={styles.cardHeaderRow}>
            {/* Holographic Glowing Icon Box */}
            <View
              style={[
                styles.iconGlowBox,
                {
                  backgroundColor: `${activeAgent.color}18`,
                  borderColor: `${activeAgent.color}45`,
                },
              ]}
            >
              <IconComp size={22} color={activeAgent.color} strokeWidth={2.4} />
            </View>

            {/* Title & Role */}
            <View style={styles.headerInfo}>
              <View style={styles.roleRow}>
                <Text style={[styles.roleText, { color: activeAgent.color }]}>
                  {activeAgent.role}
                </Text>
              </View>
              <Text
                style={[
                  styles.titleText,
                  { color: isDark ? '#FFFFFF' : '#0F172A' },
                ]}
                numberOfLines={1}
              >
                {activeAgent.name}
              </Text>
            </View>

            {/* Micro Launch Arrow Pill */}
            <View
              style={[
                styles.launchArrowPill,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                  borderColor: `${activeAgent.color}35`,
                },
              ]}
            >
              <ArrowRight size={13} color={activeAgent.color} strokeWidth={2.4} />
            </View>
          </View>

          {/* Middle: Feature Description */}
          <Text
            style={[
              styles.descText,
              { color: isDark ? '#94A3B8' : '#64748B' },
            ]}
            numberOfLines={2}
          >
            {activeAgent.desc}
          </Text>

          {/* Bottom Telemetry HUD: Live Metric Window */}
          <View
            style={[
              styles.telemetryHUD,
              {
                backgroundColor: isDark ? '#0E1422' : '#F8FAFC',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            {/* Left Telemetry: Metric Label & Big Value */}
            <View style={styles.telemetryLeft}>
              <Text style={[styles.hudLabel, { color: isDark ? '#64748B' : '#94A3B8' }]}>
                {activeAgent.metricLabel}
              </Text>
              <Text style={[styles.hudValue, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                {activeAgent.metricValue}
              </Text>
            </View>

            {/* Right Telemetry: Glowing Highlight Badge */}
            <View
              style={[
                styles.hudBadge,
                { backgroundColor: `${activeAgent.color}20`, borderColor: `${activeAgent.color}40` },
              ]}
            >
              <Sparkles size={10} color={activeAgent.color} />
              <Text style={[styles.hudBadgeText, { color: activeAgent.color }]}>
                {activeAgent.metricTag}
              </Text>
            </View>
          </View>

          {/* Micro Tags Bar */}
          <View style={styles.tagsRow}>
            {activeAgent.tags.map((tag, idx) => (
              <View
                key={idx}
                style={[
                  styles.tagChip,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                  },
                ]}
              >
                <Text style={[styles.tagChipText, { color: isDark ? '#CBD5E1' : '#475569' }]}>
                  {tag}
                </Text>
              </View>
            ))}

            <View style={styles.touchHintBox}>
              <Text style={[styles.touchHintText, { color: isDark ? '#64748B' : '#94A3B8' }]}>
                Tap to Open
              </Text>
              <Zap size={9} color={activeAgent.color} />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* ── 3. The 2026 Interactive Cyber Dock (Mac-OS / VisionOS Style) ── */}
      <View
        style={[
          styles.cyberDockContainer,
          {
            backgroundColor: isDark ? 'rgba(13, 17, 29, 0.85)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)',
          },
        ]}
      >
        <ScrollView
          ref={dockScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dockScrollContent}
          onTouchStart={() => { isInteracting.current = true; }}
          onTouchEnd={() => {
            setTimeout(() => { isInteracting.current = false; }, 2500);
          }}
        >
          {AGENT_MODULES.map((item, idx) => {
            const isSelected = idx === activeIdx;
            const ItemIcon = item.icon;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.75}
                onPress={() => selectAgent(idx)}
                style={styles.dockItemTouchArea}
              >
                <View
                  style={[
                    styles.dockIconBox,
                    isSelected
                      ? [
                          styles.dockIconBoxActive,
                          {
                            backgroundColor: `${item.color}25`,
                            borderColor: item.color,
                            shadowColor: item.color,
                          },
                        ]
                      : [
                          styles.dockIconBoxInactive,
                          {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                            borderColor: 'transparent',
                          },
                        ],
                  ]}
                >
                  <ItemIcon
                    size={16}
                    color={isSelected ? item.color : isDark ? '#64748B' : '#94A3B8'}
                    strokeWidth={isSelected ? 2.5 : 1.8}
                  />
                </View>

                {/* Glowing Active Underline Indicator */}
                {isSelected && (
                  <View
                    style={[
                      styles.dockActiveDot,
                      { backgroundColor: item.color, shadowColor: item.color },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nexusContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 6,
    alignItems: 'center',
    position: 'relative',
  },

  // Soft Ambient Halo
  ambientHalo: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientCircle: {
    width: 250,
    height: 190,
    borderRadius: 95,
    opacity: 0.24,
  },

  // 1. Status Bar
  statusBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  radarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  statusDivider: {
    width: 1,
    height: 9,
  },
  statusSubText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  liveTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  liveTagText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // 2. Obsidian Glass Hero Card
  nexusCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1.2,
    overflow: 'hidden',
    position: 'relative',
    elevation: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
  },
  shimmerBeam: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardInteractiveInner: {
    padding: 13,
    gap: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  iconGlowBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 1,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  launchArrowPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  descText: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14.5,
  },

  // Telemetry HUD Box
  telemetryHUD: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  telemetryLeft: {
    gap: 1,
  },
  hudLabel: {
    fontSize: 7.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  hudValue: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  hudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  hudBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
  },

  // Tags Row
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  tagChip: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 1,
  },
  tagChipText: {
    fontSize: 8,
    fontWeight: '600',
  },
  touchHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  touchHintText: {
    fontSize: 8.5,
    fontWeight: '700',
  },

  // 3. Cyber Dock (VisionOS Style)
  cyberDockContainer: {
    width: '100%',
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dockScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  dockItemTouchArea: {
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 2,
    position: 'relative',
  },
  dockIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockIconBoxActive: {
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  dockIconBoxInactive: {},
  dockActiveDot: {
    position: 'absolute',
    bottom: -1,
    width: 14,
    height: 2.5,
    borderRadius: 1.5,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
  },
});
