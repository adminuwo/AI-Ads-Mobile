/**
 * AI Service — Multi-model orchestrator
 * Supports: Google Cloud Vertex AI (via @google/genai & ADC), OpenAI GPT-4o, Groq (Llama 3)
 * Automatic multi-model fallback chain: Vertex AI / Gemini → OpenAI GPT-4o → Groq
 */
const { aiClient, globalAiClient, useVertexAI } = require('../config/vertex');
const axios = require('axios');

// ─── OpenAI Setup ──────────────────────────────────────────────────────────────
let openaiClient = null;
const getOpenAIClient = () => {
  if (!openaiClient) {
    const { OpenAI } = require('openai');
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY not set in environment');
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
};

// ─── System Prompt ─────────────────────────────────────────────────────────────
const buildSystemPrompt = (options = {}) => {
  let system = `You are AI Ads™ Assistant, an elite AI Marketing Strategist & Social Media Growth Consultant embedded inside the AI Ads™ Platform.

CORE EXPERT DIRECTIVE:
Whenever users ask ANY question regarding marketing, growth strategy, social media platforms (Instagram, LinkedIn, Facebook, YouTube, X/Twitter, TikTok, Pinterest, Meta Ads, Google Ads), SEO, copywriting, pricing, sales funnels, or positioning:
1. ALWAYS provide a comprehensive, accurate, highly detailed, and actionable answer FIRST. Explain proven marketing frameworks (e.g., AIDA, PAS, TOFU/MOFU/BOFU), platform-specific best practices, post hooks, content pillars, audience targeting tactics, or step-by-step roadmaps.
2. Use clean, professional GitHub-style Markdown formatting (bold text, bullet points, numbered lists, section headers, hashtags, and code/copy snippets).
3. Do NOT refuse or deflect marketing questions to platform menus. Give real, expert answers directly.
4. At the very end of your response, if relevant to generating or publishing assets, add a brief 1-sentence tip pointing to the appropriate AI Ads™ module (e.g. Content Studio, Creative Studio, AI Website Builder, Strategy).

MANDATORY OUT-OF-SCOPE RULE:
If the user talks about or asks questions about anything else EXCEPT AI Ads, SEO, marketing strategy, social media, branding, advertising, or marketing growth (for example: coding, math, recipes/food, personal advice, trivia, movies, weather, or non-marketing topics):
1. Politely inform them that you are specialized strictly in AI Ads, SEO, Marketing Strategy, and Social Media Growth.
2. Provide them with this link for further talk: https://aisa24.com/dashboard/chat/new`;

  if (options.brandContext) {
    system += `\n\n### ACTIVE BRAND CONTEXT:\n${options.brandContext}`;
  }
  if (options.userName) {
    system += `\n\nUser's name: ${options.userName}. Address them by name naturally.`;
  }
  if (options.systemInstruction) {
    system += `\n\n### ADDITIONAL INSTRUCTIONS:\n${options.systemInstruction}`;
  }
  return system;
};

// ─── Gemini / Vertex AI Chat (@google/genai SDK in Vertex AI Mode) ──────────
const chatWithGemini = async (messages, options = {}) => {
  const reqTag = options.reqId ? `[WB:${options.reqId}] ` : '[AI-Service] ';
  const systemInstruction = buildSystemPrompt(options);

  const clientCandidates = [aiClient, globalAiClient].filter(Boolean);

  if (clientCandidates.length > 0) {
    const contents = [];
    if (systemInstruction) {
      contents.push({ role: 'user', parts: [{ text: `SYSTEM INSTRUCTIONS:\n${systemInstruction}` }] });
    }

    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const parts = [{ text: m.content }];

      // Multimodal Image Attachment Support for Gemini / Vertex AI
      if (options.images && Array.isArray(options.images) && i === messages.length - 1) {
        const validImages = options.images.filter(img => img && (img.base64 || img.data || (typeof img === 'string' && img.length > 50)));
        if (validImages.length > 0) {
          let totalBytes = 0;
          validImages.forEach((img) => {
            const rawB64 = typeof img === 'string' ? img : (img.base64 || img.data);
            const mimeType = (typeof img === 'object' && img.mimeType) ? img.mimeType : 'image/png';
            if (rawB64) {
              const cleanB64 = rawB64.replace(/^data:image\/\w+;base64,/, '').trim();
              parts.push({
                inlineData: {
                  mimeType: mimeType,
                  data: cleanB64
                }
              });
              totalBytes += cleanB64.length;
            }
          });
          console.log(`[AI-MULTIMODAL] 📸 Attached ${validImages.length} image(s) to Gemini request (Total payload: ${Math.round(totalBytes / 1024)} KB)`);
        }
      }

      contents.push({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts,
      });
    }

    let requestedModel = 'gemini-3.5-flash';
    if (options.modelId || options.model) {
      const customModel = String(options.modelId || options.model).toLowerCase();
      if (customModel.includes('gemini') || customModel.includes('3.5') || customModel.includes('flash') || customModel.includes('pro')) {
        requestedModel = 'gemini-3.5-flash';
      } else {
        requestedModel = customModel;
      }
    }

    const modelSequence = ['gemini-3.5-flash'];

    let lastError = null;
    for (const client of clientCandidates) {
      for (const mId of modelSequence) {
        let maxRetries = 2;
        for (let retry = 0; retry <= maxRetries; retry++) {
          try {
            if (retry > 0) {
              console.log(`${reqTag}Retrying model ${mId} (Attempt ${retry + 1}/${maxRetries + 1}) after rate limit pause...`);
              await new Promise(resolve => setTimeout(resolve, 1200 * retry));
            } else {
              console.log(`${reqTag}Calling @google/genai model: ${mId}...`);
            }

            const response = await client.models.generateContent({
              model: mId,
              contents,
            });

            const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (text) {
              console.log(`${reqTag}@google/genai (${mId}) response received successfully.`);
              return { text, model: `vertex-ai (${mId})` };
            }
          } catch (modelErr) {
            lastError = modelErr;
            const errStr = modelErr.message || String(modelErr);
            const isRateLimit = errStr.includes('429') || errStr.includes('Resource exhausted');
            console.warn(`${reqTag}Model ${mId} attempt note: ${errStr.slice(0, 150)}`);

            if (isRateLimit && retry < maxRetries) {
              continue;
            }
            break;
          }
        }
      }
    }

    if (lastError) throw lastError;
  }

  throw new Error('Google Cloud Vertex AI (@google/genai) is not initialized with Application Default Credentials (ADC).');
};

