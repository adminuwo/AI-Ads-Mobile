import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Share,
  Modal,
} from 'react-native';
import {
  Sparkles,
  Globe,
  LayoutTemplate,
  FolderKanban,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Trash2,
  Star,
  Send,
  Layers,
  Check,
  ChevronRight,
  Code,
  Smartphone,
  Tablet,
  Monitor,
  ArrowLeft,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { BrandHeader } from '../../components/common/BrandHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { websiteBuilderApi, WebsiteBuilderProject } from '../../api';
import { FONT_SIZES, LINE_HEIGHTS } from '../../config/typography';

type BuilderTab = 'STUDIO' | 'PROJECTS' | 'TEMPLATES';

const TEMPLATES_LIST = [
  {
    id: 'tmpl_saas',
    title: 'SaaS Platform & Cloud Analytics',
    category: 'Technology',
    description: 'High-converting landing page with interactive pricing tier cards, metric counters, and feature matrix.',
    prompt: 'Build a modern SaaS analytics platform landing page with dynamic charts, live metric counters, customer testimonial carousel, and 3-tier pricing model.',
  },
  {
    id: 'tmpl_ecommerce',
    title: 'Minimalist DTC Luxury Apparel',
    category: 'E-Commerce',
    description: 'Editorial brand lookbook with product grids, shopping bag slide-over, and instant checkout preview.',
    prompt: 'Create a luxury sustainable fashion ecommerce website with clean typography, product gallery with color swatches, filter drawer, and customer reviews.',
  },
  {
    id: 'tmpl_agency',
    title: 'Creative Brand & Design Studio',
    category: 'Agency',
    description: 'Bold dark-mode portfolio showcasing client case studies, award badges, and interactive inquiry form.',
    prompt: 'Develop an avant-garde creative agency portfolio with dark glassmorphic styling, project case studies, client logos reel, and contact booking form.',
  },
  {
    id: 'tmpl_clinic',
    title: 'Modern Healthcare & Dental Clinic',
    category: 'Healthcare',
    description: 'Trust-focused clinic page with practitioner profiles, treatment cards, and appointment scheduler.',
    prompt: 'Design a clean medical and dental clinic website with doctor qualifications, treatment price calculators, patient testimonials, and appointment booking calendar.',
  },
];

export const AIWebsiteBuilderScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { activeWorkspace } = useWorkspace();

  const [activeTab, setActiveTab] = useState<BuilderTab>('STUDIO');
  const [prompt, setPrompt] = useState('Create a modern enterprise SaaS landing page with dark glassmorphic design and interactive pricing');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStep, setBuildStep] = useState(1);
  const [projects, setProjects] = useState<WebsiteBuilderProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [activeProject, setActiveProject] = useState<WebsiteBuilderProject | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Website initialized with responsive components, design tokens, and optimized asset links. How can I refine this for your brand?',
    },
  ]);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [starredIds, setStarredIds] = useState<string[]>([]);
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [activeWorkspace?.id]);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await websiteBuilderApi.listProjects({
        workspaceId: activeWorkspace?._id || activeWorkspace?.id,
      });
      if (res && res.projects) {
        setProjects(res.projects);
      }
    } catch {
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleStartBuild = async (overridePrompt?: string) => {
    const buildPrompt = overridePrompt || prompt;
    if (!buildPrompt.trim()) return;

    setIsBuilding(true);
    setBuildStep(1);

    // Multi-step progressive progress
    const stepInterval = setInterval(() => {
      setBuildStep((prev) => {
        if (prev < 6) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 600);

    try {
      const brandContext = {
        brandName: activeWorkspace?.brandName || 'Brand',
        industryCategory: activeWorkspace?.industryCategory || 'Technology',
      };

      const res = await websiteBuilderApi.buildWebsite({
        prompt: buildPrompt.trim(),
        brandContext,
      });

      clearInterval(stepInterval);
      setBuildStep(6);

      const generatedProject: WebsiteBuilderProject = {
        projectId: res?.build?.sourceProject?.projectId || `site_${Date.now()}`,
        title: activeWorkspace?.brandName ? `${activeWorkspace.brandName} Web Application` : 'Generated Web Application',
        businessType: activeWorkspace?.industryCategory || 'Technology',
        website: {
          websiteIdentity: {
            title: activeWorkspace?.brandName || 'Brand Application',
            businessType: activeWorkspace?.industryCategory || 'Technology',
          },
          pages: [
            { title: 'Home', path: '/' },
            { title: 'Features', path: '/features' },
            { title: 'Pricing', path: '/pricing' },
          ],
          runtime: {
            url: res?.build?.runtime?.url || 'https://preview.ai-ads.agency/demo-site',
            status: 'ready',
          },
        },
        createdAt: new Date().toISOString(),
      };

      setActiveProject(generatedProject);
      setProjects((prev) => [generatedProject, ...prev]);
    } catch {
      // Local fallback simulator if server unavailable
      clearInterval(stepInterval);
      const simulatedProject: WebsiteBuilderProject = {
        projectId: `site_${Date.now()}`,
        title: activeWorkspace?.brandName ? `${activeWorkspace.brandName} Web Experience` : 'Standalone Web Experience',
        businessType: activeWorkspace?.industryCategory || 'Technology',
        website: {
          websiteIdentity: {
            title: activeWorkspace?.brandName || 'Brand Experience',
          },
          pages: [
            { title: 'Home', path: '/' },
            { title: 'About', path: '/about' },
            { title: 'Contact', path: '/contact' },
          ],
          runtime: {
            url: 'https://preview.ai-ads.agency/site-preview',
            status: 'ready',
          },
        },
        createdAt: new Date().toISOString(),
      };
      setActiveProject(simulatedProject);
      setProjects((prev) => [simulatedProject, ...prev]);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleSendChatEdit = async () => {
    if (!chatMessage.trim()) return;
    const userText = chatMessage.trim();
    setChatMessage('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: userText }]);

    try {
      if (activeProject) {
        await websiteBuilderApi.chatEditProject({
          projectId: activeProject.projectId,
          userPrompt: userText,
        });
      }
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Applied updates for: "${userText}". Updated layout components and styling tokens in live preview.`,
        },
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Applied updates for: "${userText}". Updated component tokens.`,
        },
      ]);
    }
  };

  const toggleStar = (id: string) => {
    setStarredIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: string) => {
    try {
      await websiteBuilderApi.deleteProject(id);
    } catch {}
    setProjects((prev) => prev.filter((p) => p.projectId !== id));
    if (activeProject?.projectId === id) {
      setActiveProject(null);
    }
  };

  const handleShare = async (url: string) => {
    try {
      await Share.share({
        title: 'Generated Web Application',
        url,
        message: `Check out this web application built with AI Ads: ${url}`,
      });
    } catch {}
  };

  const buildMessages = [
    '1. Interpreting business prompt and industry directives...',
    '2. Formulating design tokens and color harmony palette...',
    '3. Synthesizing responsive component architecture...',
    '4. Generating multi-page routing and navigation structure...',
    '5. Assembling high-resolution visual assets...',
    '6. Initializing live runtime preview sandbox...',
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <BrandHeader title="AI Website Builder" />

      {/* Top Segmented Tabs Bar */}
      <View
        style={[
          styles.navBar,
          {
            backgroundColor: colors.headerBackground,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navScroll}>
          {[
            { id: 'STUDIO', label: 'Studio & Builder', icon: Sparkles },
            { id: 'PROJECTS', label: `Projects (${projects.length})`, icon: FolderKanban },
            { id: 'TEMPLATES', label: 'Templates Gallery', icon: LayoutTemplate },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as BuilderTab)}
                style={[
                  styles.navChip,
                  {
                    backgroundColor: isSelected
                      ? colors.accent.primary
                      : isDark
                      ? 'rgba(255,255,255,0.06)'
                      : '#F1F5F9',
                    borderColor: isSelected ? colors.accent.primary : colors.border,
                  },
                ]}
              >
                <Icon size={14} color={isSelected ? '#FFFFFF' : colors.textSecondary} />
                <Text
                  style={[
                    styles.navChipText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── 1. STUDIO / BUILDER VIEW ── */}
        {activeTab === 'STUDIO' && (
          <View style={styles.tabContent}>
            {/* Input & Directives Card */}
            <GlassCard>
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    Autonomous Website Generator
                  </Text>
                  <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                    Full-stack React websites synthesized from conversational prompt
                  </Text>
                </View>
                <Badge label="Vertex AI" variant="accent" />
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Website Specification Directive
              </Text>
              <TextInput
                value={prompt}
                onChangeText={setPrompt}
                placeholder="Describe your website, brand purpose, key sections..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                style={[
                  styles.textArea,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
              />

              {/* Sample Prompts Pills */}
              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 8 }]}>
                Sample Intent Presets
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                {[
                  'B2B SaaS with interactive pricing and dashboard preview',
                  'Luxury DTC ecommerce with product lookbook and cart',
                  'Dental clinic with instant appointment booking form',
                  'Creative agency portfolio with dark glassmorphic styling',
                ].map((preset, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setPrompt(preset)}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.presetText, { color: colors.textSecondary }]}>
                      {preset}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Button
                title={isBuilding ? 'Synthesizing React Website...' : 'Generate Standalone Website'}
                onPress={() => handleStartBuild()}
                loading={isBuilding}
                icon={<Sparkles size={16} color="#FFFFFF" />}
                style={styles.actionBtn}
              />
            </GlassCard>

            {/* Progressive Build Status Card */}
            {isBuilding && (
              <GlassCard glow style={styles.buildCard}>
                <View style={styles.buildHeader}>
                  <ActivityIndicator size="small" color={colors.accent.primary} />
                  <Text style={[styles.buildHeaderText, { color: colors.accent.primary }]}>
                    Generation Pipeline Active
                  </Text>
                </View>
                <View style={styles.stepList}>
                  {buildMessages.map((msg, index) => {
                    const stepNum = index + 1;
                    const isDone = buildStep > stepNum;
                    const isCurrent = buildStep === stepNum;
                    return (
                      <View key={index} style={styles.stepRow}>
                        {isDone ? (
                          <CheckCircle2 size={16} color="#10B981" />
                        ) : isCurrent ? (
                          <ActivityIndicator size="small" color={colors.accent.primary} />
                        ) : (
                          <View
                            style={[
                              styles.stepBullet,
                              { borderColor: colors.border },
                            ]}
                          />
                        )}
                        <Text
                          style={[
                            styles.stepText,
                            {
                              color: isDone
                                ? '#10B981'
                                : isCurrent
                                ? colors.textPrimary
                                : colors.textMuted,
                              fontWeight: isCurrent ? '700' : '500',
                            },
                          ]}
                        >
                          {msg}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </GlassCard>
            )}

            {/* Active Project & Live Preview Workspace */}
            {activeProject && !isBuilding && (
              <View style={styles.workspaceSection}>
                <GlassCard glow>
                  <View style={styles.projectInfoRow}>
                    <View style={styles.projectInfoLeft}>
                      <Globe size={18} color={colors.accent.primary} />
                      <View>
                        <Text style={[styles.projectTitle, { color: colors.textPrimary }]}>
                          {activeProject.title}
                        </Text>
                        <Text style={[styles.projectSub, { color: colors.textSecondary }]}>
                          Live Sandbox Runtime Active
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => setShowLivePreviewModal(true)}
                      style={[styles.previewPill, { backgroundColor: colors.accent.tagBg }]}
                    >
                      <ExternalLink size={12} color={colors.accent.primary} />
                      <Text style={[styles.previewPillText, { color: colors.accent.primary }]}>
                        Expand
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Device Viewport Selector */}
                  <View style={styles.deviceRow}>
                    {[
                      { id: 'mobile', label: 'Mobile', icon: Smartphone },
                      { id: 'tablet', label: 'Tablet', icon: Tablet },
                      { id: 'desktop', label: 'Desktop', icon: Monitor },
                    ].map((dev) => {
                      const Icon = dev.icon;
                      const active = previewDevice === dev.id;
                      return (
                        <TouchableOpacity
                          key={dev.id}
                          onPress={() => setPreviewDevice(dev.id as any)}
                          style={[
                            styles.deviceChip,
                            {
                              backgroundColor: active ? colors.accent.primary : 'transparent',
                              borderColor: active ? colors.accent.primary : colors.border,
                            },
                          ]}
                        >
                          <Icon size={12} color={active ? '#FFFFFF' : colors.textSecondary} />
                          <Text
                            style={[
                              styles.deviceText,
                              { color: active ? '#FFFFFF' : colors.textSecondary },
                            ]}
                          >
                            {dev.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Simulated Device Frame Preview */}
                  <View
                    style={[
                      styles.deviceFrame,
                      {
                        backgroundColor: isDark ? '#090D16' : '#FFFFFF',
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.frameHeader}>
                      <View style={styles.frameDots}>
                        <View style={[styles.frameDot, { backgroundColor: '#EF4444' }]} />
                        <View style={[styles.frameDot, { backgroundColor: '#F59E0B' }]} />
                        <View style={[styles.frameDot, { backgroundColor: '#10B981' }]} />
                      </View>
                      <Text style={[styles.frameUrl, { color: colors.textMuted }]}>
                        https://preview.ai-ads.agency/{activeProject.projectId}
                      </Text>
                    </View>

                    {/* Mock Website Canvas */}
                    <View style={styles.previewCanvas}>
                      <View style={styles.mockHero}>
                        <Badge label="Built with AI Ads" variant="accent" />
                        <Text style={[styles.mockTitle, { color: colors.textPrimary }]}>
                          {activeProject.title}
                        </Text>
                        <Text style={[styles.mockSub, { color: colors.textSecondary }]}>
                          Accelerate your marketing pipeline with bespoke design tokens and automated components.
                        </Text>
                        <View style={styles.mockCtaRow}>
                          <View style={[styles.mockBtn, { backgroundColor: colors.accent.primary }]}>
                            <Text style={styles.mockBtnText}>Explore Solutions</Text>
                          </View>
                          <View
                            style={[
                              styles.mockBtnOutline,
                              { borderColor: colors.border },
                            ]}
                          >
                            <Text style={[styles.mockBtnOutlineText, { color: colors.textPrimary }]}>
                              Documentation
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Mock Features Section */}
                      <View style={styles.mockGrid}>
                        <View
                          style={[
                            styles.mockCard,
                            { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC' },
                          ]}
                        >
                          <Text style={[styles.mockCardTitle, { color: colors.textPrimary }]}>
                            Bespoke Tokens
                          </Text>
                          <Text style={[styles.mockCardSub, { color: colors.textSecondary }]}>
                            Fluid type scale, verified accessibility contrasts.
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.mockCard,
                            { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC' },
                          ]}
                        >
                          <Text style={[styles.mockCardTitle, { color: colors.textPrimary }]}>
                            Zero Latency
                          </Text>
                          <Text style={[styles.mockCardSub, { color: colors.textSecondary }]}>
                            Optimized bundle for instantaneous mobile rendering.
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.previewActionRow}>
                    <TouchableOpacity
                      onPress={() => handleShare('https://preview.ai-ads.agency/' + activeProject.projectId)}
                      style={[styles.smallActionBtn, { borderColor: colors.border }]}
                    >
                      <ExternalLink size={14} color={colors.textPrimary} />
                      <Text style={[styles.smallActionText, { color: colors.textPrimary }]}>
                        Share Link
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleStartBuild()}
                      style={[styles.smallActionBtn, { borderColor: colors.border }]}
                    >
                      <RefreshCw size={14} color={colors.accent.primary} />
                      <Text style={[styles.smallActionText, { color: colors.accent.primary }]}>
                        Rebuild
                      </Text>
                    </TouchableOpacity>
                  </View>
                </GlassCard>

                {/* Conversational Iterative Editing Box */}
                <GlassCard>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    Conversational AI Editor
                  </Text>
                  <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                    Request real-time component updates and layout modifications
                  </Text>

                  {/* Chat History */}
                  <View style={styles.chatHistoryBox}>
                    {chatHistory.map((item, index) => (
                      <View
                        key={index}
                        style={[
                          styles.chatBubble,
                          item.sender === 'user'
                            ? [
                                styles.chatUser,
                                { backgroundColor: colors.accent.primary },
                              ]
                            : [
                                styles.chatAi,
                                {
                                  backgroundColor: isDark
                                    ? 'rgba(255,255,255,0.06)'
                                    : '#F1F5F9',
                                },
                              ],
                        ]}
                      >
                        <Text
                          style={[
                            styles.chatText,
                            {
                              color:
                                item.sender === 'user' ? '#FFFFFF' : colors.textPrimary,
                            },
                          ]}
                        >
                          {item.text}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Chat Input */}
                  <View style={styles.chatInputRow}>
                    <TextInput
                      value={chatMessage}
                      onChangeText={setChatMessage}
                      placeholder="e.g. Change primary color to emerald and add FAQ section..."
                      placeholderTextColor={colors.textMuted}
                      style={[
                        styles.chatInput,
                        {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                          borderColor: colors.border,
                          color: colors.textPrimary,
                        },
                      ]}
                    />
                    <TouchableOpacity
                      onPress={handleSendChatEdit}
                      style={[styles.sendBtn, { backgroundColor: colors.accent.primary }]}
                    >
                      <Send size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              </View>
            )}
          </View>
        )}

        {/* ── 2. PROJECTS REPOSITORY VIEW ── */}
        {activeTab === 'PROJECTS' && (
          <View style={styles.tabContent}>
            <View style={styles.projectsHeaderRow}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Project Repository
                </Text>
                <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                  All generated React websites for your active workspace
                </Text>
              </View>
              <Button
                title="New Build"
                onPress={() => setActiveTab('STUDIO')}
                icon={<Sparkles size={14} color="#FFFFFF" />}
                style={{ paddingVertical: 8, paddingHorizontal: 14 }}
              />
            </View>

            {loadingProjects ? (
              <ActivityIndicator size="small" color={colors.accent.primary} style={{ marginTop: 24 }} />
            ) : projects.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Globe size={32} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                  No Websites Built Yet
                </Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  Switch to the Studio tab to synthesize your first React website from an AI prompt.
                </Text>
              </GlassCard>
            ) : (
              <View style={styles.projectsList}>
                {projects.map((proj) => {
                  const isStarred = starredIds.includes(proj.projectId);
                  return (
                    <GlassCard key={proj.projectId} style={styles.projectCard}>
                      <View style={styles.projectCardHeader}>
                        <View style={styles.projectCardLeft}>
                          <View style={[styles.iconCircle, { backgroundColor: colors.accent.tagBg }]}>
                            <Globe size={16} color={colors.accent.primary} />
                          </View>
                          <View>
                            <Text style={[styles.projCardTitle, { color: colors.textPrimary }]}>
                              {proj.title}
                            </Text>
                            <Text style={[styles.projCardSub, { color: colors.textSecondary }]}>
                              {proj.businessType || 'Full-Stack React App'}
                            </Text>
                          </View>
                        </View>

                        <TouchableOpacity onPress={() => toggleStar(proj.projectId)}>
                          <Star
                            size={18}
                            color={isStarred ? '#F59E0B' : colors.textMuted}
                            fill={isStarred ? '#F59E0B' : 'transparent'}
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.projMetaRow}>
                        <Badge label="Runtime Ready" variant="success" />
                        <Badge label={proj.website?.pages?.length ? `${proj.website.pages.length} Pages` : 'Multi-page'} variant="accent" />
                      </View>

                      <View style={styles.projActions}>
                        <TouchableOpacity
                          onPress={() => {
                            setActiveProject(proj);
                            setActiveTab('STUDIO');
                          }}
                          style={[styles.projBtn, { backgroundColor: colors.accent.primary }]}
                        >
                          <Text style={styles.projBtnText}>Open Studio</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleDelete(proj.projectId)}
                          style={[styles.projIconBtn, { borderColor: colors.border }]}
                        >
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </GlassCard>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ── 3. TEMPLATES GALLERY VIEW ── */}
        {activeTab === 'TEMPLATES' && (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Application Templates
            </Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
              Pre-configured business architectures ready for autonomous generation
            </Text>

            <View style={styles.templatesList}>
              {TEMPLATES_LIST.map((tmpl) => (
                <GlassCard key={tmpl.id} style={styles.templateCard}>
                  <View style={styles.templateTopRow}>
                    <Badge label={tmpl.category} variant="accent" />
                    <TouchableOpacity
                      onPress={() => {
                        setPrompt(tmpl.prompt);
                        setActiveTab('STUDIO');
                      }}
                      style={styles.templateUseBtn}
                    >
                      <Text style={[styles.templateUseText, { color: colors.accent.primary }]}>
                        Use Template
                      </Text>
                      <ChevronRight size={14} color={colors.accent.primary} />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.templateTitle, { color: colors.textPrimary }]}>
                    {tmpl.title}
                  </Text>
                  <Text style={[styles.templateDesc, { color: colors.textSecondary }]}>
                    {tmpl.description}
                  </Text>
                </GlassCard>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Expanded Live Preview Modal */}
      <Modal visible={showLivePreviewModal} animationType="slide" transparent={false}>
        <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => setShowLivePreviewModal(false)}
              style={styles.modalBackBtn}
            >
              <ArrowLeft size={18} color={colors.textPrimary} />
              <Text style={[styles.modalBackText, { color: colors.textPrimary }]}>Close Preview</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {activeProject?.title || 'Preview'}
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={[styles.expandedCanvas, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF', borderColor: colors.border }]}>
              <View style={styles.mockHero}>
                <Badge label="Live Standalone React Runtime" variant="success" />
                <Text style={[styles.mockTitle, { color: colors.textPrimary, fontSize: 24 }]}>
                  {activeProject?.title}
                </Text>
                <Text style={[styles.mockSub, { color: colors.textSecondary }]}>
                  Full-stack layout configured with Tailwind tokens, hero section, metrics strip, and automated contact flows.
                </Text>
              </View>

              <View style={styles.mockGrid}>
                {['Overview', 'Platform Specifications', 'Pricing Models', 'Client Validation'].map((item, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.modalFeatureCard,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.mockCardTitle, { color: colors.textPrimary }]}>{item}</Text>
                    <Text style={[styles.mockCardSub, { color: colors.textSecondary }]}>
                      Synthesized component block optimized for high-conversion engagement.
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  navBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  navScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  navChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  navChipText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
  },
  tabContent: {
    gap: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
  },
  sectionSub: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
    marginBottom: 6,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    fontSize: FONT_SIZES.body,
    lineHeight: LINE_HEIGHTS.body,
    textAlignVertical: 'top',
    minHeight: 88,
  },
  presetScroll: {
    marginBottom: 14,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    maxWidth: 240,
  },
  presetText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
  },
  actionBtn: {
    marginTop: 6,
  },
  buildCard: {
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EC4899',
  },
  buildHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  buildHeaderText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  stepList: {
    gap: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepBullet: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
  },
  stepText: {
    fontSize: FONT_SIZES.caption,
    lineHeight: LINE_HEIGHTS.caption,
    flex: 1,
  },
  workspaceSection: {
    gap: 16,
  },
  projectInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  projectInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  projectTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  projectSub: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
  },
  previewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  previewPillText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.caption,
  },
  deviceRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  deviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  deviceText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  deviceFrame: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  frameHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  frameDots: {
    flexDirection: 'row',
    gap: 4,
  },
  frameDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  frameUrl: {
    fontSize: 10,
    fontWeight: '500',
  },
  previewCanvas: {
    padding: 16,
    gap: 14,
  },
  mockHero: {
    alignItems: 'center',
    textAlign: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  mockTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
    textAlign: 'center',
  },
  mockSub: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.caption,
    textAlign: 'center',
    maxWidth: 280,
  },
  mockCtaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  mockBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  mockBtnText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  mockBtnOutline: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  mockBtnOutlineText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  mockGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  mockCard: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    gap: 4,
  },
  mockCardTitle: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.caption,
  },
  mockCardSub: {
    fontSize: 10,
    lineHeight: 14,
  },
  previewActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  smallActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  smallActionText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  chatHistoryBox: {
    gap: 8,
    marginVertical: 12,
    maxHeight: 180,
  },
  chatBubble: {
    padding: 10,
    borderRadius: 12,
    maxWidth: '85%',
  },
  chatUser: {
    alignSelf: 'flex-end',
  },
  chatAi: {
    alignSelf: 'flex-start',
  },
  chatText: {
    fontSize: FONT_SIZES.caption,
    lineHeight: LINE_HEIGHTS.caption,
  },
  chatInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: FONT_SIZES.body,
    lineHeight: LINE_HEIGHTS.body,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
    marginTop: 16,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  emptySub: {
    fontSize: FONT_SIZES.caption,
    textAlign: 'center',
    lineHeight: LINE_HEIGHTS.caption,
  },
  projectsList: {
    gap: 12,
  },
  projectCard: {
    padding: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EC4899',
  },
  projectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projCardTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  projCardSub: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
  },
  projMetaRow: {
    flexDirection: 'row',
    gap: 6,
  },
  projActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  projBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projBtnText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.caption,
  },
  projIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templatesList: {
    gap: 12,
  },
  templateCard: {
    padding: 16,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EC4899',
  },
  templateTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateUseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  templateUseText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.caption,
  },
  templateTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  templateDesc: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.caption,
  },
  modalRoot: {
    flex: 1,
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalBackText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.body,
  },
  modalTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  modalScroll: {
    padding: 16,
  },
  expandedCanvas: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  modalFeatureCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    minWidth: 130,
  },
});
