/**
 * vertex.service.js
 * AI Ads Orchestration Service (Google Gemini SDK & Multi-Agent SEO Integration Engine)
 * Connected to Autonomous Multi-Agent SEO Architecture
 */

const {
  runMasterSeoPipeline,
  runLiveOnPageCrawlerAgent,
  runLiveRankingKeywordsAgent,
  runOpportunityGapAgent,
  runSeoBriefArchitectAgent,
  runDynamicBlogGenerator,
  runContentRepurposer
} = require('./agents/masterSeoOrchestrator.agent');

const aiService = require('../../services/aiService');

/**
 * Generate Multi-Agent Keyword Clusters (Live On-Site + Live Rankings + High-ROI Opportunities)
 */
async function generateKeywordClusters(params) {
  const {
    websiteUrl = '',
    domainUrl = '',
    seedKeyword = '',
    brandName = 'Brand',
    industry = 'General',
    contentPillars = [],
    existingBrandKeywords = [],
    competitorLandscape = [],
    positioningSummary = '',
    targetAudience = 'Enterprise Leaders',
    count = 10
  } = params;

  const targetUrl = websiteUrl || domainUrl || '';

  // Execute full Multi-Agent SEO Pipeline
  const pipelineResult = await runMasterSeoPipeline({
    websiteUrl: targetUrl,
    brandName,
    industry,
    competitorLandscape,
    contentPillars: contentPillars.length > 0 ? contentPillars : existingBrandKeywords,
    targetAudience,
    seedKeyword
  });

  return pipelineResult;
}

/**
 * Regenerate Single Keyword
 */
async function regenerateSingleKeyword(params) {
  const {
    brandName = 'Brand',
    industry = 'General',
    seedKeyword = '',
    existingKeywords = [],
    targetAudience = 'Enterprise Leaders'
  } = params;

  const existingTerms = existingKeywords.map(k => k.term || k).join(', ');

  const prompt = `You are a Principal SEO Growth Strategist.
Generate ONE high-intent, authoritative keyword phrase for the brand "${brandName}" in the "${industry}" sector.
Seed focus: "${seedKeyword}"
Target audience: "${targetAudience}"

CRITICAL RULE: The keyword must be DISTINCT from these existing terms: ${existingTerms}

Return a JSON object with:
- "term": the search query (3-7 words, realistic consumer search)
- "intent": "Informational" | "Commercial" | "Transactional" | "Navigational"
- "source": "opportunity"
- "badge": "Regenerated High-ROI"
- "strategicValue": 1 clear sentence on why ranking for this term drives high ROI
- "cluster": topic cluster name

Return ONLY valid JSON.`;

  try {
    const result = await aiService.generateJSON(prompt, { model: 'gemini-3.5-flash' });
    const aiData = result?.data || result;
    if (aiData?.term) {
      return { success: true, keyword: aiData, model: result?.model || 'gemini-3.5-flash' };
    }
  } catch (err) {
    console.warn('Single keyword regeneration error:', err.message);
  }

  return {
    success: true,
    keyword: {
      term: `Best ${industry} Solutions for ${brandName} 2026`,
      intent: 'Commercial',
      source: 'opportunity',
      badge: 'Opportunity (Regenerated)',
      strategicValue: 'Captures high-intent buyer research evaluating category solutions.',
      cluster: 'Category Growth'
    }
  };
}

/**
 * Generate Structured SEO Brief (Using Agent 4: SeoBriefArchitect)
 */
async function generateSeoBrief(params) {
  return await runSeoBriefArchitectAgent(params);
}

/**
 * Generate 100% Dynamic Real AI Blog Article (Using Agent 4: BlogGenerator)
 */
async function generateBlogArticle(params) {
  return await runDynamicBlogGenerator(params);
}

/**
 * Multi-Format Content Repurposing (Using Agent 4: ContentRepurposer)
 */
async function transformRepurposeContent(sourceAsset) {
  const title = sourceAsset.title || "Enterprise Content Operations";
  const content = sourceAsset.content || "";
  const brandName = sourceAsset.brandName || "Brand";

  return await runContentRepurposer({ title, content, brandName });
}

/**
 * Generate Social Media Campaign Posts & Visual Prompt
 */