// ─── OpenAI Chat ──────────────────────────────────────────────────────────────
const chatWithOpenAI = async (messages, options = {}) => {
  const client = getOpenAIClient();
  const systemMsg = { role: 'system', content: buildSystemPrompt(options) };
  const fullMessages = [systemMsg, ...messages.map((m) => ({
    role: m.role === 'model' ? 'assistant' : m.role,
    content: m.content,
  }))];

  const response = await client.chat.completions.create({
    model: options.modelId || 'gpt-4o',
    messages: fullMessages,
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 4096,
  });

  return {
    text: response.choices[0].message.content,
    model: 'gpt-4o',
    usage: response.usage,
  };
};

// ─── Groq Chat ────────────────────────────────────────────────────────────────
const chatWithGroq = async (messages, options = {}) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('GROQ_API_KEY not set in environment');
  }

  const systemMsg = { role: 'system', content: buildSystemPrompt(options) };
  const fullMessages = [systemMsg, ...messages.map((m) => ({
    role: m.role === 'model' ? 'assistant' : m.role,
    content: m.content,
  }))];

  const response = await axios.post(
    GROQ_BASE_URL,
    {
      model: options.modelId || 'llama-3.1-70b-versatile',
      messages: fullMessages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4096,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );

  return {
    text: response.data.choices[0].message.content,
    model: 'groq-llama3',
    usage: response.data.usage,
  };
};

