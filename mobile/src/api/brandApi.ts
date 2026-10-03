import { apiRequest } from './client';

export interface BrandProfileData {
  workspaceId?: string;
  companyName?: string;
  brandName?: string;
  parentCompany?: string | null;
  website?: string;
  domainUrl?: string;
  logoUrl?: string;
  brandColors?: string[];
  industryCategory?: string | null;
  secondaryIndustries?: string[];
  businessType?: string | null;
  headquarters?: string | null;
  companyDescription?: string | null;
  tagline?: string | null;
  missionStatement?: string | null;
  vision?: string | null;
  targetAudience?: string[];
  coreProductsServices?: string[];
  contentPillars?: string[];
  brandValues?: string[];
  dosAndDonts?: {
    dos: string[];
    donts: string[];
  };
  doWords?: string[];
  dontWords?: string[];
  brandVoice?: any;
  brandVoiceTone?: any;
  contactInfo?: any;
  extractedClaims?: any[];
  approvedClaims?: any[];
  structuredIdentity?: any;
  aiConfidence?: number;
  analysisStatus?: string;
  [key: string]: any;
}

export interface AnalyzeBrandParams {
  workspaceId: string;
  websiteUrl: string;
  companyName?: string;
  manualDescription?: string;
}

export interface RegenerateSectionParams {
  workspaceId: string;
  section: string;
  customInstruction?: string;
}

export const brandApi = {
  /**
   * Get brand profile for a given workspace
   */
  getProfile: (workspaceId: string): Promise<{ success: boolean; profile: BrandProfileData | null; memoryMode?: boolean; fallback?: boolean }> =>
    apiRequest(`/brand/${workspaceId}`, {
      method: 'GET',
    }),

  /**
   * Update brand profile for a given workspace
   */
  updateProfile: (workspaceId: string, profile: Partial<BrandProfileData>): Promise<{ success: boolean; profile?: BrandProfileData }> =>
    apiRequest(`/brand/${workspaceId}`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),

  /**
   * Run Evidence-First Deep AI Analysis & Web Scraper
   */
  analyze: (params: AnalyzeBrandParams): Promise<{ success: boolean; profile: BrandProfileData; brandDna?: any; error?: string }> =>
    apiRequest('/brand/analyze', {
      method: 'POST',
      body: JSON.stringify(params),
      timeoutMs: 60000, // 60s timeout for deep web scraping and multi-agent synthesis
    }),

  /**
   * Regenerate a specific section using AI
   */
  regenerateSection: (params: RegenerateSectionParams): Promise<{ success: boolean; section: string; data: any; error?: string }> =>
    apiRequest('/brand/regenerate-section', {
      method: 'POST',
      body: JSON.stringify(params),
      timeoutMs: 30000,
    }),
};
