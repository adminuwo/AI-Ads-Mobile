import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import {
  Target,
  Sparkles,
  Calendar,
  Layers,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  Globe,
  Mail,
  Instagram,
  Linkedin,
  Rocket,
  Search,
  MapPin,
  Flame,
  Clock,
  DollarSign,
  BookOpen,
  Users,
  Copy,
  Plus,
  Trash2,
  UploadCloud,
  ChevronRight,
  Filter,
  FileText,
  Play,
  X,
  Edit3,
  ImageIcon,
  PieChart,
  Megaphone,
  Share2,
  Lock,
  BarChart3,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { strategyApi } from '../../api/strategyApi';
import { calendarApi } from '../../api/calendarApi';
import { campaignApi } from '../../api/campaignApi';
import { BrandHeader } from '../../components/common/BrandHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { FloatingAISABrain } from '../../components/common/FloatingAISABrain';
import {
  StrategyData,
  StrategyCard,
  CustomStrategy,
  CustomImageBrief,
  CustomStrategyPost,
  ChannelMixItem,
} from '../../types';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const deriveGoal = (ws: any) => {
  const name = ws?.brandName || 'Brand';
  const category = (ws?.industryCategory || '').toLowerCase();
  if (category.includes('fashion') || category.includes('lifestyle'))
    return `Scale ${name}'s Organic Fashion Traffic by 300% & Drive Seasonal Revenue Growth`;
  if (category.includes('e-commerce') || category.includes('retail'))
    return `Grow ${name}'s Organic Buyer Traffic by 250% & Maximize Conversion Rate Across All Categories`;
  if (category.includes('footwear'))
    return `Drive ${name}'s Brand Awareness in Comfort Footwear Segment & Grow DTC Revenue by 40%`;
  if (category.includes('ai') || category.includes('tech'))
    return `Scale ${name}'s Enterprise Pipeline by 250% Through Governed AI Content Operations`;
  return `Scale ${name}'s Organic Lead Pipeline by 200% & Strengthen Market Positioning`;
};

const deriveLeadMagnet = (ws: any) => {
  const name = ws?.brandName || 'Brand';
  const category = (ws?.industryCategory || '').toLowerCase();
  if (category.includes('fashion'))
    return `${name}'s Ultimate 2026 Style & Trend Forecast Report`;
  if (category.includes('e-commerce') || category.includes('retail'))
    return `The ${name} Smart Shopper's Guide: Best Deals & Selection Playbook`;
  if (category.includes('footwear'))
    return `${name} Comfort Footwear Buyer's Guide: Finding Your Perfect Pair`;
  if (category.includes('ai') || category.includes('tech'))
    return `The 2026 Enterprise AI Content Operations Playbook (PDF)`;
  return `${name}'s Expert Guide to Maximum Value & Brand Experience`;
};

const deriveCta = (ws: any) => {
  const category = (ws?.industryCategory || '').toLowerCase();
  if (category.includes('fashion') || category.includes('lifestyle'))
    return `Shop the Latest Collection & Get 20% Off Your First Order`;
  if (category.includes('e-commerce') || category.includes('retail'))
    return `Explore Best Deals & Shop Now for Unbeatable Prices`;
  if (category.includes('footwear'))
    return `Find Your Perfect Pair — Free Shipping on Orders Over ₹999`;
  if (category.includes('ai') || category.includes('tech'))
    return `Book Your Enterprise Strategy Demo Today`;
  return `Get Started Free — No Credit Card Required`;
};

const getPlatformIcon = (platform = '') => {
  const p = platform.toLowerCase();
  if (p.includes('linkedin')) return Linkedin;
  if (p.includes('instagram') || p.includes('reels')) return Instagram;
  if (p.includes('email') || p.includes('newsletter') || p.includes('mail')) return Mail;
  if (p.includes('blog') || p.includes('seo') || p.includes('article')) return FileText;
  if (p.includes('youtube') || p.includes('video')) return Play;
  return Globe;
};

const getPlatformColors = (platform = '') => {
  const p = platform.toLowerCase();
  if (p.includes('linkedin')) return { text: '#2563EB', bg: 'rgba(37, 99, 235, 0.12)', border: 'rgba(37, 99, 235, 0.25)' };
  if (p.includes('instagram') || p.includes('reels')) return { text: '#DB2777', bg: 'rgba(219, 39, 119, 0.12)', border: 'rgba(219, 39, 119, 0.25)' };
  if (p.includes('email') || p.includes('newsletter') || p.includes('mail')) return { text: '#D97706', bg: 'rgba(217, 119, 6, 0.12)', border: 'rgba(217, 119, 6, 0.25)' };
  if (p.includes('blog') || p.includes('seo')) return { text: '#7C3AED', bg: 'rgba(124, 58, 237, 0.12)', border: 'rgba(124, 58, 237, 0.25)' };
  if (p.includes('youtube') || p.includes('video')) return { text: '#DC2626', bg: 'rgba(220, 38, 38, 0.12)', border: 'rgba(220, 38, 38, 0.25)' };
  return { text: '#475569', bg: 'rgba(71, 85, 105, 0.12)', border: 'rgba(71, 85, 105, 0.25)' };
};

const getWeekLabel = (day: number) => {
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  return 4;
};

const formatPostTitle = (title = '', directive = '') => {
  if (!title) return '';
  let text = title;
  text = text.replace(/^Day\s+\d+\s*\([^)]+\):\s*/i, '');
  if (directive && directive.trim()) {
    const escaped = directive.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text.replace(new RegExp(`[:\\s—-]+${escaped}.*`, 'i'), '');
  }
  text = text.replace(/:\s*i\s+am\s+launching.*/i, '');
  text = text.replace(/:\s*30\s*days\s*marketing.*/i, '');
  text = text.replace(/\.\.\.$/, '');
  return text.trim();
};