async function generateSocialPosts(params) {
  const { topic, platform = 'LinkedIn', brandName = 'Brand', logoUrl = '', brandLogo = '', industry = '', brandColors = [] } = params;
  const cleanBrand = brandName || 'Brand';
  const resolvedLogoUrl = logoUrl || brandLogo || '';
  const platLower = (platform || 'instagram').toLowerCase();
  const aspect = platLower === 'instagram' ? '1:1' : (platLower.includes('reel') || platLower.includes('tiktok') || platLower.includes('story')) ? '9:16' : '16:9';
  const seed = Math.floor(Math.random() * 1000000);

  const { craftBrandAdPrompt } = require('../../services/brandImageAgent.service');
  const imagePrompt = craftBrandAdPrompt({
    brandName: cleanBrand,
    logoUrl: resolvedLogoUrl,
    industry,
    brandColors,
    topic,
    platform,
    style: 'Photorealistic Commercial',
    aspect,
    seed
  });

  let imageUrl = '';
  try {
    const { resolveBrandVisualAsset } = require('../../services/brandVisualResolver');
    imageUrl = resolveBrandVisualAsset({
      prompt: imagePrompt,
      brandName: cleanBrand,
      topic,
      style: 'Photorealistic Commercial',
      aspect,
      variationIndex: seed % 10
    });
  } catch (e) {
    imageUrl = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80';
  }

  return {
    platform,
    topic,
    brandName: cleanBrand,
    logoUrl: resolvedLogoUrl,
    hook: `🚀 ${cleanBrand} insights on ${topic}: Elevating marketing velocity without losing brand voice.`,
    shortCaption: `Discover how ${cleanBrand} masters ${topic} with precision and speed!`,
    caption: `Successful brands focus on consistent execution and distinct identity. By aligning your strategy on "${topic}", teams achieve maximum audience engagement.\n\nKey takeaways for ${cleanBrand}:\n1️⃣ Clear brand identity & memory\n2️⃣ High-quality visual execution\n3️⃣ Multi-platform audience reach\n\nWhat is your primary focus for ${topic}? Share your thoughts below! 👇`,
    longCaption: `Consistency across platforms builds long-term authority. For ${cleanBrand}, focusing on ${topic} drives high-converting visual campaigns and authentic customer engagement. Discover how unified AI Ads workflows transform content production today!`,
    hashtags: [`#${cleanBrand.replace(/\s+/g, '')}`, `#${topic.replace(/[^a-zA-Z0-9]/g, '')}`, `#ContentStrategy`, `#BrandGrowth`],
    cta: `Explore ${cleanBrand} solutions today at link in bio!`,
    imagePrompt,
    imageUrl,
    logoUrl: resolvedLogoUrl,
    imageStyle: 'Photorealistic Commercial',
    imageAspect: aspect,
    creativeVariations: [
      {
        type: 'STORYTELLING ANGLE',
        text: `Every campaign tells a story. For ${cleanBrand}, focusing on "${topic}" builds customer connection and brand trust.`
      },
      {
        type: 'PROBLEM-SOLUTION',
        text: `Tired of slow content turnarounds for ${cleanBrand}? Streamline "${topic}" campaigns for 4x execution speed.`
      }
    ],
    carouselSlides: [
      { slide: 1, title: topic, subtitle: `${cleanBrand} Growth Playbook` },
      { slide: 2, title: "Brand Identity", subtitle: "Consistent Visuals & Tone" },
      { slide: 3, title: "Execution Speed", subtitle: "Multi-Platform Reach" }
    ],
    reelScript: {
      hookVisual: `High-impact visual showcasing ${cleanBrand} brand logo overlay and product context for ${topic}.`,
      spokenHook: `Here is how ${cleanBrand} masters ${topic} in 3 actionable steps.`,
      bodyShots: `Visual overview of ${cleanBrand} strategy on ${topic}.`,
      callToAction: `Follow ${cleanBrand} for more industry tips!`
    }
  };
}

module.exports = {
  generateSeoBrief,
  generateKeywordClusters,
  regenerateSingleKeyword,
  generateSocialPosts,
  generateBlogArticle,
  transformRepurposeContent
};
