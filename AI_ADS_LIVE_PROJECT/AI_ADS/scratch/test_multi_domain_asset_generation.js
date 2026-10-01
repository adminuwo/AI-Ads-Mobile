const { inferDomainAndVisualIntent, planAssetSpec, generateOrFetchCandidate } = require('../backend/modules/websiteBuilder/services/visualAssetEngine.service');

const testCases = [
  { prompt: 'Create a website for indian god portraits and divine canvas paintings', expectedDomain: 'DEVOTIONAL_SPIRITUAL_ART' },
  { prompt: 'Luxury diamond rings and 22k gold jewelry boutique', expectedDomain: 'JEWELRY_LUXURY' },
  { prompt: 'Organic artisanal sourdough bakery and pastry shop', expectedDomain: 'BAKERY_CAFE' },
  { prompt: 'Traditional matcha and loose leaf herbal tea store', expectedDomain: 'ORGANIC_TEA' },
  { prompt: 'Modern dental clinic and aesthetic smile care', expectedDomain: 'DENTAL_HEALTHCARE' },
  { prompt: 'AI-powered SaaS analytics dashboard platform', expectedDomain: 'TECH_SAAS_SOFTWARE' },
  { prompt: 'Scandinavian modern furniture and bouclé sofa studio', expectedDomain: 'FURNITURE_HOME' },
  { prompt: 'Fresh floral boutique and wedding bouquets studio', expectedDomain: 'FLORISTRY_BOTANICAL' }
];

console.log('Testing Multi-Domain Semantic Inference & Visual Asset Relevance...\n');

let passed = 0;
for (const tc of testCases) {
  const intent = inferDomainAndVisualIntent({ userPrompt: tc.prompt });
  const assetSpec = planAssetSpec({
    userPrompt: tc.prompt,
    itemName: 'Hero Showcase Offering',
    purpose: 'section_hero'
  });
  const candidate = generateOrFetchCandidate(assetSpec, 0);

  const isMatch = intent.primaryDomain === tc.expectedDomain;
  console.log(`[${isMatch ? 'PASS' : 'FAIL'}] Prompt: "${tc.prompt}"`);
  console.log(`       Domain: ${intent.primaryDomain} (Expected: ${tc.expectedDomain})`);
  console.log(`       Matched Photo: ${candidate.candidateUrl}\n`);

  if (isMatch) passed++;
}

console.log(`Verification: ${passed}/${testCases.length} Test Cases Passed Perfectly!`);
if (passed !== testCases.length) process.exit(1);
