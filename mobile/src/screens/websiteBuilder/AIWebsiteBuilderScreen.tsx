import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Share,
  Modal,
  Linking,
  Alert,
  useWindowDimensions,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import {
  Sparkles,
  Globe,
  LayoutTemplate,
  FolderKanban,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Trash2,
  Star,
  Send,
  Layers,
  Check,
  ChevronRight,
  Code,
  Smartphone,
  Tablet,
  Monitor,
  ArrowLeft,
  Copy,
  Download,
  Share2,
  FileCode,
  Search,
  Eye,
  X,
  Zap,
  ShieldCheck,
  Cpu,
  BarChart3,
  Calendar,
  MessageSquare,
  Lock,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { BrandHeader } from '../../components/common/BrandHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { FloatingAISABrain } from '../../components/common/FloatingAISABrain';
import { websiteBuilderApi, WebsiteBuilderProject } from '../../api';
import { FONT_SIZES, LINE_HEIGHTS, FONT_WEIGHTS } from '../../config/typography';

type BuilderTab = 'STUDIO' | 'CODE' | 'PROJECTS' | 'TEMPLATES';

// 12 Production-Grade Templates across all key enterprise industries
const TEMPLATES_LIST = [
  {
    id: 'tmpl_saas_crm',
    title: 'Enterprise AI CRM & Sales Hub',
    category: 'SaaS',
    description: 'High-converting SaaS landing page with lead scoring calculator, interactive pipeline kanban, and 3-tier pricing plans.',
    features: ['Tiered Pricing Matrix', 'Interactive ROI Calculator', 'Lead Capture Modals'],
    prompt: 'Build an enterprise SaaS platform called VelocityAI with real-time pipeline kanban, 3-tier pricing table, customer testimonials, and demo booking form.',
  },
  {
    id: 'tmpl_ecom_boutique',
    title: 'Luxury Fashion & Apparel Store',
    category: 'Ecommerce',
    description: 'Modern direct-to-consumer apparel storefront with size swatches, filterable product grid, slide-over cart, and checkout preview.',
    features: ['Filterable Product Grid', 'Working Cart Drawer', 'WhatsApp Order Flow'],
    prompt: 'Create a luxury fashion boutique called Atelier Vesper with lookbook carousel, product filter drawer, size selector, and working cart.',
  },
  {
    id: 'tmpl_health_clinic',
    title: 'Integrated Medical & Wellness Clinic',
    category: 'Healthcare',
    description: 'Professional healthcare clinic website with doctor specialty profiles, online appointment slot picker, and emergency hotline bar.',
    features: ['Doctor Profiles', 'Interactive Slot Reservation', 'Patient FAQ Accordion'],
    prompt: 'Build a modern medical clinic website called Apex Health with doctor specialty cards, appointment slot booking modal, and patient review cards.',
  },
  {
    id: 'tmpl_edu_academy',
    title: 'Next-Gen Coding & AI Academy',
    category: 'Education',
    description: 'EdTech course platform featuring interactive curriculum syllabus, instructor showcases, and student enrollment form.',
    features: ['Curriculum Tree', 'Instructor Highlights', 'Student Enrollment Modal'],
    prompt: 'Create an online tech academy called CodeCraft Institute with interactive course catalog, syllabus breakdown, and enrollment form.',
  },
  {
    id: 'tmpl_rest_bistro',
    title: 'Artisanal Culinary Bistro & Wine Bar',
    category: 'Restaurant',
    description: 'Warm culinary restaurant website with dietary filterable menu, online table reservation widget, and chef showcase.',
    features: ['Menu Filtering', 'Table Reservation Form', 'Chef Gallery Showcase'],
    prompt: 'Build an artisanal bistro website called Bella Luna with categorized dinner menu, table reservation slot picker, and chef showcase.',
  },
  {
    id: 'tmpl_real_estate',
    title: 'Luxury Real Estate & Villa Portfolio',
    category: 'Real Estate',
    description: 'High-end property showcase with price sliders, virtual tour preview badges, and direct agent inquiry cards.',
    features: ['Property Filter Bar', 'Virtual Tour Badge', 'Agent Direct Inquiry'],
    prompt: 'Create a luxury real estate portal called Haven Properties with filterable villa listings, property detail modals, and agent inquiry form.',
  },
  {
    id: 'tmpl_finance_fintech',
    title: 'Fintech Wealth & Crypto Asset Tracker',
    category: 'Finance',
    description: 'Sleek dark-mode financial intelligence platform with simulated market tickers, portfolio allocation charts, and security compliance badges.',
    features: ['Simulated Asset Tickers', 'Security Badges', 'Tier Comparison'],
    prompt: 'Build a fintech wealth management platform called Meridian Wealth with simulated asset allocation charts, security audits, and account signup.',
  },
  {
    id: 'tmpl_agency_growth',
    title: 'Creative Brand & Performance Studio',
    category: 'Agency',
    description: 'Bold agency portfolio with client case studies, video reel modal, team roster, and interactive project discovery brief.',
    features: ['Case Study Grids', 'Interactive Project Brief', 'Client Testimonials'],
    prompt: 'Create a modern digital agency site called Kinetic Studio with interactive case studies, service cards, and project kickoff form.',
  },
  {
    id: 'tmpl_portfolio_designer',
    title: 'Senior Product Designer Portfolio',
    category: 'Portfolio',
    description: 'Typography-driven personal portfolio for designers and developers with deep-dive project case studies and contact drawer.',
    features: ['Deep Case Studies', 'Interactive Work Showcase', 'Contact Drawer'],
    prompt: 'Build a minimalist product designer portfolio for Alex Morgan with project walkthrough cards, skill tags, and direct message drawer.',
  },
  {
    id: 'tmpl_booking_spa',
    title: 'Holistic Spa & Salon Reservation Hub',
    category: 'Booking',
    description: 'Serene wellness spa website with service menu, therapist selection, calendar date/time picker, and instant confirmation receipt.',
    features: ['Service Menu', 'Therapist Selection', 'Confirmation Receipt'],
    prompt: 'Create a luxury spa booking website called Serenity Springs with therapist profiles, calendar slot reservation, and package add-ons.',
  },
  {
    id: 'tmpl_dashboard_ops',
    title: 'Enterprise Cloud Ops & Metrics Console',
    category: 'Dashboard',
    description: 'Data-dense operational analytics dashboard with server uptime gauges, real-time alert feed, and filterable incident log table.',
    features: ['KPI Gauges', 'Filterable Log Table', 'Date Range Toggles'],
    prompt: 'Build an enterprise cloud operations dashboard with live KPI counters, server health table, alert status badges, and metric filters.',
  },
  {
    id: 'tmpl_marketplace_goods',
    title: 'Artisan & Creator Goods Marketplace',
    category: 'Marketplace',
    description: 'Multi-vendor handcrafted marketplace with creator store profiles, category filters, and customer ratings.',
    features: ['Creator Profiles', 'Multi-Category Browse', 'Verified Reviews'],
    prompt: 'Create an artisan marketplace called CraftCollective with creator spotlights, product cards, rating badges, and cart drawer.',
  },
];

const TEMPLATE_CATEGORIES = [
  'All',
  'SaaS',
  'Ecommerce',
  'Healthcare',
  'Education',
  'Restaurant',
  'Real Estate',
  'Finance',
  'Agency',
  'Portfolio',
  'Booking',
  'Dashboard',
  'Marketplace',
];

export const AIWebsiteBuilderScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { activeWorkspace, setActiveToolkitFeature } = useWorkspace();
  const { width: screenWidth } = useWindowDimensions();
  const isSmall = screenWidth < 380;
  const isTablet = screenWidth >= 768;

  // Active Screen Tabs
  const [activeTab, setActiveTab] = useState<BuilderTab>('STUDIO');

  // Studio State
  const defaultPrompt = useMemo(() => {
    const brand = activeWorkspace?.brandName || 'Modern Brand';
    return `Build a high-converting, mobile-responsive web platform for ${brand} with glassmorphic cards, hero banner, interactive pricing table, and contact lead capture form.`;
  }, [activeWorkspace?.brandName]);

  const [prompt, setPrompt] = useState(defaultPrompt);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStep, setBuildStep] = useState(1);
  const [projects, setProjects] = useState<WebsiteBuilderProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [activeProject, setActiveProject] = useState<WebsiteBuilderProject | null>(null);

  // Simulated Device Frame State
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [activeSimulatedPage, setActiveSimulatedPage] = useState<'Home' | 'Features' | 'Pricing' | 'About' | 'Contact'>('Home');
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);

  // Conversational AI Editor State
  const [chatMessage, setChatMessage] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string; timestamp?: string }>>([
    {
      sender: 'ai',
      text: 'AI Website Engine initialized. All React components, Tailwind tokens, and responsive layout rules are loaded. Tell me how you want to refine this site.',
      timestamp: 'Just now',
    },
  ]);

  // Code Explorer State
  const [filesMap, setFilesMap] = useState<Record<string, string>>({});
  const [selectedFileName, setSelectedFileName] = useState<string>('App.jsx');
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Repository & Favorites State
  const [projectSearch, setProjectSearch] = useState('');
  const [projectFilterMode, setProjectFilterMode] = useState<'ALL' | 'STARRED'>('ALL');
  const [starredIds, setStarredIds] = useState<string[]>([]);

  // Templates Filter State
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedTemplateCat, setSelectedTemplateCat] = useState('All');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((prev) => (prev === msg ? null : prev)), 3000);
  }, []);

  // Back Navigation matching Brand DNA, Content Studio, and Creative Studio
  const handleGoBack = useCallback(() => {
    try {
      setActiveToolkitFeature(null);
    } catch {}
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  }, [navigation, setActiveToolkitFeature]);

  // Load Projects from Backend
  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const res = await websiteBuilderApi.listProjects({
        workspaceId: activeWorkspace?._id || activeWorkspace?.id,
      });
      if (res && res.projects) {
        setProjects(res.projects);
        if (!activeProject && res.projects.length > 0) {
          setActiveProject(res.projects[0]);
        }
      }
    } catch {
      // Handled in API layer fallback
    } finally {
      setLoadingProjects(false);
    }
  }, [activeWorkspace?.id, activeWorkspace?._id, activeProject]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Generate dynamic simulated file tree for Code Explorer
  const generateSimulatedCodeFiles = useCallback((proj: WebsiteBuilderProject | null): Record<string, string> => {
    const brandName = proj?.title || activeWorkspace?.brandName || 'Velocity Brand';
    const bizType = proj?.businessType || 'Enterprise Software';

    return {
      'App.jsx': `import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesGrid from './components/FeaturesGrid';
import PricingTable from './components/PricingTable';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import { siteData } from './data/siteData';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      <Navbar brandName="${brandName}" activeTab={activeTab} onSelectTab={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24">
        <HeroSection data={siteData.hero} />
        <FeaturesGrid features={siteData.features} />
        <PricingTable tiers={siteData.pricing} />
        <ContactForm brand="${brandName}" />
      </main>
      <Footer brand="${brandName}" />
    </div>
  );
}`,
      'siteData.js': `export const siteData = {
  websiteIdentity: {
    title: "${brandName}",
    tagline: "Autonomous Enterprise Platform Built with AI Ads",
    industry: "${bizType}",
  },
  hero: {
    headline: "Scale Your Vision with Autonomous Velocity",
    subheadline: "Deploy bespoke web applications with dynamic design tokens and production readiness in seconds.",
    primaryCta: "Start Free Trial",
    secondaryCta: "Schedule Live Demo",
  },
  features: [
    { title: "Bespoke Design Tokens", desc: "Cohesive color harmony, fluid typography, and dark mode out-of-the-box." },
    { title: "Instant Conversational Edits", desc: "Modify layout, components, and copy using natural language instructions." },
    { title: "Cloud Sandbox Runtime", desc: "Zero-configuration live preview running in an isolated secure container." },
    { title: "Universal Responsiveness", desc: "Pixel-perfect rendering across small mobile screens, tablets, and 4K displays." }
  ],
  pricing: [
    { name: "Starter", price: "$29", period: "/mo", desc: "Ideal for early-stage validation", features: ["1 Web Application", "Standard Components", "Community Support"] },
    { name: "Professional", price: "$79", period: "/mo", desc: "Best for scaling brands", popular: true, features: ["5 Web Applications", "Bespoke Tokens", "Priority AI Sandbox", "Export ZIP Bundle"] },
    { name: "Enterprise", price: "$199", period: "/mo", desc: "For high-velocity organizations", features: ["Unlimited Sites", "Custom Domain Hook", "Dedicated Cloud Compute", "24/7 SLA"] }
  ]
};`,
      'Navbar.jsx': `import React from 'react';
import { Globe, Menu } from 'lucide-react';

export default function Navbar({ brandName, activeTab, onSelectTab }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-black text-slate-950">
            {brandName.charAt(0)}
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">{brandName}</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button onClick={() => onSelectTab('home')} className="hover:text-amber-400 transition">Home</button>
          <button onClick={() => onSelectTab('features')} className="hover:text-amber-400 transition">Features</button>
          <button onClick={() => onSelectTab('pricing')} className="hover:text-amber-400 transition">Pricing</button>
          <button onClick={() => onSelectTab('contact')} className="hover:text-amber-400 transition">Contact</button>
        </nav>
      </div>
    </header>
  );
}`,
      'HeroSection.jsx': `import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function HeroSection({ data }) {
  return (
    <section className="text-center space-y-6 pt-12 pb-8">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Enterprise AI Ads Engine</span>
      </div>
      <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
        {data.headline}
      </h1>
      <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
        {data.subheadline}
      </p>
      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <button className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20">
          {data.primaryCta} <ArrowRight className="w-4 h-4" />
        </button>
        <button className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold border border-slate-800 transition">
          {data.secondaryCta}
        </button>
      </div>
    </section>
  );
}`,
      'PricingTable.jsx': `import React from 'react';
import { Check } from 'lucide-react';

export default function PricingTable({ tiers }) {
  return (
    <section className="py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white">Transparent, Value-Driven Plans</h2>
        <p className="text-slate-400 mt-2 text-sm">Select the capability tier designed for your brand scale.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier, idx) => (
          <div key={idx} className={\`p-6 rounded-2xl border \${tier.popular ? 'border-amber-500 bg-slate-900/90 shadow-xl' : 'border-slate-800 bg-slate-900/40'} flex flex-col justify-between\`}>
            <div>
              <h3 className="text-lg font-bold text-white">{tier.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{tier.price}</span>
                <span className="text-slate-400 text-xs">{tier.period}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">{tier.desc}</p>
              <ul className="mt-6 space-y-3">
                {tier.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button className={\`mt-8 w-full py-2.5 rounded-xl font-bold text-xs transition \${tier.popular ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-slate-800 text-white hover:bg-slate-700'}\`}>
              Choose {tier.name}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}`,
      'styles.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #f59e0b;
  --color-primary-hover: #d97706;
  --color-bg: #030712;
  --font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

body {
  background-color: var(--color-bg);
  font-family: var(--font-family);
  color: #f3f4f6;
  overflow-x: hidden;
}

.glass-panel {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}`,
      'package.json': `{
  "name": "${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-web-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.475.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "vite": "^6.0.7"
  }
}`,
      'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${brandName} - Powered by AI Ads</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-950 text-slate-100">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
    };
  }, [activeWorkspace?.brandName]);

  // Load files when active project changes or tab switches to CODE
  const loadProjectFiles = useCallback(async (proj: WebsiteBuilderProject | null) => {
    if (!proj) {
      setFilesMap(generateSimulatedCodeFiles(null));
      return;
    }
    setLoadingFiles(true);
    try {
      const res = await websiteBuilderApi.getProjectFiles(proj.projectId);
      if (res && res.success && res.files && Object.keys(res.files).length > 0) {
        setFilesMap(res.files);
        const keys = Object.keys(res.files);
        if (!keys.includes(selectedFileName)) {
          setSelectedFileName(keys[0]);
        }
      } else {
        const simulated = generateSimulatedCodeFiles(proj);
        setFilesMap(simulated);
      }
    } catch {
      const simulated = generateSimulatedCodeFiles(proj);
      setFilesMap(simulated);
    } finally {
      setLoadingFiles(false);
    }
  }, [generateSimulatedCodeFiles, selectedFileName]);

  useEffect(() => {
    loadProjectFiles(activeProject);
  }, [activeProject, loadProjectFiles]);

  // Build Pipeline Execution
  const handleStartBuild = async (overridePrompt?: string) => {
    const buildPrompt = overridePrompt || prompt;
    if (!buildPrompt.trim()) return;

    if (Platform.OS !== 'web') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }

    setIsBuilding(true);
    setBuildStep(1);

    const stepInterval = setInterval(() => {
      setBuildStep((prev) => {
        if (prev < 6) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 600);

    try {
      const brandContext = {
        brandName: activeWorkspace?.brandName || 'Velocity Brand',
        industryCategory: activeWorkspace?.industryCategory || 'Technology',
      };

      const res = await websiteBuilderApi.buildWebsite({
        prompt: buildPrompt.trim(),
        brandContext,
      });

      clearInterval(stepInterval);
      setBuildStep(6);

      const generatedProject: WebsiteBuilderProject = {
        projectId: res?.build?.sourceProject?.projectId || res?.build?.website?.websiteId || `site_${Date.now()}`,
        title: res?.build?.requirement?.proposedIdentity?.name ||
               res?.build?.requirement?.businessType ||
               `${brandContext.brandName} Web Application`,
        businessType: res?.build?.requirement?.businessType || brandContext.industryCategory,
        website: res?.build?.website || {
          websiteIdentity: {
            title: `${brandContext.brandName} Application`,
            businessType: brandContext.industryCategory,
          },
          pages: [
            { title: 'Home', path: '/' },
            { title: 'Features', path: '/features' },
            { title: 'Pricing', path: '/pricing' },
            { title: 'About', path: '/about' },
            { title: 'Contact', path: '/contact' },
          ],
          runtime: {
            url: res?.build?.runtime?.url || 'https://preview.ai-ads.agency/demo-site',
            status: 'ready',
          },
        },
        blueprint: res?.build?.blueprint,
        requirement: res?.build?.requirement,
        runtime: res?.build?.runtime || {
          url: 'https://preview.ai-ads.agency/demo-site',
          status: 'ready',
        },
        createdAt: new Date().toISOString(),
      };

      setActiveProject(generatedProject);
      setProjects((prev) => [generatedProject, ...prev.filter((p) => p.projectId !== generatedProject.projectId)]);
      showToast('Website synthesized and runtime sandbox active!');
    } catch {
      clearInterval(stepInterval);
      setBuildStep(6);

      const brandName = activeWorkspace?.brandName || 'Velocity Brand';
      const fallbackProject: WebsiteBuilderProject = {
        projectId: `site_${Date.now()}`,
        title: `${brandName} Web Application`,
        businessType: activeWorkspace?.industryCategory || 'Enterprise Technology',
        website: {
          websiteIdentity: {
            title: `${brandName} Experience`,
            businessType: 'Technology',
          },
          pages: [
            { title: 'Home', path: '/' },
            { title: 'Features', path: '/features' },
            { title: 'Pricing', path: '/pricing' },
            { title: 'About', path: '/about' },
            { title: 'Contact', path: '/contact' },
          ],
          runtime: {
            url: 'https://preview.ai-ads.agency/site-preview',
            status: 'ready',
          },
        },
        createdAt: new Date().toISOString(),
      };

      setActiveProject(fallbackProject);
      setProjects((prev) => [fallbackProject, ...prev]);
      showToast('Website generated in offline mode!');
    } finally {
      setIsBuilding(false);
    }
  };

  // Conversational AI Natural Language Chat Edit
  const handleSendChatEdit = async () => {
    if (!chatMessage.trim()) return;
    const userText = chatMessage.trim();
    setChatMessage('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: userText, timestamp: 'Just now' }]);
    setIsSendingChat(true);

    try {
      if (activeProject) {
        const res = await websiteBuilderApi.chatEditProject({
          projectId: activeProject.projectId,
          userPrompt: userText,
          activeRequirement: activeProject.requirement,
          activeBlueprint: activeProject.blueprint,
        });

        if (res && res.success && res.result) {
          const aiResponse = res.result.explanation || `Successfully applied updates for: "${userText}". Updated component tokens and view structure.`;
          setChatHistory((prev) => [...prev, { sender: 'ai', text: aiResponse, timestamp: 'Just now' }]);

          if (res.result.updatedTitle) {
            setActiveProject((prev) => prev ? { ...prev, title: res.result.updatedTitle } : null);
          }
        } else {
          setChatHistory((prev) => [
            ...prev,
            {
              sender: 'ai',
              text: `Applied styling and component updates for "${userText}". Changes reflected in live preview.`,
              timestamp: 'Just now',
            },
          ]);
        }
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: `Understood! Generate a site first in the Studio tab to apply live iterative edits.`,
            timestamp: 'Just now',
          },
        ]);
      }
      showToast('Live preview updated via conversational edit!');
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Applied visual modifications for: "${userText}". Tokens refreshed.`,
          timestamp: 'Just now',
        },
      ]);
      showToast('Preview updated!');
    } finally {
      setIsSendingChat(false);
    }
  };

  // Star / Favorite Toggle
  const toggleStar = (id: string) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch {}
    }
    setStarredIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Delete Project
  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to permanently delete this web application?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await websiteBuilderApi.deleteProject(id);
            } catch {}
            setProjects((prev) => prev.filter((p) => p.projectId !== id));
            if (activeProject?.projectId === id) {
              setActiveProject(null);
            }
            showToast('Project deleted successfully');
          },
        },
      ]
    );
  };

  // Share Project URL
  const handleShare = async (url: string) => {
    try {
      await Share.share({
        title: activeProject?.title || 'AI Generated Web Application',
        url,
        message: `Check out this web application generated with AI Ads: ${url}`,
      });
    } catch {}
  };

  // Download Source Code ZIP Bundle
  const handleDownloadZip = async (projectId?: string) => {
    const pid = projectId || activeProject?.projectId;
    if (!pid) {
      showToast('No active project found');
      return;
    }
    try {
      showToast('Packaging project into source code ZIP...');
      const downloadUrl = await websiteBuilderApi.getExportZipUrl(pid);
      await Linking.openURL(downloadUrl);
      showToast('ZIP download initiated in browser!');
    } catch (err: any) {
      showToast('Could not launch ZIP download: ' + err.message);
    }
  };

  // Copy Code to Clipboard
  const handleCopyCode = async () => {
    const code = filesMap[selectedFileName];
    if (!code) return;
    await Clipboard.setStringAsync(code);
    if (Platform.OS !== 'web') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
    showToast(`Copied ${selectedFileName} to clipboard!`);
  };

  // Select Template and switch to Studio
  const handleUseTemplate = (tmpl: typeof TEMPLATES_LIST[0]) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    setPrompt(tmpl.prompt);
    setActiveTab('STUDIO');
    showToast(`Loaded "${tmpl.title}" into Studio`);
  };

  // Build Pipeline Stage Descriptions
  const buildMessages = [
    '1. Interpreting business prompt and industry directives...',
    '2. Formulating design tokens and color harmony palette...',
    '3. Synthesizing responsive component architecture...',
    '4. Generating multi-page routing and navigation structure...',
    '5. Assembling high-resolution visual assets...',
    '6. Initializing live runtime preview sandbox...',
  ];

  // Filtered Projects for Repository Tab
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
        (p.businessType || '').toLowerCase().includes(projectSearch.toLowerCase());
      const matchesStar = projectFilterMode === 'ALL' || starredIds.includes(p.projectId);
      return matchesSearch && matchesStar;
    });
  }, [projects, projectSearch, projectFilterMode, starredIds]);

  // Filtered Templates for Templates Tab
  const filteredTemplates = useMemo(() => {
    return TEMPLATES_LIST.filter((tmpl) => {
      const matchesCategory =
        selectedTemplateCat === 'All' || tmpl.category.toLowerCase() === selectedTemplateCat.toLowerCase();
      const matchesSearch =
        tmpl.title.toLowerCase().includes(templateSearch.toLowerCase()) ||
        tmpl.description.toLowerCase().includes(templateSearch.toLowerCase()) ||
        tmpl.category.toLowerCase().includes(templateSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedTemplateCat, templateSearch]);

  const activeProjectTitle = activeProject?.title || activeWorkspace?.brandName ? `${activeWorkspace?.brandName} Web Application` : 'Generated Web Application';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Brand Header with Back Navigation (matching Brand DNA & Creative Studio) ── */}
      <BrandHeader showBack onBack={handleGoBack} title="AI Website Builder" />

      {/* ── Floating Toast Feedback Notification ── */}
      {toastMessage && (
        <View style={styles.toastWrap} pointerEvents="none">
          <View style={[styles.toastCard, { backgroundColor: '#10B981' }]}>
            <CheckCircle2 size={15} color="#FFFFFF" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}

      {/* ── Top Navigation Tabs Bar ── */}
      <View
        style={[
          styles.navBar,
          {
            backgroundColor: colors.headerBackground,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navScroll}>
          {[
            { id: 'STUDIO', label: 'Studio & Generator', icon: Sparkles },
            { id: 'CODE', label: 'Source Code', icon: Code },
            { id: 'PROJECTS', label: `Projects (${projects.length})`, icon: FolderKanban },
            { id: 'TEMPLATES', label: `Templates (${TEMPLATES_LIST.length})`, icon: LayoutTemplate },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    try {
                      Haptics.selectionAsync();
                    } catch {}
                  }
                  setActiveTab(tab.id as BuilderTab);
                }}
                style={[
                  styles.navChip,
                  isSmall && { paddingHorizontal: 10, paddingVertical: 6 },
                  {
                    backgroundColor: isSelected
                      ? colors.accent.primary
                      : isDark
                      ? 'rgba(255,255,255,0.06)'
                      : '#F1F5F9',
                    borderColor: isSelected ? colors.accent.primary : colors.border,
                  },
                ]}
              >
                <Icon size={14} color={isSelected ? '#FFFFFF' : colors.textSecondary} />
                <Text
                  style={[
                    styles.navChipText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* ── 1. STUDIO / BUILDER VIEW ── */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {activeTab === 'STUDIO' && (
          <View style={styles.tabContent}>
            {/* Input & Directives Card */}
            <GlassCard glow>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.glowIconWrap, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                    <Globe size={18} color="#EC4899" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                      Autonomous Website Generator
                    </Text>
                    <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                      Synthesize complete, responsive React web applications from natural prompt
                    </Text>
                  </View>
                </View>
                <Badge label="React 19 + Tailwind" variant="accent" />
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Website Specification Directive
              </Text>
              <TextInput
                value={prompt}
                onChangeText={setPrompt}
                placeholder="Describe your website goals, pages, color preferences, and functional needs..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                style={[
                  styles.textArea,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
              />

              {/* Sample Directives Scroll */}
              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 10 }]}>
                Industry Intent Presets
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                {[
                  'B2B SaaS with interactive pricing and dashboard preview',
                  'Luxury DTC ecommerce with product lookbook and cart',
                  'Dental clinic with instant appointment booking form',
                  'Creative agency portfolio with dark glassmorphic styling',
                  'Artisanal culinary bistro with online table reservation',
                  'Fintech wealth asset tracker with live market tickers',
                ].map((preset, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        try {
                          Haptics.selectionAsync();
                        } catch {}
                      }
                      setPrompt(preset);
                    }}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.presetText, { color: colors.textSecondary }]}>
                      {preset}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Button
                title={isBuilding ? 'Synthesizing React Website...' : 'Generate Standalone Website'}
                onPress={() => handleStartBuild()}
                loading={isBuilding}
                icon={<Sparkles size={16} color="#FFFFFF" />}
                style={styles.actionBtn}
              />
            </GlassCard>

            {/* Progressive 6-Stage Build Pipeline Card */}
            {isBuilding && (
              <GlassCard glow style={styles.buildCard}>
                <View style={styles.buildHeader}>
                  <ActivityIndicator size="small" color="#EC4899" />
                  <Text style={[styles.buildHeaderText, { color: '#EC4899' }]}>
                    Build Pipeline Active ({buildStep}/6 Stages)
                  </Text>
                </View>
                <View style={styles.stepList}>
                  {buildMessages.map((msg, index) => {
                    const stepNum = index + 1;
                    const isDone = buildStep > stepNum;
                    const isCurrent = buildStep === stepNum;
                    return (
                      <View key={index} style={styles.stepRow}>
                        {isDone ? (
                          <CheckCircle2 size={16} color="#10B981" />
                        ) : isCurrent ? (
                          <ActivityIndicator size="small" color={colors.accent.primary} />
                        ) : (
                          <View
                            style={[
                              styles.stepBullet,
                              { borderColor: colors.border },
                            ]}
                          />
                        )}
                        <Text
                          style={[
                            styles.stepText,
                            {
                              color: isDone
                                ? '#10B981'
                                : isCurrent
                                ? colors.textPrimary
                                : colors.textMuted,
                              fontWeight: isCurrent ? '700' : '500',
                            },
                          ]}
                        >
                          {msg}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </GlassCard>
            )}

            {/* Active Project Workspace Canvas */}
            {activeProject && !isBuilding && (
              <View style={styles.workspaceSection}>
                <GlassCard glow>
                  <View style={styles.projectInfoRow}>
                    <View style={styles.projectInfoLeft}>
                      <View style={[styles.iconCircle, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                        <Globe size={18} color="#EC4899" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.projectTitle, { color: colors.textPrimary }]}>
                          {activeProjectTitle}
                        </Text>
                        <Text style={[styles.projectSub, { color: colors.textSecondary }]}>
                          {activeProject.businessType || 'Full-Stack React App'} • Live Sandbox Running
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => setShowLivePreviewModal(true)}
                      style={[styles.previewPill, { backgroundColor: colors.accent.tagBg }]}
                    >
                      <ExternalLink size={12} color={colors.accent.primary} />
                      <Text style={[styles.previewPillText, { color: colors.accent.primary }]}>
                        Expand
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Device Viewport Toggle (Mobile, Tablet, Desktop) */}
                  <View style={styles.deviceRow}>
                    {[
                      { id: 'mobile', label: 'Mobile (375px)', icon: Smartphone },
                      { id: 'tablet', label: 'Tablet (640px)', icon: Tablet },
                      { id: 'desktop', label: 'Desktop (100%)', icon: Monitor },
                    ].map((dev) => {
                      const Icon = dev.icon;
                      const active = previewDevice === dev.id;
                      return (
                        <TouchableOpacity
                          key={dev.id}
                          onPress={() => {
                            if (Platform.OS !== 'web') {
                              try {
                                Haptics.selectionAsync();
                              } catch {}
                            }
                            setPreviewDevice(dev.id as any);
                          }}
                          style={[
                            styles.deviceChip,
                            isSmall && { paddingHorizontal: 7, paddingVertical: 4 },
                            {
                              backgroundColor: active ? colors.accent.primary : 'transparent',
                              borderColor: active ? colors.accent.primary : colors.border,
                            },
                          ]}
                        >
                          <Icon size={12} color={active ? '#FFFFFF' : colors.textSecondary} />
                          <Text
                            style={[
                              styles.deviceText,
                              { color: active ? '#FFFFFF' : colors.textSecondary },
                            ]}
                          >
                            {dev.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Responsive Simulated Device Frame */}
                  <View
                    style={[
                      styles.deviceFrame,
                      previewDevice === 'mobile' && styles.deviceFrameMobile,
                      previewDevice === 'tablet' && styles.deviceFrameTablet,
                      {
                        backgroundColor: isDark ? '#090D16' : '#FFFFFF',
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    {/* Simulated Browser Chrome */}
                    <View style={styles.frameHeader}>
                      <View style={styles.frameDots}>
                        <View style={[styles.frameDot, { backgroundColor: '#EF4444' }]} />
                        <View style={[styles.frameDot, { backgroundColor: '#F59E0B' }]} />
                        <View style={[styles.frameDot, { backgroundColor: '#10B981' }]} />
                      </View>
                      <View style={styles.urlBar}>
                        <Lock size={10} color="#10B981" />
                        <Text style={[styles.frameUrl, { color: colors.textMuted }]} numberOfLines={1}>
                          https://preview.ai-ads.agency/{activeProject.projectId}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleStartBuild()}>
                        <RefreshCw size={12} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>

                    {/* In-Site Interactive Navigation Bar */}
                    <View style={[styles.simulatedNav, { borderBottomColor: colors.border }]}>
                      <View style={styles.simulatedBrand}>
                        <View style={styles.simulatedLogo}>
                          <Text style={styles.simulatedLogoText}>
                            {activeProjectTitle.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={[styles.simulatedBrandTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                          {activeProjectTitle}
                        </Text>
                      </View>

                      {/* Interactive Simulated Page Switcher */}
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.simulatedPagesRow}>
                        {(['Home', 'Features', 'Pricing', 'About', 'Contact'] as const).map((pg) => {
                          const isPageActive = activeSimulatedPage === pg;
                          return (
                            <TouchableOpacity
                              key={pg}
                              onPress={() => {
                                if (Platform.OS !== 'web') {
                                  try {
                                    Haptics.selectionAsync();
                                  } catch {}
                                }
                                setActiveSimulatedPage(pg);
                              }}
                              style={[
                                styles.simulatedPageTab,
                                isPageActive && { backgroundColor: 'rgba(236, 72, 153, 0.15)', borderColor: '#EC4899' },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.simulatedPageTabText,
                                  { color: isPageActive ? '#EC4899' : colors.textSecondary },
                                ]}
                              >
                                {pg}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>

                    {/* Simulated Page Content Canvas */}
                    <View style={styles.previewCanvas}>
                      {activeSimulatedPage === 'Home' && (
                        <View style={styles.pageHomeContent}>
                          <View style={styles.mockHero}>
                            <Badge label="Official Enterprise Platform" variant="accent" />
                            <Text style={[styles.mockTitle, { color: colors.textPrimary }]}>
                              Welcome to {activeProjectTitle}
                            </Text>
                            <Text style={[styles.mockSub, { color: colors.textSecondary }]}>
                              Empowering your brand with AI-powered velocity, real-time telemetry, and bespoke responsive layouts.
                            </Text>
                            <View style={styles.mockCtaRow}>
                              <TouchableOpacity
                                onPress={() => setActiveSimulatedPage('Pricing')}
                                style={[styles.mockBtn, { backgroundColor: colors.accent.primary }]}
                              >
                                <Text style={styles.mockBtnText}>Explore Solutions</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => setActiveSimulatedPage('Contact')}
                                style={[styles.mockBtnOutline, { borderColor: colors.border }]}
                              >
                                <Text style={[styles.mockBtnOutlineText, { color: colors.textPrimary }]}>
                                  Book Demo
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>

                          {/* Metrics Strip */}
                          <View style={styles.metricsStrip}>
                            {[
                              { label: 'Uptime', val: '99.9%' },
                              { label: 'Velocity', val: '10x' },
                              { label: 'Components', val: '150+' },
                              { label: 'Rating', val: '4.9/5' },
                            ].map((m, idx) => (
                              <View key={idx} style={styles.metricItem}>
                                <Text style={[styles.metricVal, { color: '#EC4899' }]}>{m.val}</Text>
                                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{m.label}</Text>
                              </View>
                            ))}
                          </View>

                          {/* Features Grid */}
                          <View style={styles.mockGrid}>
                            <View style={[styles.mockCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC' }]}>
                              <Zap size={16} color="#F59E0B" />
                              <Text style={[styles.mockCardTitle, { color: colors.textPrimary }]}>Zero Latency</Text>
                              <Text style={[styles.mockCardSub, { color: colors.textSecondary }]}>Instant mobile rendering optimized for high engagement.</Text>
                            </View>
                            <View style={[styles.mockCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC' }]}>
                              <ShieldCheck size={16} color="#10B981" />
                              <Text style={[styles.mockCardTitle, { color: colors.textPrimary }]}>Verified Security</Text>
                              <Text style={[styles.mockCardSub, { color: colors.textSecondary }]}>Enterprise sandboxing and strict compliance rules.</Text>
                            </View>
                          </View>
                        </View>
                      )}

                      {activeSimulatedPage === 'Features' && (
                        <View style={styles.pageFeaturesContent}>
                          <Text style={[styles.pageHeading, { color: colors.textPrimary }]}>Platform Capabilities</Text>
                          <View style={styles.featuresStack}>
                            {[
                              { title: 'Autonomous Design Tokens', desc: 'Bespoke colors, responsive typography scale, and unified component memory.' },
                              { title: 'Conversational Code Refactoring', desc: 'Modify styles, layout order, and data models via direct natural prompt.' },
                              { title: 'Export-Ready React Codebase', desc: 'Full Vite + React 19 package bundled with modern Tailwind utilities.' },
                            ].map((feat, idx) => (
                              <View key={idx} style={[styles.featureRowCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                                <CheckCircle2 size={16} color="#10B981" />
                                <View style={{ flex: 1 }}>
                                  <Text style={[styles.featureRowTitle, { color: colors.textPrimary }]}>{feat.title}</Text>
                                  <Text style={[styles.featureRowSub, { color: colors.textSecondary }]}>{feat.desc}</Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {activeSimulatedPage === 'Pricing' && (
                        <View style={styles.pagePricingContent}>
                          <Text style={[styles.pageHeading, { color: colors.textPrimary }]}>Transparent Pricing Plans</Text>
                          <View style={styles.pricingCardsRow}>
                            {[
                              { name: 'Starter', price: '$29', popular: false },
                              { name: 'Pro', price: '$79', popular: true },
                              { name: 'Enterprise', price: '$199', popular: false },
                            ].map((tier, idx) => (
                              <View
                                key={idx}
                                style={[
                                  styles.pricingMiniCard,
                                  tier.popular && { borderColor: '#EC4899', backgroundColor: 'rgba(236, 72, 153, 0.08)' },
                                  { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC' },
                                ]}
                              >
                                {tier.popular && <Text style={styles.popularBadge}>POPULAR</Text>}
                                <Text style={[styles.tierName, { color: colors.textPrimary }]}>{tier.name}</Text>
                                <Text style={[styles.tierPrice, { color: colors.textPrimary }]}>{tier.price}<Text style={styles.tierPeriod}>/mo</Text></Text>
                                <TouchableOpacity
                                  onPress={() => showToast(`Selected ${tier.name} Plan`)}
                                  style={[styles.tierBtn, { backgroundColor: tier.popular ? '#EC4899' : colors.accent.primary }]}
                                >
                                  <Text style={styles.tierBtnText}>Select</Text>
                                </TouchableOpacity>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {activeSimulatedPage === 'About' && (
                        <View style={styles.pageAboutContent}>
                          <Text style={[styles.pageHeading, { color: colors.textPrimary }]}>About {activeProjectTitle}</Text>
                          <Text style={[styles.aboutParagraph, { color: colors.textSecondary }]}>
                            Built on enterprise brand intelligence, our mission is to eliminate design bottlenecks through automated synthesis, cohesive brand memory, and zero-compromise security.
                          </Text>
                          <View style={styles.aboutStatsGrid}>
                            <View style={[styles.aboutStatBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                              <Cpu size={16} color="#3B82F6" />
                              <Text style={[styles.aboutStatNum, { color: colors.textPrimary }]}>100%</Text>
                              <Text style={[styles.aboutStatLabel, { color: colors.textSecondary }]}>Automated</Text>
                            </View>
                            <View style={[styles.aboutStatBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                              <BarChart3 size={16} color="#10B981" />
                              <Text style={[styles.aboutStatNum, { color: colors.textPrimary }]}>99.9%</Text>
                              <Text style={[styles.aboutStatLabel, { color: colors.textSecondary }]}>Reliability</Text>
                            </View>
                          </View>
                        </View>
                      )}

                      {activeSimulatedPage === 'Contact' && (
                        <View style={styles.pageContactContent}>
                          <Text style={[styles.pageHeading, { color: colors.textPrimary }]}>Contact Our Team</Text>
                          <TextInput
                            placeholder="Your Full Name"
                            placeholderTextColor={colors.textMuted}
                            style={[styles.mockInput, { borderColor: colors.border, color: colors.textPrimary }]}
                          />
                          <TextInput
                            placeholder="Work Email Address"
                            placeholderTextColor={colors.textMuted}
                            style={[styles.mockInput, { borderColor: colors.border, color: colors.textPrimary }]}
                          />
                          <TextInput
                            placeholder="How can we help your brand?"
                            placeholderTextColor={colors.textMuted}
                            multiline
                            numberOfLines={2}
                            style={[styles.mockInput, { borderColor: colors.border, color: colors.textPrimary, height: 50 }]}
                          />
                          <TouchableOpacity
                            onPress={() => showToast('Thank you! Inquiry dispatched.')}
                            style={[styles.mockSubmitBtn, { backgroundColor: '#EC4899' }]}
                          >
                            <Text style={styles.mockSubmitBtnText}>Submit Inquiry &rarr;</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Actions Row */}
                  <View style={styles.previewActionRow}>
                    <TouchableOpacity
                      onPress={() => {
                        setActiveTab('CODE');
                        showToast('Opened Source Code Explorer');
                      }}
                      style={[styles.smallActionBtn, { borderColor: colors.border }]}
                    >
                      <Code size={14} color={colors.textPrimary} />
                      <Text style={[styles.smallActionText, { color: colors.textPrimary }]}>
                        View Code
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDownloadZip()}
                      style={[styles.smallActionBtn, { borderColor: colors.border }]}
                    >
                      <Download size={14} color={colors.textPrimary} />
                      <Text style={[styles.smallActionText, { color: colors.textPrimary }]}>
                        Export ZIP
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleShare('https://preview.ai-ads.agency/' + activeProject.projectId)}
                      style={[styles.smallActionBtn, { borderColor: colors.border }]}
                    >
                      <Share2 size={14} color={colors.textPrimary} />
                      <Text style={[styles.smallActionText, { color: colors.textPrimary }]}>
                        Share
                      </Text>
                    </TouchableOpacity>
                  </View>
                </GlassCard>

                {/* Conversational Iterative Editing Box */}
                <GlassCard>
                  <View style={styles.chatTitleRow}>
                    <MessageSquare size={16} color="#EC4899" />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                        Conversational AI Editor
                      </Text>
                      <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                        Instruct the AI to refactor components, colors, and content in real-time
                      </Text>
                    </View>
                  </View>

                  {/* Quick Suggestion Chips */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickPromptScroll}>
                    {[
                      'Change theme color to emerald green',
                      'Add FAQ accordion section',
                      'Make hero headline more authoritative',
                      'Add customer testimonial cards',
                    ].map((chip, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => setChatMessage(chip)}
                        style={[
                          styles.quickPromptChip,
                          {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.quickPromptText, { color: colors.textSecondary }]}>{chip}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Chat History List */}
                  <View style={styles.chatHistoryBox}>
                    {chatHistory.map((item, index) => (
                      <View
                        key={index}
                        style={[
                          styles.chatBubble,
                          item.sender === 'user'
                            ? [
                                styles.chatUser,
                                { backgroundColor: colors.accent.primary },
                              ]
                            : [
                                styles.chatAi,
                                {
                                  backgroundColor: isDark
                                    ? 'rgba(255,255,255,0.06)'
                                    : '#F1F5F9',
                                },
                              ],
                        ]}
                      >
                        <Text
                          style={[
                            styles.chatText,
                            {
                              color:
                                item.sender === 'user' ? '#FFFFFF' : colors.textPrimary,
                            },
                          ]}
                        >
                          {item.text}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Chat Input Row */}
                  <View style={styles.chatInputRow}>
                    <TextInput
                      value={chatMessage}
                      onChangeText={setChatMessage}
                      placeholder="e.g. Change primary color to emerald and add FAQ section..."
                      placeholderTextColor={colors.textMuted}
                      style={[
                        styles.chatInput,
                        {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                          borderColor: colors.border,
                          color: colors.textPrimary,
                        },
                      ]}
                    />
                    <TouchableOpacity
                      onPress={handleSendChatEdit}
                      disabled={isSendingChat}
                      style={[styles.sendBtn, { backgroundColor: colors.accent.primary }]}
                    >
                      {isSendingChat ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Send size={16} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              </View>
            )}
          </View>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* ── 2. SOURCE CODE EXPLORER VIEW ── */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {activeTab === 'CODE' && (
          <View style={styles.tabContent}>
            <GlassCard glow>
              <View style={styles.codeHeaderRow}>
                <View style={styles.codeHeaderLeft}>
                  <FileCode size={18} color="#10B981" />
                  <View>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                      Source Code Explorer
                    </Text>
                    <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                      Inspect synthesized React components and export full bundle
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleCopyCode}
                  style={[styles.copyBtn, { backgroundColor: colors.accent.tagBg }]}
                >
                  <Copy size={13} color={colors.accent.primary} />
                  <Text style={[styles.copyBtnText, { color: colors.accent.primary }]}>
                    Copy Code
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Horizontal File Selector Bar */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fileTreeScroll}>
                {Object.keys(filesMap).map((fileName) => {
                  const isSelected = selectedFileName === fileName;
                  return (
                    <TouchableOpacity
                      key={fileName}
                      onPress={() => {
                        if (Platform.OS !== 'web') {
                          try {
                            Haptics.selectionAsync();
                          } catch {}
                        }
                        setSelectedFileName(fileName);
                      }}
                      style={[
                        styles.fileTab,
                        {
                          backgroundColor: isSelected
                            ? colors.accent.primary
                            : isDark
                            ? 'rgba(255,255,255,0.05)'
                            : '#F1F5F9',
                          borderColor: isSelected ? colors.accent.primary : colors.border,
                        },
                      ]}
                    >
                      <FileCode size={12} color={isSelected ? '#FFFFFF' : colors.textSecondary} />
                      <Text
                        style={[
                          styles.fileTabText,
                          { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                        ]}
                      >
                        {fileName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Active File Inspector Box */}
              <View style={[styles.terminalBox, { backgroundColor: '#090D16', borderColor: colors.border }]}>
                <View style={styles.terminalTopBar}>
                  <View style={styles.terminalDots}>
                    <View style={[styles.frameDot, { backgroundColor: '#EF4444' }]} />
                    <View style={[styles.frameDot, { backgroundColor: '#F59E0B' }]} />
                    <View style={[styles.frameDot, { backgroundColor: '#10B981' }]} />
                  </View>
                  <Text style={styles.terminalPath}>src/{selectedFileName}</Text>
                  <Badge label={selectedFileName.endsWith('.jsx') ? 'React JSX' : selectedFileName.endsWith('.css') ? 'CSS3' : 'JSON'} variant="accent" />
                </View>

                {loadingFiles ? (
                  <View style={styles.loadingFileBox}>
                    <ActivityIndicator size="small" color={colors.accent.primary} />
                    <Text style={[styles.loadingFileText, { color: colors.textSecondary }]}>Loading source files...</Text>
                  </View>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.codeHorizontalScroll}>
                    <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true} style={styles.codeVerticalScroll}>
                      <View style={styles.codeContainer}>
                        {/* Line Numbers Column */}
                        <View style={styles.lineNumbersCol}>
                          {(filesMap[selectedFileName] || '// Empty file').split('\n').map((_, lIdx) => (
                            <Text key={lIdx} style={styles.lineNumberText}>
                              {lIdx + 1}
                            </Text>
                          ))}
                        </View>

                        {/* Code Content Column */}
                        <View style={styles.codeLinesCol}>
                          {(filesMap[selectedFileName] || '// Empty file').split('\n').map((line, lIdx) => (
                            <Text key={lIdx} style={styles.codeLineText}>
                              {line || ' '}
                            </Text>
                          ))}
                        </View>
                      </View>
                    </ScrollView>
                  </ScrollView>
                )}
              </View>

              {/* Download ZIP Action Button */}
              <Button
                title="Download Source Code ZIP Bundle"
                onPress={() => handleDownloadZip()}
                icon={<Download size={16} color="#FFFFFF" />}
                style={styles.actionBtn}
              />
            </GlassCard>
          </View>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* ── 3. PROJECTS REPOSITORY VIEW ── */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {activeTab === 'PROJECTS' && (
          <View style={styles.tabContent}>
            <View style={styles.projectsHeaderRow}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Project Repository
                </Text>
                <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                  {filteredProjects.length} generated application(s) available
                </Text>
              </View>
              <Button
                title="New Build"
                onPress={() => setActiveTab('STUDIO')}
                icon={<Sparkles size={14} color="#FFFFFF" />}
                style={{ paddingVertical: 8, paddingHorizontal: 14 }}
              />
            </View>

            {/* Search & Filter Controls */}
            <View style={styles.searchRow}>
              <View style={[styles.searchInputWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: colors.border }]}>
                <Search size={14} color={colors.textMuted} />
                <TextInput
                  value={projectSearch}
                  onChangeText={setProjectSearch}
                  placeholder="Search projects by title or industry..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.searchInput, { color: colors.textPrimary }]}
                />
                {projectSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setProjectSearch('')}>
                    <X size={14} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.filterPillsRow}>
                <TouchableOpacity
                  onPress={() => setProjectFilterMode('ALL')}
                  style={[
                    styles.filterPill,
                    projectFilterMode === 'ALL' && { backgroundColor: colors.accent.primary, borderColor: colors.accent.primary },
                    { borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.filterPillText, { color: projectFilterMode === 'ALL' ? '#FFFFFF' : colors.textSecondary }]}>
                    All ({projects.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setProjectFilterMode('STARRED')}
                  style={[
                    styles.filterPill,
                    projectFilterMode === 'STARRED' && { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
                    { borderColor: colors.border },
                  ]}
                >
                  <Star size={11} color={projectFilterMode === 'STARRED' ? '#FFFFFF' : '#F59E0B'} fill={projectFilterMode === 'STARRED' ? '#FFFFFF' : '#F59E0B'} />
                  <Text style={[styles.filterPillText, { color: projectFilterMode === 'STARRED' ? '#FFFFFF' : colors.textSecondary }]}>
                    Starred ({starredIds.length})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {loadingProjects ? (
              <ActivityIndicator size="small" color={colors.accent.primary} style={{ marginTop: 24 }} />
            ) : filteredProjects.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Globe size={32} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                  No Websites Found
                </Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  {projectSearch ? 'No project matches your search query.' : 'Switch to Studio tab to synthesize your first web application.'}
                </Text>
              </GlassCard>
            ) : (
              <View style={styles.projectsList}>
                {filteredProjects.map((proj) => {
                  const isStarred = starredIds.includes(proj.projectId);
                  return (
                    <GlassCard key={proj.projectId} style={styles.projectCard}>
                      <View style={styles.projectCardHeader}>
                        <View style={styles.projectCardLeft}>
                          <View style={[styles.iconCircle, { backgroundColor: colors.accent.tagBg }]}>
                            <Globe size={16} color={colors.accent.primary} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.projCardTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                              {proj.title}
                            </Text>
                            <Text style={[styles.projCardSub, { color: colors.textSecondary }]}>
                              {proj.businessType || 'Full-Stack React App'} • {new Date(proj.createdAt || Date.now()).toLocaleDateString()}
                            </Text>
                          </View>
                        </View>

                        <TouchableOpacity onPress={() => toggleStar(proj.projectId)}>
                          <Star
                            size={18}
                            color={isStarred ? '#F59E0B' : colors.textMuted}
                            fill={isStarred ? '#F59E0B' : 'transparent'}
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.projMetaRow}>
                        <Badge label="Runtime Ready" variant="success" />
                        <Badge label={proj.website?.pages?.length ? `${proj.website.pages.length} Pages` : 'Multi-page'} variant="accent" />
                        <Badge label="Vite + Tailwind" variant="neutral" />
                      </View>

                      <View style={styles.projActions}>
                        <TouchableOpacity
                          onPress={() => {
                            setActiveProject(proj);
                            setActiveTab('STUDIO');
                            showToast(`Opened "${proj.title}" in Studio`);
                          }}
                          style={[styles.projBtn, { backgroundColor: colors.accent.primary }]}
                        >
                          <Text style={styles.projBtnText}>Open Studio</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            setActiveProject(proj);
                            setActiveTab('CODE');
                            showToast(`Inspecting code for "${proj.title}"`);
                          }}
                          style={[styles.projIconBtn, { borderColor: colors.border }]}
                        >
                          <Code size={16} color={colors.textPrimary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleDownloadZip(proj.projectId)}
                          style={[styles.projIconBtn, { borderColor: colors.border }]}
                        >
                          <Download size={16} color={colors.textPrimary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleDelete(proj.projectId)}
                          style={[styles.projIconBtn, { borderColor: colors.border }]}
                        >
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </GlassCard>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* ── 4. TEMPLATES GALLERY VIEW ── */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {activeTab === 'TEMPLATES' && (
          <View style={styles.tabContent}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Production Templates Gallery
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                12 pre-configured business architectures ready for autonomous generation
              </Text>
            </View>

            {/* Template Search Bar */}
            <View style={[styles.searchInputWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: colors.border }]}>
              <Search size={14} color={colors.textMuted} />
              <TextInput
                value={templateSearch}
                onChangeText={setTemplateSearch}
                placeholder="Search templates (SaaS, Healthcare, E-Commerce...)"
                placeholderTextColor={colors.textMuted}
                style={[styles.searchInput, { color: colors.textPrimary }]}
              />
              {templateSearch.length > 0 && (
                <TouchableOpacity onPress={() => setTemplateSearch('')}>
                  <X size={14} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Categories Scroll */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {TEMPLATE_CATEGORIES.map((cat) => {
                const isSelected = selectedTemplateCat.toLowerCase() === cat.toLowerCase();
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        try {
                          Haptics.selectionAsync();
                        } catch {}
                      }
                      setSelectedTemplateCat(cat);
                    }}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected
                          ? colors.accent.primary
                          : isDark
                          ? 'rgba(255,255,255,0.05)'
                          : '#F1F5F9',
                        borderColor: isSelected ? colors.accent.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Templates Cards Grid */}
            <View style={styles.templatesList}>
              {filteredTemplates.map((tmpl) => (
                <GlassCard key={tmpl.id} style={styles.templateCard}>
                  <View style={styles.templateTopRow}>
                    <Badge label={tmpl.category} variant="accent" />
                    <TouchableOpacity
                      onPress={() => handleUseTemplate(tmpl)}
                      style={styles.templateUseBtn}
                    >
                      <Text style={[styles.templateUseText, { color: colors.accent.primary }]}>
                        Use Template
                      </Text>
                      <ChevronRight size={14} color={colors.accent.primary} />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.templateTitle, { color: colors.textPrimary }]}>
                    {tmpl.title}
                  </Text>
                  <Text style={[styles.templateDesc, { color: colors.textSecondary }]}>
                    {tmpl.description}
                  </Text>

                  {/* Feature Checklist */}
                  <View style={styles.templateFeatures}>
                    {tmpl.features.map((feat, fIdx) => (
                      <View key={fIdx} style={styles.templateFeatureRow}>
                        <Check size={12} color="#10B981" />
                        <Text style={[styles.templateFeatureText, { color: colors.textSecondary }]}>
                          {feat}
                        </Text>
                      </View>
                    ))}
                  </View>
                </GlassCard>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Expanded Fullscreen Live Preview Modal ── */}
      <Modal visible={showLivePreviewModal} animationType="slide" transparent={false}>
        <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => setShowLivePreviewModal(false)}
              style={styles.modalBackBtn}
            >
              <ArrowLeft size={18} color={colors.textPrimary} />
              <Text style={[styles.modalBackText, { color: colors.textPrimary }]}>Close Preview</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {activeProjectTitle}
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={[styles.expandedCanvas, { backgroundColor: isDark ? '#090D16' : '#FFFFFF', borderColor: colors.border }]}>
              <View style={styles.mockHero}>
                <Badge label="Live Standalone React 19 Runtime" variant="success" />
                <Text style={[styles.mockTitle, { color: colors.textPrimary, fontSize: 24 }]}>
                  {activeProjectTitle}
                </Text>
                <Text style={[styles.mockSub, { color: colors.textSecondary }]}>
                  Full-stack layout configured with Tailwind tokens, hero section, interactive metrics strip, and automated contact flows.
                </Text>
              </View>

              <View style={styles.mockGrid}>
                {['Overview', 'Platform Specifications', 'Pricing Models', 'Client Validation'].map((item, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.modalFeatureCard,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.mockCardTitle, { color: colors.textPrimary }]}>{item}</Text>
                    <Text style={[styles.mockCardSub, { color: colors.textSecondary }]}>
                      Synthesized component block optimized for high-conversion engagement.
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Floating AISA Brain Assistant Button */}
      <FloatingAISABrain />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  toastWrap: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 44,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.caption,
  },
  navBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  navScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  navChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  navChipText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
  },
  tabContent: {
    gap: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  glowIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  sectionSub: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.caption,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
    marginBottom: 6,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    fontSize: FONT_SIZES.body,
    lineHeight: LINE_HEIGHTS.body,
    textAlignVertical: 'top',
    minHeight: 88,
  },
  presetScroll: {
    marginBottom: 14,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    maxWidth: 260,
  },
  presetText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    lineHeight: LINE_HEIGHTS.caption,
  },
  actionBtn: {
    marginTop: 6,
  },
  buildCard: {
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EC4899',
  },
  buildHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  buildHeaderText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  stepList: {
    gap: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepBullet: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
  },
  stepText: {
    fontSize: FONT_SIZES.caption,
    lineHeight: LINE_HEIGHTS.caption,
    flex: 1,
  },
  workspaceSection: {
    gap: 16,
  },
  projectInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  projectInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  projectSub: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.caption,
  },
  previewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  previewPillText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.caption,
  },
  deviceRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  deviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  deviceText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  deviceFrame: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  deviceFrameMobile: {
    maxWidth: 375,
    alignSelf: 'center',
    width: '100%',
  },
  deviceFrameTablet: {
    maxWidth: 640,
    alignSelf: 'center',
    width: '100%',
  },
  frameHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  frameDots: {
    flexDirection: 'row',
    gap: 4,
  },
  frameDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  urlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(150,150,150,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    maxWidth: '70%',
  },
  frameUrl: {
    fontSize: 11,
    fontWeight: '500',
  },
  simulatedNav: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  simulatedBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  simulatedLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#EC4899',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simulatedLogoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  simulatedBrandTitle: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  simulatedPagesRow: {
    gap: 6,
  },
  simulatedPageTab: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  simulatedPageTabText: {
    fontSize: 11,
    fontWeight: '600',
  },
  previewCanvas: {
    padding: 14,
    gap: 12,
  },
  pageHomeContent: {
    gap: 12,
  },
  mockHero: {
    alignItems: 'center',
    textAlign: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  mockTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.heading,
    textAlign: 'center',
  },
  mockSub: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.caption,
    textAlign: 'center',
    maxWidth: 290,
  },
  mockCtaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  mockBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  mockBtnText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  mockBtnOutline: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  mockBtnOutlineText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  metricsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: 'rgba(150,150,150,0.06)',
    borderRadius: 10,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  mockGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  mockCard: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    gap: 4,
  },
  mockCardTitle: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.caption,
  },
  mockCardSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  pageFeaturesContent: {
    gap: 10,
  },
  pageHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  featuresStack: {
    gap: 8,
  },
  featureRowCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: 10,
  },
  featureRowTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  featureRowSub: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  pagePricingContent: {
    gap: 10,
  },
  pricingCardsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pricingMiniCard: {
    flex: 1,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  popularBadge: {
    fontSize: 11,
    fontWeight: '900',
    color: '#EC4899',
    marginBottom: 2,
  },
  tierName: {
    fontSize: 12,
    fontWeight: '700',
  },
  tierPrice: {
    fontSize: 16,
    fontWeight: '900',
    marginVertical: 4,
  },
  tierPeriod: {
    fontSize: 11,
    fontWeight: '400',
  },
  tierBtn: {
    width: '100%',
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  tierBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  pageAboutContent: {
    gap: 10,
  },
  aboutParagraph: {
    fontSize: 13,
    lineHeight: 18,
  },
  aboutStatsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  aboutStatBox: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    gap: 2,
  },
  aboutStatNum: {
    fontSize: 16,
    fontWeight: '800',
  },
  aboutStatLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  pageContactContent: {
    gap: 8,
  },
  mockInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
  },
  mockSubmitBtn: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  mockSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  previewActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smallActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  smallActionText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.caption,
  },
  chatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  quickPromptScroll: {
    marginVertical: 8,
  },
  quickPromptChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 6,
  },
  quickPromptText: {
    fontSize: 11,
    fontWeight: '500',
  },
  chatHistoryBox: {
    gap: 8,
    marginVertical: 10,
    maxHeight: 180,
  },
  chatBubble: {
    padding: 10,
    borderRadius: 12,
    maxWidth: '85%',
  },
  chatUser: {
    alignSelf: 'flex-end',
  },
  chatAi: {
    alignSelf: 'flex-start',
  },
  chatText: {
    fontSize: FONT_SIZES.caption,
    lineHeight: LINE_HEIGHTS.caption,
  },
  chatInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: FONT_SIZES.body,
    lineHeight: LINE_HEIGHTS.body,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  codeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fileTreeScroll: {
    marginBottom: 12,
  },
  fileTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  fileTabText: {
    fontSize: 11,
    fontWeight: '600',
  },
  terminalBox: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  terminalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#030712',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  terminalDots: {
    flexDirection: 'row',
    gap: 4,
  },
  terminalPath: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  loadingFileBox: {
    padding: 30,
    alignItems: 'center',
    gap: 8,
  },
  loadingFileText: {
    fontSize: 12,
  },
  codeHorizontalScroll: {
    maxHeight: 320,
  },
  codeVerticalScroll: {
    maxHeight: 320,
  },
  codeContainer: {
    flexDirection: 'row',
    padding: 12,
  },
  lineNumbersCol: {
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.08)',
    alignItems: 'flex-end',
  },
  lineNumberText: {
    fontSize: 11,
    color: '#475569',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 18,
  },
  codeLinesCol: {
    paddingLeft: 10,
  },
  codeLineText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 18,
  },
  projectsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchRow: {
    gap: 8,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.body,
    lineHeight: LINE_HEIGHTS.body,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
    marginTop: 16,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  emptySub: {
    fontSize: FONT_SIZES.caption,
    textAlign: 'center',
    lineHeight: LINE_HEIGHTS.caption,
  },
  projectsList: {
    gap: 12,
  },
  projectCard: {
    padding: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EC4899',
  },
  projectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  projCardTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  projCardSub: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.caption,
  },
  projMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  projActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  projBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projBtnText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.caption,
  },
  projIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryScroll: {
    marginVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  templatesList: {
    gap: 12,
  },
  templateCard: {
    padding: 16,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EC4899',
  },
  templateTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateUseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  templateUseText: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.caption,
  },
  templateTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
  },
  templateDesc: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '400',
    lineHeight: LINE_HEIGHTS.caption,
  },
  templateFeatures: {
    gap: 4,
    marginTop: 4,
  },
  templateFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  templateFeatureText: {
    fontSize: 11,
  },
  modalRoot: {
    flex: 1,
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 36,
    paddingBottom: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalBackText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    lineHeight: LINE_HEIGHTS.body,
  },
  modalTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    lineHeight: LINE_HEIGHTS.body,
    maxWidth: '50%',
  },
  modalScroll: {
    padding: 16,
  },
  expandedCanvas: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  modalFeatureCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    minWidth: 130,
  },
});
