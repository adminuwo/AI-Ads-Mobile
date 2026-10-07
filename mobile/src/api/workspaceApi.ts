import { apiRequest } from './client';
import { Workspace } from '../types';

export const workspaceApi = {
  list: (userEmail?: string): Promise<{ success: boolean; workspaces: Workspace[] }> =>
    apiRequest('/workspace/list', {
      method: 'GET',
      params: userEmail ? { userEmail } : undefined,
    }),

  create: (data: Partial<Workspace>): Promise<{ success: boolean; workspace: Workspace }> =>
    apiRequest('/workspace/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Workspace>): Promise<{ success: boolean; workspace: Workspace }> =>
    apiRequest(`/workspace/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<{ success: boolean; message?: string }> =>
    apiRequest(`/workspace/${id}`, {
      method: 'DELETE',
    }),

  // Single Unified Form Scraper & DNA Preview (Master Brand DNA 10-Point Engine)
  unifiedDnaPreview: (
    payload: FormData | { domainUrl: string; brandName?: string; logoUrl?: string; [key: string]: any }
  ): Promise<{
    success: boolean;
    workspace?: any;
    brandProfile?: any;
    rawScrapedData?: any;
    error?: string;
  }> => {
    const isForm = typeof FormData !== 'undefined' && payload instanceof FormData;
    return apiRequest('/workspace/unified-dna-preview', {
      method: 'POST',
      body: isForm ? payload : JSON.stringify(payload),
      timeoutMs: 240000, // 240s (4 minutes) for deep multi-agent crawl & AI synthesis
    });
  },

  // Save & Lock Brand DNA Memory (Persists to MongoDB Canonical BrandProfile)
  saveDna: (
    data: any,
    userEmail?: string
  ): Promise<{
    success: boolean;
    workspace?: Workspace;
    brandProfile?: any;
    error?: string;
  }> =>
    apiRequest('/workspace/save-dna', {
      method: 'POST',
      headers: userEmail ? { 'x-user-email': userEmail } : undefined,
      body: JSON.stringify({ ...data, userEmail: userEmail || data?.userEmail || '' }),
      timeoutMs: 30000,
    }),

  // Brand Intelligence & Auto Scraper
  analyzeBrand: (payload: {
    websiteUrl?: string;
    brandName?: string;
    industry?: string;
    rawText?: string;
  }): Promise<{ success: boolean; profile?: any; workspace?: Workspace; error?: string }> =>
    apiRequest('/brand/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 60000, // 60s for multi-agent scraping & LLM extraction
    }),

  getBrandProfile: (workspaceId: string): Promise<{ success: boolean; profile: any }> =>
    apiRequest(`/brand/${workspaceId}`, {
      method: 'GET',
    }),

  updateBrandProfile: (workspaceId: string, profile: any): Promise<{ success: boolean }> =>
    apiRequest(`/brand/${workspaceId}`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),

  regenerateSection: (payload: {
    workspaceId: string;
    section: string;
    instructions?: string;
  }): Promise<{ success: boolean; content: any }> =>
    apiRequest('/brand/regenerate-section', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
