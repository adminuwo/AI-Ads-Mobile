/**
 * customStrategyAgent.service.js
 * Autonomous AI Agent for Custom 30-Day Social Media Growth Strategies & Image Visual Briefs
 *
 * Takes user-specified custom campaign directives (e.g. Product Launch, Brand Refresh, Holiday Promo)
 * along with optional reference product images and generates 30 completely unique, non-repeating
 * daily marketing posts across 4 campaign roadmap phases.
 */

const { aiClient, globalAiClient } = require('../config/vertex');
const axios = require('axios');

/**
 * Fetch image as base64 buffer for Gemini Vision analysis
 */
async function fetchImageAsBase64(imageUrl) {
  if (!imageUrl) return null;
  try {
    if (imageUrl.startsWith('data:')) {
      const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) return { mimeType: match[1], data: match[2] };
    }
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 8000,
      headers: { 'User-Agent': 'AI-Ads-CustomStrategyAgent/1.0' }
    });
    const mimeType = response.headers['content-type']?.split(';')[0] || 'image/jpeg';
    const data = Buffer.from(response.data).toString('base64');
    return { mimeType, data };
  } catch (err) {
    console.warn('[CustomStrategyAgent] Note: Reference image fetch ignored:', err.message);
    return null;
  }
}

/**
 * Intelligent Fallback Generator for 30 Unique Posts
 * Guarantees zero text duplication across all 30 days if AI service is offline or rate-limited.
 */
