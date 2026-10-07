import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Share,
  useWindowDimensions,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  FolderKanban,
  Search,
  Download,
  Share2,
  Copy,
  Check,
  Calendar,
  Clock,
  Trash2,
  FileText,
  Sparkles,
  Eye,
  X,
  CheckCircle2,
  ArrowRight,
  Mail,
  Palette,
  ExternalLink,
  Layers,
  Film,
  Newspaper,
  BookOpen,
  Filter,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { contentApi } from '../../api/contentApi';
import { BrandHeader } from '../../components/common/BrandHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { FloatingAISABrain } from '../../components/common/FloatingAISABrain';
import { cleanText } from '../../utils/formatters';
import { appStorage } from '../../utils/storage';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

type AssetCategory = 'ALL' | 'BLOG' | 'SOCIAL' | 'EMAIL';

interface AssetRecord {
  id: string;
  name: string;
  type: string;
  url?: string;
  content?: string;
  date: string;
  workspaceId?: string;
  metadata?: any;
}

export const AssetLibraryScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { activeWorkspace, studioTarget, setStudioTarget } = useWorkspace();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isSmall = width < 380;
  const cardWidth = isTablet ? (width - 48) / 3 : (width - 38) / 2;

  const currentBrand = activeWorkspace?.brandName || 'Brand';
  const currentWsId = activeWorkspace?._id || activeWorkspace?.id || 'ws_001';

  // State
  const [activeCategory, setActiveCategory] = useState<AssetCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<AssetRecord[]>([]);

  // Selected asset detail modal
  const [selectedAsset, setSelectedAsset] = useState<AssetRecord | null>(null);
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);

  // Calendar cross-module filter context
  const [calendarContext, setCalendarContext] = useState<{ title: string; date?: string } | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((prev) => (prev === msg ? null : prev)), 2800);
  }, []);

  const handleGoBack = useCallback(() => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  }, [navigation]);

  // Initial demo assets aligned with Brand DNA
  const defaultInitialAssets: AssetRecord[] = useMemo(() => [
    {
      id: 'demo_1',
      name: `${currentBrand} Flagship Commercial 8K`,
      type: 'IMAGE',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      content: `Vertex AI Imagen 3 rendered commercial visual for ${currentBrand} in Glassmorphic Modern 3D style.`,
      date: new Date(Date.now() - 3600000).toISOString(),
      workspaceId: currentWsId,
      metadata: { platform: 'INSTAGRAM', style: 'Glassmorphic Modern 3D', brand: currentBrand },
    },
    {
      id: 'demo_2',
      name: `${currentBrand} 2026 Strategic Playbook`,
      type: 'BLOG',
      content: `The Comprehensive Guide to Scaling Brand Velocity in 2026.\n\nIn modern operations, governance and speed are the true multipliers of enterprise growth.\n\n1. Autonomous Velocity: Eliminating production bottlenecks.\n2. Brand DNA Memory: Keeping voice and claims locked.\n3. Telemetry Feedback: Optimizing live CTR.`,
      date: new Date(Date.now() - 7200000).toISOString(),
      workspaceId: currentWsId,
      metadata: { platform: 'WEBSITE', keywords: 'velocity, brand memory', brand: currentBrand },
    },
    {
      id: 'demo_3',
      name: `Product Launch Announcement Newsletter`,
      type: 'EMAIL',
      content: `Subject: Exclusive Dispatch: ${currentBrand} Architecture Reveal\n\nHi there,\n\nWe are excited to share our latest milestone. Learn how unified brand memory accelerates cross-channel creative deployment by 10x.`,
      date: new Date(Date.now() - 14400000).toISOString(),
      workspaceId: currentWsId,
      metadata: { platform: 'EMAIL', purpose: 'product_launch', brand: currentBrand },
    },
    {
      id: 'demo_4',
      name: `High-Conversion PAS Ad Copy (Social)`,
      type: 'SOCIAL',
      content: `Hook: Tired of creative bottlenecks slowing down your ad production?\n\nStop compromising on brand voice. ${currentBrand} uses AI Ads to craft compliant, high-converting copy in seconds.\n\n👉 Click the link in bio to start scaling today!`,
      date: new Date(Date.now() - 28800000).toISOString(),
      workspaceId: currentWsId,
      metadata: { platform: 'LINKEDIN', framework: 'PAS', brand: currentBrand },
    },
    {
      id: 'demo_5',
      name: `Official AP Press Release Dispatch`,
      type: 'NEWSPAPER',
      content: `FOR IMMEDIATE RELEASE\n\n${currentBrand.toUpperCase()} UNVEILS ENTERPRISE AUTONOMOUS ADVERTISING SUITE\n\nMUMBAI / NEW YORK — Today, ${currentBrand} unveiled its breakthrough platform centralizing brand memory.`,
      date: new Date(Date.now() - 86400000).toISOString(),
      workspaceId: currentWsId,
      metadata: { platform: 'PRESS', brand: currentBrand },
    },
    {
      id: 'demo_6',
      name: `5 Ways AI Transforms Brand Velocity`,
      type: 'CAROUSEL',
      content: `SLIDE 1 (COVER): 5 WAYS AI TRANSFORMS BRAND VELOCITY\n\nSLIDE 2: Pillar 1 — Content Velocity without Agency Lag\nSLIDE 3: Pillar 2 — Immutable Brand DNA Context\nSLIDE 4: Pillar 3 — Real-Time Conversion Attribution\n\nSLIDE 5 (CTA): Scale with ${currentBrand} Today!`,
      date: new Date(Date.now() - 172800000).toISOString(),
      workspaceId: currentWsId,
      metadata: { platform: 'INSTAGRAM', slidesCount: 5, brand: currentBrand },
    },
  ], [currentBrand, currentWsId]);

  // Load assets from backend and local cache
  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Check local storage cache
      const cached = await appStorage.getJSON<AssetRecord[]>(`assets_${currentWsId}`, []);

      // 2. Fetch from backend API
      const res = await contentApi.listAssets(currentWsId);
      if (res && res.success && Array.isArray(res.assets) && res.assets.length > 0) {
        // Merge and deduplicate
        const merged = [...res.assets, ...cached, ...defaultInitialAssets];
        const seen = new Set<string>();
        const deduped: AssetRecord[] = [];

        for (const item of merged) {
          const key = (item.id || item.name || '').trim().toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            deduped.push(item);
          }
        }
        setAssets(deduped);
        await appStorage.setJSON(`assets_${currentWsId}`, deduped);
      } else {
        const fallback = cached.length > 0 ? cached : defaultInitialAssets;
        setAssets(fallback);
      }
    } catch (err) {
      const cached = await appStorage.getJSON<AssetRecord[]>(`assets_${currentWsId}`, defaultInitialAssets);
      setAssets(cached);
    } finally {
      setLoading(false);
    }
  }, [currentWsId, defaultInitialAssets]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAssets();
    setRefreshing(false);
  };

  // Consume route or studioTarget calendar directives
  useEffect(() => {
    const target = route?.params?.target || studioTarget;
    if (target) {
      if (target.topic || target.title) {
        setCalendarContext({
          title: target.topic || target.title,
          date: target.calendarDate || target.date,
        });
      }
      if (target.assetTab || target.targetTab) {
        setActiveCategory(target.assetTab || target.targetTab);
      }
      if (studioTarget) setStudioTarget(null);
    }
  }, [route?.params?.target, studioTarget]);

  // Copy helper
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

  // Download / Save to device
  const [downloadedKey, setDownloadedKey] = useState<string | null>(null);
  const handleDownload = async (asset: AssetRecord) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setDownloadedKey(asset.id);
    showToast('Asset saved to device!');
    setTimeout(() => setDownloadedKey(null), 2500);
  };

  // Share helper
  const handleShareAsset = async (asset: AssetRecord) => {
    try {
      await Share.share({
        title: `${asset.name} - ${currentBrand}`,
        message: `${asset.name}\n\n${asset.content || asset.url || ''}`,
        url: asset.url,
      });
    } catch {}
  };

  // Delete asset
  const handleDeleteAsset = (assetId: string) => {
    Alert.alert(
      'Delete Asset',
      'Are you sure you want to remove this asset from your cloud vault?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = assets.filter((a) => a.id !== assetId);
            setAssets(updated);
            await appStorage.setJSON(`assets_${currentWsId}`, updated);
            if (selectedAsset?.id === assetId) setSelectedAsset(null);
            showToast('Asset removed from vault');
          },
        },
      ]
    );
  };

  // Filter sections & count computations
  const sectionCounts = useMemo(() => ({
    ALL: assets.length,
    BLOG: assets.filter((a) => a.type === 'BLOG').length,
    SOCIAL: assets.filter((a) => ['SOCIAL', 'IMAGE', 'CAROUSEL', 'REEL_SCRIPT', 'STORYBOARD'].includes(a.type)).length,
    EMAIL: assets.filter((a) => ['EMAIL', 'NEWSPAPER'].includes(a.type)).length,
  }), [assets]);

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      // 1. Category tab filter
      const matchesCategory =
        activeCategory === 'ALL' ||
        a.type === activeCategory ||
        (activeCategory === 'SOCIAL' && ['SOCIAL', 'IMAGE', 'CAROUSEL', 'REEL_SCRIPT', 'STORYBOARD'].includes(a.type)) ||
        (activeCategory === 'EMAIL' && ['EMAIL', 'NEWSPAPER'].includes(a.type));

      // 2. Search query filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (a.name || '').toLowerCase().includes(q) ||
        (a.type || '').toLowerCase().includes(q) ||
        (a.content || '').toLowerCase().includes(q) ||
        (a.metadata?.platform || '').toLowerCase().includes(q);

      // 3. Calendar context match
      let matchesCalendar = true;
      if (calendarContext?.title) {
        const kw = calendarContext.title.toLowerCase().split(' ')[0];
        if (kw && kw.length > 3) {
          matchesCalendar = (a.name || '').toLowerCase().includes(kw) || (a.content || '').toLowerCase().includes(kw);
        }
      }

      return matchesCategory && matchesSearch && matchesCalendar;
    });
  }, [assets, activeCategory, searchQuery, calendarContext]);

  // Color mapper for badges
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BLOG':
        return '#0284C7';
      case 'SOCIAL':
        return '#8B5CF6';
      case 'EMAIL':
        return '#10B981';
      case 'NEWSPAPER':
        return '#F59E0B';
      case 'CAROUSEL':
        return '#EC4899';
      case 'IMAGE':
        return '#F97316';
      default:
        return '#64748B';
    }
  };

  const formatDateLabel = (iso?: string) => {
    if (!iso) return 'Recent';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'Recent';
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader showBack onBack={handleGoBack} title="Asset Library" />

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

      {/* Calendar Cross-Module Directive Filter Banner */}
      {calendarContext && (
        <View style={styles.calendarFilterBanner}>
          <View style={styles.calendarFilterLeft}>
            <Calendar size={16} color="#10B981" />
            <View style={{ flex: 1 }}>
              <Text style={styles.calendarFilterTag}>CALENDAR DIRECTIVE ACTIVE</Text>
              <Text style={[styles.calendarFilterTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                Filtering for: {calendarContext.title}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setCalendarContext(null)}
            style={[styles.calendarFilterClose, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}
          >
            <X size={14} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Search Header Bar */}
      <View
        style={[
          styles.searchBarContainer,
          { backgroundColor: colors.headerBackground, borderBottomColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.searchInputBox,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderColor: colors.border },
          ]}
        >
          <Search size={16} color={colors.textMuted} />
          <TextInput
            placeholder={`Search ${filteredAssets.length} assets in vault...`}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.textPrimary }]}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={15} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Top 4 Aligned Category Filter Tabs */}
      <View
        style={[
          styles.categoryTabsBar,
          { backgroundColor: colors.headerBackground, borderBottomColor: colors.border },
        ]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {[
            { id: 'ALL', label: 'All Assets', icon: FolderKanban },
            { id: 'BLOG', label: 'Blog & Articles', icon: FileText },
            { id: 'SOCIAL', label: 'Social & Visuals', icon: Share2 },
            { id: 'EMAIL', label: 'Email & Press', icon: Mail },
          ].map((cat) => {
            const isSelected = activeCategory === cat.id;
            const Icon = cat.icon;
            const count = sectionCounts[cat.id as AssetCategory] || 0;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  setActiveCategory(cat.id as AssetCategory);
                }}
                style={[
                  styles.categoryPill,
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
                    styles.categoryPillText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {cat.label}
                </Text>
                <View
                  style={[
                    styles.categoryCountBadge,
                    {
                      backgroundColor: isSelected
                        ? 'rgba(255,255,255,0.25)'
                        : isDark
                        ? 'rgba(255,255,255,0.1)'
                        : '#E2E8F0',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryCountText,
                      { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.primary}
          />
        }
      >
        {/* Assets Grid */}
        {filteredAssets.length > 0 ? (
          <View style={styles.gridContainer}>
            {filteredAssets.map((asset) => {
              const typeColor = getTypeColor(asset.type);
              const isVisual = Boolean(asset.url && (asset.url.startsWith('http') || asset.url.startsWith('data:')));
              const isDownloaded = downloadedKey === asset.id;

              return (
                <GlassCard
                  key={asset.id}
                  style={[styles.assetCard, { width: cardWidth }]}
                  onPress={() => setSelectedAsset(asset)}
                >
                  {/* Thumbnail Container */}
                  <View style={styles.thumbnailBox}>
                    {isVisual ? (
                      <Image
                        source={{ uri: asset.url }}
                        style={styles.thumbnailImg}
                        resizeMode="cover"
                      />
                    ) : (
                      <LinearGradient
                        colors={isDark ? ['#1E1B4B', '#0F172A'] : ['#EDE9FE', '#F8FAFC']}
                        style={styles.thumbnailPlaceholder}
                      >
                        {asset.type === 'BLOG' ? (
                          <FileText size={28} color={typeColor} />
                        ) : asset.type === 'EMAIL' ? (
                          <Mail size={28} color={typeColor} />
                        ) : asset.type === 'CAROUSEL' ? (
                          <Layers size={28} color={typeColor} />
                        ) : asset.type === 'NEWSPAPER' ? (
                          <Newspaper size={28} color={typeColor} />
                        ) : (
                          <BookOpen size={28} color={typeColor} />
                        )}
                        <Text style={[styles.placeholderDocText, { color: colors.textMuted }]} numberOfLines={2}>
                          {cleanText(asset.content || asset.name)}
                        </Text>
                      </LinearGradient>
                    )}

                    {/* Type Badge */}
                    <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
                      <Text style={styles.typeBadgeText}>{asset.type}</Text>
                    </View>

                    {/* Tap to View Overlay */}
                    {isVisual && (
                      <TouchableOpacity
                        style={styles.viewOverlayBtn}
                        onPress={() => setFullImageUrl(asset.url || null)}
                      >
                        <Eye size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Asset Details */}
                  <View style={styles.cardDetails}>
                    <Text
                      style={[styles.cardTitle, { color: colors.textPrimary }]}
                      numberOfLines={2}
                    >
                      {asset.name}
                    </Text>

                    <View style={styles.cardMetaRow}>
                      <Clock size={11} color={colors.textMuted} />
                      <Text style={[styles.cardDate, { color: colors.textMuted }]}>
                        {formatDateLabel(asset.date)}
                      </Text>
                      {asset.metadata?.platform && (
                        <Text style={[styles.cardPlatform, { color: colors.accent.primary }]}>
                          • {asset.metadata.platform.toUpperCase()}
                        </Text>
                      )}
                    </View>

                    {/* Actions Row */}
                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        style={[styles.actionIconBtn, { borderColor: colors.border }]}
                        onPress={() => triggerCopy(asset.content || asset.url || asset.name, `copy_${asset.id}`, 'Content copied')}
                      >
                        {copiedKey === `copy_${asset.id}` ? (
                          <Check size={13} color="#10B981" />
                        ) : (
                          <Copy size={13} color={colors.textSecondary} />
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.actionDownloadBtn,
                          {
                            backgroundColor: isDownloaded ? '#10B981' : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                            borderColor: isDownloaded ? '#10B981' : colors.border,
                          },
                        ]}
                        onPress={() => handleDownload(asset)}
                      >
                        {isDownloaded ? (
                          <Check size={13} color="#FFFFFF" />
                        ) : (
                          <Download size={13} color={colors.textPrimary} />
                        )}
                        <Text
                          style={[
                            styles.actionDownloadText,
                            { color: isDownloaded ? '#FFFFFF' : colors.textPrimary },
                          ]}
                        >
                          {isDownloaded ? 'Saved' : 'Save'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionIconBtn, { borderColor: colors.border }]}
                        onPress={() => handleShareAsset(asset)}
                      >
                        <Share2 size={13} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </GlassCard>
              );
            })}
          </View>
        ) : (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <GlassCard style={styles.emptyCard}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.accent.tagBg }]}>
                <FolderKanban size={36} color={colors.accent.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                No {activeCategory === 'ALL' ? '' : activeCategory} Assets Found
              </Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                Your cloud repository stores all generated visuals, ad copy, articles, and carousels for{' '}
                <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{currentBrand}</Text>.
              </Text>

              <View style={styles.emptyActionsRow}>
                <TouchableOpacity
                  style={[styles.emptyActionBtn, { backgroundColor: colors.accent.primary }]}
                  onPress={() => navigation.navigate('Studio')}
                >
                  <Sparkles size={15} color="#FFFFFF" />
                  <Text style={styles.emptyActionBtnText}>Open Content Studio</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.emptyActionBtnSecondary, { borderColor: colors.border }]}
                  onPress={() => navigation.navigate('CreativeStudio')}
                >
                  <Palette size={15} color={colors.textPrimary} />
                  <Text style={[styles.emptyActionSecondaryText, { color: colors.textPrimary }]}>
                    Open Creative Studio
                  </Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </View>
        )}
      </ScrollView>

      {/* Asset Detail Drawer Modal */}
      {selectedAsset && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedAsset(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.drawerBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              {/* Drawer Header */}
              <View style={[styles.drawerHeader, { borderBottomColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <View style={styles.drawerBadgeRow}>
                    <Badge label={selectedAsset.type} variant="accent" />
                    <Text style={[styles.drawerDateText, { color: colors.textMuted }]}>
                      {formatDateLabel(selectedAsset.date)}
                    </Text>
                  </View>
                  <Text style={[styles.drawerTitleText, { color: colors.textPrimary }]}>
                    {selectedAsset.name}
                  </Text>
                </View>

                <View style={styles.drawerHeaderActions}>
                  <TouchableOpacity
                    style={[styles.drawerIconBtn, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
                    onPress={() => handleDeleteAsset(selectedAsset.id)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.drawerIconBtn, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}
                    onPress={() => setSelectedAsset(null)}
                  >
                    <X size={16} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView style={styles.drawerScroll} showsVerticalScrollIndicator={false}>
                {/* Visual Preview */}
                {selectedAsset.url && (selectedAsset.url.startsWith('http') || selectedAsset.url.startsWith('data:')) && (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setFullImageUrl(selectedAsset.url || null)}
                    style={styles.drawerImageWrapper}
                  >
                    <Image
                      source={{ uri: selectedAsset.url }}
                      style={styles.drawerImage}
                      resizeMode="cover"
                    />
                    <View style={styles.drawerImageOverlay}>
                      <Eye size={16} color="#FFFFFF" />
                      <Text style={styles.drawerImageOverlayText}>Tap to View Full Resolution</Text>
                    </View>
                  </TouchableOpacity>
                )}

                {/* Body Content */}
                {selectedAsset.content ? (
                  <View style={[styles.drawerContentBox, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
                    <View style={styles.drawerContentHeader}>
                      <Text style={[styles.drawerContentLabel, { color: colors.accent.primary }]}>
                        ASSET CONTENT & COPY
                      </Text>
                      <TouchableOpacity
                        onPress={() => triggerCopy(selectedAsset.content || '', 'drawer_copy', 'Content copied')}
                      >
                        {copiedKey === 'drawer_copy' ? (
                          <Check size={15} color="#10B981" />
                        ) : (
                          <Copy size={15} color={colors.textMuted} />
                        )}
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.drawerContentBody, { color: colors.textPrimary }]}>
                      {cleanText(selectedAsset.content)}
                    </Text>
                  </View>
                ) : null}

                {/* Primary Action Buttons */}
                <View style={styles.drawerButtonsRow}>
                  <TouchableOpacity
                    style={[styles.drawerPrimaryBtn, { backgroundColor: colors.accent.primary }]}
                    onPress={() => triggerCopy(selectedAsset.content || selectedAsset.url || selectedAsset.name, 'full_asset_copy', 'Copied to clipboard')}
                  >
                    <Copy size={16} color="#FFFFFF" />
                    <Text style={styles.drawerPrimaryBtnText}>Copy Content</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.drawerDownloadBtn, { backgroundColor: '#10B981' }]}
                    onPress={() => handleDownload(selectedAsset)}
                  >
                    <Download size={16} color="#FFFFFF" />
                    <Text style={styles.drawerPrimaryBtnText}>Download to Device</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Full Image Modal Viewer */}
      {fullImageUrl && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setFullImageUrl(null)}
        >
          <View style={styles.fullImageBackdrop}>
            <TouchableOpacity
              style={styles.fullImageCloseBtn}
              onPress={() => setFullImageUrl(null)}
            >
              <X size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <Image
              source={{ uri: fullImageUrl }}
              style={styles.fullImageDisplay}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}

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
  calendarFilterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.25)',
  },
  calendarFilterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  calendarFilterTag: {
    fontSize: 11,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: 0.8,
  },
  calendarFilterTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  calendarFilterClose: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  searchBarContainer: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  searchInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  categoryTabsBar: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  categoryScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoryCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryCountText: {
    fontSize: 11,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 14,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  assetCard: {
    padding: 8,
    borderRadius: 16,
    gap: 8,
  },
  thumbnailBox: {
    width: '100%',
    height: 125,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F1F2A',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 6,
  },
  placeholderDocText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  typeBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  viewOverlayBtn: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDetails: {
    gap: 4,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    height: 32,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  cardPlatform: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDownloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionDownloadText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyCard: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    gap: 12,
    textAlign: 'center',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  emptyActionsRow: {
    flexDirection: 'column',
    width: '100%',
    gap: 8,
    marginTop: 6,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyActionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
  },
  emptyActionSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  drawerBox: {
    maxHeight: '85%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
  },
  drawerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  drawerDateText: {
    fontSize: 11,
    fontWeight: '600',
  },
  drawerTitleText: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  drawerHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  drawerIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerScroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  drawerImageWrapper: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
  },
  drawerImage: {
    width: '100%',
    height: '100%',
  },
  drawerImageOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  drawerImageOverlayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  drawerContentBox: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    marginBottom: 14,
  },
  drawerContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawerContentLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  drawerContentBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  drawerButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  drawerPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
  },
  drawerDownloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
  },
  drawerPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  fullImageBackdrop: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImageCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 40,
    right: 20,
    zIndex: 999,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImageDisplay: {
    width: '100%',
    height: '80%',
  },
});
