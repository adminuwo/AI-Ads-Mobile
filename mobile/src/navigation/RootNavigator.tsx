import React from 'react';
import { View, StyleSheet, ActivityIndicator, Image, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from './types';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { AppTabsNavigator } from './AppTabsNavigator';
import { BrandSwitcherModal } from '../components/modals/BrandSwitcherModal';
import { ScraperModal } from '../components/modals/ScraperModal';
import { QuickPostModal } from '../components/modals/QuickPostModal';
import { AISAChatModal } from '../components/modals/AISAChatModal';
import { PanchTattvaRibbon } from '../components/common/PanchTattvaRibbon';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors, isDark } = useTheme();

  // Splash loading state while restoring JWT session from SecureStore
  if (isLoading) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: colors.background }]}>
        <PanchTattvaRibbon height={3.5} />
        <View style={styles.splashContent}>
          <Image
            source={require('../../assets/logo_icon_only.png')}
            style={styles.splashLogo}
            resizeMode="contain"
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
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  splashTM: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4,
    marginTop: -8,
  },
  splashSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  splashLoader: {
    marginTop: 28,
  },
});
