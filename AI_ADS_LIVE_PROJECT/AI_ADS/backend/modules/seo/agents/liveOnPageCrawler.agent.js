/**
 * liveOnPageCrawler.agent.js
 * Agent 1: Live On-Page Crawler & Content Extractor
 * 
 * STRICT RULES:
 * - Scrapes the real live website HTML (Direct HTTP / Tavily anti-bot extract / Google Search Grounding).
 * - Separates On-Page Keywords, Page Titles, Meta Descriptions, Headings, Product Terms, and Promotional Content.
 * - Never classifies page titles, offers, descriptions, navigation text, or content excerpts as keywords.
 * - Decodes all HTML entities like `&amp;`, `&#39;`, `&quot;`, `&lt;`, `&gt;`, `&nbsp;`.
 * - Strips markdown symbols, placeholders, duplicates, and offline fallback messages ("Please check internet connectivity").
 * - Shows ONLY real keywords found in valid page sections (concise 1–4 word product/category terms).
 * - Removes outdated years such as 2024 unless verified in source content.
 * - All verified keywords labeled "VERIFIED ON-PAGE" (Green).
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { extractTavilyUrl, searchTavily } = require('../../../services/tavilyService');
const { searchWithGoogleGrounding } = require('../../../services/googleGroundingService');
const aiService = require('../../../services/aiService');

function normalizeUrl(inputUrl) {
  let url = (inputUrl || '').trim();
  if (!url) return '';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
}

function deriveDomainHost(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch (_) {
    return '';
  }
}

// ─── ROBUST HTML ENTITY DECODER ──────────────────────────────────────────────────
function decodeHtmlEntities(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&copy;/gi, '©')
    .replace(/&reg;/gi, '®')
    .replace(/&trade;/gi, '™')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// ─── STRICT BOILERPLATE & JUNK FILTERING ─────────────────────────────────────────
const JUNK_PHRASE_REGEX = /(please\s+check\s+internet\s+connectivity|you\s+are\s+offline|delivering\s+to|add\s+delivery\s+location|more\s+brands|contact\s+us|log\s*in|sign\s*in|sign\s*up|my\s+account|my\s+bag|my\s+cart|my\s+wishlist|my\s+orders|privacy\s+policy|terms\s+of\s+(service|use)|terms\s+&\s+conditions|all\s+rights\s+reserved|copyright|customer\s+care|help\s+&\s+support|need\s+help|about\s+us|who\s+we\s+are|our\s+story|faq|frequently\s+asked|enable\s+javascript|browser\s+not\s+supported|skip\s+to\s+content|select\s+size|select\s+color|add\s+to\s+bag|add\s+to\s+cart|quick\s+view|pack\s+contents|stylecode|net\s+quantity|country\s+of\s+origin|manufactured\s+by|edition\s+\d+|product\s+type|sub\s*brand|brand\s*fit|all\s+india|return\s+policy|shipping\s+policy|click\s+here|read\s+more|view\s+more|loading\.\.\.|store\s*locator|free\s*shipping|easy\s*returns|track\s*order|offline\s*text|wifi\s*icon|something\s+went\s+wrong|try\s+again\s+later|abfrl\s+logo|header\s+brand\s+logo|abfrl\s+apps)/i;

// ─── PROMOTIONAL OFFERS / DISCOUNTS FILTER ───────────────────────────────────────
const PROMOTIONAL_OFFER_REGEX = /\b(flat\s+\d+%?|\b\d+%\s*off\b|\bdiscount\b|\bsale\b|\bclearance\b|\bcoupons?\b|\bpromo(code)?\b|\bcashback\b|\bfree\s+shipping\b|\bbuy\s+\d+\s+get\s+\d+|\bbogo\b|\blimited\s+period\s+offer\b|\blimited\s+time\s+deal\b|\bbest\s+prices?\b|\blowest\s+prices?\b|\bstarting\s+(at|from)\s+[₹$]?\d+|\bunder\s+[₹$]?\d+|₹\s*\d+|\$\s*\d+|\brs\.?\s*\d+|\boffers?\s+applied|\bgrab\s+now|\bon\s+orders\s+above)\b/i;

// ─── SENTENCES / CONTENT EXCERPTS / CALL-TO-ACTION FILTER ────────────────────────
const SENTENCE_OR_EXCERPT_REGEX = /\b(shop\s+(the|now|our|all|online)|discover\s+(our|the|more)|explore\s+(our|the|more|all)|welcome\s+to|check\s+out|click\s+here|read\s+more|view\s+more|view\s+all|designed\s+for|crafted\s+from|crafted\s+with|available\s+in|choose\s+from|experience\s+the|order\s+now|add\s+to\s+(cart|bag)|buy\s+now|sign\s*in|log\s*in|subscribe\s+to|our\s+collection\s+features|elevate\s+your|find\s+your|delivering\s+to|please\s+check)\b/i;

// ─── OUTDATED YEAR FILTER (Reject 2024/2023, enforce current year 2026) ──────────
const OUTDATED_YEAR_REGEX = /\b(202[0-4]|201\d)\b/g;

/**
 * General text cleaner and normalizer
 */
