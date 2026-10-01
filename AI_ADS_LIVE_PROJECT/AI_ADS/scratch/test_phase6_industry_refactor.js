const { generateBrandDNA } = require('../backend/modules/workspace/brandIntelligence.service');

const TEST_TARGETS = [
  { url: 'https://www.garmin-india.com/', brand: 'Garmin India', expectedNot: 'Health, Medical & Wellness' },
  { url: 'https://www.hindalco.com/', brand: 'Hindalco', expectedNot: 'Health, Medical & Wellness' },
  { url: 'https://www.tatamotors.com/', brand: 'Tata Motors', expectedNot: 'Health, Medical & Wellness' },
  { url: 'https://www.asianpaints.com/', brand: 'Asian Paints', expectedNot: 'Health, Medical & Wellness' }
];

async function runPhase6VerificationSuite() {
  console.log(`\n================================================================================`);
  console.log(`🧪 PHASE 6 EVIDENCE-FIRST INDUSTRY CLASSIFICATION VERIFICATION SUITE`);
  console.log(`================================================================================\n`);

  const results = [];

  for (const target of TEST_TARGETS) {
    console.log(`\n🔍 [TEST TARGET] Crawling & Analyzing: ${target.brand} (${target.url})...`);
    const startTime = Date.now();

    try {
      const brandDna = await generateBrandDNA(target.url, target.brand);
      const duration = Date.now() - startTime;

      const industryVal = brandDna.industryCategory || 'null';
      const industrySource = brandDna.industryProvenance?.sourceType || 'UNKNOWN';
      const isHealth = industryVal.toLowerCase().includes('health') || industryVal.toLowerCase().includes('medical') || industryVal.toLowerCase().includes('wellness');

      const pass = !isHealth || target.brand === 'Apollo Hospitals';

      results.push({
        brand: target.brand,
        url: target.url,
        industry: industryVal,
        sourceType: industrySource,
        businessType: brandDna.businessType || 'null',
        headquarters: brandDna.headquarters || 'null',
        pagesCaptured: (brandDna.pagesEvidence || []).length,
        durationMs: duration,
        passed: pass
      });

      console.log(`   ✅ Resolved Industry  : "${industryVal}" [${industrySource}]`);
      console.log(`   ✅ Resolved Business  : "${brandDna.businessType}"`);
      console.log(`   ✅ HQ Address         : "${brandDna.headquarters}"`);
      console.log(`   ⏱️ Duration           : ${duration} ms`);
      console.log(`   🎯 Audit Status       : ${pass ? 'PASSED (Clean Domain Resolution)' : 'FAILED (Health/Medical Bias Detected)'}`);

    } catch (err) {
      console.error(`   ❌ Failed for ${target.brand}:`, err.message);
      results.push({
        brand: target.brand,
        url: target.url,
        industry: 'ERROR',
        sourceType: 'ERROR',
        businessType: 'ERROR',
        headquarters: 'ERROR',
        pagesCaptured: 0,
        durationMs: Date.now() - startTime,
        passed: false,
        error: err.message
      });
    }
  }

  console.log(`\n================================================================================`);
  console.log(`📊 PHASE 6 FINAL VERIFICATION REPORT TABLE`);
  console.log(`================================================================================`);
  console.table(results);
}

runPhase6VerificationSuite().catch(err => console.error('Verification Suite Error:', err));
