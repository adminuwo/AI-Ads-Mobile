/**
 * AI Ads Design System & Color Tokens
 * Mirrors the web platform's luxury dark/light mode and dynamic accent system.
 */

export type ThemeMode = 'dark' | 'light';
export type AccentColorKey = 'purple' | 'indigo' | 'blue' | 'emerald' | 'amber' | 'rose';

export interface AccentPalette {
  primary: string;
  secondary: string;
  light: string;
  glow: string;
  gradient: [string, string];
  tagBg: string;
  tagText: string;
}

export const ACCENT_PALETTES: Record<AccentColorKey, AccentPalette> = {
  purple: {
    primary: '#7B61FF',
    secondary: '#6B5AED',
    light: '#F3E8FF',
    glow: 'rgba(123, 97, 255, 0.35)',
    gradient: ['#6B5AED', '#7B61FF'],
    tagBg: 'rgba(123, 97, 255, 0.15)',
    tagText: '#A882FF',
  },
  indigo: {
    primary: '#6366F1',
    secondary: '#4F46E5',
    light: '#EEF2FF',
    glow: 'rgba(99, 102, 241, 0.35)',
    gradient: ['#4F46E5', '#6366F1'],
    tagBg: 'rgba(99, 102, 241, 0.15)',
    tagText: '#818CF8',
  },
  blue: {
    primary: '#0284C7',
    secondary: '#0369A1',
    light: '#E0F2FE',
    glow: 'rgba(2, 132, 199, 0.35)',
    gradient: ['#0369A1', '#0284C7'],
    tagBg: 'rgba(2, 132, 199, 0.15)',
    tagText: '#38BDF8',
  },
  emerald: {
    primary: '#10B981',
    secondary: '#059669',
    light: '#ECFDF5',
    glow: 'rgba(16, 185, 129, 0.35)',
    gradient: ['#059669', '#10B981'],
    tagBg: 'rgba(16, 185, 129, 0.15)',
    tagText: '#34D399',
  },
  amber: {
    primary: '#F59E0B',
    secondary: '#D97706',
    light: '#FFFBEB',
    glow: 'rgba(245, 158, 11, 0.35)',
    gradient: ['#D97706', '#F59E0B'],
    tagBg: 'rgba(245, 158, 11, 0.15)',
    tagText: '#FBBF24',
  },
  rose: {
    primary: '#F43F5E',
    secondary: '#E11D48',
    light: '#FFF1F2',
    glow: 'rgba(244, 63, 94, 0.35)',
    gradient: ['#E11D48', '#F43F5E'],
    tagBg: 'rgba(244, 63, 94, 0.15)',
    tagText: '#FB7185',
  },
};

// Panch Tattva (5-Elements) Signature Color Palette
export const PANCH_TATTVA_GRADIENT: [string, string, string, string, string] = [
  '#F59E0B', // Earth / Prithvi (Amber/Gold)
  '#06B6D4', // Water / Jal (Cyan/Water)
  '#EF4444', // Fire / Agni (Crimson/Fire)
  '#10B981', // Air / Vayu (Emerald/Air)
  '#8B5CF6', // Ether / Akash (Purple/Space)
];

export const getThemeColors = (mode: ThemeMode, accentKey: AccentColorKey = 'purple') => {
  const isDark = mode === 'dark';
  const accent = ACCENT_PALETTES[accentKey] || ACCENT_PALETTES.purple;

  // Neumorphic Surface & Shadow Tokens
  const neuBase = isDark ? '#151922' : '#E8EDF5';
  const neuCard = isDark ? '#181D28' : '#E8EDF5';
  const neuDarkShadow = isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(163, 177, 198, 0.7)';
  const neuLightShadow = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.95)';
  const neuBorderLight = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.85)';
  const neuBorderDark = isDark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(163, 177, 198, 0.4)';

  return {
    isDark,
    accent,
    // Backgrounds - Neumorphic Harmonized
    background: neuBase,
    cardBackground: neuCard,
    cardSecondary: isDark ? '#11151D' : '#DFE5EF',
    headerBackground: isDark ? 'rgba(21, 25, 34, 0.95)' : 'rgba(232, 237, 245, 0.95)',
    tabBarBackground: isDark ? 'rgba(24, 29, 40, 0.97)' : 'rgba(232, 237, 245, 0.98)',
    inputBackground: isDark ? '#10141C' : '#DFE5EF',

    // Neumorphic Soft UI Specific Tokens
    neu: {
      base: neuBase,
      card: neuCard,
      cardSecondary: isDark ? '#11151D' : '#DFE5EF',
      darkShadow: neuDarkShadow,
      lightShadow: neuLightShadow,
      borderLight: neuBorderLight,
      borderDark: neuBorderDark,
      surfaceGradient: (isDark ? ['#1B212D', '#151922'] : ['#EFF3FB', '#E2E8F2']) as [string, string],
      insetGradient: (isDark ? ['#0F121A', '#161A24'] : ['#DAE1EB', '#E9EEF6']) as [string, string],
      raisedElevation: isDark ? 6 : 4,
    },

    // Borders
    border: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(163, 177, 198, 0.3)',
    borderHover: isDark ? 'rgba(123, 97, 255, 0.45)' : 'rgba(123, 97, 255, 0.35)',
    borderSubtle: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(163, 177, 198, 0.15)',

    // Typography
    textPrimary: isDark ? '#FFFFFF' : '#1E293B',
    textSecondary: isDark ? '#94A3B8' : '#475569',
    textMuted: isDark ? '#64748B' : '#8592A6',
    textInverse: isDark ? '#1E293B' : '#FFFFFF',

    // Status Colors
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#0EA5E9',

    // Brand Highlights
    goldTM: '#F59E0B',
    brandGlow: accent.glow,
  };
};


export type ThemeColors = ReturnType<typeof getThemeColors>;

export * from './typography';
