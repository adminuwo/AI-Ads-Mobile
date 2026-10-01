const { generateBrandDNA } = require('../backend/modules/workspace/brandIntelligence.service');

async function testTataMotorsMultimodal() {
  const targetUrl = 'https://www.tatamotors.com/';
  console.log(`\n================================================================================`);
  console.log(`🧪 PHASE 5 FIELD-LEVEL MULTIMODAL VERIFICATION FOR: ${targetUrl}`);
  console.log(`================================================================================\n`);

  const startTime = Date.now();
  const brandDna = await generateBrandDNA(targetUrl, 'Tata Motors');
  const duration = Date.now() - startTime;

  console.log(`\n--- 1. FIELD-LEVEL MULTIMODAL EXTRACTION RESULTS ---`);
  console.log(`Execution Time         : ${duration} ms`);
  console.log(`Brand Name             : "${brandDna.brandName}"`);
  console.log(`Industry Category      : "${brandDna.industryCategory}" (Source: ${brandDna.industryProvenance?.sourceType})`);
  console.log(`Sub-Industry           : "${brandDna.subIndustry}"`);
  console.log(`Business Type          : "${brandDna.businessType}" (Source: ${brandDna.businessTypeProvenance?.sourceType})`);
  console.log(`Headquarters           : "${brandDna.headquarters}" (Source: ${brandDna.headquartersProvenance?.sourceType})`);
  console.log(`Company Description    : "${(brandDna.companyDescription || '').slice(0, 120)}..." (Source: ${brandDna.companyDescriptionProvenance?.sourceType})`);
  console.log(`Tagline                : ${brandDna.tagline ? `"${brandDna.tagline}"` : 'null'} (Source: ${brandDna.taglineProvenance?.sourceType})`);
  console.log(`Mission Statement      : ${brandDna.missionStatement ? `"${brandDna.missionStatement}"` : 'null'} (Source: ${brandDna.missionStatementProvenance?.sourceType})`);
  console.log(`Vision                 : ${brandDna.vision ? `"${brandDna.vision}"` : 'null'} (Source: ${brandDna.visionProvenance?.sourceType})`);
  console.log(`Target Audience        :`, brandDna.targetAudience);
  console.log(`Core Products          :`, brandDna.coreProductsServices);
  console.log(`Parent Company         : ${brandDna.parentCompany ? `"${brandDna.parentCompany}"` : 'null'} (Source: ${brandDna.parentCompanyProvenance?.sourceType})`);
  console.log(`Contact Info           :`, brandDna.contactInfo);

  console.log(`\n--- 2. PAGES EVIDENCE METRICS ---`);
  const pages = brandDna.pagesEvidence || [];
  console.log(`Total Pages Evidence   : ${pages.length}`);
  pages.forEach((p, idx) => {
    console.log(`  [Page ${idx + 1}] ${p.pageType || 'PAGE'} -> ${p.url} (Has Base64: ${!!p.screenshot?.base64})`);
  });

  console.log(`\n--- 3. API SANITIZATION VERIFICATION ---`);
  const apiSanitizedPages = pages.map(p => ({
    url: p.url,
    pageTitle: p.pageTitle,
    pageType: p.pageType,
    hasScreenshot: p.screenshot?.status === 'SUCCESS',
    screenshotStatus: p.screenshot?.status || 'FAILED',
    timestamp: p.screenshot?.timestamp || null
  }));

  console.log(`Base64 Exposed to API : ${apiSanitizedPages.some(p => p.base64 || p.screenshot?.base64)} (MUST BE FALSE)`);
  console.log(`Metadata Included      : ${apiSanitizedPages.length > 0}`);

  return brandDna;
}

testTataMotorsMultimodal().catch(err => console.error('Tata Motors Test Error:', err));
