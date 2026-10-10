import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  Pressable,
  Platform,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import {
  Wrench,
  Dna,
  Search,
  Layers,
  Target,
  Calendar,
  Globe,
  FolderKanban,
  Palette,
  PenTool,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';

interface ToolkitModalProps {
  visible: boolean;
  onClose: () => void;
}

interface FeatureItem {
  id: string;
  title: string;
  icon: any;
  color: string;
  onPress: (navigation: any) => void;
}

export const ToolkitModal: React.FC<ToolkitModalProps> = ({ visible, onClose }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Responsive geometry: Full screen width, grounded at bottom
  const cardWidth = windowWidth;
  const bottomInset = insets.bottom;

  // True circle radius: Equal horizontal & vertical radius for a pure circle form around Brand DNA
  const R = Math.min(Math.max(cardWidth * 0.28, 98), 112);
  const cx = cardWidth / 2;
  const cy = R + 40;
  const radialAreaHeight = Math.round(2 * R + 78);
  const headerHeight = 62;
  const cardHeight = Math.round(headerHeight + radialAreaHeight + Math.max(bottomInset, 14));
  const archRadius = Math.min(cardWidth * 0.36, 136); // Sharp semi-circular curve

  // Slide and fade animations (instant travel distance cardHeight for split-second appearance)
  const slideAnim = useRef(new Animated.Value(cardHeight || 420)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 26,
          stiffness: 380,
          mass: 0.7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: cardHeight || 420,
          duration: 130,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, cardHeight]);

  // Sharp semi-circular dome arch matching user request:
  // Starts on left screen edge at (0, archRadius), arches up as a true semi-circle
  // to apex at top center (cardWidth / 2, 0), curves down to right edge (cardWidth, archRadius),
  // and extends straight down to the bottom of the screen.
  const domePath = [
    `M 0 ${archRadius}`,
    `A ${cardWidth / 2} ${archRadius} 0 0 1 ${cardWidth} ${archRadius}`,
    `L ${cardWidth} ${cardHeight}`,
    `L 0 ${cardHeight}`,
    'Z',
  ].join(' ');

  // Center feature: Brand DNA
  const centerFeature: FeatureItem = {
    id: 'brand_dna',
    title: 'Brand\nDNA',
    icon: Dna,
    color: '#EA580C',
    onPress: (nav) => nav.navigate('More', { screen: 'BrandDna' }),
  };

  // 8 outer features in CLOCKWISE order around Brand DNA:
  // 12:00 -> 1:30 -> 3:00 -> 4:30 -> 6:00 -> 7:30 -> 9:00 -> 10:30
  const outerFeatures: FeatureItem[] = [
    {
      id: 'seo',
      title: 'SEO\nIntelligence',
      icon: Search,
      color: '#0D9488',
      onPress: (nav) => nav.navigate('More', { screen: 'SEO' }),
    },
    {
      id: 'campaigns',
      title: 'Campaigns',
      icon: Layers,
      color: '#3B82F6',
      onPress: (nav) => nav.navigate('More', { screen: 'Campaigns' }),
    },
    {
      id: 'strategy',
      title: 'Strategy',
      icon: Target,
      color: '#8B5CF6',
      onPress: (nav) => nav.navigate('Strategy', { screen: 'StrategyHome' }),
    },
    {
      id: 'calendar',
      title: 'Calendar',
      icon: Calendar,
      color: '#22C55E',
      onPress: (nav) => nav.navigate('CalendarTab', { screen: 'CalendarHome' }),
    },
    {
      id: 'website_builder',
      title: 'AI\nWebsite',
      icon: Globe,
      color: '#EC4899',
      onPress: (nav) => nav.navigate('More', { screen: 'WebsiteBuilder' }),
    },
    {
      id: 'asset_library',
      title: 'Asset\nLibrary',
      icon: FolderKanban,
      color: '#059669',
      onPress: (nav) => nav.navigate('AssetLibraryTab'),
    },
    {
      id: 'creative_studio',
      title: 'Creative\nStudio',
      icon: Palette,
      color: '#7C3AED',
      onPress: (nav) => nav.navigate('More', { screen: 'CreativeStudio' }),
    },
    {
      id: 'content_studio',
      title: 'Content\nStudio',
      icon: PenTool,
      color: '#E11D48',
      onPress: (nav) => nav.navigate('Studio'),
    },
  ];
  const { setActiveToolkitFeature } = useWorkspace();

  const navigateToFeature = (item: FeatureItem) => {
    switch (item.id) {
      case 'brand_dna':
        try {
          navigation.navigate('Main', { screen: 'More', params: { screen: 'BrandDna' } });
        } catch {
          navigation.navigate('More', { screen: 'BrandDna' });
        }
        break;
      case 'seo':
        try {
          navigation.navigate('Main', { screen: 'More', params: { screen: 'SEO' } });
        } catch {
          navigation.navigate('More', { screen: 'SEO' });
        }
        break;
      case 'campaigns':
        try {
          navigation.navigate('Main', { screen: 'More', params: { screen: 'Campaigns' } });
        } catch {
          navigation.navigate('More', { screen: 'Campaigns' });
        }
        break;
      case 'strategy':
        try {
          navigation.navigate('Main', { screen: 'Strategy', params: { screen: 'StrategyHome' } });
        } catch {
          navigation.navigate('Strategy', { screen: 'StrategyHome' });
        }
        break;
      case 'website_builder':
        try {
          navigation.navigate('Main', { screen: 'More', params: { screen: 'WebsiteBuilder' } });
        } catch {
          navigation.navigate('More', { screen: 'WebsiteBuilder' });
        }
        break;
      case 'creative_studio':
        try {
          navigation.navigate('Main', { screen: 'More', params: { screen: 'CreativeStudio' } });
        } catch {
          navigation.navigate('More', { screen: 'CreativeStudio' });
        }
        break;
      case 'content_studio':
        try {
          navigation.navigate('Main', { screen: 'Studio', params: { screen: 'CreateHome' } });
        } catch {
          navigation.navigate('Studio');
        }
        break;
      case 'calendar':
        try {
          navigation.navigate('Main', { screen: 'CalendarTab', params: { screen: 'CalendarHome' } });
        } catch {
          navigation.navigate('CalendarTab', { screen: 'CalendarHome' });
        }
        break;
      case 'asset_library':
        try {
          navigation.navigate('Main', { screen: 'AssetLibraryTab' });
        } catch {
          navigation.navigate('AssetLibraryTab');
        }
        break;
      default:
        item.onPress(navigation);
    }
  };

  const handleSelect = (item: FeatureItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const isToolkitItem = [
      'brand_dna',
      'seo',
      'campaigns',
      'strategy',
      'website_builder',
      'creative_studio',
      'content_studio',
    ].includes(item.id);

    // Lock blue indicator line onto ToolKit icon immediately
    if (isToolkitItem) {
      setActiveToolkitFeature(item.id);
    } else {
      setActiveToolkitFeature(null);
    }

    onClose();
    setTimeout(() => {
      try {
        navigateToFeature(item);
      } catch (err) {
        console.warn('Navigation error in ToolkitModal:', err);
      }
    }, 40);
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Backdrop overlay */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Full-width Dome Card grounded to bottom */}
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              width: cardWidth,
              height: cardHeight,
              marginBottom: 0,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Solid fill below arch to ensure 100% gapless fill on all devices */}
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                top: archRadius,
                backgroundColor: isDark ? '#141824' : '#F1F5F9',
              },
            ]}
            pointerEvents="none"
          />

          {/* SVG Background shaping the arched dome of Image 1 */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width={cardWidth} height={cardHeight} viewBox={`0 0 ${cardWidth} ${cardHeight}`}>
              <Defs>
                <SvgLinearGradient id="cardGrad" x1="0.5" y1="0" x2="0.5" y2="1">
                  <Stop
                    offset="0%"
                    stopColor={isDark ? '#232938' : '#FFFFFF'}
                    stopOpacity="1"
                  />
                  <Stop
                    offset="60%"
                    stopColor={isDark ? '#1A1F2C' : '#F8FAFC'}
                    stopOpacity="1"
                  />
                  <Stop
                    offset="100%"
                    stopColor={isDark ? '#141824' : '#F1F5F9'}
                    stopOpacity="1"
                  />
                </SvgLinearGradient>
              </Defs>
              <Path
                d={domePath}
                fill="url(#cardGrad)"
                stroke={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.95)'}
                strokeWidth={1.5}
              />
            </Svg>
          </View>

          {/* Top Center Pill Handle */}
          <View style={styles.handlePill} pointerEvents="none" />

          {/* Top Header Section: Icon in top centre & Heading "Toolkit" in centre only */}
          <View style={styles.headerSection}>
            <View
              style={[
                styles.toolkitIconCircle,
                {
                  backgroundColor: colors.neu.card,
                  borderTopColor: colors.neu.borderLight,
                  borderLeftColor: colors.neu.borderLight,
                  borderBottomColor: colors.neu.borderDark,
                  borderRightColor: colors.neu.borderDark,
                  shadowColor: isDark ? '#000000' : '#818CF8',
                },
              ]}
            >
              <Wrench size={20} color="#6366F1" strokeWidth={2.2} />
            </View>

            <Text
              style={[
                styles.toolkitHeading,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}
            >
              Toolkit
            </Text>
          </View>

          {/* Features Circular Orbit Layout */}
          <View style={[styles.radialContainer, { height: radialAreaHeight }]}>
            {/* 1. CENTER FEATURE: Brand DNA */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleSelect(centerFeature)}
              style={[
                styles.centerItemContainer,
                {
                  left: cx - 38,
                  top: cy - 38,
                },
              ]}
            >
              <View
                style={[
                  styles.centerCircle,
                  {
                    backgroundColor: colors.neu.card,
                    borderTopColor: '#FDBA74',
                    borderLeftColor: '#FDBA74',
                    borderBottomColor: '#EA580C',
                    borderRightColor: '#EA580C',
                    shadowColor: isDark ? '#000000' : '#EA580C',
                  },
                ]}
              >
                <Dna size={25} color="#EA580C" strokeWidth={2.3} />
              </View>
              <Text
                style={[
                  styles.centerLabel,
                  { color: isDark ? '#F1F5F9' : '#0F172A' },
                ]}
                numberOfLines={2}
              >
                Brand{'\n'}DNA
              </Text>
            </TouchableOpacity>

            {/* 2. SURROUNDING 8 FEATURES: Clockwise Order (No arrows as requested) */}
            {outerFeatures.map((tool, idx) => {
              const Icon = tool.icon;
              // Starting at 12 o'clock (-pi/2) and moving clockwise by 45 deg (pi/4)
              const angle = -Math.PI / 2 + (idx * Math.PI) / 4;
              const posX = cx + R * Math.cos(angle);
              const posY = cy + R * Math.sin(angle);

              return (
                <TouchableOpacity
                  key={tool.id}
                  activeOpacity={0.75}
                  onPress={() => handleSelect(tool)}
                  style={[
                    styles.outerItemContainer,
                    {
                      left: posX - 36,
                      top: posY - 28,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.outerCircle,
                      {
                        backgroundColor: colors.neu.card,
                        borderTopColor: colors.neu.borderLight,
                        borderLeftColor: colors.neu.borderLight,
                        borderBottomColor: colors.neu.borderDark,
                        borderRightColor: colors.neu.borderDark,
                        shadowColor: isDark ? '#000000' : '#A3B1C6',
                      },
                    ]}
                  >
                    <Icon size={19} color={tool.color} strokeWidth={2.2} />
                  </View>

                  <Text
                    style={[
                      styles.outerLabel,
                      { color: isDark ? '#E2E8F0' : '#1E293B' },
                    ]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    {tool.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  cardWrapper: {
    width: '100%',
    overflow: 'visible',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 24,
  },
  handlePill: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#818CF8',
    zIndex: 10,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 9,
    paddingHorizontal: 20,
  },
  toolkitIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  toolkitHeading: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  radialContainer: {
    width: '100%',
    position: 'relative',
    marginTop: 4,
  },
  centerItemContainer: {
    position: 'absolute',
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
  },
  centerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 8,
  },
  centerLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 11,
  },
  outerItemContainer: {
    position: 'absolute',
    width: 72,
    height: 56,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 5,
  },
  outerCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  outerLabel: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 11,
  },
});
