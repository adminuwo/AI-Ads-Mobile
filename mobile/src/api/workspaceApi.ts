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

  // Single Unified Form Scraper & DNA Preview
  unifiedDnaPreview: (formData: FormData): Promise<{
    success: boolean;
    workspace?: any;
    brandProfile?: any;
    rawScrapedData?: any;
    error?: string;
  }> =>
    apiRequest('/workspace/unified-dna-preview', {
      method: 'POST',
      body: formData,
      timeoutMs: 60000,
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
