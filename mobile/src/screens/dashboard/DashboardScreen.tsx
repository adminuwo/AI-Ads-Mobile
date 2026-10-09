import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
  Image,
} from 'react-native';
import {
  Sparkles,
  Zap,
  Coins,
  ImageIcon,
  Megaphone,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { BrandHeader } from '../../components/common/BrandHeader';
import { AIToolkitNexus } from '../../components/dashboard/AIToolkitNexus';
import { analyticsApi, campaignApi } from '../../api';

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { activeWorkspace, setIsQuickPostOpen, setIsScraperOpen, workspaces } = useWorkspace();
  const { width } = useWindowDimensions();

  const hasWorkspace = Boolean(
    workspaces &&
    workspaces.length > 0 &&
    activeWorkspace &&
    activeWorkspace.brandName &&
    activeWorkspace.brandName.trim().length > 0 &&
    activeWorkspace.brandName.trim().toLowerCase() !== 'no brand' &&
    (activeWorkspace.id || activeWorkspace._id)
  );

  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalBrands: hasWorkspace ? workspaces.length : 0,
    totalPosts: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
  });

  const loadData = async () => {
    if (!hasWorkspace) {
      setStats({
        totalBrands: 0,
        totalPosts: 0,
        totalCampaigns: 0,
        activeCampaigns: 0,
      });
      return;
    }

    try {
      const wsId = activeWorkspace?._id || activeWorkspace?.id;
      const [analyticsRes, campaignsRes] = await Promise.all([
        analyticsApi.getSummary({
          workspaceId: wsId,
          brandName: activeWorkspace?.brandName,
        }),
        wsId
          ? campaignApi.list({ workspaceId: wsId }).catch(() => ({ campaigns: [] }))
          : Promise.resolve({ campaigns: [] }),
      ]);

      const totalPosts = analyticsRes?.analytics?.posts?.total || 0;
      const campaigns = (campaignsRes as any)?.campaigns || [];
      const activeCampaigns = campaigns.filter((c: any) =>
        ['ACTIVE', 'Active', 'running'].includes(c.status)
      ).length;

      setStats({
        totalBrands: workspaces.length,
        totalPosts,
        totalCampaigns: campaigns.length,
        activeCampaigns,
      });
    } catch {}
  };

  useEffect(() => {
    loadData();
  }, [activeWorkspace?.id, activeWorkspace?._id, workspaces.length, hasWorkspace]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Background tint: light blush pink matching screenshot in light mode
  const screenBg = isDark ? colors.background : '#FFF4F6';
  const cardBg = isDark ? colors.neu.card : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(244, 114, 182, 0.12)';

  return (
    <View style={[styles.root, { backgroundColor: screenBg }]}>
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
        {/* ── 1. HERO SECTION ── */}
        <View style={styles.heroSection}>

          {/* Tagline Row: Create • Plan • Publish • Grow */}
          <View style={styles.taglineRow}>
            <Text style={[styles.taglineWord, { color: '#F59E0B' }]}>Create</Text>
            <Text style={[styles.taglineDot, { color: isDark ? '#94A3B8' : '#0F172A' }]}>•</Text>
            <Text style={[styles.taglineWord, { color: '#0EA5E9' }]}>Plan</Text>
            <Text style={[styles.taglineDot, { color: isDark ? '#94A3B8' : '#0F172A' }]}>•</Text>
            <Text style={[styles.taglineWord, { color: '#EC4899' }]}>Publish</Text>
            <Text style={[styles.taglineDot, { color: isDark ? '#94A3B8' : '#0F172A' }]}>•</Text>
            <Text style={[styles.taglineWord, { color: '#8B5CF6' }]}>Grow</Text>
          </View>

          {/* ── 2026 Futuristic AI Nexus Command Deck ── */}
          <AIToolkitNexus />
        </View>

        {/* ── BODY CONTENT WITH HORIZONTAL PADDING ── */}
        <View style={styles.bodyContent}>
          {/* ── 2. SECTION TITLE: Overview ── */}
          <View style={styles.overviewRow}>
            <Text style={[styles.overviewText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              Overview
            </Text>
          </View>

          {/* ── 3. 3 KPI STAT CARDS IN A ROW ── */}
          <View style={styles.kpiRow}>
            {/* Card 1: TOTAL BRANDS */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('More', { screen: 'BrandDna' })}
              style={[
                styles.kpiCard,
                {
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  shadowColor: isDark ? '#000000' : '#A3B1C6',
                },
              ]}
            >
              <View style={styles.kpiTopRow}>
                <View style={[styles.kpiIconBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Coins size={16} color="#F59E0B" strokeWidth={2.2} />
                </View>
                <Text style={[styles.kpiTitleText, { color: '#F59E0B' }]} numberOfLines={2}>
                  TOTAL{'\n'}BRANDS
                </Text>
              </View>

              <Text style={[styles.kpiNumberText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                {hasWorkspace ? stats.totalBrands : 0}
              </Text>

              <View style={styles.kpiBottomRow}>
                <Text style={styles.kpiSubText} numberOfLines={1}>
                  {hasWorkspace && stats.totalBrands > 0 ? `${stats.totalBrands} active` : 'No data'}
                </Text>
                <View style={[styles.kpiArrowCircle, { backgroundColor: '#FEF3C7' }]}>
                  <ChevronRight size={13} color="#F59E0B" strokeWidth={2.6} />
                </View>
              </View>
            </TouchableOpacity>

            {/* Card 2: GENERATED CONTENT */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('AssetLibraryTab')}
              style={[
                styles.kpiCard,
                {
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  shadowColor: isDark ? '#000000' : '#A3B1C6',
                },
              ]}
            >
              <View style={styles.kpiTopRow}>
                <View style={[styles.kpiIconBadge, { backgroundColor: '#E0F2FE' }]}>
                  <ImageIcon size={16} color="#0284C7" strokeWidth={2.2} />
                </View>
                <Text style={[styles.kpiTitleText, { color: '#0284C7' }]} numberOfLines={2}>
                  GENERATED{'\n'}CONTENT
                </Text>
              </View>

              <Text style={[styles.kpiNumberText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                {hasWorkspace ? stats.totalPosts : 0}
              </Text>

              <View style={styles.kpiBottomRow}>
                <Text style={styles.kpiSubText} numberOfLines={1}>
                  {hasWorkspace && stats.totalPosts > 0 ? `${stats.totalPosts} posts` : 'No data'}
                </Text>
                <View style={[styles.kpiArrowCircle, { backgroundColor: '#E0F2FE' }]}>
                  <ChevronRight size={13} color="#0284C7" strokeWidth={2.6} />
                </View>
              </View>
            </TouchableOpacity>

            {/* Card 3: CAMPAIGNS */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('More', { screen: 'Campaigns' })}
              style={[
                styles.kpiCard,
                {
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  shadowColor: isDark ? '#000000' : '#A3B1C6',
                },
              ]}
            >
              <View style={styles.kpiTopRow}>
                <View style={[styles.kpiIconBadge, { backgroundColor: '#FCE7F3' }]}>
                  <Megaphone size={16} color="#EC4899" strokeWidth={2.2} />
                </View>
                <Text style={[styles.kpiTitleText, { color: '#EC4899' }]} numberOfLines={2}>
                  CAMPAIGNS
                </Text>
              </View>

              <Text style={[styles.kpiNumberText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                {hasWorkspace ? stats.totalCampaigns : 0}
              </Text>

              <View style={styles.kpiBottomRow}>
                <Text style={styles.kpiSubText} numberOfLines={1}>
                  {hasWorkspace && stats.totalCampaigns > 0 ? `${stats.activeCampaigns} active` : 'No data'}
                </Text>
                <View style={[styles.kpiArrowCircle, { backgroundColor: '#FCE7F3' }]}>
                  <ChevronRight size={13} color="#EC4899" strokeWidth={2.6} />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── 4. ACTION BUTTONS: Enter Your Brand & Quick Post ── */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setIsScraperOpen(true)}
              style={[
                styles.actionBtn,
                {
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  shadowColor: isDark ? '#000000' : '#A3B1C6',
                },
              ]}
            >
              <Sparkles size={18} color="#2563EB" fill="#2563EB" strokeWidth={2} />
              <Text style={styles.actionBtnText} numberOfLines={1}>
                Enter Your Brand
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setIsQuickPostOpen(true)}
              style={[
                styles.actionBtn,
                {
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  shadowColor: isDark ? '#000000' : '#A3B1C6',
                },
              ]}
            >
              <Zap size={18} color="#2563EB" fill="#2563EB" strokeWidth={2} />
              <Text style={styles.actionBtnText} numberOfLines={1}>
                Quick Post
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 95, // Above bottom tab bar
    width: '100%',
    alignSelf: 'center',
  },
  bodyContent: {
    paddingHorizontal: 16,
    width: '100%',
  },

  // 1. Hero Section
  heroSection: {
    alignItems: 'center',
    width: '100%',
    paddingTop: 6,
  },
  heroLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    gap: 8,
  },
  heroCameraLogo: {
    width: 38,
    height: 38,
  },
  heroAppTitle: {
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  tmSymbol: {
    fontSize: 13,
    fontWeight: '700',
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 6,
  },
  taglineWord: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  taglineDot: {
    fontSize: 14,
    marginHorizontal: 5,
  },

  // 2. Section Title: Overview
  overviewRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    marginBottom: 16,
  },
  overviewText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  // 3. 3 KPI Stat Cards
  kpiRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 11,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    justifyContent: 'space-between',
    minHeight: 115,
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kpiIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiTitleText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 12,
    flexShrink: 1,
  },
  kpiNumberText: {
    fontSize: 26,
    fontWeight: '800',
    marginVertical: 4,
  },
  kpiBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiSubText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  kpiArrowCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 4. Action Buttons
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
});