// ─── Smart Fallback Response Generator ───────────────────────────────────────
const resolveBrandName = (options = {}) => {
  if (typeof options.brandName === 'string' && options.brandName.trim()) {
    return options.brandName.trim();
  }
  if (typeof options.brandContext === 'string' && options.brandContext.trim()) {
    return options.brandContext.trim().slice(0, 40);
  }
  if (options.brandContext && typeof options.brandContext === 'object') {
    if (typeof options.brandContext.brandName === 'string' && options.brandContext.brandName.trim()) {
      return options.brandContext.brandName.trim();
    }
  }
  return 'Your Brand';
};

const generateSmartFallbackJSON = (prompt, options = {}) => {
  const brandName = resolveBrandName(options);
  const topicMatch = prompt.match(/about:\s*"([^"]+)"/i) || prompt.match(/topic:\s*([^\n]+)/i) || prompt.match(/keyword:\s*"([^"]+)"/i) || prompt.match(/for:\s*"([^"]+)"/i);
  const topic = topicMatch ? topicMatch[1].trim() : 'Modern Growth Marketing';

  const isSocial = /social|instagram|linkedin|facebook|twitter|post|hook/i.test(prompt);
  const isBlog = /blog|article|readingTime/i.test(prompt);
  const isAdCopy = /ad copy|headlines|callToActions/i.test(prompt);
  const isEmail = /email|newsletter|subject|preheader/i.test(prompt);
  const isSeo = /seo|brief|metaDescription|searchIntent/i.test(prompt);

  if (isSocial) {
    return {
      hook: `🚀 Transform your ${topic} strategy with ${brandName}!`,
      shortCaption: `Discover how ${brandName} revolutionizes ${topic} for peak growth.`,
      caption: `Ready to elevate your ${topic}? At ${brandName}, we combine innovative strategies with modern execution to deliver high-converting social content. Explore our full suite of AI tools to automate and scale your brand presence today!`,
      longCaption: `Are you looking to scale ${topic}? Building a sustainable brand requires consistent, high-impact content.\n\nHere is how ${brandName} empowers your workflow:\n1. Targeted Audience Alignment\n2. High-Converting Copy & Visuals\n3. Automated Multi-Channel Scheduling\n\nTake action today and transform your content strategy with ${brandName}.`,
      cta: `👉 Click the link in bio or visit ${brandName} to unlock instant access!`,
      hashtags: [`#${brandName.replace(/\s+/g, '')}`, `#${topic.replace(/[^a-zA-Z0-9]/g, '')}`, '#GrowthMarketing', '#AIContent', '#MarketingStrategy'],
      creativeVariations: [
        {
          type: 'STORYTELLING ANGLE',
          text: `How ${brandName} revolutionized ${topic} by focusing on audience-first value and data-driven insights.`
        },
        {
          type: 'PROBLEM-SOLUTION',
          text: `Struggling with ${topic}? Here is how ${brandName} solves low engagement and saves you hours every week.`
        }
      ],
      imagePrompt: `Professional high-resolution commercial photography representing ${topic} for ${brandName}, 8k resolution, studio lighting, modern sleek aesthetic`,
      bestTimeToPost: '9:00 AM - 11:00 AM EST',
      expectedEngagement: 'High (85%+ Target Reach)'
    };
  }

  if (isBlog) {
    return {
      title: `The Ultimate Guide to ${topic} for ${brandName}`,
      metaDescription: `Discover the top strategies for ${topic} with ${brandName}. Learn key takeaways and growth frameworks.`,
      content: `## Introduction\nIn today's digital landscape, ${topic} plays a pivotal role in driving sustainable brand growth...\n\n## 1. Understanding ${topic}\nBuilding a powerful brand requires strategic alignment...\n\n## 2. Key Action Steps\nImplement data-backed strategies to maximize reach and ROI.\n\n## Conclusion\nReady to get started? Connect with ${brandName} today!`,
      wordCount: 800,
      readingTime: '4 min read',
      seoScore: 88,
      keywords: [topic, brandName, 'Growth', 'Strategy'],
      outline: ['Introduction', `Understanding ${topic}`, 'Key Action Steps', 'Conclusion'],
      internalLinkSuggestions: ['Content Studio', 'SEO Intelligence']
    };
  }

  if (isAdCopy) {
    return {
      headlines: [`Scale ${topic} Fast`, `${brandName}: #1 Choice`, 'Boost Your ROI Today'],
      descriptions: [`Transform your ${topic} with ${brandName}. Get started with high-converting campaigns.`, `Automate and scale ${topic} in minutes. Try ${brandName} today.`],
      callToActions: ['Get Started', 'Learn More', 'Claim Free Trial'],
      longFormAd: `🚀 Are you struggling with ${topic}?\n\nDiscover how ${brandName} helps businesses scale faster with intelligent automation and data-driven insights.\n\n👉 Click below to start today!`,
      shortAd: `Transform your ${topic} with ${brandName}. High-converting ad campaigns created in seconds. Try it now!`,
      keyBenefits: ['Instant Automation', 'Higher Conversion Rates', 'Data-Backed Strategy']
    };
  }

  if (isSeo) {
    return {
      primaryKeyword: topic,
      secondaryKeywords: [`${topic} strategy`, `best ${topic} tools`, `${brandName} ${topic}`],
      suggestedTitles: [`Mastering ${topic}: A Complete Guide`, `Top 10 ${topic} Strategies for 2026`, `${topic} Best Practices`],
      metaDescription: `Comprehensive guide to ${topic}. Learn how ${brandName} helps you optimize content and rank higher.`,
      contentOutline: [`Introduction to ${topic}`, 'Core Strategies', 'Optimization Checklist', 'Summary'],
      wordCountTarget: 1500,
      searchIntent: 'informational',
      competitorTopics: [`${topic} tools`, `${topic} tutorials`],
      faqSuggestions: [`What is ${topic}?`, `How does ${brandName} improve ${topic}?`],
      internalLinkOpportunities: ['SEO Studio', 'Brand Memory']
    };
  }

  return {
    success: true,
    topic,
    brandName,
    summary: `AI Generated insights for ${topic}`,
    content: `High-converting content for ${topic} powered by ${brandName}.`,
    cta: `Explore ${brandName} features today!`
  };
};

