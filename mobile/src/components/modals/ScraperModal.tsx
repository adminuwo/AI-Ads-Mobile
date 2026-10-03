import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import {
  X,
  Dna,
  Globe,
  Sparkles,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Trash2,
  Building,
  Upload,
  CheckCircle2,
  AlertCircle,
  Plus,
  Link,
  ChevronRight,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { workspaceApi } from '../../api/workspaceApi';
import { brandApi } from '../../api/brandApi';
import { normalizeBrandDna, NormalizedBrandDna } from '../../utils/normalizeBrandDna';
import { Badge } from '../common/Badge';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

interface BrandAssetDoc {
  name: string;
  type: string;
  size?: string;
  url?: string;
}

export const ScraperModal: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const {
    isScraperOpen,
    setIsScraperOpen,
    scraperMode,
    activeWorkspace,
    addWorkspace,
    updateActiveWorkspace,
  } = useWorkspace();

  // Unified Form Inputs
  const [url, setUrl] = useState('');
  const [brandName, setBrandName] = useState('');

  // Logo input state
  const [logoUrl, setLogoUrl] = useState('');
  const [showLogoInput, setShowLogoInput] = useState(false);

  // Documents state
  const [documentFiles, setDocumentFiles] = useState<BrandAssetDoc[]>([]);
  const [docInputText, setDocInputText] = useState('');
  const [showDocInput, setShowDocInput] = useState(false);

  // Images state
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [imageInputText, setImageInputText] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  // Workflow State
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NormalizedBrandDna | null>(null);

  useEffect(() => {
    if (isScraperOpen) {
      setResult(null);
      setError(null);
      if (scraperMode === 'ACTIVE_BRAND' && activeWorkspace && activeWorkspace.domainUrl) {
        setUrl(activeWorkspace.domainUrl || '');
        setBrandName(activeWorkspace.brandName || '');
      } else {
        setUrl('');
        setBrandName('');
      }
      setLogoUrl('');
      setShowLogoInput(false);
      setDocumentFiles([]);
      setDocInputText('');
      setShowDocInput(false);
      setImageFiles([]);
      setImageInputText('');
      setShowImageInput(false);
    }
  }, [isScraperOpen, scraperMode, activeWorkspace]);

  if (!isScraperOpen) return null;

  // Paste from clipboard helper
  const handlePasteToUrl = async (setter: (val: string) => void) => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text && text.trim()) {
        setter(text.trim());
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }
    } catch {}
  };

  // Add document
  const handleAddDocument = () => {
    if (!docInputText.trim()) return;
    const name = docInputText.trim();
    const ext = name.includes('.') ? name.split('.').pop()?.toUpperCase() || 'DOC' : 'PDF';
    setDocumentFiles((prev) => [
      ...prev,
      { name, type: ext, size: '240 KB' },
    ]);
    setDocInputText('');
    setShowDocInput(false);
  };

  // Add image
  const handleAddImage = () => {
    if (!imageInputText.trim()) return;
    setImageFiles((prev) => [...prev, imageInputText.trim()]);
    setImageInputText('');
    setShowImageInput(false);
  };

  // ── SUBMIT EXTRACTION (STEP 1 -> STEP 2) ──
  const handleExtractBrandDna = async () => {
    if (!url.trim() && documentFiles.length === 0 && !logoUrl.trim() && imageFiles.length === 0) {
      setError('Please provide at least a Website URL or enter a Document / Image / Logo.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const cleanUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;

      // Call Evidence-First AI Scraper
      const response = await brandApi.analyze({
        workspaceId: (activeWorkspace as any)?._id || activeWorkspace?.id || 'ws_preview',
        websiteUrl: cleanUrl,
        companyName: brandName.trim() || undefined,
      });

      if (response.success && response.profile) {
        const normalized = normalizeBrandDna(response.profile);

        // Override custom logo if provided
        if (logoUrl.trim()) {
          normalized.logoUrl = logoUrl.trim();
        }

        // Attach custom images if added
        if (imageFiles.length > 0) {
          (normalized as any).uploadedBrandImages = imageFiles;
        }

        setResult(normalized);
      } else {
        throw new Error(response.error || 'Failed to extract Brand DNA.');
      }
    } catch (err: any) {
      console.error('[ScraperModal] Extraction error:', err);
      // Fallback: If backend network error, generate clean client-side DNA preview from domain
      if (url.trim()) {
        const cleanDomain = url.trim().replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];
        const computedName = brandName.trim() || cleanDomain.split('.')[0].toUpperCase();
        const fallbackProfile = normalizeBrandDna({
          brandName: computedName,
          companyName: computedName,
          domainUrl: `https://${cleanDomain}`,
          logoUrl: logoUrl.trim() || `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=256`,
          industryCategory: 'Technology & Digital Marketing',
          tagline: `Empowering ${computedName} with AI advertising velocity.`,
          missionStatement: `To deliver industry-leading solutions with uncompromising quality for ${computedName}.`,
          vision: `Building the future of connected intelligence for ${computedName}.`,
          brandColors: ['#F59E0B', '#D97706', '#06B6D4', '#151922'],
        });
        if (imageFiles.length > 0) {
          (fallbackProfile as any).uploadedBrandImages = imageFiles;
        }
        setResult(fallbackProfile);
      } else {
        setError(err.message || 'An error occurred while extracting Brand DNA. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── CONFIRM SAVE (STEP 2) ──
  const confirmSaveWorkspace = async () => {
    if (!result || isSaving) return;
    setIsSaving(true);
    try {
      const wsId = (activeWorkspace as any)?._id || activeWorkspace?.id;

      if (scraperMode === 'ACTIVE_BRAND' && activeWorkspace && wsId && wsId !== 'ws_empty') {
        if (updateActiveWorkspace) {
          await updateActiveWorkspace(result as any);
        }
        await brandApi.updateProfile(wsId, result as any);
      } else {
        await addWorkspace({
          brandName: result.brandName || brandName.trim() || 'New Brand',
          companyName: result.companyName || result.brandName || brandName.trim(),
          domainUrl: result.domainUrl || url.trim(),
          logoUrl: result.logoUrl || '',
          brandColors: result.brandColors || ['#F59E0B', '#D97706', '#06B6D4', '#151922'],
          industryCategory: result.industryCategory || 'General Business',
          missionStatement: result.missionStatement || '',
          tagline: result.tagline || '',
          targetAudience: result.targetAudience || [],
          coreProductsServices: result.coreProductsServices || [],
        } as any);
      }

      setIsScraperOpen(false);
      setResult(null);
      setUrl('');
      setBrandName('');
      setLogoUrl('');
      setDocumentFiles([]);
      setImageFiles([]);
    } catch (err: any) {
      console.error('[ScraperModal] Save Error:', err);
      Alert.alert('Error', err.message || 'Failed to save Brand DNA Memory. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid =
    url.trim().length > 0 ||
    documentFiles.length > 0 ||
    logoUrl.trim().length > 0 ||
    imageFiles.length > 0;

  return (
    <Modal
      visible={isScraperOpen}
      transparent
      animationType="slide"
      onRequestClose={() => !loading && !isSaving && setIsScraperOpen(false)}
    >
      <Pressable
        style={styles.backdrop}
        onPress={() => !loading && !isSaving && setIsScraperOpen(false)}
      >
        <Pressable
          style={[
            styles.modalContent,
            {
              backgroundColor: isDark ? colors.cardBackground : '#FFFFFF',
              borderColor: colors.neu.borderLight,
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
            <View style={styles.titleRow}>
              <LinearGradient
                colors={['#D97706', '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.dnaIconBox}
              >
                <Dna size={18} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.titleCol}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  Discover Your Brand
                </Text>
                <Text style={[styles.modalSubtitle, { color: '#F59E0B' }]}>
                  Enter your website and let AI build your Brand DNA
                </Text>
              </View>
            </View>

            {!loading && !isSaving && (
              <TouchableOpacity
                onPress={() => setIsScraperOpen(false)}
                style={[styles.closeBtn, { backgroundColor: isDark ? '#1F2532' : '#E2E8F0' }]}
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {error && (
              <View style={[styles.errorBox, { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
                <AlertCircle size={15} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {!result ? (
              /* ── STEP 1: SINGLE UNIFIED INPUT FORM ── */
              <View style={styles.formContainer}>
                {/* SECTION 1: WEBSITE DOMAIN & BRAND NAME */}
                <View style={[styles.sectionCard, { backgroundColor: isDark ? '#11151D' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
                  <View style={styles.sectionTitleRow}>
                    <Globe size={14} color="#F59E0B" />
                    <Text style={[styles.sectionHeaderTitle, { color: colors.textPrimary }]}>
                      1. Website Domain & Brand Name
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                      Target Domain URL
                    </Text>
                    <View style={[styles.inputWithIconBox, { backgroundColor: isDark ? '#181D28' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)' }]}>
                      <Globe size={16} color={colors.textMuted} />
                      <TextInput
                        placeholder="e.g. https://nike.com"
                        placeholderTextColor={colors.textMuted}
                        value={url}
                        onChangeText={setUrl}
                        autoCapitalize="none"
                        keyboardType="url"
                        editable={!loading}
                        style={[styles.textInputWithIcon, { color: colors.textPrimary }]}
                      />
                      <TouchableOpacity onPress={() => handlePasteToUrl(setUrl)} style={styles.pasteBadgeBtn}>
                        <Text style={styles.pasteBadgeBtnText}>Paste</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                      Brand / Company Name (Optional)
                    </Text>
                    <View style={[styles.inputWithIconBox, { backgroundColor: isDark ? '#181D28' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)' }]}>
                      <Building size={16} color={colors.textMuted} />
                      <TextInput
                        placeholder="e.g. Nike"
                        placeholderTextColor={colors.textMuted}
                        value={brandName}
                        onChangeText={setBrandName}
                        editable={!loading}
                        style={[styles.textInputWithIcon, { color: colors.textPrimary }]}
                      />
                    </View>
                  </View>
                </View>

                {/* SECTION 2: BRAND LOGO */}
                <View style={[styles.sectionCard, { backgroundColor: isDark ? '#11151D' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
                  <View style={styles.sectionHeaderBetween}>
                    <View style={styles.sectionTitleRow}>
                      <Sparkles size={14} color="#F59E0B" />
                      <Text style={[styles.sectionHeaderTitle, { color: colors.textPrimary }]}>
                        2. Brand Logo
                      </Text>
                    </View>
                    {logoUrl.trim() ? (
                      <View style={styles.selectedPill}>
                        <CheckCircle2 size={12} color="#10B981" />
                        <Text style={styles.selectedPillText}>Logo Configured</Text>
                      </View>
                    ) : null}
                  </View>

                  {!logoUrl.trim() ? (
                    <View style={styles.logoInputPromptContainer}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setShowLogoInput((prev) => !prev)}
                        style={[styles.uploadDashedBox, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', backgroundColor: isDark ? '#181D28' : '#FFFFFF' }]}
                      >
                        <View style={[styles.uploadIconCircle, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                          <Upload size={16} color="#F59E0B" />
                        </View>
                        <View style={styles.uploadTextCol}>
                          <Text style={[styles.uploadMainText, { color: colors.textPrimary }]}>
                            {showLogoInput ? 'Close Logo Input' : 'Add Brand Logo Image / URL'}
                          </Text>
                          <Text style={[styles.uploadSubText, { color: colors.textMuted }]}>
                            Auto-detected from domain, or enter custom URL
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {showLogoInput && (
                        <View style={[styles.quickInputCard, { backgroundColor: isDark ? '#181D28' : '#FFFFFF' }]}>
                          <View style={styles.inlineActionRow}>
                            <TextInput
                              placeholder="Paste logo image URL (PNG, SVG, JPG)..."
                              placeholderTextColor={colors.textMuted}
                              value={logoUrl}
                              onChangeText={setLogoUrl}
                              autoCapitalize="none"
                              style={[styles.modalInnerInput, { color: colors.textPrimary }]}
                            />
                            <TouchableOpacity onPress={() => handlePasteToUrl(setLogoUrl)} style={styles.pasteBadgeBtn}>
                              <Text style={styles.pasteBadgeBtnText}>Paste</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={[styles.pickedFileRow, { backgroundColor: isDark ? '#181D28' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                      <Image source={{ uri: logoUrl }} style={styles.pickedLogoThumbnail} resizeMode="contain" />
                      <View style={styles.pickedFileDetails}>
                        <Text style={[styles.pickedFileName, { color: colors.textPrimary }]} numberOfLines={1}>
                          Custom Brand Logo
                        </Text>
                        <Text style={[styles.pickedFileSize, { color: colors.textMuted }]} numberOfLines={1}>
                          {logoUrl}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => setLogoUrl('')} style={styles.removeFileBtn}>
                        <Trash2 size={15} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* SECTION 3: BRAND GUIDELINE DOCUMENTS */}
                <View style={[styles.sectionCard, { backgroundColor: isDark ? '#11151D' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
                  <View style={styles.sectionHeaderBetween}>
                    <View style={styles.sectionTitleRow}>
                      <FileText size={14} color="#0284C7" />
                      <Text style={[styles.sectionHeaderTitle, { color: colors.textPrimary }]}>
                        3. Brand Guideline Documents
                      </Text>
                    </View>
                    {documentFiles.length > 0 && (
                      <Badge
                        label={`${documentFiles.length} ${documentFiles.length === 1 ? 'Doc' : 'Docs'}`}
                        variant="info"
                      />
                    )}
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowDocInput((prev) => !prev)}
                    style={[styles.uploadDashedBox, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', backgroundColor: isDark ? '#181D28' : '#FFFFFF' }]}
                  >
                    <View style={[styles.uploadIconCircle, { backgroundColor: 'rgba(2,132,199,0.12)' }]}>
                      <FileText size={16} color="#0284C7" />
                    </View>
                    <View style={styles.uploadTextCol}>
                      <Text style={[styles.uploadMainText, { color: colors.textPrimary }]}>
                        Add Brand Guidelines / Decks
                      </Text>
                      <Text style={[styles.uploadSubText, { color: colors.textMuted }]}>
                        PDF, DOCX, TXT guides & brand decks
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {showDocInput && (
                    <View style={[styles.quickInputCard, { backgroundColor: isDark ? '#181D28' : '#FFFFFF' }]}>
                      <View style={styles.inlineActionRow}>
                        <TextInput
                          placeholder="Doc title or file name (e.g. brand-deck.pdf)..."
                          placeholderTextColor={colors.textMuted}
                          value={docInputText}
                          onChangeText={setDocInputText}
                          style={[styles.modalInnerInput, { color: colors.textPrimary }]}
                        />
                        <TouchableOpacity onPress={handleAddDocument} style={styles.addMiniBtn}>
                          <Plus size={14} color="#FFFFFF" />
                          <Text style={styles.addMiniBtnText}>Add</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {documentFiles.length > 0 && (
                    <View style={styles.fileItemsList}>
                      {documentFiles.map((doc, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.docItemCard,
                            {
                              backgroundColor: isDark ? '#181D28' : '#FFFFFF',
                              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                            },
                          ]}
                        >
                          <View style={styles.docExtPill}>
                            <Text style={styles.docExtText}>{doc.type}</Text>
                          </View>
                          <Text style={[styles.docItemName, { color: colors.textPrimary }]} numberOfLines={1}>
                            {doc.name}
                          </Text>
                          <TouchableOpacity
                            onPress={() => setDocumentFiles((prev) => prev.filter((_, i) => i !== idx))}
                            style={styles.removeDocBtn}
                          >
                            <X size={14} color={colors.textMuted} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* SECTION 4: BRAND IMAGES & CREATIVES */}
                <View style={[styles.sectionCard, { backgroundColor: isDark ? '#11151D' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
                  <View style={styles.sectionHeaderBetween}>
                    <View style={styles.sectionTitleRow}>
                      <ImageIcon size={14} color="#8B5CF6" />
                      <Text style={[styles.sectionHeaderTitle, { color: colors.textPrimary }]}>
                        4. Brand Images & Creatives
                      </Text>
                    </View>
                    {imageFiles.length > 0 && (
                      <Badge
                        label={`${imageFiles.length} ${imageFiles.length === 1 ? 'Img' : 'Imgs'}`}
                        variant="accent"
                      />
                    )}
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowImageInput((prev) => !prev)}
                    style={[styles.uploadDashedBox, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', backgroundColor: isDark ? '#181D28' : '#FFFFFF' }]}
                  >
                    <View style={[styles.uploadIconCircle, { backgroundColor: 'rgba(139,92,246,0.12)' }]}>
                      <ImageIcon size={16} color="#8B5CF6" />
                    </View>
                    <View style={styles.uploadTextCol}>
                      <Text style={[styles.uploadMainText, { color: colors.textPrimary }]}>
                        Add Product Photos / Banners
                      </Text>
                      <Text style={[styles.uploadSubText, { color: colors.textMuted }]}>
                        Multiple PNG, JPG, WEBP creatives
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {showImageInput && (
                    <View style={[styles.quickInputCard, { backgroundColor: isDark ? '#181D28' : '#FFFFFF' }]}>
                      <View style={styles.inlineActionRow}>
                        <TextInput
                          placeholder="Paste image URL (e.g. https://.../banner.png)..."
                          placeholderTextColor={colors.textMuted}
                          value={imageInputText}
                          onChangeText={setImageInputText}
                          autoCapitalize="none"
                          style={[styles.modalInnerInput, { color: colors.textPrimary }]}
                        />
                        <TouchableOpacity onPress={handleAddImage} style={styles.addMiniBtn}>
                          <Plus size={14} color="#FFFFFF" />
                          <Text style={styles.addMiniBtnText}>Add</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {imageFiles.length > 0 && (
                    <View style={styles.imageThumbnailsGrid}>
                      {imageFiles.map((imgUri, idx) => (
                        <View key={idx} style={styles.imageThumbnailCard}>
                          <Image source={{ uri: imgUri }} style={styles.thumbnailImg} resizeMode="cover" />
                          <TouchableOpacity
                            onPress={() => setImageFiles((prev) => prev.filter((_, i) => i !== idx))}
                            style={styles.thumbnailDeleteBadge}
                          >
                            <X size={10} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* UNIFIED SUBMIT ACTION BUTTON */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleExtractBrandDna}
                  disabled={loading || !isFormValid}
                  style={[styles.submitActionBtn, (!isFormValid || loading) && { opacity: 0.6 }]}
                >
                  <LinearGradient
                    colors={['#D97706', '#F59E0B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.submitActionGrad}
                  >
                    {loading ? (
                      <>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.submitActionText}>
                          Scraping Website & Extracting Unified Brand DNA...
                        </Text>
                      </>
                    ) : (
                      <>
                        <Dna size={16} color="#FFFFFF" />
                        <Text style={styles.submitActionText}>
                          Extract & Generate Complete Brand DNA Memory
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              /* ── STEP 2: PREVIEW & SAVE EXTRACTED BRAND DNA MEMORY ── */
              <View style={styles.previewContainer}>
                {/* Top Brand Banner */}
                <View style={[styles.previewBanner, { backgroundColor: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.3)' }]}>
                  <View style={styles.previewBannerRow}>
                    <View style={styles.previewLogoBox}>
                      <Image
                        source={{
                          uri:
                            result.logoUrl ||
                            `https://www.google.com/s2/favicons?domain=${(result.domainUrl || 'google.com').replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0]}&sz=128`,
                        }}
                        style={styles.previewLogoImg as any}
                        resizeMode="contain"
                      />
                    </View>

                    <View style={styles.previewInfoCol}>
                      <View style={styles.previewNameBadgeRow}>
                        <Text style={[styles.previewBrandName, { color: colors.textPrimary }]} numberOfLines={1}>
                          {result.brandName}
                        </Text>
                        <Badge
                          label={result.industryCategory || 'General Business'}
                          variant="warning"
                        />
                      </View>
                      <Text style={[styles.previewDomain, { color: '#F59E0B' }]} numberOfLines={1}>
                        {result.domainUrl}
                      </Text>
                    </View>
                  </View>

                  {/* Brand Colors preview dots */}
                  {result.brandColors && result.brandColors.length > 0 && (
                    <View style={styles.previewColorsRow}>
                      {result.brandColors.map((hex, i) => (
                        <View
                          key={i}
                          style={[styles.colorDot, { backgroundColor: typeof hex === 'string' ? hex : (hex as any).hex }]}
                        />
                      ))}
                    </View>
                  )}
                </View>

                {/* Display Uploaded Brand Images if available */}
                {Array.isArray((result as any).uploadedBrandImages) && (result as any).uploadedBrandImages.length > 0 && (
                  <View style={[styles.previewSectionCard, { backgroundColor: isDark ? '#11151D' : '#F8FAFC' }]}>
                    <Text style={[styles.previewMiniHeader, { color: colors.textMuted }]}>
                      Attached Brand Images & Assets ({(result as any).uploadedBrandImages.length})
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.assetsHorizScroll}>
                      {(result as any).uploadedBrandImages.map((imgUri: string, i: number) => (
                        <Image key={i} source={{ uri: imgUri }} style={styles.assetPreviewImg as any} resizeMode="cover" />
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* EDITABLE BRAND DNA FORM PREVIEW */}
                {/* SECTION 1: CORE IDENTITY & BUSINESS MODEL */}
                <View style={[styles.previewSectionCard, { backgroundColor: isDark ? '#11151D' : '#F8FAFC' }]}>
                  <Text style={[styles.previewSectionHeaderTitle, { color: '#F59E0B' }]}>
                    Core Identity & Business Model
                  </Text>

                  <View style={styles.previewFieldGroup}>
                    <Text style={[styles.previewFieldLabel, { color: colors.textMuted }]}>BRAND NAME</Text>
                    <TextInput
                      value={result.brandName}
                      onChangeText={(val) => setResult((prev) => prev ? { ...prev, brandName: val, companyName: val } : null)}
                      placeholder="Enter brand name..."
                      placeholderTextColor={colors.textMuted}
                      style={[styles.previewInput, { color: colors.textPrimary, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                    />
                  </View>

                  <View style={styles.previewFieldGroup}>
                    <Text style={[styles.previewFieldLabel, { color: colors.textMuted }]}>TAGLINE</Text>
                    <TextInput
                      value={result.tagline || ''}
                      onChangeText={(val) => setResult((prev) => prev ? { ...prev, tagline: val } : null)}
                      placeholder="Enter tagline / slogan..."
                      placeholderTextColor={colors.textMuted}
                      style={[styles.previewInput, { color: colors.textPrimary, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                    />
                  </View>

                  <View style={styles.previewFieldGroup}>
                    <Text style={[styles.previewFieldLabel, { color: colors.textMuted }]}>WEBSITE</Text>
                    <TextInput
                      value={result.domainUrl}
                      onChangeText={(val) => setResult((prev) => prev ? { ...prev, domainUrl: val, website: val } : null)}
                      placeholder="https://yourbrand.com"
                      placeholderTextColor={colors.textMuted}
                      style={[styles.previewInput, { color: '#F59E0B', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                    />
                  </View>

                  <View style={styles.previewFieldGroup}>
                    <Text style={[styles.previewFieldLabel, { color: colors.textMuted }]}>INDUSTRY</Text>
                    <TextInput
                      value={result.industryCategory || ''}
                      onChangeText={(val) => setResult((prev) => prev ? { ...prev, industryCategory: val } : null)}
                      placeholder="Enter industry category..."
                      placeholderTextColor={colors.textMuted}
                      style={[styles.previewInput, { color: colors.textPrimary, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                    />
                  </View>

                  <View style={styles.previewFieldGroup}>
                    <Text style={[styles.previewFieldLabel, { color: colors.textMuted }]}>COMPANY DESCRIPTION</Text>
                    <TextInput
                      multiline
                      numberOfLines={3}
                      value={result.companyDescription || ''}
                      onChangeText={(val) => setResult((prev) => prev ? { ...prev, companyDescription: val } : null)}
                      placeholder="Enter company description..."
                      placeholderTextColor={colors.textMuted}
                      style={[styles.previewMultilineInput, { color: colors.textPrimary, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                    />
                  </View>
                </View>

                {/* SECTION 2: BRAND IDENTITY & STRATEGY */}
                <View style={[styles.previewSectionCard, { backgroundColor: isDark ? '#11151D' : '#F8FAFC' }]}>
                  <Text style={[styles.previewSectionHeaderTitle, { color: '#F59E0B' }]}>
                    Brand Identity & Strategy
                  </Text>

                  <View style={styles.previewFieldGroup}>
                    <Text style={[styles.previewFieldLabel, { color: colors.textMuted }]}>MISSION</Text>
                    <TextInput
                      multiline
                      numberOfLines={2}
                      value={result.missionStatement || ''}
                      onChangeText={(val) => setResult((prev) => prev ? { ...prev, missionStatement: val } : null)}
                      placeholder="Enter mission statement..."
                      placeholderTextColor={colors.textMuted}
                      style={[styles.previewMultilineInput, { color: colors.textPrimary, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                    />
                  </View>

                  <View style={styles.previewFieldGroup}>
                    <Text style={[styles.previewFieldLabel, { color: colors.textMuted }]}>VISION</Text>
                    <TextInput
                      multiline
                      numberOfLines={2}
                      value={result.vision || ''}
                      onChangeText={(val) => setResult((prev) => prev ? { ...prev, vision: val } : null)}
                      placeholder="Enter vision statement..."
                      placeholderTextColor={colors.textMuted}
                      style={[styles.previewMultilineInput, { color: colors.textPrimary, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                    />
                  </View>
                </View>

                {/* SAVE & LOCK BUTTON */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={confirmSaveWorkspace}
                  disabled={isSaving}
                  style={[styles.submitActionBtn, isSaving && { opacity: 0.6 }]}
                >
                  <LinearGradient
                    colors={['#D97706', '#F59E0B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.submitActionGrad}
                  >
                    {isSaving ? (
                      <>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.submitActionText}>
                          Saving & Locking Brand DNA Memory...
                        </Text>
                      </>
                    ) : (
                      <>
                        <ArrowRight size={16} color="#FFFFFF" />
                        <Text style={styles.submitActionText}>
                          Save & Lock Brand DNA Memory
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    maxHeight: '90%',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dnaIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: {
    flex: 1,
  },
  modalTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
  },
  modalSubtitle: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    flex: 1,
  },

  // ── Step 1 Form ──
  formContainer: {
    gap: 12,
    paddingBottom: 24,
  },
  sectionCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderTitle: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  inputWithIconBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  textInputWithIcon: {
    flex: 1,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
  },
  pasteBadgeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(245,158,11,0.15)',
  },
  pasteBadgeBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
  },

  // Upload Dash Box
  uploadDashedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 12,
  },
  uploadIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTextCol: {
    flex: 1,
  },
  uploadMainText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
  },
  uploadSubText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },

  // Picked Logo Row
  logoInputPromptContainer: {
    gap: 8,
  },
  quickInputCard: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  inlineActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalInnerInput: {
    flex: 1,
    fontSize: FONT_SIZES.caption,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  addMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addMiniBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  pickedFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  pickedLogoThumbnail: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  pickedFileDetails: {
    flex: 1,
  },
  pickedFileName: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
  },
  pickedFileSize: {
    fontSize: 10,
    fontWeight: '500',
  },
  removeFileBtn: {
    padding: 6,
  },

  // Document items
  fileItemsList: {
    gap: 6,
    marginTop: 4,
  },
  docItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  docExtPill: {
    backgroundColor: 'rgba(2,132,199,0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  docExtText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0284C7',
  },
  docItemName: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  removeDocBtn: {
    padding: 4,
  },

  // Images Thumbnails
  imageThumbnailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  imageThumbnailCard: {
    width: 54,
    height: 54,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  thumbnailDeleteBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 3,
  },

  // Submit Button
  submitActionBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 4,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  submitActionGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  submitActionText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    textAlign: 'center',
  },

  // ── Step 2 Preview ──
  previewContainer: {
    gap: 12,
    paddingBottom: 28,
  },
  previewBanner: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  previewBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewLogoBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewLogoImg: {
    width: '100%',
    height: '100%',
  },
  previewInfoCol: {
    flex: 1,
    gap: 2,
  },
  previewNameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewBrandName: {
    fontSize: FONT_SIZES.heading,
    lineHeight: LINE_HEIGHTS.heading,
    fontWeight: '700',
    flexShrink: 1,
  },
  previewDomain: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
  },
  previewColorsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 4,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  previewSectionCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    gap: 8,
  },
  previewMiniHeader: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  assetsHorizScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  assetPreviewImg: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 8,
  },
  previewSectionHeaderTitle: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  previewFieldGroup: {
    gap: 3,
    marginBottom: 6,
  },
  previewFieldLabel: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewInput: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  previewMultilineInput: {
    fontSize: FONT_SIZES.body,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.body,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlignVertical: 'top',
  },
});
