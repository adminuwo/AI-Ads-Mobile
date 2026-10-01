import { apiRequest } from './client';
import { SeoAuditData } from '../types';

export const seoApi = {
  clusterKeywords: (payload: {
    seedKeyword: string;
    websiteUrl?: string;
    brandName?: string;
    industry?: string;
    count?: number;
  }): Promise<{
    success: boolean;
    keywordClusters?: any[];
    rankingKeywords?: any[];
    opportunityKeywords?: any[];
    quickWins?: any[];
    competitors?: string[];
    error?: string;
  }> =>
    apiRequest('/seo/keywords/cluster', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 45000,
    }),

  generateBrief: (payload: {
    targetKeyword: string;
    brandName?: string;
    intent?: string;
    secondaryKeywords?: string[];
  }): Promise<{ success: boolean; brief?: any; error?: string }> =>
    apiRequest('/seo/brief/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 45000,
    }),

  regenerateKeyword: (payload: {
    seedKeyword: string;
    keywordToReplace: string;
  }): Promise<{ success: boolean; replacement?: any }> =>
    apiRequest('/seo/keywords/regenerate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
