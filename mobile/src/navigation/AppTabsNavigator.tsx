import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  House,
  Calendar as CalendarIcon,
  Wrench,
  FolderKanban,
  User,
  Target,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { PanchTattvaRibbon } from '../components/common/PanchTattvaRibbon';
import { FONT_SIZES } from '../config/typography';
import {
  CreateStackParamList,
  AppTabsParamList,
  StrategyStackParamList,
  CalendarStackParamList,
  MoreStackParamList,
} from './types';

// Screens
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { StudioHomeScreen } from '../screens/studio/StudioHomeScreen';
import { StrategyScreen } from '../screens/strategy/StrategyScreen';
import { SeoScreen } from '../screens/strategy/SeoScreen';
import { CampaignsScreen } from '../screens/strategy/CampaignsScreen';
import { CalendarScreen } from '../screens/calendar/CalendarScreen';
import { ApprovalsDeskScreen } from '../screens/calendar/ApprovalsDeskScreen';
import { MoreMenuScreen } from '../screens/more/MoreMenuScreen';
import { BrandDnaScreen } from '../screens/more/BrandDnaScreen';
import { AssetLibraryScreen } from '../screens/more/AssetLibraryScreen';
import { AnalyticsScreen } from '../screens/more/AnalyticsScreen';
import { SettingsBillingScreen } from '../screens/more/SettingsBillingScreen';
import { AIWebsiteBuilderScreen } from '../screens/websiteBuilder/AIWebsiteBuilderScreen';
import { TeamRbacScreen } from '../screens/more/TeamRbacScreen';
import { AdminDashboardScreen } from '../screens/more/AdminDashboardScreen';
import { ProductShowcaseScreen } from '../screens/more/ProductShowcaseScreen';
import { CreativeStudioScreen } from '../screens/studio/CreativeStudioScreen';

const Tab = createBottomTabNavigator<AppTabsParamList>();
const CreateStack = createNativeStackNavigator<CreateStackParamList>();
const StrategyStack = createNativeStackNavigator<StrategyStackParamList>();
const CalendarStack = createNativeStackNavigator<CalendarStackParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();

// Nested Create Stack (Unified Studio, Creative & Web Builder)
const CreateNavigator = () => (
  <CreateStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <CreateStack.Screen name="CreateHome" component={StudioHomeScreen} />
    <CreateStack.Screen name="CreativeStudio" component={CreativeStudioScreen} />
    <CreateStack.Screen name="WebsiteBuilder" component={AIWebsiteBuilderScreen} />
  </CreateStack.Navigator>
);

// Strategy Stack: Dedicated Strategy Hub Screen
const StrategyNavigator = () => (
  <StrategyStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <StrategyStack.Screen name="StrategyHome" component={StrategyScreen} />
  </StrategyStack.Navigator>
);

// Nested Calendar Stack
const CalendarNavigator = () => (
  <CalendarStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <CalendarStack.Screen name="CalendarHome" component={CalendarScreen} />
    <CalendarStack.Screen name="Approvals" component={ApprovalsDeskScreen} />
    <CalendarStack.Screen name="ApprovalsDesk" component={ApprovalsDeskScreen} />
    <CalendarStack.Screen name="AssetLibrary" component={AssetLibraryScreen} />
  </CalendarStack.Navigator>
);

// Nested More Stack (Dedicated Modules: SEO Intelligence, Ad Campaigns, Brand DNA, Website Builder, etc.)
const MoreNavigator = () => (
  <MoreStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <MoreStack.Screen name="MoreHome" component={MoreMenuScreen} />
    <MoreStack.Screen name="BrandDna" component={BrandDnaScreen} />
    <MoreStack.Screen name="AssetLibrary" component={AssetLibraryScreen} />
    <MoreStack.Screen name="Analytics" component={AnalyticsScreen} />
    <MoreStack.Screen name="SettingsBilling" component={SettingsBillingScreen} />
    <MoreStack.Screen name="WebsiteBuilder" component={AIWebsiteBuilderScreen} />
    <MoreStack.Screen name="TeamRbac" component={TeamRbacScreen} />
    <MoreStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    <MoreStack.Screen name="ProductShowcase" component={ProductShowcaseScreen} />
    <MoreStack.Screen name="CreativeStudio" component={CreativeStudioScreen} />
    <MoreStack.Screen name="Seo" component={SeoScreen} />
    <MoreStack.Screen name="SEO" component={SeoScreen} />
    <MoreStack.Screen name="Campaigns" component={CampaignsScreen} />
  </MoreStack.Navigator>
);


