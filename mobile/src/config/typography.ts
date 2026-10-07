import { StyleSheet, TextStyle } from 'react-native';

/**
 * AI ADS Unified Typography System
 * 
 * Standard Typography Scale:
 * - 24px — Main screen / hero headings, Bold (700)
 * - 18px — Section headings, Bold/Semibold (600–700)
 * - 14px — Body text, descriptions and supporting content, Regular (400)
 * - 12px — Labels, captions, navigation text and secondary information, Medium/Semibold (500–600)
 */

export const FONT_SIZES = {
  hero: 24,       // Main screen / hero headings
  heading: 18,    // Section headings
  body: 14,       // Body text, descriptions, supporting content, inputs, buttons
  caption: 12,    // Labels, captions, navigation text, secondary information
} as const;

/**
 * Controlled Typography Sizing for Compact Screens (<375px):
 * Only Hero (24→22px) and Heading (18→17px) make a small controlled adjustment.
 * Body remains strictly 14px and Caption remains strictly 12px.
 * Never allow text to shrink below ~85% of its base size.
 */
export const COMPACT_FONT_SIZES = {
  hero: 22,       // Hero adjusted from 24 -> 22px
  heading: 17,    // Heading adjusted from 18 -> 17px
  body: 14,       // Body strictly preserved at 14px
  caption: 12,    // Caption strictly preserved at 12px
} as const;

export const COMPACT_LINE_HEIGHTS = {
  hero: 28,
  heading: 22,
  body: 20,
  caption: 16,
} as const;

/**
 * Universal Floor: No text should ever shrink below 85% of its base token
 */
export const MIN_FONT_SCALE = 0.85;

export const getResponsiveFontSize = (
  tier: keyof typeof FONT_SIZES,
  isCompact: boolean = false
): number => {
  return isCompact ? COMPACT_FONT_SIZES[tier] : FONT_SIZES[tier];
};

export const getResponsiveLineHeight = (
  tier: keyof typeof LINE_HEIGHTS,
  isCompact: boolean = false
): number => {
  return isCompact ? COMPACT_LINE_HEIGHTS[tier] : LINE_HEIGHTS[tier];
};

export const FONT_WEIGHTS = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
} as const;

export const LINE_HEIGHTS = {
  hero: 30,
  heading: 24,
  body: 20,
  caption: 16,
} as const;

export const typography = StyleSheet.create({
  // ── 24px: Main screen / hero headings, Bold (700) ──
  hero: {
    fontSize: FONT_SIZES.hero,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.hero,
    letterSpacing: -0.3,
  },
  heroBold: {
    fontSize: FONT_SIZES.hero,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.hero,
    letterSpacing: -0.3,
  },
  // Controlled compact hero (24→22px)
  heroCompact: {
    fontSize: COMPACT_FONT_SIZES.hero,
    fontWeight: '700',
    lineHeight: COMPACT_LINE_HEIGHTS.hero,
    letterSpacing: -0.3,
  },

  // ── 18px: Section headings, Bold/Semibold (600–700) ──
  sectionHeading: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
    letterSpacing: -0.2,
  },
  sectionHeadingSemibold: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.heading,
    letterSpacing: -0.2,
  },
  // Controlled compact heading (18→17px)
  sectionHeadingCompact: {
    fontSize: COMPACT_FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: COMPACT_LINE_HEIGHTS.heading,
    letterSpacing: -0.2,
  },
  headerTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
    letterSpacing: -0.2,
  },

  // ── 14px: Body text, descriptions, inputs, buttons, Regular (400) ──
  body: {
    fontSize: FONT_SIZES.body,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.body,
  },
  bodyMedium: {
    fontSize: FONT_SIZES.body,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.body,
  },
  bodySemibold: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.body,
  },
  bodyBold: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  buttonText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.body,
  },
  inputText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.body,
  },

  // ── 12px: Labels, captions, navigation text and secondary information, Medium/Semibold (500–600) ──
  caption: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
  },
  captionRegular: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.caption,
  },
  label: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  labelMedium: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
  },
  navText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  badgeText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
});
