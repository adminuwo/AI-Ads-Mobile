import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '../../context/WorkspaceContext';
import { accountAPI, authAPI, plansAPI } from '../../services/api';
import {
  Settings,
  Bell,
  Sparkles,
  Database,
  Shield,
  Lock,
  User,
  X,
  ChevronDown,
  Globe,
  Camera,
  Upload,
  Scale,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  Monitor,
  Check,
  HelpCircle,
  Smartphone,
  Tablet,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ShieldCheck,
  Mail,
  Volume2,
  Plus,
  MessageSquare,
  Send,
  Clock,
  Palette,
  RefreshCcw,
  Languages,
  Crown,
  CreditCard,
  Download,
  Search,
  Zap,
  FileText,
  Key,
  Building2,
  Layers,
  Sliders,
  CheckCircle2,
  Sun,
  Moon
} from 'lucide-react';

// ──────────────────────────────────────────────
// FAQ data (AI Ads focused)
// ──────────────────────────────────────────────
const faqs = [
  {
    category: 'Getting Started',
    questions: [
      { question: 'How do I create my first brand workspace?', answer: 'Navigate to Brand DNA from the sidebar, then click "Add New Brand". Use the AI Scraper to automatically pull your brand identity from your website URL.' },
      { question: 'What is Brand DNA?', answer: 'Brand DNA is your brand\'s core identity — voice tone, audience personas, competitive positioning, and visual guidelines — all ingested and remembered by the AI to generate on-brand content every time.' },
      { question: 'How do I generate content?', answer: 'Go to Content Studio, select your brand, choose a content type (Social Post, Blog, Email, etc.), and let the AI generate publish-ready copy aligned with your brand voice.' },
    ],
  },
  {
    category: 'Creative Studio',
    questions: [
      { question: 'What are Visual Credits?', answer: 'Visual Credits power AI image generation, carousel creation, and video synthesis. Each AI visual asset costs credits. You can top up anytime from the header or Settings > Billing.' },
      { question: 'Can I generate images without credits?', answer: 'Text-based content (captions, blogs, emails) is unlimited. Visual credits are only needed for AI image generation, carousels, and video assets.' },
      { question: 'How do I generate a carousel post?', answer: 'In Creative Studio, select "Carousel" as the format, paste your caption or let AI generate one, then click Generate. Each slide is automatically designed with your brand colors.' },
    ],
  },
  {
    category: 'Campaigns & Strategy',
    questions: [
      { question: 'What is the Campaign Builder?', answer: 'The Campaign Builder lets you create end-to-end marketing campaigns — define your goal, target audience, budget, and the AI will generate a complete multi-channel content calendar.' },
      { question: 'How does SEO Intelligence work?', answer: 'Enter a topic or keyword cluster, and the AI generates SEO-optimized article briefs, meta tags, structured headings, and a content calendar to dominate search rankings.' },
      { question: 'What is the Approvals Desk?', answer: 'All AI-generated content goes to the Approvals Desk where team members can review, comment, approve, or reject before publishing — maintaining brand compliance.' },
    ],
  },
  {
    category: 'Account & Billing',
    questions: [
      { question: 'How do I upgrade my plan?', answer: 'Go to Settings > Subscription & Billing and click "Upgrade Plan". Choose from Base, Professional, Agency, or Enterprise tiers.' },
      { question: 'Can I invite team members?', answer: 'Yes! Navigate to Team & RBAC from the sidebar to invite team members and assign roles (Strategist, SEO Lead, Copywriter, Compliance, Client Reviewer).' },
      { question: 'Is my data secure?', answer: 'Yes. All workspace data is encrypted at rest and in transit. Brand DNA, generated content, and user data are stored securely and never used to train third-party AI models.' },
    ],
  },
  {
    category: 'Integrations',
    questions: [
      { question: 'Which CMS platforms are supported?', answer: 'WordPress and Webflow webhook integrations are available. Shopify, HubSpot, and Notion integrations are coming soon.' },
      { question: 'Can I connect social media accounts?', answer: 'Direct social publishing is on the roadmap. Currently you can export content in optimized formats for each platform (Instagram, LinkedIn, Twitter/X, Facebook).' },
    ],
  },
];

// ──────────────────────────────────────────────
// Country Currency Options & Multi-Currency Price Architecture
// ──────────────────────────────────────────────
const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'India (INR ₹)', icon: '🇮🇳' },
  { value: 'USD', label: 'United States (USD $)', icon: '🇺🇸' },
  { value: 'EUR', label: 'Europe (EUR €)', icon: '🇪🇺' },
  { value: 'GBP', label: 'United Kingdom (GBP £)', icon: '🇬🇧' },
  { value: 'CAD', label: 'Canada (CAD CA$)', icon: '🇨🇦' },
  { value: 'AUD', label: 'Australia (AUD A$)', icon: '🇦🇺' },
  { value: 'AED', label: 'UAE (AED)', icon: '🇦🇪' },
];

const PLAN_PRICES = {
  base: {
    INR: { primary: '₹799', period: '/month', secondary: '($9.99/mo)' },
    USD: { primary: '$9.99', period: '/month', secondary: '(₹799/mo)' },
    EUR: { primary: '€8.99', period: '/month', secondary: '($9.99/mo)' },
    GBP: { primary: '£7.99', period: '/month', secondary: '($9.99/mo)' },
    CAD: { primary: 'CA$12.99', period: '/month', secondary: '($9.99/mo)' },
    AUD: { primary: 'A$14.99', period: '/month', secondary: '($9.99/mo)' },
    AED: { primary: 'AED 36.99', period: '/month', secondary: '($9.99/mo)' },
  },
  professional: {
    INR: { primary: '₹2,399', period: '/month', secondary: '($29.99/mo)' },
    USD: { primary: '$29.99', period: '/month', secondary: '(₹2,399/mo)' },
    EUR: { primary: '€26.99', period: '/month', secondary: '($29.99/mo)' },
    GBP: { primary: '£22.99', period: '/month', secondary: '($29.99/mo)' },
    CAD: { primary: 'CA$39.99', period: '/month', secondary: '($29.99/mo)' },
    AUD: { primary: 'A$44.99', period: '/month', secondary: '($29.99/mo)' },
    AED: { primary: 'AED 109.99', period: '/month', secondary: '($29.99/mo)' },
  },
  agency_pro: {
    INR: { primary: '₹6,399', period: '/month', secondary: '($79.99/mo)' },
    USD: { primary: '$79.99', period: '/month', secondary: '(₹6,399/mo)' },
    EUR: { primary: '€72.99', period: '/month', secondary: '($79.99/mo)' },
    GBP: { primary: '£62.99', period: '/month', secondary: '($79.99/mo)' },
    CAD: { primary: 'CA$109.99', period: '/month', secondary: '($79.99/mo)' },
    AUD: { primary: 'A$119.99', period: '/month', secondary: '($79.99/mo)' },
    AED: { primary: 'AED 289.99', period: '/month', secondary: '($79.99/mo)' },
  },
  enterprise: {
    INR: { primary: '₹15,999', period: '/month', secondary: '($199.99/mo)' },
    USD: { primary: '$199.99', period: '/month', secondary: '(₹15,999/mo)' },
    EUR: { primary: '€179.99', period: '/month', secondary: '($199.99/mo)' },
    GBP: { primary: '£159.99', period: '/month', secondary: '($199.99/mo)' },
    CAD: { primary: 'CA$269.99', period: '/month', secondary: '($199.99/mo)' },
    AUD: { primary: 'A$299.99', period: '/month', secondary: '($199.99/mo)' },
    AED: { primary: 'AED 729.99', period: '/month', secondary: '($199.99/mo)' },
  }
};

const getPlanPrice = (planId, currencyCode) => {
  return PLAN_PRICES[planId]?.[currencyCode] || PLAN_PRICES[planId]?.['INR'] || { primary: '₹799', period: '/month', secondary: '($9.99/mo)' };
};

