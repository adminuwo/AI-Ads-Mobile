import React from 'react';

export default function CallToActionBanner({ section, setActivePage }) {
  return (
    <section className="section-block cta-banner-section text-center" style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--card-border)', padding: '3rem 1.5rem' }}>
      <h2 className="section-title">{section.headline || section.title}</h2>
      <p className="section-purpose" style={{ marginBottom: '1.5rem' }}>{section.subheadline || section.purpose}</p>
      <button className="btn btn-primary" onClick={() => setActivePage('Contact')}>
        {section.actionLabel || 'Get Started'}
      </button>
    </section>
  );
}
