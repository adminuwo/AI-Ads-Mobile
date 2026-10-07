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
  companyDescription?: string;
  currentStrategy?: any;
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
  phase?: string;
  title?: string;
  objective?: string;
  tactics?: string[];
  channels?: string[];
  budget?: string;
  kpis?: string[];
  timeframe?: string;
  day?: number;
  week?: number;
  platform?: string;
  pillar?: string;
  topic?: string;
  actionItem?: string;
  action?: string;
  status?: string;
  gtmStage?: string;
  geoTarget?: string;
  seoKeywords?: string;
}

export interface CustomStrategyPost {
  day: number;
  week: number;
  weekTag: string;
  weekName?: string;
  platform: string;
  format: string;
  title: string;
  visualDirective: string;
  hook: string;
  caption: string;
  cta: string;
  hashtags: string;
}

export interface CustomImageBrief {
  id: string;
  imageUrl?: string | null;
  fileName?: string;
  fileSize?: string;
  directive?: string;
  timestamp: string;
}

export interface CustomStrategy {
  id: string;
  imagePreviewUrl?: string | null;
  fileName?: string;
  directive: string;
  timestamp: string;
  engine?: string;
  posts: CustomStrategyPost[];
}

export interface ChannelMixItem {
  label: string;
  pct: number;
  icon: string;
}

export interface GtmStrategy {
  idealCustomerProfile?: string;
  launchPhases?: Array<{ phase: string; title: string; focus: string; duration: string }>;
  keyMilestones?: string[];
  beachheadSegment?: string;
}

export interface SeoStrategy {
  highIntentKeywords?: string[];
  longTailKeywords?: string[];
  searchIntentMix?: Array<{ intent: string; percentage: number; description: string }>;
  onPageDirectives?: string;
}

export interface GeoStrategy {
  priorityRegions?: string[];
  regionalHooks?: Array<{ region: string; hook: string }>;
  geoDistributionTactics?: string;
}

export interface StrategyData {
  businessGoal?: string;
  leadMagnet?: string;
  primaryCta?: string;
  postingFrequency?: string;
  budgetSuggestions?: string;
  bestPlatforms?: string[];
  contentPillars?: string[];
  campaignIdeas?: Array<{ title: string; desc?: string; description?: string }>;
  thirtyDayPlan?: StrategyCard[];
  funnel?: {
    awareness: string;
    nurturing: string;
    conversion: string;
  };
  audience?: string[];
  channelMix?: ChannelMixItem[];
  gtmStrategy?: GtmStrategy;
  seoStrategy?: SeoStrategy;
  geoStrategy?: GeoStrategy;
  customImageBriefs?: CustomImageBrief[];
  customStrategy?: CustomStrategy;
  activeStrategyType?: 'campaign' | 'custom' | 'aiBrand';
  campaignName?: string;
  campaignId?: string;
  posts?: CustomStrategyPost[];
}

export interface MarketingStrategy {
  workspaceId: string;
  brandName: string;
  roadmapTitle?: string;
  overview?: string;
  cards?: StrategyCard[];
  phases?: string[];
  generatedAt?: string;
  data?: StrategyData;
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

export interface Campaign {
  _id?: string;
  id?: string;
  workspaceId: string;
  campaignName: string;
  campaignGoal: string;
  campaignMonth?: string;
  startDate: string;
  endDate: string;
  postingFrequency: string;
  platforms: string[];
  budget?: number;
  currency?: string;
  targetAudience?: string;
  status: 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Archived';
  aiGeneratedStrategy?: any;
  totalPosts?: number;
  generatedPosts?: number;
  approvedPosts?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignPost {
  _id?: string;
  id?: string;
  campaignId: string;
  workspaceId: string;
  date: string;
  day: string;
  platform: string;
  contentType: string;
  campaignStage: string;
  postObjective: string;
  prompt?: string;
  postType?: string;
  carouselImages?: number;
  postFor?: string;
  imagePrompt?: string;
  captionPrompt?: string;
  caption?: string;
  hashtags?: string[];
  cta?: string;
  generatedImage?: string | null;
  generatedImages?: string[];
  status: 'Draft' | 'Generated' | 'Approved' | 'Scheduled' | 'Published' | 'Failed';
  aiScore?: number;
  expectedReach?: number;
  expectedEngagement?: number;
  bestPostingTime?: string;
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected';
  notes?: string;
  scheduledAt?: string;
  publishedAt?: string;
  imageUrl?: string;
}


export type {
  ProvenanceInfo,
  OnPageKeywordItem,
  RankingKeywordItem,
  CompetitorGapItem,
  OpportunityKeywordItem,
  QuickWinItem,
  CompetitorItem,
  TopicClusterItem,
  HeadingOutlineItem,
  InternalLinkingItem,
  SeoBrief,
  SeoArticle,
  RepurposedOutputs,
  ClusterKeywordsResponse,
} from '../api/seoApi';

