import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Linking,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import {
  Dna,
  Globe,
  CheckCircle2,
  Save,
  Sparkles,
  Search,
  AlertCircle,
  Target,
  MessageSquare,
  Zap,
  Compass,
  FileText,
  BarChart2,
  Palette,
  Copy,
  Check,
  Edit3,
  Upload,
  ImageIcon,
  Maximize2,
  X,
  ExternalLink,
  ChevronRight,
  Building2,
  Briefcase,
  MapPin,
  Quote,
  Mail,
  Eye,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { BrandHeader } from '../../components/common/BrandHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { brandApi, BrandProfileData } from '../../api/brandApi';
import { normalizeBrandDna, NormalizedBrandDna } from '../../utils/normalizeBrandDna';
import { FONT_SIZES, LINE_HEIGHTS, FONT_WEIGHTS } from '../../config/typography';

export const BrandDnaScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isSmall = screenWidth < 380;
  const { colors, isDark } = useTheme();
  const {
    activeWorkspace,
    updateActiveWorkspace,
    setIsScraperOpen,
    setIsBrandSwitcherOpen,
  } = useWorkspace();

  const workspaceId = (activeWorkspace as any)?._id || activeWorkspace?.id;

  // State
  const [profile, setProfile] = useState<BrandProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedMsg, setSavedMsg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Edit toggles per field
  const [editState, setEditState] = useState<Record<string, boolean>>({});

  // Local draft states for editing
  const [colorDrafts, setColorDrafts] = useState<string[] | null>(null);
  const [logoUrlInput, setLogoUrlInput] = useState<string>('');
  const [showLogoInput, setShowLogoInput] = useState<boolean>(false);

  // High-Res Logo Modal
  const [showLogoModal, setShowLogoModal] = useState<boolean>(false);
  const [modalImgSrc, setModalImgSrc] = useState<string>('');
  const [modalImgIndex, setModalImgIndex] = useState<number>(0);

  // Initial setup check
  const isBrandExist = Boolean(
    activeWorkspace &&
    activeWorkspace.id !== 'ws_empty' &&
    (activeWorkspace as any)._id !== 'ws_empty' &&
    activeWorkspace.brandName &&
    activeWorkspace.brandName !== 'No Brand Loaded'
  );

  // Load Brand Profile from backend API
  const loadBrandProfile = useCallback(async () => {
    if (!workspaceId || workspaceId === 'ws_empty') {
      setLoading(false);
      return;
    }
    if (!isBrandExist) {
      setLoading(true);
    }
    setError('');
    try {
      const result = await brandApi.getProfile(workspaceId);
      if (result && result.profile) {
        setProfile((prev) => ({
          ...(isBrandExist ? (activeWorkspace as any) : {}),
          ...result.profile,
        }));
      }
    } catch (err: any) {
      console.log('[BrandDnaScreen] DB profile note:', err.message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, isBrandExist, activeWorkspace]);

  useEffect(() => {
    if (isBrandExist) {
      setProfile(activeWorkspace as any);
    } else {
      setProfile(null);
    }
    loadBrandProfile();
  }, [loadBrandProfile, activeWorkspace, isBrandExist]);

  // Merge canonical source & normalize
  const rawSource = profile || (isBrandExist ? activeWorkspace : null);
  const canonicalSource = isBrandExist
    ? { ...activeWorkspace, ...(rawSource || {}) }
    : rawSource;
  const effectiveProfile: NormalizedBrandDna = normalizeBrandDna(canonicalSource);

  // Setup Logo modal candidates on modal open
  useEffect(() => {
    if (showLogoModal && effectiveProfile) {
      const cleanDom = (effectiveProfile.website || effectiveProfile.domainUrl || activeWorkspace?.domainUrl || effectiveProfile.companyName || 'brand.com')
        .replace(/^(?:https?:\/\/)?(?:www\.)?/i, '')
        .split('/')[0]
        .split('?')[0];

      const candidates: string[] = [];
      if (effectiveProfile.logoUrl && !effectiveProfile.logoUrl.includes('picsum.photos')) {
        candidates.push(effectiveProfile.logoUrl);
      }
      candidates.push(`https://logo.clearbit.com/${cleanDom}`);
      candidates.push(`https://www.google.com/s2/favicons?domain=${cleanDom}&sz=256`);

      setModalImgSrc(candidates[0]);
      setModalImgIndex(0);
    }
  }, [showLogoModal, effectiveProfile, activeWorkspace?.domainUrl]);

  const handleModalImgError = () => {
    const cleanDom = (effectiveProfile.website || effectiveProfile.domainUrl || activeWorkspace?.domainUrl || 'brand.com')
      .replace(/^(?:https?:\/\/)?(?:www\.)?/i, '')
      .split('/')[0]
      .split('?')[0];

    const fallbackList = [
      `https://logo.clearbit.com/${cleanDom}`,
      `https://www.google.com/s2/favicons?domain=${cleanDom}&sz=256`,
      `https://www.google.com/s2/favicons?domain=${cleanDom}&sz=128`,
    ];

    const nextIndex = modalImgIndex + 1;
    if (nextIndex < fallbackList.length) {
      setModalImgIndex(nextIndex);
      setModalImgSrc(fallbackList[nextIndex]);
    }
  };

  // Local field updater
  const handleFieldChangeLocal = (fieldKey: string, newValue: any) => {
    let updatedValue = newValue;
    if (fieldKey === 'targetAudience' || fieldKey === 'coreProductsServices') {
      if (typeof newValue === 'string') {
        updatedValue = newValue.split('\n');
      }
    }

    setProfile((prev: any) => ({
      ...(prev || {}),
      workspaceId: workspaceId || prev?.workspaceId,
      [fieldKey]: updatedValue,
      structuredIdentity: {
        ...(prev?.structuredIdentity || {}),
        ...(fieldKey === 'brandColors' ? { color_palette: updatedValue } : {}),
      },
    }));
  };

  // Toggle field editing & auto-save
  const toggleEdit = async (fieldKey: string) => {
    const isClosing = editState[fieldKey];

    if (isClosing && workspaceId && effectiveProfile) {
      const currentVal = (effectiveProfile as any)[fieldKey];
      let sanitizedVal = currentVal;

      if (fieldKey === 'targetAudience' || fieldKey === 'coreProductsServices') {
        if (Array.isArray(currentVal)) {
          sanitizedVal = currentVal.map((s: any) => (typeof s === 'string' ? s.trim() : s)).filter(Boolean);
        }
      }

      await updateProfileField(fieldKey, sanitizedVal);
    }

    if (fieldKey === 'identity' && editState['identity']) {
      setShowLogoInput(false);
      setLogoUrlInput('');
    }

    setEditState((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  // Brand colors edit toggle
  const toggleEditBrandColors = async () => {
    if (!editState['brandColors']) {
      const current = [...effectiveProfile.brandColors];
      while (current.length < 4) {
        current.push(current.length === 0 ? '#F59E0B' : current.length === 1 ? '#D97706' : current.length === 2 ? '#06B6D4' : '#151922');
      }
      setColorDrafts(current.slice(0, 4));
    } else {
      if (colorDrafts) {
        const cleaned = colorDrafts.map((c) => (typeof c === 'string' ? c.trim() : '')).filter((c) => c.length > 0);
        await updateProfileField('brandColors', cleaned);
      }
      setColorDrafts(null);
    }
    setEditState((prev) => ({ ...prev, brandColors: !prev['brandColors'] }));
  };

  const handleColorDraftChange = (index: number, newValue: string) => {
    const nextDrafts = colorDrafts ? [...colorDrafts] : [...effectiveProfile.brandColors];
    while (nextDrafts.length < 4) {
      nextDrafts.push('#F59E0B');
    }
    nextDrafts[index] = newValue;
    setColorDrafts(nextDrafts);
  };

  // Persist single field update to backend
  const updateProfileField = async (fieldKey: string, newValue: any) => {
    if (!workspaceId) return;
    const current = profile || (effectiveProfile as any) || {};
    let updatedValue = newValue;

    if (fieldKey === 'targetAudience' || fieldKey === 'coreProductsServices') {
      if (typeof newValue === 'string') {
        updatedValue = newValue.split('\n').map((s: string) => s.trim()).filter(Boolean);
      }
    }

    const updatedProfile = {
      ...current,
      workspaceId,
      [fieldKey]: updatedValue,
      structuredIdentity: {
        ...(current.structuredIdentity || {}),
        ...(fieldKey === 'brandColors' ? { color_palette: updatedValue } : {}),
      },
    };

    setProfile(updatedProfile);

    try {
      await brandApi.updateProfile(workspaceId, updatedProfile);
      if (updateActiveWorkspace) {
        await updateActiveWorkspace(updatedProfile);
      }
    } catch (err) {
      console.error('[BrandDnaScreen] Failed to save field change:', err);
    }
  };

  // Copy hex color to clipboard
  const handleCopyColor = async (hex: string) => {
    try {
      await Clipboard.setStringAsync(hex);
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      setCopiedColor(hex);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      console.warn('Clipboard copy error:', err);
    }
  };

  // Run Evidence-First AI Analysis Scraper
  const handleRunAiAnalysis = async () => {
    const targetUrl = effectiveProfile.website || effectiveProfile.domainUrl || activeWorkspace?.domainUrl || '';
    const targetName = effectiveProfile.companyName || activeWorkspace?.brandName || 'your brand';

    if (!workspaceId) {
      setIsScraperOpen(true);
      return;
    }

    setAnalyzing(true);
    setError('');
    setSavedMsg(`Scraping live brand website (${targetUrl || targetName}) in detail...`);

    try {
      const result = await brandApi.analyze({
        workspaceId,
        websiteUrl: targetUrl,
        companyName: effectiveProfile.companyName || activeWorkspace?.brandName || '',
      });

      if (result && result.profile) {
        setProfile(result.profile);
        setSavedMsg(`Deep AI Brand Intelligence re-scraped and updated for ${targetName}!`);
        setTimeout(() => setSavedMsg(''), 5000);

        if (updateActiveWorkspace && result.profile?.structuredIdentity) {
          const id = result.profile.structuredIdentity;
          await updateActiveWorkspace({
            brandVoiceTone: id.tone,
            targetAudience: id.target_audience,
            contentPillars: id.content_angles,
            brandColors: id.color_palette,
          });
        }
      }
    } catch (err: any) {
      console.error('[BrandDnaScreen] AI Analysis error:', err);
      setError(err.message || 'Brand AI re-scraping analysis failed.');
      setSavedMsg('');
    } finally {
      setAnalyzing(false);
    }
  };

  // Save profile manually
  const handleSaveProfile = async () => {
    if (!workspaceId || !effectiveProfile) return;
    setSaving(true);
    setError('');
    try {
      const cleanColor = (c: any) => (typeof c === 'string' ? c : c?.hex || c?.color);
      const sanitizedProfile = {
        ...effectiveProfile,
        brandColors: (effectiveProfile.brandColors || []).map(cleanColor).filter(Boolean),
      };

      await brandApi.updateProfile(workspaceId, sanitizedProfile as any);
      if (updateActiveWorkspace) {
        await updateActiveWorkspace(sanitizedProfile as any);
      }

      setSavedMsg('Brand Profile saved! Redirecting to Campaign Strategy...');
      setTimeout(() => {
        setSavedMsg('');
        navigation.navigate('More', { screen: 'Campaigns' });
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Failed to save Brand Profile');
    } finally {
      setSaving(false);
    }
  };

  // Resolve logo thumbnail URL
  const resolvedLogoUrl =
    effectiveProfile.logoUrl && !effectiveProfile.logoUrl.includes('picsum.photos')
      ? effectiveProfile.logoUrl
      : `https://www.google.com/s2/favicons?domain=${(effectiveProfile.website || effectiveProfile.domainUrl || activeWorkspace?.domainUrl || 'brand.com').replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0]}&sz=128`;

  // ─────────────────────────────────────────────────────────────────────────────
  // NO BRAND GATE (When no active brand or workspace is empty)
  // ─────────────────────────────────────────────────────────────────────────────
  const noBrand =
    !activeWorkspace ||
    activeWorkspace.id === 'ws_empty' ||
    (activeWorkspace as any)._id === 'ws_empty' ||
    !isBrandExist;

  if (noBrand) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <BrandHeader showBack onBack={() => navigation.goBack()} title="Brand Intelligence" />

        <ScrollView
          contentContainerStyle={[
            styles.noBrandScrollContent,
            { paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Glowing DNA Centerpiece */}
          <View style={styles.dnaGlowContainer}>
            <View style={[styles.dnaPulseRing, { backgroundColor: colors.accent.glow }]} />
            <LinearGradient
              colors={['#D97706', '#F59E0B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dnaIconSquircle}
            >
              <Dna size={40} color="#FFFFFF" />
            </LinearGradient>
          </View>

          {/* Title & Subtitle */}
          <Text style={[styles.noBrandHeroTitle, { color: colors.textPrimary }]}>
            Start Your Brand Journey
          </Text>
          <Text style={[styles.noBrandSubtitle, { color: colors.textSecondary }]}>
            Build your{' '}
            <Text style={{ color: '#F59E0B', fontWeight: '700' }}>Brand DNA</Text>{' '}
            in under 60 seconds. Let AI ADS analyze your brand and generate an immutable memory
            that powers every module - strategy, SEO, content, and more.
          </Text>

          {/* 3 Quick Action Cards */}
          <View style={styles.noBrandCardsContainer}>
            {/* Card 1: Enter URL */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsScraperOpen(true)}
              style={[
                styles.noBrandActionCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                },
              ]}
            >
              <View style={[styles.noBrandIconBox, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                <Globe size={22} color="#F59E0B" />
              </View>
              <View style={styles.noBrandCardContent}>
                <Text style={[styles.noBrandCardTitle, { color: colors.textPrimary }]}>
                  Enter Brand URL
                </Text>
                <Text style={[styles.noBrandCardDesc, { color: colors.textMuted }]}>
                  AI scrapes your website and builds Brand DNA automatically.
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Card 2: Activate Existing Brand */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsBrandSwitcherOpen(true)}
              style={[
                styles.noBrandActionCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                },
              ]}
            >
              <View style={[styles.noBrandIconBox, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                <Target size={22} color="#F59E0B" />
              </View>
              <View style={styles.noBrandCardContent}>
                <Text style={[styles.noBrandCardTitle, { color: colors.textPrimary }]}>
                  Activate Your Brand
                </Text>
                <Text style={[styles.noBrandCardDesc, { color: colors.textMuted }]}>
                  Select and activate an existing brand from your workspace list.
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Card 3: Upload Brand PDF */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsScraperOpen(true)}
              style={[
                styles.noBrandActionCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                },
              ]}
            >
              <View style={[styles.noBrandIconBox, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                <FileText size={22} color="#F59E0B" />
              </View>
              <View style={styles.noBrandCardContent}>
                <Text style={[styles.noBrandCardTitle, { color: colors.textPrimary }]}>
                  Upload Brand PDF
                </Text>
                <Text style={[styles.noBrandCardDesc, { color: colors.textMuted }]}>
                  Upload a brand guide or deck - AI extracts your identity.
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Primary CTA */}
          <Button
            title="Start Your Brand Journey Now"
            onPress={() => setIsScraperOpen(true)}
            variant="amber"
            size="lg"
            icon={<Zap size={18} color="#FFFFFF" />}
            iconRight={<Compass size={18} color="#FFFFFF" />}
            style={styles.noBrandPrimaryBtn}
          />

          <Text style={[styles.noBrandFooterNote, { color: colors.textMuted }]}>
            Takes less than 60 seconds - Powered by AI ADS Intelligence Engine
          </Text>
        </ScrollView>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ACTIVE BRAND DNA VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader showBack onBack={() => navigation.goBack()} title="Brand Intelligence" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── UNIFIED BRAND HERO CARD (Combines Identity & Actions) ── */}
        <GlassCard style={styles.heroCard} variant="raised">
          <View style={styles.heroTopRow}>
            {/* Logo Avatar (Tap to Zoom) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowLogoModal(true)}
              style={styles.heroLogoWrap}
            >
              <Image
                source={{ uri: resolvedLogoUrl }}
                style={styles.heroLogoImage as any}
                resizeMode="contain"
              />
              <View style={styles.heroLogoZoomBadge}>
                <Maximize2 size={10} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            {/* Brand Title & Details */}
            <View style={styles.heroTitleCol}>
              <View style={styles.heroNameRow}>
                <Text style={[styles.heroBrandName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {effectiveProfile.companyName || activeWorkspace?.brandName || 'Your Brand'}
                </Text>
                <TouchableOpacity
                  onPress={() => toggleEdit('identity')}
                  style={[styles.heroEditBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
                >
                  {editState['identity'] ? (
                    <Check size={13} color="#10B981" />
                  ) : (
                    <Edit3 size={13} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>

              {effectiveProfile.website ? (
                <TouchableOpacity
                  onPress={() => {
                    const url = effectiveProfile.website.startsWith('http')
                      ? effectiveProfile.website
                      : `https://${effectiveProfile.website}`;
                    Linking.openURL(url).catch(() => {});
                  }}
                  style={styles.heroWebsiteRow}
                >
                  <Globe size={11} color="#10B981" />
                  <Text style={styles.heroWebsiteText} numberOfLines={1}>
                    {effectiveProfile.website}
                  </Text>
                  <ExternalLink size={9} color="#10B981" />
                </TouchableOpacity>
              ) : null}

              <Text style={[styles.heroBrandSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>
                Immutable brand memory governing voice, positioning, and content rules for{' '}
                <Text style={{ color: '#F59E0B', fontWeight: '700' }}>
                  {effectiveProfile.companyName || activeWorkspace?.brandName || 'your brand'}
                </Text>
              </Text>
            </View>
          </View>

          {/* Identity Edit Panel (Shown when editing) */}
          {editState['identity'] && (
            <View style={[styles.heroEditInputsBox, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}>
              <Text style={[styles.inputFieldLabel, { color: colors.textSecondary }]}>Company Name</Text>
              <TextInput
                value={effectiveProfile.companyName}
                onChangeText={(text) => handleFieldChangeLocal('companyName', text)}
                placeholder="Company Name..."
                placeholderTextColor={colors.textMuted}
                style={[styles.cleanInput, { color: colors.textPrimary }]}
              />

              <Text style={[styles.inputFieldLabel, { color: colors.textSecondary }]}>Website URL</Text>
              <TextInput
                value={effectiveProfile.website || effectiveProfile.domainUrl}
                onChangeText={(text) => handleFieldChangeLocal('website', text)}
                placeholder="https://yourbrand.com"
                placeholderTextColor={colors.textMuted}
                style={[styles.cleanInput, { color: '#F59E0B' }]}
              />

              <TouchableOpacity
                onPress={() => setShowLogoInput((prev) => !prev)}
                style={[styles.toggleLogoUrlBtn, { borderColor: 'rgba(245,158,11,0.3)' }]}
              >
                <ImageIcon size={13} color="#F59E0B" />
                <Text style={styles.toggleLogoUrlBtnText}>
                  {showLogoInput ? 'Hide Logo URL Input' : 'Update Brand Logo URL'}
                </Text>
              </TouchableOpacity>

              {showLogoInput && (
                <View style={styles.logoInputRow}>
                  <TextInput
                    value={logoUrlInput}
                    onChangeText={setLogoUrlInput}
                    placeholder="Paste direct image URL..."
                    placeholderTextColor={colors.textMuted}
                    style={[styles.cleanInput, { flex: 1, color: colors.textPrimary }]}
                  />
                  <TouchableOpacity
                    onPress={async () => {
                      if (!logoUrlInput.trim()) return;
                      handleFieldChangeLocal('logoUrl', logoUrlInput.trim());
                      await updateProfileField('logoUrl', logoUrlInput.trim());
                      setLogoUrlInput('');
                      setShowLogoInput(false);
                    }}
                    style={styles.logoApplyBtn}
                  >
                    <Text style={styles.logoApplyBtnText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Hero Action Buttons */}
          <View style={styles.heroActionsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleRunAiAnalysis}
              disabled={analyzing}
              style={[styles.heroAnalysisBtn, analyzing && { opacity: 0.6 }]}
            >
              <LinearGradient
                colors={['#D97706', '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroAnalysisBtnGrad}
              >
                {analyzing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Sparkles size={13} color="#FFFFFF" />
                )}
                <Text style={styles.heroAnalysisBtnText}>
                  {analyzing ? 'Analyzing...' : 'Run Deep AI Analysis'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSaveProfile}
              disabled={saving}
              style={styles.heroSaveBtn}
            >
              <LinearGradient
                colors={['#D97706', '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroSaveBtnGrad}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Save size={13} color="#FFFFFF" />
                )}
                <Text style={styles.heroSaveBtnText}>Save Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Saved Alert Banner */}
        {savedMsg ? (
          <View style={[styles.alertBanner, { backgroundColor: 'rgba(16,185,129,0.12)', borderColor: '#10B981' }]}>
            <CheckCircle2 size={14} color="#10B981" />
            <Text style={[styles.alertBannerText, { color: '#10B981' }]}>{savedMsg}</Text>
          </View>
        ) : null}

        {/* Error Alert Banner */}
        {error ? (
          <View style={[styles.alertBanner, { backgroundColor: 'rgba(239,68,68,0.12)', borderColor: '#EF4444' }]}>
            <AlertCircle size={14} color="#EF4444" />
            <Text style={[styles.alertBannerText, { color: '#EF4444' }]}>{error}</Text>
          </View>
        ) : null}

        {/* Loading Indicator */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading Brand DNA Memory...
            </Text>
          </View>
        ) : (
          <>

            {/* ── SECTION 1: THEME COLOR PALETTE (Clean Swatches, No Box Clutter) ── */}
            <GlassCard style={styles.cleanCard} variant="raised">
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleBox}>
                  <View style={[styles.sectionIconBadge, { backgroundColor: 'rgba(245,158,11,0.14)' }]}>
                    <Palette size={14} color="#F59E0B" />
                  </View>
                  <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>
                    Theme Color Palette
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={toggleEditBrandColors}
                  style={[styles.cleanEditBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {editState['brandColors'] ? (
                    <Check size={13} color="#10B981" />
                  ) : (
                    <Edit3 size={13} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Palette List (Clean vertical-aligned cards, no text wrapping) */}
              <View style={styles.paletteContainer}>
                {(() => {
                  const isEditingColors = editState['brandColors'];
                  const rawList = isEditingColors && colorDrafts
                    ? colorDrafts
                    : effectiveProfile.brandColors;

                  return (
                    <View style={styles.paletteWrap}>
                      {rawList.map((hex, idx) => {
                        const colorLabel =
                          idx === 0
                            ? 'Primary'
                            : idx === 1
                            ? 'Secondary'
                            : idx === 2
                            ? 'Accent'
                            : idx === 3
                            ? 'Neutral'
                            : `#${idx + 1}`;
                        const isCopied = copiedColor === hex;

                        return (
                          <TouchableOpacity
                            key={idx}
                            activeOpacity={isEditingColors ? 1 : 0.75}
                            onPress={() => !isEditingColors && handleCopyColor(hex)}
                            style={[
                              styles.colorCard,
                              {
                                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                                borderColor: isCopied ? '#10B981' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                              },
                            ]}
                          >
                            {/* Color Dot Swatch */}
                            <View style={[styles.colorDot, { backgroundColor: hex || '#F59E0B' }]} />

                            {/* Role Label */}
                            <Text
                              style={[styles.colorRoleText, { color: colors.textSecondary }]}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {colorLabel}
                            </Text>

                            {/* Hex Code (or Input if editing) */}
                            {isEditingColors ? (
                              <TextInput
                                value={hex}
                                onChangeText={(text) => handleColorDraftChange(idx, text)}
                                placeholder="#000000"
                                placeholderTextColor={colors.textMuted}
                                style={[styles.colorHexInput, { color: colors.textPrimary }]}
                                autoCapitalize="characters"
                              />
                            ) : (
                              <Text
                                style={[styles.colorHexText, { color: colors.textPrimary }]}
                                numberOfLines={1}
                              >
                                {hex}
                              </Text>
                            )}

                            {/* Copy Action Indicator */}
                            {!isEditingColors && (
                              <View
                                style={[
                                  styles.colorCopyPill,
                                  {
                                    backgroundColor: isCopied
                                      ? 'rgba(16,185,129,0.14)'
                                      : isDark
                                      ? 'rgba(255,255,255,0.06)'
                                      : 'rgba(0,0,0,0.04)',
                                  },
                                ]}
                              >
                                {isCopied ? (
                                  <>
                                    <Check size={9} color="#10B981" />
                                    <Text style={styles.colorCopiedText}>Copied</Text>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={9} color={colors.textMuted} />
                                    <Text style={[styles.colorCopyText, { color: colors.textMuted }]}>
                                      Copy
                                    </Text>
                                  </>
                                )}
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  );
                })()}
              </View>
            </GlassCard>

            {/* ── SECTION 2: BRAND OVERVIEW (Unified List with Hairlines, No 2x2 Box Clutter) ── */}
            <GlassCard style={styles.cleanCard} variant="raised">
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleBox}>
                  <View style={[styles.sectionIconBadge, { backgroundColor: 'rgba(245,158,11,0.14)' }]}>
                    <Building2 size={14} color="#F59E0B" />
                  </View>
                  <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>
                    Brand Overview
                  </Text>
                </View>
              </View>

              <View style={styles.unifiedListContainer}>
                {/* Row 1: Industry */}
                <View style={styles.unifiedRow}>
                  <View style={styles.unifiedRowLeft}>
                    <View style={styles.unifiedFieldIconBox}>
                      <Briefcase size={13} color="#F59E0B" />
                    </View>
                    <Text style={[styles.unifiedFieldLabel, { color: colors.textSecondary }]}>Industry</Text>
                  </View>
                  <View style={styles.unifiedRowRight}>
                    {editState['industryCategory'] ? (
                      <TextInput
                        value={effectiveProfile.industryCategory || ''}
                        onChangeText={(text) => handleFieldChangeLocal('industryCategory', text)}
                        placeholder="Industry..."
                        placeholderTextColor={colors.textMuted}
                        style={[styles.unifiedInput, { color: colors.textPrimary }]}
                      />
                    ) : (
                      <Text style={[styles.unifiedFieldValue, { color: colors.textPrimary }]} numberOfLines={2}>
                        {effectiveProfile.industryCategory || 'Not specified'}
                      </Text>
                    )}
                    <TouchableOpacity
                      onPress={() => toggleEdit('industryCategory')}
                      style={styles.fieldActionBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {editState['industryCategory'] ? (
                        <Check size={12} color="#10B981" />
                      ) : (
                        <Edit3 size={12} color={colors.textMuted} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.hairlineDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />

                {/* Row 1b: Business Type */}
                <View style={styles.unifiedRow}>
                  <View style={styles.unifiedRowLeft}>
                    <View style={styles.unifiedFieldIconBox}>
                      <Briefcase size={13} color="#F59E0B" />
                    </View>
                    <Text style={[styles.unifiedFieldLabel, { color: colors.textSecondary }]}>Business Type</Text>
                  </View>
                  <View style={styles.unifiedRowRight}>
                    {editState['businessType'] ? (
                      <TextInput
                        value={effectiveProfile.businessType || ''}
                        onChangeText={(text) => handleFieldChangeLocal('businessType', text)}
                        placeholder="Business type..."
                        placeholderTextColor={colors.textMuted}
                        style={[styles.unifiedInput, { color: colors.textPrimary }]}
                      />
                    ) : (
                      <Text style={[styles.unifiedFieldValue, { color: colors.textPrimary }]} numberOfLines={2}>
                        {effectiveProfile.businessType || 'Not specified'}
                      </Text>
                    )}
                    <TouchableOpacity
                      onPress={() => toggleEdit('businessType')}
                      style={styles.fieldActionBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {editState['businessType'] ? (
                        <Check size={12} color="#10B981" />
                      ) : (
                        <Edit3 size={12} color={colors.textMuted} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.hairlineDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />

                {/* Row 2: Headquarters */}
                <View style={styles.unifiedRow}>
                  <View style={styles.unifiedRowLeft}>
                    <View style={styles.unifiedFieldIconBox}>
                      <MapPin size={13} color="#F59E0B" />
                    </View>
                    <Text style={[styles.unifiedFieldLabel, { color: colors.textSecondary }]}>Headquarters</Text>
                  </View>
                  <View style={styles.unifiedRowRight}>
                    {editState['headquarters'] ? (
                      <TextInput
                        value={effectiveProfile.headquarters || ''}
                        onChangeText={(text) => handleFieldChangeLocal('headquarters', text)}
                        placeholder="Headquarters..."
                        placeholderTextColor={colors.textMuted}
                        style={[styles.unifiedInput, { color: colors.textPrimary }]}
                      />
                    ) : (
                      <Text style={[styles.unifiedFieldValue, { color: colors.textPrimary }]} numberOfLines={2}>
                        {effectiveProfile.headquarters || 'Address not found'}
                      </Text>
                    )}
                    <TouchableOpacity
                      onPress={() => toggleEdit('headquarters')}
                      style={styles.fieldActionBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {editState['headquarters'] ? (
                        <Check size={12} color="#10B981" />
                      ) : (
                        <Edit3 size={12} color={colors.textMuted} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.hairlineDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />

                {/* Row 3: Tagline / Slogan */}
                <View style={styles.unifiedRow}>
                  <View style={styles.unifiedRowLeft}>
                    <View style={styles.unifiedFieldIconBox}>
                      <Quote size={13} color="#F59E0B" />
                    </View>
                    <Text style={[styles.unifiedFieldLabel, { color: colors.textSecondary }]}>Tagline / Slogan</Text>
                  </View>
                  <View style={styles.unifiedRowRight}>
                    {editState['tagline'] ? (
                      <TextInput
                        value={effectiveProfile.tagline || ''}
                        onChangeText={(text) => handleFieldChangeLocal('tagline', text)}
                        placeholder="Tagline or slogan..."
                        placeholderTextColor={colors.textMuted}
                        style={[styles.unifiedInput, { color: colors.textPrimary }]}
                      />
                    ) : (
                      <Text style={[styles.unifiedFieldValue, { color: colors.textPrimary, fontStyle: effectiveProfile.tagline ? 'italic' : 'normal' }]} numberOfLines={2}>
                        {effectiveProfile.tagline ? `"${effectiveProfile.tagline}"` : 'Not specified'}
                      </Text>
                    )}
                    <TouchableOpacity
                      onPress={() => toggleEdit('tagline')}
                      style={styles.fieldActionBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {editState['tagline'] ? (
                        <Check size={12} color="#10B981" />
                      ) : (
                        <Edit3 size={12} color={colors.textMuted} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.hairlineDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />

                {/* Row 4: Contact Info */}
                <View style={styles.unifiedRow}>
                  <View style={styles.unifiedRowLeft}>
                    <View style={styles.unifiedFieldIconBox}>
                      <Mail size={13} color="#F59E0B" />
                    </View>
                    <Text style={[styles.unifiedFieldLabel, { color: colors.textSecondary }]}>Contact</Text>
                  </View>
                  <View style={styles.unifiedRowRight}>
                    {editState['contactInfo'] ? (
                      <TextInput
                        value={
                          typeof effectiveProfile.contactInfo === 'string'
                            ? effectiveProfile.contactInfo
                            : `${effectiveProfile.contactInfo?.email || ''}${effectiveProfile.contactInfo?.phone ? ' | ' + effectiveProfile.contactInfo.phone : ''}`
                        }
                        onChangeText={(text) => handleFieldChangeLocal('contactInfo', text)}
                        placeholder="Email or phone..."
                        placeholderTextColor={colors.textMuted}
                        style={[styles.unifiedInput, { color: colors.textPrimary }]}
                      />
                    ) : (
                      <Text style={[styles.unifiedFieldValue, { color: colors.textPrimary }]} numberOfLines={2}>
                        {typeof effectiveProfile.contactInfo === 'string'
                          ? effectiveProfile.contactInfo || 'Not specified'
                          : effectiveProfile.contactInfo?.email || effectiveProfile.contactInfo?.phone
                          ? `${effectiveProfile.contactInfo.email || ''}${effectiveProfile.contactInfo.phone ? ' | ' + effectiveProfile.contactInfo.phone : ''}`
                          : 'Not specified'}
                      </Text>
                    )}
                    <TouchableOpacity
                      onPress={() => toggleEdit('contactInfo')}
                      style={styles.fieldActionBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {editState['contactInfo'] ? (
                        <Check size={12} color="#10B981" />
                      ) : (
                        <Edit3 size={12} color={colors.textMuted} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </GlassCard>

            {/* ── SECTION 3: PURPOSE & VISION (Clean Editorial Quotes, No Nested Boxes) ── */}
            <GlassCard style={styles.cleanCard} variant="raised">
              {/* Mission Statement Block */}
              <View style={styles.editorialBlock}>
                <View style={styles.editorialHeaderRow}>
                  <View style={styles.editorialTitleRow}>
                    <View style={[styles.sectionIconBadge, { backgroundColor: 'rgba(245,158,11,0.14)' }]}>
                      <Compass size={13} color="#F59E0B" />
                    </View>
                    <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>
                      Mission Statement
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleEdit('missionStatement')}
                    style={[styles.cleanEditBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {editState['missionStatement'] ? (
                      <Check size={13} color="#10B981" />
                    ) : (
                      <Edit3 size={13} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>

                {editState['missionStatement'] ? (
                  <TextInput
                    multiline
                    scrollEnabled={false}
                    value={effectiveProfile.missionStatement || ''}
                    onChangeText={(text) => handleFieldChangeLocal('missionStatement', text)}
                    placeholder="Enter mission statement..."
                    placeholderTextColor={colors.textMuted}
                    style={[styles.cleanMultilineInput, { color: colors.textPrimary }]}
                  />
                ) : (
                  <View style={styles.editorialQuoteRow}>
                    <View style={styles.editorialAccentBar} />
                    <Text style={[styles.editorialQuoteText, { color: colors.textPrimary }]}>
                      {effectiveProfile.missionStatement
                        ? `"${effectiveProfile.missionStatement}"`
                        : 'Mission statement not available'}
                    </Text>
                  </View>
                )}
              </View>

              <View style={[styles.hairlineDivider, { marginVertical: 14, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />

              {/* Company Vision Block */}
              <View style={styles.editorialBlock}>
                <View style={styles.editorialHeaderRow}>
                  <View style={styles.editorialTitleRow}>
                    <View style={[styles.sectionIconBadge, { backgroundColor: 'rgba(245,158,11,0.14)' }]}>
                      <Eye size={13} color="#F59E0B" />
                    </View>
                    <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>
                      Company Vision
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleEdit('vision')}
                    style={[styles.cleanEditBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {editState['vision'] ? (
                      <Check size={13} color="#10B981" />
                    ) : (
                      <Edit3 size={13} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>

                {editState['vision'] ? (
                  <TextInput
                    multiline
                    scrollEnabled={false}
                    value={effectiveProfile.vision || ''}
                    onChangeText={(text) => handleFieldChangeLocal('vision', text)}
                    placeholder="Enter company vision..."
                    placeholderTextColor={colors.textMuted}
                    style={[styles.cleanMultilineInput, { color: colors.textPrimary }]}
                  />
                ) : (
                  <View style={styles.editorialQuoteRow}>
                    <View style={styles.editorialAccentBar} />
                    <Text style={[styles.editorialQuoteText, { color: colors.textPrimary }]}>
                      {effectiveProfile.vision
                        ? `"${effectiveProfile.vision}"`
                        : 'Company vision not available'}
                    </Text>
                  </View>
                )}
              </View>
            </GlassCard>

            {/* ── SECTION 4: TARGET AUDIENCE (Clean Bulleted List, No Nested Boxes) ── */}
            <GlassCard style={styles.cleanCard} variant="raised">
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleBox}>
                  <View style={[styles.sectionIconBadge, { backgroundColor: 'rgba(245,158,11,0.14)' }]}>
                    <Target size={14} color="#F59E0B" />
                  </View>
                  <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>
                    Target Audience
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => toggleEdit('targetAudience')}
                  style={[styles.cleanEditBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {editState['targetAudience'] ? (
                    <Check size={13} color="#10B981" />
                  ) : (
                    <Edit3 size={13} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>

              {editState['targetAudience'] ? (
                <TextInput
                  multiline
                  scrollEnabled={false}
                  value={
                    Array.isArray(effectiveProfile.targetAudience)
                      ? effectiveProfile.targetAudience.join('\n')
                      : String(effectiveProfile.targetAudience || '')
                  }
                  onChangeText={(text) => handleFieldChangeLocal('targetAudience', text)}
                  placeholder="Enter target segments (one per line)..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.cleanMultilineInput, { color: colors.textPrimary }]}
                />
              ) : effectiveProfile.targetAudience.length > 0 ? (
                <View style={styles.cleanListContainer}>
                  {effectiveProfile.targetAudience.map((audience, i) => (
                    <View key={i} style={styles.cleanListItem}>
                      <View style={styles.audienceBulletDot} />
                      <Text style={[styles.cleanListItemText, { color: colors.textPrimary }]}>
                        {audience}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[styles.cleanEmptyText, { color: colors.textMuted }]}>
                  Target audience not specified. Tap edit icon to add.
                </Text>
              )}
            </GlassCard>

            {/* ── SECTION 5: CORE PRODUCTS & SERVICES (Clean Pill Chips) ── */}
            <GlassCard style={styles.cleanCard} variant="raised">
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleBox}>
                  <View style={[styles.sectionIconBadge, { backgroundColor: 'rgba(245,158,11,0.14)' }]}>
                    <Zap size={14} color="#F59E0B" />
                  </View>
                  <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>
                    Core Products & Services
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => toggleEdit('coreProductsServices')}
                  style={[styles.cleanEditBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {editState['coreProductsServices'] ? (
                    <Check size={13} color="#10B981" />
                  ) : (
                    <Edit3 size={13} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>

              {editState['coreProductsServices'] ? (
                <TextInput
                  multiline
                  scrollEnabled={false}
                  value={
                    Array.isArray(effectiveProfile.coreProductsServices)
                      ? effectiveProfile.coreProductsServices.join('\n')
                      : String(effectiveProfile.coreProductsServices || '')
                  }
                  onChangeText={(text) => handleFieldChangeLocal('coreProductsServices', text)}
                  placeholder="Enter core products (one per line)..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.cleanMultilineInput, { color: colors.textPrimary }]}
                />
              ) : effectiveProfile.coreProductsServices.length > 0 ? (
                <View style={styles.cleanChipsWrap}>
                  {effectiveProfile.coreProductsServices.map((product, i) => (
                    <View
                      key={i}
                      style={[
                        styles.cleanProductPill,
                        {
                          backgroundColor: isDark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.08)',
                          borderColor: isDark ? 'rgba(245,158,11,0.22)' : 'rgba(245,158,11,0.2)',
                        },
                      ]}
                    >
                      <View style={styles.cleanProductDot} />
                      <Text style={[styles.cleanProductText, { color: colors.textPrimary }]}>
                        {product}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[styles.cleanEmptyText, { color: colors.textMuted }]}>
                  No core products specified. Tap edit icon to add.
                </Text>
              )}
            </GlassCard>

            {/* ── SECTION 6: EXTRACTED MARKETING CLAIMS (Clean Quotes, No Nested Boxes) ── */}
            {effectiveProfile.extractedClaims.length > 0 && (
              <GlassCard style={styles.cleanCard} variant="raised">
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleBox}>
                    <View style={[styles.sectionIconBadge, { backgroundColor: 'rgba(245,158,11,0.14)' }]}>
                      <FileText size={14} color="#F59E0B" />
                    </View>
                    <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>
                      Extracted Marketing Claims
                    </Text>
                  </View>
                </View>

                <View style={styles.cleanClaimsContainer}>
                  {effectiveProfile.extractedClaims.map((claim, idx) => (
                    <View key={idx} style={styles.cleanClaimRow}>
                      <Text style={styles.claimQuoteMark}>“</Text>
                      <Text style={[styles.cleanClaimText, { color: colors.textPrimary }]}>
                        {claim.claimText || claim}
                      </Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            )}

            {/* ── BOTTOM ACTION: CONTINUE TO SEO ── */}
            <View style={styles.bottomContinueContainer}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('More', { screen: 'SEO' })}
                style={styles.continueToSeoBtn}
              >
                <LinearGradient
                  colors={['#D97706', '#F59E0B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.continueToSeoGrad}
                >
                  <Search size={15} color="#FFFFFF" />
                  <Text style={styles.continueToSeoText}>Continue to SEO</Text>
                  <ChevronRight size={15} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* ─────────────────────────────────────────────────────────────────────────────
          HIGH-RESOLUTION LOGO PREVIEW MODAL
      ───────────────────────────────────────────────────────────────────────────── */}
      <Modal
        visible={showLogoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowLogoModal(false)}
          style={styles.modalBackdrop}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.logoModalCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalHeaderTitleBox}>
                <View style={[styles.modalHeaderIconBox, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                  <ImageIcon size={16} color="#F59E0B" />
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                    {effectiveProfile.companyName || 'Brand'} Logo
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                    High-resolution brand logo preview
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowLogoModal(false)}
                style={[styles.modalCloseBtn, { backgroundColor: isDark ? '#1F2532' : '#E2E8F0' }]}
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Large Image Preview Box */}
            <View
              style={[
                styles.modalImageBox,
                {
                  backgroundColor: isDark ? '#0D1017' : '#F1F5F9',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                },
              ]}
            >
              <Image
                source={{
                  uri:
                    modalImgSrc ||
                    (effectiveProfile.logoUrl && !effectiveProfile.logoUrl.includes('picsum.photos')
                      ? effectiveProfile.logoUrl
                      : `https://www.google.com/s2/favicons?domain=${(effectiveProfile.website || effectiveProfile.domainUrl || activeWorkspace?.domainUrl || 'brand.com').replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0]}&sz=256`),
                }}
                style={styles.modalLargeImage as any}
                resizeMode="contain"
                onError={handleModalImgError}
              />
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                onPress={() => {
                  setShowLogoModal(false);
                  toggleEdit('identity');
                  setShowLogoInput(true);
                }}
                style={[styles.modalActionBtn, { backgroundColor: 'rgba(245,158,11,0.15)' }]}
              >
                <Upload size={14} color="#F59E0B" />
                <Text style={[styles.modalActionBtnText, { color: '#F59E0B' }]}>Replace Logo</Text>
              </TouchableOpacity>

              {modalImgSrc ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(modalImgSrc).catch(() => {})}
                  style={[styles.modalActionBtn, { backgroundColor: isDark ? '#1F2532' : '#E2E8F0' }]}
                >
                  <ExternalLink size={14} color={colors.textPrimary} />
                  <Text style={[styles.modalActionBtnText, { color: colors.textPrimary }]}>Full URL</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                onPress={() => setShowLogoModal(false)}
                style={styles.modalDismissBtn}
              >
                <LinearGradient
                  colors={['#D97706', '#F59E0B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalDismissGrad}
                >
                  <Text style={styles.modalDismissBtnText}>Done</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 110,
    gap: 12,
  },

  // ── No Brand Gate Styles ──
  noBrandScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 110,
    alignItems: 'center',
  },
  dnaGlowContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  dnaPulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.35,
  },
  dnaIconSquircle: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  noBrandHeroTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  noBrandSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: 18,
  },
  noBrandCardsContainer: {
    width: '100%',
    gap: 8,
    marginBottom: 18,
  },
  noBrandActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  noBrandIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noBrandCardContent: {
    flex: 1,
  },
  noBrandCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 1,
  },
  noBrandCardDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  noBrandPrimaryBtn: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 12,
  },
  noBrandFooterNote: {
    fontSize: 11,
    textAlign: 'center',
  },

  // ── Unified Hero Card Styles ──
  heroCard: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    gap: 12,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroLogoWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  heroLogoImage: {
    width: '100%',
    height: '100%',
  },
  heroLogoZoomBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    padding: 3,
  },
  heroTitleCol: {
    flex: 1,
    gap: 3,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  heroBrandName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    flex: 1,
  },
  heroEditBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroWebsiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 1,
  },
  heroWebsiteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    flexShrink: 1,
  },
  heroBrandSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  heroEditInputsBox: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 6,
  },
  inputFieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cleanInput: {
    fontSize: 13,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  toggleLogoUrlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    marginTop: 4,
  },
  toggleLogoUrlBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#F59E0B',
  },
  logoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  logoApplyBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  logoApplyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroAnalysisBtn: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  heroAnalysisBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    gap: 6,
  },
  heroAnalysisBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  heroSaveBtn: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  heroSaveBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    gap: 6,
  },
  heroSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },

  // ── Alert Banners ──
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  alertBannerText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },

  // ── Loading ──
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
  },

  // ── Unified Clean Cards & Section Headers ──
  cleanCard: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sectionIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cleanEditBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Theme Color Palette (Clean Cards, Perfectly Aligned) ──
  paletteContainer: {
    width: '100%',
  },
  paletteWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorCard: {
    flex: 1,
    minWidth: 86,
    maxWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    gap: 3,
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 1.5,
  },
  colorRoleText: {
    fontSize: 9.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    textAlign: 'center',
  },
  colorHexText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  colorHexInput: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    textAlign: 'center',
    width: '100%',
  },
  colorCopyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 5,
    gap: 3,
    marginTop: 1,
  },
  colorCopyText: {
    fontSize: 9.5,
    fontWeight: '600',
  },
  colorCopiedText: {
    color: '#10B981',
    fontSize: 9.5,
    fontWeight: '700',
  },

  // ── Unified Brand Overview (Hairline List, No 2x2 Box Clutter) ──
  unifiedListContainer: {
    width: '100%',
  },
  unifiedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 10,
  },
  unifiedRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    width: 120,
    flexShrink: 0,
    paddingTop: 1,
  },
  unifiedFieldIconBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: 'rgba(245,158,11,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unifiedFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  unifiedRowRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  unifiedFieldValue: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  unifiedInput: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    textAlign: 'left',
  },
  fieldActionBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hairlineDivider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },

  // ── Purpose & Vision (Clean Editorial Quotes) ──
  editorialBlock: {
    width: '100%',
    gap: 8,
  },
  editorialHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editorialTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  editorialQuoteRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
    paddingLeft: 2,
    paddingVertical: 2,
  },
  editorialAccentBar: {
    width: 3.5,
    borderRadius: 2,
    backgroundColor: '#F59E0B',
  },
  editorialQuoteText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  cleanMultilineInput: {
    fontSize: 13,
    lineHeight: 19,
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    padding: 8,
    textAlignVertical: 'top',
  },

  // ── Target Audience (Clean Bulleted List) ──
  cleanListContainer: {
    width: '100%',
    gap: 8,
  },
  cleanListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    paddingVertical: 2,
  },
  audienceBulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginTop: 7,
    flexShrink: 0,
  },
  cleanListItemText: {
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '500',
    flex: 1,
  },
  cleanEmptyText: {
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 4,
  },

  // ── Products & Services (Clean Pill Chips) ──
  cleanChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cleanProductPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  cleanProductDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#F59E0B',
  },
  cleanProductText: {
    fontSize: 12.5,
    fontWeight: '600',
  },

  // ── Extracted Claims (Clean Quote Rows) ──
  cleanClaimsContainer: {
    width: '100%',
    gap: 10,
  },
  cleanClaimRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingVertical: 2,
  },
  claimQuoteMark: {
    fontSize: 18,
    lineHeight: 18,
    fontWeight: '700',
    color: '#F59E0B',
  },
  cleanClaimText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },

  // ── Bottom Continue Button ──
  bottomContinueContainer: {
    marginTop: 10,
    marginBottom: 16,
    alignItems: 'center',
    width: '100%',
  },
  continueToSeoBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  continueToSeoGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  continueToSeoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ── Modal Styles ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  logoModalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalHeaderTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalHeaderIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 11,
  },
  modalCloseBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImageBox: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  modalLargeImage: {
    width: '85%',
    height: '85%',
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 7,
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 5,
  },
  modalActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modalDismissBtn: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalDismissGrad: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  modalDismissBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
