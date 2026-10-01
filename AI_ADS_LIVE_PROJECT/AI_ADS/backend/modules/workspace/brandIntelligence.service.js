const { scrapeBrandWebsite, formatCleanSpacedBrandName, extractOfficialLogoColors } = require('./brandScraper.service');
const { classifyBrandCategory } = require('./brandProcessor.service');
const { runBrandDnaMasterAgent } = require('../brandDnaAgent');
const aiService = require('../../services/aiService');

async function generateBrandDNA(domainUrl, brandNameOverride = '', documentUploadData = null) {
  // Delegate execution to Master Brand DNA Agent Orchestrator Subsystem
  const masterAgentResult = await runBrandDnaMasterAgent(domainUrl, brandNameOverride);
  const scrapedData = masterAgentResult.scrapedMetadata || {};
  const brandName = masterAgentResult.brandName?.value || brandNameOverride || scrapedData.brandName || 'Brand';

  const categoryDetails = classifyBrandCategory(
    scrapedData.domainName || '',
    brandName,
    scrapedData.headings || [],
    scrapedData.metaDescription || '',
    scrapedData.deepContextText || '',
    scrapedData.aboutPageHeadings || [],
    scrapedData.aboutPageText || '',
    scrapedData
  );

  let aiEnrichedData = null;
  let hasVisual = false;

  try {
    const pageImages = (scrapedData.pagesEvidence || [])
      .filter(p => p && p.screenshot && p.screenshot.status === 'SUCCESS' && p.screenshot.base64)
      .slice(0, 2)
      .map(p => ({
        url: p.url,
        pageType: p.pageType || 'PAGE',
        mimeType: p.screenshot.mimeType || 'image/jpeg',
        base64: p.screenshot.base64
      }));

    hasVisual = pageImages.length > 0;
    console.log(`[AI-MULTIMODAL] Engine: BrandIntelligence | Text evidence: YES | Images attached: ${pageImages.length}`);

    const prompt = `You are an advanced Brand Intelligence Engine enforcing STRICT EVIDENCE GROUNDING.
Your task is to analyze scraped website text, uploaded guideline documents, AND attached page screenshots for "${brandName}" (${scrapedData.cleanUrl || domainUrl}) and extract factual Brand DNA.

STRICT EVIDENCE GROUNDING RULES (MANDATORY):
1. Use BOTH textual DOM evidence, uploaded document rules/guidelines, AND attached page screenshots.
2. If evidence is missing or insufficient in text, documents, and screenshots, return null (or [] for arrays). Do NOT fabricate missing facts.
3. For missionStatement & vision: Inspect page text, uploaded guideline documents, AND sustainability/about page screenshots to observe explicit mission/vision statements or core purpose commitments.
4. For headquarters: Inspect contact/footer page text AND screenshots for complete corporate headquarters addresses (e.g. "Sant'Agata Bolognese, Italy").
5. For parentCompany, industryCategory, businessType: Inspect text, uploaded documents, & visual branding.

Context from live website scrape & uploaded documents:
- Domain: ${scrapedData.domainName || domainUrl || ''}
- Schema Slogan: ${scrapedData.schemaSlogan || 'None'}
- Homepage Headings: ${(scrapedData.headings || []).join(' | ')}
- About Page Headings: ${(scrapedData.aboutPageHeadings || []).join(' | ')}
- About Page Text Excerpt: ${(scrapedData.aboutPageText || '').slice(0, 1500)}
- Contact Page Text Excerpt: ${(scrapedData.contactPageText || '').slice(0, 2000)}
- Deep Multi-Page Context: ${(scrapedData.deepContextText || '').slice(0, 12000)}
${documentUploadData ? `\n- Uploaded Brand Guideline Document Text & Rules:\n${(documentUploadData.rawText || '').slice(0, 10000)}\n- Approved Claims: ${JSON.stringify(documentUploadData.extractedClaims || [])}\n- Restricted Brand Rules: ${JSON.stringify(documentUploadData.extractedRules || [])}` : ''}
${hasVisual ? `\nVISUAL EVIDENCE ATTACHED: Inspect the attached ${pageImages.length} full-rendered page screenshots (including Homepage, About, Contact, Products, Sustainability/Mission) for visual branding, mission/vision banners, and complete headquarters text.` : ''}

Return ONLY a raw valid JSON object with NO markdown formatting:
{
  "companyName": "${brandName}",
  "parentCompany": null,
  "companyFoundedYear": null,
  "brandLaunchYear": null,
  "industryCategory": null,
  "subIndustry": null,
  "businessType": null,
  "headquarters": null,
  "companyDescription": null,
  "tagline": null,
  "missionStatement": null,
  "vision": null,
  "targetAudience": [],
  "coreProductsServices": [],
  "contentPillars": [],
  "competitorLandscape": [],
  "brandValues": []
}`;

    const aiRes = await aiService.generateJSON(prompt, { temperature: 0.1, images: pageImages });
    if (aiRes && typeof aiRes === 'object') {
      aiEnrichedData = aiRes.data || aiRes;
    }
  } catch (err) {
    console.log('AI Brand DNA synthesis failed, using audited evidence model:', err.message);
  }

  // Assembly & Provenance Synchronization
  const aiSource = hasVisual ? 'WEBSITE_DOM+WEBSITE_SCREENSHOT' : 'AI_INFERENCE';

  const indObj = (masterAgentResult.industryCategory?.value && masterAgentResult.industryCategory.sourceType !== 'UNKNOWN')
    ? masterAgentResult.industryCategory
    : (categoryDetails.industryCategory?.value ? categoryDetails.industryCategory : {
        value: aiEnrichedData?.industryCategory || null,
        sourceType: aiEnrichedData?.industryCategory ? aiSource : 'UNKNOWN',
        sourceUrl: scrapedData.cleanUrl || domainUrl,
        evidence: aiEnrichedData?.industryCategory ? 'Synthesized by multimodal AI from page text & screenshots' : 'No industry evidence found',
        confidence: aiEnrichedData?.industryCategory ? 0.85 : 0,
        lastVerified: new Date().toISOString()
      });

  const bTypeObj = (masterAgentResult.businessType?.value && masterAgentResult.businessType.value !== 'D2C E-Commerce Brand')
    ? masterAgentResult.businessType
    : (categoryDetails.businessType?.value && categoryDetails.businessType.value !== 'D2C E-Commerce Brand' ? categoryDetails.businessType : {
        value: aiEnrichedData?.businessType || (masterAgentResult.businessType?.value || categoryDetails.businessType?.value || null),
        sourceType: aiEnrichedData?.businessType ? aiSource : (masterAgentResult.businessType?.sourceType || 'UNKNOWN'),
        sourceUrl: scrapedData.cleanUrl || domainUrl,
        evidence: aiEnrichedData?.businessType ? 'Inferred by multimodal AI from brand model & page screenshots' : 'No business type evidence found',
        confidence: aiEnrichedData?.businessType ? 0.85 : 0,
        lastVerified: new Date().toISOString()
      });

  const hqObj = masterAgentResult.headquarters?.value
    ? masterAgentResult.headquarters
    : (categoryDetails.headquarters?.value ? categoryDetails.headquarters : {
        value: aiEnrichedData?.headquarters || null,
        sourceType: aiEnrichedData?.headquarters ? aiSource : 'UNKNOWN',
        sourceUrl: scrapedData.cleanUrl || domainUrl,
        evidence: aiEnrichedData?.headquarters ? 'Extracted by multimodal AI from contact text & page screenshots' : 'No headquarters address found',
        confidence: aiEnrichedData?.headquarters ? 0.90 : 0,
        lastVerified: new Date().toISOString()
      });

  let rawDesc = masterAgentResult.companyDescription?.value || categoryDetails.companyDescription?.value || aiEnrichedData?.companyDescription || null;
  if (rawDesc && (!indObj.value || indObj.sourceType === 'UNKNOWN') && /operating in the Consumer Products sector|industry-leading company operating in/i.test(rawDesc)) {
    rawDesc = null; // Purge contradictory hallucination
  }

  const descObj = masterAgentResult.companyDescription?.value
    ? masterAgentResult.companyDescription
    : (categoryDetails.companyDescription?.value ? categoryDetails.companyDescription : (
        rawDesc ? { value: rawDesc, sourceType: aiSource, confidence: 0.80, evidence: 'Summarized by AI reasoning from page text & screenshots', lastVerified: new Date().toISOString() }
        : { value: null, sourceType: 'UNKNOWN', confidence: 0, evidence: 'No company description found in website evidence', lastVerified: new Date().toISOString() }
      ));

  const missionObj = masterAgentResult.missionStatement?.value ? masterAgentResult.missionStatement : (
    categoryDetails.missionStatement?.value ? categoryDetails.missionStatement : (
      aiEnrichedData?.missionStatement ? { value: aiEnrichedData.missionStatement, sourceType: aiSource, confidence: 0.82, evidence: 'Extracted by AI from page text & sustainability/purpose screenshots', lastVerified: new Date().toISOString() }
      : { value: null, sourceType: 'UNKNOWN', confidence: 0, evidence: 'No mission statement found in website evidence', lastVerified: new Date().toISOString() }
    )
  );

  const visionObj = masterAgentResult.vision?.value ? masterAgentResult.vision : (
    categoryDetails.vision?.value ? categoryDetails.vision : (
      aiEnrichedData?.vision ? { value: aiEnrichedData.vision, sourceType: aiSource, confidence: 0.82, evidence: 'Extracted by AI from page text & vision/strategy screenshots', lastVerified: new Date().toISOString() }
      : { value: null, sourceType: 'UNKNOWN', confidence: 0, evidence: 'No vision statement found in website evidence', lastVerified: new Date().toISOString() }
    )
  );

  const taglineObj = masterAgentResult.tagline?.value ? masterAgentResult.tagline : (
    scrapedData.schemaSlogan ? { value: scrapedData.schemaSlogan, sourceType: 'OFFICIAL_WEBSITE_SCHEMA', confidence: 0.95, evidence: 'Extracted from JSON-LD schema slogan', lastVerified: new Date().toISOString() }
    : (scrapedData.heroBannerTagline ? { value: scrapedData.heroBannerTagline, sourceType: 'OFFICIAL_WEBSITE', confidence: 0.88, evidence: 'Extracted from official website hero banner', lastVerified: new Date().toISOString() }
    : (aiEnrichedData?.tagline ? { value: aiEnrichedData.tagline, sourceType: aiSource, confidence: 0.82, evidence: 'Extracted by AI from visual page banner/text', lastVerified: new Date().toISOString() }
    : { value: null, sourceType: 'UNKNOWN', confidence: 0, evidence: 'No slogan found in website evidence', lastVerified: new Date().toISOString() }
  )));

  if (aiEnrichedData) {
    console.log(`[FIELD-MULTIMODAL] Field: vision | Value: "${visionObj.value || 'null'}" | Source: ${visionObj.sourceType}`);
    console.log(`[FIELD-MULTIMODAL] Field: industryCategory | Value: "${indObj.value || 'null'}" | Source: ${indObj.sourceType}`);
    console.log(`[FIELD-MULTIMODAL] Field: businessType | Value: "${bTypeObj.value || 'null'}" | Source: ${bTypeObj.sourceType}`);
  }

  const targetAudienceValue = (masterAgentResult.targetDemographics && masterAgentResult.targetDemographics.length > 0)
    ? masterAgentResult.targetDemographics
    : (aiEnrichedData?.targetAudience && aiEnrichedData.targetAudience.length > 0 ? aiEnrichedData.targetAudience : []);

  const targetAudienceProvenance = (masterAgentResult.targetDemographics && masterAgentResult.targetDemographics.length > 0)
    ? { value: masterAgentResult.targetDemographics, status: 'INFERRED', sourceType: 'AI_INFERENCE', confidence: 0.85, evidence: 'Synthesized from buyer persona and ICP analysis', lastVerified: new Date().toISOString() }
    : ((aiEnrichedData?.targetAudience && aiEnrichedData.targetAudience.length > 0)
        ? { value: aiEnrichedData.targetAudience, status: 'INFERRED', sourceType: 'AI_INFERENCE', confidence: 0.75, evidence: 'Inferred from catalog headings', lastVerified: new Date().toISOString() }
        : { value: [], status: 'UNKNOWN', sourceType: 'UNKNOWN', confidence: 0, evidence: 'No target audience signals', lastVerified: new Date().toISOString() });

  const coreProductsValue = (masterAgentResult.coreProducts && masterAgentResult.coreProducts.length > 0)
    ? masterAgentResult.coreProducts
    : (aiEnrichedData?.coreProductsServices && aiEnrichedData.coreProductsServices.length > 0 ? aiEnrichedData.coreProductsServices : []);

  const coreProductsProvenance = (masterAgentResult.coreProducts && masterAgentResult.coreProducts.length > 0)
    ? { value: masterAgentResult.coreProducts, status: 'VERIFIED', sourceType: 'OFFICIAL_WEBSITE', confidence: 0.90, evidence: 'Extracted product categories from nav menu & headings', lastVerified: new Date().toISOString() }
    : ((aiEnrichedData?.coreProductsServices && aiEnrichedData.coreProductsServices.length > 0)
        ? { value: aiEnrichedData.coreProductsServices, status: 'INFERRED', sourceType: 'AI_INFERENCE', confidence: 0.80, evidence: 'Extracted from page product headings', lastVerified: new Date().toISOString() }
        : { value: [], status: 'UNKNOWN', sourceType: 'UNKNOWN', confidence: 0, evidence: 'No product headings found', lastVerified: new Date().toISOString() });

  const formattedBrandName = masterAgentResult.brandName?.value || formatCleanSpacedBrandName(categoryDetails.companyName?.value || scrapedData.brandName || brandName);

  // Requirement 5: parentCompany must NEVER default to brandName. Returns null if unknown.
  const parentCompanyValue = masterAgentResult.parentCompany?.value || categoryDetails.parentCompany?.value || aiEnrichedData?.parentCompany || null;
  const parentCompanyObj = parentCompanyValue ? {
    value: parentCompanyValue,
    status: masterAgentResult.parentCompany?.value ? 'VERIFIED' : 'INFERRED',
    sourceType: masterAgentResult.parentCompany?.value ? 'OFFICIAL_WEBSITE_SCHEMA' : 'AI_INFERENCE',
    sourceUrl: scrapedData.cleanUrl || domainUrl,
    evidence: `Extracted parent company: "${parentCompanyValue}"`,
    confidence: masterAgentResult.parentCompany?.value ? 0.95 : 0.75,
    lastVerified: new Date().toISOString()
  } : {
    value: null,
    status: 'UNKNOWN',
    sourceType: 'UNKNOWN',
    sourceUrl: scrapedData.cleanUrl || domainUrl,
    evidence: 'No explicit parent company found in website evidence',
    confidence: 0,
    lastVerified: new Date().toISOString()
  };

  // Requirement 6: Marketing headings are EXTRACTED_CLAIMS with verificationStatus: 'UNVERIFIED'
  const extractedClaimsList = (scrapedData.headings && scrapedData.headings.length > 0)
    ? scrapedData.headings.slice(0, 5).map(h => ({
        claimText: h,
        sourceUrl: scrapedData.cleanUrl || domainUrl,
        sourceType: 'OFFICIAL_WEBSITE',
        evidence: `Scraped heading text from homepage`,
        verificationStatus: 'UNVERIFIED'
      }))
    : [];

  // Requirement 7: Brand Colors visual facts
  let visualBrandColors = (masterAgentResult.brandColors && masterAgentResult.brandColors.length >= 1)
    ? masterAgentResult.brandColors
    : (scrapedData.brandColors || categoryDetails.brandColors || []);

  if (!visualBrandColors || visualBrandColors.length === 0) {
    visualBrandColors = await extractOfficialLogoColors(scrapedData.cleanUrl || domainUrl, brandName, masterAgentResult.logoUrl || scrapedData.logoUrl);
  }

  const dnaResult = {
    brandName: formattedBrandName,
    companyName: formattedBrandName,
    parentCompany: parentCompanyValue, // null if unknown, NEVER brandName
    parentCompanyProvenance: parentCompanyObj,
    domainUrl: scrapedData.cleanUrl || domainUrl,
    logoUrl: masterAgentResult.logoUrl || scrapedData.logoUrl || scrapedData.faviconUrl || '',
    brandColors: visualBrandColors,
    brandColorsProvenance: {
      value: visualBrandColors,
      status: visualBrandColors.length >= 1 ? 'VERIFIED' : 'UNKNOWN',
      sourceType: visualBrandColors.length >= 1 ? 'OFFICIAL_LOGO' : 'UNKNOWN',
      confidence: visualBrandColors.length >= 1 ? 0.90 : 0
    },

    // Provenance & Master Agent Audited Fields
    industry: indObj.value,
    industryCategory: indObj.value,
    subIndustry: categoryDetails.subIndustry?.value || aiEnrichedData?.subIndustry || null,
    businessType: bTypeObj.value,
    headquarters: hqObj.value,
    locations: categoryDetails.locations || [],
    companyDescription: descObj.value,
    tagline: taglineObj.value,
    missionStatement: missionObj.value,
    vision: visionObj.value,

    // Strict Provenance Objects
    industryProvenance: indObj,
    secondaryIndustries: categoryDetails.secondaryIndustries || [],
    businessTypeProvenance: bTypeObj,
    headquartersProvenance: hqObj,
    companyDescriptionProvenance: descObj,
    taglineProvenance: taglineObj,
    missionStatementProvenance: missionObj,
    visionProvenance: visionObj,
    targetAudienceProvenance,
    coreProductsServicesProvenance: coreProductsProvenance,

    fieldSources: {
      tagline: taglineObj.sourceType,
      headquarters: hqObj.sourceType,
      industryCategory: indObj.sourceType,
      subIndustry: categoryDetails.subIndustry?.sourceType || 'UNKNOWN',
      businessType: bTypeObj.sourceType,
      companyDescription: descObj.sourceType,
      missionStatement: missionObj.sourceType,
      vision: visionObj.sourceType,
      targetAudience: targetAudienceProvenance.sourceType,
      coreProductsServices: coreProductsProvenance.sourceType
    },

    targetAudience: targetAudienceValue,
    brandVoice: masterAgentResult.brandVoice || (typeof masterAgentResult.brandVoiceTone === 'string' ? masterAgentResult.brandVoiceTone : 'Professional & Authoritative'),
    brandVoiceTone: {
      formalityScore: 3,
      toneKeywords: (Array.isArray(masterAgentResult.voiceAttributes) && masterAgentResult.voiceAttributes.length > 0)
        ? masterAgentResult.voiceAttributes
        : (masterAgentResult.brandVoice ? [masterAgentResult.brandVoice] : ['Professional', 'Authoritative'])
    },
    voiceAttributes: masterAgentResult.voiceAttributes || [],
    brandPromises: masterAgentResult.brandPromises || [],
    coreProductsServices: coreProductsValue,
    contentPillars: (masterAgentResult.contentPillars && masterAgentResult.contentPillars.length > 0)
      ? masterAgentResult.contentPillars
      : (aiEnrichedData?.contentPillars && aiEnrichedData.contentPillars.length > 0
          ? aiEnrichedData.contentPillars
          : (scrapedData.navCategories && scrapedData.navCategories.length > 0 ? scrapedData.navCategories.slice(0, 5) : [])),
    competitorLandscape: aiEnrichedData?.competitorLandscape || [],
    brandValues: (masterAgentResult.brandPromises && masterAgentResult.brandPromises.length > 0)
      ? masterAgentResult.brandPromises
      : (aiEnrichedData?.brandValues || []),
    dosAndDonts: {
      dos: masterAgentResult.doWords || ['Use grounded facts from official evidence', 'Maintain clear professional brand tone'],
      donts: masterAgentResult.dontWords || ['Avoid unverified claims or unsupported statistics', 'Avoid generic marketing buzzwords']
    },
    doWords: masterAgentResult.doWords || ['Use grounded facts from official evidence', 'Maintain clear professional brand tone'],
    dontWords: masterAgentResult.dontWords || ['Avoid unverified claims or unsupported statistics', 'Avoid generic marketing buzzwords'],
    buyerPersonas: masterAgentResult.buyerPersonas || [],
    corePainPoints: masterAgentResult.corePainPoints || [],
    approvedClaims: [], // Only claims verified by explicit approval workflow belong here
    extractedClaims: extractedClaimsList, // Headings with verificationStatus: 'UNVERIFIED'
    tabooTopics: [],
    restrictedClaims: [],
    socialMediaPresence: scrapedData.socialPlatforms || [],
    faviconUrl: masterAgentResult.faviconUrl || scrapedData.faviconUrl || '',
    contactInfo: {
      email: masterAgentResult.contactInfo?.value?.email || scrapedData.emails?.[0] || null,
      phone: masterAgentResult.contactInfo?.value?.phone || scrapedData.phones?.[0] || null,
      location: masterAgentResult.contactInfo?.value?.location || hqObj.value || null
    },
    contactInfoProvenance: {
      value: {
        email: masterAgentResult.contactInfo?.value?.email || scrapedData.emails?.[0] || null,
        phone: masterAgentResult.contactInfo?.value?.phone || scrapedData.phones?.[0] || null,
        location: masterAgentResult.contactInfo?.value?.location || hqObj.value || null
      },
      status: (masterAgentResult.contactInfo?.value?.email || scrapedData.emails?.[0] || masterAgentResult.contactInfo?.value?.phone || scrapedData.phones?.[0]) ? 'VERIFIED' : 'UNKNOWN',
      sourceType: (scrapedData.emails?.[0] || scrapedData.phones?.[0]) ? 'OFFICIAL_WEBSITE' : (masterAgentResult.contactInfo?.sourceType || 'UNKNOWN'),
      confidence: (masterAgentResult.contactInfo?.value?.email || scrapedData.emails?.[0]) ? 0.90 : 0
    },
    evidenceCitations: scrapedData.crawledSources || [],
    pagesEvidence: masterAgentResult.pagesEvidence || scrapedData.pagesEvidence || [],
    confidenceScore: indObj.value ? 95 : 70,
    analysisStatus: scrapedData.isInsufficientEvidence ? 'INSUFFICIENT_EVIDENCE' : 'SUCCESS'
  };

  console.log(`✅ [BRAND-DNA] Setup Complete for "${formattedBrandName}"! (Industry: ${dnaResult.industryCategory} [${dnaResult.industryProvenance?.sourceType}], HQ: ${dnaResult.headquarters} [${dnaResult.headquartersProvenance?.sourceType}])\n`);
  return dnaResult;
}

