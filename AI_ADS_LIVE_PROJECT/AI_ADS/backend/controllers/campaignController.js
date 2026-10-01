/**
 * Campaign Controller
 * Full CRUD + AI-powered campaign planning, post generation, and scheduling.
 */
const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const CampaignPost = require('../models/CampaignPost');
const Workspace = require('../models/Workspace');
const BrandProfile = require('../models/BrandProfile');
const { generate, generateJSON } = require('../services/aiService');
const { buildLanguageInstruction } = require('../utils/languageHelper');

// ─── Utility: Calculate Publishing Dates ─────────────────────────────────────
const calculatePublishingDates = (startDate, endDate, frequency) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];

  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const dates = [];
  const normalizedFreq = (frequency || '').trim().toLowerCase();

  if (normalizedFreq === 'daily') {
    for (let i = 0; i < diffDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
  } else if (normalizedFreq.endsWith('per week') || normalizedFreq === 'weekly') {
    let countPerWeek = 1;
    if (normalizedFreq.startsWith('2x')) countPerWeek = 2;
    else if (normalizedFreq.startsWith('3x')) countPerWeek = 3;
    else if (normalizedFreq.startsWith('4x')) countPerWeek = 4;
    else if (normalizedFreq.startsWith('5x')) countPerWeek = 5;

    let currentWeekStart = new Date(start);
    while (currentWeekStart <= end) {
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
      const actualEnd = currentWeekEnd > end ? end : currentWeekEnd;
      const daysInThisWeek = Math.ceil((actualEnd - currentWeekStart) / (1000 * 60 * 60 * 24)) + 1;
      const step = daysInThisWeek / countPerWeek;
      for (let i = 0; i < countPerWeek; i++) {
        const offset = Math.floor(i * step + step / 2);
        if (offset < daysInThisWeek) {
          const d = new Date(currentWeekStart);
          d.setDate(currentWeekStart.getDate() + offset);
          if (d <= end) dates.push(d);
        }
      }
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }
  } else if (normalizedFreq === 'bi weekly' || normalizedFreq === 'biweekly') {
    let current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 14);
    }
  } else if (normalizedFreq === 'monthly') {
    let current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
  } else {
    for (let i = 0; i < diffDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
  }

  // Unique dates only
  const seen = {};
  return dates.filter((d) => {
    const key = d.toISOString().split('T')[0];
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  }).sort((a, b) => a - b);
};

