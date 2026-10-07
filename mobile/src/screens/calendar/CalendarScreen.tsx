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
  ActivityIndicator,
  Image,
  useWindowDimensions,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Calendar as CalendarIcon,
  Plus,
  Settings,
  Clock,
  CheckCircle2,
  Sparkles,
  FileText,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Edit2,
  Save,
  ArrowRight,
  X,
  RefreshCw,
  Check,
  Globe,
  Mail,
  Youtube,
  Twitter,
  Linkedin,
  Instagram,
  ImageIcon,
  ShieldCheck,
  SlidersHorizontal,
  Target,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { campaignApi } from '../../api/campaignApi';
import { BrandHeader } from '../../components/common/BrandHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { FloatingAISABrain } from '../../components/common/FloatingAISABrain';
import { Campaign, CampaignPost } from '../../types';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

const PLATFORM_COLORS: Record<string, { bg: string; text: string; hex: string }> = {
  instagram: { bg: 'rgba(225, 48, 108, 0.12)', text: '#E1306C', hex: '#E1306C' },
  facebook: { bg: 'rgba(24, 119, 242, 0.12)', text: '#1877F2', hex: '#1877F2' },
  linkedin: { bg: 'rgba(10, 102, 194, 0.12)', text: '#0A66C2', hex: '#0A66C2' },
  'x/twitter': { bg: 'rgba(14, 165, 233, 0.12)', text: '#0284C7', hex: '#0284C7' },
  twitter: { bg: 'rgba(14, 165, 233, 0.12)', text: '#0284C7', hex: '#0284C7' },
  youtube: { bg: 'rgba(239, 68, 68, 0.12)', text: '#DC2626', hex: '#DC2626' },
  email: { bg: 'rgba(245, 158, 11, 0.12)', text: '#D97706', hex: '#D97706' },
  blog: { bg: 'rgba(124, 58, 237, 0.12)', text: '#7C3AED', hex: '#7C3AED' },
  seo: { bg: 'rgba(124, 58, 237, 0.12)', text: '#7C3AED', hex: '#7C3AED' },
};

const getPlatformTheme = (platform: string) => {
  const norm = (platform || '').toLowerCase();
  for (const key of Object.keys(PLATFORM_COLORS)) {
    if (norm.includes(key)) {
      return PLATFORM_COLORS[key];
    }
  }
  return { bg: 'rgba(16, 185, 129, 0.12)', text: '#10B981', hex: '#10B981' };
};