const generateSmartFallbackResponse = (messages, options = {}) => {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || 'marketing strategy';
  const queryLower = lastUserMsg.toLowerCase().trim();
  const brandName = resolveBrandName(options);

  // 1. Check for casual/conversational questions (Hindi, Hinglish, English)
  const isCasualOrFoodQuery = /khana|khaya|khaye|\bfood\b|\blunch\b|\bdinner\b|\beat\b|\bate\b|\bbreakfast\b|chai|nashta|kaise ho|kya haal|kya kar|hello|hi\b|hey\b|namaste|who are you|kon ho|kaun ho|kaun hai/i.test(queryLower);
  
  if (isCasualOrFoodQuery) {
    if (/khana|khaya|khaye|\beat\b|\bfood\b|\bdinner\b|\blunch\b/i.test(queryLower)) {
      return {
        text: `Main ek AI Ads™ Assistant hu, toh main khana nahi khata! Lekin main 100% active hu aur **${brandName}** ke marketing strategies, social media posts, Meta & Google ads, aur sales funnels scale karne ke liye ready hu.\n\nAap bataiye, aaj aapke brand ke liye konsa marketing target achieve karein?`,
        model: 'AI Ads™ Intelligence Engine',
        fallback: true
      };
    }
    return {
      text: `Hello! Main AI Ads™ Assistant hu, aapka expert AI marketing copilot for **${brandName}**.\n\nMain aapke brand ke liye:\n- **Instagram & Social Growth Strategies**\n- **High-Converting Ad Copywriting (PAS / AIDA)**\n- **LinkedIn B2B Thought Leadership**\n- **SEO & Search Keyword Targeting**\n- **Full-Funnel Growth Roadmaps (TOFU / MOFU / BOFU)**\n\nBataiye, aaj hum kis marketing strategy ya platform par kaam karein?`,
      model: 'AI Ads™ Intelligence Engine',
      fallback: true
    };
  }

  // 2. Check for Instagram / Reels / Carousel / Visual Content queries
  const isInstagramQuery = /instagram|reel|carousel|story|grid|ig\b/i.test(queryLower);
  if (isInstagramQuery) {
    return {
      text: `### 📸 High-Converting Instagram Growth Strategy for ${brandName}\n\n` +
            `To build an engaging, viral, and revenue-generating Instagram presence for **${brandName}**, implement this 4-pillar strategy:\n\n` +
            `#### 1. The 3-Second Hook Formula (Reels & Carousels)\n` +
            `- **Visual Hook:** First 3 seconds must feature movement, text overlay, or an intriguing problem statement.\n` +
            `- **Text Hook Examples:**\n` +
            `  * *"3 mistakes most brands make with ${brandName} strategy..."*\n` +
            `  * *"The secret framework behind 10x engagement for ${brandName}..."*\n\n` +
            `#### 2. The 70-20-10 Content Rule\n` +
            `- **70% Value & Education:** Tips, tutorials, industry insights, and relatable carousels.\n` +
            `- **20% Social Proof & Behind the Scenes:** Customer reviews, case studies, and brand story.\n` +
            `- **10% Direct Sales & Offers:** High-urgency CTAs leading to your landing page or shop.\n\n` +
            `#### 3. Hashtag & Distribution Framework\n` +
            `- Use 5–8 focused hashtags: 2 Niche Broad (` + `\`#MarketingStrategy\`` + `), 3 Specific (` + `\`#${brandName.replace(/\s+/g, '')}Growth\`` + `), 2 Target Audience focused.\n` +
            `- Best Posting Times: 9:00 AM – 11:00 AM and 6:00 PM – 8:00 PM EST.\n\n` +
            `💡 *Pro-Tip: You can use **Content Studio (Module 6)** or click **"+ Quick Post"** in the top bar to generate ready-to-publish Instagram posts, carousels, and captions tailored to your Brand DNA!*`,
      model: 'AI Ads™ Intelligence Engine',
      fallback: true
    };
  }

  // 3. Check for LinkedIn / B2B Growth queries
  const isLinkedInQuery = /linkedin|b2b|thought leadership|outreach|professional|connection/i.test(queryLower);
  if (isLinkedInQuery) {
    return {
      text: `### 💼 LinkedIn B2B Authority & Organic Growth Strategy for ${brandName}\n\n` +
            `LinkedIn requires a value-first, personal authority approach to convert connection views into high-paying client inquiries:\n\n` +
            `#### 1. Content Pillars for ${brandName}\n` +
            `- **Industry Frameworks:** Step-by-step guides breakdown of how ${brandName} solves market bottlenecks.\n` +
            `- **Case Studies & Results:** *"How we achieved 3x ROI using this exact framework..."*\n` +
            `- **Contrarian Industry Opinions:** Challenge outdated industry myths to spark comments.\n\n` +
            `#### 2. High-Engagement Post Structure\n` +
            `- **Line 1 (The Scroll-Stopper):** Single short sentence that creates curiosity.\n` +
            `- **Body (Whitespace Formatting):** Short 1-2 line paragraphs with bullet points.\n` +
            `- **Bottom Call to Action:** *"What is your experience with this? Drop your thoughts below 👇"*\n\n` +
            `#### 3. Growth Tactics\n` +
            `- Leave 5 insightful comments on key decision-makers' posts daily.\n` +
            `- Repurpose key insights into downloadable PDF document carousels.\n\n` +
            `💡 *Pro-Tip: Open **Content Studio (Module 6)** to auto-generate LinkedIn text posts and professional carousels formatted for maximum reach!*`,
      model: 'AI Ads™ Intelligence Engine',
      fallback: true
    };
  }

  // 4. Check for Facebook / Meta Ads / Copywriting queries
  const isAdCopyQuery = /facebook|meta ad|ad copy|headline|copywriting|pas|aida|ad campaign|creative ad/i.test(queryLower);
  if (isAdCopyQuery) {
    return {
      text: `### 🎯 High-Converting Facebook & Meta Ad Strategy for ${brandName}\n\n` +
            `To achieve optimal ROAS (Return On Ad Spend), structure your ad creative and copy around proven psychological frameworks:\n\n` +
            `#### 1. PAS Copywriting Framework (Problem - Agitate - Solve)\n` +
            `- **Problem:** *"Struggling to scale your marketing efficiency for ${brandName}?"*\n` +
            `- **Agitate:** *"Wasting budget on low-converting ads and manual design work?"*\n` +
            `- **Solve:** *"Meet ${brandName}: Automated AI visual creation and high-converting ad copy in 1 click."*\n\n` +
            `#### 2. Ad Creative Best Practices\n` +
            `- **Primary Text:** Keep under 125 characters or use structured long-form bullet points.\n` +
            `- **Headline:** 4-7 words highlighting instant benefit (*"Scale ${brandName} Marketing Today"*).\n` +
            `- **CTA Button:** Use *"Learn More"* for cold audiences or *"Get Offer"* for retargeting.\n\n` +
            `#### 3. Audience Funnel Split\n` +
            `- **TOFU (Cold Audience):** Broad interest targeting focused on video hooks & educational pain points.\n` +
            `- **BOFU (Retargeting):** Offer discounts, testimonials, and 1-on-1 guarantee CTAs.\n\n` +
            `💡 *Pro-Tip: Navigate to **Creative Studio (Module 9)** to generate high-converting AI ad banners and visual ad variations instantly!*`,
      model: 'AI Ads™ Intelligence Engine',
      fallback: true
    };
  }

  // 5. Check for YouTube / Video Content queries
  const isYouTubeQuery = /youtube|video|shorts|vtuber|thumbnail|script/i.test(queryLower);
  if (isYouTubeQuery) {
    return {
      text: `### 🎥 YouTube & Short-Form Video Growth Blueprint for ${brandName}\n\n` +
            `#### 1. The 5-Second Video Retention Formula\n` +
            `- **0–5 Seconds:** Deliver on the video title immediately. No long intro logos.\n` +
            `- **5–30 Seconds:** Outline the 3 main takeaways the viewer will gain.\n` +
            `- **Body Content:** Deliver actionable value with screen transitions every 4–6 seconds.\n\n` +
            `#### 2. YouTube Shorts Tactics\n` +
            `- Keep duration between 25 and 45 seconds for maximum completion rate.\n` +
            `- Loop the ending sentence back to the opening hook for seamless repeat plays.\n\n` +
            `#### 3. Thumbnail & Title Optimization\n` +
            `- Use high-contrast colors (Yellow/Red text on Dark Backgrounds).\n` +
            `- Limit thumbnail text to 3 strong words.\n\n` +
            `💡 *Pro-Tip: Use **Content Studio (Module 6)** to script complete YouTube video outlines and short scripts tailored to your brand!*`,
      model: 'AI Ads™ Intelligence Engine',
      fallback: true
    };
  }

  // 6. Check for SEO / Search Engine Optimization queries
  const isSeoQuery = /seo|keyword|search engine|google rank|meta description|backlink/i.test(queryLower);
  if (isSeoQuery) {
    return {
      text: `### 🔍 Comprehensive SEO & Search Growth Strategy for ${brandName}\n\n` +
            `#### 1. Search Intent Targeting\n` +
            `- **Informational Keywords:** How-to guides, tutorials, and comparison articles.\n` +
            `- **Commercial Keywords:** *"Best tools for ${brandName}"*, reviews, and comparison matrices.\n` +
            `- **Transactional Keywords:** *"Buy ${brandName} services"*, pricing plans.\n\n` +
            `#### 2. On-Page SEO Checklist\n` +
            `- Include primary keyword in H1 tag, URL slug, and first 100 words.\n` +
            `- Write compelling meta descriptions (150-160 characters) with direct CTAs.\n` +
            `- Ensure internal linking between blog articles and service/landing pages.\n\n` +
            `💡 *Pro-Tip: Go to **SEO Intelligence (Module 3)** to perform automated keyword cluster analysis and generate instant SEO briefs for ${brandName}!*`,
      model: 'AI Ads™ Intelligence Engine',
      fallback: true
    };
  }

  // 7. General Marketing & Growth Funnel Response
  return {
    text: `### 🚀 Growth Strategy & Marketing Roadmap for ${brandName}\n\n` +
          `To build a sustainable, high-converting marketing engine for **${brandName}**, implement this full-funnel framework:\n\n` +
          `#### 1. Top of Funnel (TOFU) – Awareness & Reach\n` +
          `- **Social Media Distribution:** Consistent short-form video reels, LinkedIn posts, and Instagram carousels focused on audience pain points.\n` +
          `- **SEO Content:** High-intent blog posts answering key industry search queries.\n\n` +
          `#### 2. Middle of Funnel (MOFU) – Lead Nurturing & Trust\n` +
          `- **Lead Magnets:** Free checklists, templates, or ROI calculators in exchange for email signups.\n` +
          `- **Social Proof:** Case studies, customer testimonials, and visual product demonstrations.\n\n` +
          `#### 3. Bottom of Funnel (BOFU) – High Conversion\n` +
          `- **Dedicated Landing Pages:** High-speed, mobile-optimized landing pages with clear CTAs.\n` +
          `- **Retargeting Ads & Email Sequences:** Abandoned funnel follow-ups and limited-time incentives.\n\n` +
          `💡 *Need to execute this strategy? Open **Strategy (Module 4)** for custom campaign roadmaps, or **Content Studio (Module 6)** to create assets instantly!*`,
    model: 'AI Ads™ Intelligence Engine',
    fallback: true
  };
};

