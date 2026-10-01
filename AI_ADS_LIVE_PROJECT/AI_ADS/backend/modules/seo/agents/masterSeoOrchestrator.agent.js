/**
 * masterSeoOrchestrator.agent.js
 * Master Autonomous SEO Intelligence Orchestrator Agent
 * 
 * Pipeline Coordination:
 * 1. Dispatches Agent 1 (LiveOnPageCrawlerAgent) to crawl target website URL and resolve Brand/Niche.
 * 2. Dispatches Agent 2 (LiveRankingKeywordsAgent) using resolved Brand to find verified Google SERP rankings.
 * 3. Dispatches Agent 3 (OpportunityGapAgent) to dynamically discover Competitors, Gaps, Opportunities, Quick Wins & Topic Clusters.
 * 4. Merges and formats unified multi-agent keyword intelligence matrix for the dashboard.
 */

const { runLiveOnPageCrawlerAgent } = require('./liveOnPageCrawler.agent');
const { runLiveRankingKeywordsAgent } = require('./liveRankingKeywords.agent');
const { runOpportunityGapAgent } = require('./opportunityGap.agent');
const { runSeoBriefArchitectAgent } = require('./seoBriefArchitect.agent');

/**
 * Execute Full Multi-Agent SEO Audit Pipeline
 */