// ─── TAVILY-ONLY BRAND SCRAPER ENGINE ──────────────────────────────────────────
async function generateBrandDnaTavilyOnly(domainUrl, brandNameOverride = '') {
  const tavilyService = require('../../services/tavilyService');
  const cleanUrl = domainUrl.startsWith('http') ? domainUrl : `https://${domainUrl}`;
  const domainHost = cleanUrl.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  const derivedName = brandNameOverride || domainHost.split('.')[0].toUpperCase();

  console.log(`🌐 [SCRAPER-TAVILY-ONLY] Executing Tavily-exclusive extraction for: ${cleanUrl}`);

  const [tavilyExtract, tavilySearch] = await Promise.all([
    tavilyService.extractTavilyUrl(cleanUrl).catch(e => { console.warn('Tavily extract error:', e.message); return null; }),
    tavilyService.searchTavily(`${cleanUrl} ${derivedName} official brand tagline mission vision headquarters colors products target audience competitors`, 'advanced', 5).catch(e => { console.warn('Tavily search error:', e.message); return null; })
  ]);

  const rawExcerpt = tavilyExtract?.rawContent || '';
  const searchAnswer = tavilySearch?.answer || '';
  const searchResults = tavilySearch?.results || [];

  const prompt = `You are an expert Brand Intelligence Engine.
Analyze the following raw scraped website text AND Tavily web search results for brand "${derivedName}" (${cleanUrl}).
Extract factual Brand DNA details.

TAVILY SEARCH SUMMARY:
${searchAnswer || 'No search summary answer available'}

TAVILY SEARCH RESULTS & SNIPPETS:
${searchResults.map(r => `Title: ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}`).join('\n\n')}

TAVILY RAW EXTRACTED WEBSITE CONTENT:
${rawExcerpt.slice(0, 8000)}

Return ONLY a raw valid JSON object with NO markdown or explanation:
{
  "companyName": "${derivedName}",
  "brandName": "${derivedName}",
  "parentCompany": null,
  "domainUrl": "${cleanUrl}",
  "logoUrl": "",
  "brandColors": ["#000000", "#FFFFFF"],
  "industryCategory": null,
  "subIndustry": null,
  "businessType": null,
  "headquarters": null,
  "contactInfo": { "email": null, "phone": null, "location": null },
  "companyDescription": null,
  "tagline": null,
  "missionStatement": null,
  "vision": null,
  "targetAudience": [],
  "coreProductsServices": [],
  "brandValues": [],
  "competitorLandscape": []
}`;

  let aiData = {};
  try {
    const aiRes = await aiService.generateJSON(prompt, { temperature: 0.1 });
    aiData = aiRes?.data || aiRes || {};
  } catch (err) {
    console.warn('[SCRAPER-TAVILY-ONLY] AI synthesis error:', err.message);
  }

  const brandName = aiData.brandName || aiData.companyName || derivedName;
  const logoUrl = aiData.logoUrl || `https://www.google.com/s2/favicons?domain=${domainHost}&sz=128`;
  const officialLogoColors = await extractOfficialLogoColors(cleanUrl, brandName, logoUrl);
  const brandColors = (officialLogoColors && officialLogoColors.length >= 1)
    ? officialLogoColors
    : (Array.isArray(aiData.brandColors) ? aiData.brandColors : []);

  const rawScrapedData = {
    engineUsed: 'tavily',
    engineName: 'Tavily AI Web Scraper',
    scrapedAt: new Date().toISOString(),
    targetUrl: cleanUrl,
    tavilyExtract: tavilyExtract || null,
    tavilySearch: tavilySearch || null,
    searchAnswer: searchAnswer,
    searchResults: searchResults,
    images: tavilySearch?.images || [],
    rawTextExcerpt: rawExcerpt.slice(0, 5000),
    allFields: {
      ...aiData,
      rawContentSnippet: rawExcerpt.slice(0, 3000),
      searchAnswer: searchAnswer,
      searchResultsCount: searchResults.length,
      extractedAt: new Date().toISOString()
    }
  };

  return {
    brandName,
    companyName: aiData.companyName || brandName,
    parentCompany: aiData.parentCompany || null,
    domainUrl: cleanUrl,
    logoUrl,
    faviconUrl: logoUrl,
    brandColors,
    industry: aiData.industryCategory || null,
    industryCategory: aiData.industryCategory || null,
    subIndustry: aiData.subIndustry || null,
    businessType: aiData.businessType || null,
    headquarters: aiData.headquarters || null,
    companyDescription: aiData.companyDescription || searchAnswer || null,
    tagline: aiData.tagline || null,
    missionStatement: aiData.missionStatement || null,
    vision: aiData.vision || null,
    contactInfo: aiData.contactInfo || null,
    targetAudience: aiData.targetAudience || [],
    coreProductsServices: aiData.coreProductsServices || [],
    brandValues: aiData.brandValues || [],
    competitorLandscape: aiData.competitorLandscape || [],
    rawScrapedData
  };
}

