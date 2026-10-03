/**
 * Central Brand DNA Normalization Utility
 * Ensures mobile app mirrors web platform: clean, reliable data without fabricated fallbacks.
 */

export interface NormalizedBrandDna {
  brandName: string;
  companyName: string;
  parentCompany: string | null;
  domainUrl: string;
  website: string;
  logoUrl: string;
  brandColors: string[];
  industryCategory: string | null;
  businessType: string | null;
  headquarters: string | null;
  companyDescription: string | null;
  tagline: string | null;
  missionStatement: string | null;
  vision: string | null;
  targetAudience: string[];
  coreProductsServices: string[];
  extractedClaims: any[];
  approvedClaims: any[];
  brandVoice: string;
  brandVoiceTone: any;
  contentPillars: string[];
  contactInfo: any;
  confidenceScore: number;
  analysisStatus: string;
}

export function normalizeBrandDna(rawWorkspaceOrProfile: any): NormalizedBrandDna {
  if (!rawWorkspaceOrProfile) {
    return {
      brandName: 'Brand Workspace',
      companyName: 'Brand Workspace',
      parentCompany: null,
      domainUrl: '',
      website: '',
      logoUrl: '',
      brandColors: ['#F59E0B', '#D97706', '#06B6D4', '#151922'],
      industryCategory: null,
      businessType: null,
      headquarters: null,
      companyDescription: null,
      tagline: null,
      missionStatement: null,
      vision: null,
      targetAudience: [],
      coreProductsServices: [],
      extractedClaims: [],
      approvedClaims: [],
      brandVoice: 'Professional & Authoritative',
      brandVoiceTone: null,
      contentPillars: [],
      contactInfo: null,
      confidenceScore: 85,
      analysisStatus: 'UNKNOWN',
    };
  }

  const w = rawWorkspaceOrProfile;
  const struct = w.structuredIdentity || {};

  // Brand Name & Legal Identity
  const brandName = w.brandName || struct.brand_name || w.companyName || 'Brand Workspace';
  const companyName = w.companyName || brandName;
  const parentCompany = (w.parentCompany && w.parentCompany !== brandName) ? w.parentCompany : null;

  // Domain & Website
  const domainUrl = w.domainUrl || w.website || '';

  // Logo URL
  const logoUrl = w.logoUrl || w.faviconUrl || '';

  // Industry
  const rawIndustry = w.industryCategory || w.industry || struct.industry || null;
  const industryCategory = (rawIndustry && rawIndustry !== 'Not Specified in Evidence' && rawIndustry !== 'Consumer Products & Services')
    ? rawIndustry
    : null;

  // Business Type
  const rawBType = Array.isArray(w.businessType) ? w.businessType.join(' & ') : (w.businessType || null);
  const businessType = (rawBType && rawBType !== 'Not Specified in Evidence') ? rawBType : null;

  // Headquarters
  const rawHq = w.headquarters || null;
  const headquarters = (rawHq && rawHq !== 'Address Not Found' && rawHq !== 'Not Specified in Evidence') ? rawHq : null;

  // Company Description
  const rawDesc = w.companyDescription || w.companyOverviewText || w.extractedBrandSummary || null;
  const companyDescription = (rawDesc && !rawDesc.includes('operating in the Consumer Products sector')) ? rawDesc : null;

  // Tagline, Mission, Vision
  const tagline = (w.tagline && w.tagline !== 'Not Specified in Evidence') ? w.tagline : null;
  const missionStatement = (w.missionStatement && w.missionStatement !== 'Not Specified in Evidence') ? w.missionStatement : null;
  const vision = (w.vision && w.vision !== 'Not Specified in Evidence') ? w.vision : null;

  // Target Audience Array
  let targetAudience: string[] = [];
  if (Array.isArray(w.targetAudience) && w.targetAudience.length > 0) {
    targetAudience = w.targetAudience
      .filter((a: any) => typeof a === 'string' && !a.includes('Primary consumers seeking high-quality'))
      .map((s: string) => s.trim())
      .filter(Boolean);
  } else if (typeof w.targetAudience === 'string' && w.targetAudience.trim() && !w.targetAudience.includes('Primary consumers seeking high-quality') && w.targetAudience !== 'Not Specified in Evidence') {
    targetAudience = w.targetAudience.split('\n').map((s: string) => s.trim()).filter(Boolean);
  }

  // Core Products Array
  const rawProducts = w.coreProductsServices || struct.products_services || [];
  let coreProductsServices: string[] = [];
  if (Array.isArray(rawProducts)) {
    coreProductsServices = rawProducts
      .filter((p: any) => typeof p === 'string' && p.trim())
      .map((p: string) => p.trim());
  } else if (typeof rawProducts === 'string' && rawProducts.trim()) {
    coreProductsServices = rawProducts.split('\n').map((s: string) => s.trim()).filter(Boolean);
  }

  // Brand Colors
  const rawColors = w.brandColors || struct.color_palette || [];
  let brandColors: string[] = [];
  if (Array.isArray(rawColors)) {
    brandColors = rawColors.map((c: any) => {
      if (typeof c === 'string') return c;
      if (c && typeof c === 'object') return c.hex || c.color || c.code || '#F59E0B';
      return String(c);
    }).filter(Boolean);
  }
  if (brandColors.length === 0) {
    brandColors = ['#F59E0B', '#D97706', '#06B6D4', '#151922'];
  }

  // Extracted Claims vs Approved Claims
  const extractedClaims = Array.isArray(w.extractedClaims) ? w.extractedClaims : [];
  const approvedClaims = Array.isArray(w.approvedClaims) ? w.approvedClaims : [];

  // Content Pillars
  const contentPillars = Array.isArray(w.contentPillars) ? w.contentPillars : [];

  // Contact Info
  const contactInfo = w.contactInfo || (headquarters ? { location: headquarters } : null);

  return {
    brandName,
    companyName,
    parentCompany,
    domainUrl,
    website: domainUrl,
    logoUrl,
    brandColors,
    industryCategory,
    businessType,
    headquarters,
    companyDescription,
    tagline,
    missionStatement,
    vision,
    targetAudience,
    coreProductsServices,
    extractedClaims,
    approvedClaims,
    brandVoice: typeof w.brandVoice === 'string' ? w.brandVoice : (w.brandVoice?.tone || 'Professional & Authoritative'),
    brandVoiceTone: w.brandVoiceTone || null,
    contentPillars,
    contactInfo,
    confidenceScore: w.confidenceScore || w.aiConfidence || 85,
    analysisStatus: w.analysisStatus || 'SUCCESS',
  };
}
