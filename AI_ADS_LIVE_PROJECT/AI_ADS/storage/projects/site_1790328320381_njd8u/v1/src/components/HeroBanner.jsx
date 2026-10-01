import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2, Star, Zap } from 'lucide-react';

export default function HeroBanner({ section, setActivePage }) {
  const headline = section.headline || section.title || 'Welcome';
  const eyebrow = section.eyebrow || '✨ Top Rated & Recommended';
  const trustBadges = Array.isArray(section.trustBadges) && section.trustBadges.length > 0
    ? section.trustBadges
    : [
        { label: 'Verified Quality Guarantee' },
        { label: 'Fast Responsive Access' },
        { label: '5.0 Star Rated Experience' }
      ];

  return (
    <section className="section-block hero-banner-section hero-mesh-bg text-center">
      <div className="hero-content" style={{ maxWidth: '1380px', width: '100%', margin: '0 auto' }}>
        <div className="hero-eyebrow-pill">
          <span className="eyebrow-dot"></span>
          <span>{eyebrow}</span>
        </div>
        <h1 className="hero-headline">{headline}</h1>
        <p className="hero-subheadline">{section.subheadline || section.purpose}</p>
        <div className="hero-ctas" style={{ justifyContent: 'center' }}>
          <button className="btn btn-primary btn-pill" onClick={() => setActivePage(section.primaryTargetPage || 'Products')}>
            <span>{section.primaryCTA || 'Get Started'}</span>
            <ArrowRight size={16} style={{ marginLeft: '0.4rem' }} />
          </button>
          <button className="btn btn-secondary btn-pill" onClick={() => setActivePage(section.secondaryTargetPage || 'Contact')}>
            <span>{section.secondaryCTA || 'Explore More'}</span>
          </button>
        </div>

        <div className="hero-trust-strip" style={{ justifyContent: 'center' }}>
          {trustBadges.map((badge, idx) => (
            <div key={idx} className="trust-badge-item">
              <Zap size={14} style={{ color: 'var(--primary-color)' }} />
              <span>{badge.label || badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