// ─── Main Chat Dispatcher with Robust Fallback Chain ──────────────────────────
const chat = async (messages, options = {}) => {
  const reqTag = options.reqId ? `[WB:${options.reqId}] ` : '[AI-Service] ';
  const modelChoice = (options.model || 'gemini').toLowerCase();

  const geminiAvailable = !!aiClient;

  // Print generated prompt to terminal
  const lastUserMsg = messages && messages.length > 0 ? (messages[messages.length - 1].content || '') : '';
  console.log('\n==================================================');
  console.log(`🤖 [GENERATED AI TEXT PROMPT] (${options.model || 'gemini'})`);
  console.log('==================================================');
  console.log(lastUserMsg.trim() || JSON.stringify(messages, null, 2));
  console.log('==================================================\n');

  console.log(`${reqTag}AI Request initiated. Target provider: ${modelChoice}, Gemini Available: ${geminiAvailable}`);

  try {
    if (modelChoice === 'gpt-4o' || modelChoice === 'openai') {
      console.log(`${reqTag}Selected AI provider: OpenAI (Model: gpt-4o)`);
      return await chatWithOpenAI(messages, options);
    } else if (!geminiAvailable) {
      console.log(`${reqTag}Gemini/Vertex not configured. Attempting OpenAI GPT-4o...`);
      return await chatWithOpenAI(messages, options);
    } else {
      console.log(`${reqTag}Selected AI provider: Gemini / Vertex AI`);
      return await chatWithGemini(messages, options);
    }
  } catch (primaryError) {
    const safeError = primaryError.message ? primaryError.message.replace(/(key|token|auth)=[^&\s]+/gi, '$1=***') : 'Unknown error';
    console.warn(`${reqTag}Primary AI provider failed (${safeError}). Attempting OpenAI fallback...`);
    try {
      console.log(`${reqTag}OpenAI fallback started...`);
      return await chatWithOpenAI(messages, options);
    } catch (fallbackError) {
      const safeFbError = fallbackError.message ? fallbackError.message.replace(/(key|token|auth)=[^&\s]+/gi, '$1=***') : 'Unknown error';
      console.warn(`${reqTag}All external AI APIs failed (${safeFbError}). Activating AI Ads™ Smart Fallback Engine...`);
      return generateSmartFallbackResponse(messages, options);
    }
  }
};