// ─── GOOGLE SEARCH GROUNDING BRAND SCRAPER ENGINE ──────────────────────────────
async function generateBrandDnaGoogleGroundingOnly(domainUrl, brandNameOverride = '') {
  const { aiClient, globalAiClient } = require('../../config/vertex');
  const cleanUrl = domainUrl.startsWith('http') ? domainUrl : `https://${domainUrl}`;
  const domainHost = cleanUrl.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  const derivedName = brandNameOverride || domainHost.split('.')[0].toUpperCase();

  console.log(`🌐 [SCRAPER-GOOGLE-GROUNDING] Executing Google Search Grounding extraction for: ${cleanUrl}`);

  const prompt = `Use Google Search Grounding to perform live web research for "${cleanUrl}" (Brand: "${derivedName}").

Extract official factual details:
1. Official Company Name & Parent Company
2. Brand Tagline / Slogan
3. Mission Statement & Vision Statement
4. Corporate Headquarters address & Contact Email / Phone
5. Industry Category, Sub-Industry, and Business Type (D2C, B2B, B2C, Enterprise)
6. Primary Brand Colors (Hex codes or color names)
7. Core Products or Services
8. Target Audience & Core Brand Values
9. Key Competitors

Return ONLY a raw valid JSON object with NO markdown:
{
  "companyName": "${derivedName}",
  "brandName": "${derivedName}",
  "parentCompany": null,
  "domainUrl": "${cleanUrl}",
  "logoUrl": "",
  "brandColors": ["#000000", "#FFFFFF"],
  "industryCategory": null,
  "subIndustry": null,
  "businessType": null,
  "headquarters": null,
  "contactInfo": { "email": null, "phone": null, "location": null },
  "companyDescription": null,
  "tagline": null,
  "missionStatement": null,
  "vision": null,
  "targetAudience": [],
  "coreProductsServices": [],
  "brandValues": [],
  "competitorLandscape": []
}`;

  let gRes = null;
  const client = globalAiClient || aiClient;
  
  if (!client) {
    throw new Error('Google Cloud Vertex / Gemini client is not configured for search grounding');
  }

  const candidateModels = ['gemini-3.5-flash'];
  for (const modelName of candidateModels) {
    try {
      gRes = await client.models.generateContent({
        model: modelName,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
      });
      if (gRes?.text) {
        console.log(`✅ [SCRAPER-GOOGLE-GROUNDING] Grounding search successful using model: "${modelName}"`);
        break;
      }
    } catch (e1) {
      console.warn(`[SCRAPER-GOOGLE-GROUNDING] Model "${modelName}" failed:`, e1.message);
    }
  }

  if (!gRes) {
    console.warn('[SCRAPER-GOOGLE-GROUNDING] All Grounding search models failed.');
  }

  const rawText = gRes?.text || '';
  const groundingMetadata = gRes?.candidates?.[0]?.groundingMetadata || {};
  const webQueries = groundingMetadata.webSearchQueries || [];
  const groundingChunks = (groundingMetadata.groundingChunks || []).map(c => c.web || c);

  let aiData = {};
  try {
    const cleaned = rawText.replace(/```json\n?|```\n?/g, '').trim();
    aiData = JSON.parse(cleaned);
  } catch (pErr) {
    try {
      const firstB = rawText.indexOf('{');
      const lastB = rawText.lastIndexOf('}');
      if (firstB !== -1 && lastB > firstB) {
        aiData = JSON.parse(rawText.substring(firstB, lastB + 1));
      }
    } catch (e) {
      console.warn('[SCRAPER-GOOGLE-GROUNDING] JSON parse error:', pErr.message);
    }
  }

  const brandName = aiData.brandName || aiData.companyName || derivedName;
  const logoUrl = aiData.logoUrl || `https://www.google.com/s2/favicons?domain=${domainHost}&sz=128`;
  const officialLogoColors = await extractOfficialLogoColors(cleanUrl, brandName, logoUrl);
  const brandColors = (officialLogoColors && officialLogoColors.length >= 1)
    ? officialLogoColors
    : (Array.isArray(aiData.brandColors) ? aiData.brandColors : []);

  const rawScrapedData = {
    engineUsed: 'google_grounding',
    engineName: 'Google Search Grounding Engine',
    scrapedAt: new Date().toISOString(),
    targetUrl: cleanUrl,
    groundingQueries: webQueries,
    groundingSources: groundingChunks,
    groundingSupports: groundingMetadata.groundingSupports || [],
    rawGroundedResponseText: rawText,
    allFields: {
      ...aiData,
      rawGroundedTextSnippet: rawText.slice(0, 3000),
      groundingQueries: webQueries,
      groundingSourcesCount: groundingChunks.length,
      extractedAt: new Date().toISOString()
    }
  };

  return {
    brandName,
    companyName: aiData.companyName || brandName,
    parentCompany: aiData.parentCompany || null,
    domainUrl: cleanUrl,
    logoUrl,
    faviconUrl: logoUrl,
    brandColors,
    industry: aiData.industryCategory || null,
    industryCategory: aiData.industryCategory || null,
    subIndustry: aiData.subIndustry || null,
    businessType: aiData.businessType || null,
    headquarters: aiData.headquarters || null,
    companyDescription: aiData.companyDescription || null,
    tagline: aiData.tagline || null,
    missionStatement: aiData.missionStatement || null,
    vision: aiData.vision || null,
    contactInfo: aiData.contactInfo || null,
    targetAudience: aiData.targetAudience || [],
    coreProductsServices: aiData.coreProductsServices || [],
    brandValues: aiData.brandValues || [],
    competitorLandscape: aiData.competitorLandscape || [],
    rawScrapedData
  };
}

