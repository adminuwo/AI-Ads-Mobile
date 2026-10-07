import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
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


export const AppTabsNavigator: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { setIsToolkitOpen } = useWorkspace();
  const insets = useSafeAreaInsets();

  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 8);
  const tabBarHeight = 64 + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: isDark ? colors.accent.primary : '#8B5CF6',
        tabBarInactiveTintColor: isDark ? colors.textMuted : '#64748B',
        tabBarBackground: () => (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: isDark ? colors.tabBarBackground : '#FFFFFF',
                borderTopColor: isDark ? colors.neu.borderLight : 'rgba(0,0,0,0.06)',
                borderTopWidth: 1,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
              },
            ]}
          />
        ),
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: tabBarHeight,
          paddingTop: 10,
          paddingBottom: bottomInset + 4,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 14,
          shadowColor: isDark ? '#000000' : '#A3B1C6',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.6 : 0.2,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11.5,
          fontWeight: '700',
          marginTop: 3,
        },
      }}
    >

      {/* 1. Home */}
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <House size={focused ? 26 : 24} color={color} strokeWidth={focused ? 2.4 : 2} />
          ),
        }}
      />

      {/* 2. Calendar */}
      <Tab.Screen
        name="CalendarTab"
        component={CalendarNavigator}
        options={{
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ color, focused }) => (
            <CalendarIcon size={focused ? 26 : 24} color={color} strokeWidth={focused ? 2.4 : 2} />
          ),
        }}
      />

      {/* 3. ToolKit */}
      <Tab.Screen
        name="Studio"
        component={CreateNavigator}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setIsToolkitOpen(true);
          },
        }}
        options={{
          tabBarLabel: 'ToolKit',
          tabBarIcon: ({ color, focused }) => (
            <Wrench size={focused ? 26 : 24} color={color} strokeWidth={focused ? 2.4 : 2} />
          ),
        }}
      />

      {/* 4. Asset Library */}
      <Tab.Screen
        name="AssetLibraryTab"
        component={AssetLibraryScreen}
        options={{
          tabBarLabel: 'Asset Library',
          tabBarIcon: ({ color, focused }) => (
            <FolderKanban size={focused ? 26 : 24} color={color} strokeWidth={focused ? 2.4 : 2} />
          ),
        }}
      />

      {/* 5. Account */}
      <Tab.Screen
        name="More"
        component={MoreNavigator}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <User size={focused ? 26 : 24} color={color} strokeWidth={focused ? 2.4 : 2} />
          ),
        }}
      />

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
