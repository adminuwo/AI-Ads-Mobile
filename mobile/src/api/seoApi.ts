import { apiRequest } from './client';

export interface ProvenanceInfo {
  provider?: string;
  evidenceType?: string;
  sourceUrl?: string;
  retrievedAt?: string;
}

export interface OnPageKeywordItem {
  term: string;
  source?: string;
  badge?: string;
  isCollectionLink?: boolean;
  tagSource?: string;
  evidenceSnippet?: string;
  pageUrl?: string;
  intent?: string;
  provenance?: ProvenanceInfo;
  isRealFetched?: boolean;
}

export interface RankingKeywordItem {
  term: string;
  rankingPosition?: string;
  searchIntent?: string;
  rankingUrl?: string;
  score?: number | string;
  isVerifiedSerp?: boolean;
  provenance?: ProvenanceInfo;
  isRealFetched?: boolean;
}

export interface CompetitorGapItem {
  term: string;
  competitor: string;
  competitorPosition?: string;
  userPosition?: string;
  gapType?: string;
  gapReason?: string;
  rankingUrl?: string;
  searchIntent?: string;
  isVerifiedGap?: boolean;
  provenance?: ProvenanceInfo;
  isRealFetched?: boolean;
  isAiGenerated?: boolean;
}

export interface OpportunityKeywordItem {
  term: string;
  difficulty?: string;
  whyOpportunity?: string;
  recommendedAction?: string;
  evidenceBasis?: string;
  intent?: string;
  searchVolume?: string;
}

export interface QuickWinItem {
  term: string;
  currentPosition?: string;
  bestCompetitorPosition?: string;
  existingRankingPage?: string;
  recommendedOptimization?: string;
}

export interface CompetitorItem {
  competitorDomain: string;
  isDiscoveredSearch?: boolean;
  whyCompetitor?: string;
  keywordOverlap?: string;
  rankingAdvantage?: string;
  verifiedUrl?: string;
}

export interface TopicClusterItem {
  primaryTopic: string;
  existingPage?: string;
  relatedKeywords?: string[];
  recommendedAction?: string;
}

export interface HeadingOutlineItem {
  h2: string;
  h3s?: string[];
}

export interface InternalLinkingItem {
  anchorText?: string;
  targetPage?: string;
  rationale?: string;
}

export interface SeoBrief {
  primaryKeyword: string;
  searchIntent?: string;
  suggestedTitles?: string[];
  metaDescription?: string;
  urlSlug?: string;
  schemaType?: string;
  headingOutline?: HeadingOutlineItem[];
  entityKeywords?: string[];
  faqSuggestions?: Array<{ question?: string; answer?: string; faq?: string }>;
  secondaryKeywords?: string[];
  internalLinkingSuggestions?: Array<string | InternalLinkingItem>;
  jsonLdSchema?: string;
  wordCount?: number;
}

export interface SeoArticle {
  title: string;
  status?: string;
  wordCount?: number;
  readingTimeMinutes?: number;
  content: string;
  faqSection?: Array<{ question: string; answer: string }>;
  socialSnippet?: string;
  model?: string;
}

export interface RepurposedOutputs {
  linkedInPost?: string;
  twitterThread?: string[];
  newsletterEmail?: string;
  carouselOutline?: Array<{ slide: number; title: string; subtitle: string }>;
}

export interface ClusterKeywordsResponse {
  success: boolean;
  websiteUrl?: string;
  brandName?: string;
  industry?: string;
  pipelineDurationMs?: number;
  onSiteKeywords?: OnPageKeywordItem[];
  rankingKeywords?: RankingKeywordItem[];
  competitors?: CompetitorItem[];
  competitorGaps?: CompetitorGapItem[];
  opportunityKeywords?: OpportunityKeywordItem[];
  quickWins?: QuickWinItem[];
  keywordClusters?: TopicClusterItem[];
  headings?: { h1: string[]; h2: string[]; h3: string[] };
  productTerms?: string[];
  agentsExecutionSummary?: any;
  dataIntegritySummary?: {
    realFetchedCount: number;
    aiGeneratedCount: number;
    verifiedSerpCount: number;
    verifiedOnPageCount: number;
    discoveredCompetitorsCount: number;
    aiSuggestedCompetitorsCount: number;
  };
  error?: string;
}

export const seoApi = {
  clusterKeywords: (payload: {
    websiteUrl?: string;
    domainUrl?: string;
    seedKeyword?: string;
    brandName?: string;
    industry?: string;
    contentPillars?: string[];
    existingBrandKeywords?: string[];
    competitorLandscape?: string[];
    positioningSummary?: string;
    targetAudience?: string;
    count?: number;
  }): Promise<ClusterKeywordsResponse> =>
    apiRequest('/seo/keywords/cluster', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 60000,
    }),

  generateBrief: (payload: {
    primaryKeyword: string;
    keyword?: string;
    intent?: string;
    targetAudience?: string;
    brandName?: string;
    industry?: string;
    contentPillars?: string[];
    brandVoice?: string;
    learnedWebsiteMemory?: any;
    workspaceId?: string;
  }): Promise<{ success: boolean; brief?: SeoBrief; error?: string }> =>
    apiRequest('/seo/brief/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 60000,
    }),

  generateArticle: (payload: {
    topic: string;
    brief?: SeoBrief;
    brandName?: string;
    industry?: string;
    brandVoice?: string;
  }): Promise<{
    success: boolean;
    title?: string;
    status?: string;
    wordCount?: number;
    readingTimeMinutes?: number;
    content?: string;
    faqSection?: Array<{ question: string; answer: string }>;
    socialSnippet?: string;
    error?: string;
  }> =>
    apiRequest('/seo/article/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 60000,
    }),

  repurposeContent: (payload: {
    title: string;
    content: string;
    brandName?: string;
  }): Promise<{
    success: boolean;
    outputs?: RepurposedOutputs;
    error?: string;
  }> =>
    apiRequest('/seo/repurpose', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 45000,
    }),

  regenerateKeyword: (payload: {
    brandName?: string;
    industry?: string;
    seedKeyword?: string;
    existingKeywords?: string[];
    targetAudience?: string;
  }): Promise<{ success: boolean; keyword?: any; error?: string }> =>
    apiRequest('/seo/keywords/regenerate', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 30000,
    }),
};
