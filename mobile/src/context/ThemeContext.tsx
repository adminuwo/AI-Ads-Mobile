import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ThemeMode,
  AccentColorKey,
  ThemeColors,
  getThemeColors,
} from '../config/theme';
import { STORAGE_KEYS } from '../config/constants';

interface ThemeContextType {
  mode: ThemeMode;
  accentKey: AccentColorKey;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (accent: AccentColorKey) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(
    systemColorScheme === 'dark' ? 'dark' : 'dark' // Default to dark for premium AI Ads aesthetic
  );
  const [accentKey, setAccentKeyState] = useState<AccentColorKey>('purple');

  useEffect(() => {
    // Restore saved theme preferences
    AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE).then((savedMode) => {
      if (savedMode === 'dark' || savedMode === 'light') {
        setModeState(savedMode);
      }
    });

    AsyncStorage.getItem(STORAGE_KEYS.ACCENT_COLOR).then((savedAccent) => {
      if (savedAccent && ['purple', 'indigo', 'blue', 'emerald', 'amber', 'rose'].includes(savedAccent)) {
        setAccentKeyState(savedAccent as AccentColorKey);
      }
    });
  }, []);

  const toggleTheme = () => {
    setModeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, next);
      return next;
    });
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, newMode);
  };

  const setAccentColor = (newAccent: AccentColorKey) => {
    setAccentKeyState(newAccent);
    AsyncStorage.setItem(STORAGE_KEYS.ACCENT_COLOR, newAccent);
  };

  const colors = getThemeColors(mode, accentKey);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        accentKey,
        colors,
        isDark: mode === 'dark',
        toggleTheme,
        setMode,
        setAccentColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
