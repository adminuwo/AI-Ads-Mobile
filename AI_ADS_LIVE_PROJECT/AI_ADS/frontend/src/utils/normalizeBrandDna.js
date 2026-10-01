/**
 * Central Brand DNA Normalization & Provenance Utility
 * Ensures frontend never fabricates fake corporate fallbacks when evidence is missing.
 */

export function normalizeBrandDna(rawWorkspaceOrProfile) {
  if (!rawWorkspaceOrProfile) {
    return {
      brandName: 'Brand Workspace',
      companyName: 'Brand Workspace',
      parentCompany: null,
      parentCompanyProvenance: { value: null, status: 'UNKNOWN', sourceType: 'UNKNOWN', evidence: 'No parent company evidence' },
      domainUrl: '',
      logoUrl: '',
      brandColors: [],
      brandColorsProvenance: { value: [], status: 'UNKNOWN', sourceType: 'UNKNOWN' },
      industryCategory: null,
      industryProvenance: { value: null, status: 'UNKNOWN', sourceType: 'UNKNOWN', evidence: 'No industry evidence found' },
      businessType: null,
      businessTypeProvenance: { value: null, status: 'UNKNOWN', sourceType: 'UNKNOWN', evidence: 'No business type evidence found' },
      headquarters: null,
      headquartersProvenance: { value: null, status: 'UNKNOWN', sourceType: 'UNKNOWN', evidence: 'No headquarters address found' },
      companyDescription: null,
      companyDescriptionProvenance: { value: null, status: 'UNKNOWN', sourceType: 'UNKNOWN', evidence: 'No company description evidence' },
      tagline: null,
      taglineProvenance: { value: null, status: 'UNKNOWN', sourceType: 'UNKNOWN', evidence: 'No official tagline found' },
      missionStatement: null,
      missionStatementProvenance: { value: null, status: 'UNKNOWN', sourceType: 'UNKNOWN', evidence: 'No mission statement evidence' },
      vision: null,
      visionProvenance: { value: null, status: 'UNKNOWN', sourceType: 'UNKNOWN', evidence: 'No vision statement evidence' },
      targetAudience: [],
      targetAudienceProvenance: { value: [], status: 'UNKNOWN', sourceType: 'UNKNOWN', evidence: 'No target audience signals' },
      coreProductsServices: [],
      coreProductsServicesProvenance: { value: [], status: 'UNKNOWN', sourceType: 'UNKNOWN', evidence: 'No core product signals' },
      extractedClaims: [],
      approvedClaims: [],
      socialMediaPresence: [],
      contactInfo: { email: null, phone: null, location: null },
      fieldSources: {},
      analysisStatus: 'UNKNOWN',
      isInsufficientEvidence: true
    };
  }

  const w = rawWorkspaceOrProfile;
  const struct = w.structuredIdentity || {};

  // Brand Name & Legal Identity
  const brandName = w.brandName || struct.brand_name || w.companyName || 'Brand Workspace';
  const companyName = w.companyName || brandName;
  const parentCompany = (w.parentCompany && w.parentCompany !== brandName) ? w.parentCompany : (w.parentCompanyProvenance?.value && w.parentCompanyProvenance.value !== brandName ? w.parentCompanyProvenance.value : null);

  // Provenance Object Helper
  const getProv = (fieldVal, provObj, sourceKey, defaultEv = 'No evidence found') => {
    if (provObj && typeof provObj === 'object') {
      const src = provObj.sourceType || w.fieldSources?.[sourceKey] || 'UNKNOWN';
      const stat = provObj.status || (src === 'WEBSITE_DOM' || src === 'WEBSITE_SCHEMA' || src === 'OFFICIAL_WEBSITE' || src === 'OFFICIAL_WEBSITE_SCHEMA' || src === 'OFFICIAL_LOGO' || src === 'REGISTRY' ? 'VERIFIED' : (src === 'AI_INFERENCE' ? 'INFERRED' : 'UNKNOWN'));
      return {
        value: provObj.value !== undefined ? provObj.value : fieldVal,
        status: stat,
        sourceType: src,
        sourceUrl: provObj.sourceUrl || w.domainUrl || '',
        evidence: provObj.evidence || defaultEv,
        confidence: provObj.confidence || (stat === 'VERIFIED' ? 0.95 : (stat === 'INFERRED' ? 0.75 : 0))
      };
    }

    const src = w.fieldSources?.[sourceKey] || (fieldVal ? 'INFERRED' : 'UNKNOWN');
    const stat = (src === 'WEBSITE_DOM' || src === 'WEBSITE_SCHEMA' || src === 'OFFICIAL_WEBSITE' || src === 'OFFICIAL_WEBSITE_SCHEMA' || src === 'OFFICIAL_LOGO' || src === 'REGISTRY') ? 'VERIFIED' : (fieldVal ? 'INFERRED' : 'UNKNOWN');
    return {
      value: fieldVal || null,
      status: stat,
      sourceType: fieldVal ? src : 'UNKNOWN',
      sourceUrl: w.domainUrl || '',
      evidence: fieldVal ? `Extracted ${sourceKey} evidence` : defaultEv,
      confidence: stat === 'VERIFIED' ? 0.90 : (fieldVal ? 0.75 : 0)
    };
  };

  // Industry
  const rawIndustry = w.industryCategory || w.industry || struct.industry || null;
  const industryCategory = (rawIndustry && rawIndustry !== 'Not Specified in Evidence' && rawIndustry !== 'Consumer Products & Services') ? rawIndustry : null;
  const industryProvenance = getProv(industryCategory, w.industryProvenance, 'industryCategory', 'No industry evidence found');

  // Business Type
  const rawBType = Array.isArray(w.businessType) ? w.businessType.join(' & ') : (w.businessType || null);
  const businessType = (rawBType && rawBType !== 'Not Specified in Evidence') ? rawBType : null;
  const businessTypeProvenance = getProv(businessType, w.businessTypeProvenance, 'businessType', 'No business type evidence found');

  // Headquarters
  const rawHq = w.headquarters || null;
  const headquarters = (rawHq && rawHq !== 'Address Not Found' && rawHq !== 'Not Specified in Evidence') ? rawHq : null;
  const headquartersProvenance = getProv(headquarters, w.headquartersProvenance, 'headquarters', 'No headquarters address found');

  // Company Description
  const rawDesc = w.companyDescription || w.companyOverviewText || w.extractedBrandSummary || null;
  const companyDescription = (rawDesc && !rawDesc.includes('operating in the Consumer Products sector')) ? rawDesc : null;
  const companyDescriptionProvenance = getProv(companyDescription, w.companyDescriptionProvenance, 'companyDescription', 'No company description evidence found');

  // Tagline, Mission, Vision
  const tagline = (w.tagline && w.tagline !== 'Not Specified in Evidence') ? w.tagline : null;
  const taglineProvenance = getProv(tagline, w.taglineProvenance, 'tagline', 'No official tagline found');

  const missionStatement = (w.missionStatement && w.missionStatement !== 'Not Specified in Evidence') ? w.missionStatement : null;
  const missionStatementProvenance = getProv(missionStatement, w.missionStatementProvenance, 'missionStatement', 'No mission statement evidence found');

  const vision = (w.vision && w.vision !== 'Not Specified in Evidence') ? w.vision : null;
  const visionProvenance = getProv(vision, w.visionProvenance, 'vision', 'No vision statement evidence found');

  // Target Audience Array
  let targetAudience = [];
  if (Array.isArray(w.targetAudience) && w.targetAudience.length > 0) {
    targetAudience = w.targetAudience.filter(a => typeof a === 'string' && !a.includes('Primary consumers seeking high-quality'));
  } else if (typeof w.targetAudience === 'string' && w.targetAudience.trim() && !w.targetAudience.includes('Primary consumers seeking high-quality') && w.targetAudience !== 'Not Specified in Evidence') {
    targetAudience = [w.targetAudience];
  }
  const targetAudienceProvenance = getProv(targetAudience, w.targetAudienceProvenance, 'targetAudience', 'No target audience signals');

  // Core Products Array
  const rawProducts = w.coreProductsServices || struct.products_services || [];
  const coreProductsServices = Array.isArray(rawProducts) ? rawProducts.filter(p => typeof p === 'string' && p.trim()) : [];
  const coreProductsServicesProvenance = getProv(coreProductsServices, w.coreProductsServicesProvenance, 'coreProductsServices', 'No core product signals');

  // Brand Colors Visual Facts
  const rawColors = w.brandColors || struct.color_palette || [];
  const brandColors = Array.isArray(rawColors) ? rawColors.filter(c => typeof c === 'string' && c !== '#6366F1' && c !== '#8B5CF6') : [];
  const brandColorsProvenance = getProv(brandColors, w.brandColorsProvenance, 'brandColors', 'Brand colors could not be reliably detected');

  // Extracted Claims vs Approved Claims
  const extractedClaims = Array.isArray(w.extractedClaims) ? w.extractedClaims : [];
  const approvedClaims = Array.isArray(w.approvedClaims) ? w.approvedClaims.filter(c => c.verificationStatus === 'VERIFIED' || c.verified === true) : [];

  return {
    brandName,
    companyName,
    parentCompany,
    parentCompanyProvenance: getProv(parentCompany, w.parentCompanyProvenance, 'parentCompany', 'No parent company evidence'),
    domainUrl: w.domainUrl || w.website || '',
    logoUrl: w.logoUrl || w.faviconUrl || '',
    brandColors,
    brandColorsProvenance,
    industryCategory,
    industryProvenance,
    businessType,
    businessTypeProvenance,
    headquarters,
    headquartersProvenance,
    companyDescription,
    companyDescriptionProvenance,
    tagline,
    taglineProvenance,
    missionStatement,
    missionStatementProvenance,
    vision,
    visionProvenance,
    targetAudience,
    targetAudienceProvenance,
    coreProductsServices,
    coreProductsServicesProvenance,
    extractedClaims,
    approvedClaims,
    dosAndDonts: w.dosAndDonts || {
      dos: w.doWords || w.brandVoice?.dos || [],
      donts: w.dontWords || w.brandVoice?.donts || []
    },
    doWords: w.doWords || w.dosAndDonts?.dos || w.brandVoice?.dos || [],
    dontWords: w.dontWords || w.dosAndDonts?.donts || w.brandVoice?.donts || [],
    brandVoice: w.brandVoice || w.brandVoiceTone || 'Professional & Authoritative',
    brandVoiceTone: w.brandVoiceTone || null,
    contentPillars: Array.isArray(w.contentPillars) ? w.contentPillars : [],
    competitorLandscape: Array.isArray(w.competitorLandscape) ? w.competitorLandscape : [],
    brandValues: Array.isArray(w.brandValues) ? w.brandValues : [],
    socialMediaPresence: Array.isArray(w.socialMediaPresence) ? w.socialMediaPresence : [],
    contactInfo: w.contactInfo || { email: null, phone: null, location: headquarters },
    contactInfoProvenance: getProv(w.contactInfo, w.contactInfoProvenance, 'contactInfo', 'No contact info evidence'),
    pagesEvidence: Array.isArray(w.pagesEvidence) ? w.pagesEvidence : [],
    fieldSources: w.fieldSources || {},
    confidenceScore: w.confidenceScore || 85,
    analysisStatus: w.analysisStatus || 'SUCCESS',
    isInsufficientEvidence: w.analysisStatus === 'INSUFFICIENT_EVIDENCE'
  };
}

/**
 * Format Provenance Badge Helper for UI (Disabled - Badges removed per UI guidelines)
 */
export function getProvenanceBadgeInfo(provenanceObj, fallbackSourceType = 'UNKNOWN') {
  return null;
}
