import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import {
  Layers,
  Sparkles,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
  Target,
  Clock,
  Users,
  BarChart3,
  Eye,
  Edit3,
  X,
  ExternalLink,
  Search,
  Copy,
  Check,
  Zap,
  PenTool,
  Send,
  SlidersHorizontal,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { campaignApi } from '../../api/campaignApi';
import { BrandHeader } from '../../components/common/BrandHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { FloatingAISABrain } from '../../components/common/FloatingAISABrain';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';
import { Campaign, CampaignPost } from '../../types';

const PLATFORMS_LIST = ['Instagram', 'Facebook', 'LinkedIn', 'X/Twitter', 'YouTube', 'Threads', 'TikTok'];

const FREQUENCIES_LIST = [
  'Daily',
  '2x per week',
  '3x per week',
  '4x per week',
  '5x per week',
  'Weekly',
  'Bi Weekly',
  'Monthly',
];

const PLATFORM_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  instagram: { bg: 'rgba(225, 48, 108, 0.12)', text: '#E1306C', border: 'rgba(225, 48, 108, 0.3)' },
  facebook: { bg: 'rgba(24, 119, 242, 0.12)', text: '#1877F2', border: 'rgba(24, 119, 242, 0.3)' },
  linkedin: { bg: 'rgba(10, 102, 194, 0.12)', text: '#0A66C2', border: 'rgba(10, 102, 194, 0.3)' },
  'x/twitter': { bg: 'rgba(15, 20, 25, 0.12)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.3)' },
  twitter: { bg: 'rgba(29, 161, 242, 0.12)', text: '#1DA1F2', border: 'rgba(29, 161, 242, 0.3)' },
  youtube: { bg: 'rgba(255, 0, 0, 0.12)', text: '#FF0000', border: 'rgba(255, 0, 0, 0.3)' },
  threads: { bg: 'rgba(16, 16, 16, 0.12)', text: '#A855F7', border: 'rgba(168, 85, 247, 0.3)' },
  tiktok: { bg: 'rgba(254, 44, 85, 0.12)', text: '#FE2C55', border: 'rgba(254, 44, 85, 0.3)' },
  blog: { bg: 'rgba(16, 185, 129, 0.12)', text: '#10B981', border: 'rgba(16, 185, 129, 0.3)' },
  email: { bg: 'rgba(245, 158, 11, 0.12)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' },
};

const getPlatformStyle = (platform: string) => {
  const norm = (platform || '').toLowerCase();
  for (const key of Object.keys(PLATFORM_COLORS)) {
    if (norm.includes(key)) {
      return PLATFORM_COLORS[key];
    }
  }
  return { bg: 'rgba(59, 130, 246, 0.12)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.3)' };
};