async function runMasterSeoPipeline({
  websiteUrl = '',
  brandName = 'Brand',
  industry = 'General',
  competitorLandscape = [],
  contentPillars = [],
  targetAudience = 'General Audience',
  seedKeyword = ''
}) {
  const startTime = Date.now();
  console.log(`\n==================================================`);
  console.log(`🚀 [Master SEO Orchestrator] Starting Multi-Agent Pipeline for "${websiteUrl || brandName}"...`);
  console.log(`==================================================`);

  // Step 1: Run Agent 1 (Live Scrape & Brand/Niche Resolution)
  const crawlResult = await runLiveOnPageCrawlerAgent({
    websiteUrl,
    brandName,
    industry,
    contentPillars,
    seedKeyword
  }).catch(err => {
    console.warn('[Master Orchestrator] Agent 1 Error:', err.message);
    return { success: false, onSiteKeywords: [], headings: { h1: [], h2: [], h3: [] }, internalPages: [] };
  });

  const resolvedBrand = crawlResult?.resolvedBrandName || brandName || 'Brand';
  const resolvedIndustry = crawlResult?.resolvedIndustry || industry || 'General';
  const onSiteKeywords = crawlResult?.onSiteKeywords || [];

  console.log(`[Master SEO Orchestrator] 🎯 Resolved Context: Brand="${resolvedBrand}", Niche="${resolvedIndustry}"`);

  // Step 2: Run Agent 2 (Live SERP Rankings)
  const rankingsResult = await runLiveRankingKeywordsAgent({
    domainUrl: websiteUrl,
    brandName: resolvedBrand,
    industry: resolvedIndustry,
    onSiteKeywords
  }).catch(err => {
    console.warn('[Master Orchestrator] Agent 2 Error:', err.message);
    return { success: false, rankingKeywords: [] };
  });

  const rankingKeywords = rankingsResult?.rankingKeywords || [];

  // Step 3: Run Agent 3 (Competitor Discovery, Gaps, Opportunities & Quick Wins)
  const opportunityResult = await runOpportunityGapAgent({
    brandName: resolvedBrand,
    industry: resolvedIndustry,
    domainUrl: websiteUrl,
    onSiteKeywords,
    rankingKeywords,
    competitorLandscape
  }).catch(err => {
    console.warn('[Master Orchestrator] Agent 3 Error:', err.message);
    return { success: false, competitors: [], competitorGaps: [], opportunityKeywords: [], quickWins: [], keywordClusters: [] };
  });

  const competitors = opportunityResult?.competitors || [];
  const competitorGaps = opportunityResult?.competitorGaps || [];
  const opportunityKeywords = opportunityResult?.opportunityKeywords || [];
  const quickWins = opportunityResult?.quickWins || [];
  const keywordClusters = opportunityResult?.keywordClusters || [];

  // Step 4: Build Unified Learned Website Memory
  const learnedWebsiteMemory = {
    websiteUrl,
    brandName: resolvedBrand,
    industry: resolvedIndustry,
    pageTitle: crawlResult?.pageTitle || crawlResult?.metaTitle || '',
    metaTitle: crawlResult?.metaTitle || crawlResult?.pageTitle || '',
    metaDescription: crawlResult?.metaDescription || '',
    headings: crawlResult?.headings || { h1: [], h2: [], h3: [] },
    productTerms: crawlResult?.productTerms || [],
    promotionalContent: crawlResult?.promotionalContent || [],
    internalPages: crawlResult?.internalPages || [],
    onSiteKeywords,
    rankingKeywords,
    competitors,
    competitorGaps,
    opportunityKeywords,
    quickWins,
    keywordClusters
  };

  // Step 5: Combined Matrix
  const allKeywords = [
    ...onSiteKeywords,
    ...rankingKeywords,
    ...competitorGaps,
    ...opportunityKeywords
  ];

  const durationMs = Date.now() - startTime;
  const verifiedSerpCount = (rankingKeywords || []).filter(k => {
    if (!k || !k.isVerifiedSerp) return false;
    const pos = (k.rankingPosition || '').trim();
    if (/unverified|unavailable|indexed|crawled|found in serp|domain search index|site index|estimated|18.*25/i.test(pos)) return false;
    return /^(Verified\s+)?Position\s*#?\d+/i.test(pos);
  }).length;

  console.log(`[Master SEO Orchestrator] ✅ Pipeline finished in ${durationMs}ms for "${resolvedBrand}":`);
  console.log(`  - 🟢 Verified On-Page Keywords: ${onSiteKeywords.length}`);
  console.log(`  - 🔵 Verified SERP Positions: ${verifiedSerpCount} (Total Queried: ${rankingKeywords.length})`);
  console.log(`  - 🟣 Competitor Gaps: ${competitorGaps.length}`);
  console.log(`  - 🟠 SEO Opportunities: ${opportunityKeywords.length}`);
  console.log(`  - ⚡ Quick Wins: ${quickWins.length}`);
  console.log(`  - 🏢 Discovered Competitors: ${competitors.length}\n`);

  return {
    success: true,
    websiteUrl,
    brandName: resolvedBrand,
    industry: resolvedIndustry,
    pipelineDurationMs: durationMs,
    pageTitle: crawlResult?.pageTitle || crawlResult?.metaTitle || '',
    metaDescription: crawlResult?.metaDescription || '',
    headings: crawlResult?.headings || { h1: [], h2: [], h3: [] },
    productTerms: crawlResult?.productTerms || [],
    categoryNames: crawlResult?.productTerms || [],
    internalPages: crawlResult?.internalPages || [],
    promotionalContent: crawlResult?.promotionalContent || [],
    agentsExecutionSummary: {
      agent1_liveOnPageCrawler: {
        status: crawlResult?.success ? 'COMPLETED' : 'FALLBACK',
        crawledUrl: crawlResult?.targetUrl || websiteUrl,
        resolvedBrand,
        resolvedIndustry,
        keywordsExtracted: onSiteKeywords.length,
        productTermsFound: (crawlResult?.productTerms || []).length
      },
      agent2_liveRankingKeywords: {
        status: rankingsResult?.success ? 'COMPLETED' : 'FALLBACK',
        serpFootprint: rankingsResult?.domainHost || '',
        verifiedPositionsFound: verifiedSerpCount,
        totalQueriesEvaluated: rankingKeywords.length
      },
      agent3_opportunityGap: {
        status: opportunityResult?.success ? 'COMPLETED' : 'FALLBACK',
        competitorsDiscovered: competitors.length,
        gapsFound: competitorGaps.length,
        opportunitiesFound: opportunityKeywords.length
      }
    },
    dataIntegritySummary: {
      realFetchedCount: (onSiteKeywords || []).filter(k => k.isRealFetched).length + (rankingKeywords || []).filter(k => k.isRealFetched).length + (competitorGaps || []).filter(k => k.isRealFetched).length,
      aiGeneratedCount: (opportunityKeywords || []).length + (quickWins || []).length + (competitorGaps || []).filter(k => k.isAiGenerated).length + (keywordClusters || []).length,
      verifiedSerpCount,
      verifiedOnPageCount: (onSiteKeywords || []).length,
      discoveredCompetitorsCount: (competitors || []).filter(c => c.isDiscoveredSearch).length,
      aiSuggestedCompetitorsCount: (competitors || []).filter(c => !c.isDiscoveredSearch).length
    },
    learnedWebsiteMemory,
    onSiteKeywords,
    rankingKeywords,
    competitors,
    competitorGaps,
    opportunityKeywords,
    quickWins,
    keywordClusters,
    keywords: allKeywords,
    model: 'Multi-Agent SEO Orchestrator v2.0 (Strict Provenance)'
  };
}

module.exports = {
  runMasterSeoPipeline,
  runLiveOnPageCrawlerAgent,
  runLiveRankingKeywordsAgent,
  runOpportunityGapAgent,
  runSeoBriefArchitectAgent
};
