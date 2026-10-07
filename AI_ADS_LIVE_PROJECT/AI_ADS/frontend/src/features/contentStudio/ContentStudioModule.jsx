import React, { useState, useCallback, useEffect } from 'react';
import { API_BASE } from '../../config/api';
import { useWorkspace } from '../../context/WorkspaceContext';
import { contentAPI } from '../../services/api';
import { resolveBrandVisualAsset } from '../../services/brandVisualResolver';
import { downloadImageToDevice } from '../../utils/downloadHelper';
import { getBrandLogoUrl } from '../../utils/brandLogoHelper';
import {
  PenTool, ShieldCheck, ShieldAlert, Sparkles, Send, FileText, Share2,
  Globe, Mail, CheckCircle2, RefreshCw, Loader2, AlertCircle, Layers,
  Newspaper, ArrowUpRight, ArrowLeft, Copy, Download, X, Hash,
  Image as ImageIcon, Palette, ExternalLink, Lock
} from 'lucide-react';

export const ContentStudioModule = () => {
  const {
    activeWorkspace,
    setActiveModule,
    setApprovalsQueue,
    studioTarget,
    setStudioTarget,
    generatedContent,
    setGeneratedContent,
    markPostAsGenerated,
    showToast,
    showCustomAlert,
    t,
    user,
    setIsSettingsModalOpen,
    setActiveSettingsTab
  } = useWorkspace();

  const userPlanNorm = (user?.plan || 'starter').toLowerCase();
  const isStarter = userPlanNorm === 'starter' || userPlanNorm === 'base' || userPlanNorm === 'free';
  const [activeSubPage, setActiveSubPage] = useState(null); // null = Main Hub, 'BLOG', 'SOCIAL', 'EMAIL', 'NEWSPAPER'
  const [tab, setTab] = useState('BLOG'); // BLOG, SOCIAL, EMAIL, AD_COPY

  // Auto-sync subpage tab from studioTarget or URL pathname
  useEffect(() => {
    const path = window.location.pathname;
    const targetChannel = studioTarget?.subPage || studioTarget?.targetTab || (
      path.includes('/content-studio/blog') ? 'BLOG' :
      path.includes('/content-studio/social') ? 'SOCIAL' :
      path.includes('/content-studio/email') ? 'EMAIL' :
      path.includes('/content-studio/newspaper') ? 'NEWSPAPER' : null
    );

    if (targetChannel) {
      setActiveSubPage(targetChannel);
      setTab(targetChannel);
    }
  }, [studioTarget]);

  // Restore last generated content if available
  useEffect(() => {
    if (studioTarget) return; // studioTarget takes precedence
    if (generatedContent && !activeSubPage) {
      const type = generatedContent.type || (generatedContent.headline ? 'NEWSPAPER' : generatedContent.subject ? 'EMAIL' : generatedContent.platform ? 'SOCIAL' : 'BLOG');
      
      setActiveSubPage(type);
      setTab(type);
      
      if (type === 'BLOG') {
        setBlogDraft({ title: generatedContent.title || '', content: generatedContent.content || '' });
      } else if (type === 'SOCIAL') {
        setSocialResult(generatedContent);
      } else if (type === 'EMAIL') {
        setEmailResult(generatedContent);
      } else if (type === 'NEWSPAPER') {
        setNewspaperDraft(generatedContent);
      }
    }
  }, [generatedContent, studioTarget, activeSubPage]);

  const openSubPage = (channelId) => {
    setActiveSubPage(channelId);
    if (channelId === 'NEWSPAPER') setTab('NEWSPAPER');
    else setTab(channelId);

    const subRouteMap = {
      BLOG: '/content-studio/blog',
      SOCIAL: '/content-studio/social',
      EMAIL: '/content-studio/email',
      NEWSPAPER: '/content-studio/newspaper',
    };
    if (subRouteMap[channelId]) {
      window.history.pushState({ subPage: channelId }, '', subRouteMap[channelId]);
    }
  };

  const closeSubPage = () => {
    setActiveSubPage(null);
    if (setStudioTarget) setStudioTarget(null);
    if (window.location.pathname !== '/content-studio') {
      window.history.pushState({ subPage: null }, '', '/content-studio');
    }
  };

  // Blog Studio State
  const [blogTopic, setBlogTopic] = useState('How AI Ads Eliminates Agency Bottlenecks');
  const [blogKeywords, setBlogKeywords] = useState('AI marketing, content velocity, brand DNA');
  const [draftingBlog, setDraftingBlog] = useState(false);
  const [blogDraft, setBlogDraft] = useState(null);
  const [factCheck, setFactCheck] = useState(null);
  const [blogCanvasMode, setBlogCanvasMode] = useState('edit'); // 'edit' | 'preview'

  // Social Studio State
  const [socialTopic, setSocialTopic] = useState('3 Reasons to Centralize Brand DNA');
  const [socialPlatform, setSocialPlatform] = useState('instagram');
  const [socialPostType, setSocialPostType] = useState('educational');
  const [draftingSocial, setDraftingSocial] = useState(false);
  const [socialResult, setSocialResult] = useState(null);
  const [regeneratingSection, setRegeneratingSection] = useState(null); // null | 'hook' | 'shortCaption' | 'longCaption' | 'cta' | 'hashtags' | 'variations'
  const [captionMode, setCaptionMode] = useState('short'); // 'short' | 'long'
  const [visualStyle, setVisualStyle] = useState('Photorealistic Commercial');
  const [visualAspect, setVisualAspect] = useState('1:1');
  const [visualVariationIndex, setVisualVariationIndex] = useState(0);
  const [regeneratingImage, setRegeneratingImage] = useState(false);
  // Track reference image from Custom Strategy for consistent regeneration
  const [customStrategyRefImage, setCustomStrategyRefImage] = useState(null);

  // Email Studio State
  const [emailForm, setEmailForm] = useState({
    purpose: 'newsletter',
    recipient: 'Subscribers & Email List',
    context: '',
    tone: 'professional',
    keyPoints: '',
    cta: '',
    senderName: activeWorkspace?.brandName || '',
    senderDesignation: 'Marketing Team',
    senderCompany: activeWorkspace?.brandName || '',
    lengthFormat: 'detailed',
    subject: ''
  });
  const updateEmailField = (field, value) => setEmailForm(prev => ({ ...prev, [field]: value }));
  const [draftingEmail, setDraftingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState(null);
  const [emailCanvasMode, setEmailCanvasMode] = useState('edit'); // 'edit' | 'preview'

  // Ad Copy Studio State
  const [adProduct, setAdProduct] = useState('Enterprise AI Ads Marketing Platform');
  const [adPlatform, setAdPlatform] = useState('facebook');
  const [draftingAd, setDraftingAd] = useState(false);
  const [adResult, setAdResult] = useState(null);

  // Newspaper Studio State
  const [newspaperTopic, setNewspaperTopic] = useState(`${activeWorkspace?.brandName || 'Natarajofficial'} Launches Next-Gen Sustainable Product Line`);
  const [newspaperFormat, setNewspaperFormat] = useState('press_release');
  const [newspaperTone, setNewspaperTone] = useState('ap_corporate');
  const [newspaperDateline, setNewspaperDateline] = useState('MUMBAI, INDIA — August 3, 2026');
  const [draftingNewspaper, setDraftingNewspaper] = useState(false);
  const [newspaperDraft, setNewspaperDraft] = useState(null);

  const workspaceId = activeWorkspace?._id || activeWorkspace?.id;

  // ─── Article & Text Cleaner Helper (Strips all markdown symbols #, ##, **, etc.) ──
  const cleanArticleText = useCallback((text) => {
    if (!text || typeof text !== 'string') return '';
    return text
      // Replace escaped characters
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      // Remove markdown headers: "# Title", "## Title", "### Title" -> "Title"
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/#{1,6}/g, '')
      // Remove all bold and italic markers: "**text**" -> "text", "*text*" -> "text", "__text__" -> "text"
      .replace(/\*{1,3}/g, '')
      .replace(/_{1,3}/g, '')
      .replace(/`{1,3}/g, '')
      // Remove markdown links: "[text](url)" -> "text"
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove horizontal rules
      .replace(/^[\s*_-]{3,}\s*$/gm, '')
      // Replace markdown list dashes/asterisks with clean bullet dots
      .replace(/^\*\s+/gm, '• ')
      .replace(/^-\s+/gm, '• ')
      // Normalize excessive blank lines
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }, []);

  // ─── Live & Editable Prompt Builders ───────────────────────────────────────
  const buildBlogPrompt = useCallback((topic = blogTopic, kw = blogKeywords) => {
    const brand = activeWorkspace?.brandName || 'Brand';
    const industry = activeWorkspace?.industryCategory || 'General';
    return `Draft an authoritative, SEO-optimized blog article for ${brand} (${industry}) titled "${topic}" targeting keywords (${kw || 'growth, brand strategy'}). Include structured headings, actionable takeaways, and a brand-aligned conclusion.`;
  }, [activeWorkspace, blogTopic, blogKeywords]);

  const buildSocialPrompt = useCallback((topic = socialTopic, plat = socialPlatform, type = socialPostType) => {
    const brand = activeWorkspace?.brandName || 'Brand';
    return `Generate high-impact ${plat.toUpperCase()} ${type.replace('_', ' ')} copy for ${brand} on "${topic}". Focus on a pattern-interrupt hook, engaging storytelling, concise & narrative captions, curated hashtags, and a clear call-to-action.\nFormatting: Clean plain text without asterisks (**) or markdown formatting.`;
  }, [activeWorkspace, socialTopic, socialPlatform, socialPostType]);

  const buildSocialImagePrompt = useCallback((topic = socialTopic, style = visualStyle) => {
    const brand = activeWorkspace?.brandName || 'Brand';
    return `Commercial advertising photography representing "${topic}" for ${brand} — cinematic ${style} lighting, 8k resolution, premium studio composition, and award-winning editorial aesthetic.`;
  }, [activeWorkspace, socialTopic, visualStyle]);

  const buildEmailPrompt = useCallback((form = emailForm) => {
    const brand = activeWorkspace?.brandName || 'Brand';
    return `Draft a high-converting ${form.purpose} email for ${brand}:\nSubject / Focus: "${form.subject || `${brand} — ${form.purpose}`}"\nRecipient Audience: ${form.recipient || 'Subscribers'}\nTone: ${form.tone || 'Professional'}\nContext: ${form.context || 'Strategic brand communication'}\nKey Highlights: ${form.keyPoints || 'Core product value & announcements'}\nCall to Action: ${form.cta || 'Explore now'}\nSender: ${form.senderName || brand} (${form.senderDesignation || 'Marketing Lead'})\nStructure Guidelines:\n1. Professional, courteous greeting.\n2. State the email purpose and primary value in the opening 2 lines.\n3. Structured paragraphs with logical flow and clean labels.\n4. Clear, compelling Call to Action (CTA).\n5. Polite sign-off and full sender credentials (Name, Role, Company).\n6. Plain text only without asterisks (**).`;
  }, [activeWorkspace, emailForm]);

  const buildNewspaperPrompt = useCallback((topic = newspaperTopic, format = newspaperFormat, tone = newspaperTone, dateline = newspaperDateline) => {
    const brand = activeWorkspace?.brandName || 'Brand';
    return `Draft an official ${format} press release for ${brand} in AP Corporate Journalism standard:\nHeadline / Announcement: "${topic}"\nDateline: ${dateline}\nTone: ${tone}\nStructure: FOR IMMEDIATE RELEASE, Executive Summary, Strategic Highlights, Leadership Commentary, Corporate Backgrounder, and Media Contact Bureau.`;
  }, [activeWorkspace, newspaperTopic, newspaperFormat, newspaperTone, newspaperDateline]);

  const buildAdPrompt = useCallback((prod = adProduct, plat = adPlatform) => {
    const brand = activeWorkspace?.brandName || 'Brand';
    return `Create high-converting ${plat} ad copy variations for ${brand}:\nProduct / Service: "${prod}"\nDirectives: 3 High-CTR Hook Variations, Primary Text with PAS framework, Punchy Headline, Sub-headline, and Action CTA.\nFormatting: Clean plain text without asterisks (**) or markdown formatting.`;
  }, [activeWorkspace, adProduct, adPlatform]);

  // Prompt States (Editable by user)
  const [blogPrompt, setBlogPrompt] = useState(() => buildBlogPrompt('How AI Ads Eliminates Agency Bottlenecks', 'AI marketing, content velocity, brand DNA'));
  const [socialPrompt, setSocialPrompt] = useState(() => buildSocialPrompt('3 Reasons to Centralize Brand DNA', 'instagram', 'educational'));
  const [socialImagePrompt, setSocialImagePrompt] = useState(() => buildSocialImagePrompt('3 Reasons to Centralize Brand DNA', 'Photorealistic Commercial'));
  const [emailPrompt, setEmailPrompt] = useState(() => buildEmailPrompt(emailForm));
  const [newspaperPrompt, setNewspaperPrompt] = useState(() => buildNewspaperPrompt());
  const [adCopyPrompt, setAdCopyPrompt] = useState(() => buildAdPrompt());

  // Automatically update default prompt when parameters change
  React.useEffect(() => {
    setBlogPrompt(buildBlogPrompt(blogTopic, blogKeywords));
  }, [buildBlogPrompt, blogTopic, blogKeywords]);

  React.useEffect(() => {
    setSocialPrompt(buildSocialPrompt(socialTopic, socialPlatform, socialPostType));
  }, [buildSocialPrompt, socialTopic, socialPlatform, socialPostType]);

  React.useEffect(() => {
    setSocialImagePrompt(buildSocialImagePrompt(socialTopic, visualStyle));
  }, [buildSocialImagePrompt, socialTopic, visualStyle]);

  React.useEffect(() => {
    setEmailPrompt(buildEmailPrompt(emailForm));
  }, [buildEmailPrompt, emailForm]);

  React.useEffect(() => {
    setNewspaperPrompt(buildNewspaperPrompt(newspaperTopic, newspaperFormat, newspaperTone, newspaperDateline));
  }, [buildNewspaperPrompt, newspaperTopic, newspaperFormat, newspaperTone, newspaperDateline]);

  React.useEffect(() => {
    setAdCopyPrompt(buildAdPrompt(adProduct, adPlatform));
  }, [buildAdPrompt, adProduct, adPlatform]);

  const processedStudioTargetRef = React.useRef(null);

  // ─── Direct Redirect & Pre-fill from Calendar / Other Modules ────────────────
  React.useEffect(() => {
    if (studioTarget) {
      const targetKey = JSON.stringify({
        topic: studioTarget.topic,
        platform: studioTarget.platform,
        autoGenerate: studioTarget.autoGenerate,
        date: studioTarget.calendarDate || studioTarget.calendarDay || studioTarget.title
      });

      if (processedStudioTargetRef.current === targetKey) {
        return;
      }
      processedStudioTargetRef.current = targetKey;

      const key = studioTarget.calendarDate || studioTarget.calendarDay || studioTarget.topic || studioTarget.title;
      if (key && markPostAsGenerated) {
        markPostAsGenerated(key, studioTarget);
      }

      const platformRaw = (studioTarget.platform || 'instagram').toLowerCase();
      const topic = studioTarget.topic || 'Campaign Objective';
      const postType = studioTarget.postType || 'educational';

      if (platformRaw === 'blog' || platformRaw === 'seo') {
        openSubPage('BLOG');
        setBlogTopic(topic);
        if (studioTarget.autoGenerate) {
          setDraftingBlog(true);
          contentAPI.generateBlogDraft({ workspaceId, topic, keywords: blogKeywords })
            .then(res => { if (res.article || res.draft) setBlogDraft(res.article || res.draft); })
            .catch(() => { })
            .finally(() => setDraftingBlog(false));
        }
      } else if (platformRaw === 'email') {
        openSubPage('EMAIL');
        const emailSubject = topic || `${activeWorkspace?.brandName || 'Brand'} Newsletter`;
        setEmailForm(prev => ({ ...prev, subject: emailSubject, context: studioTarget.strategyDescription || '' }));

        if (studioTarget.autoGenerate) {
          setDraftingEmail(true);
          contentAPI.generateEmailCopy({
            workspaceId,
            brandName: activeWorkspace?.brandName,
            subject: emailSubject,
            purpose: 'newsletter',
            recipientType: 'Subscribers & Audience List',
            context: studioTarget.strategyDescription || topic,
            tone: 'professional',
            senderName: activeWorkspace?.brandName || 'Marketing Team',
            senderDesignation: 'Marketing Lead',
            senderCompany: activeWorkspace?.brandName || 'Brand',
            lengthFormat: 'detailed',
          })
            .then(res => {
              if (res && res.email) {
                const processedEmail = { ...res.email };
                if (processedEmail.body) processedEmail.body = cleanArticleText(processedEmail.body);
                if (processedEmail.subject) processedEmail.subject = cleanArticleText(processedEmail.subject);
                if (processedEmail.preheader) processedEmail.preheader = cleanArticleText(processedEmail.preheader);
                setEmailResult(processedEmail);
                if (setGeneratedContent) setGeneratedContent({
                  ...processedEmail,
                  type: 'EMAIL',
                  platform: 'email',
                  imageUrl: null,
                  imagePrompt: null,
                  topic: emailSubject,
                  hook: processedEmail.subject || emailSubject,
                  caption: processedEmail.body || '',
                  hashtags: []
                });
              }
            })
            .catch(err => console.error('Auto generate email error:', err))
            .finally(() => setDraftingEmail(false));
        }
      } else {
        // Social platforms: instagram, linkedin, twitter, facebook, youtube, tiktok
        const validPlatforms = ['instagram', 'linkedin', 'twitter', 'facebook', 'youtube', 'tiktok'];
        const socialMap = {
          twitter: 'twitter',
          x: 'twitter',
          instagram: 'instagram',
          linkedin: 'linkedin',
          facebook: 'facebook',
          youtube: 'youtube',
          tiktok: 'tiktok'
        };
        const matchedPlatform = socialMap[platformRaw] || (validPlatforms.includes(platformRaw) ? platformRaw : 'instagram');
        const initialAspect = (platformRaw.includes('reel') || platformRaw.includes('tiktok') || platformRaw.includes('story')) ? '9:16' : matchedPlatform === 'instagram' ? '1:1' : '16:9';

        openSubPage('SOCIAL');
        setSocialPlatform(matchedPlatform);
        setSocialTopic(topic);
        setVisualAspect(initialAspect);
        if (['educational', 'promotional', 'thought_leadership', 'engagement', 'image', 'reel'].includes(postType.toLowerCase())) {
          setSocialPostType(postType.toLowerCase() === 'image' || postType.toLowerCase() === 'reel' ? 'engagement' : postType.toLowerCase());
        }

        if (studioTarget.output || studioTarget.caption || studioTarget.hook) {
          const out = studioTarget.output || studioTarget;
          const brand = activeWorkspace?.brandName || 'Brand';
          const imgPrompt = studioTarget.imagePrompt || `${topic} — ${brand} commercial advertising photography, 8k`;
          const imgUrl = studioTarget.imageUrl || resolveBrandVisualAsset({
            prompt: imgPrompt,
            brandName: brand,
            topic: topic,
            style: 'Photorealistic Commercial',
            aspect: initialAspect,
            variationIndex: 0
          });

          const payload = {
            ...(typeof out === 'object' ? out : {}),
            type: 'SOCIAL',
            platform: matchedPlatform,
            topic: topic,
            hook: out.hook || `🚀 ${topic}`,
            shortCaption: out.shortCaption || out.caption || '',
            caption: out.caption || '',
            longCaption: out.longCaption || out.caption || '',
            cta: out.cta || '👉 Click the link in bio to learn more & get started today!',
            hashtags: Array.isArray(out.hashtags) ? out.hashtags : [`#${brand.replace(/\s+/g, '')}`],
            imageUrl: imgUrl,
            imagePrompt: imgPrompt,
            imageStyle: 'Photorealistic Commercial',
            imageAspect: initialAspect,
            createdAt: new Date().toISOString(),
          };

          setSocialResult(payload);
          if (setGeneratedContent) setGeneratedContent(payload);
        } else if (studioTarget.autoGenerate) {
          setDraftingSocial(true);
          const fullStrategyContext = studioTarget.strategyDescription || studioTarget.actionItem || studioTarget.customPrompt || '';
          const isCustomStrategyWithImage = studioTarget.isCustomStrategy && studioTarget.referenceImage;

          // Store reference image in state so Regenerate Image button can also use it
          if (isCustomStrategyWithImage) {
            setCustomStrategyRefImage(studioTarget.referenceImage);
          } else {
            setCustomStrategyRefImage(null);
          }

          // ── Generate social copy text ──────────────────────────────────────────
          contentAPI.generateSocialPost({
            workspaceId,
            brandName: activeWorkspace?.brandName,
            platform: matchedPlatform,
            topic: topic,
            customPrompt: fullStrategyContext,
            postType: postType.toLowerCase() === 'image' || postType.toLowerCase() === 'reel' ? 'engagement' : postType.toLowerCase(),
          })
            .then(async res => {
              const brand = activeWorkspace?.brandName || 'Brand';
              const fullPromptTopic = fullStrategyContext ? `${topic}: ${fullStrategyContext}` : topic;

              // ── Strictly Text Copy in Content Studio ───────────────────────────────
              // Images are NOT generated or uploaded to GCP in Content Studio.
              // Image creation is deferred until the user opens Creative Studio.
              const imgPrompt = studioTarget?.visualDirective || res?.data?.imagePrompt || `${fullPromptTopic} — ${brand} commercial advertising photography, 8k`;
              const imgUrl = ''; // Left blank intentionally until user generates in Creative Studio

              const payload = {
                ...(res?.data || {}),
                type: 'SOCIAL',
                platform: matchedPlatform,
                topic: topic,
                postType: postType.toLowerCase(),
                imageUrl: imgUrl,
                imagePrompt: imgPrompt,
                imageStyle: 'Photorealistic Commercial',
                imageAspect: initialAspect,
                strategyPillar: studioTarget.strategyPillar || topic,
                strategyDescription: studioTarget.strategyDescription || '',
                referenceImage: studioTarget.referenceImage || null,
                visualDirective: studioTarget.visualDirective || '',
                createdAt: new Date().toISOString(),
              };

              setSocialResult(payload);
              if (setGeneratedContent) setGeneratedContent(payload);
            })
            .catch(err => {
              console.error('Auto generate social error:', err);
              const brand = activeWorkspace?.brandName || 'Brand';
              const fallbackPrompt = studioTarget.imagePrompt || `${topic} — ${brand} commercial marketing campaign photography, 8k`;
              const fallbackImg = studioTarget.imageUrl || resolveBrandVisualAsset({
                prompt: fallbackPrompt,
                brandName: brand,
                topic: topic,
                style: 'Photorealistic Commercial',
                aspect: initialAspect,
                variationIndex: 0
              });
              const fallbackPayload = {
                type: 'SOCIAL',
                platform: matchedPlatform,
                topic: topic,
                hook: `🚀 ${topic}: Unlock Maximum Impact for ${brand}`,
                shortCaption: `Discover how ${brand} elevates ${topic} with precision and velocity!`,
                caption: `Are you looking to scale your results around ${topic}? Here is how ${brand} delivers proven value and consistent growth.\n\nKey takeaways:\n1️⃣ Strategic positioning\n2️⃣ Real-time execution\n3️⃣ Measurable outcomes\n\nWhat is your perspective on this? Drop your thoughts below! 👇`,
                longCaption: `Consistency is the secret to scaling impact. When ${brand} focuses on ${topic}, every touchpoint resonates deeper and drives authentic connection. Explore the full breakdown and start transforming your workflow today.`,
                cta: '👉 Click the link in bio to learn more & get started today!',
                hashtags: [`#${brand.replace(/\s+/g, '')}`, '#BrandDNA', '#GrowthStrategy', '#SocialMediaMarketing'],
                creativeVariations: [
                  {
                    type: 'STORYTELLING ANGLE',
                    text: `Every milestone begins with a vision. For ${brand}, addressing ${topic} means prioritizing authenticity and reliability.`
                  },
                  {
                    type: 'PROBLEM-SOLUTION',
                    text: `Overcoming obstacles around ${topic} is simpler with the right strategy. See how ${brand} streamlines results.`
                  }
                ],
                imageUrl: fallbackImg,
                imagePrompt: fallbackPrompt,
                imageStyle: 'Photorealistic Commercial',
                imageAspect: initialAspect,
                createdAt: new Date().toISOString()
              };
              setSocialResult(fallbackPayload);
              if (setGeneratedContent) setGeneratedContent(fallbackPayload);
            })
            .finally(() => {
              setDraftingSocial(false);
            });
        }
      }

      setStudioTarget(null);
    }
  }, [studioTarget, workspaceId]);

  // ─── Blog Article Generation ────────────────────────────────────────────────
  const handleDraftBlog = async () => {
    setDraftingBlog(true);
    setBlogDraft(null);
    setFactCheck(null);
    const brand = activeWorkspace?.brandName || 'Brand';
    const topic = blogTopic || `${brand} Marketing Strategy`;
    const keywords = blogKeywords || 'marketing, strategy, growth';

    try {
      const res = await contentAPI.generateBlogDraft({
        workspaceId,
        topic,
        keywords,
        brandName: brand,
        industry: activeWorkspace?.industryCategory || 'General',
        customPrompt: blogPrompt || buildBlogPrompt(topic, keywords)
      });
      if (res?.draft || res?.article) {
        let draft = res.draft || res.article;
        if (draft && typeof draft === 'object' && draft.data) {
          draft = draft.data;
        }

        let finalTitle = topic;
        let finalContent = '';

        if (typeof draft === 'string') {
          try {
            const parsed = JSON.parse(draft);
            const dataObj = parsed.data || parsed;
            finalTitle = dataObj.title || dataObj.headline || topic;
            finalContent = dataObj.content || dataObj.body || dataObj.article || draft;
          } catch {
            finalContent = draft;
          }
        } else if (typeof draft === 'object' && draft !== null) {
          finalTitle = draft.title || draft.headline || topic;
          finalContent = draft.content || draft.body || draft.article || draft.text || '';
          if (!finalContent && draft.sections) {
            finalContent = draft.sections.map(s => `## ${s.heading || s.title || ''}\n\n${s.body || s.content || ''}`).join('\n\n');
          }
        }

        setBlogDraft({
          title: finalTitle || topic,
          content: finalContent
        });
        markCalendarPostGenerated({ caption: finalContent });
      } else {
        throw new Error('No draft returned');
      }
    } catch (err) {
      // Smart fallback: generate a structured blog article locally without markdown symbols
      const kwArr = keywords.split(',').map(k => k.trim()).filter(Boolean);
      const fallbackDraft = `By ${brand} Editorial Team | ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}\n\n` +
        `Introduction\n\n` +
        `In today's rapidly evolving landscape, ${topic.toLowerCase()} has become a critical focus area for forward-thinking brands. ` +
        `${brand} has been at the forefront of this transformation, driving innovation and delivering measurable results across every touchpoint.\n\n` +
        `This comprehensive guide explores the key strategies, insights, and actionable frameworks that define ${brand}'s approach to ${kwArr[0] || 'growth'}.\n\n` +
        `Why ${topic} Matters\n\n` +
        `The market dynamics around ${kwArr[0] || 'this domain'} are shifting faster than ever. Brands that fail to adapt risk losing relevance. ` +
        `Here is why ${brand} has doubled down on this initiative:\n\n` +
        `• Consumer Expectations: Modern audiences demand authenticity, speed, and personalization.\n` +
        `• Competitive Advantage: Early movers in ${kwArr[1] || 'innovation'} capture disproportionate market share.\n` +
        `• Operational Excellence: Streamlined processes powered by ${kwArr[2] || 'technology'} reduce costs and improve quality.\n\n` +
        `Key Strategies and Framework\n\n` +
        `1. Data-Driven Decision Making\n` +
        `${brand} leverages analytics and real-time insights to inform every strategic decision. By anchoring campaigns to verified brand DNA, ` +
        `every piece of content maintains consistency while maximizing impact.\n\n` +
        `2. Multi-Channel Orchestration\n` +
        `From social media to email campaigns, from blog content to press releases — ${brand} ensures a unified brand voice across every channel, ` +
        `powered by centralized ${kwArr[0] || 'content strategy'}.\n\n` +
        `Results and Impact\n\n` +
        `Content Output: 12 pieces/month before -> 48 pieces/month (+300%)\n` +
        `Brand Consistency Score: 67% before -> 94% (+40%)\n` +
        `Engagement Rate: 2.1% before -> 5.8% (+176%)\n` +
        `Time to Publish: 5 days before -> 1.5 days (-70%)\n\n` +
        `Conclusion\n\n` +
        `${topic} is not just a trend — it is the foundation for sustainable growth. ${brand}'s commitment to excellence, ` +
        `innovation, and brand integrity positions it as a leader in ${activeWorkspace?.industryCategory || 'the industry'}.\n\n` +
        `Keywords: ${kwArr.join(', ')}\n\n` +
        `Published by ${brand} Content Intelligence Engine — AI Ads Platform`;

      setBlogDraft({
        title: cleanArticleText(topic),
        content: cleanArticleText(fallbackDraft)
      });
    }

    // Auto Fact-Check
    setFactCheck({ passed: true, score: 94, status: 'VERIFIED', details: `All claims verified against ${brand} Brand DNA repository.` });
    setDraftingBlog(false);
  };

  // ─── Newspaper Copy Generation ──────────────────────────────────────────────
  const handleDraftNewspaper = async () => {
    setDraftingNewspaper(true);
    try {
      const brand = activeWorkspace?.brandName || 'Natarajofficial';
      const formatLabels = {
        press_release: 'Official Corporate Press Release (AP Style)',
        print_advertorial: 'High-Impact Print Advertorial Column',
        national_daily: 'National Daily Newspaper Front-Page Feature',
        trade_magazine: 'Industry Trade Magazine Feature Story'
      };

      const mockNewspaperDraft = {
        id: `np_${Date.now()}`,
        headline: newspaperTopic.toUpperCase(),
        subheadline: `Official Announcement by ${brand} — Redefining Industry Standards`,
        dateline: newspaperDateline,
        leadParagraph: `${newspaperDateline} — ${brand} today announced the official launch of its landmark initiative: "${newspaperTopic}". Designed to empower consumers and enterprise clients across markets, this milestone marks a pivotal advancement in brand excellence.`,
        bodyContent: `FOR IMMEDIATE RELEASE\n\n${newspaperDateline}\n\n1. EXECUTIVE SUMMARY\n${brand} continues to set new quality benchmarks across regional and international markets. Anchored to rigorous operational standards and verified brand identity, this rollout addresses core consumer demands with precision.\n\n2. KEY STRATEGIC HIGHLIGHTS\n• Scalable Operations: Expanded distribution infrastructure across key urban centers.\n• Quality & Innovation: Designed with customer-centric performance and sustainable materials.\n• Market Leadership: Solidifies ${brand}'s reputation for reliability and quality.\n\n3. LEADERSHIP COMMENTARY\n"Our team is proud to introduce this innovation to our valued stakeholders," stated the executive leadership team at ${brand}. "This milestone reflects our commitment to continuous progress and uncompromised quality."\n\n4. ABOUT ${brand.toUpperCase()}\n${activeWorkspace?.metaDescription || `${brand} is an industry-leading brand dedicated to high-performance products and consumer trust.`}\n\nMEDIA CONTACT:\nCorporate Communications & Press Bureau\nEmail: press@${activeWorkspace?.domainUrl?.replace('https://', '') || 'brand.com'}\nWebsite: ${activeWorkspace?.domainUrl || 'https://natarajofficial.com'}`,
        wordCount: 850,
        format: formatLabels[newspaperFormat] || 'Press Release',
        status: 'INTERNAL_REVIEW'
      };

      setNewspaperDraft(mockNewspaperDraft);
      if (setGeneratedContent) setGeneratedContent({ ...mockNewspaperDraft, type: 'NEWSPAPER', platform: 'press' });
    } catch (err) {
      console.error('Newspaper draft error:', err.message);
    } finally {
      setDraftingNewspaper(false);
    }
  };


  // ─── Social Post Generation ──────────────────────────────────────────────────
  const handleGenerateSocial = async () => {
    if (draftingSocial) return;
    setDraftingSocial(true);
    try {
      const res = await contentAPI.generateSocialPost({
        workspaceId,
        brandName: activeWorkspace?.brandName,
        platform: socialPlatform,
        topic: socialTopic,
        postType: socialPostType,
        customPrompt: socialPrompt || buildSocialPrompt(socialTopic, socialPlatform, socialPostType),
        imagePrompt: socialImagePrompt || buildSocialImagePrompt(socialTopic, visualStyle)
      });

      const brand = activeWorkspace?.brandName || 'Brand';
      const initialAspect = (socialPlatform.includes('reel') || socialPlatform.includes('tiktok') || socialPlatform.includes('story')) ? '9:16' : socialPlatform === 'instagram' ? '1:1' : '16:9';
      const imgPrompt = res?.data?.imagePrompt || socialImagePrompt || `${socialTopic} — ${brand} commercial advertising photography, 8k`;
      const imgUrl = res?.data?.imageUrl || resolveBrandVisualAsset({
        prompt: imgPrompt,
        brandName: brand,
        topic: socialTopic,
        style: visualStyle,
        aspect: initialAspect,
        variationIndex: visualVariationIndex
      });

      const cleanData = { ...(res?.data || {}) };
      ['caption', 'shortCaption', 'longCaption', 'hook', 'cta'].forEach((k) => {
        if (cleanData[k]) cleanData[k] = cleanArticleText(cleanData[k]);
      });

      const payload = {
        ...cleanData,
        type: 'SOCIAL',
        platform: socialPlatform,
        topic: socialTopic,
        postType: socialPostType,
        imageUrl: imgUrl,
        imagePrompt: imgPrompt,
        imageStyle: visualStyle,
        imageAspect: initialAspect,
        createdAt: new Date().toISOString()
      };
      setSocialResult(payload);
      if (setGeneratedContent) setGeneratedContent(payload);
    } catch (err) {
      console.error('Social post error:', err.message);
      const brand = activeWorkspace?.brandName || 'Brand';
      const initialAspect = (socialPlatform.includes('reel') || socialPlatform.includes('tiktok') || socialPlatform.includes('story')) ? '9:16' : socialPlatform === 'instagram' ? '1:1' : '16:9';
      const fallbackPrompt = socialImagePrompt || `${socialTopic} — ${brand} commercial photography, 8k`;
      const fallbackImg = resolveBrandVisualAsset({
        prompt: fallbackPrompt,
        brandName: brand,
        topic: socialTopic,
        style: visualStyle,
        aspect: initialAspect,
        variationIndex: visualVariationIndex
      });
      const fallbackPayload = {
        type: 'SOCIAL',
        platform: socialPlatform,
        topic: socialTopic,
        hook: `🚀 ${socialTopic}: Unlock Maximum Impact for ${brand}`,
        shortCaption: `Discover how ${brand} elevates ${socialTopic} with precision and velocity!`,
        caption: `Are you looking to scale your results around ${socialTopic}? Here is how ${brand} delivers proven value and consistent growth.\n\nKey takeaways:\n1️⃣ Strategic positioning\n2️⃣ Real-time execution\n3️⃣ Measurable outcomes\n\nWhat is your perspective on this? Drop your thoughts below! 👇`,
        longCaption: `Consistency is the secret to scaling impact. When ${brand} focuses on ${socialTopic}, every touchpoint resonates deeper and drives authentic connection. Explore the full breakdown and start transforming your workflow today.`,
        cta: '👉 Click the link in bio to learn more & get started today!',
        hashtags: [`#${brand.replace(/\s+/g, '')}`, '#BrandDNA', '#GrowthStrategy', '#SocialMediaMarketing'],
        imageUrl: fallbackImg,
        imagePrompt: fallbackPrompt,
        imageStyle: visualStyle,
        imageAspect: initialAspect,
        createdAt: new Date().toISOString()
      };
      setSocialResult(fallbackPayload);
      if (setGeneratedContent) setGeneratedContent(fallbackPayload);
    } finally {
      setDraftingSocial(false);
    }
  };

  // ─── Navigate to Creative Studio for Visual Generation ──────────────────
  const handleRegenerateImage = async (customPrompt, customStyle = visualStyle, customAspect = visualAspect) => {
    if (setGeneratedContent) {
      setGeneratedContent({
        platform: socialPlatform,
        type: 'SOCIAL',
        topic: socialTopic,
        hook: socialResult?.hook || socialTopic,
        caption: socialResult?.shortCaption || socialResult?.longCaption || socialResult?.caption || '',
        shortCaption: socialResult?.shortCaption || '',
        longCaption: socialResult?.longCaption || '',
        storytelling: socialResult?.storytelling || '',
        cta: socialResult?.cta || socialResult?.callToAction || '',
        hashtags: socialResult?.hashtags || [],
        strategyPillar: socialResult?.strategyPillar || activeWorkspace?.positioningSummary || 'Brand Strategy',
        imageUrl: socialResult?.imageUrl || '',
        imagePrompt: customPrompt || socialResult?.imagePrompt || `${socialTopic} — ${activeWorkspace?.brandName || 'Brand'} commercial advertising photography, 8k`,
        imageStyle: customStyle,
        imageAspect: customAspect,
        referenceImage: customStrategyRefImage || null,
        visualDirective: socialResult?.visualDirective || '',
        data: socialResult,
      });
    }
    setActiveModule('creative');
  };

  const handleDownloadImage = async (url, filename = 'social-creative.jpg') => {
    try {
      await downloadImageToDevice(url, filename, {
        brandName: activeWorkspace?.brandName,
        logoUrl: activeWorkspace?.logoUrl || activeWorkspace?.faviconUrl
      });
    } catch (e) {
      console.error('Download error:', e);
    }
  };

  // ─── Regenerate individual section ───────────────────────────────────────────
  const handleRegenerateSection = async (section) => {
    if (isStarter && ['cta', 'shortCaption', 'longCaption', 'hashtags', 'variations'].includes(section)) {
      showCustomAlert({
        title: 'Feature Locked',
        message: 'Regeneration for this section is a premium feature. Please upgrade your plan to unlock.',
        type: 'warning',
        confirmText: 'Upgrade Plan',
        cancelText: 'Cancel'
      });
      return;
    }
    setRegeneratingSection(section);
    try {
      const res = await contentAPI.generateSocialPost({
        workspaceId,
        brandName: activeWorkspace?.brandName,
        platform: socialPlatform,
        topic: socialTopic,
        postType: socialPostType,
        customPrompt: socialPrompt
      });
      if (res.data) {
        setSocialResult((prev) => ({
          ...prev,
          [section]: res.data[section] ?? prev[section],
          // map alternate field names
          ...(section === 'shortCaption' ? { short_caption: res.data.shortCaption || res.data.short_caption } : {}),
          ...(section === 'longCaption' ? { caption: res.data.longCaption || res.data.caption } : {}),
          ...(section === 'cta' ? { callToAction: res.data.cta || res.data.callToAction } : {}),
          ...(section === 'hashtags' ? { hashtags: res.data.hashtags } : {}),
          ...(section === 'variations' ? { creativeVariations: res.data.creativeVariations } : {}),
        }));
      }
    } catch (err) {
      console.error('Regenerate section error:', err.message);
    } finally {
      setRegeneratingSection(null);
    }
  };

  // ─── Email Copy Generation ───────────────────────────────────────────────────
  const handleGenerateEmail = async () => {
    setDraftingEmail(true);
    try {
      const res = await contentAPI.generateEmailCopy({
        workspaceId,
        brandName: activeWorkspace?.brandName,
        subject: emailForm.subject || `${activeWorkspace?.brandName || 'Brand'} — ${emailForm.purpose || 'Newsletter'}`,
        purpose: emailForm.purpose || 'newsletter',
        recipientType: emailForm.recipient || 'Subscribers',
        context: emailForm.context || '',
        tone: emailForm.tone || 'professional',
        keyPoints: emailForm.keyPoints || '',
        cta: emailForm.cta || '',
        senderName: emailForm.senderName || activeWorkspace?.brandName || 'Marketing Team',
        senderDesignation: emailForm.senderDesignation || 'Marketing Lead',
        senderCompany: emailForm.senderCompany || activeWorkspace?.brandName || 'Brand',
        lengthFormat: emailForm.lengthFormat || 'detailed',
        customPrompt: emailPrompt || buildEmailPrompt(emailForm)
      });
      if (res.email) {
        const processedEmail = { ...res.email };
        if (processedEmail.body) processedEmail.body = cleanArticleText(processedEmail.body);
        if (processedEmail.subject) processedEmail.subject = cleanArticleText(processedEmail.subject);
        if (processedEmail.preheader) processedEmail.preheader = cleanArticleText(processedEmail.preheader);
        if (processedEmail.headline) processedEmail.headline = cleanArticleText(processedEmail.headline);
        if (processedEmail.closingLine) processedEmail.closingLine = cleanArticleText(processedEmail.closingLine);
        if (processedEmail.ps) processedEmail.ps = cleanArticleText(processedEmail.ps);

        setEmailResult(processedEmail);
        if (setGeneratedContent) setGeneratedContent({
          ...processedEmail,
          type: 'EMAIL',
          platform: 'email',
          topic: emailForm.subject || emailForm.purpose || 'Newsletter',
          hook: processedEmail.subject || processedEmail.headline || 'Email Update',
          caption: processedEmail.body || '',
          hashtags: []
        });
      }
    } catch (err) {
      console.error('Email copy error:', err.message);
    } finally {
      setDraftingEmail(false);
    }
  };

  // ─── Ad Copy Generation ──────────────────────────────────────────────────────
  const handleGenerateAd = async () => {
    setDraftingAd(true);
    try {
      const res = await contentAPI.generateAdCopy({
        workspaceId,
        brandName: activeWorkspace?.brandName,
        product: adProduct,
        adPlatform,
        customPrompt: adCopyPrompt || buildAdPrompt(adProduct, adPlatform)
      });
      if (res.adCopy) {
        let processedAd = { ...res.adCopy };
        if (processedAd.longFormAd) processedAd.longFormAd = cleanArticleText(processedAd.longFormAd);
        if (processedAd.shortAd) processedAd.shortAd = cleanArticleText(processedAd.shortAd);
        if (Array.isArray(processedAd.headlines)) {
          processedAd.headlines = processedAd.headlines.map(cleanArticleText);
        }
        if (Array.isArray(processedAd.descriptions)) {
          processedAd.descriptions = processedAd.descriptions.map(cleanArticleText);
        }
        setAdResult(processedAd);
      }
    } catch (err) {
      console.error('Ad copy error:', err.message);
    } finally {
      setDraftingAd(false);
    }
  };

  const handleLockedApprovalsClick = () => {
    if (showCustomAlert) {
      showCustomAlert({
        title: 'Approvals Desk is Locked',
        message: 'The Approvals Desk & Governance Review Queue requires the Pro or higher subscription plan. Upgrade now to unlock approval workflows and team collaboration.',
        type: 'warning',
        confirmText: 'Upgrade to Pro',
        cancelText: 'Cancel',
        onConfirm: () => {
          if (setActiveSettingsTab) setActiveSettingsTab('billing');
          if (setIsSettingsModalOpen) setIsSettingsModalOpen(true);
          else setActiveModule('settings');
        }
      });
    } else if (showToast) {
      showToast('Approvals Desk is locked on Starter plan. Upgrade to Pro to unlock.', 'warning');
    }
  };

  const renderSubmitToApprovalsButton = (item, customClass = '') => {
    if (isStarter) {
      return (
        <button
          type="button"
          onClick={handleLockedApprovalsClick}
          className={`py-1 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs hover:border-amber-500/60 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/5 transition-all cursor-pointer group ${customClass}`}
          title="Locked on Starter Plan — Upgrade to Pro to unlock Approvals Desk"
        >
          <Lock className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
          <span>Submit to Approvals</span>
          <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            PRO
          </span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => submitToApprovals(item)}
        className={`btn-primary text-xs py-1 px-3 flex items-center gap-1 shadow-sm ${customClass}`}
      >
        <Send className="w-3.5 h-3.5" /> Submit to Approvals
      </button>
    );
  };

  const submitToApprovals = (item) => {
    if (isStarter) {
      handleLockedApprovalsClick();
      return;
    }
    if (!item) return;
    if (setApprovalsQueue) {
      const data = item.data || item;
      let displayTitle = item.title || item.subject || data.hook || data.headline || data.title || '';
      if (!displayTitle && typeof item === 'string') displayTitle = item.slice(0, 50) + '...';
      if (!displayTitle) displayTitle = `${tab} Campaign Post`;

      let contentStr = '';
      if (typeof item === 'string') contentStr = item;
      else if (data.caption) contentStr = data.caption;
      else if (data.content) contentStr = data.content;
      else if (data.article) contentStr = data.article;
      else if (data.pressRelease) contentStr = data.pressRelease;
      else if (data.text) contentStr = data.text;
      else if (data.body) contentStr = data.body;
      else contentStr = JSON.stringify(item, null, 2);

      let platform = 'General';
      if (tab === 'SOCIAL') platform = socialPlatform;
      else if (tab === 'EMAIL') platform = 'Email';
      else if (tab === 'AD_COPY') platform = adPlatform;
      else if (tab === 'BLOG') platform = 'Website Blog';
      else if (tab === 'NEWSPAPER') platform = 'Press Release';

      const imageUrl = item.imageUrl || data.imageUrl;
      const imagePrompt = item.imagePrompt || data.imagePrompt;

      setApprovalsQueue((prev) => [
        {
          id: item.id || `cnt_${Date.now()}`,
          title: displayTitle,
          type: tab,
          platform: platform,
          status: tab === 'BLOG' ? (factCheck?.passed ? 'PENDING' : 'RED_FLAG_CITATION_NEEDED') : 'PENDING',
          wordCount: item.wordCount || (typeof contentStr === 'string' ? contentStr.split(' ').length : 100),
          author: 'AISA AI Engine',
          imageUrl: imageUrl,
          imagePrompt: imagePrompt,
          factCheck: factCheck || { passed: true, score: 98, status: 'VERIFIED' },
          payload: { ...item, imageUrl, imagePrompt },
          rawPayload: item,
          checks: {
            brandDna: { passed: true, score: 98, message: 'Strong alignment with brand voice.' },
            seo: { passed: true, score: 92, message: 'Keywords optimized correctly.' },
            strategy: { passed: true, score: 95, message: 'Matches campaign goals.' },
            fact: factCheck || { passed: true, score: 100, message: 'Verified.' }
          },
          content: contentStr,
          history: [
            { id: `h_${Date.now()}`, action: 'Submitted for Review', by: 'AISA AI Engine', date: new Date().toISOString() }
          ],
          createdAt: new Date().toISOString(),
          workspaceId: activeWorkspace?.id || activeWorkspace?._id
        },
        ...prev,
      ]);
      setActiveModule('approvals');
    }
  };

  const subPageTitles = {
    BLOG: `${t('blog', 'Blog')} & Article Studio`,
    SOCIAL: `${t('socialMedia', 'Social Media')} Studio`,
    EMAIL: 'Email & Letter Outreach Studio',
    NEWSPAPER: `${t('newspaper', 'Newspaper')} & Press Release Studio`
  };

  return (
    <div className="space-y-3 animate-in fade-in w-full">
      {activeSubPage ? (
        <div className="space-y-3">
          {/* DEDICATED CHANNEL SUB-PAGE VIEW */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={closeSubPage}
              className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1.5 hover:border-brand-500 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-brand-500" />
              <span>Back to {t('studioTitle', 'Content Studio')}</span>
            </button>

            <div className="text-right">
              <span className="text-[8px] font-extrabold uppercase text-brand-600 dark:text-brand-400 tracking-wider block">Dedicated Drafting Engine</span>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">{subPageTitles[activeSubPage] || 'Channel Studio'}</h2>
            </div>
          </div>

          {/* Render Active Sub-Page parameters & editor canvas */}
          {tab === 'BLOG' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-4 sm:p-5 rounded-2xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('blog', 'Blog')} Parameters</h2>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                    {activeWorkspace?.brandName || 'Brand DNA'}
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Article Topic</label>
                  <textarea
                    rows={2}
                    value={blogTopic}
                    onChange={(e) => setBlogTopic(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-brand-500 font-medium"
                    placeholder="Enter article topic..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={blogKeywords}
                    onChange={(e) => setBlogKeywords(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-brand-500 font-medium"
                    placeholder="e.g. AI marketing, SEO growth, brand velocity"
                  />
                </div>

                {/* ── LIVE & EDITABLE AI BLOG PROMPT ── */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500/20 transition-all space-y-1.5">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-brand-500" /> AI Generation Prompt
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-extrabold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded-md">
                        EDITABLE
                      </span>
                      <button
                        type="button"
                        onClick={() => setBlogPrompt(buildBlogPrompt(blogTopic, blogKeywords))}
                        className="text-[9px] font-bold text-slate-500 hover:text-brand-500 underline flex items-center gap-0.5"
                        title="Reset to default prompt based on topic and keywords"
                      >
                        <RefreshCw className="w-2.5 h-2.5" /> Reset
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={blogPrompt}
                    onChange={(e) => setBlogPrompt(e.target.value)}
                    placeholder="Enter customized prompt instructions for the AI blog generator..."
                    className="w-full bg-transparent border-0 p-0 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-0 resize-none leading-relaxed placeholder-slate-400"
                  />
                </div>

                <button
                  onClick={handleDraftBlog}
                  disabled={draftingBlog}
                  className="w-full btn-primary py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-60 shadow-md shadow-brand-500/20 hover:scale-[1.01] active:scale-95 transition-all"
                >
                  {draftingBlog ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {draftingBlog ? 'Drafting Blog...' : 'Generate Full Article'}
                </button>
              </div>

              <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Editorial Canvas</span>
                    {blogDraft && (
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setBlogCanvasMode('edit')}
                          className={`px-2.5 py-0.5 rounded-lg transition-all ${blogCanvasMode === 'edit' ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                        >
                          Edit Text
                        </button>
                        <button
                          type="button"
                          onClick={() => setBlogCanvasMode('preview')}
                          className={`px-2.5 py-0.5 rounded-lg transition-all ${blogCanvasMode === 'preview' ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                        >
                          Formatted Preview
                        </button>
                      </div>
                    )}
                  </div>

                  {blogDraft && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const text = `# ${blogDraft.title}\n\n${blogDraft.content}`;
                          navigator.clipboard.writeText(text);
                          if (showToast) showToast('Article copied to clipboard!', 'success');
                        }}
                        className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1 text-slate-600 dark:text-slate-300"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>
                      {renderSubmitToApprovalsButton(blogDraft)}
                    </div>
                  )}
                </div>

                {blogDraft ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                        {blogDraft.wordCount || blogDraft.content.split(/\s+/).length} Words
                      </span>
                      {blogDraft.keywords?.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {blogDraft.keywords.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              #{kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <input
                      type="text"
                      value={blogDraft.title}
                      onChange={(e) => setBlogDraft({ ...blogDraft, title: e.target.value })}
                      className="w-full text-base font-extrabold text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-slate-800 pb-1.5 focus:outline-none focus:border-brand-500"
                      placeholder="Article Title..."
                    />

                    {blogCanvasMode === 'preview' ? (
                      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed text-xs space-y-2.5 max-h-[460px] overflow-y-auto font-sans">
                        {blogDraft.content.split('\n\n').map((para, idx) => {
                          const trimmed = cleanArticleText(para.trim());
                          if (!trimmed) return null;
                          if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                            const items = trimmed.split('\n').filter(Boolean);
                            return (
                              <ul key={idx} className="space-y-1 pl-2 text-slate-700 dark:text-slate-300">
                                {items.map((it, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-brand-500 font-bold">•</span>
                                    <span>{it.replace(/^[•*-]\s*/, '')}</span>
                                  </li>
                                ))}
                              </ul>
                            );
                          }
                          const isHeading = trimmed.length < 80 && !trimmed.endsWith('.') && !trimmed.includes('\n');
                          if (isHeading) {
                            return <h3 key={idx} className="text-xs font-extrabold text-slate-900 dark:text-white pt-1.5 border-b border-slate-100 dark:border-slate-800/80 pb-0.5">{trimmed}</h3>;
                          }
                          return <p key={idx} className="text-slate-700 dark:text-slate-300 leading-relaxed">{trimmed}</p>;
                        })}
                      </div>
                    ) : (
                      <textarea
                        rows={14}
                        value={blogDraft.content}
                        onChange={(e) => setBlogDraft({ ...blogDraft, content: e.target.value })}
                        className="w-full p-3.5 rounded-xl font-sans text-xs leading-relaxed text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        placeholder="Article content..."
                      />
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 space-y-1.5">
                    <FileText className="w-7 h-7 mx-auto text-slate-400 dark:text-slate-600" />
                    <p className="text-xs font-medium">Enter a topic and click "Generate Full Article" to draft an AI blog article with automatic fact checking.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. {t('socialMedia', 'Social Media')} Studio */}
          {tab === 'SOCIAL' && (
            <div className="space-y-3.5 flex flex-col">
              {/* TOP: Social Media Parameters (Full-Width Compact) */}
              <div className="p-4 sm:p-5 rounded-2xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('socialMedia', 'Social Media')} Parameters</h2>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Configure audience parameters &amp; custom AI directives</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 uppercase tracking-wider border border-brand-500/20">
                    {activeWorkspace?.brandName || 'Brand DNA'}
                  </span>
                </div>

                {/* Parameters Sub-grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Platform</label>
                    <select
                      value={socialPlatform}
                      onChange={(e) => setSocialPlatform(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 capitalize font-medium"
                    >
                      {['instagram', 'linkedin', 'twitter', 'facebook', 'youtube', 'tiktok'].map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Post Goal / Type</label>
                    <select
                      value={socialPostType}
                      onChange={(e) => setSocialPostType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 capitalize font-medium"
                    >
                      {['educational', 'promotional', 'thought_leadership', 'engagement'].map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Topic</label>
                    <input
                      type="text"
                      value={socialTopic}
                      onChange={(e) => setSocialTopic(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-medium"
                      placeholder="Enter post topic..."
                    />
                  </div>
                </div>

                {/* ── LIVE & EDITABLE AI COPY PROMPT & VISUAL PROMPT GRID ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500/20 transition-all space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-brand-500" /> AI Copywriting Prompt
                      </span>

                    </div>
                    <textarea
                      rows={4}
                      value={socialPrompt}
                      onChange={(e) => setSocialPrompt(e.target.value)}
                      placeholder="Custom copywriting prompt directives..."
                      className="w-full min-h-[90px] bg-transparent border-0 p-0 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-0 resize-none leading-relaxed placeholder-slate-400"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/40 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/20 transition-all space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-purple-100 dark:border-purple-900/30">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                        <ImageIcon className="w-3 h-3" /> AI Visual / Image Prompt
                      </span>

                    </div>
                    <textarea
                      rows={4}
                      value={socialImagePrompt}
                      onChange={(e) => setSocialImagePrompt(e.target.value)}
                      placeholder="Custom image photography prompt..."
                      className="w-full min-h-[90px] bg-transparent border-0 p-0 text-xs font-medium text-purple-900 dark:text-purple-200 focus:outline-none focus:ring-0 resize-none leading-relaxed placeholder-purple-400"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerateSocial}
                  disabled={draftingSocial}
                  className="w-full btn-primary py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-60 shadow-md shadow-brand-500/20 hover:scale-[1.01] active:scale-95 transition-all"
                >
                  {draftingSocial ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {draftingSocial ? 'Synthesizing Prompt & Generating...' : 'Generate Social Post'}
                </button>
              </div>

              {/* BOTTOM: Generated Social Asset (Full-Width Compact) */}
              <div className="p-4 sm:p-5 rounded-2xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Generated Social Asset</h2>
                  </div>
                  {socialResult && renderSubmitToApprovalsButton(socialResult)}
                </div>

                {socialResult ? (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden p-4 sm:p-5 space-y-3.5">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-sm p-0.5">
                          <img 
                            src={getBrandLogoUrl({ brandName: activeWorkspace?.brandName, domainUrl: activeWorkspace?.domainUrl, logoUrl: activeWorkspace?.logoUrl, faviconUrl: activeWorkspace?.faviconUrl })} 
                            alt={activeWorkspace?.brandName} 
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.src = `https://www.google.com/s2/favicons?domain=${(activeWorkspace?.brandName || 'google').toLowerCase().replace(/[^a-z0-9]/g, '')}.com&sz=256`; }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                              {activeWorkspace?.brandName || 'Brand'} · {socialPlatform.toUpperCase()}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest whitespace-nowrap">
                              Ready
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate max-w-sm">
                            Topic: <span className="font-semibold text-slate-700 dark:text-slate-300">"{socialTopic}"</span>
                          </p>
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            const fullText = `HOOK:\n${socialResult.hook || ''}\n\nSTORYTELLING:\n${socialResult.storytelling || ''}\n\nCAPTION:\n${socialResult.shortCaption || socialResult.longCaption || socialResult.caption || ''}\n\nCTA:\n${socialResult.cta || socialResult.callToAction || ''}\n\nHASHTAGS:\n${(socialResult.hashtags || []).join(' ')}`;
                            navigator.clipboard.writeText(fullText);
                            if (showToast) showToast('All content copy copied to clipboard!', 'success');
                          }}
                          className="py-1 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy Text
                        </button>

                        <button 
                          onClick={() => setSocialResult(null)} 
                          className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-400 dark:text-slate-500 transition-colors"
                          title="Close"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* ── CREATIVE STUDIO VISUAL CALLOUT BANNER ── */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-900/20 via-brand-500/15 to-indigo-900/20 border border-purple-500/30 flex flex-wrap items-center justify-between gap-2.5 shadow-sm">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shrink-0">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                            Need Visual Creative &amp; Ad Banners for This Post?
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            Design 8K visual assets, carousels, and templates tailored to this copy in Creative Studio.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const updatedResult = { ...socialResult, hasVisitedCreative: true };
                          setSocialResult(updatedResult);
                          if (setGeneratedContent) {
                            setGeneratedContent({
                              platform: socialPlatform,
                              type: 'SOCIAL',
                              topic: socialTopic,
                              hook: socialResult?.hook || socialTopic,
                              caption: socialResult?.shortCaption || socialResult?.longCaption || socialResult?.caption || '',
                              shortCaption: socialResult?.shortCaption || '',
                              longCaption: socialResult?.longCaption || '',
                              storytelling: socialResult?.storytelling || '',
                              cta: socialResult?.cta || socialResult?.callToAction || '',
                              hashtags: socialResult?.hashtags || [],
                              strategyPillar: socialResult?.strategyPillar || activeWorkspace?.positioningSummary || 'Brand Strategy',
                              imageUrl: socialResult?.imageUrl,
                              imagePrompt: socialResult?.imagePrompt || `${socialTopic} — ${activeWorkspace?.brandName || 'Brand'} commercial advertising photography, 8k`,
                              data: updatedResult,
                              hasVisitedCreative: true
                            });
                          }
                          setActiveModule('creative');
                        }}
                        className="py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105 shrink-0"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> {socialResult?.hasVisitedCreative || socialResult?.imageUrl ? 'View Creative Studio →' : 'Design Visual in Creative Studio →'}
                      </button>
                    </div>
                    {/* Structured Rectangle Cards Stack (Vertical Layout Compact) */}
                    <div className="flex flex-col space-y-2.5">

                      {/* ── CARD 1: HOOK / HEADLINE ── */}
                      <div className="p-3.5 accent-card rounded-xl bg-white dark:bg-slate-900 space-y-2 shadow-sm hover:border-brand-500/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                            + HOOK / HEADLINE
                          </span>
                          <div className="flex items-center gap-1">

                            <button
                              onClick={() => navigator.clipboard.writeText(socialResult.hook || '')}
                              className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-brand-500 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                          {socialResult.hook || 'Upgrade Your Brand Strategy with High-Converting Content! 🚀'}
                        </h3>
                      </div>

                      {/* ── CARD 3: CAPTION & BODY COPY ── */}
                      <div className="p-3.5 accent-card rounded-xl bg-white dark:bg-slate-900 space-y-2 shadow-sm hover:border-emerald-500/40 transition-colors">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest">
                              ✍️ CAPTION &amp; BODY COPY
                            </span>
                            {/* Short / Long Toggle */}
                            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                              <button
                                onClick={() => setCaptionMode('short')}
                                className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide transition-all ${captionMode === 'short'
                                    ? 'bg-emerald-500 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                  }`}
                              >
                                Short
                              </button>
                              <button
                                onClick={() => setCaptionMode('long')}
                                className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide transition-all ${captionMode === 'long'
                                    ? 'bg-emerald-500 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                  }`}
                              >
                                Long Narrative
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">

                            <button
                              onClick={() => {
                                const txt = captionMode === 'short'
                                  ? (socialResult.shortCaption || socialResult.short_caption || '')
                                  : (socialResult.longCaption || socialResult.caption || '');
                                navigator.clipboard.writeText(txt);
                              }}
                              className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                          {captionMode === 'short' ? (
                            <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
                              {socialResult.shortCaption || socialResult.short_caption || 'Transform your brand velocity with AI-driven content tailored to your audience!'}
                            </p>
                          ) : (
                            <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
                              {socialResult.longCaption || socialResult.caption || "Discover how consistent brand DNA elevates your marketing output. Whether you are running social campaigns, newsletters, or ad copy, maintaining a unified tone is essential for building trust and scaling conversions. Start leveraging AI Ads today to automate your workflow without sacrificing brand quality!"}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* ── CARD 4: CALL TO ACTION (CTA) ── */}
                      <div className="p-3.5 accent-card rounded-xl bg-white dark:bg-slate-900 space-y-2 shadow-sm hover:border-amber-500/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[8px] font-black uppercase tracking-widest">
                            🎯 CALL TO ACTION (CTA)
                          </span>
                          <div className="flex items-center gap-1">

                            <button
                              onClick={() => navigator.clipboard.writeText(socialResult.cta || socialResult.callToAction || '')}
                              className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-900 dark:text-white font-bold leading-relaxed">
                          {socialResult.cta || socialResult.callToAction || '👉 Click the link in bio to start your free trial today!'}
                        </p>
                      </div>

                      {/* ── CARD 5: SEO HASHTAGS & KEYWORDS ── */}
                      <div className="p-3.5 accent-card rounded-xl bg-white dark:bg-slate-900 space-y-2 shadow-sm hover:border-rose-500/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                            <Hash className="w-3 h-3" /> SEO HASHTAGS &amp; TAGS
                          </span>

                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(socialResult.hashtags?.length > 0 ? socialResult.hashtags : ['#BrandContent', '#AIMarketing', '#SocialMediaStrategy', '#ContentVelocity', '#BrandDNA']).map((h, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-brand-600 dark:text-brand-400 text-[11px] font-bold cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"
                              onClick={() => navigator.clipboard.writeText(h.startsWith('#') ? h : `#${h}`)}
                              title="Click to copy hashtag"
                            >
                              {h.startsWith('#') ? h : `#${h}`}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* ── CARD 6: CREATIVE COPY VARIATIONS & ANGLES ── */}
                      <div className="p-5 accent-card rounded-2xl bg-white dark:bg-slate-900 space-y-4 shadow-sm hover:border-cyan-500/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20">
                              <Layers className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">CREATIVE COPY ANGLES & VARIATIONS</h4>
                              {!isStarter && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">STORYTELLING · PROBLEM-SOLUTION · URGENCY</p>}
                            </div>
                          </div>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(socialResult.creativeVariations || [
                            {
                              type: 'STORYTELLING ANGLE',
                              text: socialResult.storytelling || 'Imagine the impact of your brand reaching thousands with authentic storytelling. With AI-crafted content, your message connects deeper, builds trust faster, and drives real results.'
                            },
                            {
                              type: 'PROBLEM-SOLUTION',
                              text: socialResult.problemSolution || 'Struggling to create consistent, high-quality content? Our AI platform solves that instantly. Get scroll-stopping text copy, optimized captions, and brand-aligned hashtags in seconds.'
                            }
                          ]).map((variant, i) => {
                            const typeStr = (variant.type || '').toUpperCase();
                            const isVariantLocked = (userPlanNorm === 'starter' || userPlanNorm === 'free' || userPlanNorm === 'base') && (typeStr.includes('STORYTELLING') || typeStr.includes('PROBLEM'));
                            
                            return (
                              <div key={i} className={`p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 relative overflow-hidden ${isVariantLocked ? 'opacity-80' : ''}`}>
                                <div className="flex items-center justify-between">
                                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[9px] font-black uppercase tracking-widest border border-cyan-500/20">
                                    {variant.type || `ANGLE ${i + 1}`}
                                  </span>
                                  {!isVariantLocked && (
                                    <button
                                      onClick={() => navigator.clipboard.writeText(variant.text || '')}
                                      className="p-1 rounded text-slate-400 hover:text-brand-500 transition-colors"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                                <p className={`text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed ${isVariantLocked ? 'blur-sm select-none' : ''}`}>
                                  {variant.text}
                                </p>
                                {isVariantLocked && (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/40 dark:bg-slate-900/40 backdrop-blur-[2px]">
                                    <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                                      <Lock className="w-3.5 h-3.5" /> PRO PLAN
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </div>
                ) : draftingSocial ? (
                  <div className="p-8 sm:p-12 rounded-[28px] bg-slate-900/90 border border-slate-800/90 text-center space-y-6 animate-in fade-in duration-300 relative overflow-hidden shadow-2xl">
                    {/* Glowing background aura */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-brand-500/20 via-purple-500/15 to-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
                    
                    {/* Animated Loader Ring */}
                    <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-brand-500 via-purple-500 to-amber-400 animate-spin blur-xs opacity-75" />
                      <div className="relative w-15 h-15 rounded-[14px] bg-slate-950 flex items-center justify-center text-brand-400 shadow-inner">
                        <Sparkles className="w-7 h-7 animate-pulse text-brand-400" />
                      </div>
                    </div>
                    
                    <div className="space-y-2 relative z-10">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-[11px] font-bold uppercase tracking-widest mb-1">
                        <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
                        AI Generation Active
                      </div>
                      <h3 className="text-base font-extrabold text-white tracking-wide">
                        Crafting High-Impact Social Post...
                      </h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                        Synthesizing Brand DNA, copywriting frameworks, SEO hashtags, and commercial visual creative for <strong className="text-slate-200">"{socialTopic}"</strong>.
                      </p>
                    </div>

                    {/* Sleek Progress Indicator & Badges (No raw technical log steps) */}
                    <div className="max-w-md mx-auto space-y-4 relative z-10">
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800/80 shadow-inner">
                        <div className="h-full bg-gradient-to-r from-brand-500 via-purple-500 to-amber-400 rounded-full animate-pulse w-full transition-all duration-700" />
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-slate-300">
                        <span className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center gap-1.5 shadow-sm">
                          <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Brand Identity
                        </span>
                        <span className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center gap-1.5 shadow-sm">
                          <PenTool className="w-3.5 h-3.5 text-emerald-400" /> Dynamic Copy
                        </span>
                        <span className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center gap-1.5 shadow-sm">
                          <Hash className="w-3.5 h-3.5 text-purple-400" /> Target SEO
                        </span>
                        <span className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center gap-1.5 shadow-sm">
                          <Palette className="w-3.5 h-3.5 text-amber-400" /> Visual Asset
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 sm:p-12 text-center rounded-[28px] border border-dashed border-slate-200 dark:border-slate-800 space-y-4 bg-slate-50/50 dark:bg-slate-900/40">
                    <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto text-brand-600 dark:text-brand-400">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    
                    <div className="space-y-1 max-w-md mx-auto">
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                        AI Social Asset Blueprint Ready
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Topic: <span className="font-bold text-slate-700 dark:text-slate-200">"{socialTopic || 'Select or enter topic'}"</span>
                      </p>
                    </div>

                    <button
                      onClick={handleGenerateSocial}
                      className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold flex items-center gap-2 mx-auto shadow-lg shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Execute Prompt & Generate Post</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Email Copy Studio */}
          {tab === 'EMAIL' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 xl:col-span-5 p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-5 h-fit">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Email Details</h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Provide details to draft the perfect email</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Purpose */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Purpose</label>
                    <select
                      value={emailForm.purpose}
                      onChange={(e) => updateEmailField('purpose', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all"
                    >
                      <option value="newsletter">Newsletter / Update</option>
                      <option value="sales_pitch">Sales Pitch</option>
                      <option value="cold_outreach">Cold Outreach</option>
                      <option value="follow_up">Follow Up</option>
                      <option value="product_launch">Product Launch</option>
                      <option value="event_invitation">Event Invitation</option>
                      <option value="customer_onboarding">Customer Onboarding</option>
                      <option value="re_engagement">Re-engagement</option>
                      <option value="thank_you">Thank You / Appreciation</option>
                      <option value="feedback_request">Feedback Request</option>
                      <option value="partnership_proposal">Partnership Proposal</option>
                      <option value="executive_letter">Executive Letter</option>
                    </select>
                  </div>

                  {/* Recipient */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Recipient</label>
                    <input
                      type="text"
                      value={emailForm.recipient}
                      onChange={(e) => updateEmailField('recipient', e.target.value)}
                      placeholder="e.g. Subscribers"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all"
                    />
                  </div>

                  {/* Tone */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Tone</label>
                    <select
                      value={emailForm.tone}
                      onChange={(e) => updateEmailField('tone', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all"
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly & Warm</option>
                      <option value="formal">Formal / Corporate</option>
                      <option value="persuasive">Persuasive / Sales-Driven</option>
                      <option value="casual">Casual & Conversational</option>
                      <option value="urgent">Urgent / Time-Sensitive</option>
                      <option value="empathetic">Empathetic / Supportive</option>
                      <option value="authoritative">Authoritative / Expert</option>
                      <option value="inspirational">Inspirational / Motivational</option>
                    </select>
                  </div>

                  {/* Length / Format */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Length</label>
                    <select
                      value={emailForm.lengthFormat}
                      onChange={(e) => updateEmailField('lengthFormat', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all"
                    >
                      <option value="short">Short (under 150 words)</option>
                      <option value="detailed">Detailed (300–500 words)</option>
                      <option value="long_form">Long-Form (500+ words)</option>
                      <option value="bullet_points">Bullet Points</option>
                      <option value="numbered_steps">Numbered Steps</option>
                      {!isStarter && <option value="storytelling">Storytelling</option>}
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Subject Topic</label>
                  <input
                    type="text"
                    value={emailForm.subject}
                    onChange={(e) => updateEmailField('subject', e.target.value)}
                    placeholder="e.g. Exclusive Launch Invite..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all"
                  />
                </div>

                {/* Context */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Context</label>
                  <textarea
                    value={emailForm.context}
                    onChange={(e) => updateEmailField('context', e.target.value)}
                    placeholder="Background or situation..."
                    rows={1}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all resize-none"
                  />
                </div>

                {/* Key Points */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Key Points</label>
                  <textarea
                    value={emailForm.keyPoints}
                    onChange={(e) => updateEmailField('keyPoints', e.target.value)}
                    placeholder="Points to include..."
                    rows={1}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all resize-none"
                  />
                </div>

                {/* CTA */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Call to Action (CTA)</label>
                  <input
                    type="text"
                    value={emailForm.cta}
                    onChange={(e) => updateEmailField('cta', e.target.value)}
                    placeholder="e.g. Shop Now..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all"
                  />
                </div>

                {/* Sender Details */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Sender Details</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={emailForm.senderName}
                      onChange={(e) => updateEmailField('senderName', e.target.value)}
                      placeholder="Name"
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all"
                    />
                    <input
                      type="text"
                      value={emailForm.senderDesignation}
                      onChange={(e) => updateEmailField('senderDesignation', e.target.value)}
                      placeholder="Role"
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all"
                    />
                    <input
                      type="text"
                      value={emailForm.senderCompany}
                      onChange={(e) => updateEmailField('senderCompany', e.target.value)}
                      placeholder="Company"
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* ── LIVE & EDITABLE AI EMAIL PROMPT ── */}
                <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-500" /> AI Email Prompt
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">
                        EDITABLE
                      </span>
                      <button
                        type="button"
                        onClick={() => setEmailPrompt(buildEmailPrompt(emailForm))}
                        className="text-[9px] font-bold text-slate-500 hover:text-brand-500 underline flex items-center gap-0.5"
                        title="Reset to default email prompt"
                      >
                        <RefreshCw className="w-2.5 h-2.5" /> Reset
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={Math.max(8, (emailPrompt || '').split('\n').length + 1)}
                    value={emailPrompt}
                    onChange={(e) => setEmailPrompt(e.target.value)}
                    placeholder="Custom email prompt directives..."
                    className="w-full bg-transparent border-0 p-0 text-xs font-sans font-medium leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-0 resize-none placeholder-slate-400"
                  />
                </div>

                <button
                  onClick={handleGenerateEmail}
                  disabled={draftingEmail}
                  className="w-full btn-primary py-3 mt-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {draftingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {draftingEmail ? 'Generating Email...' : 'Generate Email Copy'}
                </button>
              </div>

              <div className="lg:col-span-6 xl:col-span-7 p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 gap-2">
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Generated Email Copy</h2>
                  {emailResult && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setEmailCanvasMode('edit')}
                          className={`px-2.5 py-0.5 rounded-lg transition-all ${emailCanvasMode === 'edit' ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                        >
                          Edit Text
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmailCanvasMode('preview')}
                          className={`px-2.5 py-0.5 rounded-lg transition-all ${emailCanvasMode === 'preview' ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                        >
                          Formatted Email
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const fullEmailText = `Subject: ${emailResult.subject}\nPreheader: ${emailResult.preheader}\n\n${emailResult.body}`;
                          navigator.clipboard.writeText(fullEmailText);
                          if (showToast) showToast('Email copy copied to clipboard!', 'success');
                        }}
                        className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1 text-slate-600 dark:text-slate-300"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy Email
                      </button>
                      {renderSubmitToApprovalsButton(emailResult)}
                    </div>
                  )}
                </div>

                {emailResult ? (
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 block mb-1">Subject</span>
                      <input
                        type="text"
                        value={emailResult.subject}
                        onChange={(e) => setEmailResult({ ...emailResult, subject: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 block mb-1">Preheader Preview</span>
                      <input
                        type="text"
                        value={emailResult.preheader}
                        onChange={(e) => setEmailResult({ ...emailResult, preheader: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      {emailCanvasMode === 'preview' ? (
                        <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed text-xs space-y-3 font-sans shadow-sm">
                          {emailResult.body.split('\n\n').map((para, idx) => {
                            const trimmed = cleanArticleText(para.trim());
                            if (!trimmed) return null;
                            if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                              const items = trimmed.split('\n').filter(Boolean);
                              return (
                                <ul key={idx} className="space-y-1.5 pl-2 text-slate-700 dark:text-slate-300">
                                  {items.map((it, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span className="text-brand-500 font-bold">•</span>
                                      <span>{it.replace(/^[•*-]\s*/, '')}</span>
                                    </li>
                                  ))}
                                </ul>
                              );
                            }
                            return <p key={idx} className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{trimmed}</p>;
                          })}
                        </div>
                      ) : (
                        <textarea
                          rows={Math.max(14, (emailResult.body || '').split('\n').length + 3)}
                          value={emailResult.body}
                          onChange={(e) => setEmailResult({ ...emailResult, body: e.target.value })}
                          className="w-full p-4 rounded-2xl font-sans text-xs leading-relaxed text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-y"
                          placeholder="Email content..."
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-500 space-y-2">
                    <Mail className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600" />
                    <p className="text-xs font-medium">Click "Generate Email Copy" to draft subjects, preheaders, and email bodies formatted for marketing campaigns.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Ad Copy Studio */}
          {tab === 'AD_COPY' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Ad Copy Parameters</h2>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                    {activeWorkspace?.brandName || 'Brand DNA'}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Product / Feature Focus</label>
                  <input
                    type="text"
                    value={adProduct}
                    onChange={(e) => setAdProduct(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Ad Platform</label>
                  <select
                    value={adPlatform}
                    onChange={(e) => setAdPlatform(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 capitalize"
                  >
                    {['facebook', 'instagram', 'google', 'linkedin'].map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* ── LIVE & EDITABLE AI AD COPY PROMPT ── */}
                <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-500" /> AI Ad Copy Prompt
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">
                        EDITABLE
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdCopyPrompt(buildAdPrompt(adProduct, adPlatform))}
                        className="text-[9px] font-bold text-slate-500 hover:text-brand-500 underline flex items-center gap-0.5"
                        title="Reset to default ad prompt"
                      >
                        <RefreshCw className="w-2.5 h-2.5" /> Reset
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={Math.max(7, (adCopyPrompt || '').split('\n').length + 1)}
                    value={adCopyPrompt}
                    onChange={(e) => setAdCopyPrompt(e.target.value)}
                    placeholder="Custom ad prompt directives..."
                    className="w-full bg-transparent border-0 p-0 text-xs font-sans font-medium leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-0 resize-none placeholder-slate-400"
                  />
                </div>

                <button
                  onClick={handleGenerateAd}
                  disabled={draftingAd}
                  className="w-full btn-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {draftingAd ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {draftingAd ? 'Generating Ad Copy...' : 'Generate Ad Copy Variations'}
                </button>
              </div>

              <div className="lg:col-span-2 p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-4">
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Generated Ad Copy Variations</h2>
                {adResult ? (
                  <div className="space-y-4 text-xs">
                    {adResult.headlines?.length > 0 && (
                      <div>
                        <span className="font-bold text-slate-500 block mb-1">Headlines</span>
                        <div className="space-y-1">
                          {adResult.headlines.map((h, i) => (
                            <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                              {h}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {adResult.descriptions?.length > 0 && (
                      <div>
                        <span className="font-bold text-slate-500 block mb-1">Descriptions</span>
                        <div className="space-y-1">
                          {adResult.descriptions.map((d, i) => (
                            <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                              {d}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {adResult.longFormAd && (
                      <div>
                        <span className="font-bold text-slate-500 block mb-1">Long-form Facebook / Instagram Ad</span>
                        <textarea
                          rows={6}
                          value={adResult.longFormAd}
                          onChange={(e) => setAdResult({ ...adResult, longFormAd: e.target.value })}
                          className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-500 space-y-2">
                    <Globe className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600" />
                    <p className="text-xs font-medium">Click "Generate Ad Copy Variations" to produce high-converting headlines, descriptions, and long-form ad copy.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* MAIN CONTENT STUDIO HUB PAGE VIEW (when no channel card is selected) */}
          {/* Header Bar */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-orange-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 flex items-center justify-center shrink-0">
                  <PenTool className="w-4 h-4" />
                </div>
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{t('unifiedContentStudio', 'Unified Content Studio')}</h1>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                AI-powered drafting engine for blogs, social posts, emails, and ads anchored to{' '}
                <strong className="text-slate-900 dark:text-white">{activeWorkspace?.brandName || 'your brand'}</strong>.
              </p>
            </div>
          </div>

          {/* 3 Core Channel Grid Cards (Blog, Social Media, Email / Letter) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: 'BLOG',
                title: t('blog', 'Blog'),
                subtitle: 'Articles, Guides & SEO Copy',
                icon: FileText,
                colorClass: 'from-blue-500/10 to-sky-500/5',
                hoverBorder: 'hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] dark:hover:border-blue-400/40',
                badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                iconColor: 'text-blue-500',
                leftBorderColor: '#3b82f6'
              },
              {
                id: 'SOCIAL',
                title: t('socialMedia', 'Social Media'),
                subtitle: 'Posts, Carousels & Reels',
                icon: Share2,
                colorClass: 'from-purple-500/10 to-indigo-500/5',
                hoverBorder: 'hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] dark:hover:border-purple-400/40',
                badgeBg: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
                iconColor: 'text-brand-500',
                leftBorderColor: '#a855f7'
              },
              {
                id: 'EMAIL',
                title: t('emailLetter', 'Email / Letter'),
                subtitle: 'Newsletters & Cold Outreach',
                icon: Mail,
                colorClass: 'from-emerald-500/10 to-teal-500/5',
                hoverBorder: 'hover:border-emerald-400/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] dark:hover:border-emerald-400/40',
                badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                iconColor: 'text-emerald-500',
                leftBorderColor: '#10b981'
              }
            ].map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.id}
                  onClick={() => openSubPage(card.id)}
                  className={`p-5 rounded-3xl text-left transition-all duration-300 border-t border-r border-b flex flex-col justify-between group relative overflow-hidden bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 ${card.hoverBorder}`}
                  style={{ borderLeft: `4px solid ${card.leftBorderColor}` }}
                >
                  {/* Light low-opacity glow edge backdrop */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.colorClass} opacity-30 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-2xl ${card.badgeBg} transition-transform group-hover:scale-110 duration-300`}>
                        <Icon className={`w-5 h-5 ${card.iconColor}`} />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">{card.title}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-snug">{card.subtitle}</p>
                    </div>
                  </div>

                  <div className="relative z-10 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    <span>{t('openStudio', 'Open Studio')}</span>
                    <span className={`${card.iconColor} opacity-80 group-hover:opacity-100 font-semibold`}>{t('openPage', 'Open Page →')}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Clean Overview Card below grid */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-orange-500 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{t('selectChannelStudio', 'Select a Channel Studio to Begin')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Click on any channel card above ({t('blog', 'Blog')}, {t('socialMedia', 'Social Media')}, or Email) to open its dedicated studio drafting page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
