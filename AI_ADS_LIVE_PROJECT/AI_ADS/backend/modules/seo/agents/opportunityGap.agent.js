/**
 * opportunityGap.agent.js
 * Agent 3: Evidence-Based Competitor Intelligence & SEO Opportunity Gap Agent
 * 
 * STRICT RULES:
 * - Queries search engines (Tavily Search + Google Search Grounding) for verified search competitors.
 * - Filters out coupon websites (DesiDime, Coupondunia, GrabOn), job boards (Owler, Glassdoor), forums, and wikis.
 * - Categorizes discovered search competitors vs AI-suggested competitors.
 * - Clearly separates Google-verified competitor gaps from AI-suggested keyword gaps.
 * - Labels AI-suggested opportunities, quick wins, and topic clusters explicitly as "AI-Suggested".
 * - Never shows "Market Dominant" when SERP rank is unverified.
 * - Removes outdated years like 2024; uses current year 2026.
 */

const { searchTavily } = require('../../../services/tavilyService');
const { searchWithGoogleGrounding } = require('../../../services/googleGroundingService');
const aiService = require('../../../services/aiService');

// Strict filter to exclude non-competitors (coupon sites, job portals, social, directories, forums)
const NON_COMPETITOR_DOMAINS = /(desidime|coupondunia|grabon|coupon|deal|owler|glassdoor|quora|reddit|wikipedia|linkedin|facebook|instagram|youtube|twitter|pinterest|play\.google|apps\.apple|indiamart|justdial|tradeindia)/i;

const OUTDATED_YEAR_REGEX = /\b(202[0-4]|201\d)\b/g;

function extractHost(url) {
  try {
    const clean = url.startsWith('http') ? url : `https://${url}`;
    return new URL(clean).hostname.replace('www.', '');
  } catch (_) {
    return '';
  }
}

function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/market\s+dominant/gi, 'Market Presence Unverified')
    .replace(/\bdominates\b/gi, 'leads')
    .replace(/\b18\s*[-–—]\s*25\b/gi, 'Estimated')
    .replace(OUTDATED_YEAR_REGEX, '2026')
    .trim();
}

/**
 * Main Opportunity Gap Agent Execution
 * DUAL-ENGINE: Tavily AI + Google Search Grounding
 */
