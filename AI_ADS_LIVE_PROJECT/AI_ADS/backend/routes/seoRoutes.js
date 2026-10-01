/**
 * SEO Intelligence Routes
 * AI-powered Multi-Agent keyword clustering, live website crawling, SERP rankings, and dynamic content generation
 */
const express = require('express');
const router = express.Router();
const {
  generateSeoBrief,
  generateKeywordClusters,
  regenerateSingleKeyword,
  generateBlogArticle,
  transformRepurposeContent
} = require('../modules/seo/vertex.service');

// Try to load Content model for saving briefs to DB
let Content = null;
try {
  Content = require('../models/Content');
} catch (e) {
  console.log('Content model not available for SEO brief persistence');
}

// ─── POST /api/seo/keywords/cluster ────────────────────────────────────────────
// Generate AI-powered keyword clusters (Live On-Site + Rankings + Opportunities)
router.post('/keywords/cluster', async (req, res) => {
  try {
    const {
      websiteUrl,
      domainUrl,
      seedKeyword,
      brandName,
      industry,
      contentPillars,
      existingBrandKeywords,
      competitorLandscape,
      positioningSummary,
      targetAudience,
      count
    } = req.body;

    console.log(`🔍 [SEO-ROUTES] Multi-Agent Audit request: "${seedKeyword || websiteUrl}" for brand "${brandName || 'Brand'}"`);

    const result = await generateKeywordClusters({
      websiteUrl: websiteUrl || domainUrl || '',
      seedKeyword: seedKeyword || '',
      brandName: brandName || 'Brand',
      industry: industry || 'General',
      contentPillars: contentPillars || [],
      existingBrandKeywords: existingBrandKeywords || [],
      competitorLandscape: competitorLandscape || [],
      positioningSummary: positioningSummary || '',
      targetAudience: targetAudience || 'Enterprise Leaders',
      count: count || 12
    });

    res.json(result);
  } catch (err) {
    console.error('SEO Keyword Cluster Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/seo/keywords/regenerate ─────────────────────────────────────────
// Regenerate a single keyword using AI
router.post('/keywords/regenerate', async (req, res) => {
  try {
    const { brandName, industry, seedKeyword, existingKeywords, targetAudience } = req.body;

    console.log(`🔄 SEO Single Keyword Regen for "${brandName || 'Brand'}"`);

    const result = await regenerateSingleKeyword({
      brandName: brandName || 'Brand',
      industry: industry || 'General',
      seedKeyword: seedKeyword || '',
      existingKeywords: existingKeywords || [],
      targetAudience: targetAudience || 'General Audience'
    });

    res.json(result);
  } catch (err) {
    console.error('SEO Keyword Regenerate Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/seo/brief/generate ──────────────────────────────────────────────
// Generate a comprehensive AI-powered SEO brief (Agent 4)
router.post('/brief/generate', async (req, res) => {
  try {
    const {
      primaryKeyword,
      keyword,
      industry,
      targetAudience,
      workspaceId,
      model,
      intent,
      brandName,
      contentPillars,
      brandVoice,
      learnedWebsiteMemory
    } = req.body;

    const kw = primaryKeyword || keyword;
    if (!kw) {
      return res.status(400).json({ success: false, error: 'primaryKeyword or keyword is required' });
    }

    console.log(`📝 SEO Brief generation: "${kw}" for brand "${brandName || 'Unknown'}"`);

    const brief = await generateSeoBrief({
      keyword: kw,
      intent: intent || 'Commercial',
      targetAudience: targetAudience || 'Enterprise Leaders',
      brandName: brandName || '',
      industry: industry || '',
      contentPillars: contentPillars || [],
      brandVoice: brandVoice || '',
      learnedWebsiteMemory: learnedWebsiteMemory || {}
    });

    // Persist to DB if Content model available
    if (Content) {
      try {
        await Content.create({
          title: brief.suggestedTitles?.[0] || kw,
          type: 'SEO_BRIEF',
          briefData: brief,
          author: `Multi-Agent SEO Engine`,
          status: 'APPROVED'
        });
        console.log(`🍃 SEO Brief Saved to MongoDB Atlas: "${brief.primaryKeyword}"`);
      } catch (dbErr) {
        console.log('SEO Brief DB Save Note:', dbErr.message);
      }
    }

    res.json({ success: true, brief });
  } catch (err) {
    console.error('SEO Brief Generation Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/seo/article/generate ────────────────────────────────────────────
// Generate a 100% Dynamic Real AI Blog Article
router.post('/article/generate', async (req, res) => {
  try {
    const { topic, brief, brandName, industry, brandVoice } = req.body;

    console.log(`✍️ [SEO-ROUTES] Generating 100% Real AI Blog Article for "${topic || brief?.primaryKeyword}"...`);

    const result = await generateBlogArticle({
      topic: topic || brief?.primaryKeyword || '',
      brief: brief || {},
      brandName: brandName || 'Brand',
      industry: industry || 'Technology',
      brandVoice: brandVoice || 'Authoritative & Actionable'
    });

    res.json(result);
  } catch (err) {
    console.error('SEO Article Generation Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/seo/repurpose ──────────────────────────────────────────────────
// Multi-Format Content Repurposing (LinkedIn, Twitter, Newsletter, Carousel)
router.post('/repurpose', async (req, res) => {
  try {
    const { title, content, brandName } = req.body;

    const result = await transformRepurposeContent({
      title: title || 'Strategic Growth',
      content: content || '',
      brandName: brandName || 'Brand'
    });

    res.json(result);
  } catch (err) {
    console.error('SEO Repurpose Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