// ─── DUAL ENGINE BRAND SCRAPER (TAVILY + GOOGLE SEARCH GROUNDING COMBINED) ─────
async function generateBrandDnaBoth(domainUrl, brandNameOverride = '') {
  const cleanUrl = domainUrl.startsWith('http') ? domainUrl : `https://${domainUrl}`;
  console.log(`🌐 [SCRAPER-BOTH] Executing DUAL Extraction (Tavily + Google Grounding) for: ${cleanUrl}`);

  const [tavResult, googleResult] = await Promise.allSettled([
    generateBrandDnaTavilyOnly(domainUrl, brandNameOverride),
    generateBrandDnaGoogleGroundingOnly(domainUrl, brandNameOverride)
  ]);

  const tavRes = tavResult.status === 'fulfilled' ? tavResult.value : null;
  const gRes = googleResult.status === 'fulfilled' ? googleResult.value : null;

  if (tavResult.status === 'rejected') {
    console.warn('[SCRAPER-BOTH] Tavily failed:', tavResult.reason?.message);
  }
  if (googleResult.status === 'rejected') {
    console.warn('[SCRAPER-BOTH] Google Grounding failed:', googleResult.reason?.message);
  }

  // Deduplicate array values helper
  const mergeArrays = (arr1 = [], arr2 = []) => {
    const set = new Set();
    [...(arr1 || []), ...(arr2 || [])].forEach(item => {
      if (item) set.add(typeof item === 'string' ? item.trim() : JSON.stringify(item));
    });
    return Array.from(set).map(i => {
      try { return JSON.parse(i); } catch (e) { return i; }
    });
  };

  const brandName = gRes?.brandName || tavRes?.brandName || brandNameOverride || 'New Brand';
  const companyName = gRes?.companyName || tavRes?.companyName || brandName;
  const logoUrl = gRes?.logoUrl || tavRes?.logoUrl || '';
  const officialLogoColors = await extractOfficialLogoColors(cleanUrl, brandName, logoUrl);
  const combinedColors = mergeArrays(gRes?.brandColors, tavRes?.brandColors);
  const brandColors = (officialLogoColors && officialLogoColors.length >= 1)
    ? officialLogoColors
    : combinedColors;

  const rawScrapedData = {
    engineUsed: 'both',
    engineName: 'Dual Engine (Tavily AI + Google Search Grounding)',
    scrapedAt: new Date().toISOString(),
    targetUrl: cleanUrl,
    tavily: tavRes?.rawScrapedData || null,
    googleGrounding: gRes?.rawScrapedData || null,
    searchAnswer: tavRes?.rawScrapedData?.searchAnswer || '',
    searchResults: tavRes?.rawScrapedData?.searchResults || [],
    groundingQueries: gRes?.rawScrapedData?.groundingQueries || [],
    groundingSources: gRes?.rawScrapedData?.groundingSources || [],
    rawTextExcerpt: tavRes?.rawScrapedData?.rawTextExcerpt || '',
    rawGroundedResponseText: gRes?.rawScrapedData?.rawGroundedResponseText || '',
    allFields: {
      tavilyScrapedFields: tavRes || null,
      googleGroundingScrapedFields: gRes || null,
      scrapedAt: new Date().toISOString()
    }
  };

  return {
    brandName,
    companyName,
    parentCompany: gRes?.parentCompany || tavRes?.parentCompany || null,
    domainUrl: cleanUrl,
    logoUrl,
    faviconUrl: logoUrl,
    brandColors,
    industry: gRes?.industryCategory || tavRes?.industryCategory || null,
    industryCategory: gRes?.industryCategory || tavRes?.industryCategory || null,
    subIndustry: gRes?.subIndustry || tavRes?.subIndustry || null,
    businessType: gRes?.businessType || tavRes?.businessType || null,
    headquarters: gRes?.headquarters || tavRes?.headquarters || null,
    companyDescription: gRes?.companyDescription || tavRes?.companyDescription || null,
    tagline: gRes?.tagline || tavRes?.tagline || null,
    missionStatement: gRes?.missionStatement || tavRes?.missionStatement || null,
    vision: gRes?.vision || tavRes?.vision || null,
    contactInfo: gRes?.contactInfo || tavRes?.contactInfo || null,
    targetAudience: mergeArrays(gRes?.targetAudience, tavRes?.targetAudience),
    coreProductsServices: mergeArrays(gRes?.coreProductsServices, tavRes?.coreProductsServices),
    brandValues: mergeArrays(gRes?.brandValues, tavRes?.brandValues),
    competitorLandscape: mergeArrays(gRes?.competitorLandscape, tavRes?.competitorLandscape),
    rawScrapedData
  };
}

module.exports = {
  generateBrandDNA,
  generateBrandDnaTavilyOnly,
  generateBrandDnaGoogleGroundingOnly,
  generateBrandDnaBoth
};


