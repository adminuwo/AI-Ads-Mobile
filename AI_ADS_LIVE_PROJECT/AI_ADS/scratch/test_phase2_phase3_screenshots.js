const { generateBrandDNA } = require('../backend/modules/workspace/brandIntelligence.service');

async function testPhase2Phase3(targetUrl, siteLabel) {
  console.log(`\n================================================================================`);
  console.log(`🧪 TESTING PHASE 2 & PHASE 3 SCREENSHOT CAPTURE: ${siteLabel} (${targetUrl})`);
  console.log(`================================================================================\n`);

  const startTime = Date.now();
  const brandDna = await generateBrandDNA(targetUrl, siteLabel);
  const duration = Date.now() - startTime;

  console.log(`\n--- 1. CRAWL & SCREENSHOT SUMMARY ---`);
  console.log(`Execution Time       : ${duration} ms`);
  console.log(`Brand Name           : "${brandDna.brandName}"`);
  console.log(`Crawled Sources      :`, brandDna.evidenceCitations);
  console.log(`Total Pages Evidence : ${brandDna.pagesEvidence ? brandDna.pagesEvidence.length : 0}`);

  if (brandDna.pagesEvidence && brandDna.pagesEvidence.length > 0) {
    console.log(`\n--- 2. DETAILED PAGES EVIDENCE MODEL ---`);
    brandDna.pagesEvidence.forEach((page, idx) => {
      const screenshot = page.screenshot || {};
      const hasBase64 = !!screenshot.base64;
      const base64Len = hasBase64 ? screenshot.base64.length : 0;

      console.log(`\n[Page ${idx + 1}]`);
      console.log(`  URL             : "${page.url}"`);
      console.log(`  Title           : "${page.pageTitle}"`);
      console.log(`  Page Type       : "${page.pageType}"`);
      console.log(`  Headings Count  : ${page.headings ? page.headings.length : 0}`);
      console.log(`  Text Snippet    : "${(page.textEvidence || '').slice(0, 100)}..."`);
      console.log(`  Screenshot Status: "${screenshot.status}"`);
      console.log(`  Has Base64 Data : ${hasBase64} (${base64Len} bytes)`);
      console.log(`  Timestamp       : "${screenshot.timestamp}"`);
      if (screenshot.error) console.log(`  Screenshot Error: "${screenshot.error}"`);
    });
  } else {
    console.log(`❌ FAIL: No pagesEvidence array found on Brand DNA result!`);
  }

  console.log(`\n--- 3. DOM & SCHEMA EVIDENCE SANITY CHECK ---`);
  console.log(`Headquarters         : ${brandDna.headquarters ? `"${brandDna.headquarters}"` : 'null'}`);
  console.log(`Tagline              : ${brandDna.tagline ? `"${brandDna.tagline}"` : 'null'}`);
  console.log(`Core Products Count  : ${brandDna.coreProductsServices ? brandDna.coreProductsServices.length : 0}`);

  return brandDna;
}

async function runAllTests() {
  try {
    await testPhase2Phase3('https://www.asianpaints.com/', 'Asian Paints');
    await testPhase2Phase3('https://thebeardstory.com/', 'The Beard Story');
  } catch (err) {
    console.error('Test Execution Error:', err);
  }
}

runAllTests();
