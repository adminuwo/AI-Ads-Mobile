import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
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
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/common/GlassCard';
import { BrandHeader } from '../../components/common/BrandHeader';
import { FloatingAISABrain } from '../../components/common/FloatingAISABrain';
import { analyticsApi } from '../../api/analyticsApi';
import { campaignApi } from '../../api/campaignApi';

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { activeWorkspace, setIsQuickPostOpen, setIsScraperOpen, workspaces } = useWorkspace();
  const { user } = useAuth();

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
          style={styles.heroCard}
        >
          {/* Greeting */}
          <Text style={[styles.heroGreeting, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            {getTimeGreeting()},{' '}
            <Text style={{ color: isDark ? '#C4B5FD' : '#6B21A8' }}>
              {displayName}
            </Text>{' '}
            👋
          </Text>

          <Text style={[styles.heroTagline, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>
            Turn ideas into impactful brands with AI.
          </Text>

          <Text style={[styles.heroBrandContext, { color: isDark ? '#CBD5E1' : '#475569' }]}>
            Currently governing{' '}
            <Text style={{ fontWeight: '800', color: isDark ? '#FFFFFF' : '#0F172A' }}>
              {activeWorkspace?.brandName || 'Brand DNA'}
            </Text>
            {activeWorkspace?.domainUrl ? ` (${activeWorkspace.domainUrl})` : ''}. All output is anchored to immutable Brand DNA.
          </Text>

          {/* 4 Feature Pill Chips */}
          <View style={styles.pillChipsRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>⚡ Create Faster</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>📊 Better Content</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>🎯 Smarter Campaigns</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>🚀 Higher ROI</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.heroActionRow}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => setIsScraperOpen(true)}
              style={[
                styles.heroBtn,
                { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' },
              ]}
            >
              <Sparkles size={14} color="#10B981" />
              <Text style={[styles.heroBtnText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                Enter Your Brand
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => setIsQuickPostOpen(true)}
              style={[styles.heroBtn, styles.quickPostBtn]}
            >
              <Zap size={14} color="#FDE047" fill="#FDE047" />
              <Text style={styles.quickPostText}>Quick Post</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── 2. KPI STATS GRID (3 CARDS) ── */}
        <View style={styles.kpiGrid}>
          {/* Total Brands */}
          <GlassCard style={styles.kpiCard} onPress={() => navigation.navigate('More', { screen: 'BrandDna' })}>
            <View style={[styles.cardAccentBar, { backgroundColor: '#F59E0B' }]} />
            <View style={styles.kpiTopRow}>
              <Text style={[styles.kpiLabel, { color: '#F59E0B' }]}>Total Brands</Text>
              <View style={[styles.kpiIconWrapper, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Database size={16} color="#F59E0B" />
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>{stats.totalBrands}</Text>
            <Text style={[styles.kpiSub, { color: colors.textMuted }]}>
              {stats.totalBrands} brand {stats.totalBrands === 1 ? 'profile' : 'profiles'} active
            </Text>
          </GlassCard>

          {/* Total Content */}
          <GlassCard style={styles.kpiCard} onPress={() => navigation.navigate('More', { screen: 'AssetLibrary' })}>
            <View style={[styles.cardAccentBar, { backgroundColor: '#06B6D4' }]} />
            <View style={styles.kpiTopRow}>
              <Text style={[styles.kpiLabel, { color: '#06B6D4' }]}>Generated Content</Text>
              <View style={[styles.kpiIconWrapper, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                <ImageIcon size={16} color="#06B6D4" />
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>{stats.totalPosts}</Text>
            <Text style={[styles.kpiSub, { color: colors.textMuted }]}>Saved in Asset Library</Text>
          </GlassCard>

          {/* Campaigns */}
          <GlassCard style={styles.kpiCard} onPress={() => navigation.navigate('Strategy', { screen: 'Campaigns' })}>
            <View style={[styles.cardAccentBar, { backgroundColor: '#F43F5E' }]} />
            <View style={styles.kpiTopRow}>
              <Text style={[styles.kpiLabel, { color: '#F43F5E' }]}>Campaigns</Text>
              <View style={[styles.kpiIconWrapper, { backgroundColor: 'rgba(244, 63, 94, 0.15)' }]}>
                <Megaphone size={16} color="#F43F5E" />
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>{stats.totalCampaigns}</Text>
            <Text style={[styles.kpiSub, { color: colors.textMuted }]}>
              {stats.activeCampaigns} currently active
            </Text>
          </GlassCard>
        </View>

        {/* ── 3. END-TO-END PIPELINE ── */}
        <View style={styles.pipelineSection}>
          <View style={styles.pipelineHeader}>
            <View style={styles.pipelineTitleRow}>
              <Globe size={16} color="#10B981" />
              <Text style={[styles.pipelineTitle, { color: colors.textPrimary }]}>
                END-TO-END CONTENT PIPELINE
              </Text>
            </View>
            <Text style={[styles.pipelineSub, { color: colors.accent.primary }]}>
              Strategy to Success →
            </Text>
          </View>

          {/* Pipeline Cards */}
          <View style={styles.pipelineList}>
            {[
              {
                id: '1',
                title: '1. Brand DNA',
                sub: 'Positioning & Tone Governance',
                icon: Dna,
                color: '#F59E0B',
                onPress: () => navigation.navigate('More', { screen: 'BrandDna' }),
              },
              {
                id: '2',
                title: '2. SEO Intelligence',
                sub: 'Keyword Clusters & Briefs',
                icon: Search,
                color: '#0284C7',
                onPress: () => navigation.navigate('Strategy', { screen: 'Seo' }),
              },
              {
                id: '3',
                title: '3. Content Studio',
                sub: 'Social Posts, Blogs & Emails',
                icon: PenTool,
                color: '#F43F5E',
                onPress: () => navigation.navigate('Studio'),
              },
              {
                id: '4',
                title: '4. Creative Studio',
                sub: 'AI Visual & Ad Generator',
                icon: Sparkles,
                color: '#8B5CF6',
                onPress: () => navigation.navigate('Studio', { tab: 'CREATIVE' }),
              },
              {
                id: '5',
                title: '5. Asset Library',
                sub: 'Saved Media & Brand Vault',
                icon: FolderKanban,
                color: '#10B981',
                onPress: () => navigation.navigate('More', { screen: 'AssetLibrary' }),
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <TouchableOpacity
                  key={step.id}
                  activeOpacity={0.8}
                  onPress={step.onPress}
                  style={[
                    styles.pipelineCard,
                    {
                      backgroundColor: isDark ? colors.cardBackground : '#FFFFFF',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.pipelineCardLeft}>
                    <View
                      style={[
                        styles.pipelineIconBox,
                        { backgroundColor: `${step.color}20` },
                      ]}
                    >
                      <Icon size={16} color={step.color} />
                    </View>
                    <View>
                      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                        {step.title}
                      </Text>
                      <Text style={[styles.stepSub, { color: colors.textSecondary }]}>
                        {step.sub}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[styles.arrowCircle, { backgroundColor: step.color }]}
                  >
                    <ArrowRight size={14} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
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
    paddingBottom: 110, // Sits above tab bar & floating copilot
  },
  heroCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  heroGreeting: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  heroTagline: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  heroBrandContext: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
    lineHeight: 18,
  },
  pillChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 14,
  },
  chip: {
    backgroundColor: 'rgba(0,0,0,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  heroBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heroBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  quickPostBtn: {
    backgroundColor: '#2563EB',
  },
  quickPostText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  kpiGrid: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    padding: 16,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  cardAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  kpiIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 6,
  },
  kpiSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  pipelineSection: {
    marginBottom: 20,
  },
  pipelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pipelineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pipelineTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  pipelineSub: {
    fontSize: 11,
    fontWeight: '700',
  },
  pipelineList: {
    gap: 8,
  },
  pipelineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  pipelineCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  pipelineIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  stepSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
