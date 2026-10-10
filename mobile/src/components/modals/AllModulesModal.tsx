import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  LayoutGrid,
  Dna,
  Search,
  Layers,
  Target,
  Calendar,
  PenTool,
  CheckCircle2,
  Palette,
  FolderKanban,
  Globe,
  Crown,
  Settings,
  Lock,
  Moon,
  Sun,
  X,
  PanelLeftClose,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { PanchTattvaRibbon } from '../common/PanchTattvaRibbon';

interface AllModulesModalProps {
  visible: boolean;
  onClose: () => void;
}

interface NavModule {
  id: string;
  label: string;
  icon: any;
  color: string;
  isPro?: boolean;
  activeColors: [string, string];
  route: { tab: string; screen?: string };
}

const SIDEBAR_WIDTH = Math.min(Dimensions.get('window').width * 0.76, 290);

export const AllModulesModal: React.FC<AllModulesModalProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const { activeWorkspace, setActiveToolkitFeature } = useWorkspace();
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  // Active module state (defaults to 'dashboard' matching reference UI)
  const [activeId, setActiveId] = React.useState('dashboard');

  // Animated slide from left
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Exact 11 modules in the EXACT order requested by user screenshot:
  const modules: NavModule[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutGrid,
      color: '#EF4444',
      activeColors: ['#F43F5E', '#E11D48'],
      route: { tab: 'Home' },
    },
    {
      id: 'brand_dna',
      label: 'Brand DNA',
      icon: Dna,
      color: '#F59E0B',
      activeColors: ['#F59E0B', '#D97706'],
      route: { tab: 'More', screen: 'BrandDna' },
    },
    {
      id: 'seo',
      label: 'SEO Intelligence',
      icon: Search,
      color: '#10B981',
      activeColors: ['#10B981', '#059669'],
      route: { tab: 'More', screen: 'SEO' },
    },
    {
      id: 'campaigns',
      label: 'Campaigns',
      icon: Layers,
      color: '#3B82F6',
      activeColors: ['#3B82F6', '#2563EB'],
      route: { tab: 'More', screen: 'Campaigns' },
    },
    {
      id: 'strategy',
      label: 'Strategy',
      icon: Target,
      color: '#8B5CF6',
      activeColors: ['#8B5CF6', '#7C3AED'],
      route: { tab: 'Strategy', screen: 'StrategyHome' },
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      color: '#22C55E',
      activeColors: ['#22C55E', '#16A34A'],
      route: { tab: 'CalendarTab', screen: 'CalendarHome' },
    },
    {
      id: 'studio',
      label: 'Content Studio',
      icon: PenTool,
      color: '#F97316',
      activeColors: ['#F97316', '#EA580C'],
      route: { tab: 'Studio', screen: 'CreateHome' },
    },
    {
      id: 'creative',
      label: 'Creative Studio',
      icon: Palette,
      color: '#6366F1',
      activeColors: ['#6366F1', '#4F46E5'],
      route: { tab: 'More', screen: 'CreativeStudio' },
    },
    {
      id: 'assets',
      label: 'Asset Library',
      icon: FolderKanban,
      color: '#06B6D4',
      activeColors: ['#06B6D4', '#0891B2'],
      route: { tab: 'More', screen: 'AssetLibrary' },
    },
    {
      id: 'website_builder',
      label: 'AI Website Buil...',
      icon: Globe,
      color: '#A855F7',
      isPro: true,
      activeColors: ['#EC4899', '#8B5CF6'],
      route: { tab: 'More', screen: 'WebsiteBuilder' },
    },
  ];

  const handleNavigate = (item: NavModule) => {
    setActiveId(item.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const isToolkitModule = [
      'brand_dna',
      'seo',
      'campaigns',
      'strategy',
      'studio',
      'creative',
      'website_builder',
    ].includes(item.id);

    if (isToolkitModule) {
      setActiveToolkitFeature(item.id);
    } else {
      setActiveToolkitFeature(null);
    }

    onClose();
    setTimeout(() => {
      try {
        if (item.route.screen) {
          try {
            navigation.navigate('Main', {
              screen: item.route.tab,
              params: { screen: item.route.screen },
            });
            return;
          } catch {}
          navigation.navigate(item.route.tab, { screen: item.route.screen });
        } else {
          try {
            navigation.navigate('Main', { screen: item.route.tab });
            return;
          } catch {}
          navigation.navigate(item.route.tab);
        }
      } catch (err) {
        console.warn('Sidebar navigation error:', err);
      }
    }, 180);
  };

  const handlePlanClick = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onClose();
    setTimeout(() => {
      navigation.navigate('More', { screen: 'SettingsBilling' });
    }, 180);
  };

  const handleSettingsClick = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onClose();
    setTimeout(() => {
      navigation.navigate('More', { screen: 'SettingsBilling' });
    }, 180);
  };

  const userName = user?.name || 'Sonali Gupta';
  const userPlan = user?.plan || activeWorkspace?.subscriptionTier || 'Agency / Scale';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        {/* Backdrop overlay */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Sliding Sidebar Drawer */}
        <Animated.View
          style={[
            styles.drawerContainer,
            {
              width: SIDEBAR_WIDTH,
              backgroundColor: isDark ? '#080B1A' : '#FAFCFF',
              borderRightColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(226, 232, 240, 0.9)',
              transform: [{ translateX: slideAnim }],
              paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 12 : 20),
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          {/* Top Decorative Ribbon */}
          <View style={styles.topRibbonWrap}>
            <PanchTattvaRibbon height={3} />
          </View>

          {/* ── TOP HEADER ── */}
          <View style={styles.headerRow}>
            {/* Logo + "AI Ads —TM" */}
            <View style={styles.logoTitleGroup}>
              <View style={styles.logoCircle}>
                <Image
                  source={require('../../../assets/logo_icon_only.png')}
                  style={styles.logoImg}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.titleRow}>
                <Text style={styles.brandTitleAI}>AI </Text>
                <Text style={styles.brandTitleAds}>Ads</Text>
                <Text style={styles.brandTM}>—TM</Text>
              </View>
            </View>

            {/* Mint Close Button */}
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.collapseBtn,
                {
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.12)',
                  borderColor: isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.28)',
                },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <X size={15} color="#10B981" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          {/* ── SCROLLABLE NAVIGATION LIST ── */}
          <ScrollView
            style={styles.modulesScrollView}
            contentContainerStyle={styles.modulesScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modulesListCol}>
              {modules.map((m) => {
                const IconComponent = m.icon;
                const isActive = m.id === activeId;

                return (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => handleNavigate(m)}
                    activeOpacity={0.85}
                    style={styles.moduleItemBtn}
                  >
                    {isActive ? (
                      /* Highlighted Active Gradient Capsule (Dashboard / Active Module) */
                      <LinearGradient
                        colors={m.activeColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.itemGradientCapsule, styles.dashboardCapsuleShadow]}
                      >
                        <View style={styles.dashboardIconBox}>
                          <IconComponent size={15} color="#FFFFFF" strokeWidth={2.4} />
                        </View>
                        <Text style={styles.dashboardLabelText} numberOfLines={1}>
                          {m.label}
                        </Text>
                      </LinearGradient>
                    ) : (
                      /* White/Clean Pill for all other modules */
                      <View
                        style={[
                          styles.regularItemPill,
                          {
                            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(226, 232, 240, 0.9)',
                            shadowColor: isDark ? '#000000' : '#CBD5E1',
                          },
                        ]}
                      >
                        {/* Tinted Icon Box */}
                        <View
                          style={[
                            styles.regularIconBox,
                            {
                              backgroundColor: `${m.color}15`,
                            },
                          ]}
                        >
                          <IconComponent size={14} color={m.color} strokeWidth={2.2} />
                        </View>

                        {/* Module Label */}
                        <Text
                          style={[
                            styles.regularLabelText,
                            { color: isDark ? '#F1F5F9' : '#1E293B' },
                          ]}
                          numberOfLines={1}
                        >
                          {m.label}
                        </Text>

                        {/* Orange Pro Lock Badge */}
                        {m.isPro && (
                          <LinearGradient
                            colors={['#F59E0B', '#EA580C']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.proBadge}
                          >
                            <Lock size={9} color="#FFFFFF" strokeWidth={2.5} />
                            <Text style={styles.proBadgeText}>PRO</Text>
                          </LinearGradient>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── PLAN & SETTINGS ACTION BUTTONS ROW ── */}
            <View style={styles.actionRow}>
              {/* PLAN BUTTON */}
              <TouchableOpacity
                onPress={handlePlanClick}
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.1)',
                    borderColor: isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.3)',
                  },
                ]}
                activeOpacity={0.75}
              >
                <Crown size={13} color="#10B981" strokeWidth={2.2} />
                <Text style={styles.planBtnText}>PLAN</Text>
              </TouchableOpacity>

              {/* SETTINGS BUTTON */}
              <TouchableOpacity
                onPress={handleSettingsClick}
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: isDark ? 'rgba(6, 182, 212, 0.12)' : 'rgba(6, 182, 212, 0.1)',
                    borderColor: isDark ? 'rgba(6, 182, 212, 0.35)' : 'rgba(6, 182, 212, 0.3)',
                  },
                ]}
                activeOpacity={0.75}
              >
                <Settings size={13} color="#0891B2" strokeWidth={2.2} />
                <Text style={styles.settingsBtnText}>SETTINGS</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* ── BOTTOM PROFILE & THEME CARD ── */}
          <View style={styles.profileSectionWrap}>
            <View
              style={[
                styles.profileCard,
                {
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(226, 232, 240, 0.9)',
                },
              ]}
            >
              {/* Avatar with Rainbow Border */}
              <LinearGradient
                colors={['#F43F5E', '#A855F7', '#06B6D4']}
                style={styles.avatarBorder}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.avatarInner}>
                  {user?.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
                  ) : (
                    <Image
                      source={require('../../../assets/ai_ads_camera_full_logo.png')}
                      style={styles.avatarImg}
                      resizeMode="cover"
                    />
                  )}
                </View>
              </LinearGradient>

              {/* User Name & Plan */}
              <View style={styles.profileTextCol}>
                <Text
                  style={[
                    styles.profileName,
                    { color: isDark ? '#FFFFFF' : '#0F172A' },
                  ]}
                  numberOfLines={1}
                >
                  {userName}
                </Text>
                <Text
                  style={[
                    styles.profileSub,
                    { color: isDark ? '#94A3B8' : '#64748B' },
                  ]}
                  numberOfLines={1}
                >
                  {userPlan}
                </Text>
              </View>

              {/* Theme Toggle Button (Moon / Sun) */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  toggleTheme();
                }}
                style={[
                  styles.themeToggleBtn,
                  {
                    backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(245, 158, 11, 0.08)',
                    borderColor: isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(245, 158, 11, 0.35)',
                  },
                ]}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                activeOpacity={0.7}
              >
                {isDark ? (
                  <Sun size={14} color="#F59E0B" strokeWidth={2.2} />
                ) : (
                  <Moon size={14} color="#7C3AED" strokeWidth={2.2} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  drawerContainer: {
    height: '100%',
    borderRightWidth: 1.5,
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 20,
    zIndex: 999,
  },
  topRibbonWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },

  // ── HEADER ──
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.4)',
  },
  logoTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: {
    width: 30,
    height: 30,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitleAI: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F59E0B',
    letterSpacing: -0.3,
  },
  brandTitleAds: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6366F1',
    letterSpacing: -0.3,
  },
  brandTM: {
    fontSize: 8,
    fontWeight: '800',
    color: '#F59E0B',
    marginLeft: 2,
    marginTop: -8,
  },
  collapseBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── SCROLLABLE LIST ──
  modulesScrollView: {
    flex: 1,
  },
  modulesScrollContent: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 12,
  },
  modulesListCol: {
    gap: 5.5,
  },
  moduleItemBtn: {
    width: '100%',
  },

  // Highlighted Red Active Capsule (Dashboard)
  itemGradientCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7.5,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 9,
  },
  dashboardCapsuleShadow: {
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  dashboardIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },

  // Regular Module Pill
  regularItemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6.5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 9,
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1.5,
  },
  regularIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regularLabelText: {
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  proBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // ── PLAN & SETTINGS ACTION BUTTONS ROW ──
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.5)',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    gap: 5,
  },
  planBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.2,
  },
  settingsBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0891B2',
    letterSpacing: 0.2,
  },

  // ── BOTTOM PROFILE & THEME CARD ──
  profileSectionWrap: {
    paddingHorizontal: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.5)',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6.5,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  avatarBorder: {
    width: 32,
    height: 32,
    borderRadius: 9,
    padding: 1.5,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 7.5,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  profileTextCol: {
    flex: 1,
  },
  profileName: {
    fontSize: 11.5,
    fontWeight: '700',
    lineHeight: 15,
  },
  profileSub: {
    fontSize: 9.5,
    fontWeight: '500',
    lineHeight: 13,
  },
  themeToggleBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