const TAB_ITEMS = [
  { name: 'Home', label: 'Home', Icon: House },
  { name: 'CalendarTab', label: 'Calendar', Icon: CalendarIcon },
  { name: 'Studio', label: 'ToolKit', Icon: Wrench, isToolkit: true },
  { name: 'AssetLibraryTab', label: 'Asset Library', Icon: FolderKanban },
  { name: 'More', label: 'Account', Icon: User },
];

const TOOLKIT_SCREENS = new Set([
  'brand_dna',
  'BrandDna',
  'BrandDnaScreen',
  'seo',
  'SEO',
  'Seo',
  'SeoScreen',
  'campaigns',
  'Campaigns',
  'CampaignsScreen',
  'strategy',
  'Strategy',
  'StrategyHome',
  'StrategyScreen',
  'website_builder',
  'WebsiteBuilder',
  'AIWebsiteBuilderScreen',
  'creative_studio',
  'CreativeStudio',
  'CreativeStudioScreen',
  'content_studio',
  'Studio',
  'CreateHome',
  'StudioHomeScreen',
  'ProductShowcase',
]);

const isToolkitScreenActive = (state: any): boolean => {
  if (!state || !state.routes || state.index === undefined) return false;
  const currentRoute = state.routes[state.index];
  if (!currentRoute) return false;

  // 1. Direct tab routes for ToolKit / Strategy
  if (currentRoute.name === 'Strategy' || currentRoute.name === 'Studio') {
    return true;
  }

  // 2. Direct params target (e.g. navigation.navigate('More', { screen: 'BrandDna' }))
  if (currentRoute.params?.screen && TOOLKIT_SCREENS.has(currentRoute.params.screen)) {
    return true;
  }

  // 3. Deeply inspect nested state (MoreStack, CreateStack, StrategyStack)
  let nestedState = currentRoute.state;
  while (nestedState && nestedState.routes) {
    const idx = nestedState.index !== undefined ? nestedState.index : nestedState.routes.length - 1;
    const activeChild = nestedState.routes[idx];
    if (!activeChild) break;

    if (TOOLKIT_SCREENS.has(activeChild.name)) {
      return true;
    }
    if (activeChild.params?.screen && TOOLKIT_SCREENS.has(activeChild.params.screen)) {
      return true;
    }
    nestedState = activeChild.state;
  }

  return false;
};

