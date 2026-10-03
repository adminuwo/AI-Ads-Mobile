import { apiRequest } from './client';
import { SocialPostDraft, BlogDraft, EmailDraft, AdCopyDraft } from '../types';

export const contentApi = {
  generateSocialPost: (payload: {
    topic: string;
    platform: string;
    postType?: string;
    brandName?: string;
    industry?: string;
    tone?: string;
    brandVoiceTone?: any;
    workspaceId?: string;
    approvedClaims?: string[];
    restrictedClaims?: string[];
  }): Promise<{ success: boolean; data?: any; result?: SocialPostDraft; post?: any; platform?: string; topic?: string; error?: string }> =>
    apiRequest('/content/social/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 45000,
    }),

  generateBlogDraft: (payload: {
    topic: string;
    keywords?: string;
    brandName?: string;
    industry?: string;
    targetAudience?: any;
    tone?: string;
  }): Promise<{ success: boolean; draft?: BlogDraft; article?: any; error?: string }> =>
    apiRequest('/content/blog/draft', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 60000,
    }),

  generateEmailCopy: (payload: {
    purpose: string;
    recipient: string;
    context?: string;
    brandName?: string;
    tone?: string;
    cta?: string;
  }): Promise<{ success: boolean; email?: EmailDraft; error?: string }> =>
    apiRequest('/content/email/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 30000,
    }),

  generateAdCopy: (payload: {
    productName: string;
    platform: string;
    targetAudience?: string;
    brandName?: string;
    keyBenefits?: string[];
  }): Promise<{ success: boolean; adCopy?: AdCopyDraft; error?: string }> =>
    apiRequest('/content/ad-copy/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 30000,
    }),

  factCheck: (payload: {
    content: string;
    approvedClaims?: string[];
    restrictedClaims?: string[];
  }): Promise<{ success: boolean; result: { passed: boolean; score: number; flaggedItems: string[] } }> =>
    apiRequest('/content/fact-check', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