async function runOpportunityGapAgent({
  brandName = 'Brand',
  industry = 'General',
  domainUrl = '',
  onSiteKeywords = [],
  rankingKeywords = [],
  competitorLandscape = []
}) {
  console.log(`[Agent 3: OpportunityGap] 🎯 [Dual-Engine] Running Competitor & Gap Analysis via Tavily + Google Grounding for "${brandName}" (${industry})...`);

  const onSiteTerms = (onSiteKeywords || []).map(k => k.term).slice(0, 8).join(', ');
  const rankingTerms = (rankingKeywords || []).map(k => k.term).slice(0, 8).join(', ');
  const domainHost = extractHost(domainUrl) || brandName.toLowerCase().replace(/\s+/g, '');

  // ─────────────────────────────────────────────────────────────────────────────
  // DUAL-ENGINE PARALLEL FETCH: Tavily AI + Google Search Grounding
  // ─────────────────────────────────────────────────────────────────────────────
  let discoveredSearchDomains = [];
  let googleGroundingCompetitors = '';

  const [tavilyCompRes, googleGroundingCompRes] = await Promise.allSettled([
    (async () => {
      const competitorSearchQuery = `top competitor websites in ${industry} market for ${brandName} ${onSiteTerms.slice(0, 60)}`;
      let searchRes = await searchTavily(competitorSearchQuery, 'advanced', 6);
      if (!searchRes?.results || searchRes.results.length < 2) {
        searchRes = await searchTavily(`${brandName} ${industry} top competitors alternatives`, 'advanced', 6);
      }
      return searchRes?.results || [];
    })(),
    searchWithGoogleGrounding(`Use Google Search Grounding to find the top direct business competitors and brands for ${brandName} in the ${industry} industry. Identify real competitor domains and search queries where competitors hold strong visibility on Google where ${brandName} is under-indexed.`)
  ]);

  if (tavilyCompRes.status === 'fulfilled' && Array.isArray(tavilyCompRes.value)) {
    discoveredSearchDomains = tavilyCompRes.value
      .map(r => ({
        domain: extractHost(r.url),
        url: r.url,
        title: r.title,
        snippet: r.content || r.snippet || ''
      }))
      .filter(c => c.domain && !c.domain.includes(domainHost) && !c.domain.includes(brandName.toLowerCase()) && !NON_COMPETITOR_DOMAINS.test(c.domain));
  }

  if (googleGroundingCompRes.status === 'fulfilled' && googleGroundingCompRes.value?.success) {
    const gRes = googleGroundingCompRes.value;
    const gSources = (gRes.groundingChunks || []).slice(0, 6).map(c => `• Competitor Source: ${c.title} (${c.domain || c.uri || ''})`).join('\n');
    googleGroundingCompetitors = `GOOGLE SEARCH GROUNDING COMPETITOR INTELLIGENCE:\n${gSources}\n${gRes.text ? `Grounded Analysis: ${gRes.text.slice(0, 1000)}` : ''}`;
    console.log(`[Agent 3: OpportunityGap] ✅ Google Search Grounding verified competitor landscape.`);
  }

  const competitorContext = [
    discoveredSearchDomains.length > 0
      ? discoveredSearchDomains.map((c, i) => `[Search Result #${i + 1}] Domain: "${c.domain}" | URL: "${c.url}" | Title: "${c.title}" | Snippet: "${c.snippet.slice(0, 120)}"`).join('\n')
      : '',
    googleGroundingCompetitors
  ].filter(Boolean).join('\n\n') || `Search Context for ${industry}`;

  const prompt = `You are a Principal Competitor Intelligence & SEO Growth Analyst.
Analyze the following live website data and search market evidence for brand "${brandName}" (${domainHost}) in "${industry}":

LIVE ON-PAGE SCRAPED EVIDENCE:
${onSiteTerms || `${brandName} product and service offerings`}

CURRENT DOMAIN RANKINGS:
${rankingTerms || 'No direct SERP ranking footprint verified yet'}

DISCOVERED SEARCH RESULTS & DOMAINS:
${competitorContext}

TASK:
Perform an evidence-based competitor analysis and SEO opportunity discovery.

CRITICAL RULES:
1. NEVER use the phrase "Market Dominant". If a competitor has high search presence, describe it as "High category search authority".
2. Current year is 2026. NEVER output outdated years like 2024 or 2023.
3. NEVER include coupon websites (e.g. DesiDime, GrabOn), job boards (e.g. Owler, Glassdoor), forums (Quora, Reddit), or social media as competitors.
4. "competitors": Separate search domains into:
   - "SEO Competitor": Direct business/keyword/topic rival offering similar products/services in ${industry}.
   - "SERP Competitor": E-commerce marketplace or category portal appearing in search results.
   For each competitor return:
   - "competitorDomain": domain name (e.g. "competitor.com")
   - "competitorType": "SEO Competitor" | "SERP Competitor"
   - "whyCompetitor": specific reason for classification
   - "keywordOverlap": primary overlapping search themes or product lines
   - "rankingAdvantage": specific search area where competitor has authority

5. "competitorGaps": Identify 4 to 8 realistic, high-impact Competitor Keyword Gaps:
   - "term": specific high-intent keyword phrase
   - "competitor": competitor domain (e.g. "myntra.com", "nykaafashion.com", "lifestylestores.com")
   - "competitorPosition": exact position if verified on Google (e.g. "Position #1", "Position #2"), otherwise "Market Presence Unverified" or "AI-Suggested Competitor". NEVER use "Market Dominant".
   - "userPosition": "Not Ranking" (ONLY if Google Grounding confirmed target domain was absent from top search results) or "Ranking Unverified". NEVER output estimated ranges like "18-25" or "18-25 (Weak)".
   - "rankingUrl": competitor's landing page or category path
   - "searchIntent": "Commercial" | "Transactional" | "Informational" | "Navigational"
   - "gapType": "Missing keyword" | "Weak ranking" | "Content gap" | "Page gap"
   - "gapReason": commercial reason why competitor holds visibility (NO "Market Dominant"; use "Market Presence Unverified" if unverified)

6. "opportunityKeywords": Generate high-ROI SEO growth recommendations based on on-page content and competitor gaps:
   - "term": target keyword phrase
   - "opportunityType": "High-Intent Buyer" | "Competitor Switcher" | "Untapped Niche" | "Low-Difficulty Win"
   - "whyOpportunity": why targeting this term drives organic search growth
   - "competitorRanking": competitor domain ranking or "Not Applicable"
   - "userCurrentRanking": user current status ("Not Ranking" or "Page 2")
   - "searchVolume": "Data unavailable"
   - "keywordDifficulty": "Data unavailable"
   - "difficulty": "Low (Fast Win)" | "Medium (High ROI)" | "High Value"
   - "recommendedAction": "Optimize existing page" | "Create new landing page" | "Create supporting content" | "Improve internal linking"

7. "quickWins": Array of 2-3 quick win keywords where "${brandName}" can rapidly gain traction:
   - "term": keyword
   - "currentPosition": e.g. "Position 7 (Page 1)" or "Position 12 (Page 2)"
   - "bestCompetitorPosition": e.g. "Position 2"
   - "existingRankingPage": plausible ranking page path (e.g. "/features", "/products")
   - "recommendedOptimization": specific tactical fix

8. "keywordClusters": Array of 2-3 structured topic clusters:
   - "primaryTopic": core pillar name
   - "relatedKeywords": array of 3-4 sub-queries
   - "existingPage": relevant page path
   - "recommendedAction": strategic content action

Return ONLY valid JSON.`;

  try {
    const aiResult = await aiService.generateJSON(prompt, { model: 'gemini-3.5-flash' });
    const data = aiResult?.data || aiResult;

    if (data) {
      const now = new Date().toISOString();
      const discoveredHosts = new Set(discoveredSearchDomains.map(d => d.domain.toLowerCase()));

      // 1. Format & Categorize Competitors (Discovered Search vs AI-Suggested)
      const formattedCompetitors = (data.competitors || [])
        .filter(c => c.competitorDomain && typeof c.competitorDomain === 'string')
        .map(c => {
          const rawDomain = c.competitorDomain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace('www.', '');
          if (NON_COMPETITOR_DOMAINS.test(rawDomain)) return null;

          const isDiscovered = discoveredHosts.has(rawDomain) || (googleGroundingCompetitors && googleGroundingCompetitors.toLowerCase().includes(rawDomain));
          const matchingSearch = discoveredSearchDomains.find(d => d.domain.toLowerCase() === rawDomain);

          return {
            competitorDomain: rawDomain,
            competitorType: c.competitorType || (isDiscovered ? 'SERP Competitor' : 'SEO Competitor'),
            sourceType: isDiscovered ? 'Discovered Competitor' : 'AI-Suggested Competitor',
            isDiscoveredSearch: isDiscovered,
            whyCompetitor: sanitizeText(c.whyCompetitor) || `Competitor in ${industry}.`,
            keywordOverlap: sanitizeText(c.keywordOverlap) || 'Product & service search queries',
            rankingAdvantage: sanitizeText(c.rankingAdvantage) || 'Search visibility in category queries',
            verifiedUrl: matchingSearch?.url || `https://${rawDomain}/`,
            badge: isDiscovered ? 'DISCOVERED COMPETITOR' : 'AI-SUGGESTED COMPETITOR',
            trustColor: isDiscovered ? 'purple' : 'slate',
            provenance: {
              provider: isDiscovered ? 'Search Engine Discovery' : 'Market Category Analysis',
              sourceUrl: matchingSearch?.url || `https://${rawDomain}/`,
              retrievedAt: now,
              evidenceType: isDiscovered ? 'Live Search Result Discovery' : 'Market Category Analysis (AI-Suggested)',
              evidenceSnippet: matchingSearch?.snippet ? matchingSearch.snippet.slice(0, 160) : sanitizeText(c.whyCompetitor || rawDomain)
            }
          };
        })
        .filter(Boolean);

      // 2. Format Competitor Gaps (Verified SERP Gaps vs AI-Suggested Gaps)
      // Extract empirically verified competitor positions directly from Google Grounding SERP results
      const verifiedCompRanks = new Map();
      if (googleGroundingCompetitors) {
        const rankBlocks = googleGroundingCompetitors.split(/(?=(?:rank\s*#?\d+|^\d+\.\s+))/im);
        for (const block of rankBlocks) {
          const rankMatch = block.match(/(?:rank\s*#?|^)(\d+)/im);
          if (!rankMatch) continue;
          const posNum = parseInt(rankMatch[1], 10);
          if (posNum < 1 || posNum > 10) continue;

          const domainMatch = block.match(/(?:domain|url)(?:\s*\([^)]*\))?[:\s]+([a-z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2})?)/i) ||
                              block.match(/https?:\/\/([a-z0-9.-]+)/i);
          if (domainMatch) {
            let host = domainMatch[1].replace(/^www\./, '').toLowerCase().trim();
            if (host && !host.includes('google.com') && !host.includes(domainHost)) {
              verifiedCompRanks.set(host, `Position #${posNum}`);
            }
          }
        }
      }

      console.log(`[Agent 3: OpportunityGap] 🔍 Verified ${verifiedCompRanks.size} competitor positions from Google Grounding.`);

      const formattedGaps = (data.competitorGaps || [])
        .filter(g => g.term && g.competitor)
        .map(g => {
          const compHost = (g.competitor || '').toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace('www.', '');
          if (NON_COMPETITOR_DOMAINS.test(compHost)) return null;

          const compUrl = g.rankingUrl && g.rankingUrl.startsWith('http') ? g.rankingUrl : `https://${compHost}/`;

          // STRICT CHECK: Competitor is verified ONLY if Google Grounding returned an exact position for it
          const groundedCompPos = verifiedCompRanks.get(compHost);
          const isCompGoogleVerified = Boolean(groundedCompPos);

          const compPos = isCompGoogleVerified ? groundedCompPos : 'Competitor Position Unverified';
          const userPos = 'Target Position Unverified';
          const isFullyVerifiedSerpGap = false; // Target domain rank is unverified on Google Grounding

          // Never claim competitor outranks target domain unless both positions are verified
          let cleanReason = sanitizeText(g.gapReason) || `Competitor ${compHost} holds category search visibility where ${brandName} is under-indexed.`;
          cleanReason = cleanReason.replace(/outranks?\s+(the\s+)?(target\s+)?(domain|brand)?/gi, 'holds category search visibility where target is under-indexed');

          return {
            term: sanitizeText(g.term),
            competitor: compHost,
            competitorPosition: compPos,
            userPosition: userPos,
            rankingUrl: compUrl,
            searchIntent: g.searchIntent || 'Commercial',
            gapType: g.gapType || 'Content gap',
            gapReason: cleanReason,
            badge: isCompGoogleVerified ? 'COMPETITOR GAP' : 'AI-SUGGESTED GAP',
            trustColor: isCompGoogleVerified ? 'purple' : 'indigo',
            isCompetitorGap: true,
            isVerifiedGap: isCompGoogleVerified,
            isRealFetched: isCompGoogleVerified,
            isAiGenerated: !isCompGoogleVerified,
            source: 'competitor_gap',
            provenance: {
              provider: isCompGoogleVerified ? 'Google Organic Search' : 'Competitive Market Analysis',
              sourceUrl: compUrl,
              retrievedAt: now,
              evidenceType: isCompGoogleVerified ? 'Live Google Competitor SERP Position' : 'AI-Suggested Competitor Gap',
              evidenceSnippet: cleanReason
            }
          };
        })
        .filter(Boolean);

      // Synthesize fallback gaps if needed, strictly labeled as AI-Suggested
      if (formattedGaps.length === 0 && formattedCompetitors.length > 0) {
        const topComps = formattedCompetitors.slice(0, 4);
        topComps.forEach(c => {
          const comp = c.competitorDomain;
          const theme = c.keywordOverlap || c.rankingAdvantage || industry;
          const cleanTheme = sanitizeText(theme.split(/[,|&/]/)[0].trim() || industry);
          formattedGaps.push({
            term: `${cleanTheme} Online`,
            competitor: comp,
            competitorPosition: 'Competitor Position Unverified',
            userPosition: 'Target Position Unverified',
            rankingUrl: `https://${comp}/`,
            searchIntent: 'Commercial',
            gapType: 'Content gap',
            gapReason: `Competitor ${comp} holds category search visibility in ${cleanTheme} where ${brandName} is under-indexed.`,
            badge: 'AI-SUGGESTED COMPETITOR GAP',
            trustColor: 'indigo',
            isCompetitorGap: true,
            isVerifiedGap: false,
            isRealFetched: false,
            isAiGenerated: true,
            source: 'competitor_gap',
            provenance: {
              provider: 'Competitive Market Analysis',
              sourceUrl: `https://${comp}/`,
              retrievedAt: now,
              evidenceType: 'AI-Suggested Competitor Gap',
              evidenceSnippet: `Inferred category search visibility in ${cleanTheme}`
            }
          });
        });
      }

      // 3. AI Opportunities (Strictly Labeled as AI-Suggested)
      const formattedOpps = (data.opportunityKeywords || [])
        .filter(o => o.term)
        .map(o => ({
          term: sanitizeText(o.term),
          opportunityType: o.opportunityType || 'Untapped Niche',
          whyOpportunity: sanitizeText(o.whyOpportunity) || 'Strategic search term aligned with brand products.',
          competitorRanking: o.competitorRanking || 'Top SERP Domains',
          userCurrentRanking: (o.userCurrentRanking && !/not\s*ranking/i.test(o.userCurrentRanking)) ? o.userCurrentRanking : 'Ranking Unverified',
          searchVolume: 'Data unavailable',
          keywordDifficulty: 'Data unavailable',
          difficulty: o.difficulty || 'Medium (High ROI)',
          recommendedAction: o.recommendedAction || 'Create new landing page',
          evidenceBasis: o.opportunityType ? `Evidence: ${o.opportunityType} Analysis` : 'Evidence: Content Gap Analysis',
          badge: 'AI-SUGGESTED OPPORTUNITY',
          subBadge: 'AI-Suggested Competitor Gap',
          trustColor: 'amber',
          isAiOpportunity: true,
          isAiGenerated: true,
          isRealFetched: false,
          source: 'ai_opportunity',
          provenance: {
            provider: 'Competitive Market Analysis',
            sourceUrl: null,
            retrievedAt: now,
            evidenceType: 'AI-Suggested Strategic Growth Opportunity',
            evidenceSnippet: sanitizeText(o.whyOpportunity) || 'Synthesized from on-page & competitor patterns'
          }
        }));

      // 4. Topic Clusters (Strictly Labeled as AI-Suggested Topic Clusters)
      const formattedClusters = (data.keywordClusters || []).map(cluster => ({
        primaryTopic: sanitizeText(cluster.primaryTopic) || 'Strategic Pillar',
        relatedKeywords: (cluster.relatedKeywords || []).map(k => sanitizeText(k)),
        existingPage: cluster.existingPage || '/',
        recommendedAction: cluster.recommendedAction || 'Optimize category page',
        badge: 'AI-SUGGESTED TOPIC CLUSTER',
        isAiGenerated: true,
        provenance: {
          provider: 'Gemini AI Topic Modeling',
          retrievedAt: now
        }
      }));

      // 5. Quick Wins (Strictly Labeled as AI-Suggested Quick Wins)
      const formattedQuickWins = (data.quickWins || []).map(qw => ({
        term: sanitizeText(qw.term),
        currentPosition: qw.currentPosition || 'Page 2-3',
        bestCompetitorPosition: qw.bestCompetitorPosition || 'Position 1-3',
        existingRankingPage: qw.existingRankingPage || '/',
        recommendedOptimization: qw.recommendedOptimization || 'Update metadata and content structure',
        badge: 'AI-SUGGESTED QUICK WIN',
        isAiGenerated: true
      }));

      console.log(`[Agent 3: OpportunityGap] ✅ Discovered ${formattedCompetitors.length} Competitors (${formattedGaps.length} Gaps, ${formattedOpps.length} AI Opps).`);

      return {
        success: true,
        competitors: formattedCompetitors,
        competitorGaps: formattedGaps,
        opportunityKeywords: formattedOpps,
        quickWins: formattedQuickWins,
        keywordClusters: formattedClusters
      };
    }
  } catch (err) {
    console.warn(`[Agent 3: OpportunityGap] Synthesis error: ${err.message}`);
  }

  return {
    success: true,
    competitors: [],
    competitorGaps: [],
    opportunityKeywords: [],
    quickWins: [],
    keywordClusters: [],
    message: 'Competitor gap and opportunity data unavailable'
  };
}

module.exports = {
  runOpportunityGapAgent
};