function buildSmartFallback30DayPosts({ brandName = 'Brand', industry = 'Consumer Products', directive = 'Product Launch' }) {
  const cleanBrand = (brandName || 'Brand').trim();
  const cleanIndustry = (industry || 'Consumer Products').trim();
  const cleanDirective = (directive || 'Product Launch Strategy').trim();

  let cleanTopic = cleanDirective;
  if (/launch|new product/i.test(cleanDirective)) {
    cleanTopic = 'New Product Launch';
  } else if (cleanDirective.length > 30) {
    cleanTopic = cleanDirective.slice(0, 30).trim();
  }

  const platformsList = ['Instagram', 'Facebook', 'LinkedIn', 'Twitter / X', 'YouTube Shorts', 'Pinterest'];

  const templates = [
    // Week 1: Awareness & Teasers (Days 1-7)
    {
      day: 1, week: 1, platform: 'Instagram', format: 'Carousel Slide / Reel Concept',
      title: `The Countdown Begins: ${cleanTopic}`,
      hook: `✨ Something revolutionary is coming from ${cleanBrand}. Are you ready?`,
      caption: `Day 1 of our official launch campaign.\n\nWe've spent months perfecting every single detail for ${cleanTopic}. Today, we're giving you your very first peak into what's next for ${cleanIndustry}.\n\nStay tuned as we unveil key features throughout this week!`,
      cta: `Tap the notification bell to be first in line! 👇`,
      visualDirective: `[Day 1 - Instagram] High-tech teaser image of ${cleanBrand} product hero under dramatic low-key rim lighting with ambient glow.`
    },
    {
      day: 2, week: 1, platform: 'Facebook', format: 'High-Engagement Ad Graphic',
      title: `Why We Created This: The Story Behind ${cleanBrand}`,
      hook: `💡 Modern ${cleanIndustry} needed a upgrade. Here is how we built it.`,
      caption: `Day 2 Focus: The Origin Story.\n\nWhen we set out to execute ${cleanTopic}, we noticed a huge gap in the market. Users were settling for compromise.\n\n${cleanBrand} was engineered from the ground up to deliver uncompromised quality, design, and performance.`,
      cta: `Read the full founder message on our official page 📖`,
      visualDirective: `[Day 2 - Facebook] Behind-the-scenes editorial craft photography highlighting ${cleanBrand} product design and premium materials.`
    },
    {
      day: 3, week: 1, platform: 'LinkedIn', format: 'Executive Slide Briefing',
      title: `Redefining Industry Standards in ${cleanIndustry}`,
      hook: `🚀 Innovation Spotlight: How ${cleanBrand} is elevating ${cleanIndustry} standards.`,
      caption: `Day 3 Industry Insights.\n\nTo lead in ${cleanIndustry}, execution must match vision. Our new initiative ("${cleanTopic}") focuses on high performance, modern architecture, and customer satisfaction.`,
      cta: `Connect with our executive team for early corporate access 💼`,
      visualDirective: `[Day 3 - LinkedIn] Clean minimalist executive presentation slide showing ${cleanBrand} product specifications and key advantages.`
    },
    {
      day: 4, week: 1, platform: 'Twitter / X', format: '16:9 Viral Thread Graphic',
      title: `5 Key Features You Need to Know About ${cleanBrand}`,
      hook: `🧵 5 reasons why ${cleanBrand}'s new launch changes everything:`,
      caption: `Day 4 Feature Thread.\n\n1. Precision engineering\n2. Next-gen performance\n3. Ergonomic sleek design\n4. Seamless ecosystem integration\n5. Unmatched value in ${cleanIndustry}.\n\nWhich feature are you most excited for?`,
      cta: `Retweet & drop your favorite feature below! 🔄`,
      visualDirective: `[Day 4 - Twitter / X] Vibrant grid layout showcasing 5 key product details of ${cleanBrand} with sleek callout badges.`
    },
    {
      day: 5, week: 1, platform: 'YouTube Shorts', format: '9:16 Short Video Motion Hook',
      title: `Unboxing First Impressions: ${cleanBrand}`,
      hook: `📦 First look! Watch the official unboxing of ${cleanBrand}'s new release.`,
      caption: `Day 5 Unboxing Highlight.\n\nFeel the premium texture, admire the sleek aesthetics, and see what comes inside the package. Designed to impress from the moment you open the box.`,
      cta: `Subscribe to our YouTube channel for full 4K review video! ▶️`,
      visualDirective: `[Day 5 - YouTube Shorts] Vertical 9:16 high-frame-rate close-up unboxing shot of ${cleanBrand} product being lifted from matte box.`
    },
    {
      day: 6, week: 1, platform: 'Pinterest', format: 'Shoppable Vertical Moodboard Pin',
      title: `Aesthetic & Design Inspiration for ${cleanBrand}`,
      hook: `🎨 Elevate your daily routine with minimalist design elegance.`,
      caption: `Day 6 Aesthetic Focus.\n\nFunctionality meets high fashion. Explore how ${cleanBrand} seamlessly integrates into your modern lifestyle space.`,
      cta: `Pin this to your lifestyle aesthetic board & shop the look! 📌`,
      visualDirective: `[Day 6 - Pinterest] High-fashion editorial moodboard featuring ${cleanBrand} product surrounded by sleek natural props.`
    },
    {
      day: 7, week: 1, platform: 'Instagram', format: 'Carousel Slide / Reel Concept',
      title: `Official Launch Week Wrap-Up & Live Preview`,
      hook: `🔥 7 Days in: The hype around ${cleanBrand} is officially real!`,
      caption: `Day 7 Milestone.\n\nThank you for an incredible launch week. We're breaking down the top community questions in a live session today!`,
      cta: `Join our IG Live stream at 5 PM EST! 🎙️`,
      visualDirective: `[Day 7 - Instagram] High-impact carousel banner celebrating Week 1 launch milestone with glowing glowing brand badge.`
    },

    // Week 2: Value & Feature Deep Dives (Days 8-14)
    {
      day: 8, week: 2, platform: 'Instagram', format: 'Carousel Slide / Reel Concept',
      title: `Feature Deep Dive: Engineered for Peak Performance`,
      hook: `⚙️ Under the hood: Discover the engineering powerhouse driving ${cleanBrand}.`,
      caption: `Day 8 Deep Dive.\n\nWe didn't just build another product in ${cleanIndustry} — we re-engineered the entire experience. See how our proprietary design delivers smooth, reliable performance every day.`,
      cta: `Swipe right to explore hardware specs ➡️`,
      visualDirective: `[Day 8 - Instagram] Macro close-up photography highlighting the refined metallic finish and craftsmanship of ${cleanBrand}.`
    },
    {
      day: 9, week: 2, platform: 'Facebook', format: 'High-Engagement Ad Graphic',
      title: `How ${cleanBrand} Solves Your Everyday Pain Points`,
      hook: `❌ Tired of unreliable quality in ${cleanIndustry}? Here is the solution.`,
      caption: `Day 9 Solution Spotlight.\n\nSay goodbye to frustration. ${cleanBrand} was specifically crafted to eliminate common drawbacks and give you a hassle-free premium experience.`,
      cta: `Try it risk-free today with our 30-day guarantee 🛡️`,
      visualDirective: `[Day 9 - Facebook] Side-by-side comparison graphic contrasting old frustrating solutions vs sleek ${cleanBrand} experience.`
    },
    {
      day: 10, week: 2, platform: 'LinkedIn', format: 'Executive Slide Briefing',
      title: `The ROI of Premium Quality in ${cleanIndustry}`,
      hook: `📊 Why smart buyers invest in quality over quick fixes.`,
      caption: `Day 10 Value Analysis.\n\nInvesting in ${cleanBrand} pays dividends in longevity, efficiency, and satisfaction. Here is our breakdown of long-term value for modern professionals.`,
      cta: `Download our full product brochure for your team 📄`,
      visualDirective: `[Day 10 - LinkedIn] Infographic slide highlighting efficiency stats and durability benchmarks for ${cleanBrand}.`
    },
    {
      day: 11, week: 2, platform: 'Twitter / X', format: '16:9 Viral Thread Graphic',
      title: `Myth vs Reality: What Really Matters in ${cleanIndustry}`,
      hook: `💡 Busting the top 3 myths about ${cleanIndustry} products:`,
      caption: `Day 11 Education.\n\nMyth 1: Premium costs too much.\nMyth 2: All designs perform the same.\nMyth 3: You can't have both style and strength.\n\n${cleanBrand} proves otherwise.`,
      cta: `What myth did you believe? Reply below! 💬`,
      visualDirective: `[Day 11 - Twitter / X] Sleek 16:9 infographic busting common industry misconceptions with bold typography overlays.`
    },
    {
      day: 12, week: 2, platform: 'YouTube Shorts', format: '9:16 Short Video Motion Hook',
      title: `Real World Stress Test: ${cleanBrand} Put to the Test`,
      hook: `⚡ Can ${cleanBrand} handle daily extreme use? Watch this!`,
      caption: `Day 12 Durability Showcase.\n\nWe put ${cleanBrand} through rigorous daily testing. Watch how it maintains pristine condition without missing a beat.`,
      cta: `Double tap if you need this durability! ❤️`,
      visualDirective: `[Day 12 - YouTube Shorts] Action shot of ${cleanBrand} undergoing real-world stress test in high-dynamic lighting.`
    },
    {
      day: 13, week: 2, platform: 'Pinterest', format: 'Shoppable Vertical Moodboard Pin',
      title: `Styling ${cleanBrand} in Your Everyday Workflow`,
      hook: `✨ Modern workspace setup featuring ${cleanBrand}.`,
      caption: `Day 13 Lifestyle Integration.\n\nClean lines, functional elegance, and effortless harmony. See how ${cleanBrand} elevates your personal aesthetic.`,
      cta: `Save this pin for your desk setup inspiration! 📌`,
      visualDirective: `[Day 13 - Pinterest] Sunlit lifestyle setup showcasing ${cleanBrand} alongside contemporary design accessories.`
    },
    {
      day: 14, week: 2, platform: 'Instagram', format: 'Carousel Slide / Reel Concept',
      title: `Interactive Poll: Which Color / Style Fits You Best?`,
      hook: `👇 Cast your vote: Which ${cleanBrand} edition is your personal favorite?`,
      caption: `Day 14 Community Poll.\n\nWe love hearing from our audience! Swipe through the options and let us know which style matches your personal vibe.`,
      cta: `Comment Option A or Option B below! 💬`,
      visualDirective: `[Day 14 - Instagram] Split-screen visual presenting two styled variations of ${cleanBrand} for audience voting.`
    },

    // Week 3: Social Proof & Community (Days 15-21)
    {
      day: 15, week: 3, platform: 'Instagram', format: 'Carousel Slide / Reel Concept',
      title: `Verified Customer Proof & Early Review Highlights`,
      hook: `⭐ "Hands down the best upgrade I've made all year!" — Verified Buyer`,
      caption: `Day 15 Social Proof.\n\nDon't just take our word for it. Here is what early adopters are saying after 2 weeks of using ${cleanBrand}.`,
      cta: `Read 100+ verified customer reviews on our website 🌟`,
      visualDirective: `[Day 15 - Instagram] Customer testimonial quote overlay integrated over an authentic lifestyle photo of ${cleanBrand}.`
    },
    {
      day: 16, week: 3, platform: 'Facebook', format: 'High-Engagement Ad Graphic',
      title: `Community Spotlight: ${cleanBrand} in Action`,
      hook: `🔥 Join 5,000+ happy owners transforming their ${cleanIndustry} experience.`,
      caption: `Day 16 Community Showcase.\n\nOur community is growing faster than ever! Share your photos featuring ${cleanBrand} with hashtag #${cleanBrand.replace(/\s+/g,'')} to be featured.`,
      cta: `Tag us in your photos to get featured on our main page 📸`,
      visualDirective: `[Day 16 - Facebook] Collage graphic displaying real customer photo submissions featuring ${cleanBrand}.`
    },
    {
      day: 17, week: 3, platform: 'LinkedIn', format: 'Executive Slide Briefing',
      title: `Case Study: Scaling Efficiency with ${cleanBrand}`,
      hook: `📈 Case Study: How ${cleanBrand} improved user satisfaction by 40%.`,
      caption: `Day 17 Case Study.\n\nReal results from verified deployment. Discover how switching to ${cleanBrand} improved overall performance and workflow speed.`,
      cta: `Read the full case study breakdown 📊`,
      visualDirective: `[Day 17 - LinkedIn] Professional case study summary card with key metrics and ${cleanBrand} product photo.`
    },
    {
      day: 18, week: 3, platform: 'Twitter / X', format: '16:9 Viral Thread Graphic',
      title: `Top 5 Customer Questions Answered (AMA)`,
      hook: `❓ You asked, we answered! Here are responses to your top questions about ${cleanBrand}:`,
      caption: `Day 18 FAQ Breakdown.\n\nQ1: How fast is delivery?\nQ2: Is there a warranty?\nQ3: What makes it unique?\n\nRead full thread for answers!`,
      cta: `Have another question? Drop it in the replies! 💬`,
      visualDirective: `[Day 18 - Twitter / X] Q&A graphic layout featuring ${cleanBrand} with prominent clean text boxes.`
    },
    {
      day: 19, week: 3, platform: 'YouTube Shorts', format: '9:16 Short Video Motion Hook',
      title: `Behind the Craft: How ${cleanBrand} is Assembled`,
      hook: `🔍 Take a quick factory tour: Precision assembly of ${cleanBrand}.`,
      caption: `Day 19 Craftsmanship Spotlight.\n\nQuality control is our highest priority. Watch how every unit of ${cleanBrand} undergoes rigorous multi-point inspection.`,
      cta: `Tap like if you appreciate quality craftsmanship! 👍`,
      visualDirective: `[Day 19 - YouTube Shorts] Factory precision assembly shot focusing on laser-etched detail on ${cleanBrand}.`
    },
    {
      day: 20, week: 3, platform: 'Pinterest', format: 'Shoppable Vertical Moodboard Pin',
      title: `Top Rated Gift & Upgrade Guide: ${cleanBrand}`,
      hook: `🎁 Looking for the ultimate gift? ${cleanBrand} is top rated.`,
      caption: `Day 20 Gift Guide.\n\nTreat yourself or someone special to the gold standard in ${cleanIndustry}. Packaged in a luxury gift box ready to present.`,
      cta: `Save pin & shop the official gift collection! 🎁`,
      visualDirective: `[Day 20 - Pinterest] Gift packaging presentation graphic showing ${cleanBrand} elegantly boxed with satin ribbon.`
    },
    {
      day: 21, week: 3, platform: 'Instagram', format: 'Carousel Slide / Reel Concept',
      title: `User Challenge: Show Us How You Use ${cleanBrand}`,
      hook: `🏆 Giveaway Alert! Win an exclusive ${cleanBrand} VIP care package.`,
      caption: `Day 21 Giveaway Launch.\n\nTo thank our community, we're giving away 3 custom bundles! Follow the simple steps to enter.`,
      cta: `1. Like this post\n2. Tag 2 friends\n3. Share to story! 🚀`,
      visualDirective: `[Day 21 - Instagram] High-vibrancy promotional giveaway graphic showcasing ${cleanBrand} bundle with golden contest badge.`
    },

    // Week 4: Conversion Sprint & Direct Response CTA (Days 22-30)
    {
      day: 22, week: 4, platform: 'Instagram', format: 'Carousel Slide / Reel Concept',
      title: `Exclusive Launch Offer: Limited Bundle Available`,
      hook: `⚡ Special Launch Pricing: Get ${cleanBrand} with exclusive launch bonuses!`,
      caption: `Day 22 Conversion Push.\n\nOur initial batch is selling out fast! For a limited time, get free priority shipping and an exclusive warranty extension.`,
      cta: `Tap link in bio to claim your launch discount 🛍️`,
      visualDirective: `[Day 22 - Instagram] Sleek commercial ad graphic displaying ${cleanBrand} with "EXCLUSIVE LAUNCH OFFER" banner.`
    },
    {
      day: 23, week: 4, platform: 'Facebook', format: 'High-Engagement Ad Graphic',
      title: `Don't Settle for Less: Upgrade to ${cleanBrand} Today`,
      hook: `💥 Make the switch to ${cleanBrand} and feel the difference immediately.`,
      caption: `Day 23 Direct Response.\n\nWhy wait to experience top-tier quality? Order today and get instant confirmation plus live order tracking.`,
      cta: `Shop now & save 15% on your first order 🛒`,
      visualDirective: `[Day 23 - Facebook] Vibrant promotional banner highlighting ${cleanBrand} with clear "SHOP NOW" call-to-action button.`
    },
    {
      day: 24, week: 4, platform: 'LinkedIn', format: 'Executive Slide Briefing',
      title: `Why Industry Leaders are Choosing ${cleanBrand}`,
      hook: `💼 Enterprise & Professional Edition: Upgrade your team's workflow.`,
      caption: `Day 24 Executive Pitch.\n\nCustom volume solutions tailored for businesses and teams. Contact our corporate strategy team for custom package quotes.`,
      cta: `Schedule a 15-min demo with our solutions specialist 📅`,
      visualDirective: `[Day 24 - LinkedIn] Minimalist executive presentation slide showcasing ${cleanBrand} in a corporate desk environment.`
    },
    {
      day: 25, week: 4, platform: 'Twitter / X', format: '16:9 Viral Thread Graphic',
      title: `Final Call: Launch Bonus Ending Soon for ${cleanBrand}`,
      hook: `⏰ 48-Hour Countdown: Free bonus bundle ends soon!`,
      caption: `Day 25 Urgency Sprint.\n\nDon't miss out on launch perks. Secure your unit now before pricing returns to standard rate.`,
      cta: `Click link to lock in your discount code! ⏳`,
      visualDirective: `[Day 25 - Twitter / X] High-contrast urgency ad graphic with countdown clock aesthetic featuring ${cleanBrand}.`
    },
    {
      day: 26, week: 4, platform: 'YouTube Shorts', format: '9:16 Short Video Motion Hook',
      title: `3 Quick Reasons to Get ${cleanBrand} Right Now`,
      hook: `⏱️ 15-second summary: Why ${cleanBrand} is worth every penny.`,
      caption: `Day 26 Short Pitch.\n\n1. Built to last\n2. Unmatched performance\n3. 100% satisfaction guarantee. Get yours today!`,
      cta: `Tap the link below to order in 60 seconds! 🔗`,
      visualDirective: `[Day 26 - YouTube Shorts] Vertical fast-cut video thumbnail highlighting 3 key benefits of ${cleanBrand}.`
    },
    {
      day: 27, week: 4, platform: 'Pinterest', format: 'Shoppable Vertical Moodboard Pin',
      title: `Must-Have Essential Collection: ${cleanBrand}`,
      hook: `🛍️ Trending in ${cleanIndustry}: Add ${cleanBrand} to your wishlist.`,
      caption: `Day 27 Wishlist Feature.\n\nThe search for the perfect ${cleanIndustry} solution is over. Explore instant checkout options.`,
      cta: `Tap to buy now on Pinterest Shoppable Store! 🛍️`,
      visualDirective: `[Day 27 - Pinterest] High-resolution shoppable pin featuring ${cleanBrand} with price tag overlay.`
    },
    {
      day: 28, week: 4, platform: 'Instagram', format: 'Carousel Slide / Reel Concept',
      title: `What's Inside Your Order: Package Unboxing Preview`,
      hook: `📦 What happens when you order ${cleanBrand}? Here is your exact journey.`,
      caption: `Day 28 Fulfillment Guarantee.\n\nFast processing, eco-friendly protective packaging, and 24/7 customer support ready to assist you.`,
      cta: `Order now & track shipment in real time 🚚`,
      visualDirective: `[Day 28 - Instagram] Lifestyle delivery box visualization showing ${cleanBrand} resting inside premium custom foam inlay.`
    },
    {
      day: 29, week: 4, platform: 'Facebook', format: 'High-Engagement Ad Graphic',
      title: `Limited Stock Warning: ${cleanBrand} Batch 1 Almost Sold Out`,
      hook: `⚠️ Low Stock Alert! Over 85% of Batch 1 is already claimed.`,
      caption: `Day 29 Stock Notice.\n\nDue to overwhelming demand, current inventory is selling fast. Secure your order now to avoid backorder delays.`,
      cta: `Claim one of the remaining units today! ⚡`,
      visualDirective: `[Day 29 - Facebook] High-impact alert graphic displaying ${cleanBrand} with "LIMITED STOCK REMAINING" badge.`
    },
    {
      day: 30, week: 4, platform: 'Instagram', format: 'Carousel Slide / Reel Concept',
      title: `Campaign Finale: Welcome to the ${cleanBrand} Family!`,
      hook: `🎉 Celebrating 30 Days of Launch Success! Thank you for choosing ${cleanBrand}.`,
      caption: `Day 30 Campaign Celebration.\n\nWhat a journey! From initial reveal to thousands of happy customers, we are honored to have you with us.\n\nThis is just the beginning of what ${cleanBrand} has in store for ${cleanIndustry}.`,
      cta: `Welcome to the family! Tap link in bio to join our VIP club 🌟`,
      visualDirective: `[Day 30 - Instagram] High-energy celebratory banner graphic featuring ${cleanBrand} with gold confetti and glowing brand logo.`
    }
  ];

  return templates.map(t => {
    const weekTag = t.week === 1 ? 'Week 1: Awareness' : t.week === 2 ? 'Week 2: Value' : t.week === 3 ? 'Week 3: Engagement' : 'Week 4: Conversion';
    const weekName = t.week === 1 ? 'Brand Awareness & Visual Hook (Days 1–7)' : t.week === 2 ? 'Product Value & Feature Deep Dive (Days 8–14)' : t.week === 3 ? 'Social Proof & Community Engagement (Days 15–21)' : 'Conversion Sprint & Direct Response CTA (Days 22–30)';
    const hashtags = `#${cleanBrand.replace(/\s+/g,'')} #Day${t.day} #${cleanIndustry.replace(/[^a-zA-Z0-9]/g,'')} #VisualStrategy #${t.platform.replace(/[\s\/]+/g,'')}`;
    return {
      ...t,
      weekTag,
      weekName,
      hashtags
    };
  });
}

