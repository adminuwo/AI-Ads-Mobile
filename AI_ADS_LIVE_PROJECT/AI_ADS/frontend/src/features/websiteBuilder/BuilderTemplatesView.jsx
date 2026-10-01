import React, { useState } from 'react';
import {
  LayoutTemplate,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  ExternalLink,
  Layers
} from 'lucide-react';

export const BuilderTemplatesView = ({ onSelectTemplate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
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
    'Marketplace'
  ];

  const templatesList = [
    {
      id: 'tmpl_saas_crm',
      title: 'Enterprise AI CRM & Sales Hub',
      category: 'SaaS',
      description: 'High-converting SaaS landing page with lead scoring calculator, interactive pipeline kanban, customer reviews, and multi-tier pricing plans.',
      features: ['Tiered Pricing Matrix', 'Interactive ROI Calculator', 'Lead Capture Modals'],
      prompt: 'Build an enterprise SaaS platform called VelocityAI with real-time pipeline kanban, 3-tier pricing table, customer testimonials, and demo booking form.'
    },
    {
      id: 'tmpl_ecom_boutique',
      title: 'Luxury Fashion & Apparel Store',
      category: 'Ecommerce',
      description: 'Modern direct-to-consumer apparel storefront with size and color swatches, filterable product grid, slide-over cart drawer, and checkout preview.',
      features: ['Filterable Product Grid', 'Working Cart Drawer', 'WhatsApp Order Flow'],
      prompt: 'Create a luxury fashion boutique called Atelier Vesper with lookbook carousel, product filter drawer, size selector, and working cart.'
    },
    {
      id: 'tmpl_health_clinic',
      title: 'Integrated Medical & Wellness Clinic',
      category: 'Healthcare',
      description: 'Professional healthcare clinic website with doctor specialty profiles, online appointment slot picker, patient resources, and emergency hotline bar.',
      features: ['Doctor Profiles', 'Interactive Slot Reservation', 'Patient FAQ Accordion'],
      prompt: 'Build a modern medical clinic website called Apex Health with doctor specialty cards, appointment slot booking modal, and patient review cards.'
    },
    {
      id: 'tmpl_edu_academy',
      title: 'Next-Gen Coding & AI Academy',
      category: 'Education',
      description: 'EdTech course platform featuring interactive curriculum syllabus, instructor showcases, student enrollment form, and tuition pricing.',
      features: ['Curriculum Tree', 'Instructor Highlights', 'Student Enrollment Modal'],
      prompt: 'Create an online tech academy called CodeCraft Institute with interactive course catalog, syllabus breakdown, and enrollment form.'
    },
    {
      id: 'tmpl_rest_bistro',
      title: 'Artisanal Culinary Bistro & Wine Bar',
      category: 'Restaurant',
      description: 'Warm, appetizing culinary restaurant website with dietary filterable menu, online table reservation widget, chef story, and location map.',
      features: ['Menu Filtering', 'Table Reservation Form', 'Chef Gallery Showcase'],
      prompt: 'Build an artisanal bistro website called Bella Luna with categorized dinner menu, table reservation slot picker, and chef showcase.'
    },
    {
      id: 'tmpl_real_estate',
      title: 'Luxury Real Estate & Villa Portfolio',
      category: 'Real Estate',
      description: 'High-end property showcase with price and bedroom filter sliders, virtual tour preview badges, mortgage calculator, and agent inquiry cards.',
      features: ['Property Filter Bar', 'Virtual Tour Badge', 'Agent Direct Inquiry'],
      prompt: 'Create a luxury real estate portal called Haven Properties with filterable villa listings, property detail modals, and agent inquiry form.'
    },
    {
      id: 'tmpl_finance_fintech',
      title: 'Fintech Wealth & Crypto Asset Tracker',
      category: 'Finance',
      description: 'Sleek dark-mode financial intelligence platform with live simulated market tickers, portfolio allocation pie charts, and security compliance badges.',
      features: ['Simulated Asset Tickers', 'Security Badges', 'Tier Comparison'],
      prompt: 'Build a fintech wealth management platform called Meridian Wealth with simulated asset allocation charts, security audits, and account signup.'
    },
    {
      id: 'tmpl_agency_growth',
      title: 'Creative Brand & Performance Studio',
      category: 'Agency',
      description: 'Bold agency portfolio with client case studies, video reel modal, team roster, service packages, and interactive project discovery brief.',
      features: ['Case Study Grids', 'Interactive Project Brief', 'Client Testimonials'],
      prompt: 'Create a modern digital agency site called Kinetic Studio with interactive case studies, service cards, and project kickoff form.'
    },
    {
      id: 'tmpl_portfolio_designer',
      title: 'Senior Product Designer Portfolio',
      category: 'Portfolio',
      description: 'Clean, typography-driven personal portfolio for designers and developers with deep-dive project case studies, skill badges, and contact drawer.',
      features: ['Deep Case Studies', 'Interactive Work Showcase', 'Contact Drawer'],
      prompt: 'Build a minimalist product designer portfolio for Alex Morgan with project walkthrough cards, skill tags, and direct message drawer.'
    },
    {
      id: 'tmpl_booking_spa',
      title: 'Holistic Spa & Salon Reservation Hub',
      category: 'Booking',
      description: 'Serene wellness spa website with service menu, therapist selection, calendar date/time picker, and instant booking confirmation receipt.',
      features: ['Service Menu', 'Therapist Selection', 'Confirmation Receipt'],
      prompt: 'Create a luxury spa booking website called Serenity Springs with therapist profiles, calendar slot reservation, and package add-ons.'
    },
    {
      id: 'tmpl_dashboard_ops',
      title: 'Enterprise Cloud Ops & Metrics Console',
      category: 'Dashboard',
      description: 'Data-dense operational analytics dashboard with server uptime gauges, real-time alert feed, filterable incident log table, and dark mode.',
      features: ['KPI Gauges', 'Filterable Log Table', 'Date Range Toggles'],
      prompt: 'Build an enterprise cloud operations dashboard with live KPI counters, server health table, alert status badges, and metric filters.'
    },
    {
      id: 'tmpl_marketplace_goods',
      title: 'Artisan & Creator Goods Marketplace',
      category: 'Marketplace',
      description: 'Multi-vendor handcrafted marketplace with creator store profiles, category filters, customer ratings, and shopping cart simulation.',
      features: ['Creator Profiles', 'Multi-Category Browse', 'Verified Reviews'],
      prompt: 'Create an artisan marketplace called CraftCollective with creator spotlights, product cards, rating badges, and cart drawer.'
    }
  ];

  const filteredTemplates = templatesList.filter((tmpl) => {
    const matchesCategory =
      selectedCategory === 'All' || tmpl.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      tmpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 md:px-8 space-y-8 animate-in fade-in">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-extrabold text-xs mb-1">
            <LayoutTemplate className="w-4 h-4" />
            <span>Curated Architectures</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Application Templates
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Choose a battle-tested industry template to launch your web application in seconds.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 font-medium shadow-sm"
          />
        </div>
      </div>

      {/* ── CATEGORY FILTER CHIPS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── TEMPLATES GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 hover:border-brand-500/50 transition-all flex flex-col justify-between space-y-5 group shadow-sm hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30">
                  {tmpl.category}
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                {tmpl.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {tmpl.description}
              </p>

              {/* Feature Tags */}
              <div className="space-y-1.5 pt-2">
                {tmpl.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => onSelectTemplate(tmpl)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-gradient-to-r hover:from-brand-600 hover:to-brand-400 text-slate-700 dark:text-slate-200 hover:text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Use Template</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