// ──────────────────────────────────────────────
// Master Subscription Plans Data (50% Profit Margin Architecture)
// ──────────────────────────────────────────────
const DETAILED_PLANS = [
  {
    id: 'base',
    name: 'Starter',
    badge: 'Starter',
    subtitle: 'Core AI text generation & 150 monthly visual credits for solo creators',
    credits: '150 Visual Credits / mo',
    creditsDetail: 'Generates up to 150 high-res AI visual assets or ad creatives monthly.',
    color: 'from-blue-600 via-indigo-600 to-slate-900',
    borderColor: 'border-blue-500/30',
    features: [
      { text: '150 Monthly Visual Credits (AI Image & Ad Creative Generator)', highlighted: true },
      { text: '1,000 Text Generations / mo (Social Posts, Blogs, Emails & Ads)', highlighted: true },
      { text: '3 Brand DNA Workspaces (Website Scraper & Tone Ingestion)', highlighted: false },
      { text: '30-Day Marketing Roadmap Generator (Strategy Hub)', highlighted: false },
      { text: 'SEO Intelligence (Keyword Clusters & Content Briefs)', highlighted: false },
      { text: 'Content Studio (Social Copy, Blogs & Sales Copy Generators)', highlighted: false },
      { text: 'AISA™ Copilot AI Assistant & Drag-and-Drop Calendar', highlighted: false }
    ]
  },
  {
    id: 'professional',
    name: 'Pro / Growth',
    badge: 'Growth Tier',
    subtitle: 'Multi-brand DNA, 450 visual credits, Campaign Builder & Approvals Desk',
    credits: '450 Visual Credits / mo',
    creditsDetail: 'Generates up to 450 high-res AI visual assets or ad creatives each month.',
    color: 'from-violet-600 via-purple-600 to-indigo-900',
    borderColor: 'border-violet-500/40',
    features: [
      { text: '450 Monthly Visual Credits (Creative Studio + Aspect Controls)', highlighted: true },
      { text: '3,000 Text Generations / mo (Full Content & Copy Suite)', highlighted: true },
      { text: '10 Brand DNA Workspaces (Multi-Brand Tone & Scraping)', highlighted: false },
      { text: 'Campaign Builder (Multi-Channel Planner & Post Generator)', highlighted: true },
      { text: 'AI Website Builder (Brief Analyzer & Full-Page HTML Code)', highlighted: true },
      { text: 'Approvals Desk (Content Review Queue & Workflows)', highlighted: false },
      { text: 'Asset Library & Performance Dashboard (KPI Metrics)', highlighted: false }
    ]
  },
  {
    id: 'agency_pro',
    name: 'Agency / Scale',
    badge: 'Most Popular',
    subtitle: 'Unlimited multi-client workspaces & 1,200 visual credits',
    credits: '1,200 Visual Credits / mo',
    creditsDetail: '1,200 high-res visual credits included monthly.',
    color: 'from-amber-500 via-brand-500 to-cyan-500',
    features: [
      { text: '1,200 Monthly Visual Credits (4x Visual Variation Engine)', highlighted: true },
      { text: '8,000 Text Generations / mo (High-Volume Strategy & Copy)', highlighted: true },
      { text: 'Unlimited Multi-Client Workspaces & Brand DNA Ingestion', highlighted: true },
      { text: 'AI Web Builder + Hero Visuals (Code + 2x Hero Visual Generator)', highlighted: true },
      { text: 'Full Approvals Desk Queue & Workflow Management', highlighted: false },
      { text: 'Media Asset Library with Cloud Storage', highlighted: false }
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    badge: 'Enterprise',
    subtitle: 'High-volume generation, 3,000 visual credits & unlimited AI text generation',
    credits: '3,000 Visual Credits / mo',
    creditsDetail: '3,000 high-res visual credits per month with custom volume scaling.',
    color: 'from-emerald-600 via-teal-600 to-slate-950',
    borderColor: 'border-emerald-500/40',
    features: [
      { text: '3,000 Monthly Visual Credits (High-Volume Ad & Visual Gen)', highlighted: true },
      { text: 'UNLIMITED Text Generations (Uncapped AI Content Engine)', highlighted: true },
      { text: 'Unlimited Brand Workspaces & Priority Processing', highlighted: true },
      { text: 'AI Web Builder with Live Chat Edit (Real-Time Code Tweaking)', highlighted: true },
      { text: 'All Core Platform Modules Included (Strategy, SEO, Content, Web & Ads)', highlighted: true }
    ]
  }
];

// ──────────────────────────────────────────────
// Feature Comparison Matrix Data (Platform Capabilities Mapping)
// ──────────────────────────────────────────────
const FEATURE_COMPARISON_MATRIX = [
  {
    feature: 'Visual Image Credits',
    starter: { type: 'badge', text: '150 / mo' },
    pro: { type: 'badge', text: '450 / mo' },
    agency: { type: 'badge', text: '1,200 / mo' },
    enterprise: { type: 'badge', text: '3,000 / mo' },
  },
  {
    feature: 'Text Generation Quota',
    starter: { type: 'text', text: '1,000 / mo' },
    pro: { type: 'text', text: '3,000 / mo' },
    agency: { type: 'text', text: '8,000 / mo' },
    enterprise: { type: 'check', text: 'Unlimited' },
  },
  {
    feature: 'Brand DNA Workspaces',
    starter: { type: 'text', text: '3 Workspaces' },
    pro: { type: 'text', text: '10 Workspaces' },
    agency: { type: 'check', text: 'Unlimited' },
    enterprise: { type: 'check', text: 'Unlimited Corporate' },
  },
  {
    feature: 'Strategy Hub (30-Day Roadmap)',
    starter: { type: 'check', text: 'Included' },
    pro: { type: 'check', text: 'Included' },
    agency: { type: 'check', text: 'Included' },
    enterprise: { type: 'check', text: 'Included' },
  },
  {
    feature: 'SEO Intelligence & Briefs',
    starter: { type: 'text', text: 'Basic Briefs' },
    pro: { type: 'check', text: 'Keyword Clusters' },
    agency: { type: 'check', text: 'Advanced Briefs' },
    enterprise: { type: 'check', text: 'Full Intelligence' },
  },
  {
    feature: 'Content Studio (Social, Blog, Email, Ads)',
    starter: { type: 'check', text: 'Included' },
    pro: { type: 'check', text: 'Included' },
    agency: { type: 'check', text: 'Included' },
    enterprise: { type: 'check', text: 'Included' },
  },
  {
    feature: 'Creative Studio & Variation Engine',
    starter: { type: 'check', text: 'Standard' },
    pro: { type: 'check', text: 'Aspect Ratio Control' },
    agency: { type: 'check', text: '4x Variation Engine' },
    enterprise: { type: 'check', text: 'Priority Generation' },
  },
  {
    feature: 'AI Website Builder',
    starter: { type: 'cross' },
    pro: { type: 'check', text: 'HTML & Code Gen' },
    agency: { type: 'check', text: 'Code + Hero Visuals' },
    enterprise: { type: 'check', text: 'Code + Live Chat Edit' },
  },
  {
    feature: 'Campaign Builder & Planner',
    starter: { type: 'cross' },
    pro: { type: 'check', text: 'Included' },
    agency: { type: 'check', text: 'Included' },
    enterprise: { type: 'check', text: 'Included' },
  },
  {
    feature: 'Content Calendar & Drag-Drop',
    starter: { type: 'check', text: 'Included' },
    pro: { type: 'check', text: 'Included' },
    agency: { type: 'check', text: 'Included' },
    enterprise: { type: 'check', text: 'Included' },
  },
  {
    feature: 'Approvals Desk Queue',
    starter: { type: 'cross' },
    pro: { type: 'check', text: 'Included' },
    agency: { type: 'check', text: 'Included' },
    enterprise: { type: 'check', text: 'Full Workflow Queue' },
  },
  {
    feature: 'Asset Library & Cloud Storage',
    starter: { type: 'check', text: 'Included' },
    pro: { type: 'check', text: 'Included' },
    agency: { type: 'check', text: 'Cloud Storage' },
    enterprise: { type: 'check', text: 'Enterprise Storage' },
  },
  {
    feature: 'Analytics KPI Dashboard',
    starter: { type: 'check', text: 'Basic' },
    pro: { type: 'check', text: 'Full Performance' },
    agency: { type: 'check', text: 'Multi-Brand KPI' },
    enterprise: { type: 'check', text: 'Full Analytics' },
  },
  {
    feature: 'AISA™ Copilot AI Assistant',
    starter: { type: 'check', text: 'Included' },
    pro: { type: 'check', text: 'Included' },
    agency: { type: 'check', text: 'Included' },
    enterprise: { type: 'check', text: 'Included' },
  },
];

const TERMS_CONTENT = `
**Terms of Service**

Last Updated: January 2026

By using AI Ads Platform ("the Platform"), you agree to the following terms:

**1. Acceptance of Terms**
By accessing or using our Platform, you confirm that you are at least 18 years old and agree to be bound by these Terms.

**2. Use of AI-Generated Content**
Content generated by the Platform's AI systems is provided for your use. You are responsible for reviewing, editing, and ensuring compliance of all AI-generated content before publishing.

**3. Intellectual Property**
You retain ownership of your brand data, uploaded assets, and approved content. AI-generated outputs become your property upon generation.

**4. Prohibited Uses**
You may not use the Platform to generate misleading, defamatory, or illegal content. We reserve the right to suspend accounts in violation of these terms.

**5. Subscription & Credits**
Visual Credits are consumed upon generation and are non-refundable. Subscription fees are billed monthly or annually as selected.

**6. Limitation of Liability**
The Platform is provided "as is." We are not liable for damages resulting from AI-generated content used without review.

**7. Changes to Terms**
We may update these Terms periodically. Continued use of the Platform constitutes acceptance of updated Terms.
`;

const PRIVACY_CONTENT = `
**Privacy Policy**

Last Updated: January 2026

Your privacy is important to us. This policy explains how we collect, use, and protect your information.

**1. Information We Collect**
- Account information (email, name, role)
- Workspace and brand data you provide
- Usage analytics (anonymized)
- AI generation logs (retained for 90 days)

**2. How We Use Your Data**
- To provide and improve the Platform
- To generate personalized AI outputs aligned with your Brand DNA
- To send important account and billing notifications

**3. Data Storage & Security**
All data is encrypted using AES-256 at rest and TLS 1.3 in transit. We do not sell your personal data to third parties.

**4. AI Training Policy**
Your brand data, uploaded assets, and generated content are NEVER used to train any third-party AI models. Your competitive intelligence stays private.

**5. Data Retention**
You can export or delete your data at any time from Settings > Data Controls. Upon account deletion, all data is permanently removed within 30 days.

**6. Third-Party Services**
We use Razorpay for payment processing and cloud providers for infrastructure. These services have their own privacy policies.

**7. Contact Us**
For privacy concerns, email us at privacy@aiads-platform.com
`;

// ──────────────────────────────────────────────
// State-of-the-Art Custom Dropdown Component
// ──────────────────────────────────────────────
const CustomDropdown = ({ value, onChange, options, icon: Icon = Globe, direction = 'down' }) => {
  const { t } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOpt = options.find(o => (typeof o === 'object' ? o.value : o) === value);
  const rawLabel = typeof selectedOpt === 'object' ? selectedOpt.label : (selectedOpt || value);
  const selectedLabel = t(rawLabel, rawLabel);
  const selectedIcon = typeof selectedOpt === 'object' ? selectedOpt.icon : null;

  return (
    <div className="relative min-w-[190px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border text-xs font-extrabold transition-all shadow-sm ${
          isOpen
            ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300 ring-2 ring-brand-500/20 shadow-glow'
            : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 hover:border-brand-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/80'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          {selectedIcon ? (
            <span className="text-base flex-shrink-0">{selectedIcon}</span>
          ) : Icon ? (
            <Icon className="w-4 h-4 text-brand-500 flex-shrink-0" />
          ) : null}
          <span className="truncate">{selectedLabel}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-500' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 ${direction === 'up' ? 'bottom-full mb-1.5 animate-in fade-in slide-in-from-bottom-2' : 'top-full mt-1.5 animate-in fade-in zoom-in-95'} w-full min-w-[210px] bg-white dark:bg-[#0c101d] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 duration-150 space-y-0.5 max-h-60 overflow-y-auto`}>
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const rawLbl = typeof opt === 'object' ? opt.label : opt;
            const lbl = t(rawLbl, rawLbl);
            const icn = typeof opt === 'object' ? opt.icon : null;
            const isSelected = val === value;

            return (
              <button
                key={val}
                type="button"
                onClick={() => {
                  onChange(val);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs transition-all text-left group ${
                  isSelected
                    ? 'bg-brand-500/15 text-brand-600 dark:text-brand-300 font-extrabold border border-brand-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-300 font-bold'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {icn && <span className="text-base flex-shrink-0">{icn}</span>}
                  <span className="truncate">{lbl}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────
// Accent colors with hex codes & labels
// ──────────────────────────────────────────────
const ACCENT_COLORS = [
  { id: 'default', label: 'Indigo Spark', hex: '#6366f1', bgClass: 'bg-indigo-500' },
  { id: 'purple', label: 'Electric Violet', hex: '#a855f7', bgClass: 'bg-purple-500' },
  { id: 'blue', label: 'Ocean Cyan', hex: '#0284c7', bgClass: 'bg-cyan-500' },
  { id: 'emerald', label: 'Emerald Mint', hex: '#10b981', bgClass: 'bg-emerald-500' },
  { id: 'amber', label: 'Sunset Amber', hex: '#f59e0b', bgClass: 'bg-amber-500' },
  { id: 'rose', label: 'Neon Rose', hex: '#f43f5e', bgClass: 'bg-rose-500' },
];

// ──────────────────────────────────────────────
// Region to Available Languages mapping
// ──────────────────────────────────────────────
const REGION_LANGUAGES = {
  'India': [
    { value: 'English', label: 'English (IN)', icon: '🇮🇳' },
    { value: 'Hindi', label: 'Hindi (हिन्दी)', icon: '🇮🇳' },
    { value: 'Bengali', label: 'Bengali (বাংলা)', icon: '🇮🇳' },
    { value: 'Marathi', label: 'Marathi (मराठी)', icon: '🇮🇳' },
    { value: 'Telugu', label: 'Telugu (తెలుగు)', icon: '🇮🇳' },
    { value: 'Tamil', label: 'Tamil (தமிழ்)', icon: '🇮🇳' },
    { value: 'Gujarati', label: 'Gujarati (ગુજરાતી)', icon: '🇮🇳' },
    { value: 'Kannada', label: 'Kannada (ಕನ್ನಡ)', icon: '🇮🇳' },
    { value: 'Malayalam', label: 'Malayalam (മലയാളം)', icon: '🇮🇳' },
    { value: 'Punjabi', label: 'Punjabi (ਪੰਜਾਬੀ)', icon: '🇮🇳' },
    { value: 'Urdu', label: 'Urdu (اردو)', icon: '🇮🇳' }
  ],
  'United States': [
    { value: 'English', label: 'English (US)', icon: '🇺🇸' },
    { value: 'Spanish', label: 'Spanish (Español)', icon: '🇺🇸' }
  ],
  'United Kingdom': [
    { value: 'English', label: 'English (UK)', icon: '🇬🇧' },
    { value: 'Welsh', label: 'Welsh (Cymraeg)', icon: '🇬🇧' },
    { value: 'Gaelic', label: 'Scottish Gaelic (Gàidhlig)', icon: '🇬🇧' }
  ],
  'Europe': [
    { value: 'English', label: 'English (UK)', icon: '🇬🇧' },
    { value: 'French', label: 'French (Français)', icon: '🇫🇷' },
    { value: 'German', label: 'German (Deutsch)', icon: '🇩🇪' },
    { value: 'Spanish', label: 'Spanish (Español)', icon: '🇪🇸' },
    { value: 'Italian', label: 'Italian (Italiano)', icon: '🇮🇹' },
    { value: 'Dutch', label: 'Dutch (Nederlands)', icon: '🇳🇱' },
    { value: 'Portuguese', label: 'Portuguese (Português)', icon: '🇵🇹' },
    { value: 'Polish', label: 'Polish (Polski)', icon: '🇵🇱' },
    { value: 'Swedish', label: 'Swedish (Svenska)', icon: '🇸🇪' },
    { value: 'Russian', label: 'Russian (Русский)', icon: '🇷🇺' }
  ],
  'Asia-Pacific': [
    { value: 'English', label: 'English (Global)', icon: '🌐' },
    { value: 'Japanese', label: 'Japanese (日本語)', icon: '🇯🇵' },
    { value: 'Chinese', label: 'Chinese (中文)', icon: '🇨🇳' },
    { value: 'Korean', label: 'Korean (한국어)', icon: '🇰🇷' },
    { value: 'Indonesian', label: 'Indonesian (Bahasa Indonesia)', icon: '🇮🇩' },
    { value: 'Vietnamese', label: 'Vietnamese (Tiếng Việt)', icon: '🇻🇳' },
    { value: 'Thai', label: 'Thai (ไทย)', icon: '🇹🇭' },
    { value: 'Filipino', label: 'Filipino (Tagalog)', icon: '🇵🇭' }
  ],
  'Latin America': [
    { value: 'Spanish', label: 'Spanish (Español LATAM)', icon: '🇲🇽' },
    { value: 'Portuguese', label: 'Portuguese (Português Brasil)', icon: '🇧🇷' },
    { value: 'English', label: 'English', icon: '🇺🇸' }
  ],
  'Middle East & Africa': [
    { value: 'Arabic', label: 'Arabic (العربية)', icon: '🇦🇪' },
    { value: 'Hebrew', label: 'Hebrew (עברית)', icon: '🇮🇱' },
    { value: 'Persian', label: 'Persian (فارسی)', icon: '🇮🇷' },
    { value: 'Turkish', label: 'Turkish (Türkçe)', icon: '🇹🇷' },
    { value: 'French', label: 'French (Français)', icon: '🇫🇷' },
    { value: 'Swahili', label: 'Swahili (Kiswahili)', icon: '🇰🇪' },
    { value: 'English', label: 'English', icon: '🌍' }
  ],
  'Global': [
    { value: 'English', label: 'English (US)', icon: '🇺🇸' },
    { value: 'Hindi', label: 'Hindi (हिन्दी)', icon: '🇮🇳' },
    { value: 'Spanish', label: 'Spanish (Español)', icon: '🇪🇸' },
    { value: 'French', label: 'French (Français)', icon: '🇫🇷' },
    { value: 'German', label: 'German (Deutsch)', icon: '🇩🇪' },
    { value: 'Arabic', label: 'Arabic (العربية)', icon: '🇦🇪' },
    { value: 'Chinese', label: 'Chinese (中文)', icon: '🇨🇳' },
    { value: 'Japanese', label: 'Japanese (日本語)', icon: '🇯🇵' },
    { value: 'Portuguese', label: 'Portuguese (Português)', icon: '🇧🇷' },
    { value: 'Russian', label: 'Russian (Русский)', icon: '🇷🇺' }
  ]
};

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────
export const SettingsModal = () => {
  const { isSettingsModalOpen, setIsSettingsModalOpen, activeSettingsTab, setActiveSettingsTab, appearance, setAppearance, accentColor, setAccentColor, region, setRegion, language, setLanguage, multiScheduleReminder, setMultiScheduleReminder, notificationPreferences, setNotificationPreferences, dataControlPreferences, setDataControlPreferences, userAvatar, setUserAvatar, user, setUser, logout, showCustomAlert, credits, setIsCreditModalOpen, notifications, setNotifications, activeWorkspace, activeRole, setActiveModule, t } = useWorkspace();

  const fileInputRef = useRef(null);

  // Mobile view state & search filter state
  const [view, setView] = useState('sidebar');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanDetail, setSelectedPlanDetail] = useState(null);
  const [planToast, setPlanToast] = useState(null);
  const [billingSubTab, setBillingSubTab] = useState('current');

  // Dynamic Language filtering per Region
  const availableLanguages = REGION_LANGUAGES[region] || REGION_LANGUAGES['India'] || REGION_LANGUAGES['Global'];

  const handleRegionSelect = (newRegion) => {
    setRegion(newRegion);
    const validLanguages = REGION_LANGUAGES[newRegion] || REGION_LANGUAGES['India'] || REGION_LANGUAGES['Global'];
    const exists = validLanguages.some(l => l.value === language);
    if (!exists && validLanguages.length > 0) {
      setLanguage(validLanguages[0].value);
    }
  };

  // Country Currency State & Auto-Detection Sync
  const [activeCurrency, setActiveCurrencyState] = useState(() => {
    try {
      const saved = localStorage.getItem('aisa_billing_currency');
      if (saved) return saved;
    } catch (e) {}
    if (region === 'India') return 'INR';
    if (region === 'United States') return 'USD';
    if (region === 'United Kingdom') return 'GBP';
    if (region === 'Europe') return 'EUR';
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('India')) return 'INR';
      if (tz.includes('London')) return 'GBP';
      if (tz.includes('Paris') || tz.includes('Berlin') || tz.includes('Rome') || tz.includes('Madrid')) return 'EUR';
      if (tz.includes('Toronto') || tz.includes('Vancouver')) return 'CAD';
      if (tz.includes('Sydney') || tz.includes('Melbourne')) return 'AUD';
      if (tz.includes('Dubai')) return 'AED';
    } catch (e) {}
    return 'INR';
  });

  const setActiveCurrency = (cur) => {
    setActiveCurrencyState(cur);
    try {
      localStorage.setItem('aisa_billing_currency', cur);
    } catch (e) {}
  };

  useEffect(() => {
    if (region === 'India') setActiveCurrencyState('INR');
    else if (region === 'United States') setActiveCurrencyState('USD');
    else if (region === 'United Kingdom') setActiveCurrencyState('GBP');
    else if (region === 'Europe') setActiveCurrencyState('EUR');
    else if (region === 'Global') setActiveCurrencyState('USD');
  }, [region]);

  const [isUpgradingPlan, setIsUpgradingPlan] = useState(false);

  const handleUpgradePlan = async (planObj) => {
    setIsUpgradingPlan(true);
    try {
      await plansAPI.subscribe({
        workspaceId: activeWorkspace?._id || activeWorkspace?.id,
        planId: planObj.id,
        userEmail: user?.email
      });

      setUser(prev => {
        const updated = { ...prev, plan: planObj.id, subscriptionTier: planObj.name };
        try { localStorage.setItem('aisa_user', JSON.stringify(updated)); } catch(e){}
        return updated;
      });

      setPlanToast(`🎉 Upgraded to ${planObj.name} plan! Database & quotas updated.`);
      setBillingSubTab('current');
    } catch (err) {
      console.warn('Plan upgrade API note:', err.message);
      setUser(prev => {
        const updated = { ...prev, plan: planObj.id, subscriptionTier: planObj.name };
        try { localStorage.setItem('aisa_user', JSON.stringify(updated)); } catch(e){}
        return updated;
      });
      setPlanToast(`🎉 Upgraded to ${planObj.name} plan! Workspace updated.`);
      setBillingSubTab('current');
    } finally {
      setIsUpgradingPlan(false);
    }
  };

  // Profile Photo & Name states
  const [nicknameInput, setNicknameInput] = useState('');
  useEffect(() => {
    setNicknameInput(user?.name || user?.fullName || (user?.email ? user.email.split('@')[0] : ''));
  }, [user]);

  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isNameSaved, setIsNameSaved] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    setShowPhotoMenu(false);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      showCustomAlert({ title: 'Camera Access Error', message: 'Unable to access camera. Please verify camera permissions in your browser.', type: 'error' });
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setUserAvatar(dataUrl);
      stopCamera();
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showCustomAlert({ title: 'File Too Large', message: 'File size exceeds 10MB limit. Please choose a smaller image.', type: 'warning' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        setUserAvatar(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveName = () => {
    if (!nicknameInput.trim()) return;
    const newName = nicknameInput.trim();
    try {
      localStorage.setItem('aisa_user_name', newName);
    } catch(e){}
    setUser(prev => {
      const updated = prev ? { ...prev, name: newName, fullName: newName } : { name: newName, fullName: newName };
      try { localStorage.setItem('aisa_user', JSON.stringify(updated)); } catch(e){}
      if (updated.email) {
        authAPI.updateProfile({ email: updated.email, name: newName }).catch(err => console.warn('Failed to sync name to DB:', err));
      }
      return updated;
    });
    setIsNameSaved(true);
    setTimeout(() => setIsNameSaved(false), 2500);
  };

  // Password reset modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showSettingsPassword, setShowSettingsPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState('confirm');
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteOtpLoading, setDeleteOtpLoading] = useState(false);
  const [deleteCooldown, setDeleteCooldown] = useState(0);
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let timer;
    if (deleteCooldown > 0) {
      timer = setTimeout(() => setDeleteCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [deleteCooldown]);

  // FAQ states
  const [selectedFaqCategory, setSelectedFaqCategory] = useState(0);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [faqSubTab, setFaqSubTab] = useState('faq');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Support ticket
  const [issueType, setIssueType] = useState('General Inquiry');
  const [isIssueDropdownOpen, setIsIssueDropdownOpen] = useState(false);
  const [issueText, setIssueText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);

  // Sessions stub
  const [sessions, setSessions] = useState([
    { _id: 'sess_current', isCurrent: true, device: 'Desktop', os: 'Windows 11', browser: 'Chrome 122.0', ip: '192.168.1.104', lastActive: new Date().toISOString() },
  ]);

  // Chat sessions stub
  const [chatSessions, setChatSessions] = useState([
    { sessionId: 'chat_001', title: 'Q4 Brand Strategy & Content Angles', lastModified: new Date(Date.now() - 86400000).toISOString() },
    { sessionId: 'chat_002', title: 'Instagram High-Conversion Hooks', lastModified: new Date(Date.now() - 2 * 86400000).toISOString() },
    { sessionId: 'chat_003', title: 'SEO Brief & Keyword Cluster Generator', lastModified: new Date(Date.now() - 3 * 86400000).toISOString() },
  ]);
  const [expandedDate, setExpandedDate] = useState(null);

  const getUserName = (u) => {
    if (!u) return 'Agency Strategist';
    if (u.name) return u.name;
    if (u.email) {
      const prefix = u.email.split('@')[0];
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return 'Agency Strategist';
  };

  // ── Categorized Nav Groups ──────────────────────────────
  const navSections = [
    {
      title: t('platformPreferences', 'PLATFORM PREFERENCES'),
      items: [
        { id: 'personalization', label: t('appearanceStyle', 'Appearance & Style'), icon: Sparkles, color: 'from-violet-500 to-purple-600', badge: t('popular', 'Popular') },
        { id: 'notifications', label: t('alertsDigest', 'Alerts & Digest'), icon: Bell, color: 'from-blue-500 to-cyan-600' },
        { id: 'data', label: t('dataControlsBackup', 'Data Controls & Backup'), icon: Database, color: 'from-emerald-500 to-teal-600' },
      ]
    },
    {
      title: t('accountSecurity', 'ACCOUNT & SECURITY'),
      items: [
        { id: 'account', label: t('profileSessions', 'Profile & Sessions'), icon: User, color: 'from-amber-500 to-orange-600' },
      ]
    },
    {
      title: t('monetizationApi', 'MONETIZATION & API'),
      items: [
        { id: 'billing', label: t('billingVisualCredits', 'Billing & Visual Credits'), icon: CreditCard, color: 'from-pink-500 to-rose-600', badge: `${credits?.balance || 0} Credits` },
      ]
    },
    {
      title: t('helpResources', 'HELP & RESOURCES'),
      items: [
        { id: 'help', label: t('helpCenterFaq', 'Help Center & FAQ'), icon: HelpCircle, color: 'from-cyan-500 to-blue-600' },
        { id: 'feedback', label: t('sendProductFeedback', 'Send Product Feedback'), icon: MessageSquare, color: 'from-indigo-500 to-violet-600' },
        { id: 'terms', label: t('termsOfService', 'Terms of Service'), icon: FileText, color: 'from-slate-400 to-slate-600' },
        { id: 'privacy', label: t('privacyPolicy', 'Privacy Policy'), icon: Shield, color: 'from-emerald-400 to-emerald-600' },
      ]
    }
  ];

  const activeTab = activeSettingsTab;
  const setActiveTab = setActiveSettingsTab;

  const renderSettingRow = (label, description, control) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/60 transition-all hover:border-brand-500/30 gap-4">
      <div className="flex flex-col gap-1 pr-4 flex-1">
        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">{label}</span>
        {description && (
          <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{description}</span>
        )}
      </div>
      <div className="w-full sm:w-auto shrink-0">{control}</div>
    </div>
  );

  const renderToggle = (value, onToggle) => (
    <button
      type="button"
      onClick={() => onToggle(!value)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none active:scale-95 ${
        value
          ? 'bg-gradient-to-r from-brand-600 to-indigo-600 shadow-md shadow-brand-500/20'
          : 'bg-slate-300 dark:bg-slate-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          value ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  // Search matching
  const allSettings = useMemo(() => [
    { id: 'appearance', tab: 'personalization', label: 'Appearance Theme', keywords: 'dark light theme mode system' },
    { id: 'accent', tab: 'personalization', label: 'Accent Color Scheme', keywords: 'color design brand identity' },
    { id: 'region', tab: 'personalization', label: 'Target Region', keywords: 'country location india us uk' },
    { id: 'language', tab: 'personalization', label: 'Dashboard Language', keywords: 'english hindi spanish translation' },
    { id: 'reminder', tab: 'personalization', label: 'Multi Schedule Reminder', keywords: 'alarm scheduler calendar' },
    { id: 'emailDigest', tab: 'notifications', label: 'Weekly Email Digest', keywords: 'email notification weekly' },
    { id: 'desktopPush', tab: 'notifications', label: 'Desktop Push Alerts', keywords: 'push notification alerts' },
    { id: 'soundEffects', tab: 'notifications', label: 'Sound Effects Chime', keywords: 'audio sound chime' },
    { id: 'chatHistory', tab: 'data', label: 'Save AI Chat History', keywords: 'chat history save toggle' },
    { id: 'export', tab: 'data', label: 'Export Workspace JSON', keywords: 'export download json' },
    { id: 'nickname', tab: 'account', label: 'Display Name', keywords: 'name profile nickname' },
    { id: 'password', tab: 'account', label: 'Change Password Security', keywords: 'password security' },
    { id: 'sessions', tab: 'account', label: 'Active Login Sessions', keywords: 'sessions login devices' },
    { id: 'billing', tab: 'billing', label: 'Subscription Plan & Credits', keywords: 'plan billing credits tier' },
  ], []);

  const handleSupportSubmit = async () => {
    if (!issueText.trim()) return;
    setIsSending(true);
    setSendStatus(null);
    try {
      await accountAPI.sendFeedback({
        email: user?.email || localStorage.getItem('aisa_user_email') || 'user@aiads.io',
        name: user?.name || getUserName(user),
        feedback: issueText.trim(),
        category: issueType || 'Product Feedback'
      });
      setSendStatus('success');
      setIssueText('');
      setTimeout(() => setSendStatus(null), 5000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSendStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendOtp = async () => {
    setResetLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setResetStep(2);
    setResetLoading(false);
  };

  const handleResetPassword = async () => {
    if (!resetOtp || !newPassword) return;
    setResetLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setShowResetModal(false);
    setResetStep(1);
    setResetOtp('');
    setNewPassword('');
    setResetLoading(false);
  };

  const handleInitiateDelete = async () => {
    setDeleteOtpLoading(true);
    setDeleteError('');
    try {
      const res = await accountAPI.sendDeleteOTP({ email: user?.email });
      if (res && res.success) {
        setDeleteStep('otp');
        setDeleteCooldown(60);
      } else {
        setDeleteError(res?.error || 'Failed to send security code. Please try again.');
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to send security code to your email.');
    } finally {
      setDeleteOtpLoading(false);
    }
  };

  const handleVerifyDeleteOtp = async () => {
    if (!deleteOtp || deleteOtp.trim().length !== 6) {
      setDeleteError('Please enter a valid 6-digit code.');
      return;
    }
    setDeleteOtpLoading(true);
    setDeleteError('');
    try {
      const res = await accountAPI.verifyDeleteOTP({ email: user?.email, otp: deleteOtp.trim() });
      if (res && res.success) {
        setDeleteStep('verified');
      } else {
        setDeleteError(res?.error || 'Invalid 6-digit security code.');
      }
    } catch (err) {
      setDeleteError(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setDeleteOtpLoading(false);
    }
  };

  const handleResendDeleteOtp = async () => {
    if (deleteCooldown > 0) return;
    setDeleteOtpLoading(true);
    setDeleteError('');
    try {
      const res = await accountAPI.sendDeleteOTP({ email: user?.email });
      if (res && res.success) {
        setDeleteCooldown(60);
      } else {
        setDeleteError(res?.error || 'Failed to resend security code.');
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to resend security code.');
    } finally {
      setDeleteOtpLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteStep !== 'verified') return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res = await accountAPI.deleteAccount({ email: user?.email });
      if (res && res.success) {
        setShowDeleteModal(false);
        setDeleteStep('confirm');
        setDeleteOtp('');
        localStorage.removeItem('aisa_token');
        localStorage.removeItem('aisa_user_email');
        setIsSettingsModalOpen(false);
        logout();
      } else {
        setDeleteError(res?.error || 'Failed to delete account.');
      }
    } catch (err) {
      setDeleteError(err.message || 'An error occurred while deleting account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const groupedSessions = useMemo(() => {
    const groups = {};
    chatSessions.forEach(session => {
      const d = new Date(session.lastModified);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(session);
    });
    return groups;
  }, [chatSessions]);

  const triggerExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      user: user?.email,
      appearance,
      accentColor,
      region,
      language,
      activeWorkspace: activeWorkspace?.brandName,
      exportedAt: new Date().toISOString(),
    }, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `aiads_workspace_export_${Date.now()}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // ── Render Content per Tab ──
  const renderContent = () => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const results = allSettings.filter(item =>
        item.label.toLowerCase().includes(query) || item.keywords.toLowerCase().includes(query)
      );
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Search Results</h3>
            <span className="text-xs font-bold text-brand-500">{results.length} found</span>
          </div>
          {results.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {results.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.tab); setSearchQuery(''); setView('detail'); }}
                  className="w-full text-left bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 hover:border-brand-500/50 hover:bg-brand-500/5 transition-all group flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-500 transition-colors">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5 capitalize">Tab: {item.tab}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center opacity-60">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/60 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No settings found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      );
    }

    switch (activeTab) {
      // ── APPEARANCE & STYLE ─────────────────────────
      case 'personalization':
        return (
          <div className="space-y-6">
            {/* Visual Theme Selector */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 block">{t('themeMode', 'Theme Mode')}</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'dark', label: t('darkMode', 'Dark Mode'), icon: Moon, desc: t('darkDesc', 'High contrast dark theme'), previewBg: 'bg-[#090d16] border-slate-800' },
                  { id: 'light', label: t('lightMode', 'Light Mode'), icon: Sun, desc: t('lightDesc', 'Clean white background'), previewBg: 'bg-white border-slate-200' },
                  { id: 'system', label: t('systemMode', 'System'), icon: Monitor, desc: t('systemDesc', 'Auto sync with OS'), previewBg: 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setAppearance(item.id)}
                    className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-32 ${
                      appearance === item.id
                        ? 'border-brand-500 bg-brand-500/10 shadow-glow ring-2 ring-brand-500/20'
                        : 'border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-xl ${appearance === item.id ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      {appearance === item.id && (
                        <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">{item.label}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color Scheme */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 block">{t('accentColorTheme', 'Accent Color Theme')}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ACCENT_COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setAccentColor(c.id)}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                      accentColor === c.id
                        ? 'border-brand-500 bg-brand-500/10 shadow-sm ring-1 ring-brand-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full shadow-sm border border-white/20" style={{ backgroundColor: c.hex }} />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t(c.label)}</span>
                    </div>
                    {accentColor === c.id && <Check className="w-4 h-4 text-brand-500" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Region & Language Selectors */}
            {renderSettingRow(
              t('targetRegion', 'Target Region'),
              t('targetRegionDesc', 'Adjust target market standards and audience metrics.'),
              <CustomDropdown
                value={region}
                onChange={handleRegionSelect}
                icon={Globe}
                options={[
                  { value: 'India', label: 'India', icon: '🇮🇳' },
                  { value: 'United States', label: 'United States', icon: '🇺🇸' },
                  { value: 'United Kingdom', label: 'United Kingdom', icon: '🇬🇧' },
                  { value: 'Europe', label: 'Europe', icon: '🇪🇺' },
                  { value: 'Asia-Pacific', label: 'Asia-Pacific', icon: '🌏' },
                  { value: 'Latin America', label: 'Latin America', icon: '🌎' },
                  { value: 'Middle East & Africa', label: 'Middle East & Africa', icon: '🌍' },
                  { value: 'Global', label: 'Global', icon: '🌐' }
                ]}
              />
            )}

            {renderSettingRow(
              t('dashboardLanguage', 'Dashboard Language'),
              t('languageDesc', 'Interface and prompt default language.'),
              <CustomDropdown
                value={language}
                onChange={val => setLanguage(val)}
                icon={Languages}
                direction="up"
                options={availableLanguages}
              />
            )}

            {renderSettingRow(
              t('multiScheduleReminder', 'Multi Schedule Reminder'),
              t('reminderDesc', 'Automated post publishing alarms and push notifications.'),
              <CustomDropdown
                value={multiScheduleReminder}
                onChange={val => setMultiScheduleReminder(val)}
                icon={Clock}
                direction="up"
                options={[
                  { value: 'Enabled', label: 'Enabled (Active PWA Alerts)', icon: '⚡' },
                  { value: 'Disabled', label: 'Disabled (Muted)', icon: '🔕' },
                  { value: 'Priority Only', label: 'Priority Alerts Only', icon: '🎯' }
                ]}
              />
            )}
          </div>
        );

      // ── ALERTS & DIGEST ────────────────────────────
      case 'notifications':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{t('systemEventAlerts', 'System & Event Alerts')}</h3>
            </div>
            <div className="space-y-3">
              {[
                { key: 'emailDigest', label: t('weeklyPerformanceDigest', 'Weekly Performance Digest'), desc: t('weeklyDigestDesc', 'Receive detailed weekly updates on brand analytics, lead scores, and SEO progress.'), icon: Mail },
                { key: 'desktopPush', label: t('realTimeDesktopPush', 'Real-Time Desktop Push'), desc: t('desktopPushDesc', 'Get immediate browser notifications when AI generation completes or a post is approved.'), icon: Bell },
                { key: 'soundEffects', label: t('audioChimeAlerts', 'Audio Chime Alerts'), desc: t('soundEffectsDesc', 'Play subtle audio confirmation when AI tasks or image generations finish.'), icon: Volume2 },
                { key: 'productUpdates', label: t('featureReleaseAnnouncements', 'Feature Release Announcements'), desc: t('productUpdatesDesc', 'Be the first to hear about new AI models, templates, and integration updates.'), icon: Sparkles },
              ].map(({ key, label, desc, icon: Icon }) => (
                <div key={key} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex items-start justify-between gap-4 hover:border-brand-500/30 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0 mt-0.5 border border-brand-500/20">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{label}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">{desc}</p>
                    </div>
                  </div>
                  {renderToggle(notificationPreferences[key], val => setNotificationPreferences({ ...notificationPreferences, [key]: val }))}
                </div>
              ))}
            </div>

            {/* Notifications log */}
            {notifications && notifications.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('recentActivityLog', 'Recent Activity Log')} ({notifications.length})</h4>
                  <button onClick={() => setNotifications && setNotifications([])} className="text-xs font-bold text-brand-500 hover:underline">{t('clear', 'Clear')}</button>
                </div>
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div key={n.id} className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{n.text}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      // ── DATA CONTROLS ──────────────────────────────
      case 'data':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              {renderSettingRow(
                t('saveAiChatContext', 'Save AI Chat Context'),
                t('persistSessionMemoryDesc', 'Persist session memory for multi-channel campaign generation.'),
                renderToggle(dataControlPreferences.saveChatHistory, val =>
                  setDataControlPreferences({ ...dataControlPreferences, saveChatHistory: val })
                )
              )}
              {renderSettingRow(
                t('shareWorkspaceLinks', 'Share Workspace Links'),
                t('allowTeamPreviewDesc', 'Allow team members with the link to preview draft assets.'),
                renderToggle(dataControlPreferences.shareWorkspaceLinks, val =>
                  setDataControlPreferences({ ...dataControlPreferences, shareWorkspaceLinks: val })
                )
              )}
              {renderSettingRow(
                t('anonymizedTelemetry', 'Anonymized Usage Telemetry'),
                t('telemetryDesc', 'Help improve AI generation quality by sharing diagnostic logs.'),
                renderToggle(dataControlPreferences.allowAnalytics, val =>
                  setDataControlPreferences({ ...dataControlPreferences, allowAnalytics: val })
                )
              )}
            </div>

            {/* Export Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-500/10 via-brand-500/5 to-transparent border border-brand-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('exportWorkspaceBackup', 'Export Workspace Backup')}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('exportBackupDesc', 'Download settings, active brands, and logs as JSON format.')}</p>
              </div>
              <button
                onClick={triggerExportData}
                className="btn-secondary text-xs px-4 py-2.5 flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-brand-500" />
                {t('exportData', 'Export Data')}
              </button>
            </div>

            {/* Saved Chat Sessions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{t('savedChatHistory', 'Saved Chat History')}</h4>
                {chatSessions.length > 0 && (
                  <button onClick={() => setChatSessions([])} className="text-xs font-bold text-red-500 hover:underline">{t('deleteAll', 'Delete All')}</button>
                )}
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {chatSessions.map(s => (
                  <div key={s.sessionId} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{s.title}</span>
                    <button
                      onClick={() => setChatSessions(prev => prev.filter(x => x.sessionId !== s.sessionId))}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors ml-2 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      // ── PROFILE & SESSIONS ─────────────────────────
      case 'account':
        return (
          <div className="space-y-6">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* User Hero Banner */}
            <div className="relative rounded-3xl bg-gradient-to-r from-brand-600/20 via-purple-600/10 to-transparent border border-brand-500/30 p-6 z-20">
              <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                <div className="relative shrink-0">
                  <div
                    className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-800 border-2 border-brand-500/40 shadow-xl overflow-hidden flex items-center justify-center text-brand-500 font-black text-2xl cursor-pointer group relative"
                    onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                  >
                    {userAvatar ? (
                      <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      getUserName(user).charAt(0).toUpperCase()
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Camera / Upload Badge Icon Overlay */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPhotoMenu(!showPhotoMenu);
                    }}
                    title="Change Profile Photo (Upload or Camera)"
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 transition-transform hover:scale-110"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>

                  {/* Photo Action Popup Menu */}
                  {showPhotoMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowPhotoMenu(false)} />
                      <div className="absolute left-0 top-full mt-2.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                        <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                          <span>Profile Photo Options</span>
                          <button onClick={() => setShowPhotoMenu(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPhotoMenu(false);
                            fileInputRef.current?.click();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-brand-500/10 hover:text-brand-500 transition-all text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors">
                            <Upload className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block font-bold">Upload from Device</span>
                            <span className="text-[10px] text-slate-400 font-normal">Choose PNG, JPG, or WebP</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-brand-500/10 hover:text-brand-500 transition-all text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                            <Camera className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block font-bold">Take Photo with Camera</span>
                            <span className="text-[10px] text-slate-400 font-normal">Snap live webcam picture</span>
                          </div>
                        </button>
                        {userAvatar && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowPhotoMenu(false);
                              setUserAvatar(null);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-all text-left border-t border-slate-100 dark:border-slate-800/80 mt-1"
                          >
                            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                              <Trash2 className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="block font-bold">Remove Photo</span>
                              <span className="text-[10px] text-rose-400 font-normal">Reset avatar to initials</span>
                            </div>
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{getUserName(user)}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30 uppercase">
                      {activeRole}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{user?.email}</p>
                  <p className="text-[11px] text-slate-400">{t('activeWorkspace', 'Active Workspace:')} <strong className="text-slate-700 dark:text-slate-200">{activeWorkspace?.brandName || 'Default Agency Workspace'}</strong></p>
                </div>
              </div>
            </div>

            {/* Display Name Edit */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('fullName', 'FULL NAME')}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nicknameInput}
                  onChange={e => setNicknameInput(e.target.value)}
                  placeholder={t('enterFullDisplayName', 'Enter full display name')}
                  className="glass-input text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className={`text-xs px-5 py-2 font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 ${
                    isNameSaved
                      ? 'bg-emerald-500 text-white'
                      : 'btn-save'
                  }`}
                >
                  {isNameSaved ? <Check className="w-4 h-4" /> : null}
                  {isNameSaved ? t('saved', 'Saved!') : t('save', 'Save')}
                </button>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{t('activeLoginSessions', 'ACTIVE LOGIN SESSIONS')}</h4>
              {sessions.map(s => (
                <div key={s._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-brand-500" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{s.os} • {s.browser}</span>
                      <span className="text-[10px] text-slate-400">IP: {s.ip} • {t('activeNow', 'Active Now')}</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">{t('currentDevice', 'Current Device')}</span>
                </div>
              ))}
            </div>

            {/* Security Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">{t('accountPassword', 'Account Password')}</p>
                <p className="text-xs text-slate-400">{t('updateLoginSecurityCredentials', 'Update your login security credentials.')}</p>
              </div>
              <button onClick={() => setShowResetModal(true)} className="btn-secondary text-xs px-4 py-2">
                {t('changePassword', 'Change Password')}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-bold text-sm text-red-500">{t('dangerZone', 'Danger Zone')}</p>
                <p className="text-xs text-slate-400">{t('permanentlyDeleteAccountData', 'Permanently delete your account and brand data.')}</p>
              </div>
              <button onClick={() => setShowDeleteModal(true)} className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold hover:bg-red-500 hover:text-white transition-all">
                {t('deleteAccount', 'Delete Account')}
              </button>
            </div>
          </div>
        );

      // ── BILLING & CREDITS ──────────────────────────
      case 'billing': {
        const userPlanNorm = (user?.plan || 'agency_pro').toLowerCase().replace(/\s+/g, '_');
        const activePlanObj = DETAILED_PLANS.find(p => 
          userPlanNorm === p.id.toLowerCase() || 
          (userPlanNorm.includes('agency') && p.id === 'agency_pro') || 
          (userPlanNorm.includes('base') && p.id === 'base') || 
          (userPlanNorm.includes('prof') && p.id === 'professional') || 
          (userPlanNorm.includes('enterp') && p.id === 'enterprise')
        ) || DETAILED_PLANS[2];

        return (
          <div className="space-y-6">
            {/* Top Navigation Sub-Header for Billing */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-brand-500" />
                  {billingSubTab === 'current' ? 'Your Current Active Plan' : 'All 4 Subscription Plans'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {billingSubTab === 'current'
                    ? 'Review active quotas, capabilities and manage tier upgrades.'
                    : 'Compare features across all subscription tiers and select the right plan.'}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Country Currency Selector */}
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase text-slate-400">Currency:</span>
                  <CustomDropdown
                    value={activeCurrency}
                    onChange={val => setActiveCurrency(val)}
                    icon={Globe}
                    options={CURRENCY_OPTIONS}
                  />
                </div>

                {billingSubTab === 'all_plans' && (
                  <button
                    onClick={() => setBillingSubTab('current')}
                    className="px-4 py-2 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 text-brand-600 dark:text-brand-400 border border-brand-500/30 text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back to Current Plan
                  </button>
                )}
              </div>
            </div>

            {/* Success Toast Notification */}
            {planToast && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{planToast}</span>
                </div>
                <button onClick={() => setPlanToast(null)} className="text-emerald-500 hover:text-emerald-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* VIEW 1: CURRENT ACTIVE PLAN POPUP CARD OVERVIEW */}
            {billingSubTab === 'current' ? (
              <div className="space-y-6 animate-in fade-in">
                {/* Active Plan Popup Card */}
                {(() => {
                  const activePrice = getPlanPrice(activePlanObj.id, activeCurrency);
                  return (
                    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0c111d] to-slate-950 border border-brand-500/50 shadow-2xl relative overflow-hidden space-y-6">
                      {/* Decorative Brand Accent Background Glow */}
                      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />
                      
                      {/* Top Bar: Badge & Price */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/40 shadow-xs">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              Current Active Plan
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                              {activePlanObj.badge}
                            </span>
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2.5 flex items-center gap-3">
                            {activePlanObj.name}
                          </h2>
                          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 leading-relaxed max-w-xl">
                            {activePlanObj.subtitle}
                          </p>
                        </div>

                        <div className="text-left sm:text-right shrink-0 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 backdrop-blur-md">
                          <div className="text-2xl sm:text-3xl font-black text-brand-400">{activePrice.primary}</div>
                          <div className="text-xs text-slate-400 font-bold mt-0.5">
                            {activePrice.period} <span className="opacity-75">{activePrice.secondary}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quotas & Credit Summary */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Visual Credits Balance</div>
                            <div className="text-lg font-black text-brand-400 mt-0.5">{credits?.balance || 120} Available</div>
                          </div>
                          <Sparkles className="w-6 h-6 text-brand-500" />
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Monthly Allocation</div>
                            <div className="text-lg font-black text-white mt-0.5">{activePlanObj.credits}</div>
                          </div>
                          <CreditCard className="w-6 h-6 text-cyan-400" />
                        </div>
                      </div>

                      {/* Included Active Features List */}
                      <div className="space-y-3 relative z-10 pt-2 border-t border-slate-800">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Included in your {activePlanObj.name}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {activePlanObj.features.map((f, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 font-medium">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{f.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Primary Accent-Themed UPGRADE PLAN Action Button */}
                      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                        <div className="text-xs text-slate-400">
                          Renews automatically on <span className="text-white font-bold">October 1, 2026</span>
                        </div>

                        <button
                          onClick={() => setBillingSubTab('all_plans')}
                          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" /> Upgrade Plan & Explore All Tiers
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (

              /* VIEW 2: SEPARATE SCREEN SHOWING ALL 4 PLANS */
              <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Choose a Subscription Tier</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select any plan card below to inspect full capabilities or upgrade your tier.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {DETAILED_PLANS.map(t => {
                    const isCurrent = userPlanNorm === t.id.toLowerCase() || (userPlanNorm.includes('agency') && t.id === 'agency_pro') || (userPlanNorm.includes('base') && t.id === 'base') || (userPlanNorm.includes('prof') && t.id === 'professional') || (userPlanNorm.includes('enterp') && t.id === 'enterprise');
                    const pPrice = getPlanPrice(t.id, activeCurrency);

                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedPlanDetail(t)}
                        className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all duration-200 cursor-pointer group hover:-translate-y-0.5 ${
                          isCurrent
                            ? 'bg-brand-500/10 border-brand-500/60 shadow-lg shadow-brand-500/10 ring-2 ring-brand-500/20'
                            : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-brand-500/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/15 px-2.5 py-0.5 rounded-full border border-brand-500/30">
                              {t.badge}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-bold uppercase bg-emerald-500 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                                Current Plan
                              </span>
                            )}
                          </div>

                          <div>
                            <h4 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-brand-500 transition-colors">
                              {t.name}
                            </h4>
                            <div className="text-xl font-black text-brand-500 dark:text-brand-400 my-1 flex items-baseline gap-1.5 flex-wrap">
                              <span>{pPrice.primary}</span>
                              <span className="text-xs font-medium text-slate-400">{pPrice.period}</span>
                              <span className="text-[10px] font-bold text-slate-400/80 bg-slate-200/60 dark:bg-slate-800/80 px-1.5 py-0.5 rounded">{pPrice.secondary}</span>
                            </div>
                            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                              <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                              <span>{t.credits}</span>
                            </div>
                          </div>

                          <div className="space-y-2 pt-3 border-t border-slate-200/80 dark:border-slate-800">
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span>What's Included</span>
                            </div>
                            <ul className="space-y-2">
                              {t.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-snug">
                                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  <span className={feature.highlighted ? 'font-extrabold text-slate-900 dark:text-white' : ''}>
                                    {feature.text}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isCurrent) {
                              handleUpgradePlan(t);
                            }
                          }}
                          disabled={isUpgradingPlan}
                          className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                            isCurrent
                              ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                              : 'bg-brand-500/15 hover:bg-brand-500 text-brand-600 dark:text-brand-400 hover:text-white border border-brand-500/30'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {isCurrent ? 'Current Active Tier' : `Select & Upgrade to ${t.name}`}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* ── MASTER FEATURE COMPARISON MATRIX TABLE ────────────────── */}
                <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Master Feature Comparison Matrix</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Compare features, AI quotas and capabilities across all subscription tiers.</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c111d] shadow-xl overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
                            <th className="py-4 px-5 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 min-w-[240px]">
                              FEATURE
                            </th>
                            <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-center text-slate-700 dark:text-slate-300 min-w-[130px]">
                              STARTER
                              <span className="block text-[10px] font-extrabold text-brand-500 mt-0.5">
                                {getPlanPrice('base', activeCurrency).primary}/mo
                              </span>
                            </th>
                            <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-center text-slate-700 dark:text-slate-300 min-w-[140px]">
                              PRO / GROWTH
                              <span className="block text-[10px] font-extrabold text-brand-500 mt-0.5">
                                {getPlanPrice('professional', activeCurrency).primary}/mo
                              </span>
                            </th>
                            <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-center text-slate-700 dark:text-slate-300 bg-brand-500/10 min-w-[150px]">
                              AGENCY / SCALE
                              <span className="block text-[10px] font-extrabold text-brand-500 mt-0.5">
                                {getPlanPrice('agency_pro', activeCurrency).primary}/mo
                              </span>
                            </th>
                            <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-center text-slate-700 dark:text-slate-300 min-w-[140px]">
                              ENTERPRISE
                              <span className="block text-[10px] font-extrabold text-brand-500 mt-0.5">
                                {getPlanPrice('enterprise', activeCurrency).primary}/mo
                              </span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                          {FEATURE_COMPARISON_MATRIX.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors">
                              <td className="py-3.5 px-5">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9.5px] font-black text-brand-600 dark:text-brand-400 bg-brand-500/15 px-2 py-0.5 rounded-md uppercase tracking-wider border border-brand-500/30 shrink-0">
                                    AISA™
                                  </span>
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{row.feature}</span>
                                </div>
                              </td>
                              {['starter', 'pro', 'agency', 'enterprise'].map((colKey) => {
                                const cell = row[colKey];
                                const isAgencyCol = colKey === 'agency';
                                return (
                                  <td key={colKey} className={`py-3.5 px-4 text-center ${isAgencyCol ? 'bg-brand-500/5' : ''}`}>
                                    {!cell || cell.type === 'cross' ? (
                                      <span className="text-slate-300 dark:text-slate-700 text-sm font-bold">✕</span>
                                    ) : cell.type === 'check' ? (
                                      <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 shadow-2xs">
                                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                        {cell.text}
                                      </span>
                                    ) : cell.type === 'badge' ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-black bg-brand-500/15 text-brand-600 dark:text-brand-400 px-3 py-1 rounded-full border border-brand-500/30">
                                        <Sparkles className="w-3 h-3 text-brand-500 shrink-0" />
                                        {cell.text}
                                      </span>
                                    ) : (
                                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{cell.text}</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      // ── HELP & FAQ ─────────────────────────────────
      case 'help':
        return (
          <div className="space-y-6">
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <button
                onClick={() => setFaqSubTab('faq')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${faqSubTab === 'faq' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {t('browseFaq', 'Browse FAQ')}
              </button>
              <button
                onClick={() => setFaqSubTab('ticket')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${faqSubTab === 'ticket' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {t('submitTicket', 'Submit Ticket')}
              </button>
            </div>

            {faqSubTab === 'faq' ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('searchQuestions', 'Search questions...')}
                    value={faqSearchQuery}
                    onChange={e => setFaqSearchQuery(e.target.value)}
                    className="glass-input text-xs pl-10 w-full"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {faqs.map((cat, idx) => (
                    <button
                      key={cat.category}
                      onClick={() => { setSelectedFaqCategory(idx); setOpenFaqIndex(null); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border transition-all ${
                        selectedFaqCategory === idx
                          ? 'bg-brand-500/20 text-brand-400 border-brand-500/40'
                          : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400'
                      }`}
                    >
                      {t(cat.category, cat.category)}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 mt-4">
                  {faqs[selectedFaqCategory].questions
                    .filter(q => !faqSearchQuery || q.question.toLowerCase().includes(faqSearchQuery.toLowerCase()))
                    .map((faq, index) => (
                      <div key={index} className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
                        <button
                          onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                          className="w-full flex justify-between items-center p-4 text-left font-bold text-xs text-slate-800 dark:text-slate-200"
                        >
                          <span>{t(faq.question, faq.question)}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaqIndex === index ? 'rotate-180 text-brand-500' : ''}`} />
                        </button>
                        {openFaqIndex === index && (
                          <div className="px-4 pb-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-200/40 dark:border-slate-800/40 pt-3">
                            {t(faq.answer, faq.answer)}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">{t('category', 'Category')}</label>
                  <CustomDropdown
                    value={issueType}
                    onChange={val => setIssueType(val)}
                    icon={MessageSquare}
                    options={[
                      { value: 'General Inquiry', label: t('generalInquiry', 'General Inquiry'), icon: '💬' },
                      { value: 'Technical Support', label: t('technicalSupport', 'Technical Support'), icon: '⚡' },
                      { value: 'Billing', label: t('billingSubscriptions', 'Billing & Subscriptions'), icon: '💳' },
                      { value: 'Feature Request', label: t('featureRequest', 'Feature Request'), icon: '💡' },
                      { value: 'Bug Report', label: t('bugReport', 'Bug Report'), icon: '🐞' }
                    ]}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">{t('message', 'Message')}</label>
                  <textarea
                    rows={4}
                    value={issueText}
                    onChange={e => setIssueText(e.target.value)}
                    placeholder={t('describeQuery', 'Describe your query...')}
                    className="glass-input text-xs w-full resize-none p-4"
                  />
                </div>
                <button onClick={handleSupportSubmit} disabled={isSending || !issueText.trim()} className="btn-primary text-xs w-full py-3">
                  {isSending ? t('submittingSupportRequest', 'Submitting Support Request...') : t('submitSupportRequest', 'Submit Support Request')}
                </button>
                {sendStatus === 'success' && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center animate-in fade-in">
                    {t('supportSubmittedSuccess', '✓ Support request submitted successfully! Our team will assist you shortly.')}
                  </div>
                )}
                {sendStatus === 'error' && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold text-center animate-in fade-in">
                    {t('supportDeliveryError', '❌ Delivery error. Please try again later.')}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      // ── FEEDBACK ───────────────────────────────────
      case 'feedback':
        return (
          <div className="space-y-4 max-w-lg">
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{t('shareProductIdeas', 'Share Your Product Ideas')}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{t('shareProductIdeasDesc', 'Tell us how we can make AI Ads Platform even better for your team. Your feedback is sent directly to our executive team.')}</p>
              <textarea
                rows={5}
                value={issueText}
                onChange={e => setIssueText(e.target.value)}
                placeholder={t('feedbackPlaceholder', 'What features or improvements would you love to see?')}
                className="glass-input text-xs w-full resize-none p-4"
              />
              <button onClick={handleSupportSubmit} disabled={isSending || !issueText.trim()} className="btn-primary text-xs w-full py-3">
                {isSending ? t('submittingFeedback', 'Submitting Feedback...') : t('submitFeedback', 'Submit Feedback')}
              </button>
              {sendStatus === 'success' && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center animate-in fade-in">
                  {t('feedbackSubmittedSuccess', '✓ Thank you! Your product feedback has been submitted successfully.')}
                </div>
              )}
              {sendStatus === 'error' && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold text-center animate-in fade-in">
                  {t('feedbackDeliveryError', '❌ Unable to send feedback. Please try again.')}
                </div>
              )}
            </div>
          </div>
        );

      // ── PRIVACY POLICY ─────────────────────────────
      case 'privacy': {
        return (
          <div className="space-y-6 pb-6">
            {/* Main Header Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-brand-500/5 to-indigo-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/25">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    AI Ads™ Privacy Policy
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Updated September 2026
                  </p>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-2xs self-stretch sm:self-auto justify-center"
                title="Print or Save Privacy Policy as PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>

            {/* Quick Section Anchors */}
            <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
              <a href="#sec-collection" className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition-all border border-slate-200 dark:border-slate-800">
                1. Information Collected
              </a>
              <a href="#sec-usage" className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition-all border border-slate-200 dark:border-slate-800">
                2. Use of Information
              </a>
              <a href="#sec-ai" className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition-all border border-slate-200 dark:border-slate-800">
                3. AI Data Privacy
              </a>
              <a href="#sec-sharing" className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition-all border border-slate-200 dark:border-slate-800">
                4. Third-Party Sharing
              </a>
              <a href="#sec-security" className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition-all border border-slate-200 dark:border-slate-800">
                5. Security
              </a>
              <a href="#sec-deletion" className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition-all border border-slate-200 dark:border-slate-800">
                6. Retention & Deletion
              </a>
              <a href="#sec-rights" className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition-all border border-slate-200 dark:border-slate-800">
                7. Your Rights
              </a>
              <a href="#sec-cookies" className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition-all border border-slate-200 dark:border-slate-800">
                8. Cookies & Storage
              </a>
              <a href="#sec-children" className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition-all border border-slate-200 dark:border-slate-800">
                9. Children's Privacy
              </a>
              <a href="#sec-updates" className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition-all border border-slate-200 dark:border-slate-800">
                10. Updates
              </a>
              <a href="#sec-contact" className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition-all border border-slate-200 dark:border-slate-800">
                11. Contact
              </a>
            </div>

            {/* 1. INFORMATION WE COLLECT */}
            <div id="sec-collection" className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-black text-xs border border-blue-500/20">
                  01
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">1. Information We Collect</h3>
                  <p className="text-xs text-slate-400">Details on account, workspace, and usage data gathered when using AI Ads™</p>
                </div>
              </div>

              <div className="space-y-3 pl-2 sm:pl-11 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    1.1 Account & Registration Data
                  </h4>
                  <p>
                    When you create an account, we collect your email address, full name, profile picture, account role, and encrypted password credentials.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    1.2 Brand DNA & Workspace Assets
                  </h4>
                  <p>
                    To generate personalized marketing content, we store brand positioning rules, value claims, target audience parameters, uploaded logos, content calendars, and campaign drafts created inside your workspace.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    1.3 AI Inputs & Uploaded Collateral
                  </h4>
                  <p>
                    We process text prompts, creative instructions, guidelines, and media assets you submit when generating ad copy, strategies, graphics, or landing page templates.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    1.4 Usage & Technical Logs
                  </h4>
                  <p>
                    We automatically collect standard diagnostic details such as browser type, IP address, device information, and interaction timestamps to maintain platform performance and system stability.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. HOW WE USE INFORMATION */}
            <div id="sec-usage" className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-black text-xs border border-purple-500/20">
                  02
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">2. How We Use Information</h3>
                  <p className="text-xs text-slate-400">Powering AI content generation, service delivery, and transactional support</p>
                </div>
              </div>

              <div className="space-y-3 pl-2 sm:pl-11 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    2.1 Content Generation & Synthesis
                  </h4>
                  <p>
                    Your prompts and Brand DNA context are used to synthesize customized marketing copy, blog posts, ad strategy recommendations, and website designs.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    2.2 Account Administration & Security
                  </h4>
                  <p>
                    We use your email to send essential account notices, security verification codes (OTP), billing updates, and password reset instructions.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    2.3 Optimization & Diagnostics
                  </h4>
                  <p>
                    Technical interaction logs help our engineering team identify bug reports, optimize AI response speed, and refine user experience across our platform modules.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. AI & DATA USAGE */}
            <div id="sec-ai" className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-xs border border-indigo-500/20">
                  03
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">3. AI & Data Usage</h3>
                  <p className="text-xs text-slate-400">AI prompt processing, data ownership, and model privacy guarantees</p>
                </div>
              </div>

              <div className="space-y-3 pl-2 sm:pl-11 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    3.1 How AI Processing Works
                  </h4>
                  <p>
                    When you request content generation, your text inputs and relevant Brand DNA context are transmitted to enterprise AI model provider APIs to synthesize targeted outputs.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    3.2 Full Data Ownership
                  </h4>
                  <p>
                    You retain 100% ownership of your Brand DNA, uploaded media assets, and all AI-generated content produced within your workspace.
                  </p>
                </div>

                {/* NO PUBLIC MODEL TRAINING GUARANTEE */}
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-900 dark:text-purple-200 space-y-1">
                  <div className="flex items-center gap-2 font-black text-xs">
                    <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>🔒 NO PUBLIC AI MODEL TRAINING GUARANTEE</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-purple-800 dark:text-purple-300">
                    Your proprietary Brand DNA, confidential marketing copy, and generated creative collateral are <strong>never sold to third parties or used to train public AI models</strong>. Your competitive brand intelligence remains strictly private to your workspace.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. THIRD-PARTY SERVICES & DATA SHARING */}
            <div id="sec-sharing" className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-xs border border-amber-500/20">
                  04
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">4. Third-Party Services & Data Sharing</h3>
                  <p className="text-xs text-slate-400">Trusted service providers handling cloud hosting, AI processing, and payments</p>
                </div>
              </div>

              <div className="space-y-3 pl-2 sm:pl-11 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    4.1 Essential Service Providers
                  </h4>
                  <p>
                    We partner with established third-party services to deliver core application functionality:
                  </p>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-[11.5px] text-slate-600 dark:text-slate-300">
                    <li>Cloud infrastructure providers for secure hosting and database storage.</li>
                    <li>Enterprise AI model infrastructure for prompt processing and creative generation.</li>
                    <li>Certified payment processors (such as Razorpay) for secure subscription billing handling.</li>
                    <li>Email service providers for transactional messages and security verification codes.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    4.2 No Data Monetization
                  </h4>
                  <p>
                    We do not sell, rent, or trade your personal or workspace information to data brokers, advertisers, or unauthorized third parties.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    4.3 Legal Compliance
                  </h4>
                  <p>
                    We may disclose information only when required by valid legal process, applicable law, or to protect the safety and legal rights of our platform and users.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. DATA SECURITY */}
            <div id="sec-security" className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xs border border-emerald-500/20">
                  05
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">5. Data Security</h3>
                  <p className="text-xs text-slate-400">High-level safeguards protecting your account and workspace data</p>
                </div>
              </div>

              <div className="space-y-3 pl-2 sm:pl-11 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    5.1 Protective Safeguards
                  </h4>
                  <p>
                    We maintain administrative, technical, and physical safeguards designed to protect your data against unauthorized access, alteration, loss, or disclosure.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    5.2 Workspace Access Control
                  </h4>
                  <p>
                    Workspace resources are strictly isolated, ensuring team members access only the organization data permitted by their designated roles.
                  </p>
                </div>

                {/* HIGH-LEVEL SECURITY OVERVIEW BOX */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 space-y-1">
                  <div className="flex items-center gap-2 font-black text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>🛡️ HIGH-LEVEL TECHNICAL SECURITY OVERVIEW</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-300">
                    All network traffic and data stored in our databases use standard industry encryption protocols in transit and at rest. Account sessions are secured with authenticated access tokens.
                  </p>
                </div>
              </div>
            </div>

            {/* 6. DATA RETENTION & ACCOUNT DELETION */}
            <div id="sec-deletion" className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-black text-xs border border-rose-500/20">
                  06
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">6. Data Retention & Account Deletion</h3>
                  <p className="text-xs text-slate-400">Data retention policies, self-service export, and permanent account removal</p>
                </div>
              </div>

              <div className="space-y-3 pl-2 sm:pl-11 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    6.1 Retention Period
                  </h4>
                  <p>
                    We retain your account and workspace data for as long as your account remains active or as necessary to provide our services.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    6.2 Account Deletion Verification
                  </h4>
                  <p>
                    You can request complete account deletion from your account settings at any time. For security, initiating deletion sends a 6-digit security code to your registered email address.
                  </p>
                </div>

                {/* PERMANENT ACCOUNT DELETION HIGHLIGHT BOX */}
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200 space-y-1">
                  <div className="flex items-center gap-2 font-black text-xs">
                    <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>🗑️ PERMANENT DATA PURGE UPON DELETION</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-rose-800 dark:text-rose-300">
                    Once verified with your email security code, your account credentials, workspace positioning profiles, Brand DNA, and campaign records are <strong>permanently deleted from our active databases</strong>, and active sessions across all devices are logged out immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* 7. USER PRIVACY RIGHTS */}
            <div id="sec-rights" className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-black text-xs border border-cyan-500/20">
                  07
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">7. User Privacy Rights</h3>
                  <p className="text-xs text-slate-400">Options to access, export, modify, or delete your information</p>
                </div>
              </div>

              <div className="space-y-3 pl-2 sm:pl-11 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    7.1 Data Access & Export
                  </h4>
                  <p>
                    You have full ownership of your data. You can download a structured backup copy of your workspace parameters, Brand DNA, and campaign records anytime from <strong>Settings &gt; Data Controls &amp; Backup</strong>.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    7.2 Profile Updates & Correction
                  </h4>
                  <p>
                    You may update your profile details, change display names, or update workspace brand preferences whenever needed inside your account management panel.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    7.3 Communication Opt-Out
                  </h4>
                  <p>
                    You can manage notification preferences or unsubscribe from non-essential email updates through your settings tab or by clicking the unsubscribe link in communications.
                  </p>
                </div>
              </div>
            </div>

            {/* 8. COOKIES & LOCAL DATA STORAGE */}
            <div id="sec-cookies" className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center font-black text-xs border border-teal-500/20">
                  08
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">8. Cookies & Local Data Storage</h3>
                  <p className="text-xs text-slate-400">Essential browser storage for maintaining active login sessions and preferences</p>
                </div>
              </div>

              <div className="space-y-3 pl-2 sm:pl-11 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    8.1 Essential Local Storage
                  </h4>
                  <p>
                    We use browser local storage and essential session tokens to remember your login session, save your dark/light theme choices, retain sidebar layout settings, and preserve language options.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    8.2 Managing Browser Storage
                  </h4>
                  <p>
                    You can clear or block cookies and local storage items directly via your browser settings. Please note that clearing local storage may require you to sign in again or reconfigure UI display preferences.
                  </p>
                </div>
              </div>
            </div>

            {/* 9. CHILDREN'S PRIVACY */}
            <div id="sec-children" className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-black text-xs border border-violet-500/20">
                  09
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">9. Children's Privacy</h3>
                  <p className="text-xs text-slate-400">Age restrictions and commercial service scope</p>
                </div>
              </div>

              <div className="space-y-3 pl-2 sm:pl-11 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  AI Ads™ is an enterprise SaaS platform designed exclusively for business and professional marketing use. We do not knowingly solicit or collect personal information from individuals under the age of 18. If we discover that an account has been created by a minor, we will take immediate action to remove the associated account and data.
                </p>
              </div>
            </div>

            {/* 10. PRIVACY POLICY UPDATES */}
            <div id="sec-updates" className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-black text-xs border border-sky-500/20">
                  10
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">10. Privacy Policy Updates</h3>
                  <p className="text-xs text-slate-400">Notification of changes and policy revision procedures</p>
                </div>
              </div>

              <div className="space-y-3 pl-2 sm:pl-11 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  We may update this Privacy Policy periodically to reflect new platform features, operational practices, or legal requirements. When changes are published, we will update the "Last Updated" date at the top of this policy. For significant modifications affecting how we process your data, we will notify users via platform announcements or email notifications prior to changes taking effect.
                </p>
              </div>
            </div>

            {/* 11. PRIVACY CONTACT INFORMATION */}
            <div id="sec-contact" className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-xs border border-indigo-500/20">
                  11
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">11. Privacy Contact Information</h3>
                  <p className="text-xs text-slate-400">Reach out to our privacy team for data requests or questions</p>
                </div>
              </div>

              <div className="space-y-3 pl-2 sm:pl-11 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  If you have questions, concerns, or requests regarding this Privacy Policy or how your data is handled, please contact our team:
                </p>

                {/* Questions About Privacy Card */}
                <div className="mt-3 p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 space-y-2.5 shadow-sm">
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Questions About Privacy?
                  </h4>
                  <div className="space-y-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">Email:</span>
                      <a href="mailto:admin@uwo24.com" className="text-indigo-600 dark:text-indigo-400 font-bold underline hover:text-indigo-700 transition-colors">
                        admin@uwo24.com
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">Phone:</span>
                      <a href="tel:+918358990909" className="text-indigo-600 dark:text-indigo-400 font-bold underline hover:text-indigo-700 transition-colors">
                        +91 83589 90909
                      </a>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                    Response time: We aim to respond to all privacy-related inquiries within 1–2 business days.
                  </p>
                </div>
              </div>
            </div>

          </div>
        );
      }

      // ── TERMS OF SERVICE ───────────────────────────
      case 'terms': {
        return (
          <div className="space-y-6 pb-6">
            {/* Main Header Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-brand-500/10 via-purple-500/5 to-indigo-500/10 border border-brand-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/25">
                  <Scale className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    AI Ads™ Terms of Service
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Updated September 2026
                  </p>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/25 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-2xs self-stretch sm:self-auto justify-center"
                title="Print or Save Terms of Service as PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>

            {/* Quick Section Anchors */}
            <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
              <a href="#terms-acceptance" className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white transition-all border border-slate-200 dark:border-slate-800">
                1. Agreement
              </a>
              <a href="#terms-licensing" className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white transition-all border border-slate-200 dark:border-slate-800">
                2. Accounts & Licensing
              </a>
              <a href="#terms-ip" className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white transition-all border border-slate-200 dark:border-slate-800">
                3. AI Ownership & IP
              </a>
              <a href="#terms-use" className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white transition-all border border-slate-200 dark:border-slate-800">
                4. Acceptable Use
              </a>
              <a href="#terms-billing" className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white transition-all border border-slate-200 dark:border-slate-800">
                5. Billing & Credits
              </a>
              <a href="#terms-service" className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white transition-all border border-slate-200 dark:border-slate-800">
                6. Service Availability
              </a>
              <a href="#terms-termination" className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white transition-all border border-slate-200 dark:border-slate-800">
                7. Account Termination
              </a>
              <a href="#terms-liability" className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white transition-all border border-slate-200 dark:border-slate-800">
                8. Liability
              </a>
              <a href="#terms-changes" className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white transition-all border border-slate-200 dark:border-slate-800">
                9. Changes
              </a>
              <a href="#terms-contact" className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white transition-all border border-slate-200 dark:border-slate-800">
                10. Contact Us
              </a>
            </div>

            {/* 1. AGREEMENT & ACCEPTANCE OF TERMS */}
            <div id="terms-acceptance" className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-black text-xs border border-brand-500/20">
                  01
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">1. Agreement & Acceptance of Terms</h3>
                  <p className="text-xs text-slate-400">Binding license agreement between you and AI Ads™</p>
                </div>
              </div>

              <div className="space-y-3 pl-2 sm:pl-11 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  By creating an account, accessing, or using the AI Ads™ platform, you agree to be bound by these Terms of Service and our Privacy Policy. If you are entering into these Terms on behalf of an organization or business, you represent that you have legal authority to bind that entity to these Terms.
                </p>
              </div>
            </div>

            {/* 2. ACCOUNT REGISTRATION & LICENSING */}
            <div id="terms-licensing" className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-black text-xs border border-purple-500/20">
                  02
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">2. Account Registration & Licensing</h3>
                  <p className="text-xs text-slate-400">Account security responsibilities and workspace usage rights</p>
                </div>
              </div>

              <div className="space-y-3 pl-2 sm:pl-11 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    2.1 Account Security & Credentials
                  </h4>
                  <p>
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities occurring under your account. You agree to notify us immediately of any unauthorized access or security breach.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    2.2 Platform Subscription License
                  </h4>
                  <p>
                    Subject to compliance with these Terms and payment of applicable plan fees, AI Ads™ grants you a limited, non-exclusive, non-transferable, revocable license to access and use the platform for your marketing and business operations.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. AI CONTENT & INTELLECTUAL PROPERTY */}
            <div id="terms-ip" className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-xs border border-indigo-500/20">
                  03
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">3. AI Content & Intellectual Property</h3>
                  <p className="text-xs text-slate-400">Ownership rights for Brand DNA inputs and generated AI collateral</p>
                </div>
              </div>

              <div className="space-y-3 pl-2 sm:pl-11 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    3.1 Input Data & Brand DNA Ownership
                  </h4>
                  <p>
                    You retain full rights, title, and ownership of all uploaded brand positioning rules, value claims, logos, media, and marketing collateral configured in your workspace.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    3.2 Commercial Ownership of AI Outputs
                  </h4>
                  <p>
                    All ad copy, campaign strategies, social media posts, visual designs, and website code synthesized by AI Ads™ for your workspace belong to you for commercial use.
                  </p>
                </div>

                {/* COMMERCIAL IP GUARANTEE BOX */}
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-900 dark:text-purple-200 space-y-1">
                  <div className="flex items-center gap-2 font-black text-xs">
                    <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>🔒 IMMUTABLE COMMERCIAL IP GUARANTEE</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-purple-800 dark:text-purple-300">
                    All website projects and ad creatives synthesized in your workspace belong exclusively to your organization. AI Ads™ makes zero claim of ownership over your input data or generated outputs.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. ACCEPTABLE USE POLICY */}
            <div id="terms-use" className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-xs border border-amber-500/20">
                  04
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">4. Acceptable Use Policy</h3>
                  <p className="text-xs text-slate-400">Rules governing permitted behavior and content standards</p>
                </div>
              </div>

              <div className="space-y-3 pl-2 sm:pl-11 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  You agree not to use AI Ads™ to synthesize illegal, fraudulent, harmful, defamatory, or deceptive content, or to attempt unauthorized access to platform infrastructure or other users' workspaces. Accounts violating acceptable use policies may be suspended or terminated.
                </p>
              </div>
            </div>

            {/* 5. SUBSCRIPTIONS, VISUAL CREDITS & BILLING */}
            <div id="terms-billing" className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xs border border-emerald-500/20">
                  05
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">5. Subscriptions, Visual Credits & Billing</h3>
                  <p className="text-xs text-slate-400">Subscription plans, credit allocations, and payment processing</p>
                </div>
              </div>

              <div className="space-y-3 pl-2 sm:pl-11 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    5.1 Subscriptions & Visual Credit Allocations
                  </h4>
                  <p>
                    Platform features and AI generation modules operate according to your selected plan (Starter, Pro, Agency, Enterprise). Generation usage consumes visual credits allocated per billing cycle.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
                    5.2 Payments & Renewal
                  </h4>
                  <p>
                    Paid subscriptions renew automatically on a recurring billing cycle unless cancelled prior to renewal. All payment transactions are processed securely through certified payment processing gateways.
                  </p>
                </div>
              </div>
            </div>

            {/* 6. SERVICE AVAILABILITY & MODIFICATIONS */}
            <div id="terms-service" className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center font-black text-xs border border-teal-500/20">
                  06
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">6. Service Availability & Modifications</h3>
                  <p className="text-xs text-slate-400">Platform uptime goals and system updates</p>
                </div>
              </div>

              <div className="space-y-3 pl-2 sm:pl-11 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  We strive to maintain continuous platform availability and uptime. We reserve the right to modify, upgrade, or refine platform features to enhance user performance and security.
                </p>
              </div>
            </div>

            {/* 7. ACCOUNT TERMINATION & DELETION */}
            <div id="terms-termination" className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-black text-xs border border-rose-500/20">
                  07
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">7. Account Termination & Deletion</h3>
                  <p className="text-xs text-slate-400">Self-service cancellation and permanent account deletion</p>
                </div>
              </div>

              <div className="space-y-3 pl-2 sm:pl-11 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  You can cancel your subscription or initiate full account deletion at any time via your account settings panel. Upon verified deletion, your workspace positioning data, Brand DNA, and saved campaigns are permanently removed from active databases.
                </p>
              </div>
            </div>

            {/* 8. LIMITATION OF LIABILITY */}
            <div id="terms-liability" className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-black text-xs border border-cyan-500/20">
                  08
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">8. Limitation of Liability</h3>
                  <p className="text-xs text-slate-400">Standard legal liability boundaries</p>
                </div>
              </div>

              <div className="space-y-3 pl-2 sm:pl-11 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  AI Ads™ is provided on an "as is" and "as available" basis. To the maximum extent permitted by applicable law, AI Ads™ shall not be liable for indirect, incidental, special, or consequential damages arising from platform usage or generation outputs.
                </p>
              </div>
            </div>

            {/* 9. CHANGES TO TERMS */}
            <div id="terms-changes" className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-black text-xs border border-sky-500/20">
                  09
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">9. Changes to Terms</h3>
                  <p className="text-xs text-slate-400">Revision notices and effective date updates</p>
                </div>
              </div>

              <div className="space-y-3 pl-2 sm:pl-11 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  We may revise these Terms from time to time. Updated Terms will feature a revised "Last Updated" date. Continued use of the platform following updates constitutes acceptance of the modified Terms.
                </p>
              </div>
            </div>

            {/* 10. CONTACT INFORMATION */}
            <div id="terms-contact" className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-xs border border-indigo-500/20">
                  10
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">10. Contact Information</h3>
                  <p className="text-xs text-slate-400">Questions about our Terms of Service</p>
                </div>
              </div>

              <div className="space-y-3 pl-2 sm:pl-11 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  If you have any questions regarding these Terms of Service, please reach out to our legal support team:
                </p>

                {/* Questions About Terms Card */}
                <div className="mt-3 p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 space-y-2.5 shadow-sm">
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Questions About Terms of Service?
                  </h4>
                  <div className="space-y-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">Email:</span>
                      <a href="mailto:admin@uwo24.com" className="text-indigo-600 dark:text-indigo-400 font-bold underline hover:text-indigo-700 transition-colors">
                        admin@uwo24.com
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">Phone:</span>
                      <a href="tel:+918358990909" className="text-indigo-600 dark:text-indigo-400 font-bold underline hover:text-indigo-700 transition-colors">
                        +91 83589 90909
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        );
      }

      default:
        return null;
    }
  };

  const handleCloseSettingsModal = () => {
    setIsSettingsModalOpen(false);
    if (setActiveModule) {
      setActiveModule('dashboard');
    }
  };

  // ──────────────────────────────────────────────────────────
  // Main Render Portal
  // ──────────────────────────────────────────────────────────
  if (!isSettingsModalOpen) return null;

  return createPortal(
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none p-0 sm:p-4">
          {/* Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseSettingsModal}
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-md pointer-events-auto"
          />

          {/* Modal Container */}
          <motion.div
            initial={typeof window !== 'undefined' && window.innerWidth < 640 ? { x: '100%' } : { opacity: 0, scale: 0.96, y: 15 }}
            animate={typeof window !== 'undefined' && window.innerWidth < 640 ? { x: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={typeof window !== 'undefined' && window.innerWidth < 640 ? { x: '100%' } : { opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`absolute sm:relative top-0 left-0 h-full sm:h-[90vh] w-full ${activeTab === 'billing' ? 'sm:max-w-6xl' : 'sm:max-w-5xl'} bg-white dark:bg-[#090d16] flex flex-col sm:flex-row shadow-2xl sm:rounded-[28px] border border-slate-200 dark:border-slate-800/80 pointer-events-auto overflow-hidden`}
            onClick={e => e.stopPropagation()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            {/* ── LEFT SIDEBAR NAV (Hidden in standalone Plan view) ─────────────────────── */}
            <div className={`flex flex-col h-full w-full sm:w-[320px] bg-slate-50/90 dark:bg-[#0c111d] border-r border-slate-200 dark:border-slate-800/80 shrink-0 transition-all ${activeTab === 'billing' ? 'hidden' : view === 'detail' ? 'hidden sm:flex' : 'flex'}`}>

              {/* Sidebar Header */}
              <div className="p-5 flex items-center justify-between shrink-0 border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center gap-3">
                  <img src="/logo_icon_only.png?v=10" alt="AI Ads™ Logo" className="w-12 h-12 object-contain shrink-0" />
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{t('aiAdsPreferences', 'AI Ads Preferences')}</h2>
                    <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest block">{t('platformSettings', 'PLATFORM SETTINGS')}</span>
                  </div>
                </div>
                <button
                  onClick={handleCloseSettingsModal}
                  className="sm:hidden p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Search Box */}
              <div className="p-4 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('searchSettings', 'Search settings...')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="glass-input text-xs pl-10 w-full"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Categorized Nav List */}
              <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4 custom-scrollbar">
                {navSections.map(section => (
                  <div key={section.title} className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3 block">
                      {section.title}
                    </span>
                    {section.items.map(item => {
                      const IconComponent = item.icon;
                      const isActive = activeTab === item.id && !searchQuery;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setSearchQuery('');
                            setView('detail');
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                            isActive
                              ? 'bg-brand-500/15 text-brand-600 dark:text-brand-300 font-extrabold border border-brand-500/30 shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.color} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                              <IconComponent className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[9px] font-extrabold bg-brand-500/20 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full border border-brand-500/30">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>

              {/* Logout Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800/80">
                <button
                  onClick={() => { logout(); handleCloseSettingsModal(); }}
                  className="w-full py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  {t('logOut', 'LOG OUT')}
                </button>
              </div>
            </div>

            {/* ── RIGHT DETAIL PANEL ────────────────────── */}
            <div className={`flex-1 flex flex-col min-w-0 bg-white dark:bg-[#090d16] overflow-hidden ${view === 'sidebar' ? 'hidden sm:flex' : 'flex'}`}>

              {/* Detail Top Header */}
              <div className="p-5 sm:px-8 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setView('sidebar')}
                    className="sm:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                  >
                    <ChevronLeft size={20} className="text-slate-400" />
                  </button>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize">
                    {searchQuery ? 'Search Results' : navSections.flatMap(s => s.items).find(i => i.id === activeTab)?.label || 'Preferences'}
                  </h3>
                </div>
                <button
                  onClick={handleCloseSettingsModal}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 custom-scrollbar">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab + searchQuery}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer Actions Bar (Hidden in standalone Plan view) */}
              {activeTab !== 'billing' && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex justify-end gap-3 shrink-0">
                  <button
                    onClick={handleCloseSettingsModal}
                    className="btn-primary text-xs px-6 py-2"
                  >
                    {t('saveAndDone', 'Save & Done')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* ── DELETE ACCOUNT MODAL ─────────────────────── */}
      <AnimatePresence>
        {showDeleteModal && (
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => { setShowDeleteModal(false); setDeleteStep('confirm'); setDeleteOtp(''); setDeleteError(''); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#121827] p-6 sm:p-8 rounded-[2rem] w-full max-w-sm shadow-2xl border border-red-500/20 text-center"
              onClick={e => e.stopPropagation()}
            >
              {deleteStep === 'confirm' && (
                <>
                  <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Trash2 className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Delete Account?</h3>
                  <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                    Are you absolutely sure? This will permanently remove your profile, data, and access.{' '}
                    <strong className="text-red-500">This cannot be undone.</strong>
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleInitiateDelete}
                      disabled={deleteOtpLoading}
                      className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-sm tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 active:scale-95 uppercase"
                    >
                      {deleteOtpLoading ? 'Sending Code...' : 'Yes, Delete Permanently'}
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl font-black text-sm tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {deleteStep === 'otp' && (
                <>
                  <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-8 h-8 text-brand-500" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Verify Identity</h3>
                  <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                    We sent a 6-digit security code to <strong className="text-slate-700 dark:text-slate-200">{user?.email}</strong>. Please verify it below.
                  </p>
                  <input
                    type="text"
                    maxLength={6}
                    value={deleteOtp}
                    onChange={e => setDeleteOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full text-center py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-2xl tracking-[0.4em] text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 placeholder:text-slate-400 mb-2"
                  />
                  {deleteError && (
                    <p className="text-xs text-red-500 font-bold mb-4 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {deleteError}
                    </p>
                  )}
                  <div className="flex flex-col gap-3 mt-4">
                    <button onClick={handleVerifyDeleteOtp} disabled={deleteOtpLoading || deleteOtp.length !== 6}
                      className="w-full py-4 bg-brand-500 text-white rounded-2xl font-black text-sm tracking-widest hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/25 disabled:opacity-50 active:scale-95 uppercase"
                    >
                      {deleteOtpLoading ? 'Verifying...' : 'Verify Code'}
                    </button>
                    <button onClick={handleResendDeleteOtp} disabled={deleteCooldown > 0 || deleteOtpLoading}
                      className="w-full py-3 text-xs font-black tracking-widest text-brand-500 hover:bg-brand-500/5 rounded-2xl transition-all disabled:opacity-50 uppercase"
                    >
                      {deleteCooldown > 0 ? `Resend in ${deleteCooldown}s` : 'Resend Code'}
                    </button>
                    <button onClick={() => { setShowDeleteModal(false); setDeleteStep('confirm'); setDeleteOtp(''); setDeleteError(''); }}
                      className="w-full py-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl font-black text-sm tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {deleteStep === 'verified' && (
                <>
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Eye className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Identity Verified</h3>
                  <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                    Your identity is verified. Ready to permanently remove all your profile data and access.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button onClick={handleDeleteAccount} disabled={deleteLoading}
                      className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-sm tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 active:scale-95 uppercase"
                    >
                      {deleteLoading ? 'Deleting Account...' : 'Permanently Delete Account'}
                    </button>
                    <button onClick={() => { setShowDeleteModal(false); setDeleteStep('confirm'); setDeleteOtp(''); setDeleteError(''); }}
                      className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl font-black text-sm tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PASSWORD RESET MODAL ─────────────────────── */}
      <AnimatePresence>
        {showResetModal && (
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setShowResetModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#121827] p-6 sm:p-8 rounded-[2rem] w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-500 border border-brand-500/20">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Reset Password</h3>
              </div>

              {resetStep === 1 ? (
                <div className="space-y-6">
                  <p className="text-sm text-slate-400 leading-relaxed">
                    We'll send a one-time verification code to your registered email address.
                  </p>
                  <button
                    onClick={handleSendOtp}
                    disabled={resetLoading}
                    className="w-full bg-brand-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-brand-500/30 disabled:opacity-50 active:scale-95 transition-all"
                  >
                    {resetLoading ? 'Sending...' : 'Send Verification Code'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Verification Code</label>
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={resetOtp}
                      onChange={e => setResetOtp(e.target.value)}
                      className="glass-input text-sm w-full p-3.5"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showSettingsPassword ? 'text' : 'password'}
                        placeholder="Create strong password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="glass-input text-sm w-full p-3.5 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSettingsPassword(!showSettingsPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer"
                        title={showSettingsPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSettingsPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleResetPassword}
                    disabled={resetLoading}
                    className="w-full bg-brand-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-brand-500/30 mt-2 active:scale-95 transition-all"
                  >
                    {resetLoading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    onClick={() => setResetStep(1)}
                    className="w-full py-2 text-xs font-bold text-slate-400 hover:text-brand-500 transition-colors"
                  >
                    Resend Code
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CAMERA STREAM CAPTURE MODAL ───────────────────────── */}
      <AnimatePresence>
        {isCameraOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <Camera className="w-5 h-5 text-brand-500" /> Snap Profile Photo
                </h3>
                <button
                  onClick={stopCamera}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover transform -scale-x-100"
                ></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={stopCamera}
                  className="px-5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold shadow-glow transition-colors"
                >
                  Capture & Use Photo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PLAN DETAIL & FEATURES OVERLAY MODAL ─────────────── */}
      <AnimatePresence>
        {selectedPlanDetail && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#0c101d] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 relative"
            >
              {/* Top Banner with gradient & badge */}
              <div className={`p-6 rounded-2xl bg-gradient-to-r ${selectedPlanDetail.color} text-white relative overflow-hidden shadow-lg`}>
                <div className="flex items-center justify-between gap-4 relative z-10">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 text-white px-3 py-1 rounded-full border border-white/30 backdrop-blur-md">
                      {selectedPlanDetail.badge}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black mt-2 text-white flex items-center gap-2">
                      {selectedPlanDetail.name}
                      {((user?.plan || 'agency_pro').toLowerCase().includes(selectedPlanDetail.id.toLowerCase().replace('_', ''))) && (
                        <span className="text-[10px] bg-emerald-400 text-slate-950 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Current Tier
                        </span>
                      )}
                    </h2>
                    <p className="text-xs sm:text-sm text-white/90 font-medium mt-1 leading-relaxed">
                      {selectedPlanDetail.subtitle}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-3xl sm:text-4xl font-black text-white">{selectedPlanDetail.price}</div>
                    <div className="text-xs text-white/80 font-bold">{selectedPlanDetail.period || 'billing'}</div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPlanDetail(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors z-20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Full Plan Description */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Plan Overview</h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {selectedPlanDetail.desc}
                </p>
              </div>

              {/* Visual Credits Allocation Card */}
              <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-500 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Visual Credit Quota
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {selectedPlanDetail.creditsDetail}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-black text-brand-600 dark:text-brand-400 bg-brand-500/20 px-3 py-1.5 rounded-xl shrink-0">
                  {selectedPlanDetail.credits}
                </span>
              </div>

              {/* Included Features & Capabilities */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> What's Included in {selectedPlanDetail.name}
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {selectedPlanDetail.features.map((feat, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                        feat.highlighted
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-900 dark:text-white font-bold'
                          : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${feat.highlighted ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <span className="text-xs leading-relaxed">{feat.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Limitations / Tier Boundaries */}
              {selectedPlanDetail.limitations && selectedPlanDetail.limitations.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Plan Boundaries</h4>
                  <ul className="space-y-1.5">
                    {selectedPlanDetail.limitations.map((lim, i) => (
                      <li key={i} className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        {lim}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons Footer */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setSelectedPlanDetail(null)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
                >
                  Close Preview
                </button>

                {((user?.plan || 'agency_pro').toLowerCase().includes(selectedPlanDetail.id.toLowerCase().replace('_', ''))) ? (
                  <button
                    disabled
                    className="w-full sm:flex-1 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold flex items-center justify-center gap-2 cursor-default"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Current Active Plan
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setUser({ ...user, plan: selectedPlanDetail.id });
                      setPlanToast(`Successfully updated subscription tier to ${selectedPlanDetail.name}!`);
                      setTimeout(() => setPlanToast(null), 4500);
                      setSelectedPlanDetail(null);
                    }}
                    className="w-full sm:flex-1 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-extrabold shadow-lg shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" /> Select & Activate {selectedPlanDetail.name}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
};
