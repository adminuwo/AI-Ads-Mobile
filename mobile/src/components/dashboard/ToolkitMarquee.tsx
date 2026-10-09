import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import {
  Dna,
  Search,
  Layers,
  Target,
  Calendar,
  Globe,
  FolderKanban,
  Palette,
  PenTool,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export interface ToolkitMarqueeItem {
  id: string;
  name: string;
  desc: string;
  badge: string;
  color: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  onPress: (navigation: any) => void;
}

export const TOOLKIT_MARQUEE_ITEMS: ToolkitMarqueeItem[] = [
  {
    id: 'brand_dna',
    name: 'Brand DNA',
    desc: 'Panch Tattva Voice & Memory',
    badge: 'Core Memory',
    color: '#EA580C',
    icon: Dna,
    onPress: (nav) => nav.navigate('More', { screen: 'BrandDna' }),
  },
  {
    id: 'seo',
    name: 'SEO Intelligence',
    desc: 'Rank #1, Keywords & Audits',
    badge: 'Rank #1',
    color: '#0D9488',
    icon: Search,
    onPress: (nav) => nav.navigate('More', { screen: 'SEO' }),
  },
  {
    id: 'campaigns',
    name: 'Ad Campaigns',
    desc: 'Meta, Google & LinkedIn Ads',
    badge: 'Omnichannel',
    color: '#3B82F6',
    icon: Layers,
    onPress: (nav) => nav.navigate('More', { screen: 'Campaigns' }),
  },
  {
    id: 'strategy',
    name: 'Marketing Strategy',
    desc: 'Autonomous 90-Day Plan',
    badge: 'Autonomous',
    color: '#8B5CF6',
    icon: Target,
    onPress: (nav) => nav.navigate('Strategy', { screen: 'StrategyHome' }),
  },
  {
    id: 'calendar',
    name: 'Content Calendar',
    desc: 'Smart Scheduled Auto-Publish',
    badge: 'Auto-Publish',
    color: '#10B981',
    icon: Calendar,
    onPress: (nav) => nav.navigate('CalendarTab', { screen: 'CalendarHome' }),
  },
  {
    id: 'website_builder',
    name: 'AI Website Builder',
    desc: 'Instant Landing Pages in 60s',
    badge: 'Instant 60s',
    color: '#EC4899',
    icon: Globe,
    onPress: (nav) => nav.navigate('More', { screen: 'WebsiteBuilder' }),
  },
  {
    id: 'asset_library',
    name: 'Asset Library',
    desc: '4K Logos & Media Vault',
    badge: '4K Cloud',
    color: '#059669',
    icon: FolderKanban,
    onPress: (nav) => nav.navigate('AssetLibraryTab'),
  },
  {
    id: 'creative_studio',
    name: 'Creative Studio',
    desc: 'Photoreal Banners & Creatives',
    badge: '4K Photoreal',
    color: '#7C3AED',
    icon: Palette,
    onPress: (nav) => nav.navigate('More', { screen: 'CreativeStudio' }),
  },
  {
    id: 'content_studio',
    name: 'AI Copywriting',
    desc: 'High-Converting Copy & Hooks',
    badge: '+340% CTR',
    color: '#E11D48',
    icon: PenTool,
    onPress: (nav) => nav.navigate('CreateTab', { screen: 'CreateHome' }),
  },
];

// Horizontal Card Geometry
const CARD_WIDTH = 220;
const CARD_GAP = 12;
const SINGLE_ITEM_SPAN = CARD_WIDTH + CARD_GAP; // 232px
const CYCLE_TOTAL_WIDTH = TOOLKIT_MARQUEE_ITEMS.length * SINGLE_ITEM_SPAN; // 9 * 232 = 2088px

// 3 copies to ensure seamless infinite looping with zero pop-in
const MARQUEE_STREAM = [
  ...TOOLKIT_MARQUEE_ITEMS,
  ...TOOLKIT_MARQUEE_ITEMS,
  ...TOOLKIT_MARQUEE_ITEMS,
];

export const ToolkitMarquee: React.FC = () => {
  const { isDark, colors } = useTheme();
  const navigation = useNavigation<any>();

  // Continuous linear translation along X axis
  const scrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: -CYCLE_TOTAL_WIDTH,
        duration: 26000, // 26 seconds: smooth, leisurely, comfortable reading velocity
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop();
  }, []);

  const handlePressItem = (item: ToolkitMarqueeItem) => {
    Haptics.selectionAsync().catch(() => {});
    try {
      item.onPress(navigation);
    } catch (err) {
      console.warn('Navigation error:', err);
    }
  };

  const fadeColor = isDark ? colors.background : '#FFF4F6';

  return (
    <View style={styles.container}>
      {/* Left Edge Dissolve Fade Mask */}
      <LinearGradient
        colors={[fadeColor, 'rgba(0,0,0,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.leftFadeMask}
        pointerEvents="none"
      />

      {/* Auto-scrolling conveyor */}
      <Animated.View
        style={[
          styles.track,
          {
            transform: [{ translateX: scrollAnim }],
          },
        ]}
      >
        {MARQUEE_STREAM.map((item, index) => {
          const IconComponent = item.icon;

          return (
            <TouchableOpacity
              key={`${item.id}-${index}`}
              activeOpacity={0.8}
              onPress={() => handlePressItem(item)}
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.65)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(244, 114, 182, 0.18)',
                  shadowColor: isDark ? '#000000' : '#A3B1C6',
                },
              ]}
            >
              {/* Icon Container */}
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: `${item.color}15`,
                    borderColor: `${item.color}35`,
                  },
                ]}
              >
                <IconComponent
                  size={19}
                  color={item.color}
                  strokeWidth={2.3}
                />
              </View>

              {/* Text Info Column */}
              <View style={styles.infoCol}>
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.titleText,
                      { color: isDark ? '#F8FAFC' : '#0F172A' },
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <View
                    style={[
                      styles.badgePill,
                      {
                        backgroundColor: `${item.color}14`,
                        borderColor: `${item.color}30`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: item.color },
                      ]}
                    >
                      {item.badge}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.descText,
                    { color: isDark ? '#94A3B8' : '#64748B' },
                  ]}
                  numberOfLines={2}
                >
                  {item.desc}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* Right Edge Dissolve Fade Mask */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', fadeColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.rightFadeMask}
        pointerEvents="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 80,
    marginTop: 8,
    marginBottom: 6,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: 72,
    marginRight: CARD_GAP,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  badgePill: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 0.8,
  },
  badgeText: {
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  descText: {
    fontSize: 9.5,
    fontWeight: '500',
    lineHeight: 12,
  },
  leftFadeMask: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 22,
    zIndex: 10,
  },
  rightFadeMask: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 22,
    zIndex: 10,
  },
});
