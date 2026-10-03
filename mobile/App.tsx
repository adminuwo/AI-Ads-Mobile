import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { WorkspaceProvider } from './src/context/WorkspaceContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AnimatedSplashScreen } from './src/components/common/AnimatedSplashScreen';

const ThemedAppContent = () => {
  const { isDark, colors } = useTheme();
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  return (
    <View style={styles.rootContainer}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>

      {/* 5 to 10 Second Animated Splash Screen with AI Ads Logo */}
      {isSplashVisible && (
        <AnimatedSplashScreen
          durationMs={6000}
          onFinish={() => setIsSplashVisible(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <WorkspaceProvider>
            <ThemedAppContent />
          </WorkspaceProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