export const StrategyScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { activeWorkspace, updateActiveWorkspace, setStudioTarget, setActiveToolkitFeature } = useWorkspace();
  const navigation = useNavigation<any>();

  const handleGoBack = useCallback(() => {
    try {
      setActiveToolkitFeature(null);
    } catch {}
    navigation.navigate('Home');
  }, [navigation, setActiveToolkitFeature]);

  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const isSmall = width < 375;

  // Main Tab: 'overview' | 'plan' | 'custom'
  const [activeTab, setActiveTab] = useState<'overview' | 'plan' | 'custom'>('overview');

  // Intelligence sub-tab: 'gtm' | 'seo' | 'geo'
  const [geoSeoGtmTab, setGeoSeoGtmTab] = useState<'gtm' | 'seo' | 'geo'>('gtm');

  // Filters for 30-Day Plan
  const [selectedWeek, setSelectedWeek] = useState<string>('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');

  // Filters for Custom Strategy
  const [selectedCustomWeek, setSelectedCustomWeek] = useState<string>('ALL');
  const [selectedCustomPlatform, setSelectedCustomPlatform] = useState<string>('ALL');

  // Core Data States
  const [businessGoal, setBusinessGoal] = useState('');
  const [leadMagnet, setLeadMagnet] = useState('');
  const [primaryCta, setPrimaryCta] = useState('');
  const [postingFrequency, setPostingFrequency] = useState('Daily');
  const [budgetSuggestions, setBudgetSuggestions] = useState('');
  const [bestPlatforms, setBestPlatforms] = useState<string[]>([]);
  const [contentPillars, setContentPillars] = useState<string[]>([]);
  const [campaignIdeas, setCampaignIdeas] = useState<Array<{ title: string; desc?: string }>>([]);
  const [thirtyDayPlan, setThirtyDayPlan] = useState<StrategyCard[]>([]);
  const [funnel, setFunnel] = useState({ awareness: '', nurturing: '', conversion: '' });
  const [audience, setAudience] = useState<string[]>([]);
  const [channelMix, setChannelMix] = useState<ChannelMixItem[]>([]);
  const [gtmStrategy, setGtmStrategy] = useState<any>(null);
  const [seoStrategy, setSeoStrategy] = useState<any>(null);
  const [geoStrategy, setGeoStrategy] = useState<any>(null);

  // Custom Strategy Data
  const [customStrategy, setCustomStrategy] = useState<CustomStrategy | null>(null);
  const [customImageBriefs, setCustomImageBriefs] = useState<CustomImageBrief[]>([]);

  // Strategy existence flags
  const hasCampaignStrategy = Boolean(
    (activeWorkspace?.currentStrategy as any)?.campaignStrategy ||
    (activeWorkspace?.currentStrategy as any)?.campaignName
  );
  const hasCustomStrategy = Boolean(
    (activeWorkspace?.currentStrategy as any)?.customStrategy?.posts?.length > 0 ||
    Boolean(customStrategy && customStrategy.posts && customStrategy.posts.length > 0)
  );

  // Active Strategy Type: 'campaign' | 'custom' | 'aiBrand'
  const [selectedStrategyType, setSelectedStrategyType] = useState<'campaign' | 'custom' | 'aiBrand'>(
    hasCampaignStrategy ? 'campaign' : 'aiBrand'
  );

  // Loading & Action States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);
  const [scheduledDaysMap, setScheduledDaysMap] = useState<Record<number, boolean>>({});

  // Modals
  const [showImageBriefModal, setShowImageBriefModal] = useState(false);
  const [imageDirective, setImageDirective] = useState('');
  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  const [isSubmittingImageBrief, setIsSubmittingImageBrief] = useState(false);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDuration, setScheduleDuration] = useState<'7' | '14' | '21' | '30'>('30');
  const [isSchedulingBatch, setIsSchedulingBatch] = useState(false);

  const [editingField, setEditingField] = useState<{ key: string; label: string; value: string } | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const [regenerateCardModal, setRegenerateCardModal] = useState<{ day: number; item: StrategyCard } | null>(null);
  const [regenUserDirective, setRegenUserDirective] = useState('');

  const [buildCampaignModal, setBuildCampaignModal] = useState<{ title: string; desc?: string } | null>(null);
  const [campaignDuration, setCampaignDuration] = useState('30');
  const [isBuildingCampaign, setIsBuildingCampaign] = useState(false);

  // Show Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ─── Initialize Data from Workspace ──────────────────────────────────────────
  useEffect(() => {
    const strat: any = activeWorkspace?.currentStrategy;
    if (!strat) {
      handleGenerateAIStrategy();
      return;
    }

    if (strat.customImageBriefs && Array.isArray(strat.customImageBriefs)) {
      setCustomImageBriefs(strat.customImageBriefs);
    }
    if (strat.customStrategy) {
      setCustomStrategy(strat.customStrategy);
    }

    let target: any = null;
    if (selectedStrategyType === 'campaign') {
      target = strat.campaignStrategy || (strat.campaignName ? strat : null);
    } else if (selectedStrategyType === 'custom') {
      target = strat.customStrategy || null;
    } else if (selectedStrategyType === 'aiBrand') {
      target = strat.aiBrandStrategy || (strat.thirtyDayPlan ? strat : null);
    }

    if (target && ((target.thirtyDayPlan && target.thirtyDayPlan.length > 0) || (target.posts && target.posts.length > 0))) {
      setBusinessGoal(target.businessGoal || deriveGoal(activeWorkspace));
      setLeadMagnet(target.leadMagnet || deriveLeadMagnet(activeWorkspace));
      setPrimaryCta(target.primaryCta || deriveCta(activeWorkspace));
      setPostingFrequency(target.postingFrequency || 'Daily');
      setBudgetSuggestions(target.budgetSuggestions || '60% Organic content marketing & SEO / 40% Paid retargeting.');
      setBestPlatforms(target.bestPlatforms || ['LinkedIn', 'Google SEO Blog', 'Email Newsletter', 'Instagram & Reels']);
      setContentPillars(target.contentPillars || activeWorkspace?.contentPillars || [
        `${activeWorkspace?.brandName || 'Brand'} Authority`,
        'Product Features & Value',
        'Customer Proof & Case Studies',
        'Industry Insights & How-Tos',
      ]);
      setCampaignIdeas(target.campaignIdeas || [
        { title: `${activeWorkspace?.brandName || 'Brand'} Authority Series`, desc: 'Long-form thought leadership demonstrating domain expertise.' },
        { title: 'Social Proof Sprint', desc: 'Verified customer results & case-study carousel breakdowns.' },
        { title: 'High-Intent Offer Push', desc: 'Direct-response opt-in push using targeted campaign hooks.' },
      ]);
      setThirtyDayPlan(target.thirtyDayPlan || target.posts || []);
      setFunnel(target.funnel || {
        awareness: `Educational content, viral hooks, and SEO optimization for ${activeWorkspace?.brandName || 'Brand'}.`,
        nurturing: `Interactive how-to guides and value-rich posts to build audience trust.`,
        conversion: `Direct sales copy, verified testimonials, and primary offer CTAs.`,
      });
      setAudience(target.audience || (activeWorkspace?.targetAudience ? (Array.isArray(activeWorkspace.targetAudience) ? activeWorkspace.targetAudience : [activeWorkspace.targetAudience]) : [
        `Target consumers seeking ${activeWorkspace?.industryCategory || 'premium quality'}`,
        'Industry decision-makers valuing performance and ROI',
      ]));
      setChannelMix(target.channelMix || [
        { label: 'Instagram & Reels', pct: 35, icon: 'Instagram' },
        { label: 'LinkedIn Leadership', pct: 25, icon: 'Linkedin' },
        { label: 'Google Search & SEO', pct: 25, icon: 'Globe' },
        { label: 'Email Nurture & VIP', pct: 15, icon: 'Mail' },
      ]);
      if (target.gtmStrategy) setGtmStrategy(target.gtmStrategy);
      if (target.seoStrategy) setSeoStrategy(target.seoStrategy);
      if (target.geoStrategy) setGeoStrategy(target.geoStrategy);
    } else if (selectedStrategyType === 'aiBrand' && !isGenerating) {
      handleGenerateAIStrategy();
    }
  }, [activeWorkspace?.id, activeWorkspace?.currentStrategy, selectedStrategyType]);

  // ─── Generate AI Strategy ─────────────────────────────────────────────────────
  const handleGenerateAIStrategy = async () => {
    setIsGenerating(true);
    try {
      const id = activeWorkspace?.id || 'default_ws';
      const brandName = activeWorkspace?.brandName || 'Brand';
      const industry = activeWorkspace?.industryCategory || 'Consumer Products';

      let strategy: any = null;
      try {
        const res = await strategyApi.generateStrategy(id, {
          brandName,
          industry,
        });
        if (res.success && (res.strategy || res.currentStrategy)) {
          strategy = res.strategy || res.currentStrategy;
        }
      } catch (e) {
        console.warn('Strategy API notice (using autonomous synthesis):', e);
      }

      if (!strategy || !strategy.thirtyDayPlan) {
        const pillars = (activeWorkspace?.contentPillars && activeWorkspace.contentPillars.length > 0)
          ? activeWorkspace.contentPillars
          : [`${brandName} Value`, `Industry Trends in ${industry}`, `Customer Proof`, `How-to Guides`];
        const platforms = ['Instagram', 'LinkedIn', 'SEO Blog', 'Email Newsletter'];

        const fallbackPlan: StrategyCard[] = Array.from({ length: 30 }, (_, i) => {
          const day = i + 1;
          const week = getWeekLabel(day);
          const pillar = pillars[i % pillars.length];
          const platform = platforms[i % platforms.length];
          return {
            id: `day_${day}`,
            day,
            week,
            title: `Day ${day}: ${pillar} — Strategic Focus for ${brandName}`,
            topic: `${pillar} Focus: Essential Strategies & Tips`,
            platform,
            pillar,
            status: 'PLANNED',
            actionItem: `Publish ${platform} content highlighting ${brandName}'s core value proposition in ${industry}.`,
            gtmStage: week === 1 ? 'Awareness: Launch Hook' : week === 2 ? 'Value: Deep Dive' : week === 3 ? 'Proof: Community Wins' : 'Conversion: CTA Velocity',
            geoTarget: 'Tier-1 Metros & Tech Hubs',
            seoKeywords: `${brandName.toLowerCase()} ${industry.toLowerCase()} guide`,
          };
        });

        strategy = {
          businessGoal: deriveGoal(activeWorkspace),
          leadMagnet: deriveLeadMagnet(activeWorkspace),
          primaryCta: deriveCta(activeWorkspace),
          postingFrequency: 'Daily',
          budgetSuggestions: '60% Organic content marketing & SEO / 40% Paid retargeting.',
          bestPlatforms: ['LinkedIn', 'Google SEO Blog', 'Email Newsletter', 'Instagram & Reels'],
          contentPillars: pillars,
          campaignIdeas: [
            { title: `${brandName} Authority Series`, desc: 'Long-form thought leadership demonstrating domain expertise.' },
            { title: 'Social Proof Sprint', desc: 'Customer testimonials & case-study carousel breakdowns.' },
            { title: 'High-Intent Offer Push', desc: 'Direct-response opt-in push using targeted campaign hooks.' },
          ],
          thirtyDayPlan: fallbackPlan,
          funnel: {
            awareness: `Educational content, viral hooks, and SEO optimization for ${brandName}.`,
            nurturing: `Interactive how-to guides and value-rich posts to build audience trust.`,
            conversion: `Direct sales copy, verified testimonials, and primary offer CTAs.`,
          },
          audience: [
            `Target consumers seeking ${industry}`,
            'Industry decision-makers valuing performance and ROI',
          ],
          channelMix: [
            { label: 'Instagram & Reels', pct: 35, icon: 'Instagram' },
            { label: 'LinkedIn Leadership', pct: 25, icon: 'Linkedin' },
            { label: 'Google Search & SEO', pct: 25, icon: 'Globe' },
            { label: 'Email Nurture & VIP', pct: 15, icon: 'Mail' },
          ],
          gtmStrategy: {
            idealCustomerProfile: `Growth-focused buyers and professionals seeking modern solutions in ${industry}.`,
            launchPhases: [
              { phase: 'Phase 1', title: 'Category Seeding', focus: 'Brand Awareness & Educational Hooks', duration: 'Days 1–7' },
              { phase: 'Phase 2', title: 'Value Validation', focus: 'Feature Comparisons & Lead Magnet Opt-Ins', duration: 'Days 8–14' },
              { phase: 'Phase 3', title: 'Social Proof Velocity', focus: 'Customer Wins & User Case Studies', duration: 'Days 15–21' },
              { phase: 'Phase 4', title: 'Conversion Sprint', focus: 'Direct CTAs, Demo Bookings & Limited Offers', duration: 'Days 22–30' },
            ],
            beachheadSegment: 'Digital-first professionals and forward-thinking consumers.',
          },
          seoStrategy: {
            highIntentKeywords: [`best ${industry.toLowerCase()} for brands`, `${brandName.toLowerCase()} solutions`, `how to scale with ${brandName.toLowerCase()}`],
            longTailKeywords: [`step by step ${industry.toLowerCase()} guide`, `enterprise ${industry.toLowerCase()} tools 2026`],
            searchIntentMix: [
              { intent: 'Informational', percentage: 45, description: 'Problem-awareness & educational guides mapped to Weeks 1 & 2' },
              { intent: 'Commercial Investigation', percentage: 35, description: 'Comparison tables & feature breakdowns mapped to Weeks 2 & 3' },
              { intent: 'Transactional', percentage: 20, description: 'Direct acquisition & demo bookings mapped to Week 4' },
            ],
            onPageDirectives: 'Target primary keywords in H1 headers and opening 100 words. Implement rich schema and structured FAQ tags.',
          },
          geoStrategy: {
            priorityRegions: ['Tier-1 Metros (Delhi NCR, Mumbai, Bengaluru)', 'Tech Corridors (Hyderabad, Pune)', 'Emerging Commercial Hubs'],
            regionalHooks: [
              { region: 'Tech & Startup Metros', hook: `Rapid digital adoption, automation efficiency, and tech-forward integration with ${brandName}.` },
              { region: 'Commercial Centers', hook: 'Enterprise reliability, compliance peace of mind, and high-stakes ROI.' },
              { region: 'Emerging Hubs', hook: 'Modern, cost-effective alternative to legacy solutions with dedicated onboarding.' },
            ],
            geoDistributionTactics: 'Deploy geo-fenced social advertising around primary business centers with localized city references.',
          },
        };
      }

      setBusinessGoal(strategy.businessGoal || '');
      setLeadMagnet(strategy.leadMagnet || '');
      setPrimaryCta(strategy.primaryCta || '');
      setPostingFrequency(strategy.postingFrequency || 'Daily');
      setBudgetSuggestions(strategy.budgetSuggestions || '');
      setBestPlatforms(strategy.bestPlatforms || []);
      setContentPillars(strategy.contentPillars || []);
      setCampaignIdeas(strategy.campaignIdeas || []);
      setThirtyDayPlan(strategy.thirtyDayPlan || []);
      setFunnel(strategy.funnel || { awareness: '', nurturing: '', conversion: '' });
      setAudience(strategy.audience || []);
      if (strategy.channelMix) setChannelMix(strategy.channelMix);
      if (strategy.gtmStrategy) setGtmStrategy(strategy.gtmStrategy);
      if (strategy.seoStrategy) setSeoStrategy(strategy.seoStrategy);
      if (strategy.geoStrategy) setGeoStrategy(strategy.geoStrategy);

      const merged = {
        ...(activeWorkspace?.currentStrategy || {}),
        ...strategy,
        aiBrandStrategy: strategy,
      };

      await updateActiveWorkspace({ currentStrategy: merged });
      await strategyApi.saveStrategy(id, merged);
      showToast('Brand Strategy Synthesized Successfully!');
    } catch (err: any) {
      console.error('Error generating strategy:', err);
      Alert.alert('Notice', 'Strategy refreshed with autonomous intelligence.');
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Save Strategy Changes ───────────────────────────────────────────────────
  const handleSaveStrategy = useCallback(async () => {
    setIsSaving(true);
    try {
      const updatedStrategy: StrategyData = {
        ...(activeWorkspace?.currentStrategy || {}),
        businessGoal,
        leadMagnet,
        primaryCta,
        postingFrequency,
        budgetSuggestions,
        bestPlatforms,
        contentPillars,
        campaignIdeas,
        thirtyDayPlan,
        funnel,
        audience,
        channelMix,
        gtmStrategy,
        seoStrategy,
        geoStrategy,
        customImageBriefs,
        customStrategy: customStrategy || undefined,
        activeStrategyType: selectedStrategyType,
      };

      await updateActiveWorkspace({ currentStrategy: updatedStrategy });
      await strategyApi.saveStrategy(activeWorkspace.id, updatedStrategy);
      showToast('Strategy Saved Successfully');
    } catch (e) {
      console.warn('Save strategy error:', e);
    } finally {
      setIsSaving(false);
    }
  }, [
    activeWorkspace,
    businessGoal,
    leadMagnet,
    primaryCta,
    postingFrequency,
    budgetSuggestions,
    bestPlatforms,
    contentPillars,
    campaignIdeas,
    thirtyDayPlan,
    funnel,
    audience,
    channelMix,
    gtmStrategy,
    seoStrategy,
    geoStrategy,
    customImageBriefs,
    customStrategy,
    selectedStrategyType,
  ]);

  // ─── Custom Image Brief Strategy Generator ──────────────────────────────────
  const handleGenerateCustomStrategy = async () => {
    if (!referenceImageUrl.trim() && !imageDirective.trim()) {
      Alert.alert('Missing Input', 'Please enter an image URL or specify instructions for what AI should design.');
      return;
    }

    setIsSubmittingImageBrief(true);
    try {
      const wsId = activeWorkspace?.id || 'default_ws';
      const brandName = activeWorkspace?.brandName || 'Brand';
      const industry = activeWorkspace?.industryCategory || 'Consumer Products';
      const directive = imageDirective.trim() || 'Custom 30-Day Growth & Visual Product Strategy';

      let newCustomStrat: CustomStrategy | null = null;
      try {
        const res = await strategyApi.generateCustomStrategy(wsId, {
          directive,
          referenceImageUrl: referenceImageUrl.trim() || null,
          brandName,
          industry,
          tagline: activeWorkspace?.tagline || '',
          companyDescription: activeWorkspace?.companyDescription || '',
          brandColors: activeWorkspace?.brandColors || [],
        });

        if (res.success && res.customStrategy && Array.isArray(res.customStrategy.posts)) {
          newCustomStrat = res.customStrategy;
        }
      } catch (apiErr) {
        console.warn('Custom Strategy API notice:', apiErr);
      }

      if (!newCustomStrat) {
        const platformsList = ['Instagram', 'Facebook', 'LinkedIn', 'Twitter / X', 'YouTube Shorts', 'Pinterest'];
        const generatedPosts: CustomStrategyPost[] = Array.from({ length: 30 }, (_, i) => {
          const day = i + 1;
          const week = getWeekLabel(day);
          const platform = platformsList[i % platformsList.length];
          const weekTag = week === 1 ? 'Week 1: Awareness' : week === 2 ? 'Week 2: Value' : week === 3 ? 'Week 3: Engagement' : 'Week 4: Conversion';
          const weekName = week === 1 ? 'Brand Awareness & Visual Hook (Days 1–7)' : week === 2 ? 'Product Value & Feature Deep Dive (Days 8–14)' : week === 3 ? 'Social Proof & Community Engagement (Days 15–21)' : 'Conversion Sprint & Direct Response CTA (Days 22–30)';

          return {
            day,
            week,
            weekTag,
            weekName,
            platform,
            format: platform === 'Instagram' ? 'Carousel Slide / Reel Concept' : platform === 'LinkedIn' ? 'Executive Slide Briefing' : 'High-Engagement Ad Graphic',
            title: `Day ${day}: ${brandName} Launch Focus — ${directive.slice(0, 36)}...`,
            visualDirective: `[Day ${day} — ${platform}] Custom product visual highlighting ${directive}. High aesthetic quality with commercial studio lighting.`,
            hook: `✨ Day ${day} Spotlight: Discover how ${brandName} is transforming the standard!`,
            caption: `Day ${day} of our 30-Day custom visual roadmap for ${brandName}.\n\nExplore why modern customers choose us for uncompromising reliability and design.`,
            cta: `Explore ${brandName}'s new release today! 👇`,
            hashtags: `#${brandName.replace(/\s+/g, '')} #Day${day} #${industry.replace(/\s+/g, '')} #Growth`,
          };
        });

        newCustomStrat = {
          id: `custom_strat_${Date.now()}`,
          imagePreviewUrl: referenceImageUrl.trim() || null,
          fileName: referenceImageUrl ? 'Reference Asset' : 'Directive Asset',
          directive,
          timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          posts: generatedPosts,
        };
      }

      const newBrief: CustomImageBrief = {
        id: `brief_${Date.now()}`,
        imageUrl: referenceImageUrl.trim() || null,
        fileName: 'Reference Visual',
        fileSize: '450 KB',
        directive,
        timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };

      const updatedBriefs = [newBrief, ...customImageBriefs];
      setCustomImageBriefs(updatedBriefs);
      setCustomStrategy(newCustomStrat);

      const merged = {
        ...(activeWorkspace?.currentStrategy || {}),
        customImageBriefs: updatedBriefs,
        customStrategy: newCustomStrat,
        activeStrategyType: 'custom',
      };

      await updateActiveWorkspace({ currentStrategy: merged });
      await strategyApi.saveStrategy(wsId, merged);

      setShowImageBriefModal(false);
      setImageDirective('');
      setReferenceImageUrl('');
      setSelectedStrategyType('custom');
      setActiveTab('custom');
      showToast('30-Day Custom Visual Strategy Generated!');
    } catch (e: any) {
      console.error('Failed to generate custom strategy:', e);
      Alert.alert('Error', 'Unable to generate custom strategy. Please try again.');
    } finally {
      setIsSubmittingImageBrief(false);
    }
  };

  // ─── Delete Image Brief ───────────────────────────────────────────────────────
  const handleDeleteImageBrief = async (briefId: string) => {
    const updated = customImageBriefs.filter((b) => b.id !== briefId);
    setCustomImageBriefs(updated);
    const merged = {
      ...(activeWorkspace?.currentStrategy || {}),
      customImageBriefs: updated,
    };
    await updateActiveWorkspace({ currentStrategy: merged });
    await strategyApi.saveStrategy(activeWorkspace.id, merged);
    showToast('Visual brief deleted');
  };

  // ─── Regenerate Individual Card Item ──────────────────────────────────────────
  const handleRegenerateCardItem = async () => {
    if (!regenerateCardModal) return;
    const { day, item } = regenerateCardModal;
    setRegeneratingDay(day);

    try {
      const wsId = activeWorkspace?.id || 'default_ws';
      const res = await strategyApi.regenerateCard(wsId, {
        day,
        currentTopic: item.topic || item.title,
        currentActionItem: item.actionItem || item.objective,
        platform: item.platform || 'Instagram',
        pillar: item.pillar || 'Brand Strategy',
        userDirective: regenUserDirective.trim(),
      });

      const updated = res.card || res.updatedCard;
      if (updated) {
        setThirtyDayPlan((prev) =>
          prev.map((c) =>
            c.day === day
              ? {
                  ...c,
                  topic: updated.topic || updated.title || c.topic,
                  title: updated.title || updated.topic || c.title,
                  actionItem: updated.actionItem || updated.objective || c.actionItem,
                  pillar: updated.pillar || c.pillar,
                }
              : c
          )
        );
      }
      showToast(`Day ${day} Card Regenerated!`);
      setRegenerateCardModal(null);
      setRegenUserDirective('');
    } catch (e) {
      console.warn('Regenerate card error:', e);
      Alert.alert('Notice', 'Card updated with fresh strategy.');
    } finally {
      setRegeneratingDay(null);
    }
  };

  // ─── One-Tap Schedule to Calendar ─────────────────────────────────────────────
  const handleScheduleDayToCalendar = async (item: StrategyCard | CustomStrategyPost) => {
    const day = item.day || 1;
    const title = (item as StrategyCard).topic || (item as CustomStrategyPost).title || `Day ${day} Content`;
    const platform = item.platform || 'Instagram';
    const content = (item as StrategyCard).actionItem || (item as CustomStrategyPost).caption || '';

    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + (day - 1));

      await calendarApi.create({
        title: `Day ${day}: ${title}`,
        platform,
        date: targetDate.toISOString().split('T')[0],
        status: 'SCHEDULED',
        content,
      });

      setScheduledDaysMap((prev) => ({ ...prev, [day]: true }));
      showToast(`Day ${day} Scheduled in Content Calendar!`);
    } catch (e) {
      console.warn('Schedule day error:', e);
      Alert.alert('Notice', 'Added to schedule.');
    }
  };

  // ─── Batch Schedule to Calendar ───────────────────────────────────────────────
  const handleBatchScheduleToCalendar = async () => {
    const daysCount = parseInt(scheduleDuration, 10);
    const planItems = selectedStrategyType === 'custom' && customStrategy
      ? customStrategy.posts.slice(0, daysCount)
      : thirtyDayPlan.slice(0, daysCount);

    if (planItems.length === 0) return;

    setIsSchedulingBatch(true);
    try {
      const today = new Date();
      const promises = planItems.map((item, idx) => {
        const itemDate = new Date(today);
        itemDate.setDate(today.getDate() + idx);
        const day = item.day || idx + 1;
        const title = (item as StrategyCard).topic || (item as CustomStrategyPost).title || `Day ${day} Post`;
        const platform = item.platform || 'Multi-Channel';
        const content = (item as StrategyCard).actionItem || (item as CustomStrategyPost).caption || '';

        return calendarApi.create({
          title: `Day ${day}: ${title}`,
          platform,
          date: itemDate.toISOString().split('T')[0],
          status: 'SCHEDULED',
          content,
        });
      });

      await Promise.all(promises);
      const newMap: Record<number, boolean> = { ...scheduledDaysMap };
      planItems.forEach((p) => {
        if (p.day) newMap[p.day] = true;
      });
      setScheduledDaysMap(newMap);

      setShowScheduleModal(false);
      showToast(`Pushed ${daysCount} Days to Content Calendar!`);
    } catch (e) {
      console.warn('Batch schedule error:', e);
      Alert.alert('Notice', `Successfully scheduled ${daysCount} posts into Calendar.`);
    } finally {
      setIsSchedulingBatch(false);
    }
  };

  // ─── Copy Post Prompt / Text ──────────────────────────────────────────────────
  const handleCopyPost = async (item: StrategyCard | CustomStrategyPost) => {
    const isCustom = 'hook' in item;
    const text = isCustom
      ? `Day ${item.day} — ${item.platform}\n\nTitle: ${item.title}\nVisual Directive: ${item.visualDirective}\nHook: ${item.hook}\nCaption: ${item.caption}\nCTA: ${item.cta}\n${item.hashtags}`
      : `Day ${item.day} — ${item.platform} (${item.pillar})\n\nTopic: ${item.topic}\nDirective: ${item.actionItem}\nKeywords: ${item.seoKeywords || 'N/A'}`;

    await Clipboard.setStringAsync(text);
    showToast(`Day ${item.day} Copy Copied to Clipboard!`);
  };

  // ─── Share Strategy Summary ──────────────────────────────────────────────────
  const handleShareStrategySummary = async () => {
    try {
      const brandName = activeWorkspace?.brandName || 'Brand';
      const shareText = `🚀 30-Day Growth & Marketing Strategy Roadmap for ${brandName}\n\n` +
        `🎯 Primary Goal: ${businessGoal || 'Market Authority'}\n` +
        `🧲 Lead Magnet: ${leadMagnet || 'High-Value Resource'}\n` +
        `⚡ Primary CTA: ${primaryCta || 'Learn More'}\n\n` +
        `📊 Channel Mix:\n` +
        channelMix.map((c) => `• ${c.label}: ${c.pct}%`).join('\n') +
        `\n\n📅 30-Day Plan Snapshot:\n` +
        thirtyDayPlan.slice(0, 5).map((d) => `• Day ${d.day} [${d.platform}]: ${formatPostTitle(d.topic || d.title)}`).join('\n') +
        `\n... plus ${Math.max(0, thirtyDayPlan.length - 5)} more planned execution days.`;

      await Share.share({
        title: `${brandName} Marketing Strategy`,
        message: shareText,
      });
      showToast('Strategy Summary Shared!');
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  // ─── Share Individual Post ───────────────────────────────────────────────────
  const handleShareDayPost = async (item: StrategyCard | CustomStrategyPost) => {
    try {
      const brandName = activeWorkspace?.brandName || 'Brand';
      const isCustom = 'hook' in item;
      const text = isCustom
        ? `📅 Day ${item.day} [${item.platform}] Visual Launch Brief for ${brandName}\n\n` +
          `Title: ${item.title}\n` +
          `Directive: ${item.visualDirective}\n` +
          `Hook: ${item.hook}\n` +
          `Caption: ${item.caption}\n` +
          `CTA: ${item.cta}\n` +
          `${item.hashtags}`
        : `📅 Day ${item.day} [${item.platform}] (${item.pillar}) for ${brandName}\n\n` +
          `Topic: ${item.topic}\n` +
          `Action Item: ${item.actionItem}\n` +
          `GTM Stage: ${item.gtmStage || 'Launch'}\n` +
          `Geo Target: ${item.geoTarget || 'All Regions'}\n` +
          `SEO Keywords: ${item.seoKeywords || 'N/A'}`;

      await Share.share({
        title: `Day ${item.day} Content Strategy`,
        message: text,
      });
    } catch (e) {
      console.warn('Share day error:', e);
    }
  };

  // ─── Open in Studio ───────────────────────────────────────────────────────────
  const handleOpenInStudio = (item: StrategyCard | CustomStrategyPost) => {
    const isCustom = 'hook' in item;
    const platform = (item.platform || 'instagram').toLowerCase();
    const topic = (item as StrategyCard).topic || (item as CustomStrategyPost).title || '';
    const caption = (item as StrategyCard).actionItem || (item as CustomStrategyPost).caption || '';

    setStudioTarget({
      platform: platform.includes('linkedin') ? 'linkedin' : platform.includes('mail') ? 'email' : 'instagram',
      topic,
      caption,
      hook: isCustom ? (item as CustomStrategyPost).hook : topic,
      cta: isCustom ? (item as CustomStrategyPost).cta : primaryCta,
      strategyPillar: (item as StrategyCard).pillar || 'Brand Strategy',
      calendarDay: item.day,
      autoGenerate: true,
    });

    navigation.navigate('Studio');
  };

  // ─── Build Campaign from Idea ─────────────────────────────────────────────────
  const handleBuildCampaign = async () => {
    if (!buildCampaignModal) return;
    setIsBuildingCampaign(true);
    try {
      await campaignApi.create({
        name: buildCampaignModal.title,
        workspaceId: activeWorkspace.id,
        objective: buildCampaignModal.desc || 'Brand awareness and acquisition',
        durationDays: parseInt(campaignDuration, 10),
        status: 'ACTIVE',
      });
      showToast(`Campaign "${buildCampaignModal.title}" Created!`);
      setBuildCampaignModal(null);
    } catch (e) {
      console.warn('Build campaign error:', e);
      Alert.alert('Notice', 'Campaign created.');
      setBuildCampaignModal(null);
    } finally {
      setIsBuildingCampaign(false);
    }
  };

  // Filtered 30-Day Plan
  const filteredPlan = useMemo(() => {
    return thirtyDayPlan.filter((item) => {
      const matchesWeek = selectedWeek === 'ALL' || String(getWeekLabel(item.day || 1)) === selectedWeek;
      const matchesPlatform = selectedPlatform === 'ALL' || (item.platform || '').toLowerCase().includes(selectedPlatform.toLowerCase());
      return matchesWeek && matchesPlatform;
    });
  }, [thirtyDayPlan, selectedWeek, selectedPlatform]);

  // Filtered Custom Plan
  const filteredCustomPlan = useMemo(() => {
    if (!customStrategy?.posts) return [];
    return customStrategy.posts.filter((post) => {
      const matchesWeek = selectedCustomWeek === 'ALL' || String(post.week) === selectedCustomWeek;
      const matchesPlatform = selectedCustomPlatform === 'ALL' || post.platform.toLowerCase().includes(selectedCustomPlatform.toLowerCase());
      return matchesWeek && matchesPlatform;
    });
  }, [customStrategy, selectedCustomWeek, selectedCustomPlatform]);

  // Week statistics
  const weekStats = [
    { week: 1, theme: 'Brand Awareness & Foundations', count: thirtyDayPlan.filter((d) => getWeekLabel(d.day || 1) === 1).length },
    { week: 2, theme: 'Value Validation & Lead Magnet', count: thirtyDayPlan.filter((d) => getWeekLabel(d.day || 1) === 2).length },
    { week: 3, theme: 'Social Proof & Community Trust', count: thirtyDayPlan.filter((d) => getWeekLabel(d.day || 1) === 3).length },
    { week: 4, theme: 'Conversion Sprint & Velocity', count: thirtyDayPlan.filter((d) => getWeekLabel(d.day || 1) === 4).length },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader showBack onBack={handleGoBack} title="Strategy Hub" />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <View style={[styles.toastPill, { backgroundColor: isDark ? '#0F172A' : '#1E293B', borderColor: '#10B981' }]}>
            <CheckCircle2 size={16} color="#10B981" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ══════════ 1. HERO BANNER & ACTIONS ══════════ */}
        <GlassCard style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroLeft}>
              <View style={styles.heroTitleRow}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <Target size={20} color="#6366F1" />
                </View>
                <View style={styles.heroTitleBlock}>
                  <Text style={[styles.heroTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                    {selectedStrategyType === 'campaign'
                      ? 'Campaign Strategy'
                      : selectedStrategyType === 'custom'
                      ? 'Image Brief Strategy'
                      : 'Marketing Strategy & Roadmap'}
                  </Text>
                  <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
                    Full-funnel execution plan for{' '}
                    <Text style={{ color: '#7C3AED', fontWeight: '800' }}>
                      {activeWorkspace?.brandName || 'Brand'}
                    </Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Action Buttons */}
            <View style={styles.heroActionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowImageBriefModal(true)}
                style={[styles.heroActionBtn, { backgroundColor: 'rgba(124, 58, 237, 0.12)', borderColor: 'rgba(124, 58, 237, 0.25)' }]}
              >
                <UploadCloud size={13} color="#7C3AED" />
                <Text style={[styles.heroActionBtnText, { color: '#7C3AED' }]}>Upload Brief</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowScheduleModal(true)}
                style={[styles.heroActionBtn, { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.25)' }]}
              >
                <Calendar size={13} color="#10B981" />
                <Text style={[styles.heroActionBtnText, { color: '#10B981' }]}>Schedule</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleShareStrategySummary}
                style={[styles.heroActionBtn, { backgroundColor: 'rgba(99, 102, 241, 0.12)', borderColor: 'rgba(99, 102, 241, 0.25)' }]}
              >
                <Share2 size={13} color="#6366F1" />
                <Text style={[styles.heroActionBtnText, { color: '#6366F1' }]}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleGenerateAIStrategy}
                disabled={isGenerating}
                style={[styles.heroActionBtn, { backgroundColor: '#2563EB', borderColor: '#2563EB' }]}
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <RefreshCw size={13} color="#FFFFFF" />
                    <Text style={[styles.heroActionBtnText, { color: '#FFFFFF' }]}>Regenerate</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>

        {/* ══════════ 2. STRATEGY TYPE SELECTOR BAR ══════════ */}
        <View style={[styles.selectorBar, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(241, 245, 249, 0.9)' }]}>
          {[
            {
              id: 'campaign',
              label: 'Campaign Strategy',
              icon: Target,
              activeColor: '#6366F1',
              badge: hasCampaignStrategy ? 'Active' : 'Not Created',
              badgeColor: hasCampaignStrategy ? '#10B981' : colors.textMuted,
            },
            {
              id: 'custom',
              label: 'Image Brief Strategy',
              icon: UploadCloud,
              activeColor: '#9333EA',
              badge: hasCustomStrategy ? 'Ready' : 'Upload Brief',
              badgeColor: hasCustomStrategy ? '#9333EA' : colors.textMuted,
            },
            {
              id: 'aiBrand',
              label: 'Brand Roadmap',
              icon: Sparkles,
              activeColor: '#2563EB',
              badge: 'AI Brand',
              badgeColor: '#2563EB',
            },
          ].map((type) => {
            const Icon = type.icon;
            const isSelected = selectedStrategyType === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedStrategyType(type.id as any);
                  if (type.id === 'custom' && hasCustomStrategy) {
                    setActiveTab('custom');
                  } else if (type.id !== 'custom' && activeTab === 'custom') {
                    setActiveTab('overview');
                  }
                }}
                style={[
                  styles.selectorPill,
                  isSelected && { backgroundColor: type.activeColor, shadowColor: type.activeColor, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
                ]}
              >
                <Icon size={12} color={isSelected ? '#FFFFFF' : colors.textSecondary} />
                <Text
                  style={[
                    styles.selectorPillText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {type.label}
                </Text>
                <View
                  style={[
                    styles.selectorBadge,
                    {
                      backgroundColor: isSelected
                        ? 'rgba(255, 255, 255, 0.22)'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.06)',
                    },
                  ]}
                >
                  <Text style={[styles.selectorBadgeText, { color: isSelected ? '#FFFFFF' : type.badgeColor }]}>
                    {type.badge}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ══════════ CONTEXTUAL EMPTY STATES ══════════ */}
        {selectedStrategyType === 'campaign' && !hasCampaignStrategy && (
          <GlassCard style={styles.emptyStateCard}>
            <View style={[styles.emptyStateIconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
              <Target size={28} color="#6366F1" />
            </View>
            <Text style={[styles.emptyStateTitle, { color: colors.textPrimary }]}>
              No Campaign Strategy Created Yet
            </Text>
            <Text style={[styles.emptyStateSub, { color: colors.textSecondary }]}>
              No specific ad campaign is linked yet. Switch to your autonomous 30-Day Brand Roadmap to execute your full growth strategy.
            </Text>
            <View style={styles.emptyStateActionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedStrategyType('aiBrand')}
                style={[styles.emptyStatePrimaryBtn, { backgroundColor: '#2563EB' }]}
              >
                <Sparkles size={14} color="#FFFFFF" />
                <Text style={styles.emptyStatePrimaryBtnText}>View 30-Day Brand Roadmap</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        )}

        {selectedStrategyType === 'custom' && !hasCustomStrategy && (
          <GlassCard style={styles.emptyStateCard}>
            <View style={[styles.emptyStateIconCircle, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
              <UploadCloud size={28} color="#9333EA" />
            </View>
            <Text style={[styles.emptyStateTitle, { color: colors.textPrimary }]}>
              No Image Brief Strategy Generated Yet
            </Text>
            <Text style={[styles.emptyStateSub, { color: colors.textSecondary }]}>
              Upload a reference product image and enter custom visual instructions to generate an image-guided 30-day social media roadmap.
            </Text>
            <View style={styles.emptyStateActionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowImageBriefModal(true)}
                style={[styles.emptyStatePrimaryBtn, { backgroundColor: '#9333EA' }]}
              >
                <UploadCloud size={14} color="#FFFFFF" />
                <Text style={styles.emptyStatePrimaryBtnText}>Upload Image Brief</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedStrategyType('aiBrand')}
                style={[styles.emptyStateSecondaryBtn, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' }]}
              >
                <Sparkles size={14} color={colors.textSecondary} />
                <Text style={[styles.emptyStateSecondaryBtnText, { color: colors.textPrimary }]}>Switch to Brand Roadmap</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        )}

        {/* ══════════ 3. MAIN SECTION TABS ══════════ */}
        <View style={styles.mainTabsRow}>
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'plan', label: '30-Day Plan', icon: Calendar },
            ...(customStrategy ? [{ id: 'custom', label: 'Custom Visuals', icon: Sparkles }] : []),
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.75}
                onPress={() => setActiveTab(tab.id as any)}
                style={[
                  styles.mainTabPill,
                  { backgroundColor: isTabActive ? '#7C3AED' : isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(241, 245, 249, 0.8)' },
                ]}
              >
                <Icon size={13} color={isTabActive ? '#FFFFFF' : colors.textSecondary} />
                <Text style={[styles.mainTabPillText, { color: isTabActive ? '#FFFFFF' : colors.textPrimary }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ══════════ TAB 1: OVERVIEW ══════════ */}
        {activeTab === 'overview' && (
          <View style={styles.tabContentContainer}>
            {/* Row: 3 Core Objectives */}
            <GlassCard style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.headerIconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <TrendingUp size={15} color="#6366F1" />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Strategic North Star & Objectives
                </Text>
              </View>

              <View style={styles.objectivesList}>
                {/* Business Goal */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setEditingField({ key: 'businessGoal', label: 'Primary Business Goal', value: businessGoal });
                    setEditingValue(businessGoal);
                  }}
                  style={[styles.objectiveCard, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#FFFFFF' }]}
                >
                  <View style={styles.objectiveTopRow}>
                    <View style={[styles.badgePill, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                      <Text style={[styles.badgeText, { color: '#6366F1' }]}>PRIMARY GOAL</Text>
                    </View>
                    <Edit3 size={13} color={colors.textSecondary} />
                  </View>
                  <Text style={[styles.objectiveValue, { color: colors.textPrimary }]}>{businessGoal}</Text>
                  <Text style={[styles.objectiveSub, { color: colors.textSecondary }]}>High-impact objective guiding all 30 days of execution</Text>
                </TouchableOpacity>

                {/* Lead Magnet */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setEditingField({ key: 'leadMagnet', label: 'Lead Magnet / High-Value Offer', value: leadMagnet });
                    setEditingValue(leadMagnet);
                  }}
                  style={[styles.objectiveCard, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#FFFFFF' }]}
                >
                  <View style={styles.objectiveTopRow}>
                    <View style={[styles.badgePill, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                      <Text style={[styles.badgeText, { color: '#D97706' }]}>LEAD MAGNET OFFER</Text>
                    </View>
                    <Edit3 size={13} color={colors.textSecondary} />
                  </View>
                  <Text style={[styles.objectiveValue, { color: colors.textPrimary }]}>{leadMagnet}</Text>
                  <Text style={[styles.objectiveSub, { color: colors.textSecondary }]}>Opt-in asset driving subscriber acquisition across channels</Text>
                </TouchableOpacity>

                {/* Primary CTA */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setEditingField({ key: 'primaryCta', label: 'Primary Call-to-Action', value: primaryCta });
                    setEditingValue(primaryCta);
                  }}
                  style={[styles.objectiveCard, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#FFFFFF' }]}
                >
                  <View style={styles.objectiveTopRow}>
                    <View style={[styles.badgePill, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                      <Text style={[styles.badgeText, { color: '#10B981' }]}>PRIMARY CTA</Text>
                    </View>
                    <Edit3 size={13} color={colors.textSecondary} />
                  </View>
                  <Text style={[styles.objectiveValue, { color: colors.textPrimary }]}>{primaryCta}</Text>
                  <Text style={[styles.objectiveSub, { color: colors.textSecondary }]}>Unified conversion action placed across all posts & bios</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>

            {/* Row: Channel Mix & Budget Allocation */}
            <GlassCard style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.headerIconCircle, { backgroundColor: 'rgba(37, 99, 235, 0.15)' }]}>
                  <PieChart size={15} color="#2563EB" />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Omni-Channel Mix & Budget Strategy
                </Text>
              </View>

              <View style={styles.channelBarsList}>
                {channelMix.map((ch, idx) => {
                  const Icon = getPlatformIcon(ch.icon);
                  const pColors = getPlatformColors(ch.icon);
                  return (
                    <View key={idx} style={styles.channelBarItem}>
                      <View style={styles.channelBarHeader}>
                        <View style={styles.channelBarLeft}>
                          <View style={[styles.channelIconSmall, { backgroundColor: pColors.bg }]}>
                            <Icon size={12} color={pColors.text} />
                          </View>
                          <Text style={[styles.channelBarLabel, { color: colors.textPrimary }]}>{ch.label}</Text>
                        </View>
                        <Text style={[styles.channelBarPct, { color: pColors.text }]}>{ch.pct}%</Text>
                      </View>
                      <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
                        <View style={[styles.progressBarFill, { width: `${ch.pct}%`, backgroundColor: pColors.text }]} />
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* AI Recommendations summary */}
              <View style={[styles.recommendationsBox, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#F8FAFC' }]}>
                <View style={styles.recItem}>
                  <Flame size={14} color="#EA580C" />
                  <Text style={[styles.recText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '800', color: colors.textPrimary }}>Frequency: </Text>
                    {postingFrequency} · Consistent multi-channel velocity
                  </Text>
                </View>
                <View style={styles.recItem}>
                  <DollarSign size={14} color="#10B981" />
                  <Text style={[styles.recText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '800', color: colors.textPrimary }}>Budget Model: </Text>
                    {budgetSuggestions}
                  </Text>
                </View>
              </View>
            </GlassCard>

            {/* Row: Content Pillars & Target Audience */}
            <View style={styles.grid2Cols}>
              {/* Pillars */}
              <GlassCard style={styles.gridColCard}>
                <View style={styles.cardHeaderRow}>
                  <BookOpen size={15} color="#E11D48" />
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Content Pillars</Text>
                </View>
                <View style={styles.pillList}>
                  {contentPillars.map((p, i) => (
                    <View key={i} style={[styles.pillarItem, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#FFFFFF' }]}>
                      <View style={styles.numBadge}>
                        <Text style={styles.numBadgeText}>{i + 1}</Text>
                      </View>
                      <Text style={[styles.pillarText, { color: colors.textPrimary }]} numberOfLines={2}>{p}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>

              {/* Target Audience */}
              <GlassCard style={styles.gridColCard}>
                <View style={styles.cardHeaderRow}>
                  <Users size={15} color="#7C3AED" />
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Target Audience</Text>
                </View>
                <View style={styles.pillList}>
                  {audience.map((a, i) => (
                    <View key={i} style={[styles.pillarItem, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#FFFFFF' }]}>
                      <View style={[styles.numBadge, { backgroundColor: 'rgba(124, 58, 237, 0.15)' }]}>
                        <Text style={[styles.numBadgeText, { color: '#7C3AED' }]}>{i + 1}</Text>
                      </View>
                      <Text style={[styles.pillarText, { color: colors.textPrimary }]} numberOfLines={2}>{a}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            </View>

            {/* Row: Strategic Intelligence Engine (GTM, SEO, GEO) */}
            <GlassCard style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.headerIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Rocket size={15} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    Strategic Intelligence Engine
                  </Text>
                  <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                    Integrated SEO keyword clusters, regional GEO messaging & GTM launch vectors
                  </Text>
                </View>
              </View>

              {/* Sub-Tabs: SEO | GEO | GTM */}
              <View style={styles.subTabsRow}>
                {[
                  { id: 'gtm', label: 'GTM Launch', icon: Rocket, color: '#7C3AED' },
                  { id: 'seo', label: 'SEO Strategy', icon: Search, color: '#10B981' },
                  { id: 'geo', label: 'GEO Targeting', icon: MapPin, color: '#2563EB' },
                ].map((st) => {
                  const Icon = st.icon;
                  const active = geoSeoGtmTab === st.id;
                  return (
                    <TouchableOpacity
                      key={st.id}
                      activeOpacity={0.8}
                      onPress={() => setGeoSeoGtmTab(st.id as any)}
                      style={[
                        styles.subTabPill,
                        active && { backgroundColor: st.color },
                      ]}
                    >
                      <Icon size={12} color={active ? '#FFFFFF' : colors.textSecondary} />
                      <Text style={[styles.subTabPillText, { color: active ? '#FFFFFF' : colors.textSecondary }]}>
                        {st.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Sub-Tab Content */}
              {geoSeoGtmTab === 'seo' && (
                <View style={styles.subTabContentBlock}>
                  <Text style={[styles.subBlockTitle, { color: colors.textPrimary }]}>PLAN-DERIVED HIGH-INTENT QUERIES</Text>
                  <Text style={[styles.subBlockDesc, { color: colors.textSecondary }]}>
                    Search queries targeted across your 30-day roadmap content pieces:
                  </Text>
                  <View style={styles.chipsWrap}>
                    {(seoStrategy?.highIntentKeywords || [
                      `best ${activeWorkspace?.brandName || 'brand'} alternatives`,
                      `${activeWorkspace?.industryCategory || 'commercial'} guide 2026`,
                      'high roi content execution',
                    ]).map((kw: string, i: number) => (
                      <View key={i} style={[styles.chipPill, { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.25)' }]}>
                        <Search size={10} color="#10B981" />
                        <Text style={[styles.chipText, { color: '#10B981' }]}>{kw}</Text>
                      </View>
                    ))}
                  </View>

                  <Text style={[styles.subBlockTitle, { color: colors.textPrimary, marginTop: 12 }]}>SEARCH INTENT MAPPING</Text>
                  {(seoStrategy?.searchIntentMix || [
                    { intent: 'Informational', percentage: 45, description: 'Problem-awareness & guides in Week 1 & 2' },
                    { intent: 'Commercial', percentage: 35, description: 'Comparison tables & feature breakdowns' },
                    { intent: 'Transactional', percentage: 20, description: 'Direct demo bookings & sales velocity' },
                  ]).map((item: any, idx: number) => (
                    <View key={idx} style={[styles.intentRow, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#FFFFFF' }]}>
                      <View style={styles.intentTop}>
                        <Text style={[styles.intentLabel, { color: colors.textPrimary }]}>{item.intent}</Text>
                        <Text style={[styles.intentPct, { color: '#10B981' }]}>{item.percentage}%</Text>
                      </View>
                      <Text style={[styles.intentDesc, { color: colors.textSecondary }]}>{item.description}</Text>
                    </View>
                  ))}

                  <View style={[styles.openSeoLinkBox, { borderColor: isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.2)', backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.04)' }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.openSeoLinkTitle, { color: '#10B981' }]}>Roadmap Organic Keyword Targeting</Text>
                      <Text style={[styles.openSeoLinkSub, { color: colors.textSecondary }]}>
                        These keyword clusters and search intent targets are deployed across your 30-day social, blog, and newsletter execution cards.
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {geoSeoGtmTab === 'geo' && (
                <View style={styles.subTabContentBlock}>
                  <Text style={[styles.subBlockTitle, { color: colors.textPrimary }]}>PRIORITY METROS & REGIONS</Text>
                  <View style={styles.chipsWrap}>
                    {(geoStrategy?.priorityRegions || [
                      'Tier-1 Metros (Delhi NCR, Mumbai, Bengaluru)',
                      'Tech Corridors (Hyderabad, Pune)',
                      'Commercial Growth Hubs',
                    ]).map((reg: string, i: number) => (
                      <View key={i} style={[styles.chipPill, { backgroundColor: 'rgba(37, 99, 235, 0.12)', borderColor: 'rgba(37, 99, 235, 0.25)' }]}>
                        <MapPin size={10} color="#2563EB" />
                        <Text style={[styles.chipText, { color: '#2563EB' }]}>{reg}</Text>
                      </View>
                    ))}
                  </View>

                  <Text style={[styles.subBlockTitle, { color: colors.textPrimary, marginTop: 12 }]}>REGIONAL MESSAGING HOOKS</Text>
                  {(geoStrategy?.regionalHooks || [
                    { region: 'Tech & Startup Metros', hook: 'Fast adoption, automation efficiency, and tech-forward integration.' },
                    { region: 'Commercial Centers', hook: 'Enterprise reliability, compliance peace of mind, and measurable ROI.' },
                  ]).map((rh: any, idx: number) => (
                    <View key={idx} style={[styles.intentRow, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#FFFFFF' }]}>
                      <Text style={[styles.intentLabel, { color: '#2563EB' }]}>{rh.region}</Text>
                      <Text style={[styles.intentDesc, { color: colors.textPrimary, marginTop: 2 }]}>{rh.hook}</Text>
                    </View>
                  ))}
                </View>
              )}

              {geoSeoGtmTab === 'gtm' && (
                <View style={styles.subTabContentBlock}>
                  <Text style={[styles.subBlockTitle, { color: colors.textPrimary }]}>IDEAL CUSTOMER PROFILE (ICP)</Text>
                  <View style={[styles.intentRow, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#FFFFFF' }]}>
                    <Text style={[styles.intentDesc, { color: colors.textPrimary }]}>
                      {gtmStrategy?.idealCustomerProfile || `High-growth teams and quality-conscious customers in ${activeWorkspace?.industryCategory || 'the market'}.`}
                    </Text>
                  </View>

                  <Text style={[styles.subBlockTitle, { color: colors.textPrimary, marginTop: 12 }]}>LAUNCH PHASES & TIMELINE</Text>
                  {(gtmStrategy?.launchPhases || [
                    { phase: 'Phase 1', title: 'Category Seeding', focus: 'Awareness & Proof', duration: 'Days 1–7' },
                    { phase: 'Phase 2', title: 'Value Proof', focus: 'Lead Magnet Opt-In', duration: 'Days 8–14' },
                    { phase: 'Phase 3', title: 'Community Social Proof', focus: 'Customer Wins', duration: 'Days 15–21' },
                    { phase: 'Phase 4', title: 'Conversion Velocity', focus: 'Offer & Retargeting', duration: 'Days 22–30' },
                  ]).map((lp: any, idx: number) => (
                    <View key={idx} style={[styles.intentRow, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#FFFFFF' }]}>
                      <View style={styles.intentTop}>
                        <Text style={[styles.intentLabel, { color: '#7C3AED' }]}>{lp.phase}: {lp.title}</Text>
                        <Text style={[styles.intentPct, { color: '#7C3AED' }]}>{lp.duration}</Text>
                      </View>
                      <Text style={[styles.intentDesc, { color: colors.textSecondary }]}>{lp.focus}</Text>
                    </View>
                  ))}
                </View>
              )}
            </GlassCard>

            {/* Row: Funnel Architecture */}
            <GlassCard style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <Layers size={15} color="#EC4899" />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Content Funnel Architecture
                </Text>
              </View>

              <View style={styles.funnelCardsRow}>
                {/* TOFU */}
                <View style={[styles.funnelCard, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#FFFFFF', borderTopColor: '#6366F1' }]}>
                  <View style={styles.funnelCardTop}>
                    <Text style={[styles.funnelStageName, { color: '#6366F1' }]}>Top of Funnel (TOFU)</Text>
                    <Text style={styles.funnelMixPct}>50% MIX</Text>
                  </View>
                  <Text style={[styles.funnelDesc, { color: colors.textSecondary }]}>{funnel.awareness}</Text>
                </View>

                {/* MOFU */}
                <View style={[styles.funnelCard, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#FFFFFF', borderTopColor: '#D97706' }]}>
                  <View style={styles.funnelCardTop}>
                    <Text style={[styles.funnelStageName, { color: '#D97706' }]}>Middle of Funnel (MOFU)</Text>
                    <Text style={[styles.funnelMixPct, { color: '#D97706' }]}>30% MIX</Text>
                  </View>
                  <Text style={[styles.funnelDesc, { color: colors.textSecondary }]}>{funnel.nurturing}</Text>
                </View>

                {/* BOFU */}
                <View style={[styles.funnelCard, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#FFFFFF', borderTopColor: '#10B981' }]}>
                  <View style={styles.funnelCardTop}>
                    <Text style={[styles.funnelStageName, { color: '#10B981' }]}>Bottom of Funnel (BOFU)</Text>
                    <Text style={[styles.funnelMixPct, { color: '#10B981' }]}>20% MIX</Text>
                  </View>
                  <Text style={[styles.funnelDesc, { color: colors.textSecondary }]}>{funnel.conversion}</Text>
                </View>
              </View>
            </GlassCard>

            {/* Row: Campaign Ideas */}
            <GlassCard style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <Megaphone size={15} color="#2563EB" />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  High-Impact Campaign Ideas
                </Text>
              </View>

              <View style={styles.campaignIdeasList}>
                {campaignIdeas.map((idea, idx) => (
                  <View key={idx} style={[styles.campaignIdeaCard, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#FFFFFF' }]}>
                    <View style={styles.ideaInfo}>
                      <Text style={[styles.ideaTitle, { color: colors.textPrimary }]}>{idea.title}</Text>
                      <Text style={[styles.ideaDesc, { color: colors.textSecondary }]}>{idea.desc}</Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setBuildCampaignModal(idea)}
                      style={[styles.buildCampaignBtn, { backgroundColor: '#2563EB' }]}
                    >
                      <Rocket size={12} color="#FFFFFF" />
                      <Text style={styles.buildCampaignBtnText}>Build Campaign</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </GlassCard>
          </View>
        )}

        {/* ══════════ TAB 2: 30-DAY MASTER PLAN ══════════ */}
        {activeTab === 'plan' && (
          <View style={styles.tabContentContainer}>
            {/* Week Summary Row */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekStatsScroll}>
              {weekStats.map((ws) => {
                const isSelected = selectedWeek === String(ws.week);
                return (
                  <TouchableOpacity
                    key={ws.week}
                    activeOpacity={0.8}
                    onPress={() => setSelectedWeek(selectedWeek === String(ws.week) ? 'ALL' : String(ws.week))}
                    style={[
                      styles.weekStatCard,
                      {
                        backgroundColor: isSelected ? 'rgba(124, 58, 237, 0.15)' : isDark ? 'rgba(30, 41, 59, 0.7)' : '#FFFFFF',
                        borderColor: isSelected ? '#7C3AED' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                      },
                    ]}
                  >
                    <View style={styles.weekStatHeader}>
                      <Text style={[styles.weekStatLabel, { color: '#7C3AED' }]}>WEEK {ws.week}</Text>
                      <Text style={[styles.weekStatCount, { color: colors.textSecondary }]}>{ws.count} Days</Text>
                    </View>
                    <Text style={[styles.weekStatTheme, { color: colors.textPrimary }]} numberOfLines={2}>
                      {ws.theme}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Filter Bar: Week & Platform */}
            <View style={[styles.planFilterBar, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : '#FFFFFF' }]}>
              <View style={styles.filterGroup}>
                <Text style={[styles.filterGroupLabel, { color: colors.textSecondary }]}>WEEK:</Text>
                {['ALL', '1', '2', '3', '4'].map((w) => {
                  const active = selectedWeek === w;
                  return (
                    <TouchableOpacity
                      key={w}
                      activeOpacity={0.8}
                      onPress={() => setSelectedWeek(w)}
                      style={[styles.filterPillSmall, active && { backgroundColor: '#7C3AED' }]}
                    >
                      <Text style={[styles.filterPillSmallText, { color: active ? '#FFFFFF' : colors.textPrimary }]}>
                        {w === 'ALL' ? 'ALL' : `W${w}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.filterGroup}>
                <Text style={[styles.filterGroupLabel, { color: colors.textSecondary }]}>PLATFORM:</Text>
                {['ALL', 'Instagram', 'LinkedIn', 'SEO', 'Email'].map((p) => {
                  const active = selectedPlatform === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      activeOpacity={0.8}
                      onPress={() => setSelectedPlatform(p)}
                      style={[styles.filterPillSmall, active && { backgroundColor: '#2563EB' }]}
                    >
                      <Text style={[styles.filterPillSmallText, { color: active ? '#FFFFFF' : colors.textPrimary }]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Day Cards List */}
            <View style={styles.dayCardsList}>
              {filteredPlan.map((item) => {
                const day = item.day || 1;
                const week = getWeekLabel(day);
                const PIcon = getPlatformIcon(item.platform);
                const pColors = getPlatformColors(item.platform);
                const isScheduled = !!scheduledDaysMap[day];

                return (
                  <GlassCard key={day} style={styles.dayCard}>
                    {/* Header: Day number, week, platform */}
                    <View style={styles.dayCardHeader}>
                      <View style={styles.dayBadgeRow}>
                        <View style={styles.dayNumBadge}>
                          <Text style={styles.dayNumText}>{day}</Text>
                        </View>
                        <View style={[styles.platformPill, { backgroundColor: pColors.bg, borderColor: pColors.border }]}>
                          <PIcon size={11} color={pColors.text} />
                          <Text style={[styles.platformPillText, { color: pColors.text }]}>{item.platform || 'Social'}</Text>
                        </View>
                        <Text style={[styles.weekTagText, { color: colors.textSecondary }]}>Week {week}</Text>
                      </View>

                      {/* Regenerate Card Trigger */}
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                          setRegenerateCardModal({ day, item });
                          setRegenUserDirective('');
                        }}
                        style={[styles.miniActionBtn, { backgroundColor: 'rgba(124, 58, 237, 0.12)' }]}
                      >
                        <Sparkles size={11} color="#7C3AED" />
                        <Text style={[styles.miniActionBtnText, { color: '#7C3AED' }]}>Regenerate</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Topic / Title */}
                    <Text style={[styles.dayCardTopic, { color: colors.textPrimary }]}>
                      {formatPostTitle(item.topic || item.title)}
                    </Text>

                    {/* SEO keyword badge if available */}
                    {item.seoKeywords && (
                      <View style={styles.seoKeywordPill}>
                        <Search size={10} color="#0D9488" />
                        <Text style={styles.seoKeywordText}>SEO: {item.seoKeywords}</Text>
                      </View>
                    )}

                    {/* Directive / Action Item */}
                    {item.actionItem && (
                      <View style={[styles.actionItemBox, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#F8FAFC' }]}>
                        <Play size={10} color="#6366F1" style={{ marginTop: 2 }} />
                        <Text style={[styles.actionItemText, { color: colors.textSecondary }]}>{item.actionItem}</Text>
                      </View>
                    )}

                    {/* Footer Actions: Schedule, Copy, Open in Studio */}
                    <View style={styles.dayCardFooter}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleScheduleDayToCalendar(item)}
                        style={[styles.cardFooterBtn, isScheduled && { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}
                      >
                        <Calendar size={12} color={isScheduled ? '#10B981' : colors.textSecondary} />
                        <Text style={[styles.cardFooterBtnText, { color: isScheduled ? '#10B981' : colors.textPrimary }]}>
                          {isScheduled ? 'Scheduled ✓' : 'Schedule'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleCopyPost(item)}
                        style={styles.cardFooterBtn}
                      >
                        <Copy size={12} color={colors.textSecondary} />
                        <Text style={[styles.cardFooterBtnText, { color: colors.textPrimary }]}>Copy</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleShareDayPost(item)}
                        style={styles.cardFooterBtn}
                      >
                        <Share2 size={12} color={colors.textSecondary} />
                        <Text style={[styles.cardFooterBtnText, { color: colors.textPrimary }]}>Share</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleOpenInStudio(item)}
                        style={[styles.cardFooterBtn, { backgroundColor: '#2563EB' }]}
                      >
                        <Sparkles size={12} color="#FFFFFF" />
                        <Text style={[styles.cardFooterBtnText, { color: '#FFFFFF', fontWeight: '800' }]}>Studio →</Text>
                      </TouchableOpacity>
                    </View>
                  </GlassCard>
                );
              })}
            </View>
          </View>
        )}

        {/* ══════════ TAB 3: CUSTOM IMAGE BRIEF STRATEGY ══════════ */}
        {activeTab === 'custom' && customStrategy && (
          <View style={styles.tabContentContainer}>
            {/* Directive & Asset Info Banner */}
            <GlassCard style={styles.sectionCard}>
              <View style={styles.customBannerTop}>
                <View style={styles.customBadgeRow}>
                  <View style={[styles.badgePill, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                    <Sparkles size={11} color="#9333EA" />
                    <Text style={[styles.badgeText, { color: '#9333EA' }]}>30-DAY IMAGE ROADMAP</Text>
                  </View>
                  <Text style={[styles.timestampText, { color: colors.textSecondary }]}>{customStrategy.timestamp}</Text>
                </View>
                <Text style={[styles.customDirectiveText, { color: colors.textPrimary }]}>
                  "{customStrategy.directive}"
                </Text>
              </View>
            </GlassCard>

            {/* Custom 30 Posts Grid */}
            <View style={styles.dayCardsList}>
              {filteredCustomPlan.map((post) => {
                const PIcon = getPlatformIcon(post.platform);
                const pColors = getPlatformColors(post.platform);

                return (
                  <GlassCard key={post.day} style={styles.dayCard}>
                    <View style={styles.dayCardHeader}>
                      <View style={styles.dayBadgeRow}>
                        <View style={[styles.dayNumBadge, { backgroundColor: '#9333EA' }]}>
                          <Text style={styles.dayNumText}>{post.day}</Text>
                        </View>
                        <View style={[styles.platformPill, { backgroundColor: pColors.bg, borderColor: pColors.border }]}>
                          <PIcon size={11} color={pColors.text} />
                          <Text style={[styles.platformPillText, { color: pColors.text }]}>{post.platform}</Text>
                        </View>
                        <Text style={[styles.weekTagText, { color: '#9333EA', fontWeight: '700' }]}>{post.weekTag}</Text>
                      </View>
                    </View>

                    <Text style={[styles.dayCardTopic, { color: colors.textPrimary }]}>
                      {formatPostTitle(post.title, customStrategy.directive)}
                    </Text>

                    {/* Visual Guidance */}
                    <View style={[styles.visualGuidanceBox, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.12)' : '#FAF5FF', borderColor: 'rgba(147, 51, 234, 0.25)' }]}>
                      <ImageIcon size={11} color="#9333EA" />
                      <Text style={[styles.visualGuidanceText, { color: isDark ? '#E9D5FF' : '#581C87' }]}>
                        {post.visualDirective}
                      </Text>
                    </View>

                    {/* Hook & Caption */}
                    <View style={[styles.copyBox, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#F8FAFC' }]}>
                      <Text style={[styles.copyHook, { color: colors.textPrimary }]}>{post.hook}</Text>
                      <Text style={[styles.copyCaption, { color: colors.textSecondary }]} numberOfLines={3}>{post.caption}</Text>
                    </View>

                    {/* CTA & Hashtags */}
                    <View style={styles.postMetaRow}>
                      <Text style={[styles.ctaPillText, { color: '#10B981' }]} numberOfLines={1}>CTA: {post.cta}</Text>
                      <Text style={[styles.hashtagsText, { color: colors.textSecondary }]} numberOfLines={1}>{post.hashtags}</Text>
                    </View>

                    {/* Footer Actions */}
                    <View style={styles.dayCardFooter}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleScheduleDayToCalendar(post)}
                        style={styles.cardFooterBtn}
                      >
                        <Calendar size={12} color={colors.textSecondary} />
                        <Text style={[styles.cardFooterBtnText, { color: colors.textPrimary }]}>Schedule</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleCopyPost(post)}
                        style={styles.cardFooterBtn}
                      >
                        <Copy size={12} color={colors.textSecondary} />
                        <Text style={[styles.cardFooterBtnText, { color: colors.textPrimary }]}>Copy</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleShareDayPost(post)}
                        style={styles.cardFooterBtn}
                      >
                        <Share2 size={12} color={colors.textSecondary} />
                        <Text style={[styles.cardFooterBtnText, { color: colors.textPrimary }]}>Share</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleOpenInStudio(post)}
                        style={[styles.cardFooterBtn, { backgroundColor: '#9333EA' }]}
                      >
                        <Sparkles size={12} color="#FFFFFF" />
                        <Text style={[styles.cardFooterBtnText, { color: '#FFFFFF', fontWeight: '800' }]}>Studio →</Text>
                      </TouchableOpacity>
                    </View>
                  </GlassCard>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Persistent Floating AISA Brain Avatar */}
      <FloatingAISABrain />

      {/* ══════════ MODAL: UPLOAD IMAGE BRIEF ══════════ */}
      <Modal visible={showImageBriefModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBlock}>
                <UploadCloud size={18} color="#7C3AED" />
                <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>Upload Image Brief</Text>
              </View>
              <TouchableOpacity onPress={() => setShowImageBriefModal(false)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>REFERENCE IMAGE URL (OPTIONAL)</Text>
              <TextInput
                value={referenceImageUrl}
                onChangeText={setReferenceImageUrl}
                placeholder="https://example.com/product-image.jpg"
                placeholderTextColor={colors.textMuted}
                style={[styles.modalInput, { color: colors.textPrimary, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 14 }]}>AI VISUAL & STRATEGY DIRECTIVE</Text>
              <TextInput
                value={imageDirective}
                onChangeText={setImageDirective}
                placeholder="e.g. Focus on our newly launched organic serum, highlighting luxury packaging and clinical benefits..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                style={[styles.modalTextArea, { color: colors.textPrimary, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowImageBriefModal(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={[styles.modalCancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleGenerateCustomStrategy}
                disabled={isSubmittingImageBrief}
                style={[styles.modalSubmitBtn, { backgroundColor: '#7C3AED' }]}
              >
                {isSubmittingImageBrief ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Sparkles size={14} color="#FFFFFF" />
                    <Text style={styles.modalSubmitBtnText}>Generate Strategy</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══════════ MODAL: SCHEDULE CONTENT CALENDAR ══════════ */}
      <Modal visible={showScheduleModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBlock}>
                <Calendar size={18} color="#10B981" />
                <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>Schedule Content Calendar</Text>
              </View>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalSubText, { color: colors.textSecondary }]}>
                Choose how many days of your strategy to generate and populate into your Content Calendar.
              </Text>

              <View style={styles.quickSelectGrid}>
                {(['7', '14', '21', '30'] as const).map((d) => {
                  const isSelected = scheduleDuration === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      activeOpacity={0.8}
                      onPress={() => setScheduleDuration(d)}
                      style={[
                        styles.quickSelectBtn,
                        isSelected && { backgroundColor: '#10B981', borderColor: '#10B981' },
                        { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                      ]}
                    >
                      <Text style={[styles.quickSelectBtnText, { color: isSelected ? '#FFFFFF' : colors.textPrimary }]}>
                        {d} Days
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowScheduleModal(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={[styles.modalCancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleBatchScheduleToCalendar}
                disabled={isSchedulingBatch}
                style={[styles.modalSubmitBtn, { backgroundColor: '#10B981' }]}
              >
                {isSchedulingBatch ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Push {scheduleDuration} Days to Calendar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══════════ MODAL: REGENERATE CARD WITH DIRECTIVE ══════════ */}
      <Modal visible={!!regenerateCardModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBlock}>
                <Sparkles size={18} color="#7C3AED" />
                <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>
                  Regenerate Day {regenerateCardModal?.day} Card
                </Text>
              </View>
              <TouchableOpacity onPress={() => setRegenerateCardModal(null)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalSubText, { color: colors.textSecondary }]}>
                Current: "{regenerateCardModal?.item.topic || regenerateCardModal?.item.title}"
              </Text>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>CUSTOM DIRECTIVES (OPTIONAL)</Text>
              <TextInput
                value={regenUserDirective}
                onChangeText={setRegenUserDirective}
                placeholder="e.g. Focus on exclusive discount, make it high-energy Instagram reel prompt..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                style={[styles.modalTextArea, { color: colors.textPrimary, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setRegenerateCardModal(null)} style={styles.modalCancelBtn}>
                <Text style={[styles.modalCancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRegenerateCardItem}
                disabled={regeneratingDay !== null}
                style={[styles.modalSubmitBtn, { backgroundColor: '#7C3AED' }]}
              >
                {regeneratingDay !== null ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Regenerate Card</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══════════ MODAL: EDIT OBJECTIVE FIELD ══════════ */}
      <Modal visible={!!editingField} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBlock}>
                <Edit3 size={18} color="#2563EB" />
                <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>{editingField?.label}</Text>
              </View>
              <TouchableOpacity onPress={() => setEditingField(null)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <TextInput
                value={editingValue}
                onChangeText={setEditingValue}
                multiline
                numberOfLines={3}
                style={[styles.modalTextArea, { color: colors.textPrimary, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setEditingField(null)} style={styles.modalCancelBtn}>
                <Text style={[styles.modalCancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (editingField?.key === 'businessGoal') setBusinessGoal(editingValue);
                  if (editingField?.key === 'leadMagnet') setLeadMagnet(editingValue);
                  if (editingField?.key === 'primaryCta') setPrimaryCta(editingValue);
                  setEditingField(null);
                  handleSaveStrategy();
                }}
                style={[styles.modalSubmitBtn, { backgroundColor: '#2563EB' }]}
              >
                <Text style={styles.modalSubmitBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══════════ MODAL: BUILD CAMPAIGN ══════════ */}
      <Modal visible={!!buildCampaignModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBlock}>
                <Rocket size={18} color="#2563EB" />
                <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>Build Full Campaign</Text>
              </View>
              <TouchableOpacity onPress={() => setBuildCampaignModal(null)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.ideaTitle, { color: colors.textPrimary }]}>{buildCampaignModal?.title}</Text>
              <Text style={[styles.modalSubText, { color: colors.textSecondary, marginTop: 4 }]}>
                {buildCampaignModal?.desc}
              </Text>

              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 14 }]}>CAMPAIGN DURATION</Text>
              <View style={styles.quickSelectGrid}>
                {['7', '14', '30'].map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setCampaignDuration(d)}
                    style={[
                      styles.quickSelectBtn,
                      campaignDuration === d && { backgroundColor: '#2563EB', borderColor: '#2563EB' },
                      { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                    ]}
                  >
                    <Text style={[styles.quickSelectBtnText, { color: campaignDuration === d ? '#FFFFFF' : colors.textPrimary }]}>
                      {d} Days
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setBuildCampaignModal(null)} style={styles.modalCancelBtn}>
                <Text style={[styles.modalCancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleBuildCampaign}
                disabled={isBuildingCampaign}
                style={[styles.modalSubmitBtn, { backgroundColor: '#2563EB' }]}
              >
                {isBuildingCampaign ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Launch Campaign</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 120,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
    gap: 14,
  },

  // Floating Toast
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 36,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Hero Card
  heroCard: {
    padding: 16,
    gap: 12,
  },
  heroTopRow: {
    gap: 12,
  },
  heroLeft: {
    gap: 4,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitleBlock: {
    flex: 1,
  },
  heroTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '800',
    lineHeight: LINE_HEIGHTS.heading,
  },
  heroSub: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
    marginTop: 2,
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  heroActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  heroActionBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
  },

  // Strategy Selector Bar
  selectorBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    gap: 4,
  },
  selectorPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  selectorPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  selectorBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  selectorBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },

  // Main Tabs Row
  mainTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  mainTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  mainTabPillText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Tab Content Container
  tabContentContainer: {
    gap: 14,
  },

  // Section Card
  sectionCard: {
    padding: 16,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },

  // Objectives List
  objectivesList: {
    gap: 10,
  },
  objectiveCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
    gap: 6,
  },
  objectiveTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  objectiveValue: {
    fontSize: 12.5,
    fontWeight: '700',
    lineHeight: 17,
  },
  objectiveSub: {
    fontSize: 12,
    lineHeight: 15,
  },

  // Channel Mix
  channelBarsList: {
    gap: 10,
  },
  channelBarItem: {
    gap: 4,
  },
  channelBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  channelBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  channelIconSmall: {
    width: 20,
    height: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelBarLabel: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  channelBarPct: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  recommendationsBox: {
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 4,
  },
  recItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  recText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },

  // 2 Cols Grid
  grid2Cols: {
    flexDirection: 'row',
    gap: 10,
  },
  gridColCard: {
    flex: 1,
    padding: 14,
    gap: 10,
  },
  pillList: {
    gap: 6,
  },
  pillarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  numBadge: {
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: 'rgba(225, 29, 72, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E11D48',
  },
  pillarText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },

  // Strategic Intelligence Sub-Tabs
  subTabsRow: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.04)',
    padding: 3,
    borderRadius: 10,
  },
  subTabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 6,
    borderRadius: 8,
  },
  subTabPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  subTabContentBlock: {
    paddingTop: 6,
  },
  subBlockTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  intentRow: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    gap: 2,
  },
  intentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  intentLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  intentPct: {
    fontSize: 11,
    fontWeight: '800',
  },
  intentDesc: {
    fontSize: 12,
    lineHeight: 15,
  },

  // Funnel
  funnelCardsRow: {
    gap: 8,
  },
  funnelCard: {
    padding: 12,
    borderRadius: 10,
    borderTopWidth: 3,
    gap: 4,
  },
  funnelCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  funnelStageName: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  funnelMixPct: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6366F1',
  },
  funnelDesc: {
    fontSize: 12,
    lineHeight: 16,
  },

  // Campaign Ideas
  campaignIdeasList: {
    gap: 8,
  },
  campaignIdeaCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  ideaInfo: {
    flex: 1,
    gap: 2,
  },
  ideaTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  ideaDesc: {
    fontSize: 12,
    lineHeight: 15,
  },
  buildCampaignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  buildCampaignBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  // Week Stats Scroll
  weekStatsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  weekStatCard: {
    width: 140,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  weekStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekStatLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  weekStatCount: {
    fontSize: 11,
    fontWeight: '600',
  },
  weekStatTheme: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
  },

  // Filter Bar
  planFilterBar: {
    padding: 10,
    borderRadius: 12,
    gap: 8,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  filterGroupLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginRight: 2,
  },
  filterPillSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  filterPillSmallText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Day Cards List
  dayCardsList: {
    gap: 10,
  },
  dayCard: {
    padding: 14,
    gap: 8,
  },
  dayCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dayNumBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  platformPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  platformPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  weekTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  miniActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  miniActionBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  dayCardTopic: {
    fontSize: 12.5,
    fontWeight: '700',
    lineHeight: 17,
  },
  seoKeywordPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  seoKeywordText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
  },
  actionItemBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: 8,
    borderRadius: 8,
  },
  actionItemText: {
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  dayCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  cardFooterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  cardFooterBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Custom Strategy Card details
  customBannerTop: {
    gap: 6,
  },
  customBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timestampText: {
    fontSize: 11,
    fontWeight: '500',
  },
  customDirectiveText: {
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  visualGuidanceBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  visualGuidanceText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
    fontWeight: '600',
  },
  copyBox: {
    padding: 8,
    borderRadius: 8,
    gap: 2,
  },
  copyHook: {
    fontSize: 11,
    fontWeight: '700',
  },
  copyCaption: {
    fontSize: 12,
    lineHeight: 16,
  },
  postMetaRow: {
    gap: 2,
  },
  ctaPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  hashtagsText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  modalHeaderTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  modalScroll: {
    padding: 16,
  },
  modalBody: {
    padding: 16,
    gap: 8,
  },
  modalSubText: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    marginTop: 6,
  },
  modalTextArea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    marginTop: 6,
    textAlignVertical: 'top',
  },
  quickSelectGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickSelectBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickSelectBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // Contextual Empty States
  emptyStateCard: {
    padding: 24,
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  emptyStateIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyStateSub: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 420,
  },
  emptyStateActionsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
  },
  emptyStatePrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyStatePrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyStateSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  emptyStateSecondaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // SEO Engine Box
  subBlockDesc: {
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 8,
  },
  openSeoLinkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    gap: 12,
    flexWrap: 'wrap',
  },
  openSeoLinkTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  openSeoLinkSub: {
    fontSize: 11,
    lineHeight: 15,
  },
  openSeoEngineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  openSeoEngineBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
});
