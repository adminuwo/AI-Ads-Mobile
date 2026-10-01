const { generateBrandDNA } = require('c:/Users/RITIK/Desktop/Main_Ai_ADS/backend/modules/workspace/brandIntelligence.service');

async function testFrontendAsianPaints() {
  console.log('================================================================================');
  console.log('🌐 FRONTEND BRAND DNA VERIFICATION: Asian Paints (https://www.asianpaints.com/)');
  console.log('================================================================================\n');

  const backendData = await generateBrandDNA('https://www.asianpaints.com/', 'Asian Paints');

  // Import normalization logic
  const { normalizeBrandDna, getProvenanceBadgeInfo } = require('../frontend/src/utils/normalizeBrandDna.js');
  const normalized = normalizeBrandDna(backendData);

  console.log('--- 1. BRAND IDENTITY & PARENT COMPANY ---');
  console.log(`Brand Name           : "${normalized.brandName}"`);
  console.log(`Parent Company       : ${normalized.parentCompany ? `"${normalized.parentCompany}"` : 'null (No parent company detected)'}`);
  console.log(`Parent Co Badge      : "${getProvenanceBadgeInfo(normalized.parentCompanyProvenance).label}"`);

  console.log('\n--- 2. INDUSTRY & HEADQUARTERS ---');
  console.log(`Industry             : ${normalized.industryCategory ? `"${normalized.industryCategory}"` : 'null (Not available from official sources)'}`);
  console.log(`Industry Badge       : "${getProvenanceBadgeInfo(normalized.industryProvenance).label}"`);
  console.log(`Headquarters         : ${normalized.headquarters ? `"${normalized.headquarters}"` : 'null (Address not found)'}`);
  console.log(`Headquarters Badge   : "${getProvenanceBadgeInfo(normalized.headquartersProvenance).label}"`);

  console.log('\n--- 3. BRAND COLORS (VISUAL FACTS) ---');
  console.log(`Colors Array         :`, normalized.brandColors);
  console.log(`Colors UI Display    : ${normalized.brandColors.length > 0 ? normalized.brandColors.join(', ') : '"Brand colors could not be reliably detected."'}`);

  console.log('\n--- 4. SLOGAN, MISSION & VISION ---');
  console.log(`Tagline              : ${normalized.tagline ? `"${normalized.tagline}"` : 'null'}`);
  console.log(`Tagline Badge        : "${getProvenanceBadgeInfo(normalized.taglineProvenance).label}"`);
  console.log(`Mission Statement    : ${normalized.missionStatement ? `"${normalized.missionStatement}"` : 'null (Mission statement not available from official sources)'}`);
  console.log(`Mission Badge        : "${getProvenanceBadgeInfo(normalized.missionStatementProvenance).label}"`);

  console.log('\n--- 5. CORE PRODUCTS & TARGET AUDIENCE ---');
  console.log(`Core Products        :`, normalized.coreProductsServices);
  console.log(`Products Badge       : "${getProvenanceBadgeInfo(normalized.coreProductsServicesProvenance).label}"`);
  console.log(`Target Audience      :`, normalized.targetAudience);
  console.log(`Audience Badge       : "${getProvenanceBadgeInfo(normalized.targetAudienceProvenance).label}"`);

  console.log('\n--- 6. EXTRACTED MARKETING CLAIMS (UNVERIFIED) ---');
  console.log(`Extracted Claims     :`, normalized.extractedClaims.map(c => typeof c === 'string' ? c : c.claimText));

  console.log('\n--- 7. CHECK FOR REMOVED FABRICATED FALLBACKS ---');
  const fakeFallbacksFound = [
    normalized.industryCategory === 'Consumer Products & Services',
    normalized.brandColors.includes('#6366F1'),
    normalized.brandValues.includes('Innovation'),
    normalized.targetAudience.some(a => typeof a === 'string' && a.includes('Primary consumers seeking high-quality'))
  ].filter(Boolean);

  if (fakeFallbacksFound.length === 0) {
    console.log('✅ PASS: Zero fabricated fallback strings present in normalized Brand DNA!');
  } else {
    console.log('❌ FAIL: Fabricated fallback strings found:', fakeFallbacksFound);
  }
}

testFrontendAsianPaints().catch(console.error);
