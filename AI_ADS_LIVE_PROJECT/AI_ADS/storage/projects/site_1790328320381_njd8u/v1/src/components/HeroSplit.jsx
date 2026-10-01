import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2, Star, Zap } from 'lucide-react';

export default function HeroSplit({ section, setActivePage }) {
  const headline = section.headline || section.title || 'Welcome';
  const eyebrow = section.eyebrow || '✨ Curated Excellence & Value';
  const trustBadges = Array.isArray(section.trustBadges) && section.trustBadges.length > 0
    ? section.trustBadges
    : [
        { label: 'Premium Quality Guarantee' },
        { label: 'Instant Priority Support' },
        { label: '5.0 Star Community Rating' }
      ];

  return (
    <section className="section-block hero-split-section hero-mesh-bg">
      <div className="hero-split-grid">
        <div className="hero-text-col">
          <div className="hero-eyebrow-pill">
            <span className="eyebrow-dot"></span>
            <span>{eyebrow}</span>
          </div>
          <h1 className="hero-headline">{headline}</h1>
          <p className="hero-subheadline">{section.subheadline || section.purpose}</p>
          <div className="hero-ctas">
            <button className="btn btn-primary btn-pill" onClick={() => setActivePage(section.primaryTargetPage || 'Products')}>
              <span>{section.primaryCTA || 'Get Started'}</span>
              <ArrowRight size={16} style={{ marginLeft: '0.4rem' }} />
            </button>
            <button className="btn btn-secondary btn-pill" onClick={() => setActivePage(section.secondaryTargetPage || 'Contact')}>
              <span>{section.secondaryCTA || 'Explore More'}</span>
            </button>
          </div>

          <div className="hero-trust-strip">
            {trustBadges.map((badge, idx) => (
              <div key={idx} className="trust-badge-item">
                <Zap size={14} style={{ color: 'var(--primary-color)' }} />
                <span>{badge.label || badge}</span>
              </div>
            ))}
          </div>
        </div>
        {section.imageUrl && (
          <div className="hero-img-col">
            <img src={section.imageUrl} alt={section.title} className="hero-image" />
          </div>
        )}
      </div>
    </section>
  );
}
