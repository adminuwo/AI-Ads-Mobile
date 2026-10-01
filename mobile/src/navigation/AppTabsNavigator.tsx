import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  LayoutGrid,
  PenTool,
  Target,
  Calendar as CalendarIcon,
  Menu,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import {
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

const Tab = createBottomTabNavigator<AppTabsParamList>();
const StrategyStack = createNativeStackNavigator<StrategyStackParamList>();
const CalendarStack = createNativeStackNavigator<CalendarStackParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();

// Nested Strategy Stack
const StrategyNavigator = () => (
  <StrategyStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <StrategyStack.Screen name="StrategyHome" component={StrategyScreen} />
    <StrategyStack.Screen name="Seo" component={SeoScreen} />
    <StrategyStack.Screen name="Campaigns" component={CampaignsScreen} />
  </StrategyStack.Navigator>
);

// Nested Calendar Stack
const CalendarNavigator = () => (
  <CalendarStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <CalendarStack.Screen name="CalendarHome" component={CalendarScreen} />
    <CalendarStack.Screen name="Approvals" component={ApprovalsDeskScreen} />
  </CalendarStack.Navigator>
);

// Nested More Stack
const MoreNavigator = () => (
  <MoreStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <MoreStack.Screen name="MoreHome" component={MoreMenuScreen} />
    <MoreStack.Screen name="BrandDna" component={BrandDnaScreen} />
    <MoreStack.Screen name="AssetLibrary" component={AssetLibraryScreen} />
    <MoreStack.Screen name="Analytics" component={AnalyticsScreen} />
    <MoreStack.Screen name="SettingsBilling" component={SettingsBillingScreen} />
  </MoreStack.Navigator>
);

export const AppTabsNavigator: React.FC = () => {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <LayoutGrid size={focused ? 22 : 20} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Studio"
        component={StudioHomeScreen}
        options={{
          tabBarLabel: 'Studio',
          tabBarIcon: ({ color, focused }) => (
            <PenTool size={focused ? 22 : 20} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Strategy"
        component={StrategyNavigator}
        options={{
          tabBarLabel: 'Strategy',
          tabBarIcon: ({ color, focused }) => (
            <Target size={focused ? 22 : 20} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="CalendarTab"
        component={CalendarNavigator}
        options={{
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ color, focused }) => (
            <CalendarIcon size={focused ? 22 : 20} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="More"
        component={MoreNavigator}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ color, focused }) => (
            <Menu size={focused ? 22 : 20} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
