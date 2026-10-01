import React, { useState, useEffect, useRef } from "react";
import { API_BASE } from "../../config/api";
import { Sparkles, Loader2, Copy, Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, Download, CheckCircle2, FolderPlus, ArrowRight, FolderKanban, Eye, Lock } from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { downloadImageToDevice } from "../../utils/downloadHelper";
import { getBrandLogoUrl } from "../../utils/brandLogoHelper";
import { compositeBrandLogoOntoImage } from "../../utils/imageCompositor";
import { FullImageModal } from "../../components/modals/FullImageModal";

const VisualControls = ({ visualStyle, setVisualStyle, generating, onGenerate, visualDirective, referenceImage }) => (
  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
    <h4 className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
      <Sparkles className="w-3 h-3 text-purple-500" /> AI Visual Scenario & Layout
    </h4>

    {visualDirective && (
      <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 space-y-1">
        <span className="text-[9px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
          Visual Guidance Brief:
        </span>
        <p className="text-[11px] text-slate-800 dark:text-slate-200 font-medium leading-relaxed break-words">
          {visualDirective}
        </p>
      </div>
    )}

    {referenceImage && (
      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
        <img src={referenceImage} alt="Reference Product Object" className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0" />
        <div className="min-w-0 flex-1">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Product Reference Object</span>
          <p className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold truncate">User Uploaded Brief Object</p>
        </div>
      </div>
    )}

    <div>
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">AI Image Style Direction</label>
      <select value={visualStyle} onChange={(e) => setVisualStyle(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
        <option>Glassmorphic Modern 3D</option>
        <option>Minimalist Corporate Tech</option>
        <option>Cyberpunk Neon Gradients</option>
        <option>Photorealistic B2B Studio</option>
        <option>Bold Editorial Fashion</option>
      </select>
    </div>

    <button onClick={onGenerate} disabled={generating} className="w-full btn-primary py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer">
      {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
      {generating ? "Synthesizing AI Image..." : "Generate AI Visual Scenario"}
    </button>
  </div>
);

const ContentPill = ({ label, value, color = "slate" }) => {
  if (!value) return null;
  const cc = { brand:"text-brand-500", purple:"text-purple-500", indigo:"text-indigo-500", emerald:"text-emerald-500", amber:"text-amber-500", blue:"text-blue-500", slate:"text-slate-400" };
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <span className={"text-[8px] font-black uppercase tracking-widest " + (cc[color]||cc.slate)}>{label}</span>
        <button onClick={() => navigator.clipboard.writeText(value)} className="p-0.5 text-slate-400 hover:text-brand-500"><Copy className="w-2.5 h-2.5" /></button>
      </div>
      <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{value}</p>
    </div>
  );
};

const HeaderRow = ({ platform, topic, onViewAssetLibrary }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
    <div className="flex items-center gap-3 min-w-0">
      <span className="px-3.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-black uppercase tracking-wider shrink-0">
        {platform ? platform.toUpperCase() : 'POST'}
      </span>
      <span className="text-xs text-slate-500 font-medium truncate">
        Topic: <strong className="text-slate-800 dark:text-slate-200 font-bold">"{topic}"</strong>
      </span>
    </div>

    {onViewAssetLibrary && (
      <button
        onClick={onViewAssetLibrary}
        className="btn-primary py-2 px-4 rounded-xl font-extrabold text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
      >
        <FolderKanban className="w-3.5 h-3.5" />
        <span>View Asset Library</span>
      </button>
    )}
  </div>
);

const CopySidebar = ({ hook, story, shortCap, longCap, cta, hashtags, extras = [] }) => (
  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Content Studio Copy</span>
    <ContentPill label="Hook / Headline" value={hook} color="brand" />
    <ContentPill label="Storytelling Angle" value={story} color="purple" />
    <ContentPill label="Short Caption" value={shortCap} color="indigo" />
    <ContentPill label="Long Caption" value={longCap} color="slate" />
    <ContentPill label="Call to Action" value={cta} color="emerald" />
    <ContentPill label="SEO Hashtags" value={hashtags} color="blue" />
    {extras.map((e,i) => e.value ? <ContentPill key={i} label={e.label} value={e.value} color={e.color||"slate"} /> : null)}
  </div>
);

const extractCleanText = (raw) => {
  if (!raw) return '';
  let str = typeof raw === 'string' ? raw.trim() : JSON.stringify(raw);

  // If the string starts with JSON markers or contains JSON wrapper
  if (str.startsWith('{') || str.startsWith('[') || str.startsWith('```json')) {
    try {
      const clean = str.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(clean);
      if (parsed.data && typeof parsed.data === 'object') {
        return extractCleanText(parsed.data.content || parsed.data.body || parsed.data.longCaption || parsed.data.caption || JSON.stringify(parsed.data));
      }
      if (parsed.content) return extractCleanText(parsed.content);
      if (parsed.body) return extractCleanText(parsed.body);
      if (parsed.longCaption) return extractCleanText(parsed.longCaption);
      if (parsed.caption) return extractCleanText(parsed.caption);
    } catch (e) {
      // Regex extraction if JSON.parse failed due to unescaped quotes or newlines
      const contentMatch = str.match(/"content"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"|"\s*\}|\s*\n\s*\})/);
      if (contentMatch && contentMatch[1]) {
        return contentMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }
    }
  }

  // Strip any residual leading JSON header lines
  str = str.replace(/^\{\s*"data"\s*:\s*\{\s*"id"[^}]*?"content"\s*:\s*"/i, '');
  str = str.replace(/"\s*\}\s*\}\s*$/i, '');
  str = str.replace(/\\n/g, '\n').replace(/\\"/g, '"');

  return str.trim();
};

const unwrapAndCleanContent = (raw) => {
  if (!raw) return {};
  let item = raw;
  if (typeof item === 'string') {
    const trimmed = item.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.startsWith('```json')) {
      try {
        const clean = trimmed.replace(/^```json/, '').replace(/```$/, '').trim();
        item = JSON.parse(clean);
      } catch (e) {}
    }
  }

  if (item && typeof item === 'object') {
    if (item.data && typeof item.data === 'object') {
      item = { ...item, ...item.data };
    }
    if (typeof item.data === 'string' && (item.data.trim().startsWith('{') || item.data.trim().startsWith('```json'))) {
      try {
        const clean = item.data.replace(/^```json/, '').replace(/```$/, '').trim();
        const inner = JSON.parse(clean);
        item = { ...item, ...inner };
      } catch (e) {}
    }
    if (item.content) {
      item.content = extractCleanText(item.content);
    }
    if (item.body) {
      item.body = extractCleanText(item.body);
    }
    if (item.longCaption) {
      item.longCaption = extractCleanText(item.longCaption);
    }
    if (item.caption) {
      item.caption = extractCleanText(item.caption);
    }
  }

  return item || {};
};

const renderFormattedArticle = (rawText = '') => {
  const clean = extractCleanText(rawText);
  if (!clean) return null;

  const sections = clean.split(/\n\s*\n/);

  return sections.map((sec, idx) => {
    const trimmed = sec.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('### ')) {
      return (
        <h4 key={idx} className="text-sm font-bold text-slate-900 dark:text-white mt-4 mb-1.5">
          {trimmed.replace(/^###\s+/, '')}
        </h4>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h3 key={idx} className="text-base font-extrabold text-slate-900 dark:text-white mt-5 mb-2 pb-1 border-b border-slate-100 dark:border-slate-800">
          {trimmed.replace(/^##\s+/, '')}
        </h3>
      );
    }
    if (trimmed.startsWith('# ')) {
      return (
        <h2 key={idx} className="text-lg font-black text-slate-900 dark:text-white mt-6 mb-2">
          {trimmed.replace(/^#\s+/, '')}
        </h2>
      );
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bullets = trimmed.split(/\n/).map(b => b.replace(/^[-*]\s+/, '').trim()).filter(Boolean);
      return (
        <ul key={idx} className="list-disc pl-5 space-y-1 my-2 text-xs text-slate-700 dark:text-slate-300">
          {bullets.map((b, bIdx) => <li key={bIdx}>{b}</li>)}
        </ul>
      );
    }
    return (
      <p key={idx} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed my-2">
        {trimmed}
      </p>
    );
  });
};

export const PlatformPostCanvas = ({ workspace, generatedContent, credits, deductVisualCredits, setIsCreditModalOpen }) => {
  const { showToast, addGlobalAsset, setActiveModule, studioTarget, setGeneratedContent, user } = useWorkspace();
  const userPlanNorm = (user?.plan || 'starter').toLowerCase();
  const isStarter = userPlanNorm === 'starter' || userPlanNorm === 'free' || userPlanNorm === 'base';
  const unwrapped = unwrapAndCleanContent(generatedContent);
  const rawType     = (unwrapped?.type     || unwrapped?.postType || generatedContent?.type || generatedContent?.postType || "SOCIAL").toUpperCase();
  const [platform, setPlatform] = useState((unwrapped?.platform || generatedContent?.platform || "instagram").toLowerCase());
  const rawPostType = (unwrapped?.postType || generatedContent?.postType || "").toLowerCase();

  const contentData = unwrapped;
  const brand    = workspace?.brandName || "AISA Brand";
  const handle   = "@" + brand.toLowerCase().replace(/\s+/g, "");
  const topic    = contentData?.topic || contentData?.title || contentData?.subject || "Campaign Objective";
  const hook     = contentData?.hook || contentData?.headline || contentData?.title || "Upgrade Your Brand Strategy!";
  const story    = contentData?.storytelling || contentData?.storytellingAngle || (Array.isArray(contentData?.creativeVariations) ? contentData.creativeVariations[0]?.text : "") || "";
  const shortCap = contentData?.shortCaption || contentData?.short_caption || "";
  const longCap  = contentData?.longCaption || contentData?.caption || contentData?.body || contentData?.content || "";
  const caption  = longCap || shortCap || contentData?.leadParagraph || contentData?.metaDescription || "";
  const cta      = contentData?.cta || contentData?.callToAction || "Click the link in bio to learn more!";
  const rawHashtags = (Array.isArray(contentData?.hashtags) && contentData.hashtags.length > 0) ? contentData.hashtags : null;
  const hashArr  = rawHashtags || [`#${brand.replace(/\s+/g,'')}`, "#BrandDNA", "#Marketing"];
  const hashtags = hashArr.join(" ");
  const variations = contentData?.creativeVariations || [];

  const [generating,  setGenerating]  = useState(false);
  const [visualStyle, setVisualStyle] = useState("Glassmorphic Modern 3D");
  const [activeSlide, setActiveSlide] = useState(0);

  const generateVertexAISvgDataUrl = (promptText = '', brandName = '', styleName = 'Glassmorphic Modern 3D', refImgUrl = null) => {
    const pLower = (promptText + ' ' + topic + ' ' + platform).toLowerCase();
    const referenceObjUrl = refImgUrl || contentData?.referenceImage || generatedContent?.referenceImage || null;
    
    let category = 'LUXURY_HAMPER';
    if (pLower.includes('carousel') || pLower.includes('customization') || pLower.includes('bespoke') || pLower.includes('option') || pLower.includes('slide')) {
      category = 'CAROUSEL_CUSTOMIZATION';
    } else if (pLower.includes('social') || pLower.includes('instagram') || pLower.includes('facebook') || pLower.includes('twitter') || pLower.includes('linkedin') || pLower.includes('post') || pLower.includes('caption') || pLower.includes('viral')) {
      category = 'SOCIAL_ENGAGEMENT';
    } else if (pLower.includes('sweet') || pLower.includes('kaju') || pLower.includes('namkeen') || pLower.includes('food') || pLower.includes('flavor') || pLower.includes('taste') || pLower.includes('thali')) {
      category = 'FOOD_SWEETS';
    } else if (pLower.includes('website') || pLower.includes('builder') || pLower.includes('landing') || pLower.includes('page') || pLower.includes('tech') || pLower.includes('digital') || pLower.includes('code')) {
      category = 'WEBSITE_TECH';
    } else if (pLower.includes('seo') || pLower.includes('article') || pLower.includes('blog') || pLower.includes('press') || pLower.includes('newspaper') || pLower.includes('headline')) {
      category = 'SEO_PRESS';
    }

    const escapeXml = (str = '') => {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const titleText = promptText.trim() || topic || 'AI Commercial Campaign Visual';
    const displayTitle = escapeXml(titleText.length > 55 ? titleText.slice(0, 52) + '...' : titleText);
    const bName = escapeXml(brandName || brand || "AISA");
    const safeStyle = escapeXml(styleName);

    let bgGradient = '';
    let accentGrad = '';
    let categoryBadge = '';
    let centerPieceSvg = '';

    if (referenceObjUrl) {
      bgGradient = '<radialGradient id="bg" cx="50%" cy="40%" r="80%"><stop offset="0%" stop-color="#1A0B2E"/><stop offset="60%" stop-color="#0F172A"/><stop offset="100%" stop-color="#020617"/></radialGradient>';
      accentGrad = '<linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#A855F7"/><stop offset="50%" stop-color="#EC4899"/><stop offset="100%" stop-color="#6366F1"/></linearGradient>';
      categoryBadge = 'PRODUCT OBJECT & VISUAL AD';

      centerPieceSvg = `
        <g filter="url(#shadow)" transform="translate(0, -10)">
          <!-- Outer Glowing Frame -->
          <rect x="250" y="160" width="580" height="520" rx="36" fill="none" stroke="url(#accent)" stroke-width="4" filter="url(#glow)"/>
          <!-- Inner Dark Card Frame -->
          <rect x="260" y="170" width="560" height="500" rx="32" fill="#0F172A" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
          
          <!-- Embedded Product Image Object -->
          <g clip-path="url(#productClip)">
            <image href="${escapeXml(referenceObjUrl)}" x="260" y="170" width="560" height="500" preserveAspectRatio="xMidYMid slice"/>
          </g>
          
          <!-- Gradient Frame Vignette -->
          <rect x="260" y="170" width="560" height="500" rx="32" fill="none" stroke="url(#accent)" stroke-width="3" opacity="0.8"/>
          <rect x="260" y="550" width="560" height="120" rx="0" fill="url(#bottomFade)" />
          
          <!-- Product Focus Badge -->
          <rect x="280" y="190" width="190" height="32" rx="16" fill="rgba(15,23,42,0.85)" stroke="url(#accent)" stroke-width="1.5" />
          <text x="375" y="211" fill="#F8FAFC" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="800" text-anchor="middle">PRIMARY PRODUCT OBJECT</text>
        </g>
      `;
    } else if (category === 'CAROUSEL_CUSTOMIZATION') {
      bgGradient = '<radialGradient id="bg" cx="50%" cy="40%" r="80%"><stop offset="0%" stop-color="#1E1B4B"/><stop offset="60%" stop-color="#0F172A"/><stop offset="100%" stop-color="#020617"/></radialGradient>';
      accentGrad = '<linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#818CF8"/><stop offset="50%" stop-color="#C084FC"/><stop offset="100%" stop-color="#38BDF8"/></linearGradient>';
      categoryBadge = 'CAROUSEL & BESPOKE CUSTOMIZATION';
      
      centerPieceSvg = `
        <g filter="url(#shadow)" transform="translate(0, -10)">
          <rect x="580" y="270" width="300" height="380" rx="20" fill="rgba(30, 41, 59, 0.6)" stroke="#818CF8" stroke-width="2" opacity="0.6"/>
          <rect x="200" y="270" width="300" height="380" rx="20" fill="rgba(30, 41, 59, 0.7)" stroke="#C084FC" stroke-width="2" opacity="0.8"/>
          <rect x="340" y="230" width="400" height="440" rx="24" fill="#1E293B" stroke="url(#accent)" stroke-width="4"/>
          <rect x="360" y="255" width="360" height="180" rx="16" fill="rgba(255,255,255,0.06)"/>
          
          <rect x="380" y="470" width="320" height="12" rx="6" fill="#334155"/>
          <circle cx="480" cy="476" r="16" fill="#38BDF8" stroke="#FFF" stroke-width="3" filter="url(#glow)"/>
          <rect x="380" y="520" width="320" height="12" rx="6" fill="#334155"/>
          <circle cx="600" cy="526" r="16" fill="#C084FC" stroke="#FFF" stroke-width="3" filter="url(#glow)"/>

          <circle cx="280" cy="450" r="24" fill="#1E293B" stroke="url(#accent)" stroke-width="2"/>
          <path d="M 285, 440 L 270, 450 L 285, 460" fill="none" stroke="#F8FAFC" stroke-width="3"/>
          <circle cx="800" cy="450" r="24" fill="#1E293B" stroke="url(#accent)" stroke-width="2"/>
          <path d="M 795, 440 L 810, 450 L 795, 460" fill="none" stroke="#F8FAFC" stroke-width="3"/>
          
          <circle cx="500" cy="630" r="6" fill="#38BDF8"/>
          <circle cx="540" cy="630" r="8" fill="#FFF"/>
          <circle cx="580" cy="630" r="6" fill="#38BDF8"/>
        </g>
      `;
    } else if (category === 'SOCIAL_ENGAGEMENT') {
      bgGradient = '<radialGradient id="bg" cx="50%" cy="40%" r="80%"><stop offset="0%" stop-color="#2E1065"/><stop offset="60%" stop-color="#0F172A"/><stop offset="100%" stop-color="#020617"/></radialGradient>';
      accentGrad = '<linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F43F5E"/><stop offset="50%" stop-color="#FB7185"/><stop offset="100%" stop-color="#E11D48"/></linearGradient>';
      categoryBadge = 'SOCIAL MEDIA & VIRAL ENGAGEMENT';

      centerPieceSvg = `
        <g filter="url(#shadow)" transform="translate(0, -20)">
          <rect x="360" y="210" width="360" height="480" rx="36" fill="#0F172A" stroke="url(#accent)" stroke-width="5"/>
          <rect x="380" y="235" width="320" height="430" rx="24" fill="rgba(255,255,255,0.05)"/>
          
          <rect x="490" y="245" width="100" height="14" rx="7" fill="#1E293B"/>

          <rect x="400" y="280" width="280" height="240" rx="16" fill="url(#accent)" opacity="0.8"/>
          <circle cx="540" cy="400" r="50" fill="rgba(255,255,255,0.2)"/>

          <g filter="url(#glow)">
            <path d="M 280, 320 C 280, 300 310, 290 320, 310 C 330, 290 360, 300 360, 320 C 360, 350 320, 370 320, 380 C 320, 370 280, 350 280, 320 Z" fill="#F43F5E"/>
            <circle cx="800" cy="360" r="32" fill="#FB7185"/>
            <path d="M 790, 360 L 810, 360 M 800, 350 L 800, 370" stroke="#FFF" stroke-width="4"/>
            <polygon points="760,260 770,285 795,285 775,300 782,325 760,310 738,325 745,300 725,285 750,285" fill="#FCD34D"/>
          </g>
        </g>
      `;
    } else if (category === 'FOOD_SWEETS') {
      bgGradient = '<radialGradient id="bg" cx="50%" cy="40%" r="80%"><stop offset="0%" stop-color="#451A03"/><stop offset="60%" stop-color="#1A0B2E"/><stop offset="100%" stop-color="#05010B"/></radialGradient>';
      accentGrad = '<linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F59E0B"/><stop offset="50%" stop-color="#D97706"/><stop offset="100%" stop-color="#B45309"/></linearGradient>';
      categoryBadge = 'AUTHENTIC HERITAGE & CULINARY';

      centerPieceSvg = `
        <g filter="url(#shadow)" transform="translate(0, -30)">
          <ellipse cx="540" cy="480" rx="340" ry="180" fill="url(#accent)" stroke="#FCD34D" stroke-width="4" filter="url(#glow)"/>
          <ellipse cx="540" cy="480" rx="300" ry="150" fill="#291605"/>

          <circle cx="360" cy="440" r="45" fill="#F59E0B" stroke="#FFF" stroke-width="3"/>
          <circle cx="720" cy="440" r="45" fill="#F59E0B" stroke="#FFF" stroke-width="3"/>
          <circle cx="540" cy="380" r="55" fill="#D97706" stroke="#FFF" stroke-width="3"/>

          <polygon points="510,480 540,430 570,480 540,530" fill="#F8FAFC" stroke="#F59E0B" stroke-width="2" filter="url(#shadow)"/>
          <polygon points="430,510 460,470 490,510 460,550" fill="#E2E8F0" stroke="#F59E0B" stroke-width="2" filter="url(#shadow)"/>
          <polygon points="590,510 620,470 650,510 620,550" fill="#E2E8F0" stroke="#F59E0B" stroke-width="2" filter="url(#shadow)"/>
        </g>
      `;
    } else if (category === 'WEBSITE_TECH') {
      bgGradient = '<radialGradient id="bg" cx="50%" cy="40%" r="80%"><stop offset="0%" stop-color="#0284C7"/><stop offset="60%" stop-color="#0F172A"/><stop offset="100%" stop-color="#020617"/></radialGradient>';
      accentGrad = '<linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#38BDF8"/><stop offset="50%" stop-color="#818CF8"/><stop offset="100%" stop-color="#0EA5E9"/></linearGradient>';
      categoryBadge = 'AI WEBSITE & DIGITAL BUILDER';

      centerPieceSvg = `
        <g filter="url(#shadow)" transform="translate(0, -20)">
          <rect x="240" y="220" width="600" height="440" rx="24" fill="#0F172A" stroke="url(#accent)" stroke-width="4"/>
          <rect x="240" y="220" width="600" height="50" rx="24" fill="#1E293B"/>
          <circle cx="270" cy="245" r="7" fill="#EF4444"/>
          <circle cx="290" cy="245" r="7" fill="#F59E0B"/>
          <circle cx="310" cy="245" r="7" fill="#10B981"/>

          <rect x="340" y="233" width="400" height="24" rx="12" fill="#0F172A"/>

          <rect x="270" y="290" width="260" height="180" rx="16" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" stroke-width="2"/>
          <rect x="550" y="290" width="260" height="180" rx="16" fill="rgba(129, 140, 248, 0.15)" stroke="#818CF8" stroke-width="2"/>
          <rect x="270" y="490" width="540" height="130" rx="16" fill="rgba(255, 255, 255, 0.05)" stroke="url(#accent)" stroke-width="2"/>
        </g>
      `;
    } else if (category === 'SEO_PRESS') {
      bgGradient = '<radialGradient id="bg" cx="50%" cy="40%" r="80%"><stop offset="0%" stop-color="#334155"/><stop offset="60%" stop-color="#0F172A"/><stop offset="100%" stop-color="#020617"/></radialGradient>';
      accentGrad = '<linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F59E0B"/><stop offset="50%" stop-color="#10B981"/><stop offset="100%" stop-color="#3B82F6"/></linearGradient>';
      categoryBadge = 'SEO INTELLIGENCE & PRESS ARTICLES';

      centerPieceSvg = `
        <g filter="url(#shadow)" transform="translate(0, -20)">
          <rect x="280" y="210" width="520" height="460" rx="20" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="4"/>
          <rect x="310" y="240" width="460" height="50" fill="#0F172A"/>
          <text x="540" y="272" fill="#FCD34D" font-family="serif" font-size="24" font-weight="bold" text-anchor="middle">EDITORIAL PRESS RELEASE</text>

          <rect x="310" y="310" width="210" height="140" fill="#E2E8F0"/>
          <rect x="540" y="310" width="230" height="16" fill="#334155"/>
          <rect x="540" y="335" width="230" height="12" fill="#94A3B8"/>
          <rect x="540" y="355" width="230" height="12" fill="#94A3B8"/>
          <rect x="540" y="375" width="180" height="12" fill="#94A3B8"/>

          <path d="M 310, 600 Q 420, 520 540, 560 T 770, 480" fill="none" stroke="#10B981" stroke-width="6" filter="url(#glow)"/>
        </g>
      `;
    } else {
      bgGradient = '<radialGradient id="bg" cx="50%" cy="40%" r="80%"><stop offset="0%" stop-color="#1A0B2E"/><stop offset="60%" stop-color="#0F051D"/><stop offset="100%" stop-color="#05010B"/></radialGradient>';
      accentGrad = '<linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F59E0B"/><stop offset="50%" stop-color="#EF4444"/><stop offset="100%" stop-color="#8B5CF6"/></linearGradient>';
      categoryBadge = 'ROYAL WEDDING & LUXURY GIFTING';

      centerPieceSvg = `
        <g filter="url(#shadow)" transform="translate(0, -30)">
          <ellipse cx="540" cy="640" rx="340" ry="80" fill="rgba(0,0,0,0.5)" filter="url(#glow)"/>
          <ellipse cx="540" cy="620" rx="320" ry="70" fill="url(#cardGlass)" stroke="url(#accent)" stroke-width="3"/>

          <rect x="350" y="320" width="380" height="280" rx="24" fill="#2A1448" stroke="url(#goldRibbon)" stroke-width="4"/>
          <rect x="330" y="300" width="420" height="55" rx="16" fill="url(#goldRibbon)" filter="url(#shadow)"/>
          <rect x="515" y="300" width="50" height="300" fill="url(#goldRibbon)"/>
          <rect x="350" y="430" width="380" height="45" fill="url(#goldRibbon)"/>
          <path d="M 470, 270 C 420, 220 480, 180 540, 260 C 600, 180 660, 220 610, 270 Z" fill="url(#goldRibbon)" filter="url(#glow)"/>
          <circle cx="540" cy="265" r="22" fill="#F59E0B" stroke="#FFF" stroke-width="3"/>
        </g>
      `;
    }

    const safeCategory = escapeXml(categoryBadge);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="100%" height="100%">
      <defs>
        ${bgGradient}
        ${accentGrad}
        <linearGradient id="goldRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FEF08A"/>
          <stop offset="50%" stop-color="#F59E0B"/>
          <stop offset="100%" stop-color="#B45309"/>
        </linearGradient>
        <linearGradient id="cardGlass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.12)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0.03)"/>
        </linearGradient>
        <linearGradient id="bottomFade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="transparent"/>
          <stop offset="100%" stop-color="rgba(15,23,42,0.95)"/>
        </linearGradient>
        <clipPath id="productClip">
          <rect x="260" y="170" width="560" height="500" rx="32"/>
        </clipPath>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="20" stdDeviation="25" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="18" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      <rect width="1080" height="1080" fill="url(#bg)"/>

      <circle cx="200" cy="250" r="220" fill="url(#accent)" opacity="0.22" filter="url(#glow)"/>
      <circle cx="880" cy="750" r="260" fill="url(#accent)" opacity="0.18" filter="url(#glow)"/>

      ${centerPieceSvg}

      <rect x="320" y="80" width="440" height="50" rx="25" fill="rgba(15, 23, 42, 0.85)" stroke="url(#accent)" stroke-width="2" filter="url(#shadow)"/>
      <text x="540" y="113" fill="#FCD34D" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800" text-anchor="middle" letter-spacing="2.5">${bName.toUpperCase()} • ${safeCategory}</text>

      <g transform="translate(90, 710)" filter="url(#shadow)">
        <rect x="0" y="0" width="900" height="280" rx="32" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="2"/>
        <rect x="0" y="0" width="900" height="280" rx="32" fill="url(#cardGlass)"/>

        <rect x="40" y="35" width="220" height="36" rx="18" fill="url(#accent)"/>
        <text x="150" y="59" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" text-anchor="middle" letter-spacing="1.5">AI CREATIVE ASSET</text>

        <text x="40" y="125" fill="#F8FAFC" font-family="'Plus Jakarta Sans', sans-serif" font-size="30" font-weight="800">${displayTitle}</text>
        <text x="40" y="175" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="500">Style: ${safeStyle} | 4K HDR Vector Render</text>

        <line x1="40" y1="215" x2="860" y2="215" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

        <text x="40" y="248" fill="#FCD34D" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="700">⚡ Powered by Google Cloud Vertex AI (Gemini 3.1 Image Engine)</text>
        <text x="860" y="248" fill="#64748B" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="600" text-anchor="end">1080 x 1080 px</text>
      </g>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
  };

  const rawImagePrompt = contentData?.visualDirective || contentData?.imagePrompt || contentData?.visualPrompt || `${brand} ${topic} ${hook}`.slice(0, 150);
  const refObjUrl = contentData?.referenceImage || generatedContent?.referenceImage || null;
  const defaultVisual = (generatedContent?.imageUrl || contentData?.imageUrl) || generateVertexAISvgDataUrl(rawImagePrompt, brand, visualStyle, refObjUrl);

  const [visualUrl, setVisualUrl] = useState(defaultVisual);
  const [showFullImageModal, setShowFullImageModal] = useState(false);

  useEffect(() => {
    let active = true;
    const processImage = async () => {
      const promptToUse = contentData?.visualDirective || contentData?.imagePrompt || contentData?.visualPrompt || `${brand} ${topic} ${hook}`.slice(0, 150);
      const refObj = contentData?.referenceImage || generatedContent?.referenceImage || null;
      const existingImg = generatedContent?.imageUrl || contentData?.imageUrl || (visualUrl && !visualUrl.startsWith('data:image/svg+xml') ? visualUrl : null);
      const srcUrl = existingImg || generateVertexAISvgDataUrl(promptToUse, brand, visualStyle, refObj);
      const composited = await compositeBrandLogoOntoImage(srcUrl, {
        brandName: brand,
        domainUrl: workspace?.domainUrl,
        logoUrl: workspace?.logoUrl,
        faviconUrl: workspace?.faviconUrl
      });
      if (active) setVisualUrl(composited || srcUrl);
    };
    processImage();
    if (generatedContent?.imageStyle) setVisualStyle(generatedContent.imageStyle);
    if (generatedContent?.platform) setPlatform(generatedContent.platform.toLowerCase());
    setActiveSlide(0);
    return () => { active = false; };
  }, [generatedContent, topic, hook]);

  const carouselSlides = variations.length > 0
    ? variations.map((v, i) => ({ slide: i+1, headline: v.headline||v.title||hook, body: v.caption||v.body||v.text||caption, cta: i===variations.length-1?cta:null }))
    : [
        { slide:1, headline: hook,             body: story||caption,   cta: null },
        { slide:2, headline: "Key Insight",    body: longCap||caption, cta: null },
        { slide:3, headline: "Take Action Now",body: shortCap||caption,cta },
      ];

  const handleGenerateVisual = async () => {
    if (generating) return;
    const cost = 5;
    if ((credits?.balance ?? 0) < cost) { setIsCreditModalOpen(true); return; }
    setGenerating(true);
    deductVisualCredits(cost, "AI Visual: " + topic.slice(0, 30));

    const visualGuidancePrompt = contentData?.visualDirective || contentData?.imagePrompt || contentData?.visualPrompt || topic;
    const refObjImageUrl = contentData?.referenceImage || generatedContent?.referenceImage || studioTarget?.referenceImage || null;
    const isCustomStrategyPost = !!(contentData?.isCustomStrategy || studioTarget?.isCustomStrategy);

    const apiBase = API_BASE || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    try {
      if (isCustomStrategyPost) {
        // ── 2-AGENT PIPELINE: Agent 1 (Prompt Crafting) -> Agent 2 (Image Generation with Reference Image) ──────────
        console.log('[PlatformPostCanvas] 🤖 Invoking 2-Agent Pipeline for Custom Strategy card...');
        const agentRes = await fetch(`${apiBase}/creative/craft-and-generate-visual`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workspaceId: workspace?._id || workspace?.id,
            referenceImageUrl: refObjImageUrl,
            topic: topic,
            visualDirective: visualGuidancePrompt,
            hook: hook || contentData?.hook,
            caption: caption || contentData?.caption,
            brandName: brand || workspace?.brandName,
            brandColors: workspace?.brandColors || [],
            industry: workspace?.industry || workspace?.industryCategory || workspace?.niche || '',
            tagline: workspace?.tagline || '',
            companyDescription: workspace?.companyDescription || workspace?.metaDescription || workspace?.positioningSummary || '',
            platform: platform,
            style: visualStyle,
            aspect: (platform === 'linkedin' || platform === 'blog' || platform === 'newspaper') ? '16:9' : (platform === 'story' || platform === 'reel' || platform === 'tiktok') ? '9:16' : '1:1',
            creditCost: cost
          })
        });
        const agentData = await agentRes.json();
        if (agentData.success && agentData.asset?.imageUrl) {
          const generatedImg = agentData.asset.imageUrl;
          if (generatedContent) generatedContent.imageUrl = generatedImg;
          if (contentData) contentData.imageUrl = generatedImg;
          const composited = await compositeBrandLogoOntoImage(generatedImg, {
            brandName: brand,
            domainUrl: workspace?.domainUrl,
            logoUrl: workspace?.logoUrl,
            faviconUrl: workspace?.faviconUrl
          });
          const finalUrl = composited || generatedImg;
          setVisualUrl(finalUrl);
          const updatedPayload = compileAssetPayload(finalUrl);
          addGlobalAsset(updatedPayload);
          console.log('[PlatformPostCanvas] ✅ 2-Agent visual generation ready!');
        } else {
          throw new Error(agentData.error || '2-Agent Pipeline returned no image');
        }
      } else {
        // ── Standard visual generation for all other post types (UNCHANGED NORMAL FLOW) ────────────────
        const brandPayload = {
          workspaceId:    workspace?._id || workspace?.id,
          prompt:         visualGuidancePrompt,
          topic:          topic,
          hook:           hook,
          brand:          brand || workspace?.brandName,
          brandName:      brand || workspace?.brandName,
          brandColors:    workspace?.brandColors || [],
          industry:       workspace?.industry || workspace?.industryCategory || workspace?.niche || '',
          tagline:        workspace?.tagline || '',
          companyDescription: workspace?.companyDescription || workspace?.metaDescription || workspace?.positioningSummary || '',
          platform:       platform,
          style:          visualStyle,
          referenceImage: null, // standard path never passes reference image
          strategyPillar: generatedContent?.strategyPillar || generatedContent?.pillar || contentData?.strategyPillar || '',
          aspect:         (platform === 'linkedin' || platform === 'blog' || platform === 'newspaper' || rawType === 'BLOG' || rawType === 'NEWSPAPER') ? '16:9' : (platform === 'story' || platform === 'reel' || platform === 'tiktok') ? '9:16' : '1:1',
          creditCost:     cost,
          seed:           Math.floor(Math.random() * 1000000)
        };

        const res = await fetch(`${apiBase}/creative/visual/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(brandPayload),
        });
        const data = await res.json();
        if (data.success && data.asset?.imageUrl) {
          const generatedImg = data.asset.imageUrl;
          
          if (setGeneratedContent && generatedContent) {
            setGeneratedContent({ ...generatedContent, imageUrl: generatedImg });
          }
          
          const composited = await compositeBrandLogoOntoImage(generatedImg, {
            brandName: brand,
            domainUrl: workspace?.domainUrl,
            logoUrl: workspace?.logoUrl,
            faviconUrl: workspace?.faviconUrl
          });
          const finalUrl = composited || data.asset.imageUrl;
          setVisualUrl(finalUrl);
          
          try {
            const updatedPayload = compileAssetPayload(finalUrl);
            addGlobalAsset(updatedPayload);
          } catch (payloadErr) {
            console.warn("Payload compile error:", payloadErr);
          }
          
        } else {
          throw new Error(data.error || "API returned no image");
        }
      }
    } catch (err) {
      console.error("[Creative Studio] Image generation fallback error:", err);
      if (showToast) showToast(`Image Generation Failed: ${err.message}`, 'error');
      
      const refObj = contentData?.referenceImage || generatedContent?.referenceImage || null;
      const fallbackSvg = generateVertexAISvgDataUrl(visualGuidancePrompt, brand, visualStyle, refObj);
      const compositedFallback = await compositeBrandLogoOntoImage(fallbackSvg, {
        brandName: brand,
        domainUrl: workspace?.domainUrl,
        logoUrl: workspace?.logoUrl,
        faviconUrl: workspace?.faviconUrl
      });
      setVisualUrl(compositedFallback || fallbackSvg);
    } finally {
      setGenerating(false);
    }
  };



  const isCarousel  = rawPostType.includes("carousel");
  const isEmail     = rawType==="EMAIL"     || platform==="email";
  const isBlog      = rawType==="BLOG"      || platform==="blog"      || platform==="seo";
  const formatLabel = isCarousel?"Carousel":isEmail?"Email Template":isBlog?"SEO Blog Article":"Single Image Post";

  // ─── Auto-Save to Asset Library & Navigation ──────────────────────────────
  const autoSavedRef = useRef(new Set());

  // Function to navigate to Asset Library
  const handleViewAssetLibrary = () => {
    setActiveModule('assets');
    if (window.location.pathname !== '/asset-library') {
      window.history.pushState({ module: 'assets' }, '', '/asset-library');
    }
  };

  // Helper to compile asset payload
  const compileAssetPayload = (overrideUrl = null) => {
    let assetType = 'DOCUMENT';
    let assetName = topic || 'Brand Asset';
    let assetUrl = overrideUrl || visualUrl || defaultVisual || '';
    let assetContent = '';

    if (isBlog) {
      assetType = 'BLOG';
      assetName = generatedContent?.title || hook || topic || 'SEO Blog Article';
      assetContent = generatedContent?.content || longCap || caption || '';
    } else if (isEmail) {
      assetType = 'EMAIL';
      assetName = `Email: ${generatedContent?.subject || hook || topic}`;
      assetContent = `Subject: ${generatedContent?.subject || hook}\nPreheader: ${generatedContent?.preheader || shortCap}\n\n${generatedContent?.body || longCap || caption}`;
      assetUrl = '';
    } else if (isCarousel) {
      assetType = 'CAROUSEL';
      assetName = `Carousel Deck: ${topic || 'Brand Carousel'}`;
      assetUrl = assetUrl || 'https://picsum.photos/seed/aisa_slide_0/600/600';
      assetContent = carouselSlides.map(s => `[Slide ${s.slide}] ${s.headline}\n${s.body}`).join('\n\n');
    } else {
      // Social / Visual Post
      assetType = 'SOCIAL';
      assetName = `${platform}: ${topic || hook}`;
      assetContent = `${hook}\n\n${caption}\n\n${cta}\n${hashtags}`;
    }

    const cleanTopic = (topic || 'asset').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const cleanPlatform = (platform || 'social').toLowerCase();

    return {
      id: `asset_${cleanTopic}_${cleanPlatform}`,
      name: assetName,
      type: assetType,
      url: assetUrl,
      content: assetContent,
      date: new Date().toISOString(),
      credits: 0,
      metadata: {
        platform,
        formatLabel,
        topic,
        brand,
        autoSaved: true
      }
    };
  };

  // Auto-save useEffect removed to prevent saving placeholder images to the Asset Library.
  // Images will now only be saved explicitly upon successful generation.

  // ── A. CAROUSEL ──
  if (isCarousel) {
    const slide = carouselSlides[activeSlide]||carouselSlides[0];
    const isLast = activeSlide===carouselSlides.length-1;
    return (
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-6">
        <HeaderRow platform={platform} topic={topic} formatLabel={formatLabel} onViewAssetLibrary={handleViewAssetLibrary} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <VisualControls visualStyle={visualStyle} setVisualStyle={setVisualStyle} generating={generating} onGenerate={handleGenerateVisual} visualDirective={contentData?.visualDirective} referenceImage={contentData?.referenceImage || contentData?.imageUrl} />
            <CopySidebar hook={hook} story={story} shortCap={shortCap} longCap={longCap} cta={cta} hashtags={hashtags} />
          </div>
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap gap-2">
              {carouselSlides.map((s,i) => (
                <button key={i} onClick={() => setActiveSlide(i)} className={"px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border "+(activeSlide===i?"bg-brand-600 text-white border-brand-600 shadow-md":"bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-brand-400")}>Slide {s.slide}</button>
              ))}
            </div>
            <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-950 font-sans">
              <div className="p-3.5 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-extrabold text-[9px]">{brand.substring(0,2).toUpperCase()}</div>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{brand}</p>
                </div>
                <div className="flex gap-1.5">
                  {carouselSlides.map((_,i) => <button key={i} onClick={() => setActiveSlide(i)} className={"w-1.5 h-1.5 rounded-full transition-all "+(i===activeSlide?"bg-brand-500 scale-125":"bg-slate-300 dark:bg-slate-700")} />)}
                </div>
              </div>
              <div className="aspect-square relative bg-slate-900 overflow-hidden">
                <img src={slide.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"} alt={"Slide "+(activeSlide+1)} className="w-full h-full object-cover opacity-70" />
                


                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-[9px] font-black">{activeSlide+1} / {carouselSlides.length}</div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 space-y-2">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/50">{platform.toUpperCase()} SLIDE {slide.slide}</span>
                  <h3 className="text-xl font-black text-white leading-tight">{slide.headline}</h3>
                  <p className="text-xs text-white/75 leading-relaxed line-clamp-3">{slide.body}</p>
                  {slide.cta && <span className="inline-block mt-1 px-4 py-1.5 rounded-full bg-brand-600 text-white text-[10px] font-black uppercase tracking-wider">{slide.cta}</span>}
                </div>
              </div>
              <div className="p-4 space-y-2.5 bg-white dark:bg-slate-900">
                <div className="flex gap-4 text-slate-600 dark:text-slate-300"><Heart className="w-5 h-5 text-rose-400" /><MessageSquare className="w-5 h-5" /><Share2 className="w-5 h-5" /><Bookmark className="w-5 h-5 text-slate-400 ml-auto" /></div>
                <p className="text-xs font-black text-slate-900 dark:text-white">{slide.headline}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{slide.body}</p>
                {isLast && (<><p className="text-xs text-brand-600 dark:text-brand-400 font-bold">{cta}</p><p className="text-[10px] text-indigo-500 font-medium">{hashtags}</p></>)}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActiveSlide(Math.max(0,activeSlide-1))} disabled={activeSlide===0} className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800">Prev Slide</button>
              <button onClick={() => setActiveSlide(Math.min(carouselSlides.length-1,activeSlide+1))} disabled={activeSlide===carouselSlides.length-1} className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800">Next Slide</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // ── B. EMAIL ──
  if (isEmail) {
    const emailSubject = generatedContent?.subject   || hook;
    const emailPre     = generatedContent?.preheader || shortCap || "";
    const emailBody    = generatedContent?.body      || generatedContent?.bodyContent || longCap || caption;
    const domain       = (workspace?.domainUrl||"").replace(/https?:\/\//,"") || "brand.com";
    return (
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-6">
        <HeaderRow platform={platform} topic={topic} formatLabel={formatLabel} onViewAssetLibrary={handleViewAssetLibrary} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Email Campaign Specs</span>
              <ContentPill label="Subject Line" value={emailSubject} color="brand" />
              {emailPre && <ContentPill label="Preheader Text" value={emailPre} color="indigo" />}
              <ContentPill label="Sender Brand" value={brand} color="slate" />
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl font-sans">
              <div className="bg-slate-100 dark:bg-slate-800 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center gap-1.5 mb-2"><div className="w-3 h-3 rounded-full bg-red-400"/><div className="w-3 h-3 rounded-full bg-amber-400"/><div className="w-3 h-3 rounded-full bg-emerald-400"/></div>
                <div className="grid grid-cols-[45px_1fr] gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="font-black uppercase text-slate-400">From:</span><span className="font-semibold">{brand} &lt;noreply@{domain}&gt;</span>
                  <span className="font-black uppercase text-slate-400">To:</span><span className="font-semibold">Subscribers &amp; Audience List</span>
                  <span className="font-black uppercase text-slate-400">Sub:</span><span className="font-extrabold text-slate-900 dark:text-white">{emailSubject}</span>
                  {emailPre && <><span className="font-black uppercase text-slate-400">Pre:</span><span className="italic text-slate-500">{emailPre}</span></>}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 space-y-5">
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">{emailBody||caption}</div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 whitespace-pre-wrap">
                  <p className="font-medium">{"Warm regards,\n"+brand+" Team"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // ── C. BLOG ──
  if (isBlog) {
    const blogTitle   = contentData?.title || hook || topic;
    const blogContent = contentData?.content || contentData?.body || longCap || caption;
    const metaDesc    = contentData?.metaDescription || "";
    const wordCount   = contentData?.wordCount || (blogContent ? blogContent.split(/\s+/).length : 0);
    const kwList      = Array.isArray(contentData?.keywords) ? contentData.keywords : [];

    return (
      <div className="p-6 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-6">
        <HeaderRow platform={platform} topic={topic} formatLabel={formatLabel} onViewAssetLibrary={handleViewAssetLibrary} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <VisualControls visualStyle={visualStyle} setVisualStyle={setVisualStyle} generating={generating} onGenerate={handleGenerateVisual} visualDirective={contentData?.visualDirective} referenceImage={contentData?.referenceImage || contentData?.imageUrl} />
            
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Article Specifications</span>
              <ContentPill label="Article Title" value={blogTitle} color="brand" />
              {metaDesc && <ContentPill label="Meta Description" value={metaDesc} color="purple" />}
              {kwList.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500">Target Keywords</span>
                  <div className="flex flex-wrap gap-1">
                    {kwList.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                <div>Word Count: <span className="text-slate-900 dark:text-white font-extrabold">{wordCount || 1800}</span></div>
                <div>Read Time: <span className="text-slate-900 dark:text-white font-extrabold">{contentData?.readingTime || '5 min'}</span></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-900 font-sans">
              <div className="aspect-video relative overflow-hidden">
                <img src={visualUrl} alt={topic} className="w-full h-full object-cover" />
                


                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 to-transparent flex items-end p-6">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-400">SEO Blog Article</span>
                    <h2 className="text-white font-extrabold text-xl leading-tight">{blogTitle}</h2>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-bold">
                  <span className="font-black text-slate-700 dark:text-slate-300">{brand}</span><span>·</span>
                  <span>{new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</span><span>·</span>
                  <span className="text-purple-500">{contentData?.readingTime || '5 min read'}</span><span>·</span>
                  <span className="text-emerald-500">SEO Optimised</span>
                </div>
                {metaDesc && <p className="text-xs text-slate-500 italic border-l-4 border-purple-500 pl-3 leading-relaxed">{metaDesc}</p>}
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans space-y-2">
                  {renderFormattedArticle(blogContent)}
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`# ${blogTitle}\n\n${blogContent}`);
                      if (showToast) showToast('Blog article copied to clipboard!', 'success');
                    }}
                    className="py-2 px-4 rounded-xl btn-secondary text-xs font-bold flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Full Article
                  </button>
                  <button
                    onClick={handleViewAssetLibrary}
                    className="py-2.5 px-5 rounded-xl btn-primary font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <FolderKanban className="w-3.5 h-3.5" /> View Asset Library
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // ── E. SINGLE IMAGE VISUAL CANVAS (WITH DOWNLOAD & SHARE) ──
  const [copiedShare, setCopiedShare] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadImage = async () => {
    setDownloading(true);
    try {
      const fileName = `${brand.replace(/\s+/g, "_")}_visual_${Date.now()}.jpg`;
      await downloadImageToDevice(visualUrl, fileName, {
        brandName: brand,
        logoUrl: workspace?.logoUrl || workspace?.faviconUrl
      });
    } catch (e) {
      console.error("Download error:", e);
    } finally {
      setDownloading(false);
    }
  };

  const handleShareImage = async () => {
    const shareText = `${hook}\n\n${caption}\n\n${cta}\n${hashtags}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${brand} AI Visual`,
          text: shareText,
          url: visualUrl,
        });
      } catch {
        navigator.clipboard.writeText(`${shareText}\n\nImage: ${visualUrl}`);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n\nImage: ${visualUrl}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl accent-card glass-card border border-slate-200 dark:border-slate-800 space-y-8 shadow-sm">
      <HeaderRow 
        platform={platform} 
        topic={topic} 
        onViewAssetLibrary={handleViewAssetLibrary} 
      />

      {/* ── 1. PROMINENT HERO IMAGE SHOWCASE (TOP) ── */}
      <div className="w-full space-y-5">
        {/* Header & Visual Style Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider">AI Visual Asset Showcase</h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select value={visualStyle} onChange={(e) => setVisualStyle(e.target.value)} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <option>Glassmorphic Modern 3D</option>
              <option>Minimalist Corporate Tech</option>
              <option>Cyberpunk Neon Gradients</option>
              <option>Photorealistic B2B Studio</option>
              <option>Bold Editorial Fashion</option>
            </select>
            <button 
              onClick={handleGenerateVisual} 
              disabled={generating} 
              className="btn-primary py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-60 shadow-md hover:scale-105 transition-all cursor-pointer"
            >
              {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {generating ? "Synthesizing AI Visual..." : "Regenerate Image"}
            </button>
          </div>
        </div>

        {/* Visual Guidance Brief Banner (if coming from Custom Strategy) */}
        {(contentData?.visualDirective || contentData?.referenceImage) && (
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="space-y-1 min-w-0 flex-1">
              <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-500" /> Visual Guidance &amp; Image Layout:
              </span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed break-words">
                {contentData.visualDirective || rawImagePrompt}
              </p>
            </div>
            {(contentData.referenceImage || contentData.imageUrl) && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800/60 shrink-0">
                <img src={contentData.referenceImage || contentData.imageUrl} alt="Reference Object" className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                <div>
                  <span className="text-[9px] font-extrabold text-purple-600 dark:text-purple-300 block uppercase">Product Object</span>
                  <span className="text-[10px] text-slate-500 font-semibold">User Reference</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* High-Res Image Display */}
        <div 
          className={`relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video max-h-[520px] bg-slate-950 shadow-inner group flex items-center justify-center ${generating ? 'cursor-wait' : 'cursor-pointer'}`}
          onClick={() => { if (!generating) setShowFullImageModal(true); }}
        >
          {generating ? (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md p-6 text-center space-y-4 animate-in fade-in duration-300 select-none">
              {/* Animated Glowing Spinner */}
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
                <div className="absolute w-20 h-20 rounded-full border-2 border-purple-500/20 border-b-purple-500 animate-spin duration-700" />
                <Sparkles className="absolute w-7 h-7 text-brand-400 animate-pulse" />
              </div>

              {/* Status Indicator */}
              <div className="space-y-1.5 max-w-md">
                <h4 className="text-sm font-black text-white tracking-wide flex items-center justify-center gap-2">
                  <span>Synthesizing AI Visual</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 uppercase tracking-widest">
                    Gemini 3.1
                  </span>
                </h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Rendering photorealistic 8K commercial photoshoot visual for <strong className="text-slate-200">"{brand}"</strong>...
                </p>
              </div>

              {/* Animated Shimmer Bar */}
              <div className="w-full max-w-xs h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className="h-full bg-gradient-to-r from-brand-500 via-purple-500 to-indigo-500 rounded-full animate-pulse w-full" />
              </div>

              <span className="text-[10px] font-mono text-slate-500">
                Please wait · Generating high-fidelity visual asset
              </span>
            </div>
          ) : (
            <>
              <img src={visualUrl} alt={topic} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-extrabold text-xs z-20 pointer-events-none">
                <Eye className="w-5 h-5 text-emerald-400" />
                <span>Click to View Full Resolution Image</span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent flex flex-col sm:flex-row justify-between sm:items-end gap-2 z-10">
                <div className="space-y-0.5">
                  <p className="text-white font-extrabold text-xs sm:text-sm line-clamp-1">"{hook}"</p>
                  <p className="text-slate-300 text-[10px] font-medium">{brand} · High-Res 8K Studio Render</p>
                </div>
                <span className="text-[9px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700 self-start sm:self-auto">1080 × 1080 · HQ</span>
              </div>
            </>
          )}
        </div>

        {/* Direct Action Bar: Download, Share, Save */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="btn-primary py-3 px-4 font-black text-xs uppercase tracking-wider"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {downloading ? "Preparing..." : "Download Image"}
          </button>

          <button
            onClick={handleShareImage}
            className="btn-secondary py-3 px-4 font-black text-xs uppercase tracking-wider"
          >
            <Share2 className="w-4 h-4" />
            {copiedShare ? "Link & Copy Shared!" : "Share Image & Copy"}
          </button>

          <button
            onClick={handleViewAssetLibrary}
            className="btn-primary py-3 px-4 font-bold text-xs uppercase tracking-wider"
          >
            <FolderKanban className="w-4 h-4" />
            <span>View Asset Library</span>
          </button>
        </div>
      </div>

      {/* ── 2. STRUCTURED CONTENT & COPY SUITE (BELOW THE IMAGE) ── */}
      <div className="w-full space-y-5 pt-8 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              ✍️
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider">
                Post Content & Copy Breakdown
              </h3>
              <p className="text-[10px] text-slate-500">
                Generated high-converting copy, hashtags, and CTA synchronized with this visual.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const fullText = `HOOK:\n${hook}\n\nSTORYTELLING:\n${story}\n\nSHORT CAPTION:\n${shortCap}\n\nLONG CAPTION:\n${longCap}\n\nCTA:\n${cta}\n\nHASHTAGS:\n${hashtags}`;
              navigator.clipboard.writeText(fullText);
              if (showToast) showToast('All post content copied to clipboard!', 'success');
            }}
            className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all"
          >
            <Copy className="w-3.5 h-3.5" /> Copy All Content
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Hook */}
          {hook && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-brand-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">
                  🚀 Hook / Headline
                </span>
                <button onClick={() => navigator.clipboard.writeText(hook)} className="p-1 text-slate-400 hover:text-brand-500 transition-colors" title="Copy Hook">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-relaxed">
                {hook}
              </p>
            </div>
          )}

          {/* Card 2: Storytelling Angle */}
          {story && (
            <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-purple-500/40 transition-colors relative overflow-hidden ${isStarter ? 'opacity-80' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                  📖 Storytelling Angle
                </span>
                {!isStarter && (
                  <button onClick={() => navigator.clipboard.writeText(story)} className="p-1 text-slate-400 hover:text-purple-500 transition-colors" title="Copy Story">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className={`text-xs text-slate-700 dark:text-slate-300 font-medium italic leading-relaxed ${isStarter ? 'blur-sm select-none' : ''}`}>
                "{story}"
              </p>
              {isStarter && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/40 dark:bg-slate-900/40 backdrop-blur-[2px]">
                  <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                    <Lock className="w-3.5 h-3.5" /> PRO PLAN
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card 3: Short Caption */}
          {shortCap && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                  ✍️ Short Caption
                </span>
                <button onClick={() => navigator.clipboard.writeText(shortCap)} className="p-1 text-slate-400 hover:text-indigo-500 transition-colors" title="Copy Short Caption">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {shortCap}
              </p>
            </div>
          )}

          {/* Card 4: Long Caption */}
          {longCap && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 md:col-span-2 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  📝 Long Caption / Full Narrative
                </span>
                <button onClick={() => navigator.clipboard.writeText(longCap)} className="p-1 text-slate-400 hover:text-emerald-500 transition-colors" title="Copy Long Caption">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
                {longCap}
              </p>
            </div>
          )}

          {/* Card 5: Call To Action (CTA) */}
          {cta && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                  🎯 Call To Action (CTA)
                </span>
                <button onClick={() => navigator.clipboard.writeText(cta)} className="p-1 text-slate-400 hover:text-amber-500 transition-colors" title="Copy CTA">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
                {cta}
              </p>
            </div>
          )}

          {/* Card 6: SEO Hashtags */}
          {hashtags && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 md:col-span-2 lg:col-span-3 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                  🏷️ SEO Hashtags
                </span>
                <button onClick={() => navigator.clipboard.writeText(hashtags)} className="p-1 text-slate-400 hover:text-cyan-500 transition-colors" title="Copy Hashtags">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 leading-relaxed">
                {hashtags}
              </p>
            </div>
          )}
        </div>
      </div>

      {showFullImageModal && visualUrl && (
        <FullImageModal
          imageUrl={visualUrl}
          title={topic || hook || 'High-Res Studio Render'}
          brandName={brand}
          onClose={() => setShowFullImageModal(false)}
        />
      )}
    </div>
  );
};