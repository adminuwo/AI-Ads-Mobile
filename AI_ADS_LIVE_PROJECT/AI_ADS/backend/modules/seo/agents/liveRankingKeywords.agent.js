/**
 * liveRankingKeywords.agent.js
 * Agent 2: Live SERP Ranking Verification Agent
 * 
 * STRICT RULES:
 * - Queries search engines (Google Search Grounding + Tavily AI domain search).
 * - Shows “Position #X” ONLY when Google Grounding provides verified search-result evidence and an actual position number.
 * - Never treats “Indexed Page”, “Found in SERP”, or domain crawl URLs as a ranking position.
 * - If ranking data is unavailable or unverified, shows “Ranking Unverified” instead of inventing a ranking.
 * - Do NOT call Position #5 “Top Rank”; use “Position #5” or “Top 10 Result”.
 * - Never shows “Market Dominant” when SERP rank is unverified.
 * - Sets search volume, keyword difficulty, and CPC to "Data unavailable".
 * - All verified SERP rankings labeled "VERIFIED SERP" (Blue); unverified labeled "RANKING UNVERIFIED" (Slate).
 */

const { searchTavily } = require('../../../services/tavilyService');
const { searchWithGoogleGrounding } = require('../../../services/googleGroundingService');
const aiService = require('../../../services/aiService');

function extractHost(url) {
  try {
    const clean = url.startsWith('http') ? url : `https://${url}`;
    return new URL(clean).hostname.replace('www.', '');
  } catch (_) {
    return '';
  }
}

const SYSTEM_OR_DOMAIN_QUERY_REGEX = /(search\s+ranking\s+report|keyword\s+positions?|ranking\s+report|seo\s+report|audit\s+report|visibility\s+report|grounding\s+search|site:|https?:\/\/|www\.)/i;

