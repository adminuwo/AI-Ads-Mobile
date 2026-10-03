export const STORAGE_KEYS = {
  TOKEN: 'aisa_token',
  USER: 'aisa_user',
  USER_EMAIL: 'aisa_user_email',
  USER_NAME: 'aisa_user_name',
  ACTIVE_WS_ID: 'aisa_active_ws_id',
  WORKSPACES: 'aisa_workspaces',
  THEME_MODE: 'aisa_theme_mode',
  ACCENT_COLOR: 'aisa_accent_color',
  TERMS_ACCEPTED: 'aisa_terms_accepted',
};

export const SOCIAL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: 'Instagram', color: '#E1306C' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'Linkedin', color: '#0A66C2' },
  { id: 'twitter', label: 'X / Twitter', icon: 'Twitter', color: '#000000' },
  { id: 'facebook', label: 'Facebook', icon: 'Facebook', color: '#1877F2' },
] as const;

export const VISUAL_ASPECT_RATIOS = [
  { id: '1:1', label: 'Square (1:1)', sub: 'Instagram Post' },
  { id: '9:16', label: 'Story / Reel (9:16)', sub: 'TikTok, Reels' },
  { id: '16:9', label: 'Landscape (16:9)', sub: 'YouTube, Web' },
  { id: '4:5', label: 'Portrait (4:5)', sub: 'Feed Ads' },
] as const;

export const VISUAL_STYLES = [
  'Photorealistic Commercial',
  'Glassmorphic Modern 3D',
  'Minimalist Luxury Editorial',
  'Cyberpunk Neon Glow',
  'High-Contrast Studio Ad',
  'Cinematic Ambient Lighting',
] as const;

export const DEFAULT_WORKSPACE = {
  id: 'ws_ziva',
  _id: 'ws_ziva',
  brandName: 'ZIVA',
  domainUrl: 'https://ziva.ai',
  logoUrl: '',
  brandColors: ['#7C3AED', '#3B82F6'],
  industryCategory: 'Fashion, Lifestyle & Creative Retail',
  missionStatement: 'Turn ideas into impactful brands with AI-driven visual storytelling.',
  tagline: 'Intelligent Style & Creative Velocity',
  brandVoiceTone: {
    formalityScore: 4,
    toneKeywords: ['Chic', 'Innovative', 'High-Converting', 'Visionary'],
  },
  contentPillars: ['Style Trends', 'Creative Campaigns', 'Product Drops', 'Audience Growth'],
  approvedClaims: ['AI-Powered Creative Strategy', 'Omnichannel Content Velocity'],
  restrictedClaims: ['100% Guaranteed Sales'],
  subscriptionTier: 'Agency Pro',
};

export const INITIAL_WORKSPACES = [
  DEFAULT_WORKSPACE,
  {
    id: 'ws_aiads',
    _id: 'ws_aiads',
    brandName: 'AI Ads™ Official',
    domainUrl: 'https://aiads.com',
    logoUrl: '',
    brandColors: ['#7B61FF', '#6366F1'],
    industryCategory: 'AI Marketing',
    missionStatement: 'Turn ideas into impactful brands with AI.',
    tagline: 'Supercharge Your Advertising',
    brandVoiceTone: {
      formalityScore: 4,
      toneKeywords: ['Innovative', 'Authoritative', 'High-Converting', 'Visionary'],
    },
    contentPillars: ['AI Innovations', 'Marketing Growth', 'Creative Velocity', 'Data Governance'],
    approvedClaims: ['10x Content Velocity', 'Multi-Model AI Orchestration', 'Immutable Brand DNA'],
    restrictedClaims: ['100% Guaranteed Sales', 'Zero Human Oversight'],
    subscriptionTier: 'Agency Pro',
  },
];

