export interface User {
  id: string;
  _id?: string;
  email: string;
  name: string;
  avatar?: string;
  accentColor?: string;
  appearance?: 'light' | 'dark' | 'system';
  role?: string;
  credits?: number;
  plan?: string;
}

export interface BrandVoiceTone {
  formalityScore: number;
  toneKeywords: string[];
}

export interface Workspace {
  id: string;
  _id?: string;
  brandName: string;
  domainUrl?: string;
  logoUrl?: string;
  faviconUrl?: string;
  brandColors?: string[];
  industryCategory?: string;
  missionStatement?: string;
  tagline?: string;
  brandVoiceTone?: BrandVoiceTone;
  voiceGuidelines?: {
    formalityScore?: number;
    toneKeywords?: string[];
  };
  contentPillars?: string[];
  targetAudience?: Array<{
    segment?: string;
    description?: string;
  }>;
  competitorLandscape?: string[];
  approvedClaims?: string[];
  restrictedClaims?: string[];
  subscriptionTier?: string;
  userEmail?: string;
  profile?: {
    website?: string;
    logoUrl?: string;
  };
}

export interface SocialPostDraft {
  platform: string;
  postType: string;
  hook: string;
  shortCaption: string;
  longCaption: string;
  cta: string;
  hashtags: string[];
  variations?: string[];
  recommendedVisualPrompt?: string;
  imageUrl?: string;
}

export interface BlogDraft {
  title: string;
  content: string;
  metaDescription?: string;
  slug?: string;
  readingTimeMinutes?: number;
}

export interface AdCopyDraft {
  platform: string;
  primaryText: string;
  headline: string;
  description: string;
  callToAction: string;
}

export interface EmailDraft {
  subject: string;
  previewText: string;
  body: string;
  ctaText: string;
  ctaUrl?: string;
}

export interface GeneratedVisual {
  id: string;
  imageUrl: string;
  prompt: string;
  aspectRatio: string;
  style: string;
  createdAt: string;
}

export interface StrategyCard {
  id: string;
  phase: string;
  title: string;
  objective: string;
  tactics: string[];
  channels: string[];
  budget: string;
  kpis: string[];
  timeframe: string;
}

export interface MarketingStrategy {
  workspaceId: string;
  brandName: string;
  roadmapTitle: string;
  overview: string;
  cards: StrategyCard[];
  phases: string[];
  generatedAt: string;
}

export interface KeywordCluster {
  keyword: string;
  intent: string;
  volume: string;
  difficulty: string;
  cpc?: string;
  badge?: string;
  rankingPosition?: string;
}

export interface SeoAuditData {
  seedKeyword: string;
  websiteUrl: string;
  keywordClusters: KeywordCluster[];
  rankingKeywords?: KeywordCluster[];
  opportunityKeywords?: KeywordCluster[];
  quickWins?: KeywordCluster[];
  competitors?: string[];
}

export interface CalendarEntry {
  id: string;
  _id?: string;
  title: string;
  date: string;
  platform: string;
  status: 'DRAFT' | 'SCHEDULED' | 'APPROVED' | 'PUBLISHED';
  owner?: string;
  content?: string;
  imageUrl?: string;
}

export interface ApprovalQueueItem {
  id: string;
  _id?: string;
  title: string;
  platform: string;
  author: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EDIT_REQUESTED';
  scheduledDate: string;
  content?: string;
  imageUrl?: string;
  factCheck?: {
    passed: boolean;
    score: number;
    status: string;
  };
}

export interface ChatMessage {
  id: string | number;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export interface AnalyticsSummary {
  brands: { total: number };
  posts: { total: number; verifiedFactChecked?: number };
  campaigns: { total: number; active: number };
  contentVelocity?: number;
  creditsBalance?: number;
}