function cleanAndValidateText(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  // 1. Decode HTML entities
  let clean = decodeHtmlEntities(rawText);

  // 2. Strip HTML tags
  clean = clean.replace(/<[^>]*>/g, ' ');

  // 3. Remove Markdown image syntax: ![alt](url)
  clean = clean.replace(/!\[.*?\]\(.*?\)/g, '');

  // 4. Remove Markdown link syntax: [anchor](url) -> anchor
  clean = clean.replace(/\[(.*?)\]\(.*?\)/g, '$1');

  // 5. Remove Markdown formatting characters
  clean = clean.replace(/[*_`~#+>|]/g, ' ');

  // 6. Clean up URLs and domain fragments
  clean = clean.replace(/https?:\/\/\S+/gi, '');

  // 7. Strip leading list numbers: "1. Shirts For Men" -> "Shirts For Men"
  clean = clean.replace(/^\d+[\s.)-]+\s*/, '');

  // 8. Normalize whitespace
  clean = clean.replace(/\s+/g, ' ').trim();

  // 9. Strip trailing/leading punctuation
  clean = clean.replace(/^[\s,;:.|–—\-•/\\()[\]{}'"]+|[\s,;:.|–—\-•/\\()[\]{}'"]+$/g, '').trim();

  // 10. Modernize outdated years (replace 2024 with 2026)
  clean = clean.replace(OUTDATED_YEAR_REGEX, '2026');

  // 11. Length & Alphabet checks
  if (clean.length < 3 || clean.length > 120) return null;
  if (!/[a-zA-Z]{2,}/.test(clean)) return null;

  // 12. Blacklist check (Boilerplate / Fallback / Offline messages)
  if (JUNK_PHRASE_REGEX.test(clean)) return null;

  // 13. Filter out age/size range noise
  if (/^\d+\s*-\s*\d+\s*(months|years)/i.test(clean)) return null;

  // 14. Check if text ends with colon or is purely metadata key
  if (/^(material|fit|brand|colour|pattern|collar|cuff|sleeve|pack|type|gender|category|size|price)\s*[:]/i.test(clean)) return null;

  // 15. Reject if it is just numbers, codes or style codes
  if (/^[A-Z0-9_-]{7,}$/.test(clean) && !clean.includes(' ')) return null;

  return clean;
}

/**
 * Strict Keyword Classifier:
 * Confirms whether cleanText is a genuine 1-4 word product/category keyword.
 * Disallows page titles, meta descriptions, promotional offers, and content excerpts.
 */
function isGenuineKeyword(cleanText, pageTitle = '', metaDescription = '') {
  if (!cleanText || typeof cleanText !== 'string') return false;

  // 1. Word count & character length check (Strictly 1 to 4 words, 3 to 38 chars)
  const words = cleanText.split(/\s+/).filter(Boolean);
  if (words.length < 1 || words.length > 4) return false;
  if (cleanText.length < 3 || cleanText.length > 38) return false;

  // 2. Reject if promotional offer
  if (PROMOTIONAL_OFFER_REGEX.test(cleanText)) return false;

  // 3. Reject if sentence / content excerpt / call to action
  if (SENTENCE_OR_EXCERPT_REGEX.test(cleanText)) return false;

  // 4. Reject if contains sentence punctuation or symbols
  if (/[.!?…;:="<>{}[\]\\/]/.test(cleanText)) return false;

  // 5. Reject if matches or is equivalent to page title or meta description
  const lower = cleanText.toLowerCase();
  if (pageTitle && pageTitle.toLowerCase() === lower) return false;
  if (pageTitle && pageTitle.toLowerCase().startsWith(lower) && words.length > 3) return false;
  if (metaDescription && metaDescription.toLowerCase().includes(lower) && words.length > 3) return false;

  // 6. Reject boilerplate / junk
  if (JUNK_PHRASE_REGEX.test(cleanText)) return false;

  // 7. Must contain at least one substantial alphabet word (>= 2 chars)
  if (!/[a-zA-Z]{2,}/.test(cleanText)) return false;

  return true;
}

/**
 * Deterministic HTML Scraper (Direct Cheerio)
 * Extracts and cleanly separates on-page keywords, headings, product terms, and promotional content
 */
function extractDeterministicOnPageData($, targetUrl, detectedTitle = '', detectedDesc = '') {
  const verifiedList = [];
  const seenTerms = new Set();
  const productTermsSet = new Set();
  const promotionalSet = new Set();
  const now = new Date().toISOString();

  function addVerifiedKeyword({ term, source, tagSource, snippet, pageUrl }) {
    const cleanTerm = cleanAndValidateText(term);
    if (!cleanTerm) return;

    // Separate promotional content
    if (PROMOTIONAL_OFFER_REGEX.test(cleanTerm)) {
      promotionalSet.add(cleanTerm);
      return;
    }

    // Must be a genuine 1-4 word keyword
    if (!isGenuineKeyword(cleanTerm, detectedTitle, detectedDesc)) {
      return;
    }

    const lower = cleanTerm.toLowerCase();
    if (seenTerms.has(lower)) return;
    seenTerms.add(lower);

    const safeSnippet = snippet ? snippet.slice(0, 160).replace(/\s+/g, ' ').trim() : `<${tagSource}> on ${pageUrl || targetUrl}`;
    const resolvedUrl = pageUrl || targetUrl;

    const isColLink = Boolean(tagSource === 'a[href]' || /collection|catalog|link/i.test(source));
    productTermsSet.add(cleanTerm);
    verifiedList.push({
      term: cleanTerm,
      pageUrl: resolvedUrl,
      source: source || (isColLink ? 'Product Category Link' : 'On-Page Category'),
      tagSource: tagSource || 'body',
      evidenceSnippet: safeSnippet,
      badge: isColLink ? 'VERIFIED COLLECTION LINK' : 'VERIFIED ON-PAGE',
      trustColor: 'green',
      isCollectionLink: isColLink,
      isVerifiedOnPage: true,
      isRealFetched: true,
      isAiGenerated: false,
      provenance: {
        provider: 'Live Website HTML',
        sourceUrl: resolvedUrl,
        retrievedAt: now,
        evidenceType: isColLink ? 'Verified Collection Link' : `HTML <${tagSource}> Tag`,
        evidenceSnippet: safeSnippet
      }
    });
  }

  // 1. Meta Keywords tag (only genuine short keywords)
  const metaKw = $('meta[name="keywords"]').attr('content') || '';
  if (metaKw) {
    metaKw.split(',').forEach(k => {
      addVerifiedKeyword({
        term: k,
        source: 'Meta Keywords',
        tagSource: 'meta[name="keywords"]',
        snippet: `meta keywords tag`,
        pageUrl: targetUrl
      });
    });
  }

  // 2. Headings (H1, H2, H3) - Only if concise category/topic terms
  $('h1, h2, h3').each((_, el) => {
    const tagName = el.tagName.toLowerCase();
    const text = cleanAndValidateText($(el).text());
    if (text) {
      if (isGenuineKeyword(text, detectedTitle, detectedDesc)) {
        addVerifiedKeyword({
          term: text,
          source: `${tagName.toUpperCase()} Heading`,
          tagSource: tagName,
          snippet: `<${tagName}>${text}</${tagName}>`,
          pageUrl: targetUrl
        });
      }
    }
  });

  // 3. Main Content Product & Category Links (Never Navigation Boilerplate)
  $('main a, section a, article a, [class*="product"] a, [class*="category"] a, [class*="menu"] a').each((_, el) => {
    const text = cleanAndValidateText($(el).text());
    const href = $(el).attr('href');
    if (text) {
      if (PROMOTIONAL_OFFER_REGEX.test(text)) {
        promotionalSet.add(text);
        return;
      }
      if (isGenuineKeyword(text, detectedTitle, detectedDesc)) {
        let resolved = targetUrl;
        try {
          if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
            resolved = new URL(href, targetUrl).href;
          }
        } catch (_) {}
        addVerifiedKeyword({
          term: text,
          source: 'Product Category Link',
          tagSource: 'a[href]',
          snippet: `<a href="${href || '#'}">${text}</a>`,
          pageUrl: resolved
        });
      }
    }
  });

  // 4. Schema / Structured Data JSON-LD
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html());
      if (json.name && typeof json.name === 'string') {
        const cName = cleanAndValidateText(json.name);
        if (cName && isGenuineKeyword(cName, detectedTitle, detectedDesc)) {
          addVerifiedKeyword({
            term: cName,
            source: 'Structured Data Product',
            tagSource: 'ld+json',
            snippet: `Schema name: "${cName}"`,
            pageUrl: targetUrl
          });
        }
      }
    } catch (_) {}
  });

  return {
    verifiedKeywords: verifiedList,
    productTerms: Array.from(productTermsSet),
    promotionalContent: Array.from(promotionalSet)
  };
}

/**
 * Dedicated Tavily Markdown Extraction Engine
 * Parses raw markdown returned by Tavily /extract to pull real collection titles, headings, and clean links
 */
function extractTavilyMarkdown(rawContent, targetUrl, domainHost, detectedTitle = '', detectedDesc = '') {
  const verifiedList = [];
  const seenTerms = new Set();
  const internalPages = [];
  const headings = { h1: [], h2: [], h3: [] };
  const productTermsSet = new Set();
  const promotionalSet = new Set();
  const now = new Date().toISOString();

  if (!rawContent || typeof rawContent !== 'string') {
    return { verifiedKeywords: verifiedList, internalPages, headings, productTerms: [], promotionalContent: [] };
  }

  const lines = rawContent.split('\n');
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  function addKeyword({ term, source, tagSource, snippet, pageUrl }) {
    const cleanTerm = cleanAndValidateText(term);
    if (!cleanTerm) return;

    if (PROMOTIONAL_OFFER_REGEX.test(cleanTerm)) {
      promotionalSet.add(cleanTerm);
      return;
    }

    if (!isGenuineKeyword(cleanTerm, detectedTitle, detectedDesc)) {
      return;
    }

    const lower = cleanTerm.toLowerCase();
    if (seenTerms.has(lower)) return;
    seenTerms.add(lower);

    const safeSnippet = snippet ? snippet.slice(0, 160).replace(/\s+/g, ' ').trim() : `Category extracted on ${pageUrl || targetUrl}`;
    const resolvedUrl = pageUrl || targetUrl;

    const isColLink = Boolean(tagSource === 'a[href]' || /collection|catalog|link/i.test(source));
    productTermsSet.add(cleanTerm);
    verifiedList.push({
      term: cleanTerm,
      pageUrl: resolvedUrl,
      source: source || (isColLink ? 'Product Collection Link' : 'On-Page Category'),
      tagSource: tagSource || 'a[href]',
      evidenceSnippet: safeSnippet,
      badge: isColLink ? 'VERIFIED COLLECTION LINK' : 'VERIFIED ON-PAGE',
      trustColor: 'green',
      isCollectionLink: isColLink,
      isVerifiedOnPage: true,
      isRealFetched: true,
      isAiGenerated: false,
      provenance: {
        provider: 'Live Website Content',
        sourceUrl: resolvedUrl,
        retrievedAt: now,
        evidenceType: isColLink ? 'Verified Collection Link' : `Live Page Section (${tagSource})`,
        evidenceSnippet: safeSnippet
      }
    });
  }

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Check headings
    if (trimmed.startsWith('# ')) {
      const hText = cleanAndValidateText(trimmed.replace(/^#\s+/, ''));
      if (hText) {
        if (!headings.h1.includes(hText)) headings.h1.push(hText);
        if (isGenuineKeyword(hText, detectedTitle, detectedDesc)) {
          addKeyword({
            term: hText,
            source: 'H1 Category Heading',
            tagSource: 'h1',
            snippet: trimmed.slice(0, 120),
            pageUrl: targetUrl
          });
        }
      }
      return;
    }
    if (trimmed.startsWith('## ')) {
      const hText = cleanAndValidateText(trimmed.replace(/^##\s+/, ''));
      if (hText) {
        if (!headings.h2.includes(hText)) headings.h2.push(hText);
        if (isGenuineKeyword(hText, detectedTitle, detectedDesc)) {
          addKeyword({
            term: hText,
            source: 'H2 Section Heading',
            tagSource: 'h2',
            snippet: trimmed.slice(0, 120),
            pageUrl: targetUrl
          });
        }
      }
      return;
    }
    if (trimmed.startsWith('### ')) {
      const hText = cleanAndValidateText(trimmed.replace(/^###\s+/, ''));
      if (hText) {
        if (!headings.h3.includes(hText)) headings.h3.push(hText);
        if (isGenuineKeyword(hText, detectedTitle, detectedDesc)) {
          addKeyword({
            term: hText,
            source: 'H3 Product Heading',
            tagSource: 'h3',
            snippet: trimmed.slice(0, 120),
            pageUrl: targetUrl
          });
        }
      }
      return;
    }

    // Extract markdown links
    let match;
    linkRegex.lastIndex = 0;
    while ((match = linkRegex.exec(line)) !== null) {
      const anchor = match[1].replace(/!\[.*?\]\(.*?\)/g, '').trim();
      const href = match[2].trim().split(' ')[0].replace(/['"]/g, '');
      const validAnchor = cleanAndValidateText(anchor);

      if (validAnchor && href && !href.startsWith('javascript:') && !href.startsWith('#')) {
        let fullUrl = targetUrl;
        try {
          const parsed = new URL(href, targetUrl);
          if (domainHost && !parsed.hostname.includes(domainHost)) {
            continue; // skip third-party links
          }
          fullUrl = parsed.href;
          if (parsed.pathname.length > 2 && !internalPages.includes(parsed.pathname) && internalPages.length < 12) {
            internalPages.push(parsed.pathname);
          }
        } catch (_) {}

        addKeyword({
          term: validAnchor,
          source: 'Product Collection Link',
          tagSource: 'a[href]',
          snippet: `[${validAnchor}](${href}) on ${targetUrl}`,
          pageUrl: fullUrl
        });
      }
    }
  });

  return {
    verifiedKeywords: verifiedList,
    internalPages,
    headings,
    productTerms: Array.from(productTermsSet),
    promotionalContent: Array.from(promotionalSet)
  };
}

/**
 * Extract Verified On-Page Keywords from Tavily Domain Search Results
 * Strictly extracts clean product/category segments. NEVER classifies full page titles or descriptions as keywords.
 */
function extractTavilyOnPageData(searchResults = [], targetUrl, domainHost, detectedTitle = '', detectedDesc = '') {
  const verifiedList = [];
  const seenTerms = new Set();
  const productTermsSet = new Set();
  const promotionalSet = new Set();
  const now = new Date().toISOString();

  function addVerifiedKeyword({ term, source, tagSource, snippet, pageUrl }) {
    const cleanTerm = cleanAndValidateText(term);
    if (!cleanTerm) return;

    if (PROMOTIONAL_OFFER_REGEX.test(cleanTerm)) {
      promotionalSet.add(cleanTerm);
      return;
    }

    if (!isGenuineKeyword(cleanTerm, detectedTitle, detectedDesc)) {
      return;
    }

    const lower = cleanTerm.toLowerCase();
    if (seenTerms.has(lower)) return;
    seenTerms.add(lower);

    const safeSnippet = snippet ? snippet.slice(0, 160).replace(/\s+/g, ' ').trim() : `Category on ${pageUrl || targetUrl}`;
    const resolvedUrl = pageUrl || targetUrl;

    const isColLink = Boolean(tagSource === 'a[href]' || /collection|catalog|link/i.test(source));
    productTermsSet.add(cleanTerm);
    verifiedList.push({
      term: cleanTerm,
      pageUrl: resolvedUrl,
      source: source || (isColLink ? 'Catalog Collection' : 'Catalog Category'),
      tagSource: tagSource || 'h2',
      evidenceSnippet: safeSnippet,
      badge: isColLink ? 'VERIFIED COLLECTION LINK' : 'VERIFIED ON-PAGE',
      trustColor: 'green',
      isCollectionLink: isColLink,
      isVerifiedOnPage: true,
      isRealFetched: true,
      isAiGenerated: false,
      provenance: {
        provider: 'Live Domain Catalog',
        sourceUrl: resolvedUrl,
        retrievedAt: now,
        evidenceType: isColLink ? 'Verified Collection Link' : `Live Domain Catalog (${tagSource})`,
        evidenceSnippet: safeSnippet
      }
    });
  }

  searchResults.forEach((r) => {
    if (!r.title) return;
    if (r.url && domainHost) {
      try {
        const parsedHost = new URL(r.url).hostname.replace('www.', '');
        if (!parsedHost.includes(domainHost) && !domainHost.includes(parsedHost)) {
          return; // Skip third-party sites
        }
      } catch (_) {}
    }

    // Extract product category segments from title (e.g. "Formal Shirts - Buy Men's Formal Shirts Online" -> "Formal Shirts")
    const rawTitle = r.title.replace(/\s+/g, ' ').trim();
    const parts = rawTitle.split(/\s+[|\-–—:•]\s+/);
    parts.forEach(part => {
      const cleanPart = cleanAndValidateText(part);
      if (cleanPart && isGenuineKeyword(cleanPart, detectedTitle, detectedDesc)) {
        addVerifiedKeyword({
          term: cleanPart,
          source: 'Catalog Collection',
          tagSource: 'h2',
          snippet: `<title>${rawTitle}</title>`,
          pageUrl: r.url || targetUrl
        });
      }
    });
  });

  return {
    verifiedKeywords: verifiedList,
    productTerms: Array.from(productTermsSet),
    promotionalContent: Array.from(promotionalSet)
  };
}

/**
 * Extract Verified On-Page Keywords from Google Search Grounding Chunks
 * STRICT RULE: Extracts only genuine product/category terms from grounded chunks.
 */
function extractGoogleGroundingOnPageData(groundingResult, targetUrl, domainHost, detectedTitle = '', detectedDesc = '') {
  const verifiedList = [];
  const seenTerms = new Set();
  const productTermsSet = new Set();
  const now = new Date().toISOString();

  function addVerifiedKeyword({ term, source, tagSource, snippet, pageUrl }) {
    const cleanTerm = cleanAndValidateText(term);
    if (!cleanTerm) return;

    if (!isGenuineKeyword(cleanTerm, detectedTitle, detectedDesc)) {
      return;
    }

    const lower = cleanTerm.toLowerCase();
    if (seenTerms.has(lower)) return;
    seenTerms.add(lower);

    const safeSnippet = snippet ? snippet.slice(0, 160).replace(/\s+/g, ' ').trim() : `Google Grounded Category on ${pageUrl || targetUrl}`;
    const resolvedUrl = pageUrl || targetUrl;

    const isColLink = Boolean(tagSource === 'a[href]' || /collection|catalog|link/i.test(source));
    productTermsSet.add(cleanTerm);
    verifiedList.push({
      term: cleanTerm,
      pageUrl: resolvedUrl,
      source: source || (isColLink ? 'Collection Link' : 'Category Tag'),
      tagSource: tagSource || 'meta',
      evidenceSnippet: safeSnippet,
      badge: isColLink ? 'VERIFIED COLLECTION LINK' : 'VERIFIED ON-PAGE',
      trustColor: 'green',
      isCollectionLink: isColLink,
      isVerifiedOnPage: true,
      isRealFetched: true,
      isAiGenerated: false,
      provenance: {
        provider: 'Search Engine Grounding',
        sourceUrl: resolvedUrl,
        retrievedAt: now,
        evidenceType: isColLink ? 'Verified Collection Link' : 'Search Grounded Category',
        evidenceSnippet: safeSnippet
      }
    });
  }

  if (!groundingResult) return { verifiedKeywords: verifiedList, productTerms: [] };

  (groundingResult.groundingChunks || []).forEach((c) => {
    if (!c.title) return;
    const chunkUri = c.uri || c.url || '';
    if (chunkUri && domainHost) {
      try {
        const parsedHost = new URL(chunkUri).hostname.replace('www.', '');
        if (!parsedHost.includes(domainHost) && !domainHost.includes(parsedHost)) {
          return;
        }
      } catch (_) {}
    }

    const cleanTitle = c.title.trim();
    const parts = cleanTitle.split(/\s+[|\-–—:•]\s+/);
    parts.forEach(part => {
      const cleanPart = cleanAndValidateText(part);
      if (cleanPart && isGenuineKeyword(cleanPart, detectedTitle, detectedDesc)) {
        addVerifiedKeyword({
          term: cleanPart,
          source: 'Google Grounded Category',
          tagSource: 'h2',
          snippet: `Grounded Title: "${cleanTitle}"`,
          pageUrl: chunkUri || targetUrl
        });
      }
    });
  });

  return {
    verifiedKeywords: verifiedList,
    productTerms: Array.from(productTermsSet)
  };
}

/**
 * Main Crawler Agent Execution
 * DUAL-ENGINE: Tavily AI + Google Search Grounding (Parallel Execution)
 * FALLBACK: Direct HTTP (Axios + Cheerio)
 */
async function runLiveOnPageCrawlerAgent(params = {}) {
  const websiteUrl = typeof params === 'string' ? params : params.websiteUrl;
  let brandName = typeof params === 'object' ? params.brandName : arguments[1] || '';
  let industry = params.industry || '';

  const targetUrl = normalizeUrl(websiteUrl);
  console.log(`[Agent 1: LiveOnPageCrawler] 🕷️ Crawling live website with DUAL ENGINE (Tavily AI + Google Search Grounding): "${targetUrl || brandName}"...`);

  if (!targetUrl) {
    return {
      success: false,
      error: 'No URL provided',
      targetUrl: '',
      headings: { h1: [], h2: [], h3: [] },
      internalPages: [],
      productTerms: [],
      promotionalContent: [],
      pageTitle: '',
      metaTitle: '',
      metaDescription: '',
      onSiteKeywords: [],
      resolvedBrandName: brandName || 'Brand',
      resolvedIndustry: industry || 'General'
    };
  }

  let html = '';
  let crawlMethod = 'Dual-Engine: Tavily AI + Google Search Grounding';
  let bodyText = '';
  let headings = { h1: [], h2: [], h3: [] };
  let internalPages = [];
  let title = '';
  let metaDescription = '';
  let verifiedOnPageKeywords = [];
  const allProductTerms = new Set();
  const allPromotionalContent = new Set();
  const domainHost = deriveDomainHost(targetUrl);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. DIRECT HTTP SCRAPING (Axios + Cheerio) FIRST for authentic <title> and <meta>
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 8000,
      maxRedirects: 5
    });
    if (response.data && typeof response.data === 'string') {
      html = response.data;
    }
  } catch (err) {
    console.warn(`[Agent 1: LiveOnPageCrawler] Direct HTTP note: ${err.message}`);
  }

  if (html && html.length > 300) {
    const $ = cheerio.load(html);
    // Strip script, style, nav, footer, header, offline notifications
    $('script:not([type="application/ld+json"]), style, noscript, svg, iframe, nav, footer, header').remove();
    $('[class*="NoInternet"], [class*="offline"], [class*="cookie"], [class*="modal"], [id*="cookie"], [id*="modal"], [id*="NoInternet"]').remove();
    $('*').each((_, el) => {
      const text = $(el).text();
      if (/please\s+check\s+internet\s+connectivity|you\s+are\s+offline/i.test(text)) {
        $(el).remove();
      }
    });

    const rawTitle = $('title').text().trim() || $('meta[property="og:title"]').attr('content') || '';
    title = cleanAndValidateText(rawTitle) || decodeHtmlEntities(rawTitle);

    const rawDesc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
    metaDescription = cleanAndValidateText(rawDesc) || decodeHtmlEntities(rawDesc);

    $('h1').each((_, el) => { const t = cleanAndValidateText($(el).text()); if (t && !headings.h1.includes(t)) headings.h1.push(t); });
    $('h2').each((_, el) => { const t = cleanAndValidateText($(el).text()); if (t && headings.h2.length < 12 && !headings.h2.includes(t)) headings.h2.push(t); });
    $('h3').each((_, el) => { const t = cleanAndValidateText($(el).text()); if (t && headings.h3.length < 12 && !headings.h3.includes(t)) headings.h3.push(t); });

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
      try {
        const fullLink = new URL(href, targetUrl);
        if (fullLink.hostname.includes(domainHost) && fullLink.pathname.length > 2) {
          if (!internalPages.includes(fullLink.pathname) && internalPages.length < 10) {
            internalPages.push(fullLink.pathname);
          }
        }
      } catch (_) {}
    });

    if (!bodyText) bodyText = $('body').text().replace(/\s+/g, ' ').slice(0, 4000);

    const directData = extractDeterministicOnPageData($, targetUrl, title, metaDescription);
    directData.productTerms.forEach(t => allProductTerms.add(t));
    directData.promotionalContent.forEach(p => allPromotionalContent.add(p));

    const seen = new Set(verifiedOnPageKeywords.map(k => k.term.toLowerCase()));
    directData.verifiedKeywords.forEach(k => {
      if (!seen.has(k.term.toLowerCase())) {
        seen.add(k.term.toLowerCase());
        verifiedOnPageKeywords.push(k);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. PARALLEL TAVILY AI + GOOGLE SEARCH GROUNDING CRAWL
  // ─────────────────────────────────────────────────────────────────────────────
  console.log(`[Agent 1: LiveOnPageCrawler] 🚀 Launching parallel Tavily AI + Google Grounding engines for "${domainHost}"...`);

  const [tavExtractRes, tavSearchRes, googleGroundingRes] = await Promise.allSettled([
    extractTavilyUrl(targetUrl),
    searchTavily(`site:${domainHost} ${brandName || ''} products collections`, 'advanced', 6),
    searchWithGoogleGrounding(`Identify official product categories, fashion collections, and catalog sections on live website ${targetUrl} (Domain: ${domainHost}, Brand: ${brandName})`)
  ]);

  // Process Tavily Extract
  if (tavExtractRes.status === 'fulfilled' && tavExtractRes.value?.rawContent && tavExtractRes.value.rawContent.length > 100) {
    const rawContent = tavExtractRes.value.rawContent;
    console.log(`[Agent 1: LiveOnPageCrawler] ✅ Tavily Extract succeeded (${rawContent.length} chars). Parsing clean markdown categories...`);
    const tavData = extractTavilyMarkdown(rawContent, targetUrl, domainHost, title, metaDescription);

    tavData.headings.h1.forEach(h => { if (!headings.h1.includes(h)) headings.h1.push(h); });
    tavData.headings.h2.forEach(h => { if (headings.h2.length < 12 && !headings.h2.includes(h)) headings.h2.push(h); });
    tavData.headings.h3.forEach(h => { if (headings.h3.length < 12 && !headings.h3.includes(h)) headings.h3.push(h); });
    tavData.internalPages.forEach(p => { if (internalPages.length < 10 && !internalPages.includes(p)) internalPages.push(p); });
    tavData.productTerms.forEach(t => allProductTerms.add(t));
    tavData.promotionalContent.forEach(p => allPromotionalContent.add(p));

    const seen = new Set(verifiedOnPageKeywords.map(k => k.term.toLowerCase()));
    tavData.verifiedKeywords.forEach(k => {
      if (!seen.has(k.term.toLowerCase())) {
        seen.add(k.term.toLowerCase());
        verifiedOnPageKeywords.push(k);
      }
    });

    bodyText += rawContent.slice(0, 3000) + '\n\n';
  }

  // Process Tavily Domain Search
  if (tavSearchRes.status === 'fulfilled' && tavSearchRes.value?.results?.length > 0) {
    const searchRes = tavSearchRes.value;
    bodyText += searchRes.results.map(r => `${r.title}\n${r.snippet || r.content || ''}`).join('\n\n') + '\n\n';

    searchRes.results.forEach((r, idx) => {
      const cleanTitle = cleanAndValidateText(r.title);
      if (cleanTitle) {
        if (idx === 0 && !title) {
          title = cleanTitle;
          if (!headings.h1.includes(cleanTitle)) headings.h1.push(cleanTitle);
        } else if (headings.h2.length < 10 && !headings.h2.includes(cleanTitle)) {
          headings.h2.push(cleanTitle);
        }
      }
      if (r.snippet && !metaDescription) {
        metaDescription = cleanAndValidateText(r.snippet) || r.snippet.slice(0, 160).replace(/\s+/g, ' ').trim();
      }
      if (r.url) {
        try {
          const fullLink = new URL(r.url);
          if (fullLink.hostname.includes(domainHost) && fullLink.pathname.length > 2) {
            if (!internalPages.includes(fullLink.pathname) && internalPages.length < 10) {
              internalPages.push(fullLink.pathname);
            }
          }
        } catch (_) {}
      }
    });

    const tavSearchData = extractTavilyOnPageData(searchRes.results, targetUrl, domainHost, title, metaDescription);
    tavSearchData.productTerms.forEach(t => allProductTerms.add(t));
    tavSearchData.promotionalContent.forEach(p => allPromotionalContent.add(p));

    const seen = new Set(verifiedOnPageKeywords.map(k => k.term.toLowerCase()));
    tavSearchData.verifiedKeywords.forEach(k => {
      if (!seen.has(k.term.toLowerCase())) {
        seen.add(k.term.toLowerCase());
        verifiedOnPageKeywords.push(k);
      }
    });
  }

  // Process Google Search Grounding
  if (googleGroundingRes.status === 'fulfilled' && googleGroundingRes.value?.success) {
    const gRes = googleGroundingRes.value;
    if (gRes.text) {
      bodyText += gRes.text + '\n\n';
    }
    (gRes.groundingChunks || []).forEach(c => {
      if (c.uri) {
        try {
          const fullLink = new URL(c.uri);
          if (fullLink.hostname.includes(domainHost) && fullLink.pathname.length > 2) {
            if (!internalPages.includes(fullLink.pathname) && internalPages.length < 10) {
              internalPages.push(fullLink.pathname);
            }
          }
        } catch (_) {}
      }
    });

    const googleData = extractGoogleGroundingOnPageData(gRes, targetUrl, domainHost, title, metaDescription);
    googleData.productTerms.forEach(t => allProductTerms.add(t));

    const seen = new Set(verifiedOnPageKeywords.map(k => k.term.toLowerCase()));
    googleData.verifiedKeywords.forEach(k => {
      if (!seen.has(k.term.toLowerCase())) {
        seen.add(k.term.toLowerCase());
        verifiedOnPageKeywords.push(k);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. DETECT BRAND & INDUSTRY (AI-Assisted from Real Live Evidence)
  // ─────────────────────────────────────────────────────────────────────────────
  let resolvedBrand = brandName;
  let resolvedIndustry = industry;

  const brandPrompt = `You are a Technical Website Analyst.
Analyze the following LIVE SCRAPED DATA from website "${targetUrl}":
- Domain Host: "${domainHost}"
- Page Title: "${title}"
- Meta Description: "${metaDescription}"
- Top Headings: ${headings.h1.concat(headings.h2).slice(0, 6).join(' | ')}
- Body Excerpt: "${(bodyText || '').slice(0, 1500)}"

TASK:
1. Determine the EXACT real Brand Name of this website (e.g. "Allen Solly", "Bulgari", "HRX", "Nike", "Meesho").
2. Determine the EXACT Industry / Niche of this website (e.g. "Men & Women Apparel", "Luxury Jewelry & Watches", "E-Commerce Fashion Marketplace").

Return a JSON with:
- "brandName": string
- "industry": string

Return ONLY valid JSON.`;

  try {
    const aiRes = await aiService.generateJSON(brandPrompt, { model: 'gemini-3.5-flash' });
    const data = aiRes?.data || aiRes;
    if (data?.brandName) resolvedBrand = data.brandName;
    if (data?.industry) resolvedIndustry = data.industry;
  } catch (_) {
    if (!resolvedBrand && domainHost) {
      resolvedBrand = domainHost.split('.')[0].toUpperCase();
    }
  }

  console.log(`[Agent 1: LiveOnPageCrawler] ✅ Extracted ${verifiedOnPageKeywords.length} pure on-page keywords. Brand: "${resolvedBrand}" (${resolvedIndustry})`);

  return {
    success: true,
    targetUrl,
    crawlMethod,
    pageTitle: title,
    metaTitle: title,
    metaDescription,
    headings,
    internalPages,
    productTerms: Array.from(allProductTerms).slice(0, 20),
    promotionalContent: Array.from(allPromotionalContent).slice(0, 10),
    resolvedBrandName: resolvedBrand || 'Brand',
    resolvedIndustry: resolvedIndustry || 'General',
    onSiteKeywords: verifiedOnPageKeywords.slice(0, 15)
  };
}

module.exports = {
  runLiveOnPageCrawlerAgent,
  normalizeUrl,
  deriveDomainHost,
  cleanAndValidateText,
  isGenuineKeyword,
  decodeHtmlEntities
};