const generate = async (prompt, options = {}) => {
  return chat([{ role: 'user', content: prompt }], options);
};

const generateJSON = async (prompt, options = {}) => {
  const reqTag = options.reqId ? `[WB:${options.reqId}] ` : '[AI-Service] ';
  const targetLang = options.targetLanguage || options.language;
  const langDirective = targetLang ? `\nCRITICAL LANGUAGE INSTRUCTION: Write and output ALL text, headlines, titles, copy, descriptions, hooks, sections, and content strictly in "${targetLang}" language.` : '';
  const jsonInstruction = `\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanation. Just raw JSON.${langDirective}`;

  console.log(`${reqTag}AI generateJSON started (${targetLang || 'English'})...`);

  let result = null;
  try {
    result = await generate(prompt + jsonInstruction, options);
  } catch (genErr) {
    console.warn(`${reqTag}AI generate threw error (${genErr.message}). Using Smart Fallback JSON.`);
  }

  if (!result || !result.text || result.fallback) {
    console.log(`${reqTag}Using Smart Fallback JSON structure.`);
    const fallbackData = generateSmartFallbackJSON(prompt, options);
    return { data: fallbackData, model: 'AI Ads™ Smart Fallback Engine' };
  }

  try {
    const cleaned = result.text.replace(/```json\n?|```\n?/g, '').trim();
    const data = JSON.parse(cleaned);
    console.log(`${reqTag}AI response received & JSON parsed successfully. Model: ${result.model}`);
    return { data, model: result.model };
  } catch (e) {
    console.warn(`${reqTag}Standard JSON parse failed, attempting smart repair...`);
    try {
      let raw = result.text.replace(/```json\n?|```\n?/g, '').trim();
      const firstBrace = raw.indexOf('{');
      const lastBrace = raw.lastIndexOf('}');
      if (firstBrace !== -1) {
        if (lastBrace > firstBrace) {
          raw = raw.substring(firstBrace, lastBrace + 1);
        } else {
          raw = raw.substring(firstBrace) + '"}';
        }
        const data = JSON.parse(raw);
        console.log(`${reqTag}Repaired and parsed JSON successfully.`);
        return { data, model: result.model };
      }
    } catch (repairErr) {
      // Fallback: Extract partial fields with regex
      const partialData = {};
      const expMatch = result.text.match(/"explanation":\s*"([^"]+)"/);
      if (expMatch) partialData.explanation = expMatch[1];
      const titleMatch = result.text.match(/"updatedTitle":\s*"([^"]+)"/);
      if (titleMatch) partialData.updatedTitle = titleMatch[1];

      if (Object.keys(partialData).length > 0) {
        console.log(`${reqTag}Extracted partial JSON fields successfully.`);
        return { data: partialData, model: result.model };
      }
    }
    console.warn(`${reqTag}JSON parsing failed on AI response snippet. Using Smart Fallback JSON.`);
    const fallbackData = generateSmartFallbackJSON(prompt, options);
    return { data: fallbackData, model: 'AI Ads™ Smart Fallback Engine' };
  }
};

const generateCaptions = async (prompt, options = {}) => {
  // Short caption request (<= 60 chars)
  const shortInstruction = `\n\nPLEASE RETURN ONLY A SHORT CAPTION (max 60 characters) for the content below.\nSEO focus: ${options.seo || 'generic SEO'}\nStrategy: ${options.strategy || 'general marketing'}`;
  const shortResult = await generate(prompt + shortInstruction, options);
  const shortCaption = shortResult.text.trim();

  // Long caption request (up to 150 chars)
  const longInstruction = `\n\nPLEASE RETURN ONLY A LONG CAPTION (max 150 characters) for the content below.\nSEO focus: ${options.seo || 'generic SEO'}\nStrategy: ${options.strategy || 'general marketing'}`;
  const longResult = await generate(prompt + longInstruction, options);
  const longCaption = longResult.text.trim();

  return {
    shortCaption,
    longCaption,
    // include raw texts for debugging if needed
    rawShort: shortResult.text,
    rawLong: longResult.text,
  };
};

module.exports = { chat, generate, generateJSON, generateCaptions, chatWithGemini, chatWithOpenAI };
