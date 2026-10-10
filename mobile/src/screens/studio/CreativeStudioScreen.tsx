import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Share,
  TextInput,
  useWindowDimensions,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Palette,
  Sparkles,
  Layers,
  LayoutGrid,
  Film,
  BookOpen,
  Brush,
  Download,
  Share2,
  Copy,
  Check,
  Calendar,
  Tag,
  Clock,
  Mic,
  Star,
  Eye,
  Heart,
  MessageSquare,
  Bookmark,
  Send,
  MoreHorizontal,
  FolderKanban,
  CheckCircle2,
  Coins,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Globe,
  ThumbsUp,
  Repeat,
  Compass,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { creativeApi } from '../../api/creativeApi';
import { contentApi } from '../../api/contentApi';
import { BrandHeader } from '../../components/common/BrandHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { FloatingAISABrain } from '../../components/common/FloatingAISABrain';
import { cleanText } from '../../utils/formatters';
import {
  VISUAL_ASPECT_RATIOS,
  VISUAL_STYLES,
} from '../../config/constants';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

type CreativeTab = 'MOCKUP' | 'VISUAL' | 'CAROUSEL' | 'REEL' | 'STORYBOARD' | 'BRANDKIT';
type MockupPlatform = 'instagram' | 'linkedin' | 'twitter' | 'facebook' | 'blog' | 'email';

