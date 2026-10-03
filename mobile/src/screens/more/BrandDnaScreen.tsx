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
        navigation.navigate('Strategy', { screen: 'Campaigns' });
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
        {/* Header Banner */}
        <GlassCard style={styles.headerBannerCard} variant="raised">
          <View style={styles.bannerRow}>
            <LinearGradient
              colors={['#D97706', '#F59E0B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bannerIconBox}
            >
              <Dna size={18} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.bannerTextCol}>
              <Text style={[styles.bannerTitle, { color: colors.textPrimary }]}>
                Brand Intelligence & Brand DNA
              </Text>
              <Text style={[styles.bannerSubtitle, { color: colors.textSecondary }]}>
                Immutable brand memory governing voice, positioning, and content rules for{' '}
                <Text style={{ color: '#F59E0B', fontWeight: '700' }}>
                  {effectiveProfile.companyName || activeWorkspace?.brandName || 'your brand'}
                </Text>
              </Text>
            </View>
          </View>

          {/* Banner Action Buttons */}
          <View style={styles.bannerActionsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleRunAiAnalysis}
              disabled={analyzing}
              style={[styles.analysisBtn, analyzing && { opacity: 0.6 }]}
            >
              <LinearGradient
                colors={['#D97706', '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.analysisBtnGrad}
              >
                {analyzing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Sparkles size={13} color="#FFFFFF" />
                )}
                <Text style={styles.analysisBtnText}>
                  {analyzing ? 'Analyzing...' : 'Run Deep AI Analysis'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSaveProfile}
              disabled={saving}
              style={styles.saveProfileBtn}
            >
              <LinearGradient
                colors={['#D97706', '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveProfileBtnGrad}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Save size={13} color="#FFFFFF" />
                )}
                <Text style={styles.saveProfileBtnText}>Save Profile</Text>
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
            {/* ── CARD 1: Brand Identity ── */}
            <GlassCard style={styles.sectionCard} variant="raised">
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardTitleBox}>
                  <View style={[styles.cardHeaderIconBox, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                    <Globe size={12} color="#F59E0B" />
                  </View>
                  <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary }]}>
                    Brand Identity
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleEdit('identity')}
                  style={[styles.editIconButton, { backgroundColor: isDark ? '#1F2532' : '#E2E8F0' }]}
                >
                  {editState['identity'] ? (
                    <Check size={12} color="#10B981" />
                  ) : (
                    <Edit3 size={12} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.identityInnerBox}>
                <View style={styles.identityRow}>
                  {/* Logo Squircle (Tap to Zoom) */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowLogoModal(true)}
                    style={styles.logoSquircle}
                  >
                    <Image
                      source={{ uri: resolvedLogoUrl }}
                      style={styles.logoImage as any}
                      resizeMode="contain"
                    />
                    <View style={styles.logoZoomOverlay}>
                      <Maximize2 size={9} color="#FFFFFF" />
                    </View>
                  </TouchableOpacity>

                  {/* Company Name & Domain */}
                  <View style={styles.identityDetailsCol}>
                    {editState['identity'] ? (
                      <View style={styles.identityInputsCol}>
                        <TextInput
                          value={effectiveProfile.companyName}
                          onChangeText={(text) => handleFieldChangeLocal('companyName', text)}
                          placeholder="Company Name..."
                          placeholderTextColor={colors.textMuted}
                          style={[styles.inlineInput, { color: colors.textPrimary, borderColor: '#F59E0B' }]}
                        />
                        <TextInput
                          value={effectiveProfile.website || effectiveProfile.domainUrl}
                          onChangeText={(text) => handleFieldChangeLocal('website', text)}
                          placeholder="https://yourbrand.com"
                          placeholderTextColor={colors.textMuted}
                          style={[styles.inlineInput, { color: '#F59E0B', borderColor: '#F59E0B' }]}
                        />
                      </View>
                    ) : (
                      <>
                        <Text style={[styles.identityCompanyName, { color: colors.textPrimary }]}>
                          {effectiveProfile.companyName}
                        </Text>
                        {effectiveProfile.website ? (
                          <TouchableOpacity
                            onPress={() => {
                              const url = effectiveProfile.website.startsWith('http')
                                ? effectiveProfile.website
                                : `https://${effectiveProfile.website}`;
                              Linking.openURL(url).catch(() => {});
                            }}
                            style={styles.websiteLinkRow}
                          >
                            <Globe size={11} color="#10B981" />
                            <Text style={styles.websiteLinkText} numberOfLines={1}>
                              {effectiveProfile.website}
                            </Text>
                            <ExternalLink size={9} color="#10B981" />
                          </TouchableOpacity>
                        ) : null}
                      </>
                    )}
                  </View>
                </View>

                {/* Edit Mode: Logo URL Input Panel */}
                {editState['identity'] && (
                  <View style={styles.logoEditPanel}>
                    <TouchableOpacity
                      onPress={() => setShowLogoInput((prev) => !prev)}
                      style={[styles.toggleLogoInputBtn, { borderColor: 'rgba(245,158,11,0.4)' }]}
                    >
                      <ImageIcon size={13} color="#F59E0B" />
                      <Text style={styles.toggleLogoInputBtnText}>
                        {showLogoInput ? 'Hide Logo URL Input' : 'Change Brand Logo URL'}
                      </Text>
                    </TouchableOpacity>

                    {showLogoInput && (
                      <View style={styles.logoInputRow}>
                        <TextInput
                          value={logoUrlInput}
                          onChangeText={setLogoUrlInput}
                          placeholder="Paste image URL..."
                          placeholderTextColor={colors.textMuted}
                          style={[styles.logoUrlInput, { color: colors.textPrimary }]}
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
              </View>
            </GlassCard>

            {/* ── CARD 2: Theme Color Palette ── */}
            <GlassCard style={styles.sectionCard} variant="raised">
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardTitleBox}>
                  <View style={[styles.cardHeaderIconBox, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                    <Palette size={12} color="#F59E0B" />
                  </View>
                  <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary }]}>
                    Theme Color Palette
                  </Text>
                </View>

                <View style={styles.paletteHeaderActions}>
                  <Badge
                    label={`${effectiveProfile.brandColors.length} Fetched`}
                    variant="warning"
                  />
                  <TouchableOpacity
                    onPress={toggleEditBrandColors}
                    style={[styles.editIconButton, { backgroundColor: isDark ? '#1F2532' : '#E2E8F0' }]}
                  >
                    {editState['brandColors'] ? (
                      <Check size={12} color="#10B981" />
                    ) : (
                      <Edit3 size={12} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Swatch Grid */}
              <View style={styles.colorSwatchesGrid}>
                {(() => {
                  const isEditingColors = editState['brandColors'];
                  const rawList = isEditingColors && colorDrafts
                    ? colorDrafts
                    : effectiveProfile.brandColors;

                  return rawList.map((hex, idx) => {
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
                      <View
                        key={idx}
                        style={[
                          styles.colorSwatchCard,
                          {
                            backgroundColor: isDark ? '#11151D' : '#DFE5EF',
                            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                          },
                        ]}
                      >
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => !isEditingColors && handleCopyColor(hex)}
                          style={[styles.swatchColorBar, { backgroundColor: hex || '#F59E0B' }]}
                        >
                          {isCopied ? (
                            <View style={styles.copiedBadge}>
                              <Check size={8} color="#10B981" />
                              <Text style={styles.copiedBadgeText}>Copied</Text>
                            </View>
                          ) : (
                            <View style={styles.copyIconBadge}>
                              <Copy size={9} color="#FFFFFF" />
                            </View>
                          )}
                        </TouchableOpacity>

                        <Text style={[styles.swatchLabel, { color: colors.textMuted }]}>
                          {colorLabel}
                        </Text>

                        {isEditingColors ? (
                          <TextInput
                            value={hex}
                            onChangeText={(text) => handleColorDraftChange(idx, text)}
                            placeholder="#000000"
                            placeholderTextColor={colors.textMuted}
                            style={[styles.hexInput, { color: colors.textPrimary }]}
                          />
                        ) : (
                          <Text style={[styles.hexText, { color: colors.textPrimary }]}>
                            {hex}
                          </Text>
                        )}
                      </View>
                    );
                  });
                })()}
              </View>
            </GlassCard>

            {/* ── CARD 3: Quick Attributes (2x2 Grid) ── */}
            <View style={styles.attributesGrid}>
              {/* Industry */}
              <GlassCard style={styles.attributeCard} variant="raised">
                <View style={styles.attributeHeaderRow}>
                  <View style={styles.attrHeaderTitleBox}>
                    <BarChart2 size={12} color="#F59E0B" />
                    <Text style={[styles.attrTitle, { color: colors.textPrimary }]}>Industry</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleEdit('industryCategory')}
                    style={styles.attrEditBtn}
                  >
                    {editState['industryCategory'] ? (
                      <Check size={11} color="#10B981" />
                    ) : (
                      <Edit3 size={11} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>

                {editState['industryCategory'] ? (
                  <TextInput
                    value={effectiveProfile.industryCategory || ''}
                    onChangeText={(text) => handleFieldChangeLocal('industryCategory', text)}
                    placeholder="Enter industry..."
                    placeholderTextColor={colors.textMuted}
                    style={[styles.attrInput, { color: colors.textPrimary }]}
                  />
                ) : (
                  <Text style={[styles.attrValueText, { color: colors.textPrimary }]} numberOfLines={2}>
                    {effectiveProfile.industryCategory || 'Not specified'}
                  </Text>
                )}
              </GlassCard>

              {/* Headquarters */}
              <GlassCard style={styles.attributeCard} variant="raised">
                <View style={styles.attributeHeaderRow}>
                  <View style={styles.attrHeaderTitleBox}>
                    <Compass size={12} color="#F59E0B" />
                    <Text style={[styles.attrTitle, { color: colors.textPrimary }]}>
                      Headquarters
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleEdit('headquarters')}
                    style={styles.attrEditBtn}
                  >
                    {editState['headquarters'] ? (
                      <Check size={11} color="#10B981" />
                    ) : (
                      <Edit3 size={11} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>

                {editState['headquarters'] ? (
                  <TextInput
                    value={effectiveProfile.headquarters || ''}
                    onChangeText={(text) => handleFieldChangeLocal('headquarters', text)}
                    placeholder="Enter headquarters..."
                    placeholderTextColor={colors.textMuted}
                    style={[styles.attrInput, { color: colors.textPrimary }]}
                  />
                ) : (
                  <Text style={[styles.attrValueText, { color: colors.textPrimary }]} numberOfLines={2}>
                    {effectiveProfile.headquarters || 'Address not found'}
                  </Text>
                )}
              </GlassCard>

              {/* Tagline */}
              <GlassCard style={styles.attributeCard} variant="raised">
                <View style={styles.attributeHeaderRow}>
                  <View style={styles.attrHeaderTitleBox}>
                    <MessageSquare size={12} color="#F59E0B" />
                    <Text style={[styles.attrTitle, { color: colors.textPrimary }]}>
                      Tagline / Slogan
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleEdit('tagline')}
                    style={styles.attrEditBtn}
                  >
                    {editState['tagline'] ? (
                      <Check size={11} color="#10B981" />
                    ) : (
                      <Edit3 size={11} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>

                {editState['tagline'] ? (
                  <TextInput
                    value={effectiveProfile.tagline || ''}
                    onChangeText={(text) => handleFieldChangeLocal('tagline', text)}
                    placeholder="Enter tagline..."
                    placeholderTextColor={colors.textMuted}
                    style={[styles.attrInput, { color: colors.textPrimary }]}
                  />
                ) : (
                  <Text style={[styles.attrValueText, { color: colors.textPrimary }]} numberOfLines={2}>
                    {effectiveProfile.tagline ? `"${effectiveProfile.tagline}"` : 'Not specified'}
                  </Text>
                )}
              </GlassCard>

              {/* Contact Info */}
              <GlassCard style={styles.attributeCard} variant="raised">
                <View style={styles.attributeHeaderRow}>
                  <View style={styles.attrHeaderTitleBox}>
                    <Globe size={12} color="#F59E0B" />
                    <Text style={[styles.attrTitle, { color: colors.textPrimary }]}>
                      Contact Info
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleEdit('contactInfo')}
                    style={styles.attrEditBtn}
                  >
                    {editState['contactInfo'] ? (
                      <Check size={11} color="#10B981" />
                    ) : (
                      <Edit3 size={11} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>

                {editState['contactInfo'] ? (
                  <TextInput
                    value={
                      typeof effectiveProfile.contactInfo === 'string'
                        ? effectiveProfile.contactInfo
                        : `${effectiveProfile.contactInfo?.email || ''}${effectiveProfile.contactInfo?.phone ? ' | ' + effectiveProfile.contactInfo.phone : ''}`
                    }
                    onChangeText={(text) => handleFieldChangeLocal('contactInfo', text)}
                    placeholder="Enter email or phone..."
                    placeholderTextColor={colors.textMuted}
                    style={[styles.attrInput, { color: colors.textPrimary }]}
                  />
                ) : (
                  <Text style={[styles.attrValueText, { color: colors.textPrimary }]} numberOfLines={2}>
                    {typeof effectiveProfile.contactInfo === 'string'
                      ? effectiveProfile.contactInfo || 'Not specified'
                      : effectiveProfile.contactInfo?.email || effectiveProfile.contactInfo?.phone
                      ? `${effectiveProfile.contactInfo.email || ''}${effectiveProfile.contactInfo.phone ? ' | ' + effectiveProfile.contactInfo.phone : ''}`
                      : 'Not specified'}
                  </Text>
                )}
              </GlassCard>
            </View>

            {/* ── CARD 4: Core DNA Positioning Statements ── */}
            {/* Mission Statement */}
            <GlassCard style={styles.sectionCard} variant="raised">
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardTitleBox}>
                  <View style={[styles.cardHeaderIconBox, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                    <Compass size={12} color="#F59E0B" />
                  </View>
                  <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary }]}>
                    Mission Statement
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleEdit('missionStatement')}
                  style={[styles.editIconButton, { backgroundColor: isDark ? '#1F2532' : '#E2E8F0' }]}
                >
                  {editState['missionStatement'] ? (
                    <Check size={12} color="#10B981" />
                  ) : (
                    <Edit3 size={12} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>

              {editState['missionStatement'] ? (
                <TextInput
                  multiline
                  numberOfLines={3}
                  value={effectiveProfile.missionStatement || ''}
                  onChangeText={(text) => handleFieldChangeLocal('missionStatement', text)}
                  placeholder="Enter mission statement..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.multilineInput, { color: colors.textPrimary }]}
                />
              ) : (
                <View style={[styles.quoteContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }]}>
                  <Text style={[styles.quoteText, { color: colors.textPrimary }]}>
                    {effectiveProfile.missionStatement
                      ? `"${effectiveProfile.missionStatement}"`
                      : 'Mission statement not available'}
                  </Text>
                </View>
              )}
            </GlassCard>

            {/* Company Vision */}
            <GlassCard style={styles.sectionCard} variant="raised">
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardTitleBox}>
                  <View style={[styles.cardHeaderIconBox, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                    <Sparkles size={12} color="#F59E0B" />
                  </View>
                  <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary }]}>
                    Company Vision
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleEdit('vision')}
                  style={[styles.editIconButton, { backgroundColor: isDark ? '#1F2532' : '#E2E8F0' }]}
                >
                  {editState['vision'] ? (
                    <Check size={12} color="#10B981" />
                  ) : (
                    <Edit3 size={12} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>

              {editState['vision'] ? (
                <TextInput
                  multiline
                  numberOfLines={3}
                  value={effectiveProfile.vision || ''}
                  onChangeText={(text) => handleFieldChangeLocal('vision', text)}
                  placeholder="Enter company vision..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.multilineInput, { color: colors.textPrimary }]}
                />
              ) : (
                <View style={[styles.quoteContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }]}>
                  <Text style={[styles.quoteText, { color: colors.textPrimary }]}>
                    {effectiveProfile.vision
                      ? `"${effectiveProfile.vision}"`
                      : 'Company vision not available'}
                  </Text>
                </View>
              )}
            </GlassCard>

            {/* Target Audience */}
            <GlassCard style={styles.sectionCard} variant="raised">
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardTitleBox}>
                  <View style={[styles.cardHeaderIconBox, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                    <Target size={12} color="#F59E0B" />
                  </View>
                  <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary }]}>
                    Target Audience
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleEdit('targetAudience')}
                  style={[styles.editIconButton, { backgroundColor: isDark ? '#1F2532' : '#E2E8F0' }]}
                >
                  {editState['targetAudience'] ? (
                    <Check size={12} color="#10B981" />
                  ) : (
                    <Edit3 size={12} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>

              {editState['targetAudience'] ? (
                <TextInput
                  multiline
                  numberOfLines={4}
                  value={
                    Array.isArray(effectiveProfile.targetAudience)
                      ? effectiveProfile.targetAudience.join('\n')
                      : String(effectiveProfile.targetAudience || '')
                  }
                  onChangeText={(text) => handleFieldChangeLocal('targetAudience', text)}
                  placeholder="Enter target segments (one per line)..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.multilineInput, { color: colors.textPrimary }]}
                />
              ) : effectiveProfile.targetAudience.length > 0 ? (
                <View style={styles.audienceItemsContainer}>
                  {effectiveProfile.targetAudience.map((audience, i) => (
                    <View
                      key={i}
                      style={[
                        styles.audienceCard,
                        {
                          backgroundColor: isDark ? '#11151D' : '#DFE5EF',
                          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                        },
                      ]}
                    >
                      <View style={styles.pillBullet} />
                      <Text style={[styles.audienceText, { color: colors.textPrimary }]}>
                        {audience}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[styles.emptySectionText, { color: colors.textMuted }]}>
                  Target audience not specified. Tap edit icon to add.
                </Text>
              )}
            </GlassCard>

            {/* Core Products & Services */}
            <GlassCard style={styles.sectionCard} variant="raised">
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardTitleBox}>
                  <View style={[styles.cardHeaderIconBox, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                    <Zap size={12} color="#F59E0B" />
                  </View>
                  <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary }]}>
                    Core Products & Services
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleEdit('coreProductsServices')}
                  style={[styles.editIconButton, { backgroundColor: isDark ? '#1F2532' : '#E2E8F0' }]}
                >
                  {editState['coreProductsServices'] ? (
                    <Check size={12} color="#10B981" />
                  ) : (
                    <Edit3 size={12} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>

              {editState['coreProductsServices'] ? (
                <TextInput
                  multiline
                  numberOfLines={4}
                  value={
                    Array.isArray(effectiveProfile.coreProductsServices)
                      ? effectiveProfile.coreProductsServices.join('\n')
                      : String(effectiveProfile.coreProductsServices || '')
                  }
                  onChangeText={(text) => handleFieldChangeLocal('coreProductsServices', text)}
                  placeholder="Enter core products (one per line)..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.multilineInput, { color: colors.textPrimary }]}
                />
              ) : effectiveProfile.coreProductsServices.length > 0 ? (
                <View style={styles.chipsContainer}>
                  {effectiveProfile.coreProductsServices.map((product, i) => (
                    <View
                      key={i}
                      style={[
                        styles.productChip,
                        {
                          backgroundColor: isDark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.08)',
                          borderColor: isDark ? 'rgba(245,158,11,0.22)' : 'rgba(245,158,11,0.22)',
                        },
                      ]}
                    >
                      <View style={styles.chipDot} />
                      <Text style={[styles.chipText, { color: colors.textPrimary }]}>
                        {product}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[styles.emptySectionText, { color: colors.textMuted }]}>
                  No core products specified. Tap edit icon to add.
                </Text>
              )}
            </GlassCard>

            {/* ── CARD 5: Extracted Marketing Claims (Unverified) ── */}
            {effectiveProfile.extractedClaims.length > 0 && (
              <GlassCard style={styles.sectionCard} variant="raised">
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardTitleBox}>
                    <View style={[styles.cardHeaderIconBox, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                      <FileText size={12} color="#F59E0B" />
                    </View>
                    <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary }]}>
                      Extracted Marketing Claims (Unverified)
                    </Text>
                  </View>
                </View>

                <View style={styles.claimsListContainer}>
                  {effectiveProfile.extractedClaims.map((claim, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.claimCard,
                        {
                          backgroundColor: isDark ? '#11151D' : '#DFE5EF',
                          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                        },
                      ]}
                    >
                      <Text style={[styles.claimText, { color: colors.textPrimary }]}>
                        "{claim.claimText || claim}"
                      </Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            )}

            {/* Bottom Continue to SEO Action Button */}
            <View style={styles.bottomContinueContainer}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Strategy', { screen: 'Seo' })}
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
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 110,
    gap: 8,
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

  // ── Header Banner Styles ──
  headerBannerCard: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 13,
    gap: 8,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14.5,
    lineHeight: 19,
    fontWeight: '700',
  },
  bannerSubtitle: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 1,
  },
  bannerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  analysisBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  analysisBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    gap: 5,
  },
  analysisBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  saveProfileBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveProfileBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 5,
  },
  saveProfileBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Alert Banners ──
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  alertBannerText: {
    fontSize: 11.5,
    fontWeight: '600',
    flex: 1,
  },

  // ── Loading ──
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  loadingText: {
    fontSize: 11.5,
  },

  // ── Section Card Styles ──
  sectionCard: {
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 13,
    gap: 7,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  cardHeaderIconBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  editIconButton: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Identity Card Styles ──
  identityInnerBox: {
    paddingVertical: 2,
    paddingHorizontal: 0,
    gap: 6,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoSquircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoZoomOverlay: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 4,
    padding: 1.5,
  },
  identityDetailsCol: {
    flex: 1,
  },
  identityCompanyName: {
    fontSize: 14.5,
    lineHeight: 18,
    fontWeight: '700',
  },
  websiteLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  websiteLinkText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
    flexShrink: 1,
  },
  identityInputsCol: {
    gap: 5,
  },
  inlineInput: {
    fontSize: 12,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  logoEditPanel: {
    gap: 6,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245,158,11,0.2)',
  },
  toggleLogoInputBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
  },
  toggleLogoInputBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
  },
  logoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoUrlInput: {
    flex: 1,
    fontSize: 11,
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  logoApplyBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  logoApplyBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Palette Styles ──
  paletteHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorSwatchesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  colorSwatchCard: {
    flex: 1,
    minWidth: 68,
    maxWidth: 110,
    borderRadius: 8,
    borderWidth: 1,
    padding: 5,
    alignItems: 'center',
    gap: 3,
  },
  swatchColorBar: {
    width: '100%',
    height: 22,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
    gap: 2,
  },
  copiedBadgeText: {
    color: '#10B981',
    fontSize: 8,
    fontWeight: '700',
  },
  copyIconBadge: {
    opacity: 0.8,
  },
  swatchLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  hexText: {
    fontSize: 9.5,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  hexInput: {
    fontSize: 9.5,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 4,
    paddingHorizontal: 2,
    paddingVertical: 1,
    textAlign: 'center',
    width: '100%',
  },

  // ── Attributes Grid (2x2) ──
  attributesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  attributeCard: {
    flexBasis: '48%',
    flexGrow: 1,
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 11,
    gap: 3,
  },
  attributeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attrHeaderTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  attrTitle: {
    fontSize: 9.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  attrEditBtn: {
    padding: 2,
  },
  attrInput: {
    fontSize: 11.5,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  attrValueText: {
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '600',
  },

  // ── Quotes & Multi-line ──
  quoteContainer: {
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 7,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  quoteText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  multilineInput: {
    fontSize: 12,
    lineHeight: 17,
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    padding: 7,
    textAlignVertical: 'top',
  },

  // ── Target Audience Items ──
  audienceItemsContainer: {
    gap: 5,
  },
  audienceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 8,
    borderWidth: 1,
    gap: 7,
  },
  pillBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#F59E0B',
  },
  audienceText: {
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '500',
    flex: 1,
  },

  // ── Wrap Chips for Products ──
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  productChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4.5,
    paddingHorizontal: 8.5,
    borderRadius: 7,
    borderWidth: 1,
    gap: 5,
  },
  chipDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.25,
    backgroundColor: '#F59E0B',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },

  emptySectionText: {
    fontSize: 11,
    fontStyle: 'italic',
  },

  // ── Claims ──
  claimsListContainer: {
    gap: 5,
  },
  claimCard: {
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 8,
    borderWidth: 1,
  },
  claimText: {
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '500',
  },

  // ── Bottom Continue ──
  bottomContinueContainer: {
    marginTop: 8,
    marginBottom: 12,
    alignItems: 'center',
    width: '100%',
  },
  continueToSeoBtn: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 3,
  },
  continueToSeoGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    gap: 6,
  },
  continueToSeoText: {
    color: '#FFFFFF',
    fontSize: 13,
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
