import React from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Image as ImageIcon, 
  FileText, 
  Globe, 
  Search, 
  Calendar, 
  CheckSquare, 
  Bot, 
  TrendingUp, 
  Users, 
  CreditCard 
} from 'lucide-react';
import { useWorkspace } from '../../../context/WorkspaceContext';

export const Features = () => {
  const { setActiveModule } = useWorkspace();

  const featureCards = [
    {
      id: 'brandDna',
      targetModule: 'brands',
      title: 'Brand DNA Memory & Scraper',
      desc: 'Auto-scrapes your website to ingest logos, hex color palettes, positioning and verified claims into persistent AI memory.',
      icon: ShieldCheck,
      badge: 'AUTOMATED DNA SCRAPER'
    },
    {
      id: 'strategy',
      targetModule: 'strategy',
      title: '30-Day Strategy Roadmap',
      desc: '30 non-repeating daily social post directives for Instagram, LinkedIn, X and Facebook, with reference photo photoshoot directive analysis.',
      icon: Layers,
      badge: 'CAMPAIGN ROADMAP'
    },
    {
      id: 'creative',
      targetModule: 'creative',
      title: 'Creative Studio (8K)',
      desc: 'A 2-agent vision pipeline renders photorealistic 8K ad visuals with automatic brand logo watermarking and secure signed-URL exports.',
      icon: ImageIcon,
      badge: 'PHOTOREALISTIC RENDERING'
    },
    {
      id: 'contentStudio',
      targetModule: 'studio',
      title: 'Content Studio & Carousel Builder',
      desc: 'Instagram carousels, LinkedIn slide decks, X threads, Facebook ad copy and long-form blog posts, with 1-click repurposing.',
      icon: FileText,
      badge: 'MULTI-CHANNEL COPYWRITER'
    },
    {
      id: 'websiteBuilder',
      targetModule: 'websiteBuilder',
      title: 'AI Website & Landing Page Builder',
      desc: 'Prompt-driven responsive pages with a live visual editor, responsive previews and downloadable HTML/CSS ZIP packages.',
      icon: Globe,
      badge: 'SITE GENERATOR'
    },
    {
      id: 'seo',
      targetModule: 'seo',
      title: 'SEO Intelligence & JSON-LD Briefs',
      desc: 'Search-intent keyword analysis, competitive SERP audits and Schema.org JSON-LD markup generation.',
      icon: Search,
      badge: 'SERP & SCHEMA AUDIT'
    },
    {
      id: 'calendar',
      targetModule: 'calendar',
      title: 'Omnichannel Publishing Calendar',
      desc: 'Drag-and-drop scheduling at peak engagement hours with live feed previews.',
      icon: Calendar,
      badge: 'DRAG-AND-DROP PUBLISHER'
    },
    {
      id: 'approvals',
      targetModule: 'approvals',
      title: 'Approvals Desk & Governance',
      desc: 'A human-in-the-loop review queue for agencies and clients, with brand claim verification checks.',
      icon: CheckSquare,
      badge: 'HUMAN-IN-THE-LOOP'
    },
    {
      id: 'aisaAssistant',
      targetModule: 'dashboard',
      title: 'AISA™ AI Copilot',
      desc: 'A floating 24/7 AI assistant for strategy advice, prompt refining and direct module triggers.',
      icon: Bot,
      badge: 'INTELLIGENCE COPILOT'
    },
    {
      id: 'analytics',
      targetModule: 'analytics',
      title: 'Analytics & Velocity Hub',
      desc: 'Track content velocity, credit usage and agency production ROI.',
      icon: TrendingUp,
      badge: 'VELOCITY & ROI KPI'
    },
    {
      id: 'team',
      targetModule: 'team',
      title: 'Team RBAC Management',
      desc: '4 roles (Super Admin, Agency Admin, Creator, Client) with cryptographically isolated multi-tenant client workspaces.',
      icon: Users,
      badge: 'MULTI-TENANT ISOLATION'
    },
    {
      id: 'billing',
      targetModule: 'settings',
      title: 'Transparent INR Billing',
      desc: 'Clear subscription plans with automatic credit rollover and custom API integration keys.',
      icon: CreditCard,
      badge: 'TRANSPARENT INR (₹)'
    }
  ];

  return (
    <section id="features" className="py-20 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800/60 scroll-mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 shadow-sm">
            <span>UNIFIED ENGINE CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-['Outfit'] tracking-tight text-slate-900 dark:text-white leading-tight">
            12 Integrated Modules. One Governed Platform.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Everything your team needs to scrape brand guidelines, plan 30-day strategies, render 8K ad visual assets, and publish content.
          </p>
        </div>

        {/* 12 Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat) => {
            const IconComp = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => setActiveModule(feat.targetModule)}
                className="rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-6 flex flex-col justify-between space-y-4 hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:bg-slate-50/80 dark:hover:bg-slate-900/90 transition-all duration-300 cursor-pointer group shadow-md"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 font-mono">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