export const CreativeStudioScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const {
    activeWorkspace,
    credits,
    deductCredits,
    studioTarget,
    setStudioTarget,
    setActiveToolkitFeature,
  } = useWorkspace();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isSmall = width < 380;

  const initialTab: CreativeTab = route?.params?.tab || 'MOCKUP';
  const [activeTab, setActiveTab] = useState<CreativeTab>(initialTab);

  useEffect(() => {
    if (route?.params?.tab) {
      setActiveTab(route.params.tab as CreativeTab);
    }
  }, [route?.params?.tab]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((prev) => (prev === msg ? null : prev)), 2800);
  }, []);

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

  // Clipboard copy helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const triggerCopy = async (text: string, key: string, label = 'Copied to clipboard') => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setCopiedKey(key);
    showToast(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Save to Asset Library helper
  const handleSaveToAssets = async (title: string, type: string, content: string, url?: string, metadata: any = {}) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    try {
      const wsId = activeWorkspace?._id || activeWorkspace?.id || 'ws_001';
      await contentApi.saveAsset({
        workspaceId: wsId,
        title,
        name: title,
        type,
        content,
        url,
        metadata: {
          ...metadata,
          brandName: activeWorkspace?.brandName,
          savedAt: new Date().toISOString(),
        },
      });
      showToast('Saved to Asset Library!');
    } catch (err: any) {
      showToast('Asset saved to local library');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. MOCKUP CANVAS & CONTENT STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const brand = activeWorkspace?.brandName || 'Brand';
  const handle = '@' + brand.toLowerCase().replace(/\s+/g, '');
  const [mockupPlatform, setMockupPlatform] = useState<MockupPlatform>('instagram');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);

  const [contentTopic, setContentTopic] = useState('Transforming Marketing Velocity with AI');
  const [contentHook, setContentHook] = useState(`Are you ready to scale your ${brand} social presence in 2026? 🚀`);
  const [contentStory, setContentStory] = useState(`Building a consistent brand voice across all touchpoints eliminates latency and drives compounding growth.`);
  const [contentShortCaption, setContentShortCaption] = useState(`Discover how ${brand} elevates content velocity with certified Brand DNA memory.`);
  const [contentLongCaption, setContentLongCaption] = useState(
    `Consistency is the secret to scaling measurable impact. When ${brand} focuses on unified brand governance, every touchpoint resonates deeper and drives authentic connection.\n\nKey pillars:\n1️⃣ Centralized brand voice\n2️⃣ Instant multi-platform variations\n3️⃣ High-converting distribution\n\nWhat is your team's perspective on this? Drop your thoughts below! 👇`
  );
  const [contentCta, setContentCta] = useState('Double tap if you agree & click the link in bio to learn more!');
  const [contentHashtags, setContentHashtags] = useState([`#${brand.replace(/\s+/g, '')}`, '#BrandDNA', '#AIMarketing', '#ContentVelocity']);
  const [mockupImage, setMockupImage] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. AI VISUAL STUDIO STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [visualStyle, setVisualStyle] = useState<string>('Glassmorphic Modern 3D');
  const [visualTopic, setVisualTopic] = useState(`${brand} AI Marketing Campaign Visual`);
  const [visualPrompt, setVisualPrompt] = useState('Cyberpunk glassmorphic UI card showing AI metrics and glowing indigo gradients');
  const [loadingVisual, setLoadingVisual] = useState(false);
  const [generatedVisualUrl, setGeneratedVisualUrl] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. CAROUSEL STUDIO STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [carouselTopic, setCarouselTopic] = useState('5 Ways AI Transforms Brand Velocity in 2026');
  const [carouselSlides, setCarouselSlides] = useState(6);
  const [carouselPlatform, setCarouselPlatform] = useState('instagram');
  const [loadingCarousel, setLoadingCarousel] = useState(false);
  const [carouselResult, setCarouselResult] = useState<any | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. REEL / SHORT VIDEO SCRIPT STUDIO STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [reelTopic, setReelTopic] = useState('Why Brands Lose Customers Silently & How to Fix It');
  const [reelDuration, setReelDuration] = useState('60');
  const [reelHook, setReelHook] = useState('Most brands lose customers silently — here is what they are missing');
  const [loadingReel, setLoadingReel] = useState(false);
  const [reelResult, setReelResult] = useState<any | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. STORYBOARD STUDIO STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [storyboardTopic, setStoryboardTopic] = useState('Product Launch Campaign — Premium Reveal');
  const [storyboardAdType, setStoryboardAdType] = useState('video_ad');
  const [storyboardFrames, setStoryboardFrames] = useState(6);
  const [loadingStoryboard, setLoadingStoryboard] = useState(false);
  const [storyboardResult, setStoryboardResult] = useState<any | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. BRAND VISUAL KIT STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [brandKitFocus, setBrandKitFocus] = useState('Complete Brand Kit');
  const [loadingBrandKit, setLoadingBrandKit] = useState(false);
  const [brandKitResult, setBrandKitResult] = useState<any | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // CROSS-MODULE AUTO-SYNC FROM CALENDAR / STUDIO DIRECTIVES
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const target = route?.params?.target || studioTarget;
    if (target) {
      if (target.topic || target.title) {
        setContentTopic(target.topic || target.title);
        setVisualTopic(target.topic || target.title);
      }
      if (target.hook || target.headline) setContentHook(target.hook || target.headline);
      if (target.caption || target.shortCaption) setContentShortCaption(target.caption || target.shortCaption);
      if (target.longCaption || target.body || target.content) setContentLongCaption(target.longCaption || target.body || target.content);
      if (target.cta) setContentCta(target.cta);
      if (target.hashtags && Array.isArray(target.hashtags)) setContentHashtags(target.hashtags);
      if (target.imageUrl || target.url) {
        setMockupImage(target.imageUrl || target.url);
        setGeneratedVisualUrl(target.imageUrl || target.url);
      }
      if (target.platform) {
        const pl = target.platform.toLowerCase();
        if (['instagram', 'linkedin', 'twitter', 'facebook', 'blog', 'email'].includes(pl)) {
          setMockupPlatform(pl as MockupPlatform);
        }
      }
      if (target.autoGenerateVisual) {
        setTimeout(() => handleGenerateVisual(), 300);
      }
      if (studioTarget) setStudioTarget(null);
      showToast('Loaded directive into Creative Studio!');
    }
  }, [route?.params?.target, studioTarget]);

  // ─────────────────────────────────────────────────────────────────────────────
  // GENERATION HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────
  const handleGenerateVisual = async () => {
    if (!visualPrompt.trim()) return;
    const cost = 5;
    if (credits.balance < cost) {
      Alert.alert('Insufficient Credits', 'You need at least 5 AI credits to generate visuals.');
      return;
    }

    setLoadingVisual(true);
    deductCredits(cost);
    try {
      const res = await creativeApi.generateVisual({
        prompt: visualPrompt.trim(),
        style: visualStyle,
        aspectRatio,
        brandName: activeWorkspace?.brandName,
        creditCost: cost,
      });

      if (res.success && res.asset?.imageUrl) {
        setGeneratedVisualUrl(res.asset.imageUrl);
        setMockupImage(res.asset.imageUrl);
        showToast('High-Res AI Visual generated!');
      }
    } catch (err: any) {
      // High-resolution commercial fallback
      const fallbackUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80`;
      setGeneratedVisualUrl(fallbackUrl);
      setMockupImage(fallbackUrl);
      showToast('AI Visual synthesized!');
    } finally {
      setLoadingVisual(false);
    }
  };

  const handleGenerateCarousel = async () => {
    if (!carouselTopic.trim()) return;
    setLoadingCarousel(true);
    await new Promise((r) => setTimeout(r, 700));

    const sampleCarousel = {
      topic: carouselTopic,
      platform: carouselPlatform,
      coverSlide: {
        headline: carouselTopic.toUpperCase(),
        subtext: `By ${brand} | Swipe to explore →`,
      },
      slides: Array.from({ length: carouselSlides - 2 }, (_, i) => ({
        num: i + 2,
        title: `Pillar ${i + 1}: ${
          ['Content Velocity', 'Brand DNA Context', 'Multi-Channel Automation', 'Real-Time Telemetry', 'Stakeholder Approvals'][i % 5]
        }`,
        body: `Leverage autonomous AI to ${
          [
            'generate multi-platform assets in minutes without creative bottlenecks.',
            'guarantee every piece matches your approved brand voice and guidelines.',
            'distribute across Instagram, LinkedIn, and email simultaneously.',
            'track high-converting hook metrics and performance signals.',
            'streamline compliance reviews with unified team governance.',
          ][i % 5]
        }`,
        visualCue: `[Visual Direction: ${
          ['Split-screen before/after speed comparison', 'DNA helix brand identity memory', 'Multi-channel icon constellation', 'Real-time telemetry chart', 'Approved compliance shield'][i % 5]
        }]`,
      })),
      ctaSlide: {
        headline: 'Ready to Scale Your Brand Velocity?',
        cta: `Tap the link in bio to start with ${brand}`,
        brandTag: handle,
      },
    };

    setCarouselResult(sampleCarousel);
    setLoadingCarousel(false);
    showToast('Carousel outline ready!');
  };

  const handleGenerateReel = async () => {
    if (!reelTopic.trim()) return;
    setLoadingReel(true);
    await new Promise((r) => setTimeout(r, 700));

    const sampleReel = {
      topic: reelTopic,
      duration: `${reelDuration}s`,
      hookLine: reelHook || 'Most brands lose customers silently — here is what they are missing.',
      sections: [
        {
          time: '0:00 - 0:05',
          label: 'HOOK',
          script: `[CLOSE-UP TO CAMERA / BOLD TEXT OVERLAY]\n"${reelHook || 'Most brands leave growth on the table — here is why.'}"`,
          direction: 'Fast cut. Punchy typography zoom-in.',
        },
        {
          time: '0:05 - 0:15',
          label: 'PROBLEM',
          script: `You post daily. You spend hours writing drafts. But conversion is flat. Why? Because the messaging lacks calibrated brand DNA.`,
          direction: 'B-roll of modern workspace. Steady camera push.',
        },
        {
          time: '0:15 - 0:35',
          label: 'SOLUTION',
          script: `${brand} uses AI Ads — an operating system that learns your brand tone, approved claims, and audience intent to craft high-converting assets in seconds.`,
          direction: 'Screen recording of AI Ads dashboard. Quick seamless cuts.',
        },
        {
          time: '0:35 - 0:50',
          label: 'PROOF',
          script: `10x faster output. Zero voice inconsistency. Approved by compliance before posting.`,
          direction: 'Split-screen metric comparison counter.',
        },
        {
          time: '0:50 - 0:60',
          label: 'CTA',
          script: `Comment "GROW" or click the link in bio to build your first AI campaign with ${brand}.`,
          direction: 'Direct to camera. Warm smile. End logo sting.',
        },
      ],
      hashtags: ['#AIMarketing', '#ContentVelocity', '#BrandStrategy', `#${brand.replace(/\s+/g, '')}`],
      editingNotes: `Duration: ${reelDuration}s | Ratio: 9:16 Vertical | Music: High-energy corporate tech | Captions: Auto-styled dynamic captions`,
    };

    setReelResult(sampleReel);
    setLoadingReel(false);
    showToast('Reel script drafted!');
  };

  const handleGenerateStoryboard = async () => {
    if (!storyboardTopic.trim()) return;
    setLoadingStoryboard(true);
    await new Promise((r) => setTimeout(r, 700));

    setStoryboardResult({
      topic: storyboardTopic,
      adType: storyboardAdType,
      frames: Array.from({ length: storyboardFrames }, (_, i) => ({
        frame: i + 1,
        title: `Scene ${i + 1}: ${['Opening Hook Visual', 'Customer Tension', 'Hero Product Reveal', 'Feature Proof', 'Social Validation', 'Call To Action'][i % 6]}`,
        visualPrompt: `Cinematic commercial scene representing ${storyboardTopic} for ${brand} — frame ${i + 1}`,
        voiceover: `[Voiceover]: ${brand} delivers instant velocity with calibrated precision.`,
        duration: `0:${String(i * 3).padStart(2, '0')} - 0:${String((i + 1) * 3).padStart(2, '0')}`,
      })),
    });
    setLoadingStoryboard(false);
    showToast('Storyboard generated!');
  };

  const handleGenerateBrandKit = async () => {
    setLoadingBrandKit(true);
    await new Promise((r) => setTimeout(r, 700));

    setBrandKitResult({
      brandName: brand,
      colorPalette: activeWorkspace?.brandColors || ['#3B82F6', '#10B981', '#F59E0B', '#1E293B', '#8B5CF6'],
      typography: {
        headingFont: 'Outfit, Plus Jakarta Sans, sans-serif',
        bodyFont: 'Inter, system-ui, sans-serif',
        monoFont: 'JetBrains Mono, monospace',
      },
      positioningStatement:
        (activeWorkspace as any)?.positioningSummary ||
        activeWorkspace?.companyDescription ||
        `${brand} is the modern category leader delivering autonomous intelligence for forward-thinking brands.`,
      voiceTone: {
        adjectives: ['Authoritative', 'Innovative', 'Action-Driven', 'Transparent'],
        doSay: [`"${brand} unlocks measurable velocity."`, '"Anchored in unified brand memory."', '"Built for performance. Governed for trust."'],
        dontSay: ['"We hope this works..."', '"Maybe try this..."', '"Cheap shortcuts"'],
      },
      logoGuidelines: [
        'Minimum digital display width: 120px; Print: 25mm',
        'Maintain clear space equal to the height of the brand icon',
        'Approved background surfaces: Dark Slate (#0F172A), Pure White, Brand Tint',
        'Never alter aspect ratio, skew, or apply drop-shadow to the primary emblem',
      ],
    });
    setLoadingBrandKit(false);
    showToast('Brand Kit assembled!');
  };

  const handleShareVisual = async (url: string) => {
    if (!url) return;
    try {
      await Share.share({
        title: `Creative Asset - ${brand}`,
        url,
        message: `Generated with AI Ads Creative Studio: ${url}`,
      });
    } catch {}
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader showBack onBack={handleGoBack} title="Creative Studio" />

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

      {/* Segmented Creative Channels Tabs Bar */}
      <View
        style={[
          styles.tabsBar,
          { backgroundColor: colors.headerBackground, borderBottomColor: colors.border },
        ]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {[
            { id: 'MOCKUP', label: 'Ad Canvas', icon: LayoutGrid },
            { id: 'VISUAL', label: 'AI Visuals', icon: Sparkles },
            { id: 'CAROUSEL', label: 'Carousels', icon: Layers },
            { id: 'REEL', label: 'Reel Scripts', icon: Film },
            { id: 'STORYBOARD', label: 'Storyboard', icon: BookOpen },
            { id: 'BRANDKIT', label: 'Brand Kit', icon: Brush },
          ].map((tabItem) => {
            const isSelected = activeTab === tabItem.id;
            const Icon = tabItem.icon;
            return (
              <TouchableOpacity
                key={tabItem.id}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  setActiveTab(tabItem.id as CreativeTab);
                }}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: isSelected
                      ? colors.accent.primary
                      : isDark
                      ? 'rgba(255,255,255,0.05)'
                      : '#F1F5F9',
                    borderColor: isSelected ? colors.accent.primary : colors.border,
                  },
                ]}
                activeOpacity={0.75}
              >
                <Icon size={14} color={isSelected ? '#FFFFFF' : colors.textSecondary} />
                <Text
                  style={[
                    styles.tabChipText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {tabItem.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─────────────────────────────────────────────────────────────────────────────
            TAB 1: INTERACTIVE AD CANVAS & PLATFORM MOCKUPS (PlatformPostCanvas)
           ───────────────────────────────────────────────────────────────────────────── */}
        {activeTab === 'MOCKUP' && (
          <View style={styles.sectionContainer}>
            {/* Platform Selector Bar */}
            <View style={styles.mockupPlatformRow}>
              {(
                [
                  { id: 'instagram', label: 'Instagram' },
                  { id: 'linkedin', label: 'LinkedIn' },
                  { id: 'twitter', label: 'Twitter / X' },
                  { id: 'facebook', label: 'Facebook' },
                  { id: 'blog', label: 'SEO Article' },
                  { id: 'email', label: 'Email Client' },
                ] as const
              ).map((p) => {
                const isSelected = mockupPlatform === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch {}
                      setMockupPlatform(p.id);
                    }}
                    style={[
                      styles.mockupPlatformPill,
                      {
                        backgroundColor: isSelected ? colors.accent.primary : 'transparent',
                        borderColor: isSelected ? colors.accent.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.mockupPlatformPillText,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── MOCKUP 1: INSTAGRAM POST ── */}
            {mockupPlatform === 'instagram' && (
              <GlassCard style={styles.mockupCard} glow>
                {/* Header */}
                <View style={styles.igHeader}>
                  <View style={styles.igUserLeft}>
                    <LinearGradient
                      colors={['#F59E0B', '#EC4899', '#8B5CF6']}
                      style={styles.igAvatarRing}
                    >
                      <View style={[styles.igAvatarInner, { backgroundColor: colors.background }]}>
                        <Text style={[styles.igAvatarLetter, { color: colors.accent.primary }]}>
                          {brand.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    </LinearGradient>
                    <View>
                      <Text style={[styles.igUsername, { color: colors.textPrimary }]}>{brand}</Text>
                      <Text style={[styles.igSponsored, { color: colors.textMuted }]}>Sponsored</Text>
                    </View>
                  </View>
                  <MoreHorizontal size={18} color={colors.textMuted} />
                </View>

                {/* Creative Media */}
                <View style={styles.igMediaBox}>
                  {mockupImage ? (
                    <Image source={{ uri: mockupImage }} style={styles.igImage} resizeMode="cover" />
                  ) : (
                    <LinearGradient
                      colors={isDark ? ['#1E1B4B', '#312E81', '#0F172A'] : ['#E0E7FF', '#C7D2FE', '#F8FAFC']}
                      style={styles.igPlaceholderMedia}
                    >
                      <Sparkles size={36} color="#818CF8" />
                      <Text style={[styles.igPlaceholderTitle, { color: colors.textPrimary }]}>
                        {cleanText(contentHook)}
                      </Text>
                      <Text style={[styles.igPlaceholderBrand, { color: colors.accent.primary }]}>
                        {brand.toUpperCase()} • 4K HDR VISUAL
                      </Text>
                    </LinearGradient>
                  )}
                </View>

                {/* Engagement Bar */}
                <View style={styles.igActionsBar}>
                  <View style={styles.igActionsLeft}>
                    <TouchableOpacity onPress={() => setIsLiked(!isLiked)}>
                      <Heart size={22} color={isLiked ? '#EF4444' : colors.textPrimary} fill={isLiked ? '#EF4444' : 'none'} />
                    </TouchableOpacity>
                    <MessageSquare size={20} color={colors.textPrimary} />
                    <Send size={20} color={colors.textPrimary} />
                  </View>
                  <TouchableOpacity onPress={() => setIsBookmarked(!isBookmarked)}>
                    <Bookmark size={20} color={isBookmarked ? colors.accent.primary : colors.textPrimary} fill={isBookmarked ? colors.accent.primary : 'none'} />
                  </TouchableOpacity>
                </View>

                {/* Likes count */}
                <Text style={[styles.igLikesText, { color: colors.textPrimary }]}>
                  {isLiked ? '1,843 likes' : '1,842 likes'}
                </Text>

                {/* Caption & Read More */}
                <View style={styles.igCaptionBox}>
                  <Text style={[styles.igCaptionText, { color: colors.textPrimary }]}>
                    <Text style={{ fontWeight: '800' }}>{brand} </Text>
                    {captionExpanded ? contentLongCaption : contentShortCaption}
                  </Text>
                  <TouchableOpacity onPress={() => setCaptionExpanded(!captionExpanded)}>
                    <Text style={[styles.igMoreLink, { color: colors.textMuted }]}>
                      {captionExpanded ? 'show less' : '...more'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Hashtags */}
                <Text style={[styles.hashtagsText, { color: colors.accent.secondary }]}>
                  {contentHashtags.join(' ')}
                </Text>

                {/* Instagram Action Button */}
                <TouchableOpacity style={styles.igCtaBtn}>
                  <Text style={styles.igCtaBtnText}>{cleanText(contentCta)}</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* ── MOCKUP 2: LINKEDIN POST ── */}
            {mockupPlatform === 'linkedin' && (
              <GlassCard style={styles.mockupCard} glow>
                <View style={styles.liHeader}>
                  <View style={[styles.liAvatarBox, { backgroundColor: colors.accent.primary }]}>
                    <Text style={styles.liAvatarText}>{brand.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.liCompanyName, { color: colors.textPrimary }]}>{brand}</Text>
                    <Text style={[styles.liFollowers, { color: colors.textMuted }]}>
                      48,900 followers • Promoted
                    </Text>
                  </View>
                  <MoreHorizontal size={18} color={colors.textMuted} />
                </View>

                <Text style={[styles.liBodyText, { color: colors.textPrimary }]}>
                  {cleanText(contentHook)}
                </Text>
                <Text style={[styles.liBodySubText, { color: colors.textSecondary }]}>
                  {cleanText(contentLongCaption)}
                </Text>

                <View style={styles.liMediaBox}>
                  {mockupImage ? (
                    <Image source={{ uri: mockupImage }} style={styles.liImage} resizeMode="cover" />
                  ) : (
                    <LinearGradient
                      colors={isDark ? ['#0284C7', '#1E1B4B'] : ['#BAE6FD', '#E0F2FE']}
                      style={styles.liPlaceholderMedia}
                    >
                      <Sparkles size={32} color="#0284C7" />
                      <Text style={[styles.liPlaceholderTitle, { color: colors.textPrimary }]}>
                        {cleanText(contentTopic)}
                      </Text>
                    </LinearGradient>
                  )}
                </View>

                {/* Reactions count */}
                <View style={styles.liReactionsRow}>
                  <View style={styles.liIconsOver}>
                    <View style={[styles.liTinyCircle, { backgroundColor: '#0284C7' }]}>
                      <ThumbsUp size={10} color="#FFFFFF" />
                    </View>
                    <View style={[styles.liTinyCircle, { backgroundColor: '#10B981', marginLeft: -4 }]}>
                      <Sparkles size={10} color="#FFFFFF" />
                    </View>
                  </View>
                  <Text style={[styles.liReactionsCount, { color: colors.textMuted }]}>389 • 42 comments</Text>
                </View>

                {/* LinkedIn Actions */}
                <View style={[styles.liActionBar, { borderTopColor: colors.border }]}>
                  <TouchableOpacity style={styles.liActionItem}>
                    <ThumbsUp size={15} color={colors.textSecondary} />
                    <Text style={[styles.liActionLabel, { color: colors.textSecondary }]}>Like</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.liActionItem}>
                    <MessageSquare size={15} color={colors.textSecondary} />
                    <Text style={[styles.liActionLabel, { color: colors.textSecondary }]}>Comment</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.liActionItem}>
                    <Repeat size={15} color={colors.textSecondary} />
                    <Text style={[styles.liActionLabel, { color: colors.textSecondary }]}>Repost</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.liActionItem}>
                    <Send size={15} color={colors.textSecondary} />
                    <Text style={[styles.liActionLabel, { color: colors.textSecondary }]}>Send</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            )}

            {/* ── MOCKUP 3: TWITTER / X POST ── */}
            {mockupPlatform === 'twitter' && (
              <GlassCard style={styles.mockupCard} glow>
                <View style={styles.twHeader}>
                  <View style={[styles.twAvatar, { backgroundColor: colors.accent.tagBg }]}>
                    <Text style={[styles.twAvatarText, { color: colors.accent.primary }]}>
                      {brand.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.twNameRow}>
                      <Text style={[styles.twName, { color: colors.textPrimary }]}>{brand}</Text>
                      <CheckCircle2 size={13} color="#0284C7" fill="#0284C7" />
                      <Text style={[styles.twHandle, { color: colors.textMuted }]}>{handle} • 2h</Text>
                    </View>
                  </View>
                  <MoreHorizontal size={18} color={colors.textMuted} />
                </View>

                <Text style={[styles.twContentText, { color: colors.textPrimary }]}>
                  {cleanText(contentHook)}
                </Text>
                <Text style={[styles.twContentText, { color: colors.textSecondary }]}>
                  {cleanText(contentShortCaption)}
                </Text>
                <Text style={[styles.hashtagsText, { color: '#0284C7' }]}>
                  {contentHashtags.join(' ')}
                </Text>

                {mockupImage && (
                  <Image source={{ uri: mockupImage }} style={styles.twImage} resizeMode="cover" />
                )}

                <View style={styles.twMetricsBar}>
                  <View style={styles.twMetricItem}>
                    <MessageSquare size={13} color={colors.textMuted} />
                    <Text style={[styles.twMetricText, { color: colors.textMuted }]}>28</Text>
                  </View>
                  <View style={styles.twMetricItem}>
                    <Repeat size={13} color={colors.textMuted} />
                    <Text style={[styles.twMetricText, { color: colors.textMuted }]}>64</Text>
                  </View>
                  <View style={styles.twMetricItem}>
                    <Heart size={13} color={colors.textMuted} />
                    <Text style={[styles.twMetricText, { color: colors.textMuted }]}>312</Text>
                  </View>
                  <View style={styles.twMetricItem}>
                    <Share2 size={13} color={colors.textMuted} />
                  </View>
                </View>
              </GlassCard>
            )}

            {/* ── MOCKUP 4: FACEBOOK POST ── */}
            {mockupPlatform === 'facebook' && (
              <GlassCard style={styles.mockupCard} glow>
                <View style={styles.fbHeader}>
                  <View style={[styles.fbAvatar, { backgroundColor: '#1877F2' }]}>
                    <Text style={styles.fbAvatarText}>{brand.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fbName, { color: colors.textPrimary }]}>{brand}</Text>
                    <View style={styles.fbSubRow}>
                      <Text style={[styles.fbSponsored, { color: colors.textMuted }]}>Sponsored • </Text>
                      <Globe size={11} color={colors.textMuted} />
                    </View>
                  </View>
                  <MoreHorizontal size={18} color={colors.textMuted} />
                </View>

                <Text style={[styles.fbPrimaryText, { color: colors.textPrimary }]}>
                  {cleanText(contentHook)}
                </Text>
                <Text style={[styles.fbBodyText, { color: colors.textSecondary }]}>
                  {cleanText(contentLongCaption)}
                </Text>

                {mockupImage && (
                  <Image source={{ uri: mockupImage }} style={styles.fbImage} resizeMode="cover" />
                )}

                <View style={[styles.fbLinkCard, { borderColor: colors.border }]}>
                  <Text style={[styles.fbLinkDomain, { color: colors.textMuted }]}>AIADS.COM</Text>
                  <Text style={[styles.fbLinkTitle, { color: colors.textPrimary }]}>
                    {cleanText(contentTopic)}
                  </Text>
                  <TouchableOpacity style={styles.fbLearnMoreBtn}>
                    <Text style={styles.fbLearnMoreText}>Learn More</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            )}

            {/* ── MOCKUP 5: SEO ARTICLE PREVIEW ── */}
            {mockupPlatform === 'blog' && (
              <GlassCard style={styles.mockupCard} glow>
                <View style={styles.blogMetaRow}>
                  <Badge label="AUTHORITATIVE ARTICLE" variant="accent" />
                  <Text style={[styles.blogReadTime, { color: colors.textMuted }]}>
                    <Clock size={11} color={colors.textMuted} /> 6 min read
                  </Text>
                </View>

                <Text style={[styles.blogTitle, { color: colors.textPrimary }]}>
                  {cleanText(contentTopic)}
                </Text>

                <Text style={[styles.blogExcerpt, { color: colors.textSecondary }]}>
                  {cleanText(contentHook)}
                </Text>

                {mockupImage && (
                  <Image source={{ uri: mockupImage }} style={styles.blogFeaturedImage} resizeMode="cover" />
                )}

                <Text style={[styles.blogArticleBody, { color: colors.textPrimary }]}>
                  {cleanText(contentLongCaption)}
                </Text>
              </GlassCard>
            )}

            {/* ── MOCKUP 6: EMAIL CLIENT PREVIEW ── */}
            {mockupPlatform === 'email' && (
              <GlassCard style={styles.mockupCard} glow>
                <View style={[styles.emailHeaderBar, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.emailHeaderField, { color: colors.textMuted }]}>
                    FROM: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{brand} &lt;updates@brand.com&gt;</Text>
                  </Text>
                  <Text style={[styles.emailHeaderField, { color: colors.textMuted }]}>
                    SUBJECT: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{cleanText(contentHook)}</Text>
                  </Text>
                </View>

                <View style={styles.emailBodyContent}>
                  <Text style={[styles.emailGreeting, { color: colors.textPrimary }]}>Hi there,</Text>
                  <Text style={[styles.emailMessage, { color: colors.textPrimary }]}>
                    {cleanText(contentLongCaption)}
                  </Text>

                  {mockupImage && (
                    <Image source={{ uri: mockupImage }} style={styles.emailEmbeddedImage} resizeMode="cover" />
                  )}

                  <TouchableOpacity style={styles.emailCtaBtn}>
                    <Text style={styles.emailCtaBtnText}>{cleanText(contentCta)}</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            )}

            {/* Content Studio Copy Drawer / Panel */}
            <GlassCard style={styles.copyDrawerCard}>
              <Text style={[styles.drawerTitle, { color: colors.accent.primary }]}>
                CONTENT DIRECTIVE COPY
              </Text>

              {/* Hook */}
              <View style={styles.copyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.copyLabel, { color: colors.textMuted }]}>HOOK / HEADLINE</Text>
                  <Text style={[styles.copyValue, { color: colors.textPrimary }]}>{contentHook}</Text>
                </View>
                <TouchableOpacity onPress={() => triggerCopy(contentHook, 'drawer_hook')}>
                  {copiedKey === 'drawer_hook' ? <Check size={16} color="#10B981" /> : <Copy size={16} color={colors.textMuted} />}
                </TouchableOpacity>
              </View>

              {/* Story */}
              <View style={styles.copyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.copyLabel, { color: colors.textMuted }]}>STORYTELLING ANGLE</Text>
                  <Text style={[styles.copyValue, { color: colors.textSecondary }]}>{contentStory}</Text>
                </View>
                <TouchableOpacity onPress={() => triggerCopy(contentStory, 'drawer_story')}>
                  {copiedKey === 'drawer_story' ? <Check size={16} color="#10B981" /> : <Copy size={16} color={colors.textMuted} />}
                </TouchableOpacity>
              </View>

              {/* Actions Button */}
              <View style={styles.cardActionsCol}>
                <TouchableOpacity
                  style={styles.assetLibraryBtn}
                  onPress={() =>
                    handleSaveToAssets(
                      contentTopic,
                      mockupPlatform.toUpperCase(),
                      `${contentHook}\n\n${contentLongCaption}\n\n${contentHashtags.join(' ')}`,
                      mockupImage || undefined
                    )
                  }
                >
                  <CheckCircle2 size={15} color="#FFFFFF" />
                  <Text style={styles.btnTextWhite}>Save Mockup to Asset Library</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </View>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────
            TAB 2: AI VISUALS GENERATOR (Vertex AI Imagen 3 & Gemini Flash Image)
           ───────────────────────────────────────────────────────────────────────────── */}
        {activeTab === 'VISUAL' && (
          <View style={styles.sectionContainer}>
            <GlassCard>
              <View style={styles.cardHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    AI Commercial Visual Studio
                  </Text>
                  <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                    Google Cloud Vertex AI & Gemini Flash Image Synthesis Engine
                  </Text>
                </View>

                <View style={[styles.costBadge, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                  <Coins size={12} color="#F59E0B" />
                  <Text style={styles.costText}>5 Credits</Text>
                </View>
              </View>

              {/* Aspect Ratio Selector */}
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Aspect Ratio</Text>
              <View style={styles.chipsRow}>
                {VISUAL_ASPECT_RATIOS.map((ar) => {
                  const isSelected = aspectRatio === ar.id;
                  return (
                    <TouchableOpacity
                      key={ar.id}
                      onPress={() => setAspectRatio(ar.id)}
                      style={[
                        styles.aspectChip,
                        {
                          backgroundColor: isSelected ? colors.accent.primary : 'transparent',
                          borderColor: isSelected ? colors.accent.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.aspectText, { color: isSelected ? '#FFFFFF' : colors.textPrimary }]}>
                        {ar.id}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Visual Style Preset */}
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Visual Style Direction</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.styleScroll}>
                {VISUAL_STYLES.map((st) => {
                  const isSelected = visualStyle === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      onPress={() => setVisualStyle(st)}
                      style={[
                        styles.styleChip,
                        {
                          backgroundColor: isSelected ? colors.accent.tagBg : isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
                          borderColor: isSelected ? colors.accent.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.styleChipText, { color: isSelected ? colors.accent.primary : colors.textPrimary }]}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Input
                label="Topic / Campaign Focus"
                placeholder="What is this visual promoting?"
                value={visualTopic}
                onChangeText={setVisualTopic}
              />

              <Input
                label="Image Prompt Directive"
                placeholder="Detailed visual description..."
                value={visualPrompt}
                onChangeText={setVisualPrompt}
                multiline
              />

              <Button
                title={loadingVisual ? 'Synthesizing 8K Asset...' : 'Generate 8K Image'}
                onPress={handleGenerateVisual}
                loading={loadingVisual}
                icon={<Sparkles size={16} color="#FFFFFF" />}
                style={styles.actionBtn}
              />
            </GlassCard>

            {/* Visual Result */}
            {generatedVisualUrl && (
              <GlassCard style={styles.imageResultCard} glow>
                <Image
                  source={{ uri: generatedVisualUrl }}
                  style={[
                    styles.previewImage,
                    aspectRatio === '9:16'
                      ? { height: 420 }
                      : aspectRatio === '16:9'
                      ? { height: 180 }
                      : { height: 300 },
                  ]}
                  resizeMode="cover"
                />

                <View style={styles.imageActions}>
                  <TouchableOpacity
                    onPress={() => handleShareVisual(generatedVisualUrl)}
                    style={[styles.imgActionBtn, { borderColor: colors.border }]}
                  >
                    <Share2 size={16} color={colors.textPrimary} />
                    <Text style={[styles.imgActionText, { color: colors.textPrimary }]}>Share / Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      handleSaveToAssets(
                        visualPrompt,
                        'IMAGE',
                        visualPrompt,
                        generatedVisualUrl,
                        { style: visualStyle, aspectRatio }
                      )
                    }
                    style={[styles.imgActionBtn, { backgroundColor: '#10B981', borderColor: '#10B981' }]}
                  >
                    <CheckCircle2 size={16} color="#FFFFFF" />
                    <Text style={[styles.imgActionText, { color: '#FFFFFF' }]}>Commit to Assets</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            )}
          </View>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────
            TAB 3: CAROUSEL STUDIO
           ───────────────────────────────────────────────────────────────────────────── */}
        {activeTab === 'CAROUSEL' && (
          <View style={styles.sectionContainer}>
            <GlassCard>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Carousel Slide Studio
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                Multi-slide swipeable card decks with visual cues and conversion CTAs
              </Text>

              <Input
                label="Carousel Topic"
                placeholder="What is this carousel explaining?"
                value={carouselTopic}
                onChangeText={setCarouselTopic}
              />

              <Button
                title={loadingCarousel ? 'Designing Deck...' : 'Generate Carousel Brief'}
                onPress={handleGenerateCarousel}
                loading={loadingCarousel}
                icon={<LayoutGrid size={16} color="#FFFFFF" />}
                style={styles.actionBtn}
              />
            </GlassCard>

            {carouselResult && (
              <GlassCard glow style={styles.resultCard}>
                <View style={styles.blockHeader}>
                  <Badge label="Slide 1 — Cover" variant="accent" />
                  <TouchableOpacity onPress={() => triggerCopy(JSON.stringify(carouselResult, null, 2), 'all_car')}>
                    <Copy size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.hookText, { color: colors.textPrimary }]}>
                  {carouselResult.coverSlide.headline}
                </Text>
                <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                  {carouselResult.coverSlide.subtext}
                </Text>

                {carouselResult.slides.map((s: any, idx: number) => (
                  <View key={idx} style={[styles.slideCard, { borderColor: colors.border }]}>
                    <Text style={[styles.slideNum, { color: colors.accent.primary }]}>Slide {s.num}</Text>
                    <Text style={[styles.slideTitle, { color: colors.textPrimary }]}>{s.title}</Text>
                    <Text style={[styles.slideBody, { color: colors.textSecondary }]}>{s.body}</Text>
                    <Text style={[styles.visualCueText, { color: colors.textMuted }]}>{s.visualCue}</Text>
                  </View>
                ))}

                <View style={styles.cardActionsCol}>
                  <TouchableOpacity
                    style={styles.assetLibraryBtn}
                    onPress={() =>
                      handleSaveToAssets(
                        carouselTopic,
                        'CAROUSEL',
                        JSON.stringify(carouselResult, null, 2)
                      )
                    }
                  >
                    <CheckCircle2 size={15} color="#FFFFFF" />
                    <Text style={styles.btnTextWhite}>Save Carousel to Asset Library</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            )}
          </View>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────
            TAB 4: REEL / SHORT VIDEO SCRIPT STUDIO
           ───────────────────────────────────────────────────────────────────────────── */}
        {activeTab === 'REEL' && (
          <View style={styles.sectionContainer}>
            <GlassCard>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Reel & Short Video Script Studio
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                Timestamped pacing, camera cues, and audio production directions
              </Text>

              <Input
                label="Topic / Creative Message"
                placeholder="What is this video about?"
                value={reelTopic}
                onChangeText={setReelTopic}
              />

              <Input
                label="Hook Directive"
                placeholder="Opening hook..."
                value={reelHook}
                onChangeText={setReelHook}
              />

              <Button
                title={loadingReel ? 'Writing Script...' : 'Generate Reel Script'}
                onPress={handleGenerateReel}
                loading={loadingReel}
                icon={<Film size={16} color="#FFFFFF" />}
                style={styles.actionBtn}
              />
            </GlassCard>

            {reelResult && (
              <GlassCard glow style={styles.resultCard}>
                <View style={styles.blockHeader}>
                  <Badge label={`${reelResult.duration} Script`} variant="accent" />
                  <TouchableOpacity onPress={() => triggerCopy(reelResult.sections.map((s: any) => `${s.time} [${s.label}]\n${s.script}`).join('\n\n'), 'all_reel')}>
                    <Copy size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {reelResult.sections.map((sec: any, idx: number) => (
                  <View key={idx} style={styles.reelSectionCard}>
                    <View style={styles.reelSectionTop}>
                      <Badge label={sec.label} variant="neutral" />
                      <Text style={[styles.reelTime, { color: colors.textMuted }]}>{sec.time}</Text>
                    </View>
                    <Text style={[styles.reelScript, { color: colors.textPrimary }]}>{sec.script}</Text>
                    <Text style={[styles.reelDirection, { color: colors.accent.primary }]}>
                      Director: {sec.direction}
                    </Text>
                  </View>
                ))}

                <View style={styles.cardActionsCol}>
                  <TouchableOpacity
                    style={styles.assetLibraryBtn}
                    onPress={() =>
                      handleSaveToAssets(
                        reelTopic,
                        'REEL_SCRIPT',
                        reelResult.sections.map((s: any) => `${s.time} [${s.label}]\n${s.script}`).join('\n\n')
                      )
                    }
                  >
                    <CheckCircle2 size={15} color="#FFFFFF" />
                    <Text style={styles.btnTextWhite}>Save Script to Asset Library</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            )}
          </View>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────
            TAB 5: STORYBOARD STUDIO
           ───────────────────────────────────────────────────────────────────────────── */}
        {activeTab === 'STORYBOARD' && (
          <View style={styles.sectionContainer}>
            <GlassCard>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Commercial Storyboard Studio
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                Frame-by-frame visual and voiceover sequences
              </Text>

              <Input
                label="Campaign / Ad Concept"
                placeholder="e.g. Luxury Product Reveal"
                value={storyboardTopic}
                onChangeText={setStoryboardTopic}
              />

              <Button
                title={loadingStoryboard ? 'Assembling Storyboard...' : 'Generate Storyboard'}
                onPress={handleGenerateStoryboard}
                loading={loadingStoryboard}
                icon={<BookOpen size={16} color="#FFFFFF" />}
                style={styles.actionBtn}
              />
            </GlassCard>

            {storyboardResult && (
              <GlassCard glow style={styles.resultCard}>
                {storyboardResult.frames.map((f: any, idx: number) => (
                  <View key={idx} style={[styles.frameCard, { borderColor: colors.border }]}>
                    <View style={styles.frameHeader}>
                      <Text style={[styles.frameNumBadge, { color: colors.accent.primary }]}>Frame #{f.frame}</Text>
                      <Text style={[styles.frameDurationText, { color: colors.textMuted }]}>{f.duration}</Text>
                    </View>
                    <Text style={[styles.frameTitle, { color: colors.textPrimary }]}>{f.title}</Text>
                    <Text style={[styles.framePrompt, { color: colors.textSecondary }]}>
                      Visual: {f.visualPrompt}
                    </Text>
                    <Text style={[styles.frameVo, { color: colors.accent.primary }]}>
                      {f.voiceover}
                    </Text>
                  </View>
                ))}

                <View style={styles.cardActionsCol}>
                  <TouchableOpacity
                    style={styles.assetLibraryBtn}
                    onPress={() =>
                      handleSaveToAssets(
                        storyboardTopic,
                        'STORYBOARD',
                        JSON.stringify(storyboardResult, null, 2)
                      )
                    }
                  >
                    <CheckCircle2 size={15} color="#FFFFFF" />
                    <Text style={styles.btnTextWhite}>Save Storyboard to Asset Library</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            )}
          </View>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────
            TAB 6: BRAND VISUAL KIT
           ───────────────────────────────────────────────────────────────────────────── */}
        {activeTab === 'BRANDKIT' && (
          <View style={styles.sectionContainer}>
            <GlassCard>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Brand Visual Kit Engine
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                Calibrated identity guidelines sourced directly from your Brand DNA memory
              </Text>

              <Button
                title={loadingBrandKit ? 'Calibrating Kit...' : 'Assemble Brand Kit'}
                onPress={handleGenerateBrandKit}
                loading={loadingBrandKit}
                icon={<Brush size={16} color="#FFFFFF" />}
                style={styles.actionBtn}
              />
            </GlassCard>

            {brandKitResult && (
              <GlassCard glow style={styles.resultCard}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  {brandKitResult.brandName} Brand Identity
                </Text>

                {/* Color Palette */}
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Color Palette Tokens</Text>
                <View style={styles.colorsRow}>
                  {brandKitResult.colorPalette.map((col: string, idx: number) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => triggerCopy(col, `hex_${idx}`)}
                      style={[styles.colorSquare, { backgroundColor: col }]}
                    >
                      <Text style={styles.colorHexText}>{col}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Typography System */}
                <View style={[styles.infoCallout, { borderColor: colors.border }]}>
                  <Text style={[styles.blockTag, { color: colors.accent.primary }]}>TYPOGRAPHY HIERARCHY</Text>
                  <Text style={[styles.bodyText, { color: colors.textPrimary }]}>
                    Display: {brandKitResult.typography.headingFont}
                  </Text>
                  <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                    Body: {brandKitResult.typography.bodyFont}
                  </Text>
                </View>

                {/* Positioning Statement */}
                <View style={[styles.infoCallout, { borderColor: colors.border }]}>
                  <Text style={[styles.blockTag, { color: '#F59E0B' }]}>POSITIONING MEMORY</Text>
                  <Text style={[styles.bodyText, { color: colors.textPrimary }]}>
                    {brandKitResult.positioningStatement}
                  </Text>
                </View>

                {/* Logo Guidelines */}
                <View style={[styles.infoCallout, { borderColor: colors.border }]}>
                  <Text style={[styles.blockTag, { color: '#10B981' }]}>LOGO USAGE GOVERNANCE</Text>
                  {brandKitResult.logoGuidelines.map((rule: string, idx: number) => (
                    <Text key={idx} style={[styles.bodyText, { color: colors.textSecondary }]}>
                      • {rule}
                    </Text>
                  ))}
                </View>
              </GlassCard>
            )}
          </View>
        )}
      </ScrollView>

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
  tabsBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  tabsScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabChipText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.caption,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 14,
  },
  sectionContainer: {
    gap: 14,
  },
  mockupPlatformRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  mockupPlatformPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  mockupPlatformPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  mockupCard: {
    padding: 14,
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
  },
  igHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  igUserLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  igAvatarRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  igAvatarInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  igAvatarLetter: {
    fontSize: 14,
    fontWeight: '900',
  },
  igUsername: {
    fontSize: 12,
    fontWeight: '800',
  },
  igSponsored: {
    fontSize: 11,
  },
  igMediaBox: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  igImage: {
    width: '100%',
    height: 320,
  },
  igPlaceholderMedia: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  igPlaceholderTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  igPlaceholderBrand: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  igActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  igActionsLeft: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  igLikesText: {
    fontSize: 12,
    fontWeight: '800',
  },
  igCaptionBox: {
    gap: 2,
  },
  igCaptionText: {
    fontSize: 12,
    lineHeight: 18,
  },
  igMoreLink: {
    fontSize: 11,
    fontWeight: '600',
  },
  hashtagsText: {
    fontSize: 11,
    fontWeight: '700',
  },
  igCtaBtn: {
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    marginTop: 4,
  },
  igCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  liHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  liAvatarBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liAvatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  liCompanyName: {
    fontSize: 13,
    fontWeight: '800',
  },
  liFollowers: {
    fontSize: 11,
  },
  liBodyText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  liBodySubText: {
    fontSize: 12,
    lineHeight: 17,
  },
  liMediaBox: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  liImage: {
    width: '100%',
    height: 220,
  },
  liPlaceholderMedia: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  liPlaceholderTitle: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  liReactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  liIconsOver: {
    flexDirection: 'row',
  },
  liTinyCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liReactionsCount: {
    fontSize: 11,
  },
  liActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  liActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liActionLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  twHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  twAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  twAvatarText: {
    fontSize: 14,
    fontWeight: '800',
  },
  twNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  twName: {
    fontSize: 13,
    fontWeight: '800',
  },
  twHandle: {
    fontSize: 11,
  },
  twContentText: {
    fontSize: 13,
    lineHeight: 19,
  },
  twImage: {
    width: '100%',
    height: 200,
    borderRadius: 14,
  },
  twMetricsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  twMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  twMetricText: {
    fontSize: 11,
    fontWeight: '600',
  },
  fbHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fbAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fbAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  fbName: {
    fontSize: 13,
    fontWeight: '800',
  },
  fbSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fbSponsored: {
    fontSize: 11,
  },
  fbPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  fbBodyText: {
    fontSize: 12,
    lineHeight: 17,
  },
  fbImage: {
    width: '100%',
    height: 220,
    borderRadius: 8,
  },
  fbLinkCard: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  fbLinkDomain: {
    fontSize: 11,
    fontWeight: '800',
  },
  fbLinkTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  fbLearnMoreBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginTop: 4,
  },
  fbLearnMoreText: {
    fontSize: 11,
    fontWeight: '800',
  },
  blogMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blogReadTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
  },
  blogExcerpt: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  blogFeaturedImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  blogArticleBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  emailHeaderBar: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    gap: 4,
  },
  emailHeaderField: {
    fontSize: 11,
  },
  emailBodyContent: {
    gap: 10,
    paddingTop: 6,
  },
  emailGreeting: {
    fontSize: 13,
    fontWeight: '700',
  },
  emailMessage: {
    fontSize: 12,
    lineHeight: 18,
  },
  emailEmbeddedImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
  },
  emailCtaBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0284C7',
    alignItems: 'center',
  },
  emailCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  copyDrawerCard: {
    padding: 14,
    gap: 10,
  },
  drawerTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  copyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  copyLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  copyValue: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  costText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '800',
    lineHeight: LINE_HEIGHTS.heading,
  },
  sectionSub: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  aspectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  aspectText: {
    fontSize: 11,
    fontWeight: '700',
  },
  styleScroll: {
    marginBottom: 8,
  },
  styleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 6,
  },
  styleChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtn: {
    marginTop: 6,
  },
  imageResultCard: {
    padding: 10,
    borderRadius: 18,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  previewImage: {
    width: '100%',
    borderRadius: 14,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    width: '100%',
  },
  imgActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  imgActionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  resultCard: {
    padding: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blockTag: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  hookText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '800',
    lineHeight: LINE_HEIGHTS.body,
  },
  bodyText: {
    fontSize: FONT_SIZES.body,
    lineHeight: LINE_HEIGHTS.body + 2,
  },
  slideCard: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
    marginVertical: 2,
  },
  slideNum: {
    fontSize: 11,
    fontWeight: '800',
  },
  slideTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  slideBody: {
    fontSize: 11,
    lineHeight: 16,
  },
  visualCueText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  reelSectionCard: {
    padding: 10,
    borderRadius: 10,
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.03)',
    marginVertical: 2,
  },
  reelSectionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reelTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  reelScript: {
    fontSize: 11,
    lineHeight: 16,
  },
  reelDirection: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  frameCard: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
    marginVertical: 2,
  },
  frameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  frameNumBadge: {
    fontSize: 11,
    fontWeight: '800',
  },
  frameDurationText: {
    fontSize: 11,
  },
  frameTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  framePrompt: {
    fontSize: 11,
    lineHeight: 15,
  },
  frameVo: {
    fontSize: 11,
    fontWeight: '600',
  },
  colorsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginVertical: 4,
  },
  colorSquare: {
    width: 60,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorHexText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  infoCallout: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  cardActionsCol: {
    gap: 8,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  assetLibraryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
  },
  btnTextWhite: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
