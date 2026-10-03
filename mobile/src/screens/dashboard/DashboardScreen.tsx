import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles,
  Zap,
  Database,
  ImageIcon,
  Megaphone,
  ArrowRight,
  Dna,
  Search,
  PenTool,
  FolderKanban,
  Globe,
  Target,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/common/GlassCard';
import { BrandHeader } from '../../components/common/BrandHeader';
import { FloatingAISABrain } from '../../components/common/FloatingAISABrain';
import { analyticsApi, campaignApi } from '../../api';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { activeWorkspace, setIsQuickPostOpen, setIsScraperOpen, workspaces } = useWorkspace();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const isSmall = width < 375;

  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalBrands: workspaces.length || 1,
    totalPosts: 66,
    totalCampaigns: 0,
    activeCampaigns: 0,
  });

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'Marketer';

  // Waving Hand Animation
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const wave = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: -1, duration: 160, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: -0.6, duration: 160, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.delay(1400),
      ])
    );
    wave.start();
    return () => wave.stop();
  }, [waveAnim]);

  const waveRotation = waveAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-18deg', '0deg', '24deg'],
  });

  const loadData = async () => {
    try {
      const [analyticsRes, campaignsRes] = await Promise.all([
        analyticsApi.getSummary({
          workspaceId: activeWorkspace?._id || activeWorkspace?.id,
          brandName: activeWorkspace?.brandName,
        }),
        campaignApi.list({ workspaceId: activeWorkspace?._id || activeWorkspace?.id }).catch(() => ({ campaigns: [] })),
      ]);

      const totalPosts = analyticsRes?.analytics?.posts?.total || 66;
      const campaigns = campaignsRes?.campaigns || [];
      const activeCampaigns = campaigns.filter((c: any) =>
        ['ACTIVE', 'Active', 'running'].includes(c.status)
      ).length;

      setStats({
        totalBrands: workspaces.length || 1,
        totalPosts,
        totalCampaigns: campaigns.length,
        activeCampaigns,
      });
    } catch {}
  };

  useEffect(() => {
    loadData();
  }, [activeWorkspace?.id, workspaces.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.primary}
          />
        }
      >
        {/* ── 1. LUXURY HERO BANNER ── */}
        <LinearGradient
          colors={
            isDark
              ? ['#1E1B4B', '#312E81', '#0284C7']
              : ['#FFE5EC', '#F3E8FF', '#E0F2FE']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.heroCard,
            isSmall && { paddingTop: 14, paddingBottom: 12, paddingHorizontal: 12, borderRadius: 16 },
          ]}
        >
          {/* Greeting with Wavy Hand Animation */}
          <View style={styles.heroGreetingRow}>
            <Text
              style={[
                styles.heroGreeting,
                { color: isDark ? '#FFFFFF' : '#0F172A' },
                isSmall && { fontSize: 18, lineHeight: 24 },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {getTimeGreeting()},{' '}
              <Text style={{ color: isDark ? '#C084FC' : '#7C3AED', fontWeight: '800' }}>
                {displayName}
              </Text>
            </Text>
            <Animated.View style={{ transform: [{ rotate: waveRotation }], marginLeft: 6 }}>
              <Text style={[styles.waveEmoji, isSmall && { fontSize: 18 }]}>👋</Text>
            </Animated.View>
          </View>

          <Text
            style={[
              styles.heroTagline,
              { color: isDark ? '#A5B4FC' : '#1D4ED8' },
              isSmall && { fontSize: 11.5, letterSpacing: 1.4 },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            CREATE · PLAN · PUBLISH · GROW
          </Text>

          <Text
            style={[
              styles.heroBrandContext,
              { color: isDark ? '#CBD5E1' : '#475569' },
              isSmall && { fontSize: 12, lineHeight: 17, marginBottom: 8 },
            ]}
          >
            Create smarter content and grow your brand with AI Ads™
          </Text>

          {/* 4 Feature Highlights - Clean, no grey box */}
          <View style={[styles.pillChipsRow, isSmall && { marginVertical: 6 }]}>
            <View style={styles.cleanChip}>
              <Text
                style={[
                  styles.cleanChipText,
                  { color: isDark ? '#E2E8F0' : '#1E293B' },
                  isSmall && { fontSize: 10.5 },
                ]}
                numberOfLines={1}
              >
                ⚡ Faster
              </Text>
            </View>
            <View style={styles.cleanChip}>
              <Text
                style={[
                  styles.cleanChipText,
                  { color: isDark ? '#E2E8F0' : '#1E293B' },
                  isSmall && { fontSize: 10.5 },
                ]}
                numberOfLines={1}
              >
                🎨 Creative
              </Text>
            </View>
            <View style={styles.cleanChip}>
              <Text
                style={[
                  styles.cleanChipText,
                  { color: isDark ? '#E2E8F0' : '#1E293B' },
                  isSmall && { fontSize: 10.5 },
                ]}
                numberOfLines={1}
              >
                💡 Smarter
              </Text>
            </View>
            <View style={styles.cleanChip}>
              <Text
                style={[
                  styles.cleanChipText,
                  { color: isDark ? '#E2E8F0' : '#1E293B' },
                  isSmall && { fontSize: 10.5 },
                ]}
                numberOfLines={1}
              >
                📈 Results
              </Text>
            </View>
          </View>

          {/* Action Buttons - Full-width Grid Aligned */}
          <View style={[styles.heroActionRow, isSmall && { gap: 8, marginTop: 10 }, isTablet && { maxWidth: 420, alignSelf: 'center' }]}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => setIsScraperOpen(true)}
              style={[
                styles.heroBtn,
                isSmall && { paddingVertical: 7, paddingHorizontal: 4 },
              ]}
            >
              <Sparkles size={isSmall ? 12 : 13} color="#FFFFFF" />
              <Text
                style={[styles.heroBtnText, isSmall && { fontSize: 10.5 }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                Enter Your Brand
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => setIsQuickPostOpen(true)}
              style={[
                styles.heroBtn,
                isSmall && { paddingVertical: 7, paddingHorizontal: 4 },
              ]}
            >
              <Zap size={isSmall ? 12 : 13} color="#FDE047" fill="#FDE047" />
              <Text
                style={[styles.heroBtnText, isSmall && { fontSize: 10.5 }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                Quick Post
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── 2. KPI STATS (SINGLE ROW OF 3 CARDS) ── */}
        <View style={styles.kpiGrid}>
          {/* Total Brands */}
          <GlassCard
            style={[styles.kpiCard, { borderLeftColor: '#F59E0B' }]}
            onPress={() => navigation.navigate('More', { screen: 'BrandDna' })}
          >
            <View style={styles.kpiHeaderRow}>
              <View style={[styles.kpiIconWrapper, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Database size={13} color="#F59E0B" />
              </View>
              <Text
                style={[styles.kpiLabel, { color: '#F59E0B' }]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                Total Brands
              </Text>
            </View>

            <View style={styles.kpiBottomRow}>
              <View style={styles.kpiNumberCol}>
                <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>{stats.totalBrands}</Text>
                <Text style={[styles.kpiSub, { color: colors.textSecondary }]} numberOfLines={1}>
                  {stats.totalBrands} active
                </Text>
              </View>
              <View style={[styles.kpiArrowCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <ArrowRight size={10} color="#F59E0B" />
              </View>
            </View>
          </GlassCard>

          {/* Total Content */}
          <GlassCard
            style={[styles.kpiCard, { borderLeftColor: '#06B6D4' }]}
            onPress={() => navigation.navigate('More', { screen: 'AssetLibrary' })}
          >
            <View style={styles.kpiHeaderRow}>
              <View style={[styles.kpiIconWrapper, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                <ImageIcon size={13} color="#06B6D4" />
              </View>
              <Text
                style={[styles.kpiLabel, { color: '#06B6D4' }]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                Generated Content
              </Text>
            </View>

            <View style={styles.kpiBottomRow}>
              <View style={styles.kpiNumberCol}>
                <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>{stats.totalPosts}</Text>
                <Text style={[styles.kpiSub, { color: colors.textSecondary }]} numberOfLines={1}>
                  Saved posts
                </Text>
              </View>
              <View style={[styles.kpiArrowCircle, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                <ArrowRight size={10} color="#06B6D4" />
              </View>
            </View>
          </GlassCard>

          {/* Campaigns */}
          <GlassCard
            style={[styles.kpiCard, { borderLeftColor: '#F43F5E' }]}
            onPress={() => navigation.navigate('Strategy', { screen: 'Campaigns' })}
          >
            <View style={styles.kpiHeaderRow}>
              <View style={[styles.kpiIconWrapper, { backgroundColor: 'rgba(244, 63, 94, 0.15)' }]}>
                <Megaphone size={13} color="#F43F5E" />
              </View>
              <Text
                style={[styles.kpiLabel, { color: '#F43F5E' }]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                Campaigns
              </Text>
            </View>

            <View style={styles.kpiBottomRow}>
              <View style={styles.kpiNumberCol}>
                <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>{stats.totalCampaigns}</Text>
                <Text style={[styles.kpiSub, { color: colors.textSecondary }]} numberOfLines={1}>
                  {stats.activeCampaigns} active
                </Text>
              </View>
              <View style={[styles.kpiArrowCircle, { backgroundColor: 'rgba(244, 63, 94, 0.15)' }]}>
                <ArrowRight size={10} color="#F43F5E" />
              </View>
            </View>
          </GlassCard>
        </View>

        {/* ── 3. TOOLKIT (ACTION CIRCLES ROW) ── */}
        <View style={styles.toolkitSection}>
          <View style={styles.toolkitHeader}>
            <Globe size={18} color="#10B981" />
            <Text style={[styles.toolkitTitle, { color: colors.textPrimary }]}>TOOLKIT</Text>
          </View>

          {/* 6 Circular Toolkit Items (All 6 Visible in Single Row) */}
          <View style={styles.toolkitRow}>
            {[
              {
                id: '1',
                title: 'Brand\nDNA',
                icon: Dna,
                color: '#EA580C',
                bgColor: '#FFF7ED',
                onPress: () => navigation.navigate('More', { screen: 'BrandDna' }),
              },
              {
                id: '2',
                title: 'Strategy',
                icon: Target,
                color: '#2563EB',
                bgColor: '#EFF6FF',
                onPress: () => navigation.navigate('Strategy'),
              },
              {
                id: '3',
                title: 'SEO\nIntelligence',
                icon: Search,
                color: '#0D9488',
                bgColor: '#F0FDF4',
                onPress: () => navigation.navigate('Strategy', { screen: 'Seo' }),
              },
              {
                id: '4',
                title: 'Content\nStudio',
                icon: PenTool,
                color: '#E11D48',
                bgColor: '#FFF1F2',
                onPress: () => navigation.navigate('Studio'),
              },
              {
                id: '5',
                title: 'Creative\nStudio',
                icon: Sparkles,
                color: '#7C3AED',
                bgColor: '#FAF5FF',
                onPress: () => navigation.navigate('Studio', { tab: 'CREATIVE' }),
              },
              {
                id: '6',
                title: 'Asset\nLibrary',
                icon: FolderKanban,
                color: '#059669',
                bgColor: '#ECFDF5',
                onPress: () => navigation.navigate('More', { screen: 'AssetLibrary' }),
              },
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <TouchableOpacity
                  key={tool.id}
                  activeOpacity={0.75}
                  onPress={tool.onPress}
                  style={styles.toolItem}
                >
                  <View
                    style={[
                      styles.toolCircle,
                      {
                        backgroundColor: isDark ? colors.neu.card : colors.neu.card,
                        borderTopColor: colors.neu.borderLight,
                        borderLeftColor: colors.neu.borderLight,
                        borderBottomColor: colors.neu.borderDark,
                        borderRightColor: colors.neu.borderDark,
                        shadowColor: isDark ? '#000000' : '#A3B1C6',
                        shadowOpacity: isDark ? 0.7 : 0.6,
                      },
                    ]}
                  >
                    <Icon size={19} color={tool.color} />
                  </View>

                  <Text
                    style={[styles.toolTitle, { color: colors.textPrimary }]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.9}
                  >
                    {tool.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── 4. AI WEBSITE BUILDER SPOTLIGHT ── */}
        <GlassCard glow style={[styles.spotlightCard, { borderLeftColor: '#0284C7' }]}>
          <View style={styles.spotlightHeader}>
            <View style={styles.spotlightLeft}>
              <View style={[styles.spotlightIconCircle, { backgroundColor: 'rgba(2, 132, 199, 0.15)' }]}>
                <Globe size={18} color="#0284C7" />
              </View>
              <View>
                <Text style={[styles.spotlightTitle, { color: colors.textPrimary }]}>
                  AI Website Builder
                </Text>
                <Text style={[styles.spotlightSub, { color: colors.textSecondary }]}>
                  Autonomous React Applications
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('More', { screen: 'WebsiteBuilder' })}
              style={[styles.spotlightPill, { backgroundColor: colors.accent.tagBg }]}
            >
              <Text style={[styles.spotlightPillText, { color: colors.accent.primary }]}>
                Open Studio
              </Text>
              <ArrowRight size={13} color={colors.accent.primary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.spotlightDesc, { color: colors.textSecondary }]}>
            Synthesize standalone React web applications, DTC stores, and SaaS portals with live sandbox preview and component tokens.
          </Text>
        </GlassCard>

        {/* ── 5. QUICK PLATFORM GOVERNANCE ROW ── */}
        <View style={styles.govRow}>
          <GlassCard
            style={[styles.govCard, { borderLeftColor: '#6366F1' }]}
            onPress={() => navigation.navigate('More', { screen: 'TeamRbac' })}
          >
            <View style={styles.govTop}>
              <View style={[styles.govIconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                <Target size={14} color="#6366F1" />
              </View>
              <ArrowRight size={13} color="#6366F1" />
            </View>
            <Text style={[styles.govCardTitle, { color: colors.textPrimary }]}>
              Team & RBAC
            </Text>
            <Text style={[styles.govCardSub, { color: colors.textSecondary }]}>
              Permissions matrix
            </Text>
          </GlassCard>

          <GlassCard
            style={[styles.govCard, { borderLeftColor: '#EC4899' }]}
            onPress={() => navigation.navigate('More', { screen: 'AdminDashboard' })}
          >
            <View style={styles.govTop}>
              <View style={[styles.govIconCircle, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                <Zap size={14} color="#EC4899" />
              </View>
              <ArrowRight size={13} color="#EC4899" />
            </View>
            <Text style={[styles.govCardTitle, { color: colors.textPrimary }]}>
              Admin Console
            </Text>
            <Text style={[styles.govCardSub, { color: colors.textSecondary }]}>
              Telemetry & quotas
            </Text>
          </GlassCard>
        </View>
      </ScrollView>

      {/* Persistent Floating AISA Brain Avatar */}
      <FloatingAISABrain />
    </View>
  );
};


const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120, // Sits above tab bar & floating copilot
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
  },
  heroCard: {
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.75)',
    borderLeftColor: 'rgba(255, 255, 255, 0.6)',
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    borderRightColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  heroGreetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  heroGreeting: {
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 27,
    letterSpacing: -0.3,
  },
  waveEmoji: {
    fontSize: 21,
    includeFontPadding: false,
    backgroundColor: 'transparent',
  },
  heroTagline: {
    fontSize: 12.5,
    fontWeight: '800',
    lineHeight: 17,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginTop: 6,
    marginBottom: 2,
  },
  heroBrandContext: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18.5,
    marginTop: 4,
    marginBottom: 10,
  },
  pillChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    marginVertical: 10,
  },
  cleanChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  cleanChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'transparent',
    includeFontPadding: false,
  },
  heroActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    width: '100%',
  },
  heroBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  heroBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
    lineHeight: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 7,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'space-between',
    minHeight: 88,
  },
  cardAccentBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 3.5,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  kpiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  kpiIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  kpiLabel: {
    flex: 1,
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    lineHeight: 12,
  },
  kpiBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  kpiNumberCol: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.4,
    lineHeight: 22,
  },
  kpiSub: {
    fontSize: 9,
    fontWeight: '500',
    lineHeight: 12,
    marginTop: 1,
  },
  kpiArrowCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: 2,
  },
  toolkitSection: {
    marginBottom: 20,
  },
  toolkitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  toolkitTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
    paddingRight: 10,
    includeFontPadding: false,
  },
  toolkitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toolItem: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 60,
  },
  toolCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    borderWidth: 1.5,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },

  toolTitle: {
    fontSize: 10.5,
    fontWeight: '600',
    lineHeight: 13.5,
    letterSpacing: -0.2,
    textAlign: 'center',
    includeFontPadding: false,
  },
  spotlightCard: {
    padding: 16,
    marginTop: 16,
    gap: 8,
  },
  spotlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spotlightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  spotlightIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  spotlightSub: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
  },
  spotlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  spotlightPillText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.caption,
  },
  spotlightDesc: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.caption,
  },
  govRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  govCard: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  govTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  govIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  govCardTitle: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.caption,
  },
  govCardSub: {
    fontSize: 10,
    lineHeight: 14,
  },
});

