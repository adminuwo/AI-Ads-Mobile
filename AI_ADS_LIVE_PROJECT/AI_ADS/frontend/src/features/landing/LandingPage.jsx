import React, { useEffect } from 'react';
import './LandingPage.css';

// Reusable Section Components (Modular Architecture)
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustStrip } from './components/TrustStrip';
import { ProblemSolution } from './components/ProblemSolution';
import { HowItWorks } from './components/HowItWorks';
import { Features } from './components/Features';
import { PipelineSpotlight } from './components/PipelineSpotlight';
import { Governance } from './components/Governance';
import { StatsBar } from './components/StatsBar';
import { Pricing } from './components/Pricing';
import { Testimonials } from './components/Testimonials';
import { FAQ } from './components/FAQ';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';

export const LandingPage = () => {
  useEffect(() => {
    // Smooth scroll to hash anchor on mount if present
    if (typeof window !== 'undefined' && window.location.hash) {
      const targetId = window.location.hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  return (
    <div className="landing-root min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white relative transition-colors duration-300">
      {/* 1. Sticky Navbar */}
      <Navbar />

      {/* Main Page Flow (13 Sections in exact order) */}
      <main className="relative z-10">
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. Trust Strip */}
        <TrustStrip />

        {/* 4. Problem -> Solution */}
        <ProblemSolution />

        {/* 5. How It Works (4 Steps) */}
        <HowItWorks />

        {/* 6. Features Grid (12 Cards) */}
        <Features />

        {/* 7. Spotlight: 2-Agent Vision Pipeline */}
        <PipelineSpotlight />

        {/* 8. Governance Section */}
        <Governance />

        {/* 9. Stats Bar (Product Facts Only) */}
        <StatsBar />

        {/* 10. Pricing & Plans */}
        <Pricing />

        {/* 11. Testimonials (Labeled Placeholders) */}
        <Testimonials />

        {/* 12. FAQ (Keyboard-friendly Accordion) */}
        <FAQ />

        {/* 13. Final CTA Banner */}
        <FinalCTA />
      </main>

      {/* 14. Footer */}
      <Footer />
    </div>
  );
};