const FREQUENCY_OPTIONS = [
  'Daily',
  '2x per week',
  '3x per week',
  '4x per week',
  '5x per week',
  'Weekly',
  'Bi Weekly',
  'Monthly',
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const CalendarScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const {
    activeWorkspace,
    setStudioTarget,
  } = useWorkspace();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isSmall = width < 380;

  const workspaceId = activeWorkspace?._id || activeWorkspace?.id || 'ws_001';
  const brandName = (activeWorkspace?.brandName || 'Brand').trim();

  // Strategy plan from active workspace
  const strategyPlan: any[] = useMemo(() => {
    return (activeWorkspace as any)?.currentStrategy?.thirtyDayPlan || [];
  }, [activeWorkspace]);
  const hasStrategyPlan = strategyPlan.length > 0;

  // Derive platforms from strategy plan
  const strategyPlatforms = useMemo(() => {
    if (hasStrategyPlan) {
      const set = new Set<string>();
      strategyPlan.forEach((d) => {
        const p = (d.platform || '').toLowerCase();
        if (p.includes('linkedin')) set.add('LinkedIn');
        else if (p.includes('instagram')) set.add('Instagram');
        else if (p.includes('email') || p.includes('newsletter')) set.add('Email');
        else if (p.includes('youtube')) set.add('YouTube');
        else if (p.includes('blog') || p.includes('seo')) set.add('Blog');
        else if (p.includes('twitter') || p.includes('x.com')) set.add('Twitter');
        else set.add('Instagram');
      });
      return Array.from(set);
    }
    return ['Instagram', 'LinkedIn', 'YouTube'];
  }, [hasStrategyPlan, strategyPlan]);

  // Screen State
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const [campaignPosts, setCampaignPosts] = useState<CampaignPost[]>([]);
  const [isCampaignLoading, setIsCampaignLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [generatingPostId, setGeneratingPostId] = useState<string | null>(null);

  // Form Configuration State
  const [campaignConfig, setCampaignConfig] = useState({
    campaignName: '',
    postingFrequency: 'Daily',
    startDate: '',
    endDate: '',
  });

  // Calendar Date State
  const [calendarMonth, setCalendarMonth] = useState<number>(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState<number>(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Post Editing State
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<CampaignPost>>({});
  const [isSavingPost, setIsSavingPost] = useState(false);

  // Modals & Feedback
  const [showCampaignPickerModal, setShowCampaignPickerModal] = useState(false);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toast feedback helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // Back Navigation Handler
  const handleGoBack = useCallback(() => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  }, [navigation]);

  // Auto-init dates & campaign name default
  useEffect(() => {
    const days = strategyPlan.length || 30;
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() + (days - 1));

    setCampaignConfig((prev) => {
      if (prev.campaignName && prev.startDate) return prev;
      return {
        campaignName: `${brandName} ${days}-Day Campaign`,
        postingFrequency: 'Daily',
        startDate: today.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    });
  }, [brandName, strategyPlan.length]);

  // Calculate active days span
  const activeDaysCount = useMemo(() => {
    const startStr = campaignConfig.startDate || currentCampaign?.startDate;
    const endStr = campaignConfig.endDate || currentCampaign?.endDate;
    if (!startStr || !endStr) return 30;
    try {
      const s = new Date(startStr);
      const e = new Date(endStr);
      const diffDays = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return Math.max(1, isNaN(diffDays) ? 30 : diffDays);
    } catch {
      return 30;
    }
  }, [campaignConfig.startDate, campaignConfig.endDate, currentCampaign?.startDate, currentCampaign?.endDate]);

  // Load Campaigns History
  const loadCampaignHistory = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const res = await campaignApi.list({ workspaceId });
      if (res.success && Array.isArray(res.campaigns)) {
        setCampaigns(res.campaigns);
        if (res.campaigns.length > 0 && !currentCampaign) {
          handleSelectCampaign(res.campaigns[0]);
        }
      }
    } catch (err: any) {
      console.warn('[CalendarScreen] loadCampaignHistory notice:', err.message);
    }
  }, [workspaceId, currentCampaign]);

  useEffect(() => {
    loadCampaignHistory();
  }, [workspaceId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCampaignHistory();
    if (currentCampaign?._id || currentCampaign?.id) {
      await handleSelectCampaign(currentCampaign);
    }
    setRefreshing(false);
  };

  // Select a specific campaign
  const handleSelectCampaign = async (camp: Campaign) => {
    setIsCampaignLoading(true);
    try {
      setCurrentCampaign(camp);
      setCampaignConfig({
        campaignName: camp.campaignName || '',
        postingFrequency: camp.postingFrequency || 'Daily',
        startDate: camp.startDate ? camp.startDate.split('T')[0] : '',
        endDate: camp.endDate ? camp.endDate.split('T')[0] : '',
      });

      const campId = camp._id || camp.id;
      if (campId) {
        const res = await campaignApi.getPosts(campId);
        if (res.success && Array.isArray(res.posts)) {
          setCampaignPosts(res.posts);
          if (res.posts.length > 0 && res.posts[0].date) {
            const firstDate = new Date(res.posts[0].date);
            if (!isNaN(firstDate.getTime())) {
              setCalendarMonth(firstDate.getMonth());
              setCalendarYear(firstDate.getFullYear());
              setSelectedDate(firstDate);
            }
          }
        }
      }
      setIsEditingPost(false);
    } catch (err: any) {
      console.warn('[CalendarScreen] handleSelectCampaign error:', err.message);
    } finally {
      setIsCampaignLoading(false);
    }
  };

  // Duration Quick Select: 7, 14, 30 days
  const handleDurationSelect = (days: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() + (days - 1));

    setCampaignConfig((prev) => ({
      ...prev,
      campaignName: `${brandName} ${days}-Day Campaign`,
      startDate: today.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    }));
  };

  // Create & Generate Campaign Calendar Plan
  const handleCreateCampaign = async () => {
    if (!campaignConfig.startDate || !campaignConfig.endDate) {
      Alert.alert('Dates Required', 'Please ensure both Start Date and End Date are configured.');
      return;
    }
    if (new Date(campaignConfig.startDate) > new Date(campaignConfig.endDate)) {
      Alert.alert('Invalid Range', 'Start Date cannot be greater than End Date.');
      return;
    }
    if (!campaignConfig.campaignName.trim()) {
      Alert.alert('Campaign Name Required', 'Please enter a name for your campaign calendar.');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setIsCampaignLoading(true);
    try {
      const platformsToUse =
        hasStrategyPlan && strategyPlatforms.length > 0
          ? strategyPlatforms
          : ['Instagram', 'LinkedIn', 'YouTube'];

      const campaignGoal =
        (activeWorkspace as any)?.currentStrategy?.businessGoal ||
        'Autonomous AI Content Distribution & Lead Generation';

      const payload = {
        workspaceId,
        campaignName: campaignConfig.campaignName.trim(),
        campaignGoal,
        startDate: campaignConfig.startDate,
        endDate: campaignConfig.endDate,
        postingFrequency: campaignConfig.postingFrequency,
        platforms: platformsToUse,
      };

      const res = await campaignApi.create(payload);
      if (res.success && res.campaign) {
        const newCampId = res.campaign._id || res.campaign.id;
        const planToUse = hasStrategyPlan
          ? strategyPlan.filter((item) => (item.day || 1) <= activeDaysCount)
          : [];

        const genBody = planToUse.length > 0 ? { strategyPlan: planToUse } : {};
        const genRes = await campaignApi.generatePlan(newCampId, genBody);

        if (genRes.success) {
          setCurrentCampaign(res.campaign);
          const posts = genRes.posts || [];
          setCampaignPosts(posts);
          await loadCampaignHistory();

          if (posts.length > 0 && posts[0].date) {
            const firstDate = new Date(posts[0].date);
            if (!isNaN(firstDate.getTime())) {
              setCalendarMonth(firstDate.getMonth());
              setCalendarYear(firstDate.getFullYear());
              setSelectedDate(firstDate);
            }
          }
          showToast(`Generated ${posts.length} posts for ${res.campaign.campaignName}!`);
        }
      }
    } catch (err: any) {
      Alert.alert('Calendar Generation Failed', err.message || 'Unable to orchestrate schedule.');
    } finally {
      setIsCampaignLoading(false);
    }
  };

  // Generate Post Copy using AI
  const handleGeneratePost = async (postId: string) => {
    setGeneratingPostId(postId);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    try {
      const res = await campaignApi.generatePostContent(postId);
      if (res.success && res.post) {
        setCampaignPosts((prev) =>
          prev.map((p) => ((p._id || p.id) === (res.post._id || res.post.id) ? res.post : p))
        );
        showToast('AI copy synthesized successfully!');
      }
    } catch (err: any) {
      Alert.alert('Copy Generation Failed', err.message || 'Failed to synthesize copy.');
    } finally {
      setGeneratingPostId(null);
    }
  };

  // Toggle Edit Post
  const toggleEditPost = (post: CampaignPost) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (isEditingPost) {
      setIsEditingPost(false);
      setEditFormData({});
    } else {
      setIsEditingPost(true);
      setEditFormData({ ...post });
    }
  };

  // Save Edited Post
  const handleSavePost = async () => {
    const pId = editFormData._id || editFormData.id;
    if (!pId) return;

    setIsSavingPost(true);
    try {
      const res = await campaignApi.updatePost(pId, editFormData);
      if (res.success && res.post) {
        setCampaignPosts((prev) =>
          prev.map((p) => ((p._id || p.id) === pId ? res.post : p))
        );
        setIsEditingPost(false);
        showToast('Post changes saved!');
      }
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Could not save post updates.');
    } finally {
      setIsSavingPost(false);
    }
  };

  // Continue to Content Studio Bridge
  const handleContinueToStudio = (post: CampaignPost) => {
    const platform = (post.platform || 'instagram').toLowerCase();
    const topic = post.postObjective || post.postFor || 'Campaign Update';
    const postType = (post.postType || post.contentType || 'social').toLowerCase();

    const isEmail = platform === 'email' || postType.includes('email');
    const isBlog = platform === 'blog' || platform === 'seo' || postType.includes('blog');
    const isNewspaper = platform === 'newspaper' || postType.includes('press');
    const type = isEmail ? 'EMAIL' : isBlog ? 'BLOG' : isNewspaper ? 'NEWSPAPER' : 'SOCIAL';

    const isReelsOrStory = platform.includes('reel') || platform.includes('tiktok') || platform.includes('story');
    const aspect = isReelsOrStory ? '9:16' : platform === 'instagram' ? '1:1' : '16:9';

    if (setStudioTarget) {
      setStudioTarget({
        workspaceId,
        brandName,
        industry: activeWorkspace?.industryCategory || '',
        tagline: activeWorkspace?.tagline || '',
        platform,
        topic,
        postType: isEmail ? 'email' : postType,
        type,
        autoGenerate: true,
        generateVisual: !isEmail,
        imageUrl: post.generatedImage || post.imageUrl || null,
        imageAspect: isEmail ? null : aspect,
        strategyPillar: post.postFor || 'Brand Growth',
        campaignStage: post.campaignStage || 'Awareness',
        calendarDate: post.date,
        calendarDay: post.day,
      });
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    navigation.navigate('Studio');
  };

  // View in Asset Library Bridge
  const handleViewInAssetLibrary = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    navigation.navigate('More', { screen: 'AssetLibrary' });
  };

  // Date Comparison Helper
  const isSameDay = (d1: string | Date | undefined, d2: string | Date | undefined) => {
    if (!d1 || !d2) return false;
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Calendar Cells Computation (Standard 42-cell layout: Monday start)
  const calendarCells = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(calendarYear, calendarMonth, 0).getDate();

    const cells: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push({
        day: daysInPrevMonth - i,
        month: calendarMonth === 0 ? 11 : calendarMonth - 1,
        year: calendarMonth === 0 ? calendarYear - 1 : calendarYear,
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        day: i,
        month: calendarMonth,
        year: calendarYear,
        isCurrentMonth: true,
      });
    }

    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        day: i,
        month: calendarMonth === 11 ? 0 : calendarMonth + 1,
        year: calendarMonth === 11 ? calendarYear + 1 : calendarYear,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [calendarYear, calendarMonth]);

  const handlePrevMonth = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((prev) => prev - 1);
    } else {
      setCalendarMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((prev) => prev + 1);
    } else {
      setCalendarMonth((prev) => prev + 1);
    }
  };

  const handleDateSelect = (cellDate: Date) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSelectedDate(cellDate);
    setIsEditingPost(false);
  };

  // Find active post for selected date
  const activePost = useMemo(() => {
    return campaignPosts.find((p) => isSameDay(p.date, selectedDate));
  }, [campaignPosts, selectedDate]);

  // Derived Counts for Progress Stats
  const hasGeneratedCampaign = campaignPosts && campaignPosts.length > 0;
  const startStr = campaignConfig.startDate || currentCampaign?.startDate || '';
  const endStr = campaignConfig.endDate || currentCampaign?.endDate || '';
  const cleanStart = startStr ? startStr.split('T')[0] : '';
  const cleanEnd = endStr ? endStr.split('T')[0] : '';

  const activePosts = useMemo(() => {
    if (!hasGeneratedCampaign) return [];
    return campaignPosts.filter((p, idx) => {
      if (!cleanStart || !cleanEnd) return idx < activeDaysCount;
      if (!p.date) return idx < activeDaysCount;
      const pDateStr = p.date.split('T')[0];
      return pDateStr >= cleanStart && pDateStr <= cleanEnd;
    });
  }, [hasGeneratedCampaign, campaignPosts, cleanStart, cleanEnd, activeDaysCount]);

  const totalCount = hasGeneratedCampaign && activePosts.length > 0 ? activePosts.length : activeDaysCount;
  const generatedCount = hasGeneratedCampaign
    ? activePosts.filter((p) => ['Generated', 'Approved', 'Scheduled', 'Published'].includes(p.status)).length
    : 0;
  const scheduledCount = hasGeneratedCampaign
    ? activePosts.filter((p) => p.status === 'Scheduled').length
    : 0;
  const remainingCount = Math.max(0, totalCount - generatedCount);
  const progressPercent =
    hasGeneratedCampaign && totalCount > 0
      ? Math.min(100, Math.round((generatedCount / totalCount) * 100))
      : 0;

  // Active platforms represented in current campaign
  const presentPlatforms = useMemo(() => {
    const list: string[] = [];
    campaignPosts.forEach((p) => {
      const pl = (p.platform || '').toLowerCase();
      if (pl && !list.includes(pl)) list.push(pl);
    });
    return list;
  }, [campaignPosts]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader showBack onBack={handleGoBack} title="Marketing Calendar" />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <View style={styles.toastWrap}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.toastGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <CheckCircle2 size={16} color="#FFFFFF" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </LinearGradient>
        </View>
      )}

      {/* Subheader Utility Bar */}
      <View
        style={[
          styles.subHeaderBar,
          {
            backgroundColor: colors.headerBackground,
            borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
          },
        ]}
      >
        <View style={styles.subHeaderLeft}>
          <CalendarIcon size={14} color="#10B981" />
          <Text style={[styles.subHeaderBrand, { color: colors.textPrimary }]} numberOfLines={1}>
            {brandName}
          </Text>
          <View style={[styles.dotSep, { backgroundColor: colors.border }]} />
          <Text style={[styles.subHeaderNote, { color: colors.textSecondary }]}>
            {currentCampaign?.campaignName || `${activeDaysCount}-Day Timeline`}
          </Text>
        </View>

        {/* Approvals & Assets Quick Links */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TouchableOpacity
            style={[
              styles.approvalsBtn,
              { backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)' },
            ]}
            onPress={() => navigation.navigate('ApprovalsDesk')}
            activeOpacity={0.75}
          >
            <ShieldCheck size={12} color="#10B981" />
            <Text style={styles.approvalsBtnText}>Approvals</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.approvalsBtn,
              { backgroundColor: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)', borderColor: isDark ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.2)' },
            ]}
            onPress={() => navigation.navigate('AssetLibrary')}
            activeOpacity={0.75}
          >
            <Layers size={12} color="#3B82F6" />
            <Text style={[styles.approvalsBtnText, { color: '#3B82F6' }]}>Assets</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
          />
        }
      >
        {/* ─────────────────────────────────────────────────────────────────────────────
            1. CAMPAIGN INFO CARD
           ───────────────────────────────────────────────────────────────────────────── */}
        <GlassCard style={[styles.campaignInfoCard, { borderLeftColor: '#10B981' }]} variant="raised">
          {/* Card Header with Campaign Switcher & New */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleWrap}>
              <Settings size={15} color="#10B981" />
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>CAMPAIGN INFO</Text>
            </View>

            <View style={styles.cardActionsRow}>
              {campaigns.length > 0 && (
                <TouchableOpacity
                  style={[
                    styles.campaignSelectorBtn,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setShowCampaignPickerModal(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.campaignSelectorText, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {currentCampaign?.campaignName || 'Campaign History'}
                  </Text>
                  <ChevronDown size={12} color={colors.textSecondary} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.newCampaignPill}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  setCurrentCampaign(null);
                  setCampaignPosts([]);
                  const today = new Date();
                  const end = new Date(today);
                  end.setDate(today.getDate() + 29);
                  setCampaignConfig({
                    campaignName: `${brandName} 30-Day Campaign`,
                    postingFrequency: 'Daily',
                    startDate: today.toISOString().split('T')[0],
                    endDate: end.toISOString().split('T')[0],
                  });
                  showToast('Ready to configure new campaign!');
                }}
                activeOpacity={0.8}
              >
                <Plus size={12} color="#10B981" />
                <Text style={styles.newCampaignPillText}>New</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Duration Selector Quick Pills (7, 14, 30 Days) */}
          <View
            style={[
              styles.durationSelectorRow,
              {
                backgroundColor: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(241,245,249,0.9)',
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.durationLabel, { color: colors.textMuted }]}>DURATION:</Text>
            {[7, 14, 30].map((days) => {
              const isSelected = activeDaysCount === days;
              return (
                <TouchableOpacity
                  key={days}
                  onPress={() => handleDurationSelect(days)}
                  style={[
                    styles.durationBtn,
                    isSelected && styles.durationBtnActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.durationBtnText,
                      { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {days} Days
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Form Fields: Campaign Name & Posting Frequency */}
          <View style={styles.formFieldsGrid}>
            <View style={styles.formFieldCol}>
              <Text style={[styles.formLabel, { color: colors.textMuted }]}>CAMPAIGN NAME</Text>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)',
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                value={campaignConfig.campaignName}
                onChangeText={(text) =>
                  setCampaignConfig((prev) => ({ ...prev, campaignName: text }))
                }
                placeholder="e.g. Q1 Product Launch"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.formFieldCol}>
              <Text style={[styles.formLabel, { color: colors.textMuted }]}>POSTING FREQUENCY</Text>
              <TouchableOpacity
                style={[
                  styles.formSelectBtn,
                  {
                    backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)',
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowFrequencyModal(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.formSelectText, { color: colors.textPrimary }]}>
                  {campaignConfig.postingFrequency}
                </Text>
                <ChevronDown size={13} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Dates Row */}
          <View style={styles.datesRow}>
            <View style={styles.dateCol}>
              <Text style={[styles.formLabel, { color: colors.textMuted }]}>START DATE</Text>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)',
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                value={campaignConfig.startDate}
                onChangeText={(text) =>
                  setCampaignConfig((prev) => ({ ...prev, startDate: text }))
                }
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.dateCol}>
              <Text style={[styles.formLabel, { color: colors.textMuted }]}>END DATE</Text>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)',
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                value={campaignConfig.endDate}
                onChangeText={(text) =>
                  setCampaignConfig((prev) => ({ ...prev, endDate: text }))
                }
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          {/* Strategy Linked Badge */}
          {hasStrategyPlan ? (
            <View style={styles.strategyLinkedBadge}>
              <View style={styles.strategyLinkedLeft}>
                <CheckCircle2 size={14} color="#10B981" />
                <Text style={styles.strategyLinkedTitle}>Strategy Linked</Text>
              </View>
              <Text style={styles.strategyLinkedMeta}>
                {activeDaysCount}-Day Plan · {strategyPlatforms.length} Platforms
              </Text>
            </View>
          ) : (
            <View style={styles.noStrategyBadge}>
              <View style={styles.strategyLinkedLeft}>
                <Clock size={14} color="#F59E0B" />
                <Text style={styles.noStrategyTitle}>No Strategy Plan</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Strategy')}
                activeOpacity={0.7}
              >
                <Text style={styles.noStrategyBtn}>Generate Strategy →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Active Schedule Span */}
          {campaignConfig.startDate && campaignConfig.endDate && (
            <View style={styles.scheduleSpanRow}>
              <Text style={styles.scheduleSpanLabel}>Active Schedule Span</Text>
              <Text style={styles.scheduleSpanVal}>
                {campaignConfig.startDate} → {campaignConfig.endDate}
              </Text>
            </View>
          )}

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.primaryGenerateBtn}
            onPress={handleCreateCampaign}
            disabled={isCampaignLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.primaryGenerateGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isCampaignLoading ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.primaryGenerateBtnText}>Generating Plan...</Text>
                </>
              ) : hasStrategyPlan ? (
                <>
                  <Sparkles size={15} color="#FFFFFF" />
                  <Text style={styles.primaryGenerateBtnText}>Generate from Strategy Plan</Text>
                </>
              ) : (
                <>
                  <Sparkles size={15} color="#FFFFFF" />
                  <Text style={styles.primaryGenerateBtnText}>Generate Calendar</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </GlassCard>

        {/* ─────────────────────────────────────────────────────────────────────────────
            2. CAMPAIGN PROGRESS & LIVE METRIC STATS CARD
           ───────────────────────────────────────────────────────────────────────────── */}
        <GlassCard style={[styles.progressCard, { borderLeftColor: '#10B981' }]} variant="raised">
          <View style={styles.progressHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.progressCardTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                Campaign Progress: {currentCampaign?.campaignName || 'NEW LAUNCH'}
              </Text>
              <Text style={[styles.progressCardSub, { color: colors.textMuted }]}>
                {totalCount} Scheduled Publication Days
              </Text>
            </View>
            <View style={styles.progressPercentPill}>
              <Text style={styles.progressPercentText}>{progressPercent}% Completed</Text>
            </View>
          </View>

          {/* Horizontal Progress Bar */}
          <View
            style={[
              styles.progressBarTrack,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
            ]}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={[styles.progressBarFill, { width: `${Math.max(5, progressPercent)}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>

          {/* 4 Stat Metric Cards */}
          <View style={styles.metricStatsGrid}>
            {[
              {
                label: 'Total Posts',
                val: totalCount,
                icon: <FileText size={14} color="#10B981" />,
              },
              {
                label: 'Generated',
                val: generatedCount,
                icon: <Sparkles size={14} color="#059669" />,
              },
              {
                label: 'Scheduled',
                val: scheduledCount,
                icon: <Clock size={14} color="#10B981" />,
              },
              {
                label: 'Remaining',
                val: remainingCount,
                icon: <Layers size={14} color="#059669" />,
              },
            ].map((stat, idx) => (
              <View
                key={idx}
                style={[
                  styles.metricStatBox,
                  {
                    backgroundColor: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.04)',
                    borderColor: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)',
                  },
                ]}
              >
                <View style={styles.metricStatTop}>
                  <View style={styles.metricIconWrap}>{stat.icon}</View>
                  <Text style={[styles.metricStatLabel, { color: colors.textSecondary }]}>
                    {stat.label}
                  </Text>
                </View>
                <Text style={[styles.metricStatVal, { color: colors.textPrimary }]}>{stat.val}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* ─────────────────────────────────────────────────────────────────────────────
            3. INTERACTIVE MONTHLY CALENDAR GRID
           ───────────────────────────────────────────────────────────────────────────── */}
        <GlassCard style={styles.calendarWidgetCard} variant="raised">
          {/* Month Selector Bar */}
          <View style={styles.monthHeaderRow}>
            <Text style={[styles.monthHeaderTitle, { color: colors.textPrimary }]}>
              {MONTH_NAMES[calendarMonth]} {calendarYear}
            </Text>

            <View style={styles.monthNavBtnsRow}>
              <TouchableOpacity
                onPress={handlePrevMonth}
                style={[
                  styles.monthNavBtn,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    borderColor: colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <ChevronLeft size={16} color={colors.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNextMonth}
                style={[
                  styles.monthNavBtn,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    borderColor: colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <ChevronRight size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Weekday Names Header */}
          <View style={styles.weekdaysRow}>
            {WEEKDAY_NAMES.map((name) => (
              <View key={name} style={styles.weekdayCol}>
                <Text style={[styles.weekdayText, { color: colors.textMuted }]}>{name}</Text>
              </View>
            ))}
          </View>

          {/* 42-Day Calendar Grid */}
          <View style={styles.calendarCellsGrid}>
            {calendarCells.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <View key={idx} style={styles.cellCol}>
                    <Text style={[styles.cellDayTextFaded, { color: colors.border }]}>
                      {cell.day}
                    </Text>
                  </View>
                );
              }

              const cellDate = new Date(cell.year, cell.month, cell.day);
              const postOnDay = campaignPosts.find((p) => isSameDay(p.date, cellDate));
              const hasPost = Boolean(postOnDay);
              const isSelected = isSameDay(cellDate, selectedDate);
              const isGeneratedOrApproved =
                postOnDay &&
                ['Generated', 'Approved', 'Scheduled', 'Published'].includes(postOnDay.status);

              const platTheme = postOnDay ? getPlatformTheme(postOnDay.platform) : null;

              return (
                <View key={idx} style={styles.cellCol}>
                  <TouchableOpacity
                    onPress={() => handleDateSelect(cellDate)}
                    style={[
                      styles.cellCircle,
                      hasPost && { backgroundColor: platTheme?.hex || '#10B981' },
                      isSelected && {
                        borderWidth: 2,
                        borderColor: '#10B981',
                        shadowColor: '#10B981',
                        shadowOpacity: 0.5,
                        shadowRadius: 4,
                        elevation: 4,
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.cellDayText,
                        hasPost
                          ? { color: '#FFFFFF', fontWeight: '800' }
                          : { color: colors.textPrimary },
                      ]}
                    >
                      {cell.day}
                    </Text>

                    {/* Checkmark or Platform Mini Indicator */}
                    {isGeneratedOrApproved ? (
                      <View style={styles.downloadedBadge}>
                        <Check size={8} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    ) : hasPost ? (
                      <View style={styles.postScheduledDot} />
                    ) : null}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* Platform Color Legend */}
          {presentPlatforms.length > 0 && (
            <View
              style={[
                styles.legendRow,
                { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
              ]}
            >
              {[
                { platform: 'linkedin', label: 'LinkedIn', icon: Linkedin },
                { platform: 'instagram', label: 'Instagram', icon: Instagram },
                { platform: 'email', label: 'Email', icon: Mail },
                { platform: 'blog', label: 'Blog/SEO', icon: Globe },
                { platform: 'youtube', label: 'YouTube', icon: Youtube },
                { platform: 'twitter', label: 'Twitter', icon: Twitter },
              ]
                .filter((item) => presentPlatforms.some((p) => p.includes(item.platform)))
                .map((item) => {
                  const theme = getPlatformTheme(item.platform);
                  const Icon = item.icon;
                  return (
                    <View
                      key={item.platform}
                      style={[
                        styles.legendChip,
                        {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Icon size={11} color={theme.hex} />
                      <Text style={[styles.legendChipText, { color: colors.textSecondary }]}>
                        {item.label}
                      </Text>
                    </View>
                  );
                })}
            </View>
          )}
        </GlassCard>

        {/* ─────────────────────────────────────────────────────────────────────────────
            4. ACTIVE SELECTED DAY DETAILS CARD
           ───────────────────────────────────────────────────────────────────────────── */}
        <GlassCard style={styles.dayDetailCard} variant="raised">
          {activePost ? (
            <View style={styles.detailContainer}>
              {/* Header */}
              <View
                style={[
                  styles.detailHeaderRow,
                  { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailDateTitle, { color: colors.textPrimary }]}>
                    {new Date(activePost.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                  <View style={styles.detailSubtitleRow}>
                    <Badge
                      label={activePost.platform || 'Social'}
                      variant="accent"
                      style={{ paddingVertical: 2 }}
                    />
                    <Text style={[styles.detailDayNumber, { color: colors.textMuted }]}>
                      {activePost.day || 'Day Post'}
                    </Text>
                    <Badge
                      label={activePost.status || 'Draft'}
                      variant={
                        activePost.status === 'Approved' || activePost.status === 'Generated'
                          ? 'success'
                          : 'warning'
                      }
                      style={{ paddingVertical: 2 }}
                    />
                  </View>
                </View>

                {/* Edit Toggle */}
                <TouchableOpacity
                  style={[
                    styles.editToggleBtn,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => toggleEditPost(activePost)}
                  activeOpacity={0.7}
                >
                  {isEditingPost ? (
                    <X size={15} color={colors.textPrimary} />
                  ) : (
                    <Edit2 size={15} color="#10B981" />
                  )}
                </TouchableOpacity>
              </View>

              {/* POST EDIT FORM */}
              {isEditingPost ? (
                <View style={styles.editFormContainer}>
                  {/* Platform */}
                  <View style={styles.editFormField}>
                    <Text style={[styles.editFormLabel, { color: colors.textMuted }]}>PLATFORM</Text>
                    <View style={styles.editPillsRow}>
                      {['Instagram', 'LinkedIn', 'Twitter', 'Facebook', 'Email', 'Blog'].map((pl) => {
                        const isPlSelected =
                          (editFormData.platform || '').toLowerCase() === pl.toLowerCase();
                        return (
                          <TouchableOpacity
                            key={pl}
                            onPress={() => setEditFormData((prev) => ({ ...prev, platform: pl }))}
                            style={[
                              styles.editPlatformPill,
                              isPlSelected && { backgroundColor: '#10B981', borderColor: '#10B981' },
                              { borderColor: colors.border },
                            ]}
                          >
                            <Text
                              style={[
                                styles.editPlatformPillText,
                                { color: isPlSelected ? '#FFFFFF' : colors.textPrimary },
                              ]}
                            >
                              {pl}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Post Type */}
                  <View style={styles.editFormField}>
                    <Text style={[styles.editFormLabel, { color: colors.textMuted }]}>POST TYPE</Text>
                    <TextInput
                      style={[
                        styles.formInput,
                        {
                          backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)',
                          borderColor: colors.border,
                          color: colors.textPrimary,
                        },
                      ]}
                      value={editFormData.postType || ''}
                      onChangeText={(text) =>
                        setEditFormData((prev) => ({ ...prev, postType: text }))
                      }
                      placeholder="Single Image, Carousel, Reel, Story..."
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>

                  {/* Carousel Count (if Carousel) */}
                  {editFormData.postType?.toLowerCase().includes('carousel') && (
                    <View style={styles.editFormField}>
                      <Text style={[styles.editFormLabel, { color: colors.textMuted }]}>
                        CAROUSEL IMAGES
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {[2, 3, 4].map((num) => (
                          <TouchableOpacity
                            key={num}
                            onPress={() =>
                              setEditFormData((prev) => ({ ...prev, carouselImages: num }))
                            }
                            style={[
                              styles.numPill,
                              (editFormData.carouselImages || 2) === num && styles.numPillActive,
                              { borderColor: colors.border },
                            ]}
                          >
                            <Text
                              style={{
                                color:
                                  (editFormData.carouselImages || 2) === num
                                    ? '#FFFFFF'
                                    : colors.textPrimary,
                                fontWeight: '700',
                              }}
                            >
                              {num}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Content Type & Stage */}
                  <View style={styles.formFieldsGrid}>
                    <View style={styles.formFieldCol}>
                      <Text style={[styles.editFormLabel, { color: colors.textMuted }]}>
                        CONTENT TYPE
                      </Text>
                      <TextInput
                        style={[
                          styles.formInput,
                          {
                            backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)',
                            borderColor: colors.border,
                            color: colors.textPrimary,
                          },
                        ]}
                        value={editFormData.contentType || ''}
                        onChangeText={(text) =>
                          setEditFormData((prev) => ({ ...prev, contentType: text }))
                        }
                      />
                    </View>
                    <View style={styles.formFieldCol}>
                      <Text style={[styles.editFormLabel, { color: colors.textMuted }]}>
                        STAGE
                      </Text>
                      <TextInput
                        style={[
                          styles.formInput,
                          {
                            backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)',
                            borderColor: colors.border,
                            color: colors.textPrimary,
                          },
                        ]}
                        value={editFormData.campaignStage || ''}
                        onChangeText={(text) =>
                          setEditFormData((prev) => ({ ...prev, campaignStage: text }))
                        }
                      />
                    </View>
                  </View>

                  {/* Strategy Pillar */}
                  <View style={styles.editFormField}>
                    <Text style={[styles.editFormLabel, { color: colors.textMuted }]}>
                      STRATEGY PILLAR
                    </Text>
                    <TextInput
                      style={[
                        styles.formInput,
                        {
                          backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)',
                          borderColor: colors.border,
                          color: colors.textPrimary,
                        },
                      ]}
                      value={editFormData.postFor || ''}
                      onChangeText={(text) =>
                        setEditFormData((prev) => ({ ...prev, postFor: text }))
                      }
                    />
                  </View>

                  {/* Topic / Objective */}
                  <View style={styles.editFormField}>
                    <Text style={[styles.editFormLabel, { color: colors.textMuted }]}>
                      TOPIC / OBJECTIVE
                    </Text>
                    <TextInput
                      style={[
                        styles.formInput,
                        styles.formTextarea,
                        {
                          backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)',
                          borderColor: colors.border,
                          color: colors.textPrimary,
                        },
                      ]}
                      value={editFormData.postObjective || ''}
                      onChangeText={(text) =>
                        setEditFormData((prev) => ({ ...prev, postObjective: text }))
                      }
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  {/* Best Time */}
                  <View style={styles.editFormField}>
                    <Text style={[styles.editFormLabel, { color: colors.textMuted }]}>
                      BEST POSTING TIME
                    </Text>
                    <TextInput
                      style={[
                        styles.formInput,
                        {
                          backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)',
                          borderColor: colors.border,
                          color: colors.textPrimary,
                        },
                      ]}
                      value={editFormData.bestPostingTime || ''}
                      onChangeText={(text) =>
                        setEditFormData((prev) => ({ ...prev, bestPostingTime: text }))
                      }
                    />
                  </View>

                  {/* Save Changes Button */}
                  <TouchableOpacity
                    style={styles.savePostBtn}
                    onPress={handleSavePost}
                    disabled={isSavingPost}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      style={styles.savePostGrad}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {isSavingPost ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Save size={14} color="#FFFFFF" />
                      )}
                      <Text style={styles.savePostBtnText}>
                        {isSavingPost ? 'Saving Post...' : 'Save Post Changes'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                /* POST VIEW MODE */
                <View style={styles.detailViewContainer}>
                  {/* Metadata 2x2 Grid */}
                  <View style={styles.metadataGrid}>
                    <View
                      style={[
                        styles.metadataCard,
                        {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.metadataLabel, { color: colors.textMuted }]}>
                        PLATFORM
                      </Text>
                      <Text style={[styles.metadataVal, { color: colors.textPrimary }]}>
                        {activePost.platform}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.metadataCard,
                        {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.metadataLabel, { color: colors.textMuted }]}>
                        POST TYPE
                      </Text>
                      <Text style={[styles.metadataVal, { color: colors.textPrimary }]}>
                        {activePost.postType || 'Single Image'}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.metadataCard,
                        {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.metadataLabel, { color: colors.textMuted }]}>
                        CONTENT TYPE
                      </Text>
                      <Text style={[styles.metadataVal, { color: colors.textPrimary }]}>
                        {activePost.contentType || 'Social Copy'}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.metadataCard,
                        {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.metadataLabel, { color: colors.textMuted }]}>
                        STAGE
                      </Text>
                      <Text style={[styles.metadataVal, { color: colors.textPrimary }]}>
                        {activePost.campaignStage || 'Awareness'}
                      </Text>
                    </View>
                  </View>

                  {/* AI Visual Asset Preview if image exists */}
                  {(activePost.generatedImage || activePost.imageUrl) && (
                    <View style={styles.imagePreviewWrap}>
                      <Image
                        source={{ uri: activePost.generatedImage || activePost.imageUrl }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                      />
                      <View style={styles.imageTagBadge}>
                        <Text style={styles.imageTagText}>AI Visual</Text>
                      </View>
                    </View>
                  )}

                  {/* Topic / Objective */}
                  <View style={styles.detailSectionBlock}>
                    <Text style={[styles.sectionBlockLabel, { color: colors.textMuted }]}>
                      TOPIC / OBJECTIVE
                    </Text>
                    <Text style={[styles.sectionBlockText, { color: colors.textPrimary }]}>
                      {activePost.postObjective || activePost.postFor || 'Campaign Marketing Post'}
                    </Text>
                  </View>

                  {/* Best Posting Time */}
                  {activePost.bestPostingTime && (
                    <View style={styles.bestTimeRow}>
                      <Clock size={13} color="#10B981" />
                      <Text style={[styles.bestTimeText, { color: colors.textSecondary }]}>
                        Best time: {activePost.bestPostingTime}
                      </Text>
                    </View>
                  )}

                  {/* AI Generated Copy */}
                  {activePost.caption ? (
                    <View
                      style={[
                        styles.copyBox,
                        {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.sectionBlockLabel, { color: colors.textMuted }]}>
                        AI GENERATED COPY
                      </Text>
                      <Text style={[styles.copyText, { color: colors.textPrimary }]}>
                        "{activePost.caption}"
                      </Text>
                    </View>
                  ) : null}

                  {/* Hashtags */}
                  {activePost.hashtags && activePost.hashtags.length > 0 && (
                    <View style={styles.hashtagsRow}>
                      {activePost.hashtags.map((h, i) => (
                        <View
                          key={i}
                          style={[
                            styles.hashtagChip,
                            {
                              backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.06)',
                              borderColor: 'rgba(16,185,129,0.2)',
                            },
                          ]}
                        >
                          <Text style={styles.hashtagChipText}>{h.startsWith('#') ? h : `#${h}`}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Downloaded / In Asset Library Banner */}
                  {activePost.status === 'Approved' || activePost.status === 'Generated' ? (
                    <View style={styles.downloadedBanner}>
                      <CheckCircle2 size={16} color="#10B981" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.downloadedBannerTitle}>Content Downloaded</Text>
                        <Text style={styles.downloadedBannerSub}>
                          Saved in your Asset Library for immediate distribution.
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {/* Action CTA Buttons */}
                  <View style={styles.actionsCtaCol}>
                    {activePost.status === 'Approved' || activePost.status === 'Generated' ? (
                      <TouchableOpacity
                        style={styles.assetLibraryCtaBtn}
                        onPress={handleViewInAssetLibrary}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={['#059669', '#0D9488']}
                          style={styles.primaryGenerateGrad}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          <CheckCircle2 size={15} color="#FFFFFF" />
                          <Text style={styles.primaryGenerateBtnText}>VIEW IN ASSET LIBRARY</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    ) : null}

                    {/* Quick AI Copy Generator */}
                    {!activePost.caption && (
                      <TouchableOpacity
                        style={[styles.outlineBtn, { borderColor: '#10B981' }]}
                        onPress={() => handleGeneratePost(activePost._id || activePost.id || '')}
                        disabled={generatingPostId === (activePost._id || activePost.id)}
                        activeOpacity={0.75}
                      >
                        {generatingPostId === (activePost._id || activePost.id) ? (
                          <ActivityIndicator size="small" color="#10B981" />
                        ) : (
                          <Sparkles size={14} color="#10B981" />
                        )}
                        <Text style={styles.outlineBtnText}>
                          {generatingPostId === (activePost._id || activePost.id)
                            ? 'Synthesizing...'
                            : 'Generate Copy with AI'}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Continue to Studio CTA */}
                    <TouchableOpacity
                      style={styles.studioCtaBtn}
                      onPress={() => handleContinueToStudio(activePost)}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#10B981', '#6366F1']}
                        style={styles.primaryGenerateGrad}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <ArrowRight size={15} color="#FFFFFF" />
                        <Text style={styles.primaryGenerateBtnText}>
                          CONTINUE TO CONTENT STUDIO
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ) : (
            /* EMPTY DAY STATE */
            <View style={styles.emptyDayWrap}>
              <View style={[styles.emptyDayIconCircle, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
                <CalendarIcon size={28} color="#10B981" />
              </View>
              <Text style={[styles.emptyDayTitle, { color: colors.textPrimary }]}>
                No Post Scheduled
              </Text>
              <Text style={[styles.emptyDaySub, { color: colors.textMuted }]}>
                There is no post scheduled for{' '}
                {selectedDate.toLocaleDateString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
                . Select another active date or generate a new campaign plan above.
              </Text>
            </View>
          )}
        </GlassCard>
      </ScrollView>

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: CAMPAIGN PICKER / HISTORY
         ───────────────────────────────────────────────────────────────────────────── */}
      <Modal
        visible={showCampaignPickerModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCampaignPickerModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowCampaignPickerModal(false)}
        >
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.cardBackground, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Select Campaign
              </Text>
              <TouchableOpacity onPress={() => setShowCampaignPickerModal(false)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              {campaigns.map((c) => {
                const cId = c._id || c.id;
                const isSelected = (currentCampaign?._id || currentCampaign?.id) === cId;
                return (
                  <TouchableOpacity
                    key={cId}
                    style={[
                      styles.campaignPickerItem,
                      isSelected && { backgroundColor: 'rgba(16,185,129,0.12)' },
                      { borderColor: colors.border },
                    ]}
                    onPress={() => {
                      handleSelectCampaign(c);
                      setShowCampaignPickerModal(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.campaignPickerName, { color: colors.textPrimary }]}>
                        {c.campaignName}
                      </Text>
                      <Text style={[styles.campaignPickerDates, { color: colors.textMuted }]}>
                        {c.startDate ? c.startDate.split('T')[0] : ''} →{' '}
                        {c.endDate ? c.endDate.split('T')[0] : ''} · {c.postingFrequency}
                      </Text>
                    </View>
                    {isSelected && <Check size={16} color="#10B981" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: FREQUENCY PICKER
         ───────────────────────────────────────────────────────────────────────────── */}
      <Modal
        visible={showFrequencyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFrequencyModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowFrequencyModal(false)}
        >
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.cardBackground, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Posting Frequency
              </Text>
              <TouchableOpacity onPress={() => setShowFrequencyModal(false)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              {FREQUENCY_OPTIONS.map((freq) => {
                const isSelected = campaignConfig.postingFrequency === freq;
                return (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.campaignPickerItem,
                      isSelected && { backgroundColor: 'rgba(16,185,129,0.12)' },
                      { borderColor: colors.border },
                    ]}
                    onPress={() => {
                      setCampaignConfig((prev) => ({ ...prev, postingFrequency: freq }));
                      setShowFrequencyModal(false);
                    }}
                  >
                    <Text style={[styles.campaignPickerName, { color: colors.textPrimary }]}>
                      {freq}
                    </Text>
                    {isSelected && <Check size={16} color="#10B981" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <FloatingAISABrain />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  toastWrap: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 45,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#10B981',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  subHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  subHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  subHeaderBrand: {
    fontSize: 12,
    fontWeight: '700',
  },
  dotSep: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  subHeaderNote: {
    fontSize: 11,
    fontWeight: '500',
  },
  approvalsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  approvalsBtnText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 14,
  },
  campaignInfoCard: {
    padding: 16,
    borderLeftWidth: 4,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  campaignSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: 130,
  },
  campaignSelectorText: {
    fontSize: 11,
    fontWeight: '700',
  },
  newCampaignPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16,185,129,0.12)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
  },
  newCampaignPillText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  durationSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  durationLabel: {
    fontSize: 11,
    fontWeight: '800',
    paddingLeft: 6,
    letterSpacing: 0.6,
  },
  durationBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBtnActive: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  durationBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  formFieldsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  formFieldCol: {
    flex: 1,
    gap: 4,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  formInput: {
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: '600',
  },
  formTextarea: {
    height: 70,
    paddingTop: 8,
    textAlignVertical: 'top',
  },
  formSelectBtn: {
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formSelectText: {
    fontSize: 12,
    fontWeight: '600',
  },
  datesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateCol: {
    flex: 1,
    gap: 4,
  },
  strategyLinkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
  },
  strategyLinkedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  strategyLinkedTitle: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  strategyLinkedMeta: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  noStrategyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
  },
  noStrategyTitle: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
  },
  noStrategyBtn: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '800',
  },
  scheduleSpanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(16,185,129,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.1)',
  },
  scheduleSpanLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    textTransform: 'uppercase',
  },
  scheduleSpanVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
  },
  primaryGenerateBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 2,
  },
  primaryGenerateGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  primaryGenerateBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  progressCard: {
    padding: 16,
    borderLeftWidth: 4,
    gap: 12,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  progressCardSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  progressPercentPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
  progressPercentText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricStatBox: {
    flex: 1,
    minWidth: '45%',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  metricStatTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricIconWrap: {
    padding: 3,
  },
  metricStatLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricStatVal: {
    fontSize: 16,
    fontWeight: '900',
  },
  calendarWidgetCard: {
    padding: 16,
    gap: 12,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  monthHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  monthNavBtnsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  monthNavBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekdayCol: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '800',
  },
  calendarCellsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cellCol: {
    width: '14.28%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cellDayText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cellDayTextFaded: {
    fontSize: 11,
    fontWeight: '400',
  },
  downloadedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  postScheduledDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  legendChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dayDetailCard: {
    padding: 16,
    gap: 12,
  },
  detailContainer: {
    gap: 12,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  detailDateTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  detailSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  detailDayNumber: {
    fontSize: 11,
    fontWeight: '700',
  },
  editToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editFormContainer: {
    gap: 10,
  },
  editFormField: {
    gap: 4,
  },
  editFormLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  editPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  editPlatformPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  editPlatformPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  numPill: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numPillActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  savePostBtn: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 4,
  },
  savePostGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  savePostBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  detailViewContainer: {
    gap: 12,
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metadataCard: {
    flex: 1,
    minWidth: '45%',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 2,
  },
  metadataLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metadataVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  imagePreviewWrap: {
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageTagBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  imageTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  detailSectionBlock: {
    gap: 3,
  },
  sectionBlockLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  sectionBlockText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  bestTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bestTimeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  copyBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  copyText: {
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  hashtagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hashtagChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  hashtagChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  downloadedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
  },
  downloadedBannerTitle: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  downloadedBannerSub: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '500',
  },
  actionsCtaCol: {
    gap: 8,
    marginTop: 4,
  },
  assetLibraryCtaBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  outlineBtnText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  studioCtaBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyDayWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 16,
    gap: 8,
  },
  emptyDayIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyDayTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  emptyDaySub: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 280,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  campaignPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderBottomWidth: 1,
  },
  campaignPickerName: {
    fontSize: 12,
    fontWeight: '700',
  },
  campaignPickerDates: {
    fontSize: 11,
    marginTop: 2,
  },
});