// ─── GET /api/campaigns ───────────────────────────────────────────────────────
exports.listCampaigns = async (req, res) => {
  try {
    const { workspaceId, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (workspaceId) filter.workspaceId = workspaceId;
    if (status) filter.status = status;

    const campaigns = await Campaign.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Campaign.countDocuments(filter);

    res.json({ success: true, campaigns, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET /api/campaigns/:id ───────────────────────────────────────────────────
exports.getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });
    res.json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── POST /api/campaigns ──────────────────────────────────────────────────────
exports.createCampaign = async (req, res) => {
  try {
    const {
      workspaceId,
      campaignName,
      campaignGoal,
      startDate,
      endDate,
      postingFrequency,
      platforms,
      budget,
      targetAudience,
    } = req.body;

    if (!workspaceId || !campaignName || !campaignGoal || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'workspaceId, campaignName, campaignGoal, startDate, endDate are required',
      });
    }

    const campaign = await Campaign.create({
      workspaceId,
      campaignName,
      campaignGoal,
      startDate,
      endDate,
      postingFrequency: postingFrequency || 'Daily',
      platforms: platforms || [],
      budget: budget || 0,
      targetAudience: targetAudience || '',
      status: 'Draft',
    });

    console.log(`✅ Campaign Created: "${campaignName}" (${campaign._id})`);
    res.json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── PUT /api/campaigns/:id ───────────────────────────────────────────────────
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });
    res.json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── DELETE /api/campaigns/:id ────────────────────────────────────────────────
exports.deleteCampaign = async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id);
    await CampaignPost.deleteMany({ campaignId: req.params.id });
    res.json({ success: true, message: 'Campaign and all posts deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── POST /api/campaigns/:id/generate-plan ────────────────────────────────────
// AI-powered campaign plan: creates posts for every scheduled date + platform.
// If strategyPlan (from the Strategy module's 30-day plan) is provided in the
// request body, it is used directly to map topics/platforms/pillars per date.
exports.generateCampaignPlan = async (req, res) => {
  try {
    try {
      require('../services/telemetryService').recordTelemetryEvent({
        source: 'USER', eventType: 'USER_ACTION', component: 'CampaignEngine', action: 'GENERATE_CALENDAR', page: '/calendar'
      });
    } catch (e) {}

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

    // Get brand profile for context
    let brandContext = '';
    try {
      const brand = await BrandProfile.findOne({ workspaceId: campaign.workspaceId });
      if (brand && brand.structuredIdentity) {
        brandContext = JSON.stringify(brand.structuredIdentity, null, 2);
      }
    } catch {}

    const dates = calculatePublishingDates(campaign.startDate, campaign.endDate, campaign.postingFrequency);
    const platforms = campaign.platforms.length > 0 ? campaign.platforms : ['instagram'];

    if (dates.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid posting dates calculated' });
    }

    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const CAMPAIGN_STAGES = ['Awareness', 'Consideration', 'Conversion', 'Retention'];
    const CONTENT_TYPES = ['Educational', 'Promotional', 'Engagement', 'Behind the Scenes', 'User Story', 'Product Spotlight'];

    // ─── STRATEGY PLAN MODE ────────────────────────────────────────────────────
    // If a 30-day strategy plan is provided (from the Strategy module),
    // use it directly to map topics, platforms, and pillars per posting date.
    const strategyPlan = req.body.strategyPlan; // Array of { day, title, topic, platform, pillar, action }

    if (strategyPlan && Array.isArray(strategyPlan) && strategyPlan.length > 0) {
      console.log(`[Campaign AI] Strategy-driven mode: mapping ${dates.length} dates from ${strategyPlan.length}-day strategy plan...`);

      // Delete existing posts for this campaign
      await CampaignPost.deleteMany({ campaignId: campaign._id });

      const postsToCreate = [];

      for (let i = 0; i < dates.length; i++) {
        const postDate = dates[i];
        const dayName = DAYS[postDate.getDay()];

        // Map each date to the corresponding strategy day (cycle if plan is shorter than dates)
        const strategyIndex = i % strategyPlan.length;
        const stratDay = strategyPlan[strategyIndex];

        // Determine platform: prefer strategy plan platform, fallback to campaign platforms
        let platform = (stratDay.platform || platforms[i % platforms.length] || 'Instagram').toLowerCase();
        // Normalize common platform names
        if (platform.includes('seo') || platform.includes('blog')) platform = 'blog';
        else if (platform.includes('linkedin')) platform = 'linkedin';
        else if (platform.includes('instagram') || platform.includes('reels')) platform = 'instagram';
        else if (platform.includes('email') || platform.includes('newsletter')) platform = 'email';
        else if (platform.includes('youtube') || platform.includes('video')) platform = 'youtube';
        else if (platform.includes('twitter') || platform.includes('x.com')) platform = 'twitter';

        // Determine campaign stage based on position in plan
        const stageIndex = Math.floor((i / dates.length) * CAMPAIGN_STAGES.length);
        const campaignStage = CAMPAIGN_STAGES[Math.min(stageIndex, CAMPAIGN_STAGES.length - 1)];

        // Build content type from pillar
        const pillar = stratDay.pillar || stratDay.topic || '';
        const contentType = pillar.toLowerCase().includes('educat') ? 'Educational'
          : pillar.toLowerCase().includes('promo') ? 'Promotional'
          : pillar.toLowerCase().includes('proof') || pillar.toLowerCase().includes('testimon') ? 'User Story'
          : pillar.toLowerCase().includes('behind') ? 'Behind the Scenes'
          : CONTENT_TYPES[i % CONTENT_TYPES.length];

        const postObjective = stratDay.action || stratDay.topic || stratDay.title || campaign.campaignGoal;
        const topic = stratDay.topic || stratDay.title || campaign.campaignName;

        postsToCreate.push({
          campaignId: campaign._id,
          workspaceId: campaign.workspaceId,
          date: postDate,
          day: dayName,
          platform,
          contentType,
          campaignStage,
          postObjective,
          prompt: `Create a ${platform} post about: ${topic}. Pillar: ${pillar}. Stage: ${campaignStage}.`,
          postType: platform === 'email' ? 'Email Copy' : platform === 'blog' ? 'Blog Post' : platform === 'youtube' ? 'Video' : platform === 'linkedin' ? 'Article' : 'Image',
          carouselImages: 0,
          postFor: pillar || 'Brand Awareness',
          imagePrompt: platform === 'email' ? null : `Professional ${platform} visual for: ${topic}`,
          captionPrompt: `Write a compelling ${platform} caption for: "${topic}". Focus on ${pillar}. Campaign stage: ${campaignStage}. Include relevant hashtags.`,
          status: 'Draft',
          bestPostingTime: platform === 'linkedin' ? '9:00 AM' : platform === 'instagram' ? '6:00 PM' : '10:00 AM',
        });
      }

      const createdPosts = await CampaignPost.insertMany(postsToCreate);

      await Campaign.findByIdAndUpdate(campaign._id, {
        totalPosts: createdPosts.length,
        status: 'Active',
        aiGeneratedStrategy: strategyPlan.slice(0, 3),
      });

      console.log(`✅ [Strategy-Driven] Generated ${createdPosts.length} posts for "${campaign.campaignName}" using strategy plan.`);
      return res.json({
        success: true,
        message: `Generated ${createdPosts.length} campaign posts from strategy plan`,
        posts: createdPosts,
        totalDates: dates.length,
        source: 'strategy_plan',
      });
    }

    // ─── GOAL-DRIVEN AI MODE ──────────────────────────────────────────────────
    // Every generated post must directly serve the user's campaign goal.
    const goalText = campaign.campaignGoal || 'Growth campaign';
    const prompt = `You are an elite performance marketing strategist. Your ONLY job is to create a content plan where EVERY SINGLE POST directly contributes to achieving this specific goal:

════════════════════════════════════════════
CAMPAIGN GOAL (THIS IS YOUR #1 PRIORITY):
"${goalText}"
════════════════════════════════════════════

Campaign Details:
- Name: ${campaign.campaignName}
- Duration: ${dates.length} days (${campaign.startDate} to ${campaign.endDate})
- Posting Frequency: ${campaign.postingFrequency}
- Platforms: ${platforms.join(', ')}
- Target Audience: ${campaign.targetAudience || 'General audience'}
- Budget: ${campaign.budget > 0 ? '₹' + campaign.budget : 'Organic-first'}

${brandContext ? 'Brand Identity:\n' + brandContext : ''}

GOAL ACHIEVEMENT FRAMEWORK — Structure the ${dates.length} posts across 4 progressive phases:
- Phase 1 (Days 1-${Math.ceil(dates.length*0.25)}): AWARENESS — Identify the problem/need that "${goalText}" solves. Hook the audience with pain points, questions, and curiosity.
- Phase 2 (Days ${Math.ceil(dates.length*0.25)+1}-${Math.ceil(dates.length*0.5)}): INTEREST — Demonstrate the solution. Show features, benefits, use cases, and how-tos that build desire.
- Phase 3 (Days ${Math.ceil(dates.length*0.5)+1}-${Math.ceil(dates.length*0.75)}): DESIRE — Social proof, results, testimonials, comparisons, and urgency that make the audience WANT to act.
- Phase 4 (Days ${Math.ceil(dates.length*0.75)+1}-${dates.length}): ACTION — Direct CTAs, limited offers, final push, success celebrations, and conversion-focused content.

CRITICAL RULES:
1. Every "postObjective" MUST describe a concrete step toward "${goalText}" — NOT generic marketing jargon.
2. Every "captionPrompt" MUST include a call-to-action that moves the audience closer to "${goalText}".
3. Every "imagePrompt" MUST visualize the outcome or journey of "${goalText}".
4. DO NOT generate generic posts like "Brand awareness" or "Industry trends". Every post must be laser-focused on "${goalText}".
5. NO video/reel content — only static images, carousels, text posts, blogs, and emails. Set "postType" strictly based on platform ("Email Copy", "Blog Post", "Article", "Image").

Generate a JSON array. Each entry:
{
  "date_index": 0,
  "platform": "instagram",
  "contentType": "Educational",
  "campaignStage": "Awareness",
  "postObjective": "SPECIFIC step toward achieving: ${goalText.substring(0, 60)}",
  "postType": "Image",
  "carouselImages": 0,
  "postFor": "Goal-aligned content pillar",
  "prompt": "specific AI image generation prompt tied to goal",
  "captionPrompt": "caption prompt with goal-specific CTA",
  "imagePrompt": "visual description showing goal outcome"
}

Create ${dates.length * platforms.length} total entries (one per date per platform). Make each post unique, specific, and directly serving "${goalText}".`;

    console.log(`[Campaign AI] Generating GOAL-DRIVEN plan for ${dates.length} dates × ${platforms.length} platforms | Goal: "${goalText}"`);
    let entries = null;

    const targetLang = req.body.languageCode || req.body.targetLanguage || req.body.language;
    const fullPrompt = prompt + '\n' + buildLanguageInstruction(targetLang);

    try {
      const aiResponse = await generateJSON(fullPrompt, { temperature: 0.8, targetLanguage: targetLang });
      entries = aiResponse?.data || (Array.isArray(aiResponse) ? aiResponse : null);
    } catch (aiErr) {
      console.warn('[Campaign AI] AI generation error, using goal-driven fallback generator:', aiErr.message);
    }

    // ─── GOAL-DRIVEN FALLBACK PLAN GENERATOR ─────────────────────────────────
    // When AI fails, construct a goal-aligned plan derived from the campaign goal.
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      console.log(`[Campaign AI] Constructing goal-driven fallback plan for ${dates.length} dates | Goal: "${goalText}"`);
      entries = [];

      // Derive goal-specific pillars from the campaign goal
      const goalPillars = [
        `Why ${campaign.campaignName} — Problem & Need`,
        `Key Features & Benefits of ${campaign.campaignName}`,
        `User Success Stories & Proof for ${campaign.campaignName}`,
        `How-To Guides & Tutorials for ${campaign.campaignName}`,
        `Special Offer & Direct CTA for ${goalText.substring(0, 50)}`,
      ];

      const goalObjectives = [
        `Introduce the problem that ${campaign.campaignName} solves to build awareness for: ${goalText}`,
        `Showcase specific features and benefits of ${campaign.campaignName} to drive interest toward: ${goalText}`,
        `Share user testimonials and results to build trust and desire for: ${goalText}`,
        `Provide actionable tips and guides to demonstrate value and support: ${goalText}`,
        `Present limited-time offer or direct CTA to convert audience for: ${goalText}`,
      ];

      for (let i = 0; i < dates.length; i++) {
        // Progressive campaign stage based on position
        const stageIndex = Math.floor((i / dates.length) * CAMPAIGN_STAGES.length);
        const stage = CAMPAIGN_STAGES[Math.min(stageIndex, CAMPAIGN_STAGES.length - 1)];
        const pillar = goalPillars[i % goalPillars.length];
        const objective = goalObjectives[i % goalObjectives.length];
        const contentType = CONTENT_TYPES[i % CONTENT_TYPES.length];

        for (let p = 0; p < platforms.length; p++) {
          const platform = (platforms[p] || 'instagram').toLowerCase();

          entries.push({
            date_index: i,
            platform,
            contentType,
            campaignStage: stage,
            postObjective: objective,
            postType: platform === 'email' ? 'Email Copy' : platform === 'blog' ? 'Blog Post' : platform === 'youtube' ? 'Video' : platform === 'linkedin' ? 'Article' : 'Image',
            carouselImages: 0,
            postFor: pillar,
            prompt: `Goal-focused ${platform} content for "${campaign.campaignName}". Goal: ${goalText}. Pillar: ${pillar}. Stage: ${stage}. This post must directly contribute to achieving the campaign goal.`,
            captionPrompt: `Write a compelling ${platform} caption for "${campaign.campaignName}" that directly supports the goal: "${goalText}". Focus on: ${pillar}. Stage: ${stage}. Include a strong CTA that moves the audience toward: ${goalText}. Add relevant hashtags.`,
            imagePrompt: `Professional, high-converting ${platform} visual for "${campaign.campaignName}" — showing the outcome of: ${goalText}. Pillar focus: ${pillar}. Modern, clean design.`,
          });
        }
      }
    }

    // Delete existing posts for this campaign
    try {
      await CampaignPost.deleteMany({ campaignId: campaign._id });
    } catch (dbErr) {
      console.warn('[Campaign AI] DB delete error:', dbErr.message);
    }

    // Create CampaignPost documents
    const postsToCreate = [];
    for (const entry of entries) {
      const dateIndex = typeof entry.date_index === 'number' ? entry.date_index : 0;
      const postDate = dates[dateIndex] || dates[0] || new Date();
      const dayName = DAYS[postDate.getDay()];

      const platform = (entry.platform || platforms[0] || 'instagram').toLowerCase();
      let determinedPostType = entry.postType || 'Image';
      if (platform === 'email') determinedPostType = 'Email Copy';
      else if (platform === 'blog') determinedPostType = 'Blog Post';
      else if (platform === 'youtube') determinedPostType = 'Video';
      else if (platform === 'linkedin') determinedPostType = 'Article';

      postsToCreate.push({
        campaignId: campaign._id,
        workspaceId: campaign.workspaceId,
        date: postDate,
        day: dayName,
        platform: platform,
        contentType: entry.contentType || CONTENT_TYPES[0],
        campaignStage: entry.campaignStage || CAMPAIGN_STAGES[0],
        postObjective: entry.postObjective || campaign.campaignGoal,
        prompt: entry.prompt || `Content plan for ${campaign.campaignName}`,
        postType: determinedPostType,
        carouselImages: entry.carouselImages || 0,
        postFor: entry.postFor || 'Brand Awareness',
        imagePrompt: entry.imagePrompt || `Visual for ${campaign.campaignName}`,
        captionPrompt: entry.captionPrompt || `Caption for ${campaign.campaignName}`,
        status: 'Draft',
        bestPostingTime: '10:00 AM',
      });
    }

    let createdPosts = [];
    try {
      createdPosts = await CampaignPost.insertMany(postsToCreate);
    } catch (dbErr) {
      console.warn('[Campaign AI] DB insertMany error, using memory fallback:', dbErr.message);
      createdPosts = postsToCreate.map((p, idx) => ({ ...p, _id: `cpost_${Date.now()}_${idx}` }));
    }

    // Update campaign stats
    try {
      await Campaign.findByIdAndUpdate(campaign._id, {
        totalPosts: createdPosts.length,
        aiGeneratedStrategy: entries.slice(0, 3),
        status: 'Active',
      });
    } catch (dbErr) {
      console.warn('[Campaign AI] Campaign update error:', dbErr.message);
    }

    console.log(`✅ Generated ${createdPosts.length} campaign posts for "${campaign.campaignName}"`);
    return res.json({
      success: true,
      message: `Generated ${createdPosts.length} campaign posts`,
      posts: createdPosts,
      totalDates: dates.length,
      totalPlatforms: platforms.length,
    });
  } catch (err) {
    console.error('[Campaign AI] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET /api/campaigns/:id/posts ─────────────────────────────────────────────
exports.getCampaignPosts = async (req, res) => {
  try {
    const { status, platform } = req.query;
    const filter = { campaignId: req.params.id };
    if (status) filter.status = status;
    if (platform) filter.platform = platform;

    const posts = await CampaignPost.find(filter).sort({ date: 1 });
    res.json({ success: true, posts, total: posts.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── POST /api/campaigns/posts/:postId/generate-content ───────────────────────
// Generate AI caption + image for a single campaign post
exports.generatePostContent = async (req, res) => {
  try {
    const post = await CampaignPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    const { includeImage = false } = req.body;

    // Build context from campaign + brand
    const campaign = await Campaign.findById(post.campaignId);
    let brandContext = '';
    try {
      const brand = await BrandProfile.findOne({ workspaceId: post.workspaceId });
      if (brand && brand.structuredIdentity) {
        brandContext = JSON.stringify(brand.structuredIdentity);
      }
    } catch {}

    // Generate caption
    const captionPrompt = post.captionPrompt || `Write a ${post.platform} caption for a ${post.contentType} post about ${post.postObjective}. 
Campaign: ${campaign?.campaignName || 'Brand Campaign'}. Stage: ${post.campaignStage}.
Include relevant hashtags. Make it engaging and platform-appropriate.
${brandContext ? `Brand context: ${brandContext}` : ''}
Return JSON: { "caption": "...", "hashtags": ["#tag1", "#tag2"], "cta": "..." }`;

    const captionResult = await generateJSON(captionPrompt, { temperature: 0.85 });

    const updateData = {
      caption: captionResult?.caption || '',
      hashtags: captionResult?.hashtags || [],
      cta: captionResult?.cta || '',
      status: 'Generated',
    };

    // TODO: When image generation service is connected, generate image here
    // For now we mark as generated and return placeholder
    if ((post.platform || '').toLowerCase() === 'email') {
      updateData.generatedImage = null;
    } else if (includeImage && post.imagePrompt) {
      updateData.generatedImage = `https://picsum.photos/seed/${post._id}/800/800`;
    }

    const updatedPost = await CampaignPost.findByIdAndUpdate(req.params.postId, updateData, { returnDocument: 'after' });
    res.json({ success: true, post: updatedPost });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── PUT /api/campaigns/posts/:postId ───────────────────────────────────────
exports.updatePost = async (req, res) => {
  try {
    const post = await CampaignPost.findByIdAndUpdate(
      req.params.postId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── PATCH /api/campaigns/posts/:postId/status ────────────────────────────────
exports.updatePostStatus = async (req, res) => {
  try {
    const { status, approvalStatus, notes } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (approvalStatus) updateData.approvalStatus = approvalStatus;
    if (notes) updateData.notes = notes;

    const post = await CampaignPost.findByIdAndUpdate(req.params.postId, updateData, { returnDocument: 'after' });
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── POST /api/campaigns/dates/calculate ──────────────────────────────────────
exports.calculateDates = async (req, res) => {
  try {
    const { startDate, endDate, postingFrequency } = req.body;
    if (!startDate || !endDate || !postingFrequency) {
      return res.status(400).json({ success: false, error: 'startDate, endDate, and postingFrequency are required' });
    }
    const dates = calculatePublishingDates(startDate, endDate, postingFrequency);
    res.json({ success: true, dates: dates.map((d) => d.toISOString().split('T')[0]), count: dates.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── POST /api/campaigns/:id/generate-strategy ───────────────────────────────
exports.generateCampaignStrategy = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

    let workspace = null;
    let brandProfile = null;
    if (mongoose.Types.ObjectId.isValid(campaign.workspaceId)) {
      workspace = await Workspace.findById(campaign.workspaceId);
      brandProfile = await BrandProfile.findOne({ workspaceId: campaign.workspaceId });
    }

    const brandName = workspace?.brandName || brandProfile?.companyName || 'Our Brand';
    const industry = workspace?.industryCategory || brandProfile?.structuredIdentity?.industry || 'Consumer & Enterprise';
    const tagline = workspace?.tagline || brandProfile?.structuredIdentity?.tagline || '';
    const positioning = workspace?.positioningSummary || brandProfile?.structuredIdentity?.positioning || '';
    const mission = workspace?.missionStatement || brandProfile?.structuredIdentity?.mission || '';
    const pillars = (workspace?.contentPillars && workspace.contentPillars.length > 0)
      ? workspace.contentPillars
      : brandProfile?.structuredIdentity?.content_angles || ['Brand Value', 'Product Innovation', 'Customer Proof', 'Industry Trends'];
    const audienceStr = campaign.targetAudience || (workspace?.targetAudience || []).join(', ') || 'Target buyers & consumers';
    const platforms = campaign.platforms && campaign.platforms.length > 0 ? campaign.platforms : ['Instagram', 'LinkedIn', 'SEO Blog', 'Email'];

    // Fetch existing posts of this campaign to use as foundation for strategy enhancement
    const existingPosts = await CampaignPost.find({ campaignId: campaign._id }).sort({ date: 1, createdAt: 1 });
    const campaignPostTopics = (existingPosts || []).map((p, idx) => {
      const topicTitle = p.postObjective || p.topic || p.postFor || `Post ${idx + 1}`;
      const plat = p.platform || platforms[idx % platforms.length];
      const stage = p.campaignStage || 'Awareness';
      const pillar = p.postFor || p.contentType || 'General';
      return {
        day: idx + 1,
        topic: topicTitle,
        platform: plat,
        stage,
        pillar,
        prompt: p.prompt || p.captionPrompt || null,
        action: p.prompt || p.captionPrompt || null,
      };
    });

    console.log(`[Strategy Engine] Generating GEO, SEO & GTM Strategy for: "${campaign.campaignName}" (${brandName}) with ${campaignPostTopics.length} campaign topics...`);

    const existingPostsContext = campaignPostTopics.length > 0 ? `
═══════════════════════════════════════════════════════
EXISTING CAMPAIGN PLAN TOPICS (FOUNDATION TO ENHANCE):
The user has generated this scheduled content plan:
${campaignPostTopics.slice(0, 30).map(t => `- Day ${t.day}: [${t.platform}] "${t.topic}" (Pillar: ${t.pillar}, Stage: ${t.stage})`).join('\n')}

MANDATORY DIRECTIVE FOR ENHANCEMENT:
1. DO NOT just repeat raw titles! Take each campaign topic and ENHANCE it into a rich, high-converting strategic execution directive for content creators.
2. For every day, generate a catchy strategic topic title, scroll-stopping hook angle, visual graphic guidelines, target SEO keywords, regional GEO target, and GTM stage alignment.
═══════════════════════════════════════════════════════` : '';

    const safeGoal = (campaign.campaignGoal || 'Growth campaign').replace(/"/g, "'");
    const safeName = (campaign.campaignName || 'Campaign').replace(/"/g, "'");

    const prompt = `You are a World-Class Chief Marketing Officer (CMO), Go-To-Market (GTM) Architect, and Master SEO & GEO-Targeting Strategist.
Your MISSION is to synthesize the ultimate 30-day Marketing Strategy integrating GTM (Go-To-Market), SEO (Search Engine Optimization), and GEO (Geotargeting) to achieve this goal:

════════════════════════════════════════════════════════
CAMPAIGN GOAL:
"${safeGoal}"
════════════════════════════════════════════════════════

CAMPAIGN DETAILS:
- Campaign Name: "${safeName}"
- Target Platforms: ${platforms.join(', ')}
- Target Audience: ${audienceStr}
- Posting Frequency: ${campaign.postingFrequency || 'Daily'}
- Budget: ${campaign.budget ? '₹' + campaign.budget : 'Optimized Organic + Paid split'}
${existingPostsContext}

BRAND CONTEXT:
- Brand: "${brandName}" (${industry})
- Tagline: "${tagline}"
- Positioning: "${positioning}"
- Mission: "${mission}"
- Content Pillars: ${pillars.join(', ')}

CORE STRATEGY REQUIREMENTS (MUST BE DRIVEN BY THE PLAN TOPICS):
1. GTM (Go-To-Market) Strategy:
   - Target ICP & buying triggers for audiences who need the topics in the plan.
   - Core value proposition & positioning.
   - 4-Phase GTM rollout mapped directly to Week 1 (Market Seeding & Pain Point Agitation), Week 2 (Solution Validation & Product Demo), Week 3 (Social Proof & Authority), Week 4 (Conversion Sprint & Closing).
   - Activation milestones and organic growth loops.
2. SEO (Search Engine Optimization) Strategy:
   - High-intent primary keywords and long-tail keywords extracted directly from the plan's topics.
   - Search intent distribution (Informational %, Commercial %, Transactional %) with clear mapping to the plan.
   - Topic cluster blueprint organizing the plan's topics into authoritative pillar clusters.
   - On-page title, meta, and schema directives.
3. GEO (Geotargeting) Strategy:
   - Priority geographic markets / regional hubs where demand for these topics and this goal is highest.
   - Regional messaging hooks adapting the plan's topics for regional pain points and localized search/social interest.
   - Geo-distribution tactics for local ad targeting, regional hashtags, and localized landing pages.
4. 30-Day Plan ("thirtyDayPlan"):
   - Contains 30 daily items corresponding to the campaign's scheduled topics.
   - For each day:
     * "day": 1-30
     * "topic": EXACT topic from the campaign plan
     * "platform": Scheduled platform
     * "stage": Funnel stage
     * "pillar": Content pillar
     * "gtmStage": GTM rollout phase (e.g. "Phase 1: Market Seeding", "Phase 2: Solution Proof", etc.)
     * "seoKeywords": Target search phrases for this topic
     * "geoTarget": Geographic focus or regional hook for this topic
     * "actionItem": Precise creative execution directive

Return a JSON object with this exact structure:
{
  "businessGoal": "${safeGoal}",
  "leadMagnet": "Specific incentive that directly drives ${safeGoal}",
  "primaryCta": "Direct action CTA that fulfills ${safeGoal}",
  "postingFrequency": "${campaign.postingFrequency || 'Daily'}",
  "budgetSuggestions": "Strategic budget breakdown specifically to achieve ${safeGoal}",
  "bestPlatforms": ${JSON.stringify(platforms)},
  "contentPillars": ["Goal-specific pillar 1", "Goal-specific pillar 2", "Goal-specific pillar 3", "Goal-specific pillar 4"],
  "channelMix": [
    { "label": "${platforms[0] || 'Instagram'}", "pct": 40, "icon": "Instagram" },
    { "label": "${platforms[1] || 'LinkedIn'}", "pct": 30, "icon": "Linkedin" },
    { "label": "${platforms[2] || 'YouTube'}", "pct": 20, "icon": "Globe" },
    { "label": "${platforms[3] || 'Email'}", "pct": 10, "icon": "Mail" }
  ],
  "audience": [
    "Persona 1: Specific demographic with buying trigger tied to ${safeGoal}",
    "Persona 2: Specific demographic with buying trigger tied to ${safeGoal}"
  ],
  "funnel": {
    "awareness": "Top-of-funnel strategy to surface the need for ${safeGoal}",
    "nurturing": "Mid-funnel demonstration and proof that builds desire for ${safeGoal}",
    "conversion": "Bottom-funnel conversion tactics to complete ${safeGoal}"
  },
  "gtmStrategy": {
    "targetIcp": "Detailed ICP definition aligned with the plan's topics",
    "valuePositioning": "Strategic value proposition and market differentiation",
    "launchPhases": [
      { "phase": "Phase 1: Market Seeding", "focus": "Week 1 Problem Awareness topics", "kpi": "Reach & impressions" },
      { "phase": "Phase 2: Solution Proof", "focus": "Week 2 Solution Showcase topics", "kpi": "Product interest & engagement" },
      { "phase": "Phase 3: Authority & Trust", "focus": "Week 3 Social Proof topics", "kpi": "Downloads & trial signups" },
      { "phase": "Phase 4: Conversion Sprint", "focus": "Week 4 Urgent Conversion topics", "kpi": "Direct conversions for ${safeGoal}" }
    ],
    "activationMilestones": [
      "Milestone 1: 5,000+ targeted reach on problem-awareness topics",
      "Milestone 2: 250+ engagements on feature and use-case deep dives",
      "Milestone 3: High conversion velocity on lead magnet and primary CTA"
    ],
    "growthLoops": "Viral or user-referral mechanism built around the plan's outcomes"
  },
  "seoStrategy": {
    "primaryKeywords": ["Keyword 1", "Keyword 2", "Keyword 3", "Keyword 4", "Keyword 5"],
    "longTailKeywords": ["Long tail query 1", "Long tail query 2", "Long tail query 3"],
    "searchIntentMix": [
      { "intent": "Informational", "percentage": 45, "description": "Problem-awareness guides and educational topics" },
      { "intent": "Commercial", "percentage": 35, "description": "Solution comparison, features, and use-case evaluation" },
      { "intent": "Transactional", "percentage": 20, "description": "Direct signup, download, and purchase search queries" }
    ],
    "contentClusters": [
      { "pillarTopic": "Core Pillar 1", "clusterArticles": ["Topic from plan 1", "Topic from plan 2"] },
      { "pillarTopic": "Core Pillar 2", "clusterArticles": ["Topic from plan 3", "Topic from plan 4"] }
    ],
    "onPageDirectives": "Actionable SEO guidance on page titles, meta descriptions, and schema markup"
  },
  "geoStrategy": {
    "priorityRegions": ["Top Regional Hub 1", "Top Regional Hub 2", "Top Regional Hub 3"],
    "regionalHooks": [
      { "region": "Region 1", "hook": "Localized angle tied to topic 1" },
      { "region": "Region 2", "hook": "Localized angle tied to topic 2" }
    ],
    "geoDistributionTactics": "Geo-fenced social advertising, localized keywords, and city-targeted community seeding"
  },
  "campaignIdeas": [
    { "title": "Goal-specific campaign concept 1", "desc": "How it drives ${safeGoal}" },
    { "title": "Goal-specific campaign concept 2", "desc": "How it drives ${safeGoal}" },
    { "title": "Goal-specific campaign concept 3", "desc": "How it drives ${safeGoal}" }
  ],
  "thirtyDayPlan": [
    {
      "day": 1,
      "platform": "${platforms[0] || 'Instagram'}",
      "topic": "${campaignPostTopics[0]?.topic || 'SPECIFIC content topic that serves: ' + safeGoal.substring(0, 40)}",
      "pillar": "${campaignPostTopics[0]?.pillar || pillars[0] || 'Problem Awareness'}",
      "gtmStage": "Phase 1: Market Seeding",
      "seoKeywords": "Target search phrase for this topic",
      "geoTarget": "Priority Metro / Regional Focus",
      "actionItem": "Specific creative directive for content creators"
    }
  ]
}

Ensure "thirtyDayPlan" contains 30 distinct daily items from day 1 to 30. Every topic must be a concrete, actionable content idea serving "${safeGoal}".
Return ONLY valid JSON.`;

    let strategy = null;
    try {
      const aiResponse = await generateJSON(prompt, { temperature: 0.7 });
      strategy = aiResponse?.data || (aiResponse && typeof aiResponse === 'object' && !aiResponse.data ? aiResponse : null);
    } catch (aiErr) {
      console.warn('[Strategy Engine] Campaign AI strategy synthesis error, generating fallback:', aiErr.message);
    }

    // Helper functions for deriving GEO, SEO, and GTM from topics
    const cleanWords = (text) => {
      if (!text) return [];
      return text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !['with', 'from', 'your', 'this', 'that', 'have', 'more', 'about', 'into', 'than', 'them', 'their'].includes(w));
    };

    const deriveSeoKeywordsForTopic = (topic, bName, ind) => {
      const words = cleanWords(topic);
      const topWords = words.slice(0, 3).join(' ');
      if (topWords) return `${topWords} | ${bName} ${ind}`;
      return `${bName} ${ind} solutions`;
    };

    const getGeoForDay = (idx) => {
      const geos = [
        'Tier-1 Metros (Delhi NCR, Mumbai, Bengaluru)',
        'Tech & Startup Hubs (Bengaluru, Hyderabad, Pune)',
        'Key Commercial Centers (Mumbai, Ahmedabad, Kolkata)',
        'Fast-Growth Regional Markets (Chennai, Jaipur, Chandigarh)',
        'National Digital Audience (Pan-India High-Intent)'
      ];
      return geos[idx % geos.length];
    };

    const getGtmStageForDay = (idx) => {
      if (idx < 7) return 'Phase 1: Market Seeding & Problem Awareness';
      if (idx < 14) return 'Phase 2: Solution Validation & Value Showcase';
      if (idx < 21) return 'Phase 3: Authority, Social Proof & Trust Building';
      return 'Phase 4: High-Urgency Conversion Sprint';
    };

    const buildEnhancedActionItem = (topic, platform, pillar, gtmStage, seoKeywords, geoTarget, brandName, goal) => {
      const cleanTopic = (topic || '').replace(/^Day\s+\d+:\s*/i, '');
      const p = platform || 'Social';
      return `[${p} | ${gtmStage || 'Growth Phase'}] Creative Brief: Publish a high-converting ${p} post on "${cleanTopic}". ` +
             `Hook Angle: Emphasize ${pillar || 'core features'} differentiators to engage audience in ${geoTarget || 'target market'}. ` +
             `SEO Directive: Optimize caption and metadata for '${seoKeywords || brandName}'. ` +
             `Conversion Goal: Include direct call-to-action driving toward ${goal || 'campaign objective'}.`;
    };

    if (!strategy || !Array.isArray(strategy.thirtyDayPlan) || strategy.thirtyDayPlan.length < 10) {
      const fallbackGoal = campaign.campaignGoal || 'Growth campaign';

      // Goal-driven topic templates for each week phase
      const weekPhases = [
        { phase: 'Problem Awareness', topics: [
          `The #1 challenge ${campaign.campaignName} solves — why your audience needs this now`,
          `${audienceStr}: Are you facing this problem? Here's what most people miss`,
          `Industry data: Why ${fallbackGoal} matters more than ever in ${industry}`,
          `Common mistakes that prevent people from achieving: ${fallbackGoal}`,
          `"Before vs After" — Life without vs with ${campaign.campaignName}`,
          `Quiz/Poll: How close are you to ${fallbackGoal}? Take this quick assessment`,
          `Expert breakdown: The hidden cost of NOT pursuing ${fallbackGoal}`,
        ]},
        { phase: 'Solution Showcase', topics: [
          `How ${campaign.campaignName} directly delivers: ${fallbackGoal} — Feature spotlight`,
          `Step-by-step guide: Getting started with ${campaign.campaignName}`,
          `Top 5 features of ${campaign.campaignName} that drive ${fallbackGoal}`,
          `Behind the scenes: How ${brandName} built ${campaign.campaignName} for real results`,
          `Demo day: Watch ${campaign.campaignName} in action — achieving ${fallbackGoal}`,
          `FAQ answered: Everything about ${campaign.campaignName} for ${fallbackGoal}`,
          `Comparison: ${campaign.campaignName} vs alternatives for ${fallbackGoal}`,
        ]},
        { phase: 'Social Proof & Urgency', topics: [
          `Real results: How users achieved ${fallbackGoal} with ${campaign.campaignName}`,
          `Testimonial spotlight: "${campaign.campaignName} changed everything for us"`,
          `Case study: From zero to ${fallbackGoal} in 30 days with ${brandName}`,
          `Numbers don't lie: ${campaign.campaignName} impact metrics and milestones`,
          `User-generated content: The ${campaign.campaignName} community speaks`,
          `Limited time: Special offer to accelerate your ${fallbackGoal} journey`,
          `Social proof roundup: Why ${audienceStr} are choosing ${campaign.campaignName}`,
        ]},
        { phase: 'Conversion Sprint', topics: [
          `Last chance: Exclusive offer to kickstart ${fallbackGoal} with ${campaign.campaignName}`,
          `Your personalized roadmap to ${fallbackGoal} — Start with ${campaign.campaignName} today`,
          `Countdown: Only X days left to join the ${campaign.campaignName} movement`,
          `Success blueprint: Your 7-day quick-start plan for ${fallbackGoal}`,
          `Final push: Everything you need to know before committing to ${fallbackGoal}`,
          `Celebration post: Join the community who achieved ${fallbackGoal} with ${brandName}`,
          `What's next: Your ${fallbackGoal} journey continues — here's the roadmap ahead`,
          `Recap & CTA: 30 days of value — now it's your turn to achieve ${fallbackGoal}`,
          `Bonus content: Advanced strategies for maximizing ${fallbackGoal} results`,
        ]},
      ];

      const fallbackPlan = Array.from({ length: 30 }, (_, i) => {
        const day = i + 1;
        const matchingPost = campaignPostTopics[i];

        const weekIndex = Math.min(Math.floor(i / 7), weekPhases.length - 1);
        const phase = weekPhases[weekIndex];
        const topicIndex = i % phase.topics.length;

        const topicName = matchingPost?.topic || phase.topics[topicIndex];
        const pillar = matchingPost?.pillar || phase.phase;
        const platform = matchingPost?.platform || platforms[i % platforms.length];
        const gtmStage = getGtmStageForDay(i);
        const seoKeywords = deriveSeoKeywordsForTopic(topicName, brandName, industry);
        const geoTarget = getGeoForDay(i);

        return {
          day,
          title: topicName,
          topic: topicName,
          platform,
          pillar,
          gtmStage,
          seoKeywords,
          geoTarget,
          status: 'PLANNED',
          actionItem: matchingPost?.prompt || buildEnhancedActionItem(topicName, platform, pillar, gtmStage, seoKeywords, geoTarget, brandName, fallbackGoal),
        };
      });

      // Goal-derived content pillars
      const goalPillars = [
        `Problem Awareness for ${fallbackGoal}`,
        `${campaign.campaignName} Features & Value`,
        `User Proof & Results`,
        `How-To Guides & Education`,
        `Direct CTA & Conversion`,
      ];

      // Extract high intent keywords directly from campaign topics
      const extractedKeywords = [];
      campaignPostTopics.forEach(t => {
        const words = cleanWords(t.topic);
        if (words.length >= 2) {
          extractedKeywords.push(words.slice(0, 3).join(' '));
        }
      });
      const uniqueKeywords = [...new Set(extractedKeywords)].slice(0, 8);
      const primaryKeywords = uniqueKeywords.length > 0 
        ? uniqueKeywords.slice(0, 5).map(k => `${k} online`)
        : [`${safeName.toLowerCase()} app`, `best ${industry.toLowerCase()} solutions`, `${safeGoal.toLowerCase().slice(0, 25)}`, `${brandName.toLowerCase()} platform`, `top ${industry.toLowerCase()} software`];

      const longTailKeywords = uniqueKeywords.length > 3
        ? uniqueKeywords.slice(3, 7).map(k => `how to ${k} in India`)
        : [`how to ${safeGoal.toLowerCase().slice(0, 30)}`, `${safeName.toLowerCase()} vs alternatives`, `best software for ${audienceStr.slice(0, 25)}`];

      strategy = {
        businessGoal: fallbackGoal,
        leadMagnet: `Free ${campaign.campaignName} Starter Guide & Toolkit — Your shortcut to ${fallbackGoal}`,
        primaryCta: `Get Started with ${campaign.campaignName} — Achieve ${fallbackGoal} today`,
        postingFrequency: campaign.postingFrequency || 'Daily',
        budgetSuggestions: `50% Organic SEO & Content Distribution / 30% Paid Retargeting / 20% Geo-Targeted High-Intent Search Ads`,
        bestPlatforms: platforms,
        contentPillars: goalPillars,
        channelMix: platforms.map((p, idx) => ({
          label: p,
          pct: idx === 0 ? 40 : idx === 1 ? 30 : idx === 2 ? 20 : 10,
          icon: p.toLowerCase().includes('insta') ? 'Instagram' : p.toLowerCase().includes('linked') ? 'Linkedin' : p.toLowerCase().includes('email') ? 'Mail' : 'Globe',
          color: p.toLowerCase().includes('insta') ? 'bg-rose-500' : p.toLowerCase().includes('linked') ? 'bg-blue-500' : p.toLowerCase().includes('email') ? 'bg-amber-500' : 'bg-brand-500',
        })),
        audience: [
          `Target Decision-Makers & Buyers interested in ${safeGoal}`,
          `Industry Professionals looking for modern solutions in ${industry}`,
          `Growth-focused Teams looking to upgrade from manual tools to ${campaign.campaignName}`
        ],
        funnel: {
          awareness: `Surface urgent pain points for ${fallbackGoal} through problem-awareness content mapped to Week 1 topics`,
          nurturing: `Demonstrate ${campaign.campaignName}'s unique capability to solve issues through Week 2 & 3 feature deep-dives and proof`,
          conversion: `Convert warm intent with time-sensitive offers, frictionless onboarding, and direct CTAs in Week 4`
        },
        gtmStrategy: {
          targetIcp: `Primary ICP: ${audienceStr} with immediate operational or growth need to achieve: "${fallbackGoal}". High sensitivity to workflow speed, ROI, and ease of adoption.`,
          valuePositioning: `${campaign.campaignName} by ${brandName} positions as the premier, trusted ${industry} accelerator engineered specifically to deliver ${fallbackGoal}.`,
          launchPhases: [
            { phase: 'Phase 1: Market Seeding (Days 1–7)', focus: 'Problem awareness & industry friction points', kpi: 'Reach, impressions & hook rate' },
            { phase: 'Phase 2: Value Demonstration (Days 8–14)', focus: 'Feature deep dives & step-by-step solutions', kpi: 'Saves, shares & profile visits' },
            { phase: 'Phase 3: Authority & Social Proof (Days 15–21)', focus: 'Customer proof, comparisons & testimonials', kpi: 'Lead magnet downloads & trial requests' },
            { phase: 'Phase 4: High-Urgency Conversion (Days 22–30)', focus: 'Direct CTAs, limited offers & enrollment urgency', kpi: 'Goal completions & app downloads' }
          ],
          activationMilestones: [
            `Milestone 1: Establish market presence with 10,000+ targeted impressions across ${platforms.join(', ')}`,
            `Milestone 2: 500+ qualified engagements on solution spotlight posts`,
            `Milestone 3: 150+ downloads/signups driven by lead magnet and direct response pushes`
          ],
          growthLoops: `Built-in referral incentive & social sharing prompt immediately after user achieves their first milestone with ${campaign.campaignName}.`
        },
        seoStrategy: {
          primaryKeywords,
          longTailKeywords,
          searchIntentMix: [
            { intent: 'Informational', percentage: 45, description: `Educational search queries answering audience questions derived from Week 1 & 2 topics` },
            { intent: 'Commercial Investigation', percentage: 35, description: `Feature comparisons, reviews, and solution evaluations from Week 2 & 3 topics` },
            { intent: 'Transactional', percentage: 20, description: `High-intent action queries ('download', 'signup', 'pricing', 'buy') from Week 4 conversion sprint` }
          ],
          contentClusters: [
            { pillarTopic: `${campaign.campaignName} Core Capabilities`, clusterArticles: campaignPostTopics.slice(0, 4).map(t => t.topic) },
            { pillarTopic: `${industry} Best Practices & Compliance`, clusterArticles: campaignPostTopics.slice(4, 8).map(t => t.topic) }
          ],
          onPageDirectives: `Target primary keywords in H1 and first 100 words. Implement FAQ schema on educational blogs and Product/Software schema on conversion landing pages.`
        },
        geoStrategy: {
          priorityRegions: [
            'Tier-1 Metros (Delhi NCR, Mumbai, Bengaluru)',
            'High-Growth Tech Corridors (Hyderabad, Pune, Chennai)',
            'Emerging Commercial Hubs (Ahmedabad, Kolkata, Chandigarh)'
          ],
          regionalHooks: [
            { region: 'Tech & Startup Metros (Bengaluru, Hyderabad)', hook: `Rapid digital adoption, automation efficiency, and tech-forward integration with ${campaign.campaignName}` },
            { region: 'Commercial & Legal Centers (Delhi NCR, Mumbai)', hook: `Enterprise compliance, regulatory peace-of-mind, and high-stakes ROI for ${industry}` },
            { region: 'Tier-2 High-Growth Cities', hook: `Cost-effective, modern alternative to legacy systems with instant onboarding` }
          ],
          geoDistributionTactics: `Deploy geo-fenced social campaigns targeting business parks and university hubs. Use localized vernacular copy in regional ad variants.`
        },
        campaignIdeas: [
          { title: `${campaign.campaignName} Problem Awareness Blitz`, desc: `Week 1 content storm highlighting the need for ${fallbackGoal}` },
          { title: `${campaign.campaignName} Proof & Results Showcase`, desc: `Social proof wave demonstrating real results toward ${fallbackGoal}` },
          { title: `${fallbackGoal} Conversion Sprint`, desc: `Final-week urgency campaign with exclusive offers to close ${fallbackGoal}` }
        ],
        thirtyDayPlan: fallbackPlan,
      };
    }

    // Ensure GTM, SEO, and GEO sections are guaranteed on the strategy
    if (!strategy.gtmStrategy) {
      strategy.gtmStrategy = {
        targetIcp: `${audienceStr} seeking: ${safeGoal}`,
        valuePositioning: `${campaign.campaignName} delivers ${safeGoal} through specialized ${industry} capabilities`,
        launchPhases: [
          { phase: 'Phase 1: Market Seeding (Days 1–7)', focus: 'Problem awareness', kpi: 'Reach & impressions' },
          { phase: 'Phase 2: Value Demonstration (Days 8–14)', focus: 'Solution showcase', kpi: 'Engagement' },
          { phase: 'Phase 3: Authority & Proof (Days 15–21)', focus: 'Social proof & trust', kpi: 'Lead captures' },
          { phase: 'Phase 4: Conversion Sprint (Days 22–30)', focus: 'Direct CTAs', kpi: 'Conversions' }
        ],
        activationMilestones: [`Milestone 1: 10,000 impressions`, `Milestone 2: 500 engagements`, `Milestone 3: Target conversions reached`],
        growthLoops: `Post-conversion referral loop and community advocacy`
      };
    }

    if (!strategy.seoStrategy) {
      const pKeys = campaignPostTopics.slice(0, 5).map(t => deriveSeoKeywordsForTopic(t.topic, brandName, industry));
      strategy.seoStrategy = {
        primaryKeywords: pKeys.length > 0 ? pKeys : [`${safeName} online`, `${industry} solutions`, safeGoal.slice(0, 25)],
        longTailKeywords: [`how to achieve ${safeGoal.slice(0, 25)}`, `best ${safeName} for ${industry}`, `${safeName} features and benefits`],
        searchIntentMix: [
          { intent: 'Informational', percentage: 45, description: 'Educational and problem-awareness content' },
          { intent: 'Commercial', percentage: 35, description: 'Evaluation and feature comparisons' },
          { intent: 'Transactional', percentage: 20, description: 'Direct acquisition and download searches' }
        ],
        contentClusters: [
          { pillarTopic: `${safeName} Solutions`, clusterArticles: campaignPostTopics.slice(0, 4).map(t => t.topic) }
        ],
        onPageDirectives: `Incorporate target keywords into page titles, H1/H2 headers, and meta descriptions.`
      };
    }

    if (!strategy.geoStrategy) {
      strategy.geoStrategy = {
        priorityRegions: ['Tier-1 Metros (Delhi NCR, Mumbai, Bengaluru)', 'Tech Hubs (Hyderabad, Pune)', 'Tier-2 Growth Cities'],
        regionalHooks: [
          { region: 'Metro Hubs', hook: `High-efficiency and fast ROI for ${industry} professionals` },
          { region: 'Growth Cities', hook: `Affordable, accessible modernization for ${safeName}` }
        ],
        geoDistributionTactics: `Geo-targeted ad creatives and regional interest targeting on social platforms.`
      };
    }

    // Enhance campaign topics with GTM, SEO, and GEO intelligence & rich AI creative directives
    if (campaignPostTopics.length > 0 && Array.isArray(strategy.thirtyDayPlan)) {
      strategy.thirtyDayPlan = strategy.thirtyDayPlan.map((dayItem, idx) => {
        const match = campaignPostTopics[idx];
        const topic = (dayItem.topic && dayItem.topic.length > 5) ? dayItem.topic : (match?.topic || `Topic ${idx + 1}`);
        const platform = dayItem.platform || match?.platform || platforms[idx % platforms.length];
        const pillar = match?.pillar || dayItem.pillar || pillars[idx % pillars.length];
        const gtmStage = dayItem.gtmStage || getGtmStageForDay(idx);
        const seoKeywords = dayItem.seoKeywords || deriveSeoKeywordsForTopic(topic, brandName, industry);
        const geoTarget = dayItem.geoTarget || getGeoForDay(idx);

        let actionItem = dayItem.actionItem;
        if (!actionItem || actionItem.startsWith('Publish ') || actionItem.length < 25) {
          actionItem = match?.prompt || buildEnhancedActionItem(topic, platform, pillar, gtmStage, seoKeywords, geoTarget, brandName, safeGoal);
        }

        return {
          ...dayItem,
          day: idx + 1,
          title: topic,
          topic: topic,
          platform: platform,
          pillar: pillar,
          gtmStage: gtmStage,
          seoKeywords: seoKeywords,
          geoTarget: geoTarget,
          actionItem: actionItem,
          status: 'PLANNED',
        };
      });
    }

    // Attach campaign metadata
    strategy.campaignId = campaign._id.toString();
    strategy.campaignName = campaign.campaignName;
    strategy.campaignGoal = campaign.campaignGoal;

    // Save to Campaign model
    campaign.aiGeneratedStrategy = strategy;
    await campaign.save();

    // Also sync to Workspace currentStrategy so Strategy Module, Calendar, and Studio can use it immediately!
    if (mongoose.Types.ObjectId.isValid(campaign.workspaceId)) {
      const existingWs = await Workspace.findById(campaign.workspaceId);
      const existingStrat = existingWs?.currentStrategy || {};
      const mergedStrat = {
        ...strategy,
        activeStrategyType: 'campaign',
        campaignStrategy: strategy,
        aiBrandStrategy: existingStrat.aiBrandStrategy || null,
        customStrategy: existingStrat.customStrategy || null,
        customImageBriefs: existingStrat.customImageBriefs || []
      };
      await Workspace.findByIdAndUpdate(campaign.workspaceId, { currentStrategy: mergedStrat }, { new: true });
    }

    console.log(`✅ [Strategy Engine] Strategy successfully created and linked for campaign: "${campaign.campaignName}"`);
    res.json({
      success: true,
      message: `Strategy generated successfully for campaign "${campaign.campaignName}"`,
      strategy,
      campaign,
    });
  } catch (err) {
    console.error('[Strategy Engine] Campaign Strategy Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