export const CampaignsScreen: React.FC = () => {
  const { colors: baseColors, isDark } = useTheme();
  const colors = useMemo(() => ({
    ...baseColors,
    surface: baseColors.cardBackground,
    cardBorder: baseColors.border,
  }), [baseColors]);
  const { user } = useAuth();
  const { activeWorkspace, updateActiveWorkspace, setActiveToolkitFeature } = useWorkspace();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { width } = useWindowDimensions();
  const isTablet = width >= 720;

  const handleGoBack = useCallback(() => {
    try {
      setActiveToolkitFeature(null);
    } catch {}
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  }, [navigation, setActiveToolkitFeature]);

  // Workspace & Plan
  const workspaceId = activeWorkspace?._id || activeWorkspace?.id || '';
  const userPlanNorm = (user?.plan || 'starter').toLowerCase();

  // Screen State
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Draft' | 'Paused' | 'Completed'>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [strategyData, setStrategyData] = useState<any>(null);
  const [showPostDetailModal, setShowPostDetailModal] = useState<CampaignPost | null>(null);

  // Campaign Detail State
  const [posts, setPosts] = useState<CampaignPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [generatingStrategy, setGeneratingStrategy] = useState(false);
  const [generatingPostId, setGeneratingPostId] = useState<string | null>(null);
  const [postsPlatformFilter, setPostsPlatformFilter] = useState<string>('ALL');

  // Plan limits check
  const getCampaignLimit = (plan: string) => {
    const p = (plan || 'starter').toLowerCase();
    if (p === 'starter' || p === 'base' || p === 'free') return 3;
    if (p === 'pro' || p === 'growth' || p === 'professional') return 10;
    return 9999;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Campaigns
  const loadCampaigns = useCallback(async () => {
    try {
      setErrorMsg('');
      const res = await campaignApi.list(workspaceId ? { workspaceId } : {});
      if (res.success && Array.isArray(res.campaigns)) {
        setCampaigns(res.campaigns);
        // If route has campaignId, auto-select it
        if (route?.params?.campaignId) {
          const match = res.campaigns.find(
            (c) => c._id === route.params.campaignId || c.id === route.params.campaignId
          );
          if (match) setSelectedCampaign(match);
        }
      }
    } catch (err: any) {
      console.warn('Load campaigns error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [workspaceId, route?.params?.campaignId]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedCampaign) {
      await loadPosts(selectedCampaign._id || selectedCampaign.id || '');
      setRefreshing(false);
    } else {
      await loadCampaigns();
    }
  };

  // Load Posts for selected campaign
  const loadPosts = useCallback(async (campaignId: string) => {
    if (!campaignId) return;
    setLoadingPosts(true);
    try {
      const res = await campaignApi.getPosts(campaignId);
      if (res.success && Array.isArray(res.posts)) {
        setPosts(res.posts);
      }
    } catch (err: any) {
      console.warn('Load posts error:', err);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      const cId = selectedCampaign._id || selectedCampaign.id || '';
      loadPosts(cId);
      if (selectedCampaign.aiGeneratedStrategy) {
        setStrategyData(selectedCampaign.aiGeneratedStrategy);
      }
    }
  }, [selectedCampaign, loadPosts]);

  // Delete Campaign
  const handleDeleteCampaign = (campaignId: string, campaignName: string) => {
    Alert.alert(
      'Delete Campaign',
      `Are you sure you want to delete "${campaignName}" and all its scheduled posts? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await campaignApi.delete(campaignId);
              setCampaigns((prev) => prev.filter((c) => (c._id || c.id) !== campaignId));
              if (selectedCampaign && (selectedCampaign._id === campaignId || selectedCampaign.id === campaignId)) {
                setSelectedCampaign(null);
              }
              showToast(`Campaign "${campaignName}" deleted`);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete campaign');
            }
          },
        },
      ]
    );
  };

  // Generate Plan for campaign
  const handleGeneratePlan = async (customPlan?: any) => {
    if (!selectedCampaign) return;
    const cId = selectedCampaign._id || selectedCampaign.id || '';
    setGeneratingPlan(true);
    try {
      const planToUse = customPlan || strategyData?.thirtyDayPlan;
      const res = await campaignApi.generatePlan(
        cId,
        planToUse && planToUse.length > 0 ? { strategyPlan: planToUse } : {}
      );
      if (res.success && Array.isArray(res.posts)) {
        setPosts(res.posts);
        setSelectedCampaign((prev) => (prev ? { ...prev, totalPosts: res.posts?.length || 0, status: 'Active' } : null));
        setCampaigns((prev) =>
          prev.map((c) =>
            (c._id || c.id) === cId ? { ...c, totalPosts: res.posts?.length || 0, status: 'Active' } : c
          )
        );
        showToast(`AI Plan Generated: ${res.posts.length} posts scheduled!`);
      }
    } catch (err: any) {
      Alert.alert('Plan Generation Failed', err.message || 'Failed to generate campaign plan');
    } finally {
      setGeneratingPlan(false);
    }
  };

  // Generate Strategy for campaign
  const handleGenerateStrategy = async () => {
    if (!selectedCampaign) return;
    const cId = selectedCampaign._id || selectedCampaign.id || '';
    setGeneratingStrategy(true);
    try {
      const res = await campaignApi.generateStrategy(cId);
      if (res.strategy) {
        setStrategyData(res.strategy);
        setShowStrategyModal(true);
        if (updateActiveWorkspace) {
          await updateActiveWorkspace({ currentStrategy: res.strategy } as any);
        }
        showToast('Strategic Roadmap Synthesized!');
      } else {
        showToast('Strategy generated successfully');
      }
    } catch (err: any) {
      Alert.alert('Strategy Error', err.message || 'Failed to generate strategy');
    } finally {
      setGeneratingStrategy(false);
    }
  };

  // Generate single post content
  const handleGeneratePostContent = async (postId: string) => {
    setGeneratingPostId(postId);
    try {
      const res = await campaignApi.generatePostContent(postId);
      if (res.success && res.post) {
        setPosts((prev) => prev.map((p) => ((p._id || p.id) === postId ? res.post : p)));
        if (showPostDetailModal && (showPostDetailModal._id === postId || showPostDetailModal.id === postId)) {
          setShowPostDetailModal(res.post);
        }
        showToast('Post content crafted with AI!');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to craft post content');
    } finally {
      setGeneratingPostId(null);
    }
  };

  // Update post status
  const handleUpdatePostStatus = async (postId: string, nextStatus: 'Draft' | 'Approved' | 'Scheduled') => {
    try {
      const res = await campaignApi.updatePostStatus(postId, {
        status: nextStatus,
        approvalStatus: nextStatus === 'Approved' ? 'Approved' : undefined,
      });
      if (res.success && res.post) {
        setPosts((prev) => prev.map((p) => ((p._id || p.id) === postId ? res.post : p)));
        if (showPostDetailModal && (showPostDetailModal._id === postId || showPostDetailModal.id === postId)) {
          setShowPostDetailModal(res.post);
        }
        showToast(`Post marked as ${nextStatus}`);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update post status');
    }
  };

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (c.campaignName || '').toLowerCase().includes(q) ||
        (c.campaignGoal || '').toLowerCase().includes(q) ||
        (c.platforms || []).some((p) => p.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [campaigns, statusFilter, searchQuery]);

  // Grouped posts by date
  const groupedPosts = useMemo(() => {
    const filtered = posts.filter((p) => {
      if (postsPlatformFilter === 'ALL') return true;
      return (p.platform || '').toLowerCase().includes(postsPlatformFilter.toLowerCase());
    });

    const groups: Record<string, CampaignPost[]> = {};
    for (const p of filtered) {
      let dateKey = 'Scheduled Timeline';
      if (p.date) {
        try {
          const d = new Date(p.date);
          dateKey = d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });
        } catch {
          dateKey = String(p.day || 'Day');
        }
      }
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(p);
    }
    return groups;
  }, [posts, postsPlatformFilter]);

  const [errorMsg, setErrorMsg] = useState('');

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: Campaign Detail View
  // ─────────────────────────────────────────────────────────────────────────────
  if (selectedCampaign) {
    const totalPostsCount = posts.length;
    const generatedCount = posts.filter((p) => p.status === 'Generated' || p.status === 'Approved').length;
    const platformsCount = selectedCampaign.platforms?.length || 0;
    const pendingCount = posts.filter((p) => p.status === 'Draft').length;

    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Top Header */}
        <View style={[styles.headerContainer, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
            onPress={() => setSelectedCampaign(null)}
            activeOpacity={0.7}
          >
            <ArrowLeft size={18} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <View style={styles.headerTitleRow}>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {selectedCampaign.campaignName}
              </Text>
              {selectedCampaign.aiGeneratedStrategy && (
                <View style={styles.strategyActivePill}>
                  <Target size={11} color="#10B981" />
                  <Text style={styles.strategyActiveText}>Strategy Active</Text>
                </View>
              )}
            </View>
            <Text style={[styles.headerSub, { color: colors.textMuted }]} numberOfLines={1}>
              {selectedCampaign.campaignGoal}
            </Text>
          </View>
        </View>

        {/* Toast */}
        {toastMessage && (
          <View style={styles.toastWrap}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.toastGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <CheckCircle2 size={16} color="#FFFFFF" />
              <Text style={styles.toastText}>{toastMessage}</Text>
            </LinearGradient>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.detailScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent.primary} />
          }
        >
          {/* Action Row */}
          <View style={styles.detailActionsBar}>
            <TouchableOpacity
              style={[styles.actionBtnPrimary, { flex: isTablet ? undefined : 1 }]}
              onPress={() => handleGenerateStrategy()}
              disabled={generatingStrategy}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#10B981', '#0D9488']}
                style={styles.actionBtnGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {generatingStrategy ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Target size={15} color="#FFFFFF" />
                )}
                <Text style={styles.actionBtnText}>
                  {generatingStrategy
                    ? 'Synthesizing...'
                    : strategyData
                    ? 'View Strategy Roadmap'
                    : 'Generate Strategy'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtnSecondary, { flex: isTablet ? undefined : 1 }]}
              onPress={() => handleGeneratePlan()}
              disabled={generatingPlan}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#3B82F6', '#6366F1']}
                style={styles.actionBtnGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {generatingPlan ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Sparkles size={15} color="#FFFFFF" />
                )}
                <Text style={styles.actionBtnText}>
                  {generatingPlan ? 'Generating...' : totalPostsCount > 0 ? 'Regenerate Plan' : 'Generate Plan'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* 4 Stats Cards */}
          <View style={[styles.statsGrid, isTablet && styles.statsGridTablet]}>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
              <View style={styles.statTop}>
                <BarChart3 size={15} color="#3B82F6" />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>TOTAL POSTS</Text>
              </View>
              <Text style={[styles.statVal, { color: colors.textPrimary }]}>{totalPostsCount}</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
              <View style={styles.statTop}>
                <CheckCircle2 size={15} color="#10B981" />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>READY / APPVD</Text>
              </View>
              <Text style={[styles.statVal, { color: colors.textPrimary }]}>{generatedCount}</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
              <View style={styles.statTop}>
                <Layers size={15} color="#8B5CF6" />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>PLATFORMS</Text>
              </View>
              <Text style={[styles.statVal, { color: colors.textPrimary }]}>{platformsCount}</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
              <View style={styles.statTop}>
                <Clock size={15} color="#F59E0B" />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>PENDING</Text>
              </View>
              <Text style={[styles.statVal, { color: colors.textPrimary }]}>{pendingCount}</Text>
            </View>
          </View>

          {/* Timeline Platform Filter */}
          {selectedCampaign.platforms && selectedCampaign.platforms.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.postFiltersScroll}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  postsPlatformFilter === 'ALL' && {
                    backgroundColor: colors.accent.primary,
                    borderColor: colors.accent.primary,
                  },
                  { borderColor: colors.cardBorder },
                ]}
                onPress={() => setPostsPlatformFilter('ALL')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: postsPlatformFilter === 'ALL' ? '#FFFFFF' : colors.textMuted },
                  ]}
                >
                  All Channels ({posts.length})
                </Text>
              </TouchableOpacity>

              {selectedCampaign.platforms.map((plat) => {
                const count = posts.filter((p) => (p.platform || '').toLowerCase().includes(plat.toLowerCase())).length;
                const isSelected = postsPlatformFilter === plat;
                return (
                  <TouchableOpacity
                    key={plat}
                    style={[
                      styles.filterChip,
                      isSelected && {
                        backgroundColor: colors.accent.primary,
                        borderColor: colors.accent.primary,
                      },
                      { borderColor: colors.cardBorder },
                    ]}
                    onPress={() => setPostsPlatformFilter(plat)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: isSelected ? '#FFFFFF' : colors.textMuted },
                      ]}
                    >
                      {plat} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Posts Timeline */}
          {loadingPosts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent.primary} />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading schedule timeline...</Text>
            </View>
          ) : totalPostsCount === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
              <View style={[styles.emptyIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                <Sparkles size={28} color="#3B82F6" />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Content Plan Generated Yet</Text>
              <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
                Tap "Generate Plan" above to create an automated daily calendar mapped specifically for{' '}
                {selectedCampaign.campaignName}.
              </Text>
              <TouchableOpacity
                style={styles.emptyCta}
                onPress={() => handleGeneratePlan()}
                disabled={generatingPlan}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#3B82F6', '#6366F1']}
                  style={styles.emptyCtaGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {generatingPlan ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Sparkles size={16} color="#FFFFFF" />
                  )}
                  <Text style={styles.emptyCtaText}>
                    {generatingPlan ? 'Crafting Calendar...' : 'Generate Plan Now'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.timelineList}>
              {Object.entries(groupedPosts).map(([dateLabel, datePosts]) => (
                <View key={dateLabel} style={styles.dateGroup}>
                  <View style={styles.dateHeaderRow}>
                    <Calendar size={13} color={colors.accent.primary} />
                    <Text style={[styles.dateGroupTitle, { color: colors.textPrimary }]}>{dateLabel}</Text>
                    <View style={[styles.dateDivider, { backgroundColor: colors.cardBorder }]} />
                    <Text style={[styles.dateCountBadge, { color: colors.textMuted }]}>
                      {datePosts.length} {datePosts.length === 1 ? 'post' : 'posts'}
                    </Text>
                  </View>

                  <View style={styles.datePostsList}>
                    {datePosts.map((post) => {
                      const pId = post._id || post.id || '';
                      const isGeneratingThis = generatingPostId === pId;
                      const platStyle = getPlatformStyle(post.platform);
                      const isApproved = post.status === 'Approved' || post.approvalStatus === 'Approved';

                      return (
                        <View
                          key={pId}
                          style={[
                            styles.postCard,
                            { backgroundColor: colors.surface, borderColor: colors.cardBorder },
                          ]}
                        >
                          {/* Post Card Header */}
                          <View style={styles.postCardHeader}>
                            <View style={styles.postTagsRow}>
                              <View style={[styles.platTag, { backgroundColor: platStyle.bg, borderColor: platStyle.border }]}>
                                <Text style={[styles.platTagText, { color: platStyle.text }]}>
                                  {post.platform}
                                </Text>
                              </View>

                              {post.contentType && (
                                <View style={[styles.metaTag, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                                  <Text style={[styles.metaTagText, { color: colors.textMuted }]}>
                                    {post.contentType}
                                  </Text>
                                </View>
                              )}

                              {post.campaignStage && (
                                <View style={[styles.stageTag, { backgroundColor: 'rgba(99, 102, 241, 0.12)' }]}>
                                  <Text style={styles.stageTagText}>{post.campaignStage}</Text>
                                </View>
                              )}
                            </View>

                            {/* Status Badge */}
                            <View
                              style={[
                                styles.statusBadge,
                                post.status === 'Approved' || post.status === 'Published'
                                  ? styles.statusApproved
                                  : post.status === 'Generated'
                                  ? styles.statusGenerated
                                  : styles.statusDraft,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusBadgeText,
                                  post.status === 'Approved' || post.status === 'Published'
                                    ? styles.statusApprovedText
                                    : post.status === 'Generated'
                                    ? styles.statusGeneratedText
                                    : styles.statusDraftText,
                                ]}
                              >
                                {post.status || 'Draft'}
                              </Text>
                            </View>
                          </View>

                          {/* Post Objective / Topic */}
                          <Text style={[styles.postObjective, { color: colors.textPrimary }]}>
                            {post.postObjective || post.prompt || 'Scheduled Post'}
                          </Text>

                          {/* Caption snippet if generated */}
                          {post.caption ? (
                            <TouchableOpacity
                              style={[
                                styles.captionSnippetBox,
                                { backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.02)', borderColor: colors.cardBorder },
                              ]}
                              onPress={() => setShowPostDetailModal(post)}
                              activeOpacity={0.7}
                            >
                              <Text style={[styles.captionSnippetText, { color: colors.textMuted }]} numberOfLines={3}>
                                "{post.caption}"
                              </Text>
                              {post.hashtags && post.hashtags.length > 0 && (
                                <Text style={styles.hashtagSnippet} numberOfLines={1}>
                                  {post.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}
                                </Text>
                              )}
                            </TouchableOpacity>
                          ) : null}

                          {/* Meta: Post Type & Best Time */}
                          <View style={styles.postMetaRow}>
                            <Text style={[styles.postMetaText, { color: colors.textMuted }]}>
                              {post.postType || 'Image'}
                              {post.bestPostingTime ? ` · ${post.bestPostingTime}` : ''}
                            </Text>
                          </View>

                          {/* Interactive Card Action Buttons */}
                          <View style={[styles.postActionRow, { borderTopColor: colors.cardBorder }]}>
                            <TouchableOpacity
                              style={[
                                styles.cardActionBtn,
                                { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.08)' },
                              ]}
                              onPress={() => handleGeneratePostContent(pId)}
                              disabled={isGeneratingThis}
                              activeOpacity={0.7}
                            >
                              {isGeneratingThis ? (
                                <ActivityIndicator size="small" color="#3B82F6" />
                              ) : (
                                <Sparkles size={13} color="#3B82F6" />
                              )}
                              <Text style={styles.cardActionBtnTextBlue}>
                                {isGeneratingThis ? 'Crafting...' : post.caption ? 'Regenerate' : 'Generate Content'}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[
                                styles.cardActionBtn,
                                {
                                  backgroundColor: isApproved
                                    ? 'rgba(16, 185, 129, 0.12)'
                                    : isDark
                                    ? 'rgba(255,255,255,0.06)'
                                    : 'rgba(0,0,0,0.04)',
                                },
                              ]}
                              onPress={() =>
                                handleUpdatePostStatus(
                                  pId,
                                  isApproved ? 'Draft' : 'Approved'
                                )
                              }
                              activeOpacity={0.7}
                            >
                              <CheckCircle2 size={13} color={isApproved ? '#10B981' : colors.textMuted} />
                              <Text
                                style={[
                                  styles.cardActionBtnText,
                                  { color: isApproved ? '#10B981' : colors.textMuted },
                                ]}
                              >
                                {isApproved ? 'Approved' : 'Approve'}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[
                                styles.cardActionBtnIcon,
                                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
                              ]}
                              onPress={() => {
                                // Navigate to Studio
                                (navigation as any).navigate('Studio', { tab: 'SOCIAL' });
                              }}
                              activeOpacity={0.7}
                              accessibilityLabel="Open in Studio"
                            >
                              <PenTool size={13} color={colors.textMuted} />
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[
                                styles.cardActionBtnIcon,
                                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
                              ]}
                              onPress={() => setShowPostDetailModal(post)}
                              activeOpacity={0.7}
                              accessibilityLabel="View Post Details"
                            >
                              <Eye size={13} color={colors.textMuted} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Post Detail Inspection Modal */}
        {showPostDetailModal && (
          <Modal
            visible={!!showPostDetailModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowPostDetailModal(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                {/* Header */}
                <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
                  <View style={styles.modalHeaderLeft}>
                    <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Post Directive Details</Text>
                    <Text style={[styles.modalSub, { color: colors.textMuted }]}>
                      {showPostDetailModal.platform} · {showPostDetailModal.contentType}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowPostDetailModal(null)}
                    style={[styles.modalCloseBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
                  >
                    <X size={16} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
                  {/* Objective */}
                  <View style={styles.detailBlock}>
                    <Text style={[styles.detailLabel, { color: colors.textMuted }]}>POST OBJECTIVE</Text>
                    <Text style={[styles.detailBody, { color: colors.textPrimary }]}>
                      {showPostDetailModal.postObjective}
                    </Text>
                  </View>

                  {/* Caption */}
                  {showPostDetailModal.caption ? (
                    <View style={styles.detailBlock}>
                      <View style={styles.detailHeaderWithAction}>
                        <Text style={[styles.detailLabel, { color: colors.textMuted }]}>CRAFTED CAPTION</Text>
                        <TouchableOpacity
                          style={styles.copyBtn}
                          onPress={async () => {
                            await Clipboard.setStringAsync(showPostDetailModal.caption || '');
                            showToast('Caption copied to clipboard!');
                          }}
                        >
                          <Copy size={13} color="#3B82F6" />
                          <Text style={styles.copyBtnText}>Copy</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={[styles.captionFullBox, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)', borderColor: colors.cardBorder }]}>
                        <Text style={[styles.captionFullText, { color: colors.textPrimary }]}>
                          {showPostDetailModal.caption}
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {/* Hashtags */}
                  {showPostDetailModal.hashtags && showPostDetailModal.hashtags.length > 0 && (
                    <View style={styles.detailBlock}>
                      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>RECOMMENDED HASHTAGS</Text>
                      <View style={styles.hashtagsGrid}>
                        {showPostDetailModal.hashtags.map((h, i) => (
                          <View key={i} style={[styles.hashtagTag, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                            <Text style={styles.hashtagTagText}>{h.startsWith('#') ? h : `#${h}`}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Call to Action */}
                  {showPostDetailModal.cta ? (
                    <View style={styles.detailBlock}>
                      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>CALL TO ACTION (CTA)</Text>
                      <Text style={[styles.detailBody, { color: colors.textPrimary }]}>
                        {showPostDetailModal.cta}
                      </Text>
                    </View>
                  ) : null}

                  {/* Stage and Type Meta */}
                  <View style={[styles.metaGridTwo, { borderColor: colors.cardBorder }]}>
                    <View style={styles.metaCell}>
                      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>STAGE</Text>
                      <Text style={[styles.metaCellValue, { color: colors.textPrimary }]}>
                        {showPostDetailModal.campaignStage || 'Awareness'}
                      </Text>
                    </View>
                    <View style={styles.metaCell}>
                      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>BEST TIME</Text>
                      <Text style={[styles.metaCellValue, { color: colors.textPrimary }]}>
                        {showPostDetailModal.bestPostingTime || '10:00 AM'}
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                {/* Footer Actions */}
                <View style={[styles.modalFooter, { borderTopColor: colors.cardBorder }]}>
                  <TouchableOpacity
                    style={[styles.modalActionSecondary, { borderColor: colors.cardBorder }]}
                    onPress={() => {
                      const p = showPostDetailModal;
                      setShowPostDetailModal(null);
                      handleGeneratePostContent(p._id || p.id || '');
                    }}
                  >
                    <Sparkles size={14} color={colors.accent.primary} />
                    <Text style={[styles.modalActionSecondaryText, { color: colors.accent.primary }]}>
                      {showPostDetailModal.caption ? 'Regenerate' : 'Generate Now'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalActionPrimary}
                    onPress={() => {
                      const isAppvd = showPostDetailModal.status === 'Approved';
                      handleUpdatePostStatus(
                        showPostDetailModal._id || showPostDetailModal.id || '',
                        isAppvd ? 'Draft' : 'Approved'
                      );
                    }}
                  >
                    <LinearGradient
                      colors={showPostDetailModal.status === 'Approved' ? ['#F59E0B', '#D97706'] : ['#10B981', '#059669']}
                      style={styles.modalActionGrad}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <CheckCircle2 size={14} color="#FFFFFF" />
                      <Text style={styles.modalActionPrimaryText}>
                        {showPostDetailModal.status === 'Approved' ? 'Mark Draft' : 'Approve Post'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Strategy Roadmap Overview Modal */}
        {showStrategyModal && strategyData && (
          <Modal
            visible={showStrategyModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowStrategyModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
                  <View style={styles.strategyModalHeaderRow}>
                    <View style={styles.strategyIconBg}>
                      <Target size={18} color="#10B981" />
                    </View>
                    <View>
                      <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Strategy Roadmap Active</Text>
                      <Text style={[styles.modalSub, { color: colors.textMuted }]}>
                        Synthesized for {selectedCampaign.campaignName}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowStrategyModal(false)}
                    style={[styles.modalCloseBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
                  >
                    <X size={16} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
                  {/* Target Goal */}
                  <View style={[styles.strategyCardBlock, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
                    <Text style={styles.strategyCardLabelGreen}>TARGET GOAL</Text>
                    <Text style={[styles.strategyCardValue, { color: colors.textPrimary }]}>
                      {strategyData.businessGoal || selectedCampaign.campaignGoal}
                    </Text>
                  </View>

                  {/* Lead Magnet & Primary CTA */}
                  <View style={styles.strategyTwoCols}>
                    <View style={[styles.strategyColCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', borderColor: colors.cardBorder }]}>
                      <Text style={[styles.strategyCardLabel, { color: colors.textMuted }]}>🎁 LEAD MAGNET</Text>
                      <Text style={[styles.strategyColVal, { color: colors.textPrimary }]}>
                        {strategyData.leadMagnet || 'Free high-value industry benchmark toolkit'}
                      </Text>
                    </View>

                    <View style={[styles.strategyColCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', borderColor: colors.cardBorder }]}>
                      <Text style={[styles.strategyCardLabel, { color: colors.textMuted }]}>📢 PRIMARY CTA</Text>
                      <Text style={[styles.strategyColVal, { color: colors.textPrimary }]}>
                        {strategyData.primaryCta || 'Book consultation / Start trial'}
                      </Text>
                    </View>
                  </View>

                  {/* 30-Day Tactical Plan Note */}
                  <View style={[styles.strategyTacticalBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.04)', borderColor: 'rgba(59, 130, 246, 0.2)' }]}>
                    <Text style={styles.strategyCardLabelBlue}>⚡ 30-DAY TACTICAL ROADMAP</Text>
                    <Text style={[styles.strategyTacticalText, { color: colors.textPrimary }]}>
                      Comprehensive 30 daily action directives mapped across{' '}
                      {(strategyData.bestPlatforms || selectedCampaign.platforms || []).join(', ')}.
                    </Text>
                  </View>
                </ScrollView>

                {/* Footer Buttons */}
                <View style={[styles.modalFooter, { borderTopColor: colors.cardBorder }]}>
                  <TouchableOpacity
                    style={[styles.modalActionSecondary, { borderColor: colors.cardBorder }]}
                    onPress={() => {
                      setShowStrategyModal(false);
                      // Navigate to Strategy screen
                      (navigation as any).navigate('StrategyHome');
                    }}
                  >
                    <Target size={14} color="#10B981" />
                    <Text style={[styles.modalActionSecondaryText, { color: '#10B981' }]}>
                      Open Strategy Hub
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalActionPrimary}
                    onPress={() => {
                      setShowStrategyModal(false);
                      handleGeneratePlan(strategyData.thirtyDayPlan);
                    }}
                  >
                    <LinearGradient
                      colors={['#3B82F6', '#6366F1']}
                      style={styles.modalActionGrad}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Sparkles size={14} color="#FFFFFF" />
                      <Text style={styles.modalActionPrimaryText}>Generate Posts Now</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        <FloatingAISABrain />
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: Campaigns List View
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader showBack onBack={handleGoBack} title="Campaign Builder" />

      {/* Floating Toast */}
      {toastMessage && (
        <View style={styles.toastWrap}>
          <LinearGradient colors={['#10B981', '#059669']} style={styles.toastGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <CheckCircle2 size={16} color="#FFFFFF" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </LinearGradient>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent.primary} />
        }
      >
        {/* Hero Banner / Module Header */}
        <View
          style={[
            styles.heroCard,
            { backgroundColor: colors.surface, borderColor: colors.cardBorder },
          ]}
        >
          <View style={styles.heroTop}>
            <View style={styles.heroTitleWrap}>
              <View style={styles.heroIconBg}>
                <Layers size={20} color="#3B82F6" />
              </View>
              <View style={styles.heroTextCol}>
                <Text style={[styles.heroHeading, { color: colors.textPrimary }]}>
                  Campaign Builder
                </Text>
                <Text style={[styles.heroSub, { color: colors.textMuted }]}>
                  AI-powered campaign planning with auto-generated post schedules for{' '}
                  <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
                    {activeWorkspace?.brandName || 'your brand'}
                  </Text>
                </Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.heroActionsRow}>
              <TouchableOpacity
                style={[styles.iconButton, { borderColor: colors.cardBorder, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }]}
                onPress={loadCampaigns}
                activeOpacity={0.7}
              >
                <RefreshCw size={15} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.newCampaignBtn}
                onPress={() => {
                  const limit = getCampaignLimit(userPlanNorm);
                  if (campaigns.length >= limit) {
                    Alert.alert(
                      'Upgrade Plan for More Campaigns',
                      `Your current plan is limited to ${limit} campaigns. Upgrade to Pro/Growth to unlock more campaigns.`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Upgrade Plan',
                          onPress: () => (navigation as any).navigate('More', { screen: 'SettingsBilling' }),
                        },
                      ]
                    );
                    return;
                  }
                  setShowCreateModal(true);
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#3B82F6', '#6366F1']}
                  style={styles.newCampaignGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Plus size={15} color="#FFFFFF" />
                  <Text style={styles.newCampaignText}>New Campaign</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchBox, { backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)', borderColor: colors.cardBorder }]}>
            <Search size={15} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search campaigns by name, goal, or channel..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={14} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Status Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusFiltersScroll}
        >
          {(['ALL', 'Active', 'Draft', 'Paused', 'Completed'] as const).map((st) => {
            const count =
              st === 'ALL'
                ? campaigns.length
                : campaigns.filter((c) => (c.status || 'Draft') === st).length;
            const isSelected = statusFilter === st;

            return (
              <TouchableOpacity
                key={st}
                style={[
                  styles.filterTab,
                  isSelected && {
                    backgroundColor: colors.accent.primary,
                    borderColor: colors.accent.primary,
                  },
                  { borderColor: colors.cardBorder },
                ]}
                onPress={() => setStatusFilter(st)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: isSelected ? '#FFFFFF' : colors.textMuted },
                  ]}
                >
                  {st} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Campaigns Grid / List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading marketing campaigns...</Text>
          </View>
        ) : filteredCampaigns.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <View style={[styles.emptyIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
              <Layers size={32} color="#3B82F6" />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Campaigns Found</Text>
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
              {searchQuery
                ? 'No campaigns match your search query. Try another keyword.'
                : 'Create your first campaign and let AI generate a complete posting schedule with captions, hashtags, and visual prompts.'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.emptyCta}
                onPress={() => setShowCreateModal(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#3B82F6', '#6366F1']}
                  style={styles.emptyCtaGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Sparkles size={16} color="#FFFFFF" />
                  <Text style={styles.emptyCtaText}>Create First Campaign</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={[styles.campaignsGrid, isTablet && styles.campaignsGridTablet]}>
            {filteredCampaigns.map((camp) => {
              const cId = camp._id || camp.id || '';
              const postsCount = camp.totalPosts || 0;
              const hasStrategy = !!camp.aiGeneratedStrategy;

              return (
                <TouchableOpacity
                  key={cId}
                  style={[
                    styles.campaignCard,
                    isTablet && styles.campaignCardTablet,
                    { backgroundColor: colors.surface, borderColor: colors.cardBorder },
                  ]}
                  onPress={() => setSelectedCampaign(camp)}
                  activeOpacity={0.8}
                >
                  {/* Top: Name, Goal, Status */}
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.cardHeaderLeft}>
                      <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                        {camp.campaignName}
                      </Text>
                      <Text style={[styles.cardGoal, { color: colors.textMuted }]} numberOfLines={1}>
                        {camp.campaignGoal}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        camp.status === 'Active'
                          ? styles.statusApproved
                          : camp.status === 'Paused'
                          ? styles.statusPaused
                          : styles.statusDraft,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          camp.status === 'Active'
                            ? styles.statusApprovedText
                            : camp.status === 'Paused'
                            ? styles.statusPausedText
                            : styles.statusDraftText,
                        ]}
                      >
                        {camp.status || 'Draft'}
                      </Text>
                    </View>
                  </View>

                  {/* Metadata Row: Date & Frequency */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaInline}>
                      <Calendar size={13} color={colors.textMuted} />
                      <Text style={[styles.metaInlineText, { color: colors.textMuted }]}>
                        {camp.startDate ? new Date(camp.startDate).toLocaleDateString() : 'Active'}
                      </Text>
                    </View>

                    <Text style={[styles.dotSep, { color: colors.cardBorder }]}>•</Text>

                    <View style={styles.metaInline}>
                      <Clock size={13} color={colors.textMuted} />
                      <Text style={[styles.metaInlineText, { color: colors.textMuted }]}>
                        {camp.postingFrequency || 'Daily'}
                      </Text>
                    </View>

                    {postsCount > 0 && (
                      <>
                        <Text style={[styles.dotSep, { color: colors.cardBorder }]}>•</Text>
                        <View style={styles.metaInline}>
                          <BarChart3 size={13} color="#3B82F6" />
                          <Text style={styles.metaPostsText}>{postsCount} posts</Text>
                        </View>
                      </>
                    )}
                  </View>

                  {/* Platforms Row */}
                  <View style={styles.platformsRow}>
                    {(camp.platforms || []).slice(0, 4).map((plat) => {
                      const pStyle = getPlatformStyle(plat);
                      return (
                        <View
                          key={plat}
                          style={[
                            styles.cardPlatPill,
                            { backgroundColor: pStyle.bg, borderColor: pStyle.border },
                          ]}
                        >
                          <Text style={[styles.cardPlatText, { color: pStyle.text }]}>{plat}</Text>
                        </View>
                      );
                    })}
                    {(camp.platforms?.length || 0) > 4 && (
                      <View
                        style={[
                          styles.cardPlatPill,
                          { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderColor: colors.cardBorder },
                        ]}
                      >
                        <Text style={[styles.cardPlatText, { color: colors.textMuted }]}>
                          +{(camp.platforms?.length || 0) - 4}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Footer Action Bar */}
                  <View style={[styles.cardFooter, { borderTopColor: colors.cardBorder }]}>
                    <View style={styles.cardFooterLeft}>
                      {postsCount > 0 ? (
                        <View style={styles.scheduledStatusRow}>
                          <View style={styles.greenDot} />
                          <Text style={styles.scheduledStatusText}>{postsCount} posts scheduled</Text>
                        </View>
                      ) : (
                        <View style={styles.scheduledStatusRow}>
                          <View style={styles.amberDot} />
                          <Text style={styles.readyStatusText}>Ready to plan</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.cardFooterActions}>
                      <TouchableOpacity
                        style={styles.cardPrimaryBtn}
                        onPress={() => setSelectedCampaign(camp)}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={['#3B82F6', '#6366F1']}
                          style={styles.cardPrimaryBtnGrad}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          {postsCount > 0 ? (
                            <>
                              <Target size={12} color="#FFFFFF" />
                              <Text style={styles.cardPrimaryBtnText}>
                                {hasStrategy ? 'View Strategy' : 'Generate Strategy'}
                              </Text>
                            </>
                          ) : (
                            <>
                              <Sparkles size={12} color="#FFFFFF" />
                              <Text style={styles.cardPrimaryBtnText}>Generate Plan</Text>
                            </>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.cardDeleteBtn,
                          { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.06)' },
                        ]}
                        onPress={() => handleDeleteCampaign(cId, camp.campaignName)}
                        activeOpacity={0.7}
                        accessibilityLabel="Delete Campaign"
                      >
                        <Trash2 size={13} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ─────────────────────────────────────────────────────────────────────────────
          CREATE CAMPAIGN MODAL
         ───────────────────────────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <CreateCampaignModal
          visible={showCreateModal}
          workspaceId={workspaceId}
          userPlan={userPlanNorm}
          onClose={() => setShowCreateModal(false)}
          onCreated={(newCamp) => {
            setCampaigns((prev) => [newCamp, ...prev]);
            setSelectedCampaign(newCamp);
            showToast(`Campaign "${newCamp.campaignName}" created!`);
          }}
        />
      )}

      <FloatingAISABrain />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: Create Campaign Modal
// ─────────────────────────────────────────────────────────────────────────────
interface CreateModalProps {
  visible: boolean;
  workspaceId: string;
  userPlan: string;
  onClose: () => void;
  onCreated: (campaign: Campaign) => void;
}

const CreateCampaignModal: React.FC<CreateModalProps> = ({
  visible,
  workspaceId,
  userPlan,
  onClose,
  onCreated,
}) => {
  const { colors: baseColors, isDark } = useTheme();
  const colors = useMemo(() => ({
    ...baseColors,
    surface: baseColors.cardBackground,
    cardBorder: baseColors.border,
  }), [baseColors]);

  const [campaignName, setCampaignName] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [durationPreset, setDurationPreset] = useState<'30' | '14' | '60' | '90'>('30');
  const [postingFrequency, setPostingFrequency] = useState('Daily');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Instagram', 'LinkedIn']);
  const [budget, setBudget] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [autoGenerateStrategy, setAutoGenerateStrategy] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Preset Duration change
  const handleDurationPreset = (days: '14' | '30' | '60' | '90') => {
    setDurationPreset(days);
    const d = parseInt(days, 10);
    const now = new Date();
    const end = new Date(now.getTime() + d * 86400000);
    setStartDate(now.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  // Toggle platform with tier limit checks
  const togglePlatform = (p: string) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length <= 1) {
        Alert.alert('Required', 'Select at least one platform.');
        return;
      }
      setSelectedPlatforms((prev) => prev.filter((item) => item !== p));
    } else {
      if (userPlan === 'starter' || userPlan === 'free') {
        if (selectedPlatforms.length >= 2) {
          Alert.alert('Plan Limit', 'Starter plan is limited to 2 target platforms. Upgrade to unlock all.');
          return;
        }
      } else if (userPlan === 'base') {
        if (selectedPlatforms.length >= 3) {
          Alert.alert('Plan Limit', 'Base plan is limited to 3 target platforms. Upgrade to unlock all.');
          return;
        }
      }
      setSelectedPlatforms((prev) => [...prev, p]);
    }
  };

  const handleSubmit = async () => {
    if (!campaignName.trim()) {
      setError('Campaign name is required.');
      return;
    }
    if (!campaignGoal.trim()) {
      setError('Campaign goal is required.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const payload = {
        workspaceId,
        campaignName: campaignName.trim(),
        campaignGoal: campaignGoal.trim(),
        startDate,
        endDate,
        postingFrequency,
        platforms: selectedPlatforms,
        budget: budget ? parseFloat(budget) : 0,
        targetAudience: targetAudience.trim(),
      };

      const res = await campaignApi.create(payload);
      let created = res.campaign;

      // Auto-generate strategy if checked
      if (autoGenerateStrategy && (created._id || created.id)) {
        try {
          const stratRes = await campaignApi.generateStrategy(created._id || created.id);
          if (stratRes.campaign) created = stratRes.campaign;
        } catch (stratErr) {
          console.warn('Auto strategy generation note:', stratErr);
        }
      }

      onCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.surface, borderColor: colors.cardBorder, maxHeight: '88%' },
          ]}
        >
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Create New Campaign</Text>
              <Text style={[styles.modalSub, { color: colors.textMuted }]}>
                AI will generate an automated content plan and schedule
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.modalCloseBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
            >
              <X size={16} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
            {error ? (
              <View style={styles.errorBanner}>
                <AlertCircle size={14} color="#EF4444" />
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            ) : null}

            {/* Campaign Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Campaign Name *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)', borderColor: colors.cardBorder, color: colors.textPrimary },
                ]}
                placeholder="e.g. Q3 Brand Awareness Acceleration"
                placeholderTextColor={colors.textMuted}
                value={campaignName}
                onChangeText={setCampaignName}
              />
            </View>

            {/* Campaign Goal */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Campaign Goal *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)', borderColor: colors.cardBorder, color: colors.textPrimary },
                ]}
                placeholder="e.g. Drive 25% more trial signups and boost social presence"
                placeholderTextColor={colors.textMuted}
                value={campaignGoal}
                onChangeText={setCampaignGoal}
              />
            </View>

            {/* Duration Presets */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Campaign Duration</Text>
              <View style={styles.presetRow}>
                {(['14', '30', '60', '90'] as const).map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.presetChip,
                      durationPreset === d && {
                        backgroundColor: colors.accent.primary,
                        borderColor: colors.accent.primary,
                      },
                      { borderColor: colors.cardBorder },
                    ]}
                    onPress={() => handleDurationPreset(d)}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        { color: durationPreset === d ? '#FFFFFF' : colors.textMuted },
                      ]}
                    >
                      {d} Days
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Start and End Dates */}
            <View style={styles.datesRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Start Date</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)', borderColor: colors.cardBorder, color: colors.textPrimary },
                  ]}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>End Date</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)', borderColor: colors.cardBorder, color: colors.textPrimary },
                  ]}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {/* Posting Frequency */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Posting Frequency</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.freqScroll}>
                {FREQUENCIES_LIST.map((f) => {
                  const isSelected = postingFrequency === f;
                  return (
                    <TouchableOpacity
                      key={f}
                      style={[
                        styles.freqChip,
                        isSelected && {
                          backgroundColor: colors.accent.primary,
                          borderColor: colors.accent.primary,
                        },
                        { borderColor: colors.cardBorder },
                      ]}
                      onPress={() => setPostingFrequency(f)}
                    >
                      <Text
                        style={[
                          styles.freqChipText,
                          { color: isSelected ? '#FFFFFF' : colors.textMuted },
                        ]}
                      >
                        {f}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Target Platforms */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Target Platforms</Text>
              <View style={styles.platformsMultiSelect}>
                {PLATFORMS_LIST.map((p) => {
                  const isSelected = selectedPlatforms.includes(p);
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.platSelectChip,
                        isSelected && {
                          backgroundColor: colors.accent.primary,
                          borderColor: colors.accent.primary,
                        },
                        { borderColor: colors.cardBorder },
                      ]}
                      onPress={() => togglePlatform(p)}
                    >
                      <Text
                        style={[
                          styles.platSelectChipText,
                          { color: isSelected ? '#FFFFFF' : colors.textMuted },
                        ]}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Optional Budget & Audience */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Estimated Budget (Optional)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)', borderColor: colors.cardBorder, color: colors.textPrimary },
                ]}
                placeholder="₹50,000 / $600"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={budget}
                onChangeText={setBudget}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Target Audience (Optional)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)', borderColor: colors.cardBorder, color: colors.textPrimary },
                ]}
                placeholder="e.g. Marketing directors, SaaS founders, enterprise buyers"
                placeholderTextColor={colors.textMuted}
                value={targetAudience}
                onChangeText={setTargetAudience}
              />
            </View>

            {/* Auto Strategy Checkbox */}
            <TouchableOpacity
              style={[
                styles.autoStrategyBox,
                { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.06)', borderColor: 'rgba(16, 185, 129, 0.3)' },
              ]}
              onPress={() => setAutoGenerateStrategy(!autoGenerateStrategy)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkboxSquare, autoGenerateStrategy && styles.checkboxActive]}>
                {autoGenerateStrategy && <Check size={12} color="#FFFFFF" />}
              </View>
              <View style={styles.autoStrategyTextCol}>
                <Text style={styles.autoStrategyTitle}>Generate AI Strategy Roadmap immediately</Text>
                <Text style={[styles.autoStrategySub, { color: colors.textMuted }]}>
                  Builds a 30-day tactical GTM and SEO roadmap tailored specifically to this campaign's goal.
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer Submit */}
          <View style={[styles.modalFooter, { borderTopColor: colors.cardBorder }]}>
            <TouchableOpacity
              style={[styles.modalActionSecondary, { borderColor: colors.cardBorder }]}
              onPress={onClose}
            >
              <Text style={[styles.modalActionSecondaryText, { color: colors.textMuted }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalActionPrimary}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#3B82F6', '#6366F1']}
                style={styles.modalActionGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Plus size={15} color="#FFFFFF" />
                )}
                <Text style={styles.modalActionPrimaryText}>
                  {loading ? 'Creating...' : 'Create Campaign'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
  },
  detailScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
  },

  // Toast
  toastWrap: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 999,
    alignItems: 'center',
  },
  toastGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
  },

  // Hero Card
  heroCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    gap: 14,
    marginBottom: 14,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  heroIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextCol: {
    flex: 1,
  },
  heroHeading: {
    fontSize: FONT_SIZES.hero,
    fontWeight: '800',
    lineHeight: LINE_HEIGHTS.hero,
  },
  heroSub: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
    marginTop: 2,
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newCampaignBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  newCampaignGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  newCampaignText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
  },

  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.caption,
    padding: 0,
  },

  // Status Filter Tabs
  statusFiltersScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
  },

  // Campaign Grid
  campaignsGrid: {
    gap: 14,
  },
  campaignsGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  campaignCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  campaignCardTablet: {
    width: '48.5%',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '800',
    lineHeight: LINE_HEIGHTS.heading,
  },
  cardGoal: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
    marginTop: 2,
  },

  // Status Badges
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusDraft: {
    backgroundColor: 'rgba(100, 116, 139, 0.12)',
  },
  statusDraftText: {
    color: '#94A3B8',
  },
  statusApproved: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusApprovedText: {
    color: '#10B981',
  },
  statusGenerated: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  statusGeneratedText: {
    color: '#3B82F6',
  },
  statusPaused: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  statusPausedText: {
    color: '#F59E0B',
  },

  // Meta Row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  metaInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaInlineText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaPostsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
  },
  dotSep: {
    fontSize: 12,
  },

  // Platforms Row
  platformsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  cardPlatPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  cardPlatText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  cardFooterLeft: {
    flex: 1,
  },
  scheduledStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  amberDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  scheduledStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  readyStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
  },
  cardFooterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardPrimaryBtn: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardPrimaryBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cardPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cardDeleteBtn: {
    padding: 7,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Detail View Header
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '800',
    flex: 1,
  },
  headerSub: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    marginTop: 2,
  },
  strategyActivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  strategyActiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },

  // Detail Actions Bar
  detailActionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  actionBtnPrimary: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionBtnSecondary: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statsGridTablet: {
    flexWrap: 'nowrap',
  },
  statCard: {
    flex: 1,
    minWidth: '46%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
  },

  // Post Platform Filters
  postFiltersScroll: {
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Timeline List
  timelineList: {
    gap: 18,
  },
  dateGroup: {
    gap: 10,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateGroupTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateDivider: {
    flex: 1,
    height: 1,
  },
  dateCountBadge: {
    fontSize: 11,
    fontWeight: '600',
  },
  datePostsList: {
    gap: 10,
  },
  postCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  postCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  postTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  platTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  platTagText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  metaTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metaTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  stageTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stageTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366F1',
  },
  postObjective: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  captionSnippetBox: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  captionSnippetText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  hashtagSnippet: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
  },
  postMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postMetaText: {
    fontSize: 11,
    fontWeight: '600',
  },
  postActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  cardActionBtnTextBlue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
  },
  cardActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardActionBtnIcon: {
    padding: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty Box
  emptyBox: {
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 10,
  },
  emptyIconBg: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '800',
  },
  emptyDesc: {
    fontSize: FONT_SIZES.caption,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  emptyCta: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  emptyCtaGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyCtaText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  loadingText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
  },

  // Modal Common
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalHeaderLeft: {
    flex: 1,
  },
  modalTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollBody: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  modalActionSecondary: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalActionSecondaryText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
  },
  modalActionPrimary: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalActionGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalActionPrimaryText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
  },

  // Form Inputs
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  errorBannerText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  textInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: FONT_SIZES.caption,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  freqScroll: {
    gap: 8,
  },
  freqChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  freqChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  platformsMultiSelect: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platSelectChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  platSelectChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  autoStrategyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 6,
  },
  checkboxSquare: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#10B981',
  },
  autoStrategyTextCol: {
    flex: 1,
  },
  autoStrategyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  autoStrategySub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 16,
  },

  // Post Detail Inspection Modal
  detailBlock: {
    marginBottom: 14,
    gap: 4,
  },
  detailHeaderWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  detailBody: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    lineHeight: 20,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
  },
  captionFullBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  captionFullText: {
    fontSize: 13,
    lineHeight: 20,
  },
  hashtagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  hashtagTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  hashtagTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
  },
  metaGridTwo: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 12,
  },
  metaCell: {
    flex: 1,
    padding: 10,
    gap: 4,
  },
  metaCellValue: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Strategy Modal
  strategyModalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  strategyIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strategyCardBlock: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
    marginBottom: 10,
  },
  strategyCardLabelGreen: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  strategyCardLabelBlue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3B82F6',
    letterSpacing: 0.5,
  },
  strategyCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  strategyCardValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  strategyTwoCols: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  strategyColCard: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  strategyColVal: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  strategyTacticalBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  strategyTacticalText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
});