/**
 * Main Autonomous Agent Function
 * Generates custom 30-day strategy posts using Vertex AI / Gemini LLM with vision support.
 */
async function generateCustom30DayStrategy({
  brandName = 'Brand',
  industry = '',
  tagline = '',
  companyDescription = '',
  directive = '',
  referenceImageUrl = null,
  brandColors = []
}) {
  const cleanBrand = (brandName || 'Brand').trim();
  const cleanIndustry = (industry || 'Consumer Products').trim();
  const cleanDirective = (directive || 'Launch 30-day marketing strategy').trim();

  console.log(`\n==================================================`);
  console.log(`🤖 [CUSTOM STRATEGY AGENT] Generating 30-Day Blueprint`);
  console.log(`==================================================`);
  console.log(`Brand: "${cleanBrand}" | Industry: "${cleanIndustry}"`);
  console.log(`Directive: "${cleanDirective}"`);
  console.log(`Reference Image: ${referenceImageUrl ? 'YES' : 'NONE'}`);
  console.log(`==================================================\n`);

  const clientCandidates = [globalAiClient, aiClient].filter(Boolean);

  if (clientCandidates.length > 0) {
    const client = clientCandidates[0];

    // Optional: Fetch reference image for Gemini Vision context
    let imagePart = null;
    if (referenceImageUrl) {
      imagePart = await fetchImageAsBase64(referenceImageUrl);
    }

    const systemPrompt = `You are a Senior Chief Marketing Officer (CMO) and Growth Strategist at AI Ads™.
Your task is to analyze the user's custom campaign directive and reference product image, then create a COMPREHENSIVE, 30-DAY SOCIAL MEDIA MARKETING STRATEGY consisting of 30 DISTINCT, NON-REPEATING DAILY POST CARDS.

CRITICAL RULES:
1. Every single day (Day 1 through Day 30) MUST have a completely UNIQUE title, hook line, copywriting caption, call-to-action (CTA), and visual graphic prompt.
2. DO NOT repeat the raw user directive text in every card title or caption! Translate the directive into a real 4-week marketing roadmap:
   - Week 1 (Days 1–7): Awareness & Teasers (Mystery reveal, founder vision, unboxing, key feature teaser).
   - Week 2 (Days 8–14): Value & Deep Dives (Tech specs, problem-solution, myth-busting, stress test, lifestyle styling).
   - Week 3 (Days 15–21): Social Proof & Community (Reviews, case studies, Q&A, behind the scenes, giveaway challenge).
   - Week 4 (Days 22–30): Conversion & Urgency (Launch discount, limited bundle offer, executive pitch, low stock alert, celebration).
3. Output MUST be valid JSON: an array of exactly 30 post objects.

JSON STRUCTURE REQUIRED:
[
  {
    "day": 1,
    "week": 1,
    "weekTag": "Week 1: Awareness",
    "weekName": "Brand Awareness & Visual Hook (Days 1–7)",
    "platform": "Instagram",
    "format": "Carousel Slide / Reel Concept",
    "title": "Unique Day 1 Post Title",
    "hook": "✨ Engaging scroll-stopping hook line for Day 1",
    "caption": "Persuasive copywriting paragraph for Day 1...",
    "cta": "Clear call to action for Day 1 👇",
    "visualDirective": "[Day 1 - Instagram] Detailed description of what image/graphic to generate using the reference product",
    "hashtags": "#Brand #Day1 #Marketing"
  }
  ... (through day 30)
]`;

    const userPrompt = `Create a 30-Day Custom Marketing Campaign Strategy for:
Brand Name: "${cleanBrand}"
Industry: "${cleanIndustry}"
${tagline ? `Tagline: "${tagline}"` : ''}
${companyDescription ? `Company Description: "${companyDescription}"` : ''}
${brandColors.length > 0 ? `Brand Colors: ${brandColors.join(', ')}` : ''}

USER CUSTOM DIRECTIVE:
"${cleanDirective}"

Please analyze this directive and produce an array of exactly 30 unique daily post objects in pure JSON. Output JSON only, no markdown wrapping, no explanation.`;

    const candidateModels = ['gemini-3.5-flash'];

    for (const modelName of candidateModels) {
      try {
        console.log(`[CustomStrategyAgent] Invoking AI model "${modelName}" for 30-day strategy generation...`);

        const parts = [];
        if (imagePart) {
          parts.push({
            inlineData: {
              mimeType: imagePart.mimeType,
              data: imagePart.data
            }
          });
        }
        parts.push({ text: `SYSTEM:\n${systemPrompt}\n\nUSER PROMPT:\n${userPrompt}` });

        const result = await client.models.generateContent({
          model: modelName,
          contents: [{ role: 'user', parts }],
          config: {
            maxOutputTokens: 8192,
            temperature: 0.7,
            responseMimeType: 'application/json'
          }
        });

        const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        if (rawText) {
          let cleanJson = rawText;
          if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
          }

          const parsedPosts = JSON.parse(cleanJson);
          if (Array.isArray(parsedPosts) && parsedPosts.length >= 10) {
            console.log(`[CustomStrategyAgent] ✅ Successfully generated ${parsedPosts.length} unique AI daily posts via ${modelName}!`);
            
            // Normalize posts format
            const normalized = parsedPosts.map((p, idx) => {
              const day = p.day || (idx + 1);
              const week = p.week || (day <= 7 ? 1 : day <= 14 ? 2 : day <= 21 ? 3 : 4);
              const weekTag = p.weekTag || (week === 1 ? 'Week 1: Awareness' : week === 2 ? 'Week 2: Value' : week === 3 ? 'Week 3: Engagement' : 'Week 4: Conversion');
              const weekName = p.weekName || (week === 1 ? 'Brand Awareness & Visual Hook (Days 1–7)' : week === 2 ? 'Product Value & Feature Deep Dive (Days 8–14)' : week === 3 ? 'Social Proof & Community Engagement (Days 15–21)' : 'Conversion Sprint & Direct Response CTA (Days 22–30)');
              const platform = p.platform || ['Instagram', 'Facebook', 'LinkedIn', 'Twitter / X', 'YouTube Shorts', 'Pinterest'][idx % 6];
              
              return {
                day,
                week,
                weekTag,
                weekName,
                platform,
                format: p.format || 'Single Image Banner Post',
                title: p.title || `Day ${day}: ${cleanBrand} Strategy Focus`,
                visualDirective: p.visualDirective || `[Day ${day} - ${platform}] Format reference image for ${p.format || 'Ad Graphic'} highlighting ${cleanDirective}.`,
                hook: p.hook || `✨ Day ${day} focus for ${cleanBrand} in ${cleanIndustry}.`,
                caption: p.caption || `Day ${day} of our 30-day marketing strategy.\n\nDirective Focus: "${cleanDirective}".`,
                cta: p.cta || `Learn more about ${cleanBrand} today! 👇`,
                hashtags: p.hashtags || `#${cleanBrand.replace(/\s+/g,'')} #Day${day} #${cleanIndustry.replace(/[^a-zA-Z0-9]/g,'')}`
              };
            });

            return {
              success: true,
              engine: `${modelName} (AI Custom Strategy Agent)`,
              posts: normalized
            };
          }
        }
      } catch (err) {
        console.warn(`[CustomStrategyAgent] Model "${modelName}" note:`, err.message);
      }
    }
  }

  // Smart Fallback if AI call isn't available or times out
  console.log(`[CustomStrategyAgent] Using Smart Multi-Pattern Fallback Engine for 30 unique posts.`);
  const fallbackPosts = buildSmartFallback30DayPosts({
    brandName: cleanBrand,
    industry: cleanIndustry,
    directive: cleanDirective
  });

  return {
    success: true,
    engine: 'AI Custom Strategy Generator (Smart Multi-Pattern Engine)',
    posts: fallbackPosts
  };
}

module.exports = {
  generateCustom30DayStrategy,
  buildSmartFallback30DayPosts
};