function isSystemOrDomainQuery(term, domainHost = '') {
  if (!term || typeof term !== 'string') return true;
  const clean = term.trim().toLowerCase();
  if (SYSTEM_OR_DOMAIN_QUERY_REGEX.test(clean)) return true;
  if (domainHost && clean.includes(domainHost.toLowerCase())) return true;
  if (/\.(com|in|org|net|co|io|store|shop|app)\b/i.test(clean)) return true;
  if (/^["'].*["']$/.test(clean) && (clean.includes('.') || clean.includes('/'))) return true;
  return false;
}

/**
 * Format and validate verified SERP position
 * STRICT RULES:
 * - Never outputs "Top Rank" for Position #5 or any position > 1.
 * - Never outputs "Market Dominant".
 * - Never treats "Indexed Page" or "Found in SERP" as a position.
 */
function formatVerifiedPosition(rawPosition) {
  if (!rawPosition || typeof rawPosition !== 'string') return 'Ranking Unverified';
  const clean = rawPosition.trim();

  // If unverified, unavailable, indexed, domain search index, ranges like 18-25, or crawled
  if (/unverified|unavailable|indexed|found in serp|site index|domain search index|crawled|estimated|\d+\s*[-–—]\s*\d+/i.test(clean)) {
    return 'Ranking Unverified';
  }

  // Extract position number
  const numMatch = clean.match(/#?(\d+)/);
  if (!numMatch) return 'Ranking Unverified';

  const posNum = parseInt(numMatch[1], 10);
  if (posNum <= 0 || posNum > 100) return 'Ranking Unverified';

  if (posNum === 1) return 'Verified Position #1';
  if (posNum === 2) return 'Verified Position #2';
  if (posNum === 3) return 'Verified Position #3';
  if (posNum === 5) return 'Verified Position #5 (Top 10 Result)'; // NEVER "Top Rank"
  if (posNum <= 10) return `Verified Position #${posNum} (Top 10 Result)`;
  return `Verified Position #${posNum}`;
}

/**
 * Main Live Ranking Keywords Agent Execution
 * DUAL-ENGINE: Google Search Grounding (Primary for Rank Evidence) + Tavily AI (Domain Discovery)
 */
async function runLiveRankingKeywordsAgent({ domainUrl = '', brandName = 'Brand', industry = '', onSiteKeywords = [] }) {
  const domainHost = extractHost(domainUrl) || (brandName.toLowerCase().replace(/\s+/g, '') + '.com');
  console.log(`[Agent 2: LiveRankingKeywords] 📈 [Dual-Engine] Querying live Google Grounding SERP evidence for "${domainHost}"...`);

  const cleanBrand = (brandName || '').replace(/["']/g, '');
  const now = new Date().toISOString();
  let tavilyIndexResults = [];
  let googleGroundingEvidence = '';
  let googleGroundedQueries = [];

  // ─────────────────────────────────────────────────────────────────────────────
  // DUAL-ENGINE PARALLEL FETCH:
  // 1. Google Search Grounding: Live Google Search queries to verify true ranking positions
  // 2. Tavily Search: Indexed landing pages on the domain
  // ─────────────────────────────────────────────────────────────────────────────
  const targetQueries = [
    cleanBrand,
    `${cleanBrand} official website`,
    `${cleanBrand} online shopping`
  ];
  const genuineOnPage = (onSiteKeywords || []).filter(k => k.term && !isSystemOrDomainQuery(k.term, domainHost));
  if (genuineOnPage.length > 0) {
    targetQueries.push(genuineOnPage[0].term);
  }

  const groundingPrompt = `Perform a live Google search to evaluate real organic search rankings for domain "${domainHost}" (Brand: "${cleanBrand}").
Queries to evaluate:
${targetQueries.map((q, idx) => `${idx + 1}. "${q}"`).join('\n')}

For each query:
- List the top 5 organic search results (Rank #1, #2, #3, #4, #5) with domain and URL.
- State explicitly if "${domainHost}" appears in the top 5 results and at which exact rank position (#1 to #5).
- If "${domainHost}" is not in the top 5 results, state explicitly: "${domainHost} is not ranking in the top 5 results for query [query]."
Do NOT guess, estimate, or invent rank positions. Only report verified ranks if "${domainHost}" is directly in the top search results.`;

  const [googleGroundingRes, tavilyRes] = await Promise.allSettled([
    searchWithGoogleGrounding(groundingPrompt),
    searchTavily(`site:${domainHost} ${cleanBrand}`, 'advanced', 6)
  ]);

  let groundingText = '';
  if (googleGroundingRes.status === 'fulfilled' && googleGroundingRes.value?.success) {
    const gRes = googleGroundingRes.value;
    googleGroundedQueries = gRes.webQueries || [];
    groundingText = gRes.text || '';
    const queries = googleGroundedQueries.map(q => `• Live Google Query: "${q}"`).join('\n');
    const chunks = (gRes.groundingChunks || []).slice(0, 8).map(c => `• Live Google Grounded Source: "${c.title}" (${c.domain || c.uri || ''})`).join('\n');
    googleGroundingEvidence = `VERIFIED GOOGLE SEARCH GROUNDING RESULTS:\n${queries}\n${chunks}\n${groundingText ? `Grounded Search Presence:\n${groundingText.slice(0, 2000)}` : ''}`;
    console.log(`[Agent 2: LiveRankingKeywords] ✅ Google Search Grounding returned ${googleGroundedQueries.length} verified search queries.`);
  }

  if (tavilyRes.status === 'fulfilled' && tavilyRes.value?.results?.length > 0) {
    tavilyIndexResults = tavilyRes.value.results.filter(r => r.url && r.url.includes(domainHost));
  }

  // If neither engine returned evidence
  if (!googleGroundingEvidence && tavilyIndexResults.length === 0) {
    console.log(`[Agent 2: LiveRankingKeywords] ℹ️ No SERP search evidence found for domain "${domainHost}".`);
    return {
      success: true,
      domainHost,
      rankingKeywords: [],
      message: 'No verified ranking data available'
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DETERMINISTIC GOOGLE GROUNDING RANK PARSER:
  // Extract strictly verified positions where domainHost was explicitly returned in top results
  // ─────────────────────────────────────────────────────────────────────────────
  const verifiedFromGrounding = new Map();
  if (groundingText) {
    const cleanHost = domainHost.toLowerCase().replace('www.', '');
    const absentRegex = /(not\s+ranking|not\s+found|unverified|no\s+verified|not\s+appear|absent)/i;
    const rankRegex = /(?:rank\s*#?|position\s*#?)\s*(\d+)[\s:.-]+([^\n]+)/gi;

    // Check each block
    const blocks = groundingText.split(/\n\s*\n/);
    blocks.forEach(block => {
      const bLower = block.toLowerCase();
      // If block explicitly states domain is not ranking or unverified
      if (bLower.includes(cleanHost) && absentRegex.test(bLower)) {
        return; // Not ranking
      }

      // Check for exact rank matches
      let match;
      rankRegex.lastIndex = 0;
      while ((match = rankRegex.exec(block)) !== null) {
        const posNum = parseInt(match[1], 10);
        const lineText = match[0].toLowerCase();
        if (lineText.includes(cleanHost) && !absentRegex.test(lineText)) {
          // Identify query
          const qMatch = block.match(/(?:query|search term|for\s+["'])([^"':\n]+)/i);
          const qTerm = qMatch ? qMatch[1].trim() : cleanBrand;
          verifiedFromGrounding.set(qTerm.toLowerCase(), `Position #${posNum}`);
        }
      }
    });
  }

  console.log(`[Agent 2: LiveRankingKeywords] 🔍 Grounding verification result: ${verifiedFromGrounding.size} verified rankings found for "${domainHost}".`);

  const indexEvidenceText = tavilyIndexResults.map((r, i) =>
    `[Indexed Page #${i + 1}] Title: "${r.title}" | URL: "${r.url}" | Status: Indexed Page (Ranking Unverified) | Snippet: "${(r.content || r.snippet || '').slice(0, 120)}"`
  ).join('\n');

  const onSiteTerms = (onSiteKeywords || []).map(k => k.term).slice(0, 6).join(', ');

  const prompt = `You are a Principal Google SERP Auditor adhering to strict verification standards.
Analyze the following LIVE SEARCH EVIDENCE for domain "${domainHost}" (${cleanBrand}):

${googleGroundingEvidence || 'No direct Google Grounding evidence available.'}

DOMAIN INDEX FOOTPRINT (INDEXED PAGES ONLY - NOT PROOF OF SERP RANK):
${indexEvidenceText || 'No secondary index data.'}

ON-SITE CONTEXT:
${onSiteTerms ? `Website catalog context: ${onSiteTerms}` : 'Brand domain'}

CRITICAL AUDIT RULES (STRICT COMPLIANCE REQUIRED):
1. "term":
   - MUST be a real consumer SEO search query that real people type into Google (e.g. "men formal shirts", "polo t shirts", "formal trousers", "allen solly clothing").
   - NEVER output system-generated queries such as "[domain] search ranking report", "[domain] keyword positions", or any query containing "search ranking report", "keyword positions", or "ranking report".
   - NEVER output domain-only searches (e.g. "${domainHost}", or searches consisting purely of the domain URL/hostname).
   - ONLY return queries that are genuine organic consumer search terms.
2. "rankingPosition":
   - If and ONLY if Google Search Grounding above explicitly verified an exact numerical ranking position for "${domainHost}" on Google, output "Position #X".
   - Otherwise, output EXACTLY "Ranking Unverified".
   - NEVER invent or guess rank positions. If not explicitly verified, it is ALWAYS "Ranking Unverified".
   - NEVER use the phrase "Market Dominant" anywhere.
3. "searchVolume": MUST be "Data unavailable". Do not invent numbers.
4. "keywordDifficulty": MUST be "Data unavailable". Do not invent metrics.
5. "cpc": MUST be "Data unavailable".
6. "searchIntent": "Navigational" | "Commercial" | "Transactional" | "Informational"

For each query return:
- "term": specific concise real consumer search query
- "rankingPosition": verified position (e.g. "Position #1") or "Ranking Unverified"
- "rankingUrl": landing page URL on domain "${domainHost}"
- "searchIntent": search intent category
- "strategicValue": 1 brief sentence on commercial/brand value

Return a JSON object with:
- "rankingKeywords": array of ranking keyword objects

Return ONLY valid JSON.`;

  try {
    const aiResult = await aiService.generateJSON(prompt, { model: 'gemini-3.5-flash' });
    const aiData = aiResult?.data || aiResult;

    if (Array.isArray(aiData?.rankingKeywords) && aiData.rankingKeywords.length > 0) {
      const verifiedRankings = aiData.rankingKeywords
        .filter(k => k.term && k.rankingUrl && !isSystemOrDomainQuery(k.term, domainHost))
        .map(k => {
          const lowerTerm = k.term.trim().toLowerCase();
          
          // STRICT RULE: A position is verified ONLY if our deterministic parser found it in Google Grounding
          const groundedPos = verifiedFromGrounding.get(lowerTerm);
          const isVerifiedSerp = Boolean(groundedPos);
          const posLabel = isVerifiedSerp ? groundedPos : 'Ranking Unverified';
          const finalIsVerified = isVerifiedSerp;

          // Clean strategic value: remove "Market Dominant" or "Top Rank" if unverified
          let safeStrategicValue = (k.strategicValue || '').replace(/market\s+dominant/gi, 'strong brand presence');
          if (!finalIsVerified) {
            safeStrategicValue = 'Indexed landing page on domain; search ranking position unverified.';
          }

          return {
            term: k.term.trim(),
            rankingPosition: posLabel,
            rankingUrl: k.rankingUrl.trim(),
            searchIntent: k.searchIntent || 'Commercial',
            searchVolume: 'Data unavailable',
            keywordDifficulty: 'Data unavailable',
            cpc: 'Data unavailable',
            strategicValue: safeStrategicValue,
            badge: finalIsVerified ? 'VERIFIED RANK' : 'RANKING UNVERIFIED',
            trustColor: finalIsVerified ? 'blue' : 'slate',
            isVerifiedSerp: finalIsVerified,
            isRealFetched: finalIsVerified,
            isAiGenerated: !finalIsVerified,
            source: 'ranking',
            provenance: {
              provider: finalIsVerified ? 'Google Organic Search' : 'Organic Search Index',
              sourceUrl: k.rankingUrl.trim(),
              retrievedAt: now,
              evidenceType: finalIsVerified ? 'Live Google Organic SERP Position' : 'Domain Index Footprint (Ranking Unverified)',
              evidenceSnippet: `Status: ${posLabel} | URL: ${k.rankingUrl.trim()}`
            }
          };
        });

      const verifiedCount = verifiedRankings.filter(k => k.isVerifiedSerp).length;
      console.log(`[Agent 2: LiveRankingKeywords] ✅ Evaluated ${verifiedRankings.length} keywords (${verifiedCount} verified SERP positions, ${verifiedRankings.length - verifiedCount} unverified indexed pages).`);
      return {
        success: true,
        domainHost,
        rankingKeywords: verifiedRankings,
        serpEvidenceCount: verifiedCount
      };
    }
  } catch (err) {
    console.warn(`[Agent 2: LiveRankingKeywords] Ranking extraction note: ${err.message}`);
  }

  return {
    success: true,
    domainHost,
    rankingKeywords: [],
    message: 'No verified ranking data available'
  };
}

module.exports = {
  runLiveRankingKeywordsAgent,
  formatVerifiedPosition
};