const DynamicSegmentedTabBar: React.FC<any> = ({ state, navigation }) => {
  const { colors, isDark } = useTheme();
  const { isToolkitOpen, setIsToolkitOpen, activeToolkitFeature, setActiveToolkitFeature } = useWorkspace();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 8);
  const tabBarHeight = 64 + bottomInset;

  const tabWidth = windowWidth / TAB_ITEMS.length;
  const barWidth = 40;

  // Blue line locks to ToolKit (index 2) whenever:
  // - Toolkit modal is open
  // - Any toolkit feature was launched (activeToolkitFeature)
  // - Any toolkit screen is currently active in the navigation state
  const isToolkitFeatureOnScreen =
    isToolkitOpen ||
    Boolean(activeToolkitFeature) ||
    isToolkitScreenActive(state);

  const currentRouteName = state.routes[state.index]?.name;
  const activeIndex = isToolkitFeatureOnScreen
    ? 2 // ToolKit tab index
    : Math.max(0, TAB_ITEMS.findIndex((t) => t.name === currentRouteName));

  const indicatorAnim = useRef(new Animated.Value(activeIndex * tabWidth + (tabWidth - barWidth) / 2)).current;

  useEffect(() => {
    const targetX = activeIndex * tabWidth + (tabWidth - barWidth) / 2;
    Animated.spring(indicatorAnim, {
      toValue: targetX,
      damping: 24,
      stiffness: 340,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, tabWidth]);

  const handleTabPress = (tab: typeof TAB_ITEMS[0], index: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (tab.isToolkit) {
      setIsToolkitOpen(true);
      return;
    }

    if (isToolkitOpen) {
      setIsToolkitOpen(false);
    }

    // User explicitly pressed a different tab: unlock toolkit state
    setActiveToolkitFeature(null);

    const isCurrent = state.index === index && !isToolkitFeatureOnScreen;
    if (!isCurrent) {
      if (tab.name === 'More') {
        navigation.navigate('More', { screen: 'MoreHome' });
      } else {
        navigation.navigate(tab.name);
      }
    }
  };

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          height: tabBarHeight,
          paddingBottom: bottomInset + 4,
          backgroundColor: isDark ? '#141720' : '#E7ECF7',
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.16)' : '#FFFFFF',
          borderLeftColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.85)',
          borderRightColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.85)',
          shadowColor: isDark ? '#000000' : '#8D9FB8',
        },
      ]}
    >
      {/* Neumorphic Top Highlight Track */}
      <View
        style={[
          styles.neuTopTrack,
          {
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.8)',
          },
        ]}
      />

      {/* Neumorphic Inner Bevel Shelf */}
      <View
        style={[
          styles.neuInnerBevel,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(180, 195, 218, 0.35)',
          },
        ]}
      />

      {/* Dynamic Animated Segmented Indicator Bar with Neumorphic Glow */}
      <Animated.View
        style={[
          styles.dynamicSegmentBar,
          {
            width: barWidth,
            backgroundColor: isDark ? colors.accent.primary : '#2196E8',
            transform: [{ translateX: indicatorAnim }],
          },
        ]}
      />

      {/* 5 Tab Segments */}
      {TAB_ITEMS.map((tab, idx) => {
        const isFocused = idx === activeIndex;
        const IconComponent = tab.Icon;
        const activeColor = isDark ? colors.accent.primary : '#2196E8';
        const inactiveColor = isDark ? colors.textMuted : '#546A85';

        return (
          <TouchableOpacity
            key={tab.name}
            activeOpacity={0.7}
            onPress={() => handleTabPress(tab, idx)}
            style={styles.tabSegment}
          >
            <View style={styles.tabIconWrap}>
              <IconComponent
                size={isFocused ? 23 : 22}
                color={isFocused ? activeColor : inactiveColor}
                strokeWidth={isFocused ? 2.5 : 2}
                style={isFocused ? styles.neuActiveIconGlow : undefined}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isFocused ? activeColor : inactiveColor,
                  fontWeight: isFocused ? '800' : '600',
                },
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const AppTabsNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <DynamicSegmentedTabBar {...props} />}
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        lazy: false,
        freezeOnBlur: false,
        animation: 'none',
      }}
    >
      {/* 1. Home */}
      <Tab.Screen name="Home" component={DashboardScreen} />

      {/* 2. Calendar */}
      <Tab.Screen name="CalendarTab" component={CalendarNavigator} />

      {/* 3. ToolKit */}
      <Tab.Screen name="Studio" component={CreateNavigator} />

      {/* 4. Asset Library */}
      <Tab.Screen name="AssetLibraryTab" component={AssetLibraryScreen} />

      {/* 5. Account */}
      <Tab.Screen name="More" component={MoreNavigator} />

      {/* Hidden Strategy route for backward compatibility with in-app links */}
      <Tab.Screen
        name="Strategy"
        component={StrategyNavigator}
        options={{
          tabBarItemStyle: { display: 'none' },
          tabBarButton: () => null,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    elevation: 20,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.42,
    shadowRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  neuTopTrack: {
    position: 'absolute',
    top: 0,
    left: 18,
    right: 18,
    height: 3,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  neuInnerBevel: {
    position: 'absolute',
    top: 3,
    left: 0,
    right: 0,
    height: 1,
  },
  dynamicSegmentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 3.5,
    borderRadius: 2,
    shadowColor: '#2196E8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  tabSegment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  tabIconWrap: {
    width: 44,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabLabel: {
    fontSize: 11.5,
    marginTop: 2,
    letterSpacing: -0.1,
  },
  neuActiveIconGlow: {
    shadowColor: '#2196E8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 5,
  },
});
