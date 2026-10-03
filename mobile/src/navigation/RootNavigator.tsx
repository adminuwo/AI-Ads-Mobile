import React from 'react';
import { View, StyleSheet, ActivityIndicator, Image, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { RootStackParamList } from './types';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { AppTabsNavigator } from './AppTabsNavigator';
import { BrandSwitcherModal } from '../components/modals/BrandSwitcherModal';
import { ScraperModal } from '../components/modals/ScraperModal';
import { QuickPostModal } from '../components/modals/QuickPostModal';
import { AISAChatModal } from '../components/modals/AISAChatModal';
import { NotificationModal } from '../components/modals/NotificationModal';
import { ProfileMenuModal } from '../components/modals/ProfileMenuModal';
import { PanchTattvaRibbon } from '../components/common/PanchTattvaRibbon';
import { DualOrbitLogoAnimation } from '../components/common/DualOrbitLogoAnimation';
import { FONT_SIZES, LINE_HEIGHTS } from '../config/typography';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const {
    isNotificationOpen,
    setIsNotificationOpen,
    isProfileMenuOpen,
    setIsProfileMenuOpen,
    setUnreadCount,
  } = useWorkspace();


  // Splash loading state while restoring JWT session from SecureStore
  if (isLoading) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: colors.background }]}>
        <PanchTattvaRibbon height={3.5} />
        <View style={styles.splashContent}>
          <DualOrbitLogoAnimation
            size={180}
            logoSize={130}
            source={require('../../assets/ai_ads_camera_full_logo.png')}
          />

          <View style={styles.splashTitleRow}>
            <Text style={[styles.splashTitle, { color: colors.textPrimary }]}>
              AI Ads
            </Text>
            <Text style={[styles.splashTM, { color: colors.goldTM }]}>
              —TM
            </Text>
          </View>
          <Text style={[styles.splashSubtitle, { color: colors.textSecondary }]}>
            Enterprise Brand Intelligence
          </Text>

          <ActivityIndicator
            color={colors.accent.primary}
            size="large"
            style={styles.splashLoader}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={AppTabsNavigator} />
        )}
      </Stack.Navigator>

      {/* Global persistent modals mounted once */}
      {isAuthenticated && (
        <>
          <BrandSwitcherModal />
          <ScraperModal />
          <QuickPostModal />
          <AISAChatModal />
          <NotificationModal
            visible={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            onUnreadChange={setUnreadCount}
          />
          <ProfileMenuModal
            visible={isProfileMenuOpen}
            onClose={() => setIsProfileMenuOpen(false)}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
  },
  splashContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  splashLogo: {
    width: 90,
    height: 90,
    marginBottom: 16,
  },
  splashTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  splashTitle: {
    fontSize: FONT_SIZES.hero,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.hero,
    letterSpacing: -0.3,
  },
  splashTM: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
    marginLeft: 4,
    marginTop: -8,
  },
  splashSubtitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.body,
    marginTop: 4,
  },
  splashLoader: {
    marginTop: 28,
  },
});
